import * as shadyCss from '@webcomponents/shadycss';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, EdgeStyle } from 'theoplayer/THEOplayer.chromeless';
import { Attribute } from '../util/Attribute';
import { parseColor, toRgb } from '../util/ColorUtils';
import type { TextTrackStyleOption } from './TextTrackStyleRadioGroup';
import { arrayFind, setTextContent } from '../util/CommonUtils';
import { knownColors, knownEdgeStyles, knownFontFamilies } from '../util/TextTrackStylePresets';

/**
 * Displays the value of a single text track style option in a human-readable format.
 *
 * @attribute `property` - The property name of the text track style option. One of {@link TextTrackStyleOption}.
 * @group Components
 */
export class TextTrackStyleDisplay extends StateReceiverMixin(HTMLElement, ['player']) {
    static get observedAttributes() {
        return [Attribute.PROPERTY];
    }

    private readonly _spanEl: HTMLSpanElement;
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        this._spanEl = document.createElement('span');
        shadowRoot.appendChild(this._spanEl);

        this._upgradeProperty('property');
        this._upgradeProperty('player');
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        if (!this.hasAttribute(Attribute.PROPERTY)) {
            this.property = 'fontColor';
        }
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

    private readonly _updateFromPlayer = (): void => {
        if (this._player === undefined) {
            return;
        }
        const property = this.property;
        switch (property) {
            case 'fontFamily': {
                setTextContent(this._spanEl, getFontFamilyLabel(this._player.textTrackStyle.fontFamily));
                break;
            }
            case 'fontColor':
            case 'backgroundColor':
            case 'windowColor': {
                setTextContent(this._spanEl, getColorLabel(this._player.textTrackStyle[property]));
                break;
            }
            case 'fontOpacity': {
                setTextContent(this._spanEl, getOpacityLabel(this._player.textTrackStyle.fontColor));
                break;
            }
            case 'backgroundOpacity': {
                setTextContent(this._spanEl, getOpacityLabel(this._player.textTrackStyle.backgroundColor));
                break;
            }
            case 'windowOpacity': {
                setTextContent(this._spanEl, getOpacityLabel(this._player.textTrackStyle.windowColor));
                break;
            }
            case 'edgeStyle': {
                setTextContent(this._spanEl, getEdgeStyleLabel(this._player.textTrackStyle.edgeStyle));
                break;
            }
            default: {
                const value = this._player.textTrackStyle[property];
                setTextContent(this._spanEl, value ? value : 'Default');
                break;
            }
        }
    };

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.PROPERTY) {
            this._updateFromPlayer();
        }
        if (TextTrackStyleDisplay.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-text-track-style-display', TextTrackStyleDisplay);

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
