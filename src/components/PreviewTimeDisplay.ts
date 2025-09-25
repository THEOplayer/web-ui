import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import textDisplayCss from './TextDisplay.css';
import { stateReceiver } from './StateReceiverMixin';
import { formatTime } from '../util/TimeUtils';
import { Attribute } from '../util/Attribute';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import type { StreamType } from '../util/StreamType';

const PLAYER_EVENTS = ['timeupdate', 'seeking', 'seeked', 'durationchange'] as const;

/**
 * A display that shows the current preview time of a {@link TimeRange | `<theoplayer-time-range>`}.
 *
 * @attribute `remaining` - If set, shows the remaining time of the stream.
 * @attribute `remaining-when-live` - If set, and the stream is a livestream, shows the remaining time
 *   (until the live point) of the stream.
 * @group Components
 */
@customElement('theoplayer-preview-time-display')
@stateReceiver(['player', 'previewTime', 'streamType'])
export class PreviewTimeDisplay extends LitElement {
    static override styles = [textDisplayCss];

    private _player: ChromelessPlayer | undefined;

    connectedCallback(): void {
        super.connectedCallback();
        this._updateFromPlayer();
    }

    @state()
    accessor previewTime: number = NaN;

    @property({ reflect: true, type: Boolean, attribute: Attribute.REMAINING })
    accessor remaining: boolean = false;

    @property({ reflect: true, type: Boolean, attribute: Attribute.REMAINING_WHEN_LIVE })
    accessor remainingWhenLive: boolean = false;

    @property({ reflect: true, type: String, attribute: Attribute.STREAM_TYPE })
    accessor streamType: StreamType = 'vod';

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

    @state()
    private accessor _endTime: number = 0;

    private readonly _updateFromPlayer = (): void => {
        const duration = this._player ? this._player.duration : NaN;
        const seekable = this._player?.seekable;
        this._endTime = isFinite(duration) ? duration : seekable && seekable.length > 0 ? seekable.end(0) : NaN;
    };

    protected override render(): HTMLTemplateResult {
        let previewTime = this.previewTime;
        const endTime = this._endTime;
        const remaining = this.remaining || (this.remainingWhenLive && this.streamType !== 'vod');
        if (remaining) {
            previewTime = -((endTime || 0) - previewTime);
        }
        return html`<span>${formatTime(previewTime, endTime, remaining)}</span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-preview-time-display': PreviewTimeDisplay;
    }
}
