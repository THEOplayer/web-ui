import * as shadyCss from '@webcomponents/shadycss';
import { RadioGroup } from './RadioGroup';
import verticalRadioGroupCss from './VerticalRadioGroup.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, EdgeStyle } from 'theoplayer';
import type { RadioButton } from './RadioButton';
import { createEvent } from '../util/EventUtils';
import { Attribute } from '../util/Attribute';
import { COLOR_BLACK, COLOR_WHITE, colorWithAlpha, parseColor, RgbaColor, rgbEquals, toRgb, toRgba } from '../util/ColorUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${verticalRadioGroupCss}</style><theoplayer-radio-group><slot></slot></theoplayer-radio-group>`;
shadyCss.prepareTemplate(template, 'theoplayer-text-track-style-radio-group');

export interface TextTrackStyleMap {
    fontFamily: string | undefined;
    fontColor: string | undefined;
    fontOpacity: number | undefined;
    fontSize: string | undefined;
    backgroundColor: string | undefined;
    backgroundOpacity: number | undefined;
    windowColor: string | undefined;
    windowOpacity: number | undefined;
    edgeStyle: EdgeStyle | undefined;
}

export type TextTrackStyleOption = keyof TextTrackStyleMap;

/**
 * A radio group that shows a list of values for a text track style option, from which the user can choose a desired value.
 *
 * @attribute `property` - The property name of the text track style option. One of {@link TextTrackStyleOption}.
 * @slot {@link RadioButton} - The possible options for the text track style option.
 *   For example: `<theoplayer-radio-button value="#ff0000">Red</theoplayer-radio-button>`
 * @group Components
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

        if (!(this._radioGroup instanceof RadioGroup)) {
            customElements.upgrade(this._radioGroup);
        }

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
     * The currently chosen value for the text track style option.
     */
    get value(): string {
        return this._value;
    }

    set value(value: string) {
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
        if (this._player === undefined) {
            return;
        }
        switch (this.property) {
            case 'fontColor': {
                const color = this._player.textTrackStyle.fontColor;
                this.value = color ? toRgb(parseColor(color) ?? COLOR_WHITE) : '';
                break;
            }
            case 'backgroundColor': {
                const color = this._player.textTrackStyle.backgroundColor;
                this.value = color ? toRgb(parseColor(color) ?? COLOR_BLACK) : '';
                break;
            }
            case 'windowColor': {
                const color = this._player.textTrackStyle.windowColor;
                this.value = color ? toRgb(parseColor(color) ?? COLOR_BLACK) : '';
                break;
            }
            case 'fontOpacity': {
                const color = this._player.textTrackStyle.fontColor;
                this.value = color ? String((parseColor(color)?.a_ ?? 1) * 100) : '';
                break;
            }
            case 'backgroundOpacity': {
                const color = this._player.textTrackStyle.backgroundColor;
                this.value = color ? String((parseColor(color)?.a_ ?? 1) * 100) : '';
                break;
            }
            case 'windowOpacity': {
                const color = this._player.textTrackStyle.windowColor;
                this.value = color ? String((parseColor(color)?.a_ ?? 1) * 100) : '';
                break;
            }
            default: {
                this.value = this._player.textTrackStyle[this.property] ?? '';
                break;
            }
        }
    };

    private _updateToPlayer(): void {
        if (this._player === undefined) {
            return;
        }
        switch (this.property) {
            case 'fontColor': {
                this._player.textTrackStyle.fontColor = updateColor(this.value, this._player.textTrackStyle.fontColor, COLOR_WHITE);
                break;
            }
            case 'backgroundColor': {
                this._player.textTrackStyle.backgroundColor = updateColor(this.value, this._player.textTrackStyle.backgroundColor, COLOR_BLACK);
                break;
            }
            case 'windowColor': {
                this._player.textTrackStyle.windowColor = updateColor(this.value, this._player.textTrackStyle.windowColor, COLOR_BLACK);
                break;
            }
            case 'fontOpacity': {
                this._player.textTrackStyle.fontColor = updateOpacity(this.value, this._player.textTrackStyle.fontColor, COLOR_WHITE);
                break;
            }
            case 'backgroundOpacity': {
                this._player.textTrackStyle.backgroundColor = updateOpacity(this.value, this._player.textTrackStyle.backgroundColor, COLOR_BLACK);
                break;
            }
            case 'windowOpacity': {
                this._player.textTrackStyle.windowColor = updateOpacity(this.value, this._player.textTrackStyle.windowColor, COLOR_BLACK);
                break;
            }
            default: {
                this._player.textTrackStyle[this.property] = this.value == '' ? undefined : (this.value as any);
                break;
            }
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

function updateColor(colorValue: string, previousColor: string | undefined, defaultColor: RgbaColor): string | undefined {
    const alpha = parseColor(previousColor)?.a_ ?? 1;
    if (colorValue === '' && alpha === 1) {
        return undefined;
    } else {
        const color = parseColor(colorValue) ?? defaultColor;
        return toRgba(colorWithAlpha(color, alpha));
    }
}

function updateOpacity(opacityValue: string, colorValue: string | undefined, defaultColor: RgbaColor): string | undefined {
    const color = parseColor(colorValue) ?? defaultColor;
    if (opacityValue === '' && rgbEquals(color, defaultColor)) {
        return undefined;
    } else {
        const alpha = opacityValue == '' ? 1 : Number(opacityValue) / 100;
        return toRgba(colorWithAlpha(color, alpha));
    }
}

customElements.define('theoplayer-text-track-style-radio-group', TextTrackStyleRadioGroup);
