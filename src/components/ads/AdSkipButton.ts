import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { styleMap } from 'lit/directives/style-map.js';
import { Button } from '../Button';
import adSkipButtonCss from './AdSkipButton.css';
import skipNextIcon from '../../icons/skip-next.svg';
import { stateReceiver } from '../StateReceiverMixin';
import { Attribute } from '../../util/Attribute';
import type { Ads, ChromelessPlayer } from 'theoplayer/chromeless';
import { arrayFind } from '../../util/CommonUtils';
import { isLinearAd } from '../../util/AdUtils';

const AD_EVENTS = ['adbegin', 'adend', 'adloaded', 'updatead', 'adskip'] as const;

/**
 * A button that skips the current advertisement (if skippable).
 * If the ad cannot be skipped yet, it shows the remaining time until it can be skipped.
 *
 * @group Components
 */
@customElement('theoplayer-ad-skip-button')
@stateReceiver(['player'])
export class AdSkipButton extends Button {
    static styles = [...Button.styles, adSkipButtonCss];

    private _player: ChromelessPlayer | undefined;
    private _ads: Ads | undefined;

    @state()
    private accessor _showCountdown: boolean = false;

    @state()
    private accessor _timeToSkip: number = 0;

    override connectedCallback(): void {
        super.connectedCallback();
        this._update();
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
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
            this._showCountdown = true;
            this._timeToSkip = Math.ceil(skipOffset - currentTime);
            this.style.display = '';
            this.setAttribute(Attribute.DISABLED, '');
            this.setAttribute(Attribute.ARIA_LIVE, 'off');
        } else {
            // Show skip button.
            this._showCountdown = false;
            this.style.display = '';
            this.removeAttribute(Attribute.DISABLED);
            this.setAttribute(Attribute.ARIA_LIVE, 'polite');
        }
    };

    protected override render(): HTMLTemplateResult {
        const countdownStyles = {
            visibility: this._showCountdown ? 'visible' : 'hidden'
        };
        const skipStyles = {
            visibility: this._showCountdown ? 'hidden' : 'visible',
            pointerEvents: this._showCountdown ? 'none' : ''
        };
        return html`<span part="countdown" style=${styleMap(countdownStyles)}>Skip in ${this._timeToSkip} seconds</span>
            <span part="skip" style=${styleMap(skipStyles)}>
                <span part="skip-text"><slot name="skip-text">Skip Ad</slot></span>
                <span part="skip-icon"><slot name="skip-icon">${unsafeSVG(skipNextIcon)}</slot></span>
            </span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-ad-skip-button': AdSkipButton;
    }
}
