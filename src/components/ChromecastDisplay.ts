import * as shadyCss from '@webcomponents/shadycss';
import chromecastDisplayCss from './ChromecastDisplay.css';
import chromecastIcon from '../icons/chromecast-48px.svg';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer';
import { setTextContent } from '../util/CommonUtils';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML =
    `<style>${chromecastDisplayCss}</style>` +
    `<div part="icon"><slot name="icon">${chromecastIcon}</slot></div>` +
    `<div part="text">` +
    `<p part="heading"><slot name="heading">Playing on</slot></p>` +
    `<p part="receiver">Chromecast Receiver</p>` +
    `</div>`;
shadyCss.prepareTemplate(template, 'theoplayer-chromecast-display');

const CAST_EVENTS = ['statechange'] as const;

/**
 * A control that displays the casting status while using Chromecast.
 *
 * @group Components
 */
export class ChromecastDisplay extends StateReceiverMixin(HTMLElement, ['player']) {
    private readonly _receiverNameEl: HTMLElement;
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
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
        this._player?.cast?.chromecast?.removeEventListener(CAST_EVENTS, this._updateFromPlayer);
        this._player = player;
        this._updateFromPlayer();
        this._player?.cast?.chromecast?.addEventListener(CAST_EVENTS, this._updateFromPlayer);
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
