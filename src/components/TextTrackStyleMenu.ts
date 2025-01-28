import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { MenuGroup } from './MenuGroup';
import textTrackStyleMenuCss from './TextTrackStyleMenu.css';
import menuTableCss from './MenuTable.css';

// Load components used in template
import './TextTrackStyleDisplay';
import './TextTrackStyleRadioGroup';

/**
 * `<theoplayer-text-track-style-menu>` - A menu to change the {@link theoplayer!TextTrackStyle | text track style} of the player.
 *
 * @slot `heading` - A slot for the menu's heading.
 *
 * @group Components
 */
@customElement('theoplayer-text-track-style-menu')
export class TextTrackStyleMenu extends MenuGroup {
    protected override render(): TemplateResult {
        return super.renderMenuGroup(
            html`
                <theoplayer-menu class="theoplayer-text-track-style-menu">
                    <span class="theoplayer-menu-heading" slot="heading"><slot name="heading">Subtitle options</slot></span>
                    <theoplayer-text-track-style-reset-button
                        class="theoplayer-menu-heading-button"
                        slot="heading"
                    ></theoplayer-text-track-style-reset-button>
                    <table class="theoplayer-menu-table">
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
                        <theoplayer-radio-button value="">Default</theoplayer-radio-button>
                        <theoplayer-radio-button value='"Courier New", Courier, "Nimbus Mono L", "Cutive Mono", monospace'
                            >Monospace Serif</theoplayer-radio-button
                        >
                        <theoplayer-radio-button value='"Times New Roman", Times, Georgia, Cambria, "PT Serif Caption", serif'
                            >Proportional Serif</theoplayer-radio-button
                        >
                        <theoplayer-radio-button value='"Deja Vu Sans Mono", "Lucida Console", Monaco, Consolas, "PT Mono", monospace'
                            >Monospace Sans</theoplayer-radio-button
                        >
                        <theoplayer-radio-button value='Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif'
                            >Proportional Sans</theoplayer-radio-button
                        >
                    </theoplayer-text-track-style-radio-group>
                </theoplayer-menu>
                <theoplayer-menu id="font-color-menu" menu-close-on-input hidden>
                    <span slot="heading">Font color</span>
                    <theoplayer-text-track-style-radio-group property="fontColor">
                        <theoplayer-radio-button value="">Default</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(255,255,255)">White</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(255,255,0)">Yellow</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(0,255,0)">Green</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(0,255,255)">Cyan</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(0,0,255)">Blue</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(255,0,255)">Magenta</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(255,0,0)">Red</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(0,0,0)">Black</theoplayer-radio-button>
                    </theoplayer-text-track-style-radio-group>
                </theoplayer-menu>
                <theoplayer-menu id="font-opacity-menu" menu-close-on-input hidden>
                    <span slot="heading">Font opacity</span>
                    <theoplayer-text-track-style-radio-group property="fontOpacity">
                        <theoplayer-radio-button value="">Default</theoplayer-radio-button>
                        <theoplayer-radio-button value="25">25%</theoplayer-radio-button>
                        <theoplayer-radio-button value="50">50%</theoplayer-radio-button>
                        <theoplayer-radio-button value="75">75%</theoplayer-radio-button>
                        <theoplayer-radio-button value="100">100%</theoplayer-radio-button>
                    </theoplayer-text-track-style-radio-group>
                </theoplayer-menu>
                <theoplayer-menu id="font-size-menu" menu-close-on-input hidden>
                    <span slot="heading">Font size</span>
                    <theoplayer-text-track-style-radio-group property="fontSize">
                        <theoplayer-radio-button value="">Default</theoplayer-radio-button>
                        <theoplayer-radio-button value="50%">50%</theoplayer-radio-button>
                        <theoplayer-radio-button value="75%">75%</theoplayer-radio-button>
                        <theoplayer-radio-button value="100%">100%</theoplayer-radio-button>
                        <theoplayer-radio-button value="150%">150%</theoplayer-radio-button>
                        <theoplayer-radio-button value="200%">200%</theoplayer-radio-button>
                    </theoplayer-text-track-style-radio-group>
                </theoplayer-menu>
                <theoplayer-menu id="background-color-menu" menu-close-on-input hidden>
                    <span slot="heading">Background color</span>
                    <theoplayer-text-track-style-radio-group property="backgroundColor">
                        <theoplayer-radio-button value="">Default</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(255,255,255)">White</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(255,255,0)">Yellow</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(0,255,0)">Green</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(0,255,255)">Cyan</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(0,0,255)">Blue</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(255,0,255)">Magenta</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(255,0,0)">Red</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(0,0,0)">Black</theoplayer-radio-button>
                    </theoplayer-text-track-style-radio-group>
                </theoplayer-menu>
                <theoplayer-menu id="background-opacity-menu" menu-close-on-input hidden>
                    <span slot="heading">Background opacity</span>
                    <theoplayer-text-track-style-radio-group property="backgroundOpacity">
                        <theoplayer-radio-button value="">Default</theoplayer-radio-button>
                        <theoplayer-radio-button value="25">25%</theoplayer-radio-button>
                        <theoplayer-radio-button value="50">50%</theoplayer-radio-button>
                        <theoplayer-radio-button value="75">75%</theoplayer-radio-button>
                        <theoplayer-radio-button value="100">100%</theoplayer-radio-button>
                    </theoplayer-text-track-style-radio-group>
                </theoplayer-menu>
                <theoplayer-menu id="window-color-menu" menu-close-on-input hidden>
                    <span slot="heading">Window color</span>
                    <theoplayer-text-track-style-radio-group property="windowColor">
                        <theoplayer-radio-button value="">Default</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(255,255,255)">White</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(255,255,0)">Yellow</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(0,255,0)">Green</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(0,255,255)">Cyan</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(0,0,255)">Blue</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(255,0,255)">Magenta</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(255,0,0)">Red</theoplayer-radio-button>
                        <theoplayer-radio-button value="rgb(0,0,0)">Black</theoplayer-radio-button>
                    </theoplayer-text-track-style-radio-group>
                </theoplayer-menu>
                <theoplayer-menu id="window-opacity-menu" menu-close-on-input hidden>
                    <span slot="heading">Window opacity</span>
                    <theoplayer-text-track-style-radio-group property="windowOpacity">
                        <theoplayer-radio-button value="">Default</theoplayer-radio-button>
                        <theoplayer-radio-button value="25">25%</theoplayer-radio-button>
                        <theoplayer-radio-button value="50">50%</theoplayer-radio-button>
                        <theoplayer-radio-button value="75">75%</theoplayer-radio-button>
                        <theoplayer-radio-button value="100">100%</theoplayer-radio-button>
                    </theoplayer-text-track-style-radio-group>
                </theoplayer-menu>
                <theoplayer-menu id="edge-style-menu" menu-close-on-input hidden>
                    <span slot="heading">Character edge style</span>
                    <theoplayer-text-track-style-radio-group property="edgeStyle">
                        <theoplayer-radio-button value="">Default</theoplayer-radio-button>
                        <theoplayer-radio-button value="none">None</theoplayer-radio-button>
                        <theoplayer-radio-button value="dropshadow">Drop shadow</theoplayer-radio-button>
                        <theoplayer-radio-button value="raised">Raised</theoplayer-radio-button>
                        <theoplayer-radio-button value="depressed">Depressed</theoplayer-radio-button>
                        <theoplayer-radio-button value="uniform">Uniform</theoplayer-radio-button>
                    </theoplayer-text-track-style-radio-group>
                </theoplayer-menu>
            `,
            `${menuTableCss}\n${textTrackStyleMenuCss}`
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-text-track-style-menu': TextTrackStyleMenu;
    }
}
