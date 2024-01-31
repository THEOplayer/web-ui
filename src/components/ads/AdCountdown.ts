import * as shadyCss from '@webcomponents/shadycss';
import textDisplayCss from '../TextDisplay.css';
import adCountdownCss from './AdCountdown.css';
import { StateReceiverMixin } from '../StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { setTextContent } from '../../util/CommonUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${textDisplayCss}\n${adCountdownCss}</style><span></span>`;
shadyCss.prepareTemplate(template, 'theoplayer-ad-countdown');

const AD_EVENTS = ['adbreakbegin', 'adbreakend', 'adbreakchange', 'updateadbreak'] as const;

/**
 * @group Components
 */
export class AdCountdown extends StateReceiverMixin(HTMLElement, ['player']) {
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
        this._update();
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener('timeupdate', this._update);
            this._player.ads?.removeEventListener(AD_EVENTS, this._onAdChange);
        }
        this._player = player;
        this._onAdChange();
        if (this._player !== undefined) {
            this._player.ads?.addEventListener(AD_EVENTS, this._onAdChange);
        }
    }

    private readonly _onAdChange = () => {
        if (this._player?.ads?.playing) {
            this._player.removeEventListener('timeupdate', this._update);
            this._player.addEventListener('timeupdate', this._update);
        } else {
            this._player?.removeEventListener('timeupdate', this._update);
        }
        this._update();
    };

    private readonly _update = (): void => {
        const ads = this._player?.ads;
        let maxRemainingDuration = ads?.currentAdBreak?.maxRemainingDuration;
        if (ads === undefined || !ads.playing || maxRemainingDuration === undefined || maxRemainingDuration < 0) {
            setTextContent(this._spanEl, '');
            this.style.display = 'none';
            return;
        }
        maxRemainingDuration = Math.ceil(maxRemainingDuration);
        setTextContent(this._spanEl, `Content will resume in ${maxRemainingDuration}s`);
        this.style.display = '';
    };
}

customElements.define('theoplayer-ad-countdown', AdCountdown);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-ad-countdown': AdCountdown;
    }
}
