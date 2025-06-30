import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import textDisplayCss from './TextDisplay.css';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { formatTime } from '../util/TimeUtils';
import { Attribute } from '../util/Attribute';

const PLAYER_EVENTS = ['durationchange'] as const;

/**
 * `<theoplayer-duration-display>` - A control that displays the duration of the stream.
 *
 * @group Components
 */
@customElement('theoplayer-duration-display')
@stateReceiver(['player'])
export class DurationDisplay extends LitElement {
    static override styles = [textDisplayCss];

    private _player: ChromelessPlayer | undefined;

    connectedCallback(): void {
        super.connectedCallback();

        if (!this.hasAttribute(Attribute.ARIA_LIVE)) {
            // Tell screen readers not to automatically read the duration as it changes
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

    /**
     * The current duration.
     */
    @state()
    accessor duration: number = NaN;

    private readonly _updateFromPlayer = () => {
        this.duration = this._player ? this._player.duration : NaN;
    };

    protected override render() {
        return html`<span>${formatTime(this.duration)}</span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-duration-display': DurationDisplay;
    }
}
