import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import chromecastDisplayCss from './ChromecastDisplay.css';
import chromecastIcon from '../icons/chromecast-48px.svg';
import { stateReceiver } from './StateReceiverMixin';
import type { Chromecast, ChromelessPlayer } from 'theoplayer/chromeless';
import { Attribute } from '../util/Attribute';

const CAST_EVENTS = ['statechange'] as const;

/**
 * A control that displays the casting status while using Chromecast.
 *
 * @group Components
 */
@customElement('theoplayer-chromecast-display')
@stateReceiver(['player'])
export class ChromecastDisplay extends LitElement {
    static styles = [chromecastDisplayCss];

    private _player: ChromelessPlayer | undefined;
    private _castApi: Chromecast | undefined;

    @state()
    private accessor _receiverName: string = 'Chromecast';

    connectedCallback(): void {
        super.connectedCallback();
        if (!this.hasAttribute(Attribute.HIDDEN)) {
            this.setAttribute(Attribute.HIDDEN, '');
        }
        this._updateFromPlayer();
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._castApi !== undefined) {
            this._castApi.removeEventListener(CAST_EVENTS, this._updateFromPlayer);
        }
        this._player = player;
        this._castApi = player?.cast?.chromecast;
        this._updateFromPlayer();
        if (this._castApi !== undefined) {
            this._castApi.addEventListener(CAST_EVENTS, this._updateFromPlayer);
        }
    }

    private readonly _updateFromPlayer = () => {
        const chromecast = this._player?.cast?.chromecast;
        if (chromecast === undefined || chromecast.state !== 'connected') {
            this.setAttribute(Attribute.HIDDEN, '');
        } else {
            this._receiverName = chromecast.receiverName || 'Chromecast';
            this.removeAttribute(Attribute.HIDDEN);
        }
    };

    protected override render(): HTMLTemplateResult {
        return html`<div part="icon"><slot name="icon">${unsafeSVG(chromecastIcon)}</slot></div>
            <div part="text">
                <p part="heading"><slot name="heading">Playing on</slot></p>
                <p part="receiver">${this._receiverName}</p>
            </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-chromecast-display': ChromecastDisplay;
    }
}
