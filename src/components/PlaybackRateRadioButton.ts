import * as shadyCss from '@webcomponents/shadycss';
import { StateReceiverMixin } from './StateReceiverMixin';
import { RadioButton } from './RadioButton';
import { buttonTemplate } from './Button';
import type { ChromelessPlayer } from 'theoplayer';
import { setTextContent } from '../util/CommonUtils';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<span><slot>1x</slot></span>`);
shadyCss.prepareTemplate(template, 'theoplayer-playback-rate-radio-button');

export class PlaybackRateRadioButton extends StateReceiverMixin(RadioButton, ['player']) {
    private _slotEl: HTMLSlotElement;
    private _player: ChromelessPlayer | undefined = undefined;

    static get observedAttributes() {
        return [...RadioButton.observedAttributes, Attribute.VALUE];
    }

    constructor() {
        super({ template });
        this._slotEl = this.shadowRoot!.querySelector('slot')!;
    }

    override connectedCallback(): void {
        super.connectedCallback();

        this._upgradeProperty('value');

        if (!this.hasAttribute(Attribute.VALUE)) {
            this.setAttribute(Attribute.VALUE, '1');
        }
    }

    get value(): number {
        return Number(this.getAttribute(Attribute.VALUE));
    }

    set value(value: number) {
        this.setAttribute(Attribute.VALUE, String(value));
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener('ratechange', this._updateFromPlayer);
        }
        this._player = player;
        this._updateFromPlayer();
        if (this._player !== undefined) {
            this._player.addEventListener('ratechange', this._updateFromPlayer);
        }
    }

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _updateFromPlayer = (): void => {
        this.checked = this._player ? this._player.playbackRate === this.value : false;
    };

    private _updatePlayer(): void {
        if (this._player && this.checked) {
            this._player.playbackRate = this.value;
        }
    }

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.ARIA_CHECKED) {
            this._updatePlayer();
        } else if (attrName === Attribute.VALUE) {
            const rate = Number(newValue);
            setTextContent(this._slotEl, rate === 1 ? 'Normal' : `${rate}x`);
            this._updateFromPlayer();
        }
        if (PlaybackRateRadioButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-playback-rate-radio-button', PlaybackRateRadioButton);
