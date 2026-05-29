import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer, EdgeStyle, TextTrackStyle } from 'theoplayer/chromeless';
import { Attribute } from '../util/Attribute';
import { parseColor, toRgb } from '../util/ColorUtils';
import type { TextTrackStyleOption } from './TextTrackStyleRadioGroup';
import { arrayFind } from '../util/CommonUtils';
import { colorOptions, fontFamilyOptions } from '../util/TextTrackStylePresets';
import { getLocale, languageContext, type Locale } from '../i18n';
import { consume } from '@lit/context';

/**
 * A control that displays the value of a single text track style option
 * in a human-readable format.
 */
@customElement('theoplayer-text-track-style-display')
@stateReceiver(['player'])
export class TextTrackStyleDisplay extends LitElement {
    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    @consume({ context: languageContext, subscribe: true })
    accessor lang: string = '';

    private _player: ChromelessPlayer | undefined;
    private _property: TextTrackStyleOption = 'fontColor';
    private _textTrackStyle: TextTrackStyle | undefined;

    /**
     * The property name of the text track style option.
     *
     * One of {@link TextTrackStyleOption}.
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
        const locale = getLocale(this.lang);
        return html`<span>${this.renderValue(locale)}</span>`;
    }

    private renderValue(locale: Locale): string {
        if (this._player === undefined) {
            return '';
        }
        const property = this.property;
        switch (property) {
            case 'fontFamily': {
                return getFontFamilyLabel(this._player.textTrackStyle.fontFamily, locale);
            }
            case 'fontColor':
            case 'backgroundColor':
            case 'windowColor': {
                return getColorLabel(this._player.textTrackStyle[property], locale);
            }
            case 'fontOpacity': {
                return getOpacityLabel(this._player.textTrackStyle.fontColor, locale);
            }
            case 'backgroundOpacity': {
                return getOpacityLabel(this._player.textTrackStyle.backgroundColor, locale);
            }
            case 'windowOpacity': {
                return getOpacityLabel(this._player.textTrackStyle.windowColor, locale);
            }
            case 'edgeStyle': {
                return getEdgeStyleLabel(this._player.textTrackStyle.edgeStyle, locale);
            }
            default: {
                const value = this._player.textTrackStyle[property];
                return value ? value : locale.textTrackStyleDefaultLabel;
            }
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-text-track-style-display': TextTrackStyleDisplay;
    }
}

function getFontFamilyLabel(fontFamily: string | null | undefined, locale: Locale): string {
    if (!fontFamily) {
        return locale.textTrackStyleDefaultLabel;
    }
    const knownFontFamily = arrayFind(fontFamilyOptions, ({ value }) => value === fontFamily);
    if (knownFontFamily) {
        return locale.fontFamilyLabels[knownFontFamily.label] ?? knownFontFamily.label;
    }
    return locale.textTrackStyleCustomLabel;
}

function getColorLabel(color: string | null | undefined, locale: Locale): string {
    if (!color) {
        return locale.textTrackStyleDefaultLabel;
    }
    const parsedColor = parseColor(color);
    if (parsedColor) {
        const colorRgb = toRgb(parsedColor);
        const knownColor = arrayFind(colorOptions, ({ value }) => value === colorRgb);
        if (knownColor) {
            return locale.colorLabels[knownColor.label] ?? knownColor.label;
        }
    }
    return locale.textTrackStyleCustomLabel;
}

function getOpacityLabel(color: string | null | undefined, locale: Locale): string {
    if (!color) {
        return locale.textTrackStyleDefaultLabel;
    }
    const parsedColor = parseColor(color);
    if (parsedColor) {
        return locale.formatPercentage(parsedColor.a_);
    }
    return locale.textTrackStyleCustomLabel;
}

function getEdgeStyleLabel(edgeStyle: EdgeStyle | null | undefined, locale: Locale): string {
    if (!edgeStyle) {
        return locale.textTrackStyleDefaultLabel;
    }
    return locale.edgeStyleLabels[edgeStyle] ?? locale.textTrackStyleCustomLabel;
}
