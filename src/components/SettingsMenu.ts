import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { MenuGroup } from './MenuGroup';
import menuTableCss from './MenuTable.css';

// Load components used in template
import './ActiveQualityDisplay';
import './PlaybackRateDisplay';
import './PlaybackRateMenu';

/**
 * `<theoplayer-settings-menu>` - A menu to change the settings of the player,
 * such as the active video quality and the playback speed.
 *
 * @slot `heading` - A slot for the menu's heading.
 *
 * @group Components
 */
@customElement('theoplayer-settings-menu')
export class SettingsMenu extends MenuGroup {
    protected override render(): TemplateResult {
        return this.renderMenuGroup(
            html`
                <theoplayer-menu>
                    <span slot="heading"><slot name="heading">Settings</slot></span>
                    <div class="theoplayer-menu-table">
                        <span>Quality</span>
                        <theoplayer-menu-button menu="quality-menu">
                            <theoplayer-active-quality-display></theoplayer-active-quality-display>
                        </theoplayer-menu-button>
                        <span>Playback speed</span>
                        <theoplayer-menu-button menu="playback-rate-menu">
                            <theoplayer-playback-rate-display></theoplayer-playback-rate-display>
                        </theoplayer-menu-button>
                    </div>
                </theoplayer-menu>
                <theoplayer-menu id="quality-menu" menu-close-on-input hidden>
                    <span slot="heading">Quality</span>
                    <theoplayer-quality-radio-group></theoplayer-quality-radio-group>
                </theoplayer-menu>
                <theoplayer-playback-rate-menu id="playback-rate-menu" menu-close-on-input hidden>
                    <span slot="heading">Playback speed</span>
                </theoplayer-playback-rate-menu>
            `,
            menuTableCss
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-settings-menu': SettingsMenu;
    }
}
