import * as shadyCss from '@webcomponents/shadycss';
import { Range, rangeTemplate } from './Range';
import timeRangeHtml from './TimeRange.html';
import timeRangeCss from './TimeRange.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { formatAsTimePhrase } from '../util/TimeUtils';
import { createCustomEvent } from '../util/EventUtils';
import type { PreviewTimeChangeEvent } from '../events/PreviewTimeChangeEvent';
import { PREVIEW_TIME_CHANGE_EVENT } from '../events/PreviewTimeChangeEvent';
import { Attribute } from '../util/Attribute';
import type { StreamType } from '../util/StreamType';
import './PreviewThumbnail';
import './PreviewTimeDisplay';
import { isLinearAd } from '../util/AdUtils';
import type { ColorStops } from '../util/ColorStops';

const template = document.createElement('template');
template.innerHTML = rangeTemplate(timeRangeHtml, timeRangeCss);
shadyCss.prepareTemplate(template, 'theoplayer-time-range');

const UPDATE_EVENTS = ['timeupdate', 'durationchange', 'ratechange', 'seeking', 'seeked'] as const;
const AUTO_ADVANCE_EVENTS = ['play', 'pause', 'ended', 'readystatechange', 'error'] as const;
const AD_EVENTS = ['adbreakbegin', 'adbreakend', 'adbreakchange', 'updateadbreak', 'adbegin', 'adend', 'adskip', 'addad', 'updatead'] as const;
const DEFAULT_MISSING_TIME_PHRASE = 'video not loaded, unknown time';

/**
 * Width of an ad marker on the progress bar, in percent of the total bar width.
 */
const AD_MARKER_WIDTH = 1;

/**
 * A seek bar, showing the current time of the player, and which seeks the player when clicked or dragged.
 *
 * @slot `preview` - A slot holding a preview of the seek time, shown while hovering the seek bar.
 *   By default, this shows the {@link PreviewTimeDisplay | preview time} and
 *   the {@link PreviewThumbnail | preview thumbnail}.
 * @group Components
 */
export class TimeRange extends StateReceiverMixin(Range, ['player', 'streamType']) {
    static get observedAttributes() {
        return [...Range.observedAttributes, Attribute.SHOW_AD_MARKERS];
    }

    private readonly _previewRailEl: HTMLElement;
    private readonly _previewBoxEl: HTMLElement;

    private _player: ChromelessPlayer | undefined;
    private _pausedWhileScrubbing: boolean = false;

    private _autoAdvanceId: number = 0;
    private _lastUpdateTime: number = 0;
    private _lastCurrentTime: number = 0;
    private _lastPlaybackRate: number = 0;

    constructor() {
        super({ template });

        this._previewRailEl = this.shadowRoot!.querySelector('.theoplayer-time-range-preview-rail')!;
        this._previewBoxEl = this._previewRailEl.querySelector('[part~="preview-box"]')!;

        this._rangeEl.setAttribute(Attribute.ARIA_LIVE, 'off');
        this._rangeEl.addEventListener('mousedown', this._pauseOnScrubStart);
        this._rangeEl.addEventListener('touchstart', this._pauseOnScrubStart);

        this._upgradeProperty('player');
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._toggleAutoAdvance();
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this._toggleAutoAdvance();
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener(UPDATE_EVENTS, this._updateFromPlayer);
            this._player.removeEventListener(AUTO_ADVANCE_EVENTS, this._toggleAutoAdvance);
            this._player.ads?.removeEventListener(AD_EVENTS, this._onAdChange);
        }
        this._player = player;
        this._updateFromPlayer();
        this._toggleAutoAdvance();
        if (this._player !== undefined) {
            this._player.addEventListener(UPDATE_EVENTS, this._updateFromPlayer);
            this._player.addEventListener(AUTO_ADVANCE_EVENTS, this._toggleAutoAdvance);
            this._player.ads?.addEventListener(AD_EVENTS, this._onAdChange);
        }
    }

    get streamType(): StreamType {
        return (this.getAttribute(Attribute.STREAM_TYPE) || 'vod') as StreamType;
    }

    set streamType(streamType: StreamType) {
        this.setAttribute(Attribute.STREAM_TYPE, streamType);
    }

    private readonly _updateFromPlayer = () => {
        if (this._player === undefined) {
            return;
        }
        this._lastUpdateTime = performance.now();
        this._lastCurrentTime = this._player.currentTime;
        this._lastPlaybackRate = this._player.playbackRate;
        const seekable = this._player.seekable;
        if (seekable.length !== 0) {
            this.min = seekable.start(0);
            this.max = seekable.end(0);
        } else {
            this.min = 0;
            this.max = this._player.duration;
        }
        if (!isFinite(this._lastCurrentTime)) {
            const isLive = this._player.duration === Infinity;
            this._lastCurrentTime = isLive ? this.max : this.min;
        }
        this._rangeEl.valueAsNumber = this._lastCurrentTime;
        this.update();
        this._updateDisabled();
    };

    private readonly _updateDisabled = () => {
        let disabled = this.streamType === 'live';
        if (this._player !== undefined) {
            disabled ||= this._player.seekable.length === 0;
        }
        this.disabled = disabled;
    };

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

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.STREAM_TYPE) {
            this._updateDisabled();
        } else if (attrName === Attribute.SHOW_AD_MARKERS) {
            this.update();
        }
        if (TimeRange.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
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
        if (this._player === undefined || this._player.paused) {
            // Player is already paused.
            return;
        }
        this._pausedWhileScrubbing = true;
        this._player.pause();
        document.addEventListener('mouseup', this._playOnScrubEnd);
        document.addEventListener('touchend', this._playOnScrubEnd);
    };

    private readonly _playOnScrubEnd = () => {
        if (!this._pausedWhileScrubbing) {
            return;
        }
        this._pausedWhileScrubbing = false;
        document.removeEventListener('mouseup', this._playOnScrubEnd);
        document.removeEventListener('touchend', this._playOnScrubEnd);
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
            this._player.readyState >= 3
        );
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
        this._rangeEl.valueAsNumber = this._lastCurrentTime + delta * this._lastPlaybackRate;
        this.update();

        this._autoAdvanceId = requestAnimationFrame(this._autoAdvanceWhilePlaying);
    };

    protected override updatePointer_(mousePercent: number, rangeRect: DOMRectReadOnly): void {
        super.updatePointer_(mousePercent, rangeRect);

        // Update preview rail, keeping the preview box within bounds
        let previewPos = rangeRect.left + mousePercent * rangeRect.width;
        const previewBoxRect = this._previewBoxEl.getBoundingClientRect();
        const minPreviewPos = rangeRect.left + previewBoxRect.width / 2;
        const maxPreviewPos = rangeRect.right - previewBoxRect.width / 2;
        previewPos = Math.max(minPreviewPos, Math.min(maxPreviewPos, previewPos));
        const previewPosFraction = (previewPos - rangeRect.left) / rangeRect.width;
        this._previewRailEl.style.transform = `translateX(${(previewPosFraction * 100 * 100).toFixed(6)}%)`;

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
        if (!this.hasAttribute(Attribute.SHOW_AD_MARKERS) || !this._player || !this._player.ads) {
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
        this.update();
    };
}

customElements.define('theoplayer-time-range', TimeRange);
