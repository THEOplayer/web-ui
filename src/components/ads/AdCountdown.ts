import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import textDisplayCss from '../TextDisplay.css';
import adCountdownCss from './AdCountdown.css';
import { stateReceiver } from '../StateReceiverMixin';
import type { Ads, ChromelessPlayer } from 'theoplayer/chromeless';

const AD_EVENTS = ['adbreakbegin', 'adbreakend', 'adbreakchange', 'updateadbreak'] as const;

/**
 * A control that displays the remaining time of the current ad break.
 *
 * @group Components
 */
@customElement('theoplayer-ad-countdown')
@stateReceiver(['player'])
export class AdCountdown extends LitElement {
    static override styles = [textDisplayCss, adCountdownCss];

    private _player: ChromelessPlayer | undefined;
    private _ads: Ads | undefined;

    @state()
    private accessor _maxRemainingDuration: number = 0;

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
            this._maxRemainingDuration = 0;
            this.style.display = 'none';
        } else {
            this._maxRemainingDuration = Math.ceil(maxRemainingDuration);
            this.style.display = '';
        }
    };

    protected override render(): HTMLTemplateResult {
        return html`<span>Content will resume in ${this._maxRemainingDuration}s</span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-ad-countdown': AdCountdown;
    }
}
