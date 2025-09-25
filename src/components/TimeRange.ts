import { html, type HTMLTemplateResult, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, type Ref, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { Range } from './Range';
import timeRangeCss from './TimeRange.css';
import { stateReceiver } from './StateReceiverMixin';
import type { Ads, ChromelessPlayer, TimeRanges } from 'theoplayer/chromeless';
import { formatAsTimePhrase } from '../util/TimeUtils';
import { createCustomEvent } from '../util/EventUtils';
import type { PreviewTimeChangeEvent } from '../events/PreviewTimeChangeEvent';
import { PREVIEW_TIME_CHANGE_EVENT } from '../events/PreviewTimeChangeEvent';
import { Attribute } from '../util/Attribute';
import type { StreamType } from '../util/StreamType';
import { isLinearAd } from '../util/AdUtils';
import type { ColorStops } from '../util/ColorStops';
import { KeyCode } from '../util/KeyCode';

// Load components used in template
import './PreviewThumbnail';
import './PreviewTimeDisplay';

const UPDATE_EVENTS = ['timeupdate', 'durationchange', 'ratechange', 'seeking', 'seeked'] as const;
const AUTO_ADVANCE_EVENTS = ['play', 'pause', 'ended', 'durationchange', 'readystatechange', 'error'] as const;
const AD_EVENTS = ['adbreakbegin', 'adbreakend', 'adbreakchange', 'updateadbreak', 'adbegin', 'adend', 'adskip', 'addad', 'updatead'] as const;
const DEFAULT_MISSING_TIME_PHRASE = 'video not loaded, unknown time';

/**
 * Width of an ad marker on the progress bar, in percent of the total bar width.
 */
const AD_MARKER_WIDTH = 1;

/**
 * A seek bar, showing the current time of the player,
 * and which seeks the player when clicked or dragged.
 *
 * @slot `preview` - A slot holding a preview of the seek time, shown while hovering the seek bar.
 *   By default, this shows the {@link PreviewTimeDisplay | preview time} and
 *   the {@link PreviewThumbnail | preview thumbnail}.
 */
@customElement('theoplayer-time-range')
@stateReceiver(['player', 'streamType', 'deviceType'])
export class TimeRange extends Range {
    static override styles = [...Range.styles, timeRangeCss];

    private readonly _previewBoxEl: Ref<HTMLElement> = createRef<HTMLElement>();

    private _player: ChromelessPlayer | undefined;
    private _streamType: StreamType = 'vod';
    private _showAdMarkers: boolean = false;
    private _ads: Ads | undefined;
    private _pausedWhileScrubbing: boolean = false;

    private _autoAdvanceId: number = 0;
    private _lastUpdateTime: number = 0;
    private _lastCurrentTime: number = 0;
    private _lastPlaybackRate: number = 0;

    constructor() {
        super();
        this.min = 0;
        this.max = 1000;
        this.ariaLive = 'off';
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._toggleAutoAdvance();
    }

    protected override firstUpdated(_changedProperties: PropertyValues) {
        this._rangeRef.value?.addEventListener('mousedown', this._pauseOnScrubStart);
        this._rangeRef.value?.addEventListener('pointerdown', this._pauseOnScrubStart);
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();

        this._rangeRef.value?.removeEventListener('mousedown', this._pauseOnScrubStart);
        this._rangeRef.value?.removeEventListener('pointerdown', this._pauseOnScrubStart);

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
        this._updateFromPlayer();
        this._toggleAutoAdvance();
        if (this._player !== undefined) {
            this._player.addEventListener(UPDATE_EVENTS, this._updateFromPlayer);
            this._player.addEventListener(AUTO_ADVANCE_EVENTS, this._toggleAutoAdvance);
        }
        this._ads?.addEventListener(AD_EVENTS, this._onAdChange);
    }

    get streamType(): StreamType {
        return this._streamType;
    }

    @property({ reflect: true, type: String, attribute: Attribute.STREAM_TYPE })
    set streamType(streamType: StreamType) {
        this._streamType = streamType;
        this.updateDisabled_();
    }

    get showAdMarkers(): boolean {
        return this._showAdMarkers;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.SHOW_AD_MARKERS })
    set showAdMarkers(showAdMarkers: boolean) {
        this._showAdMarkers = showAdMarkers;
        this._updateRange();
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
        this.value = value;
        this.updateDisabled_(seekable);
    };

    private updateDisabled_(seekable: TimeRanges | undefined = this._player?.seekable) {
        let disabled = this.streamType === 'live';
        if (seekable !== undefined) {
            disabled ||= seekable.length === 0;
        }
        this.disabled = disabled;
    }

    protected override getAriaLabel(): string {
        return 'seek';
    }

    protected override getAriaValueText(): string {
        const currentTimePhrase = formatAsTimePhrase(this.value);
        const totalTimePhrase = formatAsTimePhrase(this.max);
        if (currentTimePhrase && totalTimePhrase) {
            return `${currentTimePhrase} of ${totalTimePhrase}`;
        }
        return DEFAULT_MISSING_TIME_PHRASE;
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
            this.value = newValue;

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
        let previewPos = rangeRect.left + mousePercent * rangeRect.width;
        const previewBoxEl = this._previewBoxEl.value;
        if (previewBoxEl) {
            const previewBoxRect = previewBoxEl.getBoundingClientRect();
            const minPreviewPos = rangeRect.left + previewBoxRect.width / 2;
            const maxPreviewPos = rangeRect.right - previewBoxRect.width / 2;
            previewPos = Math.max(minPreviewPos, Math.min(maxPreviewPos, previewPos));
            const previewPosFraction = (previewPos - rangeRect.left) / rangeRect.width;
            this._previewRailTransform = `translateX(${(previewPosFraction * 100 * 100).toFixed(6)}%)`;
        }

        // Propagate preview time to parent
        if (this._player === undefined) {
            return;
        }
        const { min, max } = this;
        const previewTime = min + mousePercent * (max - min);
        const previewTimeChangeEvent: PreviewTimeChangeEvent = createCustomEvent(PREVIEW_TIME_CHANGE_EVENT, {
            bubbles: true,
            composed: true,
            detail: { previewTime }
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
