import * as shadyCss from '@webcomponents/shadycss';
import loadingIndicatorCss from './LoadingIndicator.css';
import loadingIndicatorHtml from './LoadingIndicator.html';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { Attribute } from '../util/Attribute';
import { toggleAttribute } from '../util/CommonUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${loadingIndicatorCss}</style>${loadingIndicatorHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-loading-indicator');

const PLAYER_EVENTS = ['readystatechange', 'play', 'pause', 'playing', 'seeking', 'seeked'] as const;

/**
 * `<theoplayer-loading-indicator>` - An indicator that shows whether the player is currently waiting for more data to resume playback.
 *
 * @attribute `loading` (readonly) - Whether the player is waiting for more data. If set, the indicator is shown.
 * @group Components
 */
export class LoadingIndicator extends StateReceiverMixin(HTMLElement, ['player']) {
    private _player: ChromelessPlayer | undefined;

    static get observedAttributes() {
        return [Attribute.LOADING];
    }

    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

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
        this._updateFromPlayer();
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

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

    private readonly _updateFromPlayer = () => {
        const loading = this._player !== undefined && !this._player.paused && (this._player.seeking || this._player.readyState < 3);
        toggleAttribute(this, Attribute.LOADING, loading);
    };

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (LoadingIndicator.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-loading-indicator', LoadingIndicator);
