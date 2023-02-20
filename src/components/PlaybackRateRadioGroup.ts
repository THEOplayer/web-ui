import * as shadyCss from '@webcomponents/shadycss';
import type { RadioGroup } from './RadioGroup';
import verticalRadioGroupCss from './VerticalRadioGroup.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer';
import { Attribute } from '../util/Attribute';
import { fromArrayLike, setTextContent } from '../util/CommonUtils';
import { RadioButton } from './RadioButton';
import './RadioGroup';
import { createEvent } from '../util/EventUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${verticalRadioGroupCss}</style><theoplayer-radio-group></theoplayer-radio-group>`;
shadyCss.prepareTemplate(template, 'theoplayer-playback-rate-radio-group');

const DEFAULT_PLAYBACK_RATES: readonly number[] = [0.25, 0.5, 1, 1.25, 1.5, 2];

/**
 * A radio group that shows a list of playback rates, from which the user can choose a desired playback rate.
 *
 * @attribute values - A comma separated list of playback rates, for example: `0.5,1,2,4`
 */
export class PlaybackRateRadioGroup extends StateReceiverMixin(HTMLElement, ['player']) {
    static get observedAttributes() {
        return [Attribute.VALUES];
    }

    private readonly _radioGroup: RadioGroup;
    private _player: ChromelessPlayer | undefined;
    private _value: number = 1;
    private _values: number[] = [...DEFAULT_PLAYBACK_RATES];

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._radioGroup = shadowRoot.querySelector('theoplayer-radio-group')!;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('value');
        this._upgradeProperty('values');
        this._upgradeProperty('player');

        this._updateValues();
        this.shadowRoot!.addEventListener('change', this._onChange);
    }

    disconnectedCallback(): void {
        this.shadowRoot!.removeEventListener('change', this._onChange);
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    /**
     * The currently chosen playback rate.
     */
    get value(): number {
        return this._value;
    }

    set value(value: number) {
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

    /**
     * The list of playback rate values from which the user can choose.
     */
    get values(): number[] {
        return this._values;
    }

    set values(value: number[]) {
        this.setAttribute(Attribute.VALUES, value.join(','));
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

    private readonly _updateValues = (): void => {
        const buttons = fromArrayLike(this._radioGroup.children) as RadioButton[];
        const values = this.values;
        let i = 0;
        while (i < buttons.length && i < values.length) {
            if (buttons[i].value !== values[i]) {
                const value = values[i];
                buttons[i].value = value;
                setTextContent(buttons[i], value === 1 ? 'Normal' : `${value}x`);
            }
            i++;
        }
        while (i < buttons.length) {
            this._radioGroup.removeChild(buttons[i]);
            i++;
        }
        while (i < values.length) {
            const value = values[i];
            const newButton = new RadioButton();
            newButton.value = value;
            setTextContent(newButton, value === 1 ? 'Normal' : `${value}x`);
            this._radioGroup.appendChild(newButton);
            i++;
        }
        this._updateChecked();
    };

    private readonly _updateChecked = (): void => {
        const buttons = fromArrayLike(this._radioGroup.children) as RadioButton[];
        for (const button of buttons) {
            button.checked = button.value === this.value;
        }
    };

    private readonly _onChange = (): void => {
        const button = this._radioGroup.checkedRadioButton as RadioButton | null;
        if (button !== null && this.value !== button.value) {
            this.value = button.value;
        }
    };

    private readonly _updateFromPlayer = (): void => {
        if (this._player !== undefined) {
            this.value = this._player.playbackRate;
        }
    };

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.VALUES) {
            this._values = newValue
                ? String(newValue)
                      .split(',')
                      .map((x) => Number(x))
                : [...DEFAULT_PLAYBACK_RATES];
            this._updateValues();
        }
        if (PlaybackRateRadioGroup.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-playback-rate-radio-group', PlaybackRateRadioGroup);
