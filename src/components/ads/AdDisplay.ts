import * as shadyCss from '@webcomponents/shadycss';
import textDisplayCss from '../TextDisplay.css';
import adDisplayCss from './AdDisplay.css';
import { StateReceiverMixin } from '../StateReceiverMixin';
import type { Ads, ChromelessPlayer } from 'theoplayer/chromeless';
import { arrayFind, setTextContent } from '../../util/CommonUtils';
import { isLinearAd } from '../../util/AdUtils';
import { createTemplate } from '../../util/TemplateUtils';

const template = createTemplate('theoplayer-ad-display', `<style>${textDisplayCss}\n${adDisplayCss}</style><span></span>`);

const AD_EVENTS = ['adbreakbegin', 'adbreakend', 'adbreakchange', 'updateadbreak', 'adbegin', 'adend', 'adskip', 'addad', 'updatead'] as const;

/**
 * `<theoplayer-ad-countdown>` - A control that shows when an advertisement is playing,
 * and the number of the current ad in the ad break (if the break has multiple ads).
 *
 * @group Components
 */
export class AdDisplay extends StateReceiverMixin(HTMLElement, ['player']) {
    private readonly _spanEl: HTMLElement;
    private _player: ChromelessPlayer | undefined;
    private _ads: Ads | undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template().content.cloneNode(true));
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
        this._updateFromPlayer();
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this._ads?.removeEventListener(AD_EVENTS, this._updateFromPlayer);
        this._player = player;
        this._ads = player?.ads;
        this._updateFromPlayer();
        this._ads?.addEventListener(AD_EVENTS, this._updateFromPlayer);
    }

    private readonly _updateFromPlayer = () => {
        const ads = this._player?.ads;
        const linearAds = (ads?.currentAdBreak?.ads ?? []).filter(isLinearAd);
        if (ads === undefined || !ads.playing || linearAds.length === 0) {
            setTextContent(this._spanEl, '');
            this.style.display = 'none';
            return;
        }
        if (linearAds.length > 1) {
            const currentAds = this._player!.ads!.currentAds || [];
            const currentLinearAd = arrayFind(currentAds, isLinearAd);
            if (currentLinearAd) {
                const currentAdIndex = linearAds.indexOf(currentLinearAd);
                if (currentAdIndex >= 0) {
                    setTextContent(this._spanEl, `Ad ${currentAdIndex + 1} of ${linearAds.length}`);
                    this.style.display = '';
                    return;
                }
            }
        }
        setTextContent(this._spanEl, 'Ad');
        this.style.display = '';
    };
}

customElements.define('theoplayer-ad-display', AdDisplay);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-ad-display': AdDisplay;
    }
}
