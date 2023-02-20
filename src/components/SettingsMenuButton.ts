import { MenuButton } from './MenuButton';
import { buttonTemplate } from './Button';
import settingsIcon from '../icons/settings.svg';
import * as shadyCss from '@webcomponents/shadycss';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<span part="icon"><slot>${settingsIcon}</slot></span>`);
shadyCss.prepareTemplate(template, 'theoplayer-settings-menu-button');

/**
 * A menu button that opens a [settings menu]{@link SettingsMenu}.
 *
 * @attribute menu - The ID of the settings menu.
 */
export class SettingsMenuButton extends MenuButton {
    constructor() {
        super({ template });
    }
}

customElements.define('theoplayer-settings-menu-button', SettingsMenuButton);
