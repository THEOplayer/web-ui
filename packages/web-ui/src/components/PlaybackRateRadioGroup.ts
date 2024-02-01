import * as shadyCss from '@webcomponents/shadycss';
import { RadioGroup } from './RadioGroup';
import verticalRadioGroupCss from './VerticalRadioGroup.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import type { RadioButton } from './RadioButton';
import { createEvent } from '../util/EventUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${verticalRadioGroupCss}</style><theoplayer-radio-group><slot></slot></theoplayer-radio-group>`;
shadyCss.prepareTemplate(template, 'theoplayer-playback-rate-radio-group');

/**
 * `<theoplayer-playback-rate-radio-group>` - A radio group that shows a list of playback rates,
 * from which the user can choose a desired playback rate.
 *
 * @slot {@link RadioButton} - The possible options for the playback rate.
 *   The value of each radio button must be a valid number.
 *   For example: `<theoplayer-radio-button value="2">2x</theoplayer-radio-button>`
 * @group Components
 */
export class PlaybackRateRadioGroup extends StateReceiverMixin(HTMLElement, ['player']) {
    private readonly _radioGroup: RadioGroup;
    private readonly _optionsSlot: HTMLSlotElement;
    private _player: ChromelessPlayer | undefined;
    private _value: number = 1;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._radioGroup = shadowRoot.querySelector('theoplayer-radio-group')!;
        this._optionsSlot = shadowRoot.querySelector('slot')!;

        this._upgradeProperty('value');
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

        if (!(this._radioGroup instanceof RadioGroup)) {
            customElements.upgrade(this._radioGroup);
        }

        this._updateChecked();
        this.shadowRoot!.addEventListener('change', this._onChange);
        this._optionsSlot.addEventListener('slotchange', this._updateChecked);
    }

    disconnectedCallback(): void {
        this.shadowRoot!.removeEventListener('change', this._onChange);
        this._optionsSlot.removeEventListener('slotchange', this._updateChecked);
    }

    /**
     * The currently chosen playback rate.
     */
    get value(): number {
        return this._value;
    }

    set value(value: number) {
        value = Number(value);
        if (this._value === value) {
            return;
        }
        this._value = value;
        if (this._player !== undefined) {
            this._player.playbackRate = value;
        }
        this._updateChecked();
        this.dispatchEvent(createEvent('change', { bubbles: true }));
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

    private readonly _updateChecked = (): void => {
        const buttons = this._radioGroup.allRadioButtons();
        for (const button of buttons) {
            button.checked = Number(button.value) === this.value;
        }
    };

    private readonly _onChange = (): void => {
        const button = this._radioGroup.checkedRadioButton as RadioButton | null;
        if (button !== null && this.value !== Number(button.value)) {
            this.value = button.value;
        }
    };

    private readonly _updateFromPlayer = (): void => {
        if (this._player !== undefined) {
            this.value = this._player.playbackRate;
        }
    };
}

customElements.define('theoplayer-playback-rate-radio-group', PlaybackRateRadioGroup);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-playback-rate-radio-group': PlaybackRateRadioGroup;
    }
}
