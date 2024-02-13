import * as shadyCss from '@webcomponents/shadycss';
import { LinkButton, linkButtonTemplate } from '../LinkButton';
import { StateReceiverMixin } from '../StateReceiverMixin';
import { Attribute } from '../../util/Attribute';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { arrayFind } from '../../util/CommonUtils';
import { isLinearAd } from '../../util/AdUtils';
import { createTemplate } from '../../util/TemplateUtils';

const template = createTemplate('theoplayer-ad-clickthrough-button', linkButtonTemplate(`<slot>Visit Advertiser</slot>`));

const AD_EVENTS = ['adbegin', 'adend', 'adloaded', 'updatead', 'adskip'] as const;

/**
 * `<theoplayer-ad-clickthrough-button>` - A button to open the advertisement's click-through webpage.
 *
 * @group Components
 */
export class AdClickThroughButton extends StateReceiverMixin(LinkButton, ['player']) {
    private _player: ChromelessPlayer | undefined;

    static get observedAttributes() {
        return [...LinkButton.observedAttributes, Attribute.CLICKTHROUGH];
    }

    constructor() {
        super({ template });

        this.disabled = true;
        this.style.display = 'none';

        this._upgradeProperty('clickThrough');
        this._upgradeProperty('player');
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._updateFromPlayer();
    }

    get clickThrough(): string | null {
        return this.getAttribute(Attribute.CLICKTHROUGH);
    }

    set clickThrough(clickThrough: string | null) {
        if (clickThrough == null) {
            this.removeAttribute(Attribute.CLICKTHROUGH);
        } else {
            this.setAttribute(Attribute.CLICKTHROUGH, clickThrough);
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
            this._player.ads?.removeEventListener(AD_EVENTS, this._updateFromPlayer);
        }
        this._player = player;
        this._updateFromPlayer();
        if (this._player !== undefined) {
            this._player.ads?.addEventListener(AD_EVENTS, this._updateFromPlayer);
        }
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (attrName === Attribute.CLICKTHROUGH && newValue !== oldValue) {
            const hasValue = newValue != null;
            const href = newValue ? String(newValue).trim() : '#';
            this.setLink(href, '_blank');
            this.disabled = !hasValue;
            if (hasValue) {
                this.style.display = '';
            } else {
                this.style.display = 'none';
            }
        }
        if (AdClickThroughButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
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
}

customElements.define('theoplayer-ad-clickthrough-button', AdClickThroughButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-ad-clickthrough-button': AdClickThroughButton;
    }
}
