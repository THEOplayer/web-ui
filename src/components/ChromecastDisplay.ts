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
 * @cssproperty `--theoplayer-chromecast-display-icon-color` - The color of the Chromecast icon. Defaults to `--theoplayer-icon-color`.
 * @cssproperty `--theoplayer-chromecast-display-icon-width` - The width of the Chromecast icon. Defaults to `48px`.
 * @cssproperty `--theoplayer-chromecast-display-icon-height` - The height of the Chromecast icon. Defaults to `48px`.
 * @cssproperty `--theoplayer-chromecast-display-icon-gap` - The gap between the icon and the heading. Defaults to `10px`.
 * @cssproperty `--theoplayer-chromecast-display-heading-color` - The color of the heading text. Defaults to `#fff`.
 * @cssproperty `--theoplayer-chromecast-display-heading-font-size` - The font size of the heading text. Defaults to `--theoplayer-text-font-size`.
 * @cssproperty `--theoplayer-chromecast-display-heading-margin` - The margin around the heading text. Defaults to `0`.
 * @cssproperty `--theoplayer-chromecast-display-receiver-color` - The color of the receiver name text. Defaults to `#fff`.
 * @cssproperty `--theoplayer-chromecast-display-receiver-font-size` - The font size of the receiver name text. Defaults to `calc(1.25 * var(--theoplayer-text-font-size, 14px))`.
 * @cssproperty `--theoplayer-chromecast-display-receiver-margin` - The margin around the receiver name text. Defaults to `0`.
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
