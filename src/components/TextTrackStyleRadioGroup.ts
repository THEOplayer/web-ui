import * as shadyCss from '@webcomponents/shadycss';
import type { RadioGroup } from './RadioGroup';
import verticalRadioGroupCss from './VerticalRadioGroup.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, EdgeStyle } from 'theoplayer';
import type { RadioButton } from './RadioButton';
import './RadioGroup';
import { createEvent } from '../util/EventUtils';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = `<style>${verticalRadioGroupCss}</style><theoplayer-radio-group><slot></slot></theoplayer-radio-group>`;
shadyCss.prepareTemplate(template, 'theoplayer-text-track-style-radio-group');

export interface TextTrackStyleMap {
    fontFamily: string | undefined;
    fontColor: string | undefined;
    fontSize: string | undefined;
    backgroundColor: string | undefined;
    windowColor: string | undefined;
    edgeStyle: EdgeStyle | undefined;
}

export type TextTrackStyleOption = keyof TextTrackStyleMap;

/**
 * A radio group that shows a list of values for a text track style option, from which the user can choose a desired value.
 *
 * @attribute property - The property name of the text track style option. One of {@link TextTrackStyleOption}.
 * @slot {@link RadioButton} - The possible options for the text track style option.
 *   For example: `<theoplayer-radio-button value="#ff0000">Red</theoplayer-radio-button>`
 */
export class TextTrackStyleRadioGroup extends StateReceiverMixin(HTMLElement, ['player']) {
    static get observedAttributes() {
        return [Attribute.PROPERTY];
    }

    private readonly _radioGroup: RadioGroup;
    private readonly _optionsSlot: HTMLSlotElement;
    private _player: ChromelessPlayer | undefined;
    private _value: any;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._radioGroup = shadowRoot.querySelector('theoplayer-radio-group')!;
        this._optionsSlot = shadowRoot.querySelector('slot')!;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('property');
        this._upgradeProperty('value');
        this._upgradeProperty('player');

        if (!this.hasAttribute(Attribute.PROPERTY)) {
            this.property = 'fontColor';
        }

        this._updateChecked();
        this.shadowRoot!.addEventListener('change', this._onChange);
        this._optionsSlot.addEventListener('slotchange', this._updateChecked);
    }

    disconnectedCallback(): void {
        this.shadowRoot!.removeEventListener('change', this._onChange);
        this._optionsSlot.removeEventListener('slotchange', this._updateChecked);
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    /**
     * The property name of the text track style option.
     */
    get property(): TextTrackStyleOption {
        return this.getAttribute(Attribute.PROPERTY) as TextTrackStyleOption;
    }

    set property(value: TextTrackStyleOption) {
        this.setAttribute(Attribute.PROPERTY, value);
    }

    /**
     * The currently chosen playback rate.
     */
    get value(): TextTrackStyleMap[TextTrackStyleOption] {
        return this._value;
    }

    set value(value: TextTrackStyleMap[TextTrackStyleOption]) {
        if (this._value === value) {
            return;
        }
        this._value = value;
        this._updateToPlayer();
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
            this._player.textTrackStyle.removeEventListener('change', this._updateFromPlayer);
        }
        this._player = player;
        this._updateFromPlayer();
        if (this._player !== undefined) {
            this._player.textTrackStyle.addEventListener('change', this._updateFromPlayer);
        }
    }

    private readonly _updateChecked = (): void => {
        const buttons = this._radioGroup.allRadioButtons();
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
            this.value = this._player.textTrackStyle[this.property];
        }
    };

    private _updateToPlayer(): void {
        if (this._player !== undefined) {
            this._player.textTrackStyle[this.property] = this.value as any;
        }
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.PROPERTY) {
            this._updateFromPlayer();
        }
        if (TextTrackStyleRadioGroup.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-text-track-style-radio-group', TextTrackStyleRadioGroup);
