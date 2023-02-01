import * as shadyCss from '@webcomponents/shadycss';
import { MenuGroup, menuGroupTemplate } from './MenuGroup';
import settingsMenuHtml from './SettingsMenu.html';
import settingsMenuCss from './SettingsMenu.css';
import './ActiveQualityMenuButton';
import './PlaybackRateMenuButton';

const template = document.createElement('template');
template.innerHTML = menuGroupTemplate(settingsMenuHtml, settingsMenuCss);
shadyCss.prepareTemplate(template, 'theoplayer-settings-menu');

export class SettingsMenu extends MenuGroup {
    constructor() {
        super({ template });
    }
}

customElements.define('theoplayer-settings-menu', SettingsMenu);
