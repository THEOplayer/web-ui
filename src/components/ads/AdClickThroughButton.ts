import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from '../Button';
import { StateReceiverMixin } from '../StateReceiverMixin';
import { Attribute } from '../../util/Attribute';
import type { ChromelessPlayer } from 'theoplayer';
import { arrayFind } from '../../util/CommonUtils';
import { isLinearAd } from '../../util/AdUtils';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<a target="_blank"><slot>Visit Advertiser</slot></a>`);
shadyCss.prepareTemplate(template, 'theoplayer-ad-clickthrough-button');

const AD_EVENTS = ['adbegin', 'adend', 'adloaded', 'updatead', 'adskip'] as const;

export class AdClickThroughButton extends StateReceiverMixin(Button, ['player']) {
    private readonly _linkEl: HTMLAnchorElement;
    private _player: ChromelessPlayer | undefined;

    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.CLICKTHROUGH];
    }

    constructor() {
        super({ template });
        this._linkEl = this.shadowRoot!.querySelector('a')!;
    }

    connectedCallback(): void {
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

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    protected override handleClick(): void {
        this._linkEl.click();
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (attrName === Attribute.CLICKTHROUGH && newValue !== oldValue) {
            const hasValue = newValue != null;
            this._linkEl.href = newValue ? String(newValue).trim() : '#';
            this.disabled = hasValue;
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
        const clickThrough = linearAd.clickThrough;
        if (!clickThrough) {
            // Linear ad has no clickthrough URL.
            this.clickThrough = null;
            return;
        }
        this.clickThrough = clickThrough;
    };
}

customElements.define('theoplayer-ad-clickthrough-button', AdClickThroughButton);
