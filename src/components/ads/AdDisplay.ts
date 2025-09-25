import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import textDisplayCss from '../TextDisplay.css';
import adDisplayCss from './AdDisplay.css';
import { stateReceiver } from '../StateReceiverMixin';
import type { Ads, ChromelessPlayer } from 'theoplayer/chromeless';
import { arrayFind } from '../../util/CommonUtils';
import { isLinearAd } from '../../util/AdUtils';

const AD_EVENTS = ['adbreakbegin', 'adbreakend', 'adbreakchange', 'updateadbreak', 'adbegin', 'adend', 'adskip', 'addad', 'updatead'] as const;

/**
 * A control that shows when an advertisement is playing,
 * and the number of the current ad in the ad break (if the break has multiple ads).
 */
@customElement('theoplayer-ad-display')
@stateReceiver(['player'])
export class AdDisplay extends LitElement {
    static styles = [textDisplayCss, adDisplayCss];

    private _player: ChromelessPlayer | undefined;
    private _ads: Ads | undefined;

    @state()
    private accessor _text: string = '';

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
            this._text = '';
            this.style.display = 'none';
            return;
        }
        if (linearAds.length > 1) {
            const currentAds = this._player!.ads!.currentAds || [];
            const currentLinearAd = arrayFind(currentAds, isLinearAd);
            if (currentLinearAd) {
                const currentAdIndex = linearAds.indexOf(currentLinearAd);
                if (currentAdIndex >= 0) {
                    this._text = `Ad ${currentAdIndex + 1} of ${linearAds.length}`;
                    this.style.display = '';
                    return;
                }
            }
        }
        this._text = 'Ad';
        this.style.display = '';
    };

    protected override render(): HTMLTemplateResult {
        return html`<span>${this._text}</span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-ad-display': AdDisplay;
    }
}
