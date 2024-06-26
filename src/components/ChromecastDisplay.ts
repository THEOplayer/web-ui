import * as shadyCss from '@webcomponents/shadycss';
import chromecastDisplayCss from './ChromecastDisplay.css';
import chromecastIcon from '../icons/chromecast-48px.svg';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { Chromecast, ChromelessPlayer } from 'theoplayer/chromeless';
import { setTextContent } from '../util/CommonUtils';
import { Attribute } from '../util/Attribute';
import { createTemplate } from '../util/TemplateUtils';

const template = createTemplate(
    'theoplayer-chromecast-display',
    `<style>${chromecastDisplayCss}</style>` +
        `<div part="icon"><slot name="icon">${chromecastIcon}</slot></div>` +
        `<div part="text">` +
        `<p part="heading"><slot name="heading">Playing on</slot></p>` +
        `<p part="receiver">Chromecast Receiver</p>` +
        `</div>`
);

const CAST_EVENTS = ['statechange'] as const;

/**
 * `<theoplayer-chromecast-display>` - A control that displays the casting status while using Chromecast.
 *
 * @group Components
 */
export class ChromecastDisplay extends StateReceiverMixin(HTMLElement, ['player']) {
    private readonly _receiverNameEl: HTMLElement;
    private _player: ChromelessPlayer | undefined;
    private _castApi: Chromecast | undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template().content.cloneNode(true));
        this._receiverNameEl = shadowRoot.querySelector('[part="receiver"]')!;

        this._upgradeProperty('player');
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);
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
            return;
        }
        setTextContent(this._receiverNameEl, chromecast.receiverName || '');
        this.removeAttribute(Attribute.HIDDEN);
    };
}

customElements.define('theoplayer-chromecast-display', ChromecastDisplay);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-chromecast-display': ChromecastDisplay;
    }
}
