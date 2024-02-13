import { MenuGroup, menuGroupTemplate } from './MenuGroup';
import settingsMenuHtml from './SettingsMenu.html';
import menuTableCss from './MenuTable.css';
import { createTemplate } from '../util/TemplateUtils';

// Load components used in template
import './ActiveQualityDisplay';
import './PlaybackRateDisplay';
import './PlaybackRateMenu';

const template = createTemplate('theoplayer-settings-menu', menuGroupTemplate(settingsMenuHtml, menuTableCss));

/**
 * `<theoplayer-settings-menu>` - A menu to change the settings of the player,
 * such as the active video quality and the playback speed.
 *
 * @slot `heading` - A slot for the menu's heading.
 *
 * @group Components
 */
export class SettingsMenu extends MenuGroup {
    constructor() {
        super({ template: template() });
    }
}

customElements.define('theoplayer-settings-menu', SettingsMenu);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-settings-menu': SettingsMenu;
    }
}
