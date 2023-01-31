import * as shadyCss from '@webcomponents/shadycss';
import { MenuContainer, menuContainerTemplate } from './MenuContainer';
import settingsMenuHtml from './SettingsMenu.html';
import settingsMenuCss from './SettingsMenu.css';
import './ActiveQualityMenuButton';
import './PlaybackRateMenuButton';

const template = document.createElement('template');
template.innerHTML = menuContainerTemplate(settingsMenuHtml, settingsMenuCss);
shadyCss.prepareTemplate(template, 'theoplayer-settings-menu');

export class SettingsMenu extends MenuContainer {
    constructor() {
        super({ template });
    }
}

customElements.define('theoplayer-settings-menu', SettingsMenu);
