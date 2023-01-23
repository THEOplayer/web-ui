import * as shadyCss from '@webcomponents/shadycss';
import textDisplayCss from './TextDisplay.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer';
import { setTextContent } from '../util/CommonUtils';
import { formatTime } from '../util/TimeUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${textDisplayCss}</style><span></span>`;
shadyCss.prepareTemplate(template, 'theoplayer-duration-display');

const PLAYER_EVENTS = ['durationchange'] as const;

export class DurationDisplay extends StateReceiverMixin(HTMLElement, ['player']) {
    private readonly _spanEl: HTMLElement;
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._spanEl = shadowRoot.querySelector('span')!;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);
        this._upgradeProperty('player');
        this._updateFromPlayer();
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
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
        const duration = this._player ? this._player.duration : NaN;
        const text = formatTime(duration);
        setTextContent(this._spanEl, text);
    };
}

customElements.define('theoplayer-duration-display', DurationDisplay);
