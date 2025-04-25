import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { RadioGroup } from './RadioGroup';
import verticalRadioGroupCss from './VerticalRadioGroup.css';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer, EdgeStyle, TextTrackStyle } from 'theoplayer/chromeless';
import type { RadioButton } from './RadioButton';
import { createEvent } from '../util/EventUtils';
import { Attribute } from '../util/Attribute';
import { COLOR_BLACK, COLOR_WHITE, colorWithAlpha, parseColor, type RgbaColor, rgbEquals, toRgb, toRgba } from '../util/ColorUtils';
import { createTemplate } from '../util/TemplateUtils';

const template = createTemplate(
    'theoplayer-text-track-style-radio-group',
    `<style>${verticalRadioGroupCss}</style><theoplayer-radio-group><slot></slot></theoplayer-radio-group>`
);

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
 * `<theoplayer-text-track-style-radio-group>` - A radio group that shows a list of values for a text track style option,
 * from which the user can choose a desired value.
 *
 * @attribute `property` - The property name of the text track style option. One of {@link TextTrackStyleOption}.
 * @slot {@link RadioButton} - The possible options for the text track style option.
 *   For example: `<theoplayer-radio-button value="#ff0000">Red</theoplayer-radio-button>`
 * @group Components
 */
@customElement('theoplayer-text-track-style-radio-group')
@stateReceiver(['player'])
export class TextTrackStyleRadioGroup extends LitElement {
    static override styles = [verticalRadioGroupCss];

    private readonly _radioGroupRef: Ref<RadioGroup> = createRef<RadioGroup>();
    private _player: ChromelessPlayer | undefined;
    private _textTrackStyle: TextTrackStyle | undefined;
    private _property: TextTrackStyleOption = 'fontColor';
    private _value: any;

    protected override firstUpdated(): void {
        this._updateChecked();
    }

    /**
     * The property name of the text track style option.
     */
    get property(): TextTrackStyleOption {
        return this._property;
    }

    @property({ reflect: true, type: String, attribute: Attribute.PROPERTY })
    set property(property: TextTrackStyleOption) {
        if (this._property === property) return;
        this._property = property;
        this._updateFromPlayer();
    }

    /**
     * The currently chosen value for the text track style option.
     */
    get value(): string {
        return this._value;
    }

    @property({ reflect: false, attribute: false })
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

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this._textTrackStyle?.removeEventListener('change', this._updateFromPlayer);
        this._player = player;
        this._textTrackStyle = player?.textTrackStyle;
        this._updateFromPlayer();
        this._textTrackStyle?.addEventListener('change', this._updateFromPlayer);
    }

    private get radioGroup_(): RadioGroup | undefined {
        const radioGroup = this._radioGroupRef.value;
        if (radioGroup && !(radioGroup instanceof RadioGroup)) {
            customElements.upgrade(radioGroup);
        }
        return radioGroup;
    }

    private readonly _updateChecked = (): void => {
        const buttons = this.radioGroup_?.allRadioButtons() ?? [];
        for (const button of buttons) {
            button.checked = button.value === this.value;
        }
    };

    private readonly _onChange = (): void => {
        const button = this.radioGroup_?.checkedRadioButton;
        if (button && this.value !== button.value) {
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

    protected override render(): HTMLTemplateResult {
        return html`<theoplayer-radio-group ${ref(this._radioGroupRef)} @change=${this._onChange}
            ><slot @slotchange=${this._updateChecked}></slot
        ></theoplayer-radio-group>`;
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

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-text-track-style-radio-group': TextTrackStyleRadioGroup;
    }
}
