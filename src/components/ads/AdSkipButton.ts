import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from '../Button';
import adSkipButtonCss from './AdSkipButton.css';
import skipNextIcon from '../../icons/skip-next.svg';
import { StateReceiverMixin } from '../StateReceiverMixin';
import { Attribute } from '../../util/Attribute';
import type { Ads, ChromelessPlayer } from 'theoplayer/chromeless';
import { arrayFind, setTextContent } from '../../util/CommonUtils';
import { isLinearAd } from '../../util/AdUtils';
import { createTemplate } from '../../util/TemplateUtils';

const template = createTemplate(
    'theoplayer-ad-skip-button',
    buttonTemplate(
        `<span part="countdown">Skip in 0 seconds</span>` +
            `<span part="skip">` +
            `<span part="skip-text"><slot name="skip-text">Skip Ad</slot></span> ` +
            `<span part="skip-icon"><slot name="skip-icon">${skipNextIcon}</slot></span>` +
            `</span>`,
        adSkipButtonCss
    )
);

const AD_EVENTS = ['adbegin', 'adend', 'adloaded', 'updatead', 'adskip'] as const;

/**
 * `<theoplayer-ad-skip-button>` - A button that skips the current advertisement (if skippable).
 * If the ad cannot be skipped yet, it shows the remaining time until it can be skipped.
 *
 * @group Components
 */
export class AdSkipButton extends StateReceiverMixin(Button, ['player']) {
    private readonly _countdownEl: HTMLElement;
    private readonly _skipEl: HTMLElement;
    private _player: ChromelessPlayer | undefined;
    private _ads: Ads | undefined;

    static get observedAttributes() {
        return [...Button.observedAttributes];
    }

    constructor() {
        super({ template: template() });
        this._countdownEl = this.shadowRoot!.querySelector('[part="countdown"]')!;
        this._skipEl = this.shadowRoot!.querySelector('[part="skip"]')!;

        this._upgradeProperty('player');
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._update();
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this._player?.removeEventListener('timeupdate', this._update);
        this._ads?.removeEventListener(AD_EVENTS, this._onAdChange);
        this._player = player;
        this._ads = player?.ads;
        this._onAdChange();
        this._ads?.addEventListener(AD_EVENTS, this._onAdChange);
    }

    protected override handleClick(): void {
        this._player?.ads?.skip();
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (AdSkipButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
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
        if (!ads || !ads.playing) {
            // No ads playing.
            this.style.display = 'none';
            return;
        }
        const linearAd = arrayFind(ads.currentAds ?? [], isLinearAd);
        if (linearAd === undefined) {
            // No linear ad.
            this.style.display = 'none';
            return;
        }
        if (linearAd.integration === 'google-ima') {
            // Google IMA always shows their own skip button.
            this.style.display = 'none';
            return;
        }
        const skipOffset = linearAd.skipOffset;
        if (skipOffset === undefined || skipOffset < 0 || (linearAd.duration !== undefined && skipOffset >= linearAd.duration)) {
            // Linear ad is not skippable.
            this.style.display = 'none';
            return;
        }
        const currentTime = this._player!.currentTime;
        if (currentTime < skipOffset) {
            // Show countdown.
            const timeToSkip = Math.ceil(skipOffset - currentTime);
            setTextContent(this._countdownEl, `Skip in ${timeToSkip}s`);
            this._countdownEl.style.visibility = 'visible';
            this._skipEl.style.visibility = 'hidden';
            this._skipEl.style.pointerEvents = 'none';
            this.style.display = '';
            this.setAttribute(Attribute.DISABLED, '');
            this.setAttribute(Attribute.ARIA_LIVE, 'off');
        } else {
            // Show skip button.
            this._countdownEl.style.visibility = 'hidden';
            this._skipEl.style.visibility = 'visible';
            this._skipEl.style.pointerEvents = '';
            this.style.display = '';
            this.removeAttribute(Attribute.DISABLED);
            this.setAttribute(Attribute.ARIA_LIVE, 'polite');
        }
    };
}

customElements.define('theoplayer-ad-skip-button', AdSkipButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-ad-skip-button': AdSkipButton;
    }
}
