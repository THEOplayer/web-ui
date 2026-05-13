import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import textDisplayCss from '../TextDisplay.css';
import adDisplayCss from './AdDisplay.css';
import { stateReceiver } from '../StateReceiverMixin';
import type { Ads, ChromelessPlayer } from 'theoplayer/chromeless';
import { arrayFind } from '../../util/CommonUtils';
import { isLinearAd } from '../../util/AdUtils';
import { getLocale } from '../../i18n';

const AD_EVENTS = ['adbreakbegin', 'adbreakend', 'adbreakchange', 'updateadbreak', 'adbegin', 'adend', 'adskip', 'addad', 'updatead'] as const;

/**
 * A control that shows when an advertisement is playing,
 * and the number of the current ad in the ad break (if the break has multiple ads).
 *
 * @cssproperty `--theoplayer-ad-display-background` - The background of the ad display. Defaults to `#ffc50f`.
 * @cssproperty `--theoplayer-ad-display-border-radius` - The border radius of the ad display. Defaults to `2px`.
 * @cssproperty `--theoplayer-ad-display-padding` - The padding of the ad display. Defaults to `--theoplayer-control-padding`.
 * @cssproperty `--theoplayer-ad-display-text-color` - The text color of the ad display. Defaults to `#000`.
 */
@customElement('theoplayer-ad-display')
@stateReceiver(['player'])
export class AdDisplay extends LitElement {
    static styles = [textDisplayCss, adDisplayCss];

    private _player: ChromelessPlayer | undefined;
    private _ads: Ads | undefined;

    @state()
    private accessor _currentAd: number = 0;

    @state()
    private accessor _totalAds: number = 0;

    connectedCallback(): void {
        super.connectedCallback();
        this._updateFromPlayer();
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
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
            this._currentAd = 0;
            this._totalAds = 0;
            this.style.display = 'none';
            return;
        }
        let currentAd = 0;
        if (linearAds.length > 1) {
            const currentAds = this._player!.ads!.currentAds || [];
            const currentLinearAd = arrayFind(currentAds, isLinearAd);
            if (currentLinearAd) {
                const currentAdIndex = linearAds.indexOf(currentLinearAd);
                if (currentAdIndex >= 0) {
                    currentAd = currentAdIndex + 1;
                }
            }
        }
        this._currentAd = currentAd;
        this._totalAds = linearAds.length;
        this.style.display = '';
    };

    protected override render(): HTMLTemplateResult {
        const locale = getLocale(this.lang);
        const text = this._totalAds > 1 ? locale.adBreakText(this._currentAd, this._totalAds) : locale.adText;
        return html`<span>${text}</span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-ad-display': AdDisplay;
    }
}
