import { html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MenuGroup } from './MenuGroup';
import textTrackStyleMenuCss from './TextTrackStyleMenu.css';
import menuTableCss from './MenuTable.css';
import type { EdgeStyle } from 'theoplayer/chromeless';
import { getLocale, type KnownColor, type KnownFontFamily } from '../i18n';
import { stateReceiver } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';

// Load components used in template
import './TextTrackStyleDisplay';
import './TextTrackStyleRadioGroup';

const colorOptions: ReadonlyArray<{ label: KnownColor; value: `rgb(${number},${number},${number})` | '' }> = [
    { label: 'White', value: 'rgb(255,255,255)' },
    { label: 'Yellow', value: 'rgb(255,255,0)' },
    { label: 'Green', value: 'rgb(0,255,0)' },
    { label: 'Cyan', value: 'rgb(0,255,255)' },
    { label: 'Blue', value: 'rgb(0,0,255)' },
    { label: 'Magenta', value: 'rgb(255,0,255)' },
    { label: 'Red', value: 'rgb(255,0,0)' },
    { label: 'Black', value: 'rgb(0,0,0)' }
];
const fontFamilyOptions: ReadonlyArray<{ label: KnownFontFamily; value: string }> = [
    { label: 'Monospace Serif', value: '"Courier New", Courier, "Nimbus Mono L", "Cutive Mono", monospace' },
    { label: 'Proportional Serif', value: '"Times New Roman", Times, Georgia, Cambria, "PT Serif Caption", serif' },
    { label: 'Monospace Sans', value: '"Deja Vu Sans Mono", "Lucida Console", Monaco, Consolas, "PT Mono", monospace' },
    { label: 'Proportional Sans', value: 'Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif' }
];
const sizeOptions: ReadonlyArray<number> = [0.5, 0.75, 1.0, 1.5, 2.0];
const opacityOptions: ReadonlyArray<number> = [0.25, 0.5, 0.75, 1.0];
const edgeStyleOptions: ReadonlyArray<EdgeStyle> = ['none', 'dropshadow', 'raised', 'depressed', 'uniform'];

/**
 * A menu to change the {@link theoplayer!TextTrackStyle | text track style} of the player.
 *
 * @slot `heading` - A slot for the menu's heading.
 */
@customElement('theoplayer-text-track-style-menu')
@stateReceiver(['lang'])
export class TextTrackStyleMenu extends MenuGroup {
    static styles = [...MenuGroup.styles, menuTableCss, textTrackStyleMenuCss];

    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    accessor lang: string = '';

