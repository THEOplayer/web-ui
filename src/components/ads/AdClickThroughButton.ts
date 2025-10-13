import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LinkButton } from '../LinkButton';
import { stateReceiver } from '../StateReceiverMixin';
import { Attribute } from '../../util/Attribute';
import type { Ads, ChromelessPlayer } from 'theoplayer/chromeless';
import { arrayFind } from '../../util/CommonUtils';
import { isLinearAd } from '../../util/AdUtils';

const AD_EVENTS = ['adbegin', 'adend', 'adloaded', 'updatead', 'adskip'] as const;

/**
 * A button to open the advertisement's click-through webpage.
 */
@customElement('theoplayer-ad-clickthrough-button')
@stateReceiver(['player'])
export class AdClickThroughButton extends LinkButton {
    private _player: ChromelessPlayer | undefined;
    private _ads: Ads | undefined;
    private _clickThrough: string | null = null;

    constructor() {
        super();
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._updateFromPlayer();

        if (this.clickThrough == null) {
            this.disabled = true;
            this.style.display = 'none';
        }
    }

    get clickThrough(): string | null {
        return this._clickThrough;
    }

    @property({ reflect: true, type: String, attribute: Attribute.CLICKTHROUGH })
    set clickThrough(clickThrough: string | null) {
        if (this._clickThrough === clickThrough) {
            return;
        }
        this._clickThrough = clickThrough;
        this.href = clickThrough ? String(clickThrough).trim() : '#';
        this.target = '_blank';
        this.disabled = clickThrough == null;
        this.style.display = clickThrough != null ? '' : 'none';
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
        if (!ads || !ads.playing) {
            // No ads playing.
            this.clickThrough = null;
            return;
        }
        const linearAd = arrayFind(ads.currentAds ?? [], isLinearAd);
        if (linearAd === undefined) {
            // No linear ad
            this.clickThrough = null;
            return;
        }
        if (linearAd.integration === 'google-ima') {
            // Google IMA always shows their own clickthrough button.
            this.clickThrough = null;
            return;
        }
        const clickThrough = linearAd.clickThrough;
        if (!clickThrough) {
            // Linear ad has no clickthrough URL.
            this.clickThrough = null;
            return;
        }
        this.clickThrough = clickThrough;
    };

    protected override handleClick(): void {
        this._player?.pause();
    }

    protected override renderLinkContent(): HTMLTemplateResult {
        return html`<slot>Visit Advertiser</slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-ad-clickthrough-button': AdClickThroughButton;
    }
}
