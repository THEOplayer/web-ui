import { MenuGroup, menuGroupTemplate } from './MenuGroup';
import settingsMenuHtml from './SettingsMenu.html';
import menuTableCss from './MenuTable.css';
import './ActiveQualityDisplay';
import './PlaybackRateDisplay';
import './PlaybackRateMenu';

const template = menuGroupTemplate(settingsMenuHtml, menuTableCss);

/**
 * A menu to change the settings of the player, such as the active video quality and the playback speed.
 *
 * @group Components
 */
export class SettingsMenu extends MenuGroup {
    constructor() {
        super({ template });
    }
}

customElements.define('theoplayer-settings-menu', SettingsMenu);