    protected override render(): TemplateResult {
        const locale = getLocale(this.lang);
        return html`
            <theoplayer-menu class="theoplayer-text-track-style-menu">
                <span class="theoplayer-menu-heading" slot="heading"><slot name="heading">${locale.textTrackStyleMenuHeading}</slot></span>
                <theoplayer-text-track-style-reset-button
                    class="theoplayer-menu-heading-button"
                    slot="heading"
                ></theoplayer-text-track-style-reset-button>
                <table>
                    <tr>
                        <td><span>${locale.textTrackStyleFontFamily}</span></td>
                        <td>
                            <theoplayer-menu-button menu="font-family-menu">
                                <theoplayer-text-track-style-display property="fontFamily"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>${locale.textTrackStyleFontColor}</span></td>
                        <td>
                            <theoplayer-menu-button menu="font-color-menu">
                                <theoplayer-text-track-style-display property="fontColor"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>${locale.textTrackStyleFontOpacity}</span></td>
                        <td>
                            <theoplayer-menu-button menu="font-opacity-menu">
                                <theoplayer-text-track-style-display property="fontOpacity"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>${locale.textTrackStyleFontSize}</span></td>
                        <td>
                            <theoplayer-menu-button menu="font-size-menu">
                                <theoplayer-text-track-style-display property="fontSize"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>${locale.textTrackStyleBackgroundColor}</span></td>
                        <td>
                            <theoplayer-menu-button menu="background-color-menu">
                                <theoplayer-text-track-style-display property="backgroundColor"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>${locale.textTrackStyleBackgroundOpacity}</span></td>
                        <td>
                            <theoplayer-menu-button menu="background-opacity-menu">
                                <theoplayer-text-track-style-display property="backgroundOpacity"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>${locale.textTrackStyleWindowColor}</span></td>
                        <td>
                            <theoplayer-menu-button menu="window-color-menu">
                                <theoplayer-text-track-style-display property="windowColor"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>${locale.textTrackStyleWindowOpacity}</span></td>
                        <td>
                            <theoplayer-menu-button menu="window-opacity-menu">
                                <theoplayer-text-track-style-display property="windowOpacity"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>${locale.textTrackStyleEdgeStyle}</span></td>
                        <td>
                            <theoplayer-menu-button menu="edge-style-menu">
                                <theoplayer-text-track-style-display property="edgeStyle"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                </table>
            </theoplayer-menu>
            <theoplayer-menu id="font-family-menu" menu-close-on-input hidden>
                <span slot="heading">${locale.textTrackStyleFontFamily}</span>
                <theoplayer-text-track-style-radio-group property="fontFamily">
                    <theoplayer-radio-button value="">${locale.textTrackStyleDefaultLabel}</theoplayer-radio-button>
                    ${fontFamilyOptions.map(
                        ({ label, value }) =>
                            html`<theoplayer-radio-button value=${value}>${locale.fontFamilyLabels[label] ?? label}</theoplayer-radio-button> `
                    )}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="font-color-menu" menu-close-on-input hidden>
                <span slot="heading">${locale.textTrackStyleFontColor}</span>
                <theoplayer-text-track-style-radio-group property="fontColor">
                    <theoplayer-radio-button value="">${locale.textTrackStyleDefaultLabel}</theoplayer-radio-button>
                    ${colorOptions.map(
                        ({ label, value }) =>
                            html`<theoplayer-radio-button value=${value}>${locale.colorLabels[label] ?? label}</theoplayer-radio-button> `
                    )}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="font-opacity-menu" menu-close-on-input hidden>
                <span slot="heading">${locale.textTrackStyleFontOpacity}</span>
                <theoplayer-text-track-style-radio-group property="fontOpacity">
                    <theoplayer-radio-button value="">${locale.textTrackStyleDefaultLabel}</theoplayer-radio-button>
                    ${opacityOptions.map(
                        (value) => html`<theoplayer-radio-button value=${value * 100}>${locale.formatPercentage(value)}</theoplayer-radio-button> `
                    )}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="font-size-menu" menu-close-on-input hidden>
                <span slot="heading">${locale.textTrackStyleFontSize}</span>
                <theoplayer-text-track-style-radio-group property="fontSize">
                    <theoplayer-radio-button value="">${locale.textTrackStyleDefaultLabel}</theoplayer-radio-button>
                    ${sizeOptions.map(
                        (value) => html`<theoplayer-radio-button value=${value * 100}>${locale.formatPercentage(value)}</theoplayer-radio-button> `
                    )}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="background-color-menu" menu-close-on-input hidden>
                <span slot="heading">${locale.textTrackStyleBackgroundColor}</span>
                <theoplayer-text-track-style-radio-group property="backgroundColor">
                    <theoplayer-radio-button value="">${locale.textTrackStyleDefaultLabel}</theoplayer-radio-button>
                    ${colorOptions.map(
                        ({ label, value }) =>
                            html`<theoplayer-radio-button value=${value}>${locale.colorLabels[label] ?? label}</theoplayer-radio-button> `
                    )}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="background-opacity-menu" menu-close-on-input hidden>
                <span slot="heading">${locale.textTrackStyleBackgroundOpacity}</span>
                <theoplayer-text-track-style-radio-group property="backgroundOpacity">
                    <theoplayer-radio-button value="">${locale.textTrackStyleDefaultLabel}</theoplayer-radio-button>
                    ${opacityOptions.map(
                        (value) => html`<theoplayer-radio-button value=${value * 100}>${locale.formatPercentage(value)}</theoplayer-radio-button> `
                    )}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="window-color-menu" menu-close-on-input hidden>
                <span slot="heading">${locale.textTrackStyleWindowColor}</span>
                <theoplayer-text-track-style-radio-group property="windowColor">
                    <theoplayer-radio-button value="">${locale.textTrackStyleDefaultLabel}</theoplayer-radio-button>
                    ${colorOptions.map(
                        ({ label, value }) =>
                            html`<theoplayer-radio-button value=${value}>${locale.colorLabels[label] ?? label}</theoplayer-radio-button> `
                    )}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="window-opacity-menu" menu-close-on-input hidden>
                <span slot="heading">${locale.textTrackStyleWindowOpacity}</span>
                <theoplayer-text-track-style-radio-group property="windowOpacity">
                    <theoplayer-radio-button value="">${locale.textTrackStyleDefaultLabel}</theoplayer-radio-button>
                    ${opacityOptions.map(
                        (value) => html`<theoplayer-radio-button value=${value * 100}>${locale.formatPercentage(value)}</theoplayer-radio-button> `
                    )}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="edge-style-menu" menu-close-on-input hidden>
                <span slot="heading">${locale.textTrackStyleEdgeStyle}</span>
                <theoplayer-text-track-style-radio-group property="edgeStyle">
                    <theoplayer-radio-button value="">${locale.textTrackStyleDefaultLabel}</theoplayer-radio-button>
                    ${edgeStyleOptions.map(
                        (value) => html`<theoplayer-radio-button value=${value}>${locale.edgeStyleLabels[value] ?? value}</theoplayer-radio-button> `
                    )}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-text-track-style-menu': TextTrackStyleMenu;
    }
}
