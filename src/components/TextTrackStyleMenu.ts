import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { MenuGroup } from './MenuGroup';
import textTrackStyleMenuCss from './TextTrackStyleMenu.css';
import menuTableCss from './MenuTable.css';
import type { EdgeStyle } from 'theoplayer/chromeless';

// Load components used in template
import './TextTrackStyleDisplay';
import './TextTrackStyleRadioGroup';

const colorOptions: ReadonlyArray<{ label: string; value: `rgb(${number},${number},${number})` | '' }> = [
    { label: 'Default', value: '' },
    { label: 'White', value: 'rgb(255,255,255)' },
    { label: 'Yellow', value: 'rgb(255,255,0)' },
    { label: 'Green', value: 'rgb(0,255,0)' },
    { label: 'Cyan', value: 'rgb(0,255,255)' },
    { label: 'Blue', value: 'rgb(0,0,255)' },
    { label: 'Magenta', value: 'rgb(255,0,255)' },
    { label: 'Red', value: 'rgb(255,0,0)' },
    { label: 'Black', value: 'rgb(0,0,0)' }
];
const fontFamilyOptions: ReadonlyArray<{ label: string; value: string }> = [
    { label: 'Default', value: '' },
    { label: 'Monospace Serif', value: '"Courier New", Courier, "Nimbus Mono L", "Cutive Mono", monospace' },
    { label: 'Proportional Serif', value: '"Times New Roman", Times, Georgia, Cambria, "PT Serif Caption", serif' },
    { label: 'Monospace Sans', value: '"Deja Vu Sans Mono", "Lucida Console", Monaco, Consolas, "PT Mono", monospace' },
    { label: 'Proportional Sans', value: 'Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif' }
];
const sizeOptions: ReadonlyArray<{ label: string; value: `${number}%` | '' }> = [
    { label: 'Default', value: '' },
    { label: '50%', value: '50%' },
    { label: '75%', value: '75%' },
    { label: '100%', value: '100%' },
    { label: '150%', value: '150%' },
    { label: '200%', value: '200%' }
];
const opacityOptions: ReadonlyArray<{ label: string; value: `${number}` | '' }> = [
    { label: 'Default', value: '' },
    { label: '25%', value: '25' },
    { label: '50%', value: '50' },
    { label: '75%', value: '75' },
    { label: '100%', value: '100' }
];
const edgeStyleOptions: ReadonlyArray<{ label: string; value: EdgeStyle | '' }> = [
    { label: 'Default', value: '' },
    { label: 'None', value: 'none' },
    { label: 'Drop shadow', value: 'dropshadow' },
    { label: 'Raised', value: 'raised' },
    { label: 'Depressed', value: 'depressed' },
    { label: 'Uniform', value: 'uniform' }
];

/**
 * A menu to change the {@link theoplayer!TextTrackStyle | text track style} of the player.
 *
 * @slot `heading` - A slot for the menu's heading.
 */
@customElement('theoplayer-text-track-style-menu')
export class TextTrackStyleMenu extends MenuGroup {
    static styles = [...MenuGroup.styles, menuTableCss, textTrackStyleMenuCss];

