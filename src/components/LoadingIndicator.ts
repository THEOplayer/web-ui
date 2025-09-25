import loadingIndicatorCss from './LoadingIndicator.css';
import loadingIndicatorHtml from './LoadingIndicator.html';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { Attribute } from '../util/Attribute';
import { customElement, property } from 'lit/decorators.js';
import { type HTMLTemplateResult, LitElement } from 'lit';

const PLAYER_EVENTS = ['readystatechange', 'play', 'pause', 'playing', 'seeking', 'seeked'] as const;

/**
 * An indicator that shows whether the player is currently waiting for more data to resume playback.
 *
 * @attribute `loading` (readonly) - Whether the player is waiting for more data. If set, the indicator is shown.
 * @group Components
 */
@customElement('theoplayer-loading-indicator')
@stateReceiver(['player'])
export class LoadingIndicator extends LitElement {
    static override styles = [loadingIndicatorCss];

    private _player: ChromelessPlayer | undefined;

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

    @property({ reflect: true, type: Boolean, attribute: Attribute.LOADING })
    accessor loading: boolean = false;

    private readonly _updateFromPlayer = () => {
        this.loading = this._player !== undefined && !this._player.paused && (this._player.seeking || this._player.readyState < 3);
    };

    protected override render(): HTMLTemplateResult {
        return loadingIndicatorHtml;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-loading-indicator': LoadingIndicator;
    }
}
