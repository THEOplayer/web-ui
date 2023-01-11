import * as shadyCss from '@webcomponents/shadycss';
import { Range, rangeTemplate } from './Range';
import timeRangeHtml from './TimeRange.html';
import timeRangeCss from './TimeRange.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer';
import { formatAsTimePhrase } from '../util/TimeUtils';
import { createCustomEvent } from '../util/CustomEvent';
import type { PreviewTimeChangeEvent } from '../events/PreviewTimeChangeEvent';
import { PREVIEW_TIME_CHANGE_EVENT } from '../events/PreviewTimeChangeEvent';
import './PreviewTimeDisplay';

const template = document.createElement('template');
template.innerHTML = rangeTemplate(timeRangeHtml, timeRangeCss);
shadyCss.prepareTemplate(template, 'theoplayer-time-range');

const UPDATE_EVENTS = ['timeupdate', 'durationchange', 'ratechange', 'seeking', 'seeked'] as const;
const AUTO_ADVANCE_EVENTS = ['play', 'pause', 'ended', 'readystatechange', 'error'] as const;
const DEFAULT_MISSING_TIME_PHRASE = 'video not loaded, unknown time';

export class TimeRange extends StateReceiverMixin(Range, ['player']) {
    private readonly _previewRailEl: HTMLElement;

    private _player: ChromelessPlayer | undefined;
    private _pausedWhileScrubbing: boolean = false;

    private _autoAdvanceId: number = 0;
    private _lastUpdateTime: number = 0;
    private _lastCurrentTime: number = 0;
    private _lastPlaybackRate: number = 0;

    constructor() {
        super({ template });

        this._previewRailEl = this.shadowRoot!.querySelector('.theoplayer-time-range-preview-rail')!;

        this._rangeEl.addEventListener('mousedown', this._pauseOnScrubStart);
        this._rangeEl.addEventListener('touchstart', this._pauseOnScrubStart);
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
        }
        this._player = player;
        this._updateFromPlayer();
        this._toggleAutoAdvance();
        if (this._player !== undefined) {
            this._player.addEventListener(UPDATE_EVENTS, this._updateFromPlayer);
            this._player.addEventListener(AUTO_ADVANCE_EVENTS, this._toggleAutoAdvance);
        }
    }

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _updateFromPlayer = () => {
        if (this._player === undefined) {
            return;
        }
        this._lastUpdateTime = performance.now();
        this._lastCurrentTime = this._player!.currentTime;
        this._lastPlaybackRate = this._player!.playbackRate;
        const seekable = this._player.seekable;
        if (seekable.length !== 0) {
            this.min = seekable.start(0);
            this.max = seekable.end(0);
        } else {
            this.min = 0;
            this.max = this._player.duration;
        }
        this._rangeEl.valueAsNumber = this._lastCurrentTime;
        this.update();
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

    protected override updatePointer_(mousePercent: number, rangeWidth: number): void {
        super.updatePointer_(mousePercent, rangeWidth);

        // Update preview rail
        this._previewRailEl.style.transform = `translateX(${(mousePercent * 100 * 100).toFixed(6)}%)`;

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
}

customElements.define('theoplayer-time-range', TimeRange);
