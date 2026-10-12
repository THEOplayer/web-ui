import { html, type HTMLTemplateResult, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, type Ref, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { Range } from './Range';
import timeRangeCss from './TimeRange.css';
import { stateReceiver } from './StateReceiverMixin';
import type { Ads, ChromelessPlayer, TimeRanges } from 'theoplayer/chromeless';
import type { TextTrack, TextTrackCue } from 'theoplayer/chromeless';
import { formatAsTimePhrase } from '../util/TimeUtils';
import { createCustomEvent } from '../util/EventUtils';
import type { PreviewTimeChangeEvent } from '../events/PreviewTimeChangeEvent';
import { PREVIEW_TIME_CHANGE_EVENT } from '../events/PreviewTimeChangeEvent';
import type { PreviewActiveChangeEvent } from '../events/PreviewActiveChangeEvent';
import { PREVIEW_ACTIVE_CHANGE_EVENT } from '../events/PreviewActiveChangeEvent';
import { Attribute } from '../util/Attribute';
import type { StreamType } from '../util/StreamType';
import { isLinearAd } from '../util/AdUtils';
import type { ColorStops } from '../util/ColorStops';
import { KeyCode } from '../util/KeyCode';
import { getLocale } from '../i18n';
import { ChapterTrackObserver, findChapterAt } from '../util/ChapterUtils';

// Load components used in template
import './PreviewThumbnail';
import './PreviewTimeDisplay';

const UPDATE_EVENTS = ['timeupdate', 'durationchange', 'ratechange', 'seeking', 'seeked'] as const;
const AUTO_ADVANCE_EVENTS = ['play', 'pause', 'ended', 'durationchange', 'readystatechange', 'error'] as const;
const AD_EVENTS = ['adbreakbegin', 'adbreakend', 'adbreakchange', 'updateadbreak', 'adbegin', 'adend', 'adskip', 'addad', 'updatead'] as const;

/**
 * Width of an ad marker on the progress bar, in percent of the total bar width.
 */
const AD_MARKER_WIDTH = 1;

interface ChapterCueSnapshot {
    cue: TextTrackCue;
    startTime: number;
    endTime: number;
    content: unknown;
    atStart: boolean;
    atEnd: boolean;
}

interface ChapterMarkerSegment {
    left: number;
    width: number;
    parts: string;
    atStart: boolean;
    atEnd: boolean;
}

/**
 * A seek bar, showing the current time of the player,
 * and which seeks the player when clicked or dragged.
 *
 * @slot `preview` - A slot holding a preview of the seek time, shown while hovering the seek bar.
 *   By default, this shows the {@link PreviewTimeDisplay | preview time} and
 *   the {@link PreviewThumbnail | preview thumbnail}.
 *
 * @cssproperty `--theoplayer-preview-text-shadow` - The text shadow applied to the preview box shown while hovering the seek bar.
 *   Defaults to `0 0 4px rgba(0, 0, 0, 0.75)`.
 * @cssproperty `--theoplayer-time-range-chapter-marker-color` - The color of chapter marker boundaries.
 *   Defaults to `rgba(0, 0, 0, 0.75)`.
 * @cssproperty `--theoplayer-time-range-chapter-marker-width` - The width of chapter marker boundaries. Defaults to `1px`.
 * @cssproperty `--theoplayer-time-range-chapter-highlight-color` - The color of the hovered chapter highlight. Defaults to `#fff`.
 *
 * The shadow DOM exposes a `chapters` part for the chapter marker overlay and a `chapter` part for each cue segment.
 * Chapter segments also expose the `active`, `hover`, and `discontinuous` part tokens.
 */
@customElement('theoplayer-time-range')
@stateReceiver(['player', 'streamType', 'deviceType', 'lang'])
export class TimeRange extends Range {
    static override styles = [...Range.styles, timeRangeCss];

    private readonly _previewBoxEl: Ref<HTMLElement> = createRef<HTMLElement>();

    private _player: ChromelessPlayer | undefined;
    private _streamType: StreamType = 'vod';
    private _showAdMarkers: boolean = false;
    private _showChapterMarkers: boolean = false;
    private _ads: Ads | undefined;
    private _pausedWhileScrubbing: boolean = false;
    private _chapterTrackObserver: ChapterTrackObserver | undefined;
    private _rangeResizeObserver: ResizeObserver | undefined;
    private _resizeFallbackAttached: boolean = false;
    private _measuredRangeWidth: number = 0;
    private _previewTime: number = NaN;
    private _previewActive: boolean = false;
    private _isPointerOver: boolean = false;
    private _activePointerId: number | undefined;
    private _lastChapterTrack: TextTrack | undefined;
    private _lastChapterCues: ChapterCueSnapshot[] = [];
    private _lastChapterMin: number = NaN;
    private _lastChapterMax: number = NaN;
    private _lastChapterRangeWidth: number = NaN;
    private _lastChapterActiveCue: TextTrackCue | undefined;
    private _lastChapterHoveredCue: TextTrackCue | undefined;

    @state()
    private accessor _chapterSegments: ChapterMarkerSegment[] = [];

    private _autoAdvanceId: number = 0;
    private _lastUpdateTime: number = 0;
    private _lastCurrentTime: number = 0;
    private _lastPlaybackRate: number = 0;

    constructor() {
        super();
    }

    override connectedCallback(): void {
        super.connectedCallback();

        this.addEventListener('pointerenter', this._onPointerEnter);
        this.addEventListener('pointerleave', this._onPointerLeave);
        this.addEventListener('pointerdown', this._onTimeRangePointerDown);
        this._connectChapterTrackObserver_();
        this._attachRangeListeners_();
        this._observeRangeWidth_();

        if (!this.hasAttribute('min')) {
            this.min = 0;
        }
        if (!this.hasAttribute('max')) {
            this.max = 1000;
        }
        if (!this.hasAttribute(Attribute.ARIA_LIVE)) {
            this.ariaLive = 'off';
        }

        this._toggleAutoAdvance();
    }

    protected override firstUpdated(_changedProperties: PropertyValues) {
        this._attachRangeListeners_();
        this._observeRangeWidth_();
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();

        this.removeEventListener('pointerenter', this._onPointerEnter);
        this.removeEventListener('pointerleave', this._onPointerLeave);
        this.removeEventListener('pointerdown', this._onTimeRangePointerDown);
        this._detachRangeListeners_();
        this._rangeResizeObserver?.disconnect();
        if (this._resizeFallbackAttached) {
            window.removeEventListener('resize', this._updateRangeWidth_);
            this._resizeFallbackAttached = false;
        }
        document.removeEventListener('pointerup', this._onPointerEnd);
        document.removeEventListener('pointercancel', this._onPointerEnd);
        this._activePointerId = undefined;
        this._isPointerOver = false;
        this._setPreviewActive_(false);
        this._chapterTrackObserver?.destroy();
        this._chapterTrackObserver = undefined;

        this._toggleAutoAdvance();
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener(UPDATE_EVENTS, this._updateFromPlayer);
            this._player.removeEventListener(AUTO_ADVANCE_EVENTS, this._toggleAutoAdvance);
        }
        this._ads?.removeEventListener(AD_EVENTS, this._onAdChange);
        this._player = player;
        this._ads = player?.ads;
        this._chapterTrackObserver?.setPlayer(player);
        this._updateFromPlayer();
        this._toggleAutoAdvance();
        if (this._player !== undefined) {
            this._player.addEventListener(UPDATE_EVENTS, this._updateFromPlayer);
            this._player.addEventListener(AUTO_ADVANCE_EVENTS, this._toggleAutoAdvance);
        }
        this._ads?.addEventListener(AD_EVENTS, this._onAdChange);
    }

    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    accessor lang: string = '';

    /**
     * The stream type, either "vod", "live" or "dvr".
     */
    get streamType(): StreamType {
        return this._streamType;
    }

    @property({ reflect: true, type: String, attribute: Attribute.STREAM_TYPE })
    set streamType(streamType: StreamType) {
        this._streamType = streamType;
        this.updateDisabled_();
    }

    /**
     * Whether to show markers for advertisements on the seek bar.
     */
    get showAdMarkers(): boolean {
        return this._showAdMarkers;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.SHOW_AD_MARKERS })
    set showAdMarkers(showAdMarkers: boolean) {
        this._showAdMarkers = showAdMarkers;
        this._updateRange();
    }

    /**
     * Whether to show chapter markers on the seek bar.
     */
    get showChapterMarkers(): boolean {
        return this._showChapterMarkers;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.SHOW_CHAPTER_MARKERS })
    set showChapterMarkers(showChapterMarkers: boolean) {
        this._showChapterMarkers = showChapterMarkers;
        this._updateRange();
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties);
        if (changedProperties.has('min') || changedProperties.has('max')) {
            this._refreshChapterSegments_();
        }
    }

    private readonly _updateFromPlayer = () => {
        if (this._player === undefined) {
            return;
        }
        this._lastUpdateTime = performance.now();
        this._lastCurrentTime = this._player.currentTime;
        this._lastPlaybackRate = this._player.playbackRate;
        const seekable = this._player.seekable;
        let min: number;
        let max: number;
        let value: number = this._lastCurrentTime;
        if (seekable.length !== 0) {
            min = seekable.start(0);
            max = seekable.end(0);
        } else {
            min = 0;
            max = this._player.duration;
        }
        if (!isFinite(this._lastCurrentTime)) {
            const isLive = this._player.duration === Infinity;
            value = isLive ? max : min;
        }
        this.min = min;
        this.max = max;
        this.rawValue = value;
        this.updateDisabled_(seekable);
        this._updateRange();
    };

    private updateDisabled_(seekable: TimeRanges | undefined = this._player?.seekable) {
        let disabled = this.streamType === 'live';
        if (seekable !== undefined) {
            disabled ||= seekable.length === 0;
        }
        this.disabled = disabled;
    }

    protected override getAriaLabel(): string {
        return getLocale(this.lang).seekAria;
    }

    protected override getAriaValueText(): string {
        const locale = getLocale(this.lang);
        const currentTimePhrase = formatAsTimePhrase(locale, this.value);
        const totalTimePhrase = formatAsTimePhrase(locale, this.max);
        let valueText: string;
        if (currentTimePhrase && totalTimePhrase) {
            valueText = locale.timeOfTotalAria(currentTimePhrase, totalTimePhrase);
        } else {
            valueText = locale.unknownTimeAria;
        }
        const track = this._chapterTrackObserver?.track;
        const chapterTitle = track && findChapterAt(track, this.value)?.content;
        return typeof chapterTitle === 'string' && chapterTitle.length > 0
            ? locale.timeRangeChapterAriaValueText(valueText, chapterTitle)
            : valueText;
    }

    protected override handleInput(): void {
        if (this._player !== undefined && this._player.currentTime !== this.value) {
            this._player.currentTime = this.value;
        }
        super.handleInput();
    }

    private readonly _pauseOnScrubStart = () => {
        if (this._pausedWhileScrubbing) {
            // Already scrubbing.
            return;
        }
        if (this.disabled || this.inert) {
            return;
        }
        if (this._player === undefined || this._player.paused) {
            // Player is already paused.
            return;
        }
        this._pausedWhileScrubbing = true;
        this._player.pause();
        document.addEventListener('mouseup', this._playOnScrubEnd);
        document.addEventListener('pointerup', this._playOnScrubEnd);
        document.addEventListener('pointercancel', this._playOnScrubEnd);
    };

    private readonly _playOnScrubEnd = () => {
        if (!this._pausedWhileScrubbing) {
            return;
        }
        this._pausedWhileScrubbing = false;
        document.removeEventListener('mouseup', this._playOnScrubEnd);
        document.removeEventListener('pointerup', this._playOnScrubEnd);
        document.removeEventListener('pointercancel', this._playOnScrubEnd);
        if (this._player !== undefined && this._player.paused) {
            this._player.play();
        }
    };

    private shouldAutoAdvance_(): boolean {
        return (
            this.isConnected &&
            this._player !== undefined &&
            !this._player.paused &&
            !this._player.ended &&
            !this._player.errorObject &&
            this._player.readyState >= 3 &&
            isFinite(this._lastCurrentTime) &&
            this.needToUpdateEveryFrame_()
        );
    }

    private needToUpdateEveryFrame_(): boolean {
        // The player fires at least one timeupdate event every 250ms.
        // If it takes more than 250ms to advance the playhead by 1 pixel,
        // then we definitely don't need to update every frame.
        const minimumStep = this.getMinimumStepForVisibleChange_();
        const timeUpdateStep = 0.25 * this._lastPlaybackRate;
        return minimumStep < timeUpdateStep;
    }

    private readonly _toggleAutoAdvance = () => {
        if (this.shouldAutoAdvance_()) {
            if (this._autoAdvanceId === 0) {
                this._updateFromPlayer();
                this._autoAdvanceId = requestAnimationFrame(this._autoAdvanceWhilePlaying);
            }
        } else {
            if (this._autoAdvanceId !== 0) {
                this._updateFromPlayer();
                cancelAnimationFrame(this._autoAdvanceId);
                this._autoAdvanceId = 0;
            }
        }
    };

    private readonly _autoAdvanceWhilePlaying = () => {
        if (!this.shouldAutoAdvance_()) {
            this._autoAdvanceId = 0;
            return;
        }

        const delta = (performance.now() - this._lastUpdateTime) / 1000;
        const newValue = this._lastCurrentTime + delta * this._lastPlaybackRate;
        if (Math.abs(newValue - this.value) >= this.getMinimumStepForVisibleChange_()) {
            this.rawValue = newValue;

            // Use cached width to avoid synchronous layout
            this._updateRange(/* useCachedWidth = */ true);
        }

        this._autoAdvanceId = requestAnimationFrame(this._autoAdvanceWhilePlaying);
    };

    @state()
    private accessor _previewRailTransform: string = '';

    protected override updatePointer_(mousePercent: number, rangeRect: DOMRectReadOnly): void {
        super.updatePointer_(mousePercent, rangeRect);

        // Update preview rail, keeping the preview box within bounds
        let previewPos = rangeRect.left + this.getThumbPosition_(mousePercent, rangeRect.width);
        const previewBoxEl = this._previewBoxEl.value;
        if (previewBoxEl) {
            const previewBoxRect = previewBoxEl.getBoundingClientRect();
            const minPreviewPos = rangeRect.left + previewBoxRect.width / 2;
            const maxPreviewPos = rangeRect.right - previewBoxRect.width / 2;
            previewPos = Math.max(minPreviewPos, Math.min(maxPreviewPos, previewPos));
            const previewPosFraction = (previewPos - rangeRect.left) / rangeRect.width;
            this._previewRailTransform = `translateX(${(previewPosFraction * 100 * 100).toFixed(6)}%)`;
        }

        const { min, max } = this;
        this._previewTime = min + mousePercent * (max - min);
        const hoveredCue = this._getHoveredChapter_();
        if (hoveredCue !== this._lastChapterHoveredCue) {
            this._refreshChapterSegments_();
        }

        // Propagate preview time to parent
        if (this._player === undefined) {
            return;
        }
        const previewTimeChangeEvent: PreviewTimeChangeEvent = createCustomEvent(PREVIEW_TIME_CHANGE_EVENT, {
            bubbles: true,
            composed: true,
            detail: { previewTime: this._previewTime }
        });
        this.dispatchEvent(previewTimeChangeEvent);
    }

    protected override getBarColors(): ColorStops {
        const colorStops = super.getBarColors();
        if (!this.showAdMarkers || !this._player || !this._player.ads) {
            return colorStops;
        }
        if (this._player.ads.playing) {
            // Currently playing a linear ad
            return colorStops;
        }
        const { min, max } = this;
        for (const adBreak of this._player.ads.scheduledAdBreaks) {
            if (adBreak.ads !== undefined && adBreak.ads.length > 0 && !adBreak.ads.some(isLinearAd)) {
                // Ad break definitely does not contain any linear ads
                continue;
            }
            let adBreakTime = adBreak.timeOffset;
            if (adBreakTime < 0) {
                // Post-rolls have timeOffset == -1
                adBreakTime = this._player.duration;
            }
            if (min <= adBreakTime && adBreakTime <= max) {
                const adBreakPercent = ((adBreakTime - min) / (max - min)) * 100;
                let adBreakFrom: number;
                let adBreakTo: number;
                if (adBreakPercent + AD_MARKER_WIDTH < 100) {
                    adBreakFrom = adBreakPercent;
                    adBreakTo = adBreakPercent + AD_MARKER_WIDTH;
                } else {
                    adBreakFrom = 100 - AD_MARKER_WIDTH;
                    adBreakTo = 100;
                }
                colorStops.add('var(--theoplayer-time-range-ad-marker-color, #ffc50f)', adBreakFrom, adBreakTo);
            }
        }
        return colorStops;
    }

    private readonly _onAdChange = () => {
        this._updateRange();
        this.requestUpdate();
    };

    private readonly _onPointerEnter = (event: PointerEvent): void => {
        this._isPointerOver = event.pointerType !== 'touch';
        this._setPreviewActive_(this._isPointerOver || this._activePointerId !== undefined);
    };

    private readonly _onPointerLeave = (event: PointerEvent): void => {
        if (event.pointerType !== 'touch') {
            this._isPointerOver = false;
            this._setPreviewActive_(this._activePointerId !== undefined);
        }
    };

    private readonly _onTimeRangePointerDown = (event: PointerEvent): void => {
        this._activePointerId = event.pointerId;
        document.addEventListener('pointerup', this._onPointerEnd);
        document.addEventListener('pointercancel', this._onPointerEnd);
        this._setPreviewActive_(true);
    };

    private readonly _onPointerEnd = (event: PointerEvent): void => {
        if (this._activePointerId !== undefined && event.pointerId !== this._activePointerId) {
            return;
        }
        this._activePointerId = undefined;
        document.removeEventListener('pointerup', this._onPointerEnd);
        document.removeEventListener('pointercancel', this._onPointerEnd);
        this._setPreviewActive_(this._isPointerOver);
    };

    private _setPreviewActive_(previewActive: boolean): void {
        if (this._previewActive === previewActive) {
            return;
        }
        this._previewActive = previewActive;
        this._refreshChapterSegments_();
        const event: PreviewActiveChangeEvent = createCustomEvent(PREVIEW_ACTIVE_CHANGE_EVENT, {
            bubbles: true,
            composed: true,
            detail: { previewActive }
        });
        this.dispatchEvent(event);
    }

    private _getHoveredChapter_(): TextTrackCue | undefined {
        const track = this._chapterTrackObserver?.track;
        return this._previewActive && isFinite(this._previewTime) && track ? findChapterAt(track, this._previewTime) : undefined;
    }

    private _connectChapterTrackObserver_(): void {
        if (this._chapterTrackObserver === undefined) {
            this._chapterTrackObserver = new ChapterTrackObserver(this._refreshChapterSegments_);
        }
        this._chapterTrackObserver.setPlayer(this._player);
    }

    private _attachRangeListeners_(): void {
        this._rangeRef.value?.addEventListener('mousedown', this._pauseOnScrubStart);
        this._rangeRef.value?.addEventListener('pointerdown', this._pauseOnScrubStart);
    }

    private _detachRangeListeners_(): void {
        this._rangeRef.value?.removeEventListener('mousedown', this._pauseOnScrubStart);
        this._rangeRef.value?.removeEventListener('pointerdown', this._pauseOnScrubStart);
    }

    private _observeRangeWidth_(): void {
        const range = this._rangeRef.value;
        if (range === undefined) {
            return;
        }
        this._updateRangeWidth_();
        if (typeof ResizeObserver !== 'undefined') {
            this._rangeResizeObserver ??= new ResizeObserver(this._updateRangeWidth_);
            this._rangeResizeObserver.observe(range);
        } else if (!this._resizeFallbackAttached) {
            window.addEventListener('resize', this._updateRangeWidth_);
            this._resizeFallbackAttached = true;
        }
    }

    private readonly _updateRangeWidth_ = (): void => {
        const rangeWidth = this._rangeRef.value?.getBoundingClientRect().width ?? 0;
        if (this._measuredRangeWidth !== rangeWidth) {
            this._measuredRangeWidth = rangeWidth;
            this._refreshChapterSegments_();
        }
    };

    private readonly _refreshChapterSegments_ = (): void => {
        const track = this._chapterTrackObserver?.track;
        const min = this.min;
        const max = this.max;
        const cues: ChapterCueSnapshot[] = Array.from(track?.cues ?? [], (cue) => {
            const startTime = cue.startTime;
            const endTime = cue.endTime;
            const overlapsRange = endTime >= min && startTime <= max;
            return {
                cue,
                startTime,
                endTime,
                content: cue.content,
                atStart: overlapsRange && Math.max(min, startTime) === min,
                atEnd: overlapsRange && Math.min(max, endTime) === max
            };
        });
        const activeCue = track?.activeCues?.[0];
        const hoveredCue = this._getHoveredChapter_();
        const cuesChanged =
            cues.length !== this._lastChapterCues.length ||
            cues.some((cue, index) => {
                const previousCue = this._lastChapterCues[index];
                return (
                    cue.cue !== previousCue?.cue ||
                    cue.startTime !== previousCue.startTime ||
                    cue.endTime !== previousCue.endTime ||
                    cue.content !== previousCue.content ||
                    cue.atStart !== previousCue.atStart ||
                    cue.atEnd !== previousCue.atEnd
                );
            });
        const rangeWidth = this._measuredRangeWidth;
        if (
            track === this._lastChapterTrack &&
            !cuesChanged &&
            min === this._lastChapterMin &&
            max === this._lastChapterMax &&
            rangeWidth === this._lastChapterRangeWidth &&
            activeCue === this._lastChapterActiveCue &&
            hoveredCue === this._lastChapterHoveredCue
        ) {
            return;
        }

        this._lastChapterTrack = track;
        this._lastChapterCues = cues;
        this._lastChapterMin = min;
        this._lastChapterMax = max;
        this._lastChapterRangeWidth = rangeWidth;
        this._lastChapterActiveCue = activeCue;
        this._lastChapterHoveredCue = hoveredCue;

        const span = max - min;
        if (!Number.isFinite(min) || !Number.isFinite(max) || span <= 0 || rangeWidth <= 0) {
            this._chapterSegments = [];
            return;
        }

        const segments: ChapterMarkerSegment[] = [];
        for (let index = 0; index < cues.length; index++) {
            const { cue, startTime: cueStartTime, endTime: cueEndTime, atStart, atEnd } = cues[index];
            if (cueEndTime < min || cueStartTime > max) {
                continue;
            }
            const startTime = Math.max(min, cueStartTime);
            const endTime = Math.min(max, cueEndTime);
            const left = atStart ? 0 : this.getThumbPosition_((startTime - min) / span, rangeWidth);
            const right = atEnd ? rangeWidth : this.getThumbPosition_((endTime - min) / span, rangeWidth);
            const nextCue = cues[index + 1]?.cue;
            let parts = 'chapter';
            if (cue === activeCue) {
                parts += ' active';
            }
            if (cue === hoveredCue) {
                parts += ' hover';
            }
            if (nextCue === undefined || nextCue.startTime !== cue.endTime) {
                parts += ' discontinuous';
            }
            segments.push({ left, width: right - left, parts, atStart, atEnd });
        }
        this._chapterSegments = segments;
    };

    protected override handleKeyDown_(e: KeyboardEvent) {
        super.handleKeyDown_(e);
        if (this.deviceType === 'tv' && e.keyCode === KeyCode.ENTER) {
            if (this._player !== undefined) {
                if (this._player.paused) {
                    this._player.play();
                } else {
                    this._player.pause();
                }
            }
        }
    }

    protected override renderRangeExtras(): HTMLTemplateResult {
        return html`
            ${this.showChapterMarkers && !this._player?.ads?.playing
                ? html`<div part="chapters" aria-hidden="true">
                      ${this._chapterSegments.map(
                          (segment) =>
                              html`<div
                                  part=${segment.parts}
                                  style=${styleMap({
                                      left: `${segment.left}px`,
                                      width: `${segment.width}px`,
                                      borderLeftWidth: segment.atStart ? '0' : undefined,
                                      borderRightWidth: segment.atEnd ? '0' : undefined
                                  })}
                              ></div>`
                      )}
                  </div>`
                : ''}
            <div class="theoplayer-time-range-preview-rail" style=${styleMap({ transform: this._previewRailTransform })}>
                <div part="box preview-box" ${ref(this._previewBoxEl)}>
                    <slot name="preview">
                        <theoplayer-preview-thumbnail></theoplayer-preview-thumbnail>
                        <theoplayer-preview-time-display remaining-when-live></theoplayer-preview-time-display>
                    </slot>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-time-range': TimeRange;
    }
}
