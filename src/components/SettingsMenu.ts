import * as shadyCss from '@webcomponents/shadycss';
import { MenuGroup, menuGroupTemplate } from './MenuGroup';
import settingsMenuHtml from './SettingsMenu.html';
import settingsMenuCss from './SettingsMenu.css';
import './ActiveQualityMenuButton';
import './PlaybackRateMenuButton';

const template = document.createElement('template');
template.innerHTML = menuGroupTemplate(settingsMenuHtml, settingsMenuCss);
shadyCss.prepareTemplate(template, 'theoplayer-settings-menu');

/**
 * A menu to change the settings of the player, such as the active video quality and the playback speed.
 */
export class SettingsMenu extends MenuGroup {
    constructor() {
        super({ template });
    }
}

customElements.define('theoplayer-settings-menu', SettingsMenu);
