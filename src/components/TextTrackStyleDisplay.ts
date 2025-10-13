import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer, EdgeStyle, TextTrackStyle } from 'theoplayer/chromeless';
import { Attribute } from '../util/Attribute';
import { parseColor, toRgb } from '../util/ColorUtils';
import type { TextTrackStyleOption } from './TextTrackStyleRadioGroup';
import { arrayFind } from '../util/CommonUtils';
import { knownColors, knownEdgeStyles, knownFontFamilies } from '../util/TextTrackStylePresets';

/**
 * A control that displays the value of a single text track style option
 * in a human-readable format.
 *
 * @attribute `property` - The property name of the text track style option. One of {@link TextTrackStyleOption}.
 */
@customElement('theoplayer-text-track-style-display')
@stateReceiver(['player'])
export class TextTrackStyleDisplay extends LitElement {
    private _player: ChromelessPlayer | undefined;
    private _property: TextTrackStyleOption = 'fontColor';
    private _textTrackStyle: TextTrackStyle | undefined;

    /**
     * The property name of the text track style option.
     */
    get property(): TextTrackStyleOption {
        return this._property;
    }

    @property({ reflect: true, type: String, attribute: Attribute.PROPERTY })
    set property(property: TextTrackStyleOption) {
        this._property = property;
        this._updateFromPlayer();
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

    private readonly _updateFromPlayer = () => this.requestUpdate();

    protected override render(): HTMLTemplateResult {
        return html`<span>${this.renderValue()}</span>`;
    }

    private renderValue(): string {
        if (this._player === undefined) {
            return '';
        }
        const property = this.property;
        switch (property) {
            case 'fontFamily': {
                return getFontFamilyLabel(this._player.textTrackStyle.fontFamily);
            }
            case 'fontColor':
            case 'backgroundColor':
            case 'windowColor': {
                return getColorLabel(this._player.textTrackStyle[property]);
            }
            case 'fontOpacity': {
                return getOpacityLabel(this._player.textTrackStyle.fontColor);
            }
            case 'backgroundOpacity': {
                return getOpacityLabel(this._player.textTrackStyle.backgroundColor);
            }
            case 'windowOpacity': {
                return getOpacityLabel(this._player.textTrackStyle.windowColor);
            }
            case 'edgeStyle': {
                return getEdgeStyleLabel(this._player.textTrackStyle.edgeStyle);
            }
            default: {
                const value = this._player.textTrackStyle[property];
                return value ? value : 'Default';
            }
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-text-track-style-display': TextTrackStyleDisplay;
    }
}

function getFontFamilyLabel(fontFamily: string | null | undefined): string {
    if (!fontFamily) {
        return 'Default';
    }
    const knownFontFamily = arrayFind(knownFontFamilies, ([_, value]) => value === fontFamily);
    if (knownFontFamily) {
        return knownFontFamily[0];
    }
    return 'Custom';
}

function getColorLabel(color: string | null | undefined): string {
    if (!color) {
        return 'Default';
    }
    const parsedColor = parseColor(color);
    if (parsedColor) {
        const colorRgb = toRgb(parsedColor);
        const knownColor = arrayFind(knownColors, ([_, value]) => value === colorRgb);
        if (knownColor) {
            return knownColor[0];
        }
    }
    return 'Custom';
}

function getOpacityLabel(color: string | null | undefined): string {
    if (!color) {
        return 'Default';
    }
    const parsedColor = parseColor(color);
    if (parsedColor) {
        return `${parsedColor.a_ * 100}%`;
    }
    return 'Custom';
}

function getEdgeStyleLabel(edgeStyle: EdgeStyle | null | undefined): string {
    if (!edgeStyle) {
        return 'Default';
    }
    const knownEdgeStyle = arrayFind(knownEdgeStyles, ([_, value]) => value === edgeStyle);
    if (knownEdgeStyle) {
        return knownEdgeStyle[0];
    }
    return 'Custom';
}
