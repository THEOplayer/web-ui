import { html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MenuGroup } from './MenuGroup';
import menuTableCss from './MenuTable.css';
import { getLocale, languageContext } from '../i18n';
import { consume } from '@lit/context';
import { Attribute } from '../util/Attribute';

// Load components used in template
import './ActiveQualityDisplay';
import './PlaybackRateDisplay';
import './PlaybackRateMenu';

/**
 * A menu to change the settings of the player,
 * such as the active video quality and the playback speed.
 *
 * @slot `heading` - A slot for the menu's heading.
 */
@customElement('theoplayer-settings-menu')
export class SettingsMenu extends MenuGroup {
    static styles = [...MenuGroup.styles, menuTableCss];

    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    @consume({ context: languageContext, subscribe: true })
    accessor lang: string = '';

    protected override render(): TemplateResult {
        const locale = getLocale(this.lang);
        // FIXME: UIContainer doesn't push `lang` through shadow DOM children?
        return html`
            <theoplayer-menu>
                <span slot="heading"><slot name="heading">${locale.settingsMenuHeading}</slot></span>
                <table>
                    <tr>
                        <td><span>${locale.qualityMenuHeading}</span></td>
                        <td>
                            <theoplayer-menu-button menu="quality-menu">
                                <theoplayer-active-quality-display lang=${this.lang}></theoplayer-active-quality-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                    <tr>
                        <td><span>${locale.playbackRateMenuHeading}</span></td>
                        <td>
                            <theoplayer-menu-button menu="playback-rate-menu">
                                <theoplayer-playback-rate-display lang=${this.lang}></theoplayer-playback-rate-display>
                            </theoplayer-menu-button>
                        </td>
                    </tr>
                </table>
            </theoplayer-menu>
            <theoplayer-menu id="quality-menu" menu-close-on-input hidden>
                <span slot="heading">${locale.qualityMenuHeading}</span>
                <theoplayer-quality-radio-group lang=${this.lang}></theoplayer-quality-radio-group>
            </theoplayer-menu>
            <theoplayer-playback-rate-menu id="playback-rate-menu" lang=${this.lang} menu-close-on-input hidden></theoplayer-playback-rate-menu>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-settings-menu': SettingsMenu;
    }
}