    protected override render(): TemplateResult {
        return html`
            <theoplayer-menu class="theoplayer-text-track-style-menu">
                <span class="theoplayer-menu-heading" slot="heading"><slot name="heading">Subtitle options</slot></span>
                <theoplayer-text-track-style-reset-button
                    class="theoplayer-menu-heading-button"
                    slot="heading"
                ></theoplayer-text-track-style-reset-button>
                <table>
                    <tr>
                        <td><span>Font family</span></td>
                        <td>
                            <theoplayer-menu-button menu="font-family-menu">
                                <theoplayer-text-track-style-display property="fontFamily"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>Font color</span></td>
                        <td>
                            <theoplayer-menu-button menu="font-color-menu">
                                <theoplayer-text-track-style-display property="fontColor"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>Font opacity</span></td>
                        <td>
                            <theoplayer-menu-button menu="font-opacity-menu">
                                <theoplayer-text-track-style-display property="fontOpacity"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>Font size</span></td>
                        <td>
                            <theoplayer-menu-button menu="font-size-menu">
                                <theoplayer-text-track-style-display property="fontSize"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>Background color</span></td>
                        <td>
                            <theoplayer-menu-button menu="background-color-menu">
                                <theoplayer-text-track-style-display property="backgroundColor"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>Background opacity</span></td>
                        <td>
                            <theoplayer-menu-button menu="background-opacity-menu">
                                <theoplayer-text-track-style-display property="backgroundOpacity"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>Window color</span></td>
                        <td>
                            <theoplayer-menu-button menu="window-color-menu">
                                <theoplayer-text-track-style-display property="windowColor"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>Window opacity</span></td>
                        <td>
                            <theoplayer-menu-button menu="window-opacity-menu">
                                <theoplayer-text-track-style-display property="windowOpacity"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>Character edge style</span></td>
                        <td>
                            <theoplayer-menu-button menu="edge-style-menu">
                                <theoplayer-text-track-style-display property="edgeStyle"></theoplayer-text-track-style-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                </table>
            </theoplayer-menu>
            <theoplayer-menu id="font-family-menu" menu-close-on-input hidden>
                <span slot="heading">Font family</span>
                <theoplayer-text-track-style-radio-group property="fontFamily">
                    ${fontFamilyOptions.map(({ label, value }) => html`<theoplayer-radio-button value=${value}>${label}</theoplayer-radio-button> `)}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="font-color-menu" menu-close-on-input hidden>
                <span slot="heading">Font color</span>
                <theoplayer-text-track-style-radio-group property="fontColor">
                    ${colorOptions.map(({ label, value }) => html`<theoplayer-radio-button value=${value}>${label}</theoplayer-radio-button> `)}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="font-opacity-menu" menu-close-on-input hidden>
                <span slot="heading">Font opacity</span>
                <theoplayer-text-track-style-radio-group property="fontOpacity">
                    ${opacityOptions.map(({ label, value }) => html`<theoplayer-radio-button value=${value}>${label}</theoplayer-radio-button> `)}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="font-size-menu" menu-close-on-input hidden>
                <span slot="heading">Font size</span>
                <theoplayer-text-track-style-radio-group property="fontSize">
                    ${sizeOptions.map(({ label, value }) => html`<theoplayer-radio-button value=${value}>${label}</theoplayer-radio-button> `)}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="background-color-menu" menu-close-on-input hidden>
                <span slot="heading">Background color</span>
                <theoplayer-text-track-style-radio-group property="backgroundColor">
                    ${colorOptions.map(({ label, value }) => html`<theoplayer-radio-button value=${value}>${label}</theoplayer-radio-button> `)}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="background-opacity-menu" menu-close-on-input hidden>
                <span slot="heading">Background opacity</span>
                <theoplayer-text-track-style-radio-group property="backgroundOpacity">
                    ${opacityOptions.map(({ label, value }) => html`<theoplayer-radio-button value=${value}>${label}</theoplayer-radio-button> `)}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="window-color-menu" menu-close-on-input hidden>
                <span slot="heading">Window color</span>
                <theoplayer-text-track-style-radio-group property="windowColor">
                    ${colorOptions.map(({ label, value }) => html`<theoplayer-radio-button value=${value}>${label}</theoplayer-radio-button> `)}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="window-opacity-menu" menu-close-on-input hidden>
                <span slot="heading">Window opacity</span>
                <theoplayer-text-track-style-radio-group property="windowOpacity">
                    ${opacityOptions.map(({ label, value }) => html`<theoplayer-radio-button value=${value}>${label}</theoplayer-radio-button> `)}
                </theoplayer-text-track-style-radio-group>
            </theoplayer-menu>
            <theoplayer-menu id="edge-style-menu" menu-close-on-input hidden>
                <span slot="heading">Character edge style</span>
                <theoplayer-text-track-style-radio-group property="edgeStyle">
                    ${edgeStyleOptions.map(({ label, value }) => html`<theoplayer-radio-button value=${value}>${label}</theoplayer-radio-button> `)}
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
