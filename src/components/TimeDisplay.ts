import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import textDisplayCss from './TextDisplay.css';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { formatAsTimePhrase, formatTime } from '../util/TimeUtils';
import { Attribute } from '../util/Attribute';
import type { StreamType } from '../util/StreamType';

const PLAYER_EVENTS = ['timeupdate', 'seeking', 'seeked', 'durationchange'] as const;

const DEFAULT_MISSING_TIME_PHRASE = 'video not loaded, unknown time';

/**
 * A control that displays the current time of the stream.
 *
 * @attribute `show-duration` - If set, also shows the duration of the stream.
 * @attribute `remaining` - If set, shows the remaining time of the stream. Not compatible with `show-duration`.
 * @attribute `remaining-when-live` - If set, and the stream is a livestream, shows the remaining time
 *   (until the live point) of the stream.
 */
@customElement('theoplayer-time-display')
@stateReceiver(['player', 'streamType'])
export class TimeDisplay extends LitElement {
    static override styles = [textDisplayCss];

    private _player: ChromelessPlayer | undefined;

    connectedCallback(): void {
        super.connectedCallback();

        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'progressbar');
        }
        if (!this.hasAttribute(Attribute.ARIA_LABEL)) {
            this.setAttribute(Attribute.ARIA_LABEL, 'playback time');
        }
        if (!this.hasAttribute(Attribute.ARIA_LIVE)) {
            // Tell screen readers not to automatically read the time as it changes
            this.setAttribute(Attribute.ARIA_LIVE, 'off');
        }
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
            this._player.removeEventListener(PLAYER_EVENTS, this._updateFromPlayer);
        }
        this._player = player;
        this._updateFromPlayer();
        if (this._player !== undefined) {
            this._player.addEventListener(PLAYER_EVENTS, this._updateFromPlayer);
        }
    }
    @property({ reflect: true, type: Boolean, attribute: Attribute.REMAINING })
    accessor remaining: boolean = false;

    @property({ reflect: true, type: Boolean, attribute: Attribute.REMAINING_WHEN_LIVE })
    accessor remainingWhenLive: boolean = false;

    @property({ reflect: true, type: Boolean, attribute: Attribute.SHOW_DURATION })
    accessor showDuration: boolean = false;

    @property({ reflect: true, type: String, attribute: Attribute.STREAM_TYPE })
    accessor streamType: StreamType = 'vod';

    @state()
    private accessor _currentTime: number = 0;

    @state()
    private accessor _duration: number = NaN;

    @state()
    private accessor _endTime: number = 0;

    private readonly _updateFromPlayer = () => {
        const currentTime = this._player ? this._player.currentTime : 0;
        const duration = this._player ? this._player.duration : NaN;
        const seekable = this._player?.seekable;
        const endTime = isFinite(duration) ? duration : seekable && seekable.length > 0 ? seekable.end(0) : NaN;
        this._currentTime = currentTime;
        this._duration = duration;
        this._endTime = endTime;
    };

    protected override render(): HTMLTemplateResult {
        const remaining = this.remaining || (this.remainingWhenLive && this.streamType !== 'vod');
        let time = this._currentTime;
        const endTime = this._endTime;
        if (remaining) {
            time = -((this._endTime || 0) - time);
        }
        let text: string;
        if (this.showDuration && !remaining) {
            text = `${formatTime(time, endTime, remaining)} / ${formatTime(endTime)}`;
        } else {
            text = formatTime(time, endTime, remaining);
        }

        let ariaValueText: string;
        if (isNaN(this._duration)) {
            ariaValueText = DEFAULT_MISSING_TIME_PHRASE;
        } else if (this.showDuration) {
            ariaValueText = `${formatAsTimePhrase(time, remaining)} of ${formatAsTimePhrase(endTime)}`;
        } else {
            ariaValueText = formatAsTimePhrase(time, remaining);
        }
        this.setAttribute('aria-valuetext', ariaValueText);

        return html`<span>${text}</span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-time-display': TimeDisplay;
    }
}
