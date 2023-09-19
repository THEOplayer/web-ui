import * as shadyCss from '@webcomponents/shadycss';
import textDisplayCss from './TextDisplay.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { setTextContent } from '../util/CommonUtils';
import { formatTime } from '../util/TimeUtils';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = `<style>${textDisplayCss}</style><span></span>`;
shadyCss.prepareTemplate(template, 'theoplayer-duration-display');

const PLAYER_EVENTS = ['durationchange'] as const;

/**
 * A control that displays the duration of the stream.
 *
 * @group Components
 */
export class DurationDisplay extends StateReceiverMixin(HTMLElement, ['player']) {
    private readonly _spanEl: HTMLElement;
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._spanEl = shadowRoot.querySelector('span')!;

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

        if (!this.hasAttribute(Attribute.ARIA_LIVE)) {
            // Tell screen readers not to automatically read the duration as it changes
            this.setAttribute(Attribute.ARIA_LIVE, 'off');
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
        const duration = this._player ? this._player.duration : NaN;
        const text = formatTime(duration);
        setTextContent(this._spanEl, text);
    };
}

customElements.define('theoplayer-duration-display', DurationDisplay);
