import * as shadyCss from '@webcomponents/shadycss';
import loadingIndicatorCss from './LoadingIndicator.css';
import loadingIndicatorHtml from './LoadingIndicator.html';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = `<style>${loadingIndicatorCss}</style>${loadingIndicatorHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-loading-indicator');

const PLAYER_EVENTS = ['readystatechange', 'play', 'pause', 'playing', 'seeking', 'seeked'] as const;

export class LoadingIndicator extends StateReceiverMixin(HTMLElement, ['player']) {
    private _player: ChromelessPlayer | undefined;

    static get observedAttributes() {
        return [Attribute.LOADING];
    }

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
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

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _updateFromPlayer = () => {
        const loading = this._player !== undefined && !this._player.paused && (this._player.seeking || this._player.readyState < 3);
        if (loading) {
            this.setAttribute(Attribute.LOADING, '');
        } else {
            this.removeAttribute(Attribute.LOADING);
        }
    };

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (LoadingIndicator.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-loading-indicator', LoadingIndicator);
