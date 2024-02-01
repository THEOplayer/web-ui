import { MenuButton } from './MenuButton';
import { buttonTemplate } from './Button';
import settingsIcon from '../icons/settings.svg';
import * as shadyCss from '@webcomponents/shadycss';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<span part="icon"><slot>${settingsIcon}</slot></span>`);
shadyCss.prepareTemplate(template, 'theoplayer-settings-menu-button');

/**
 * `<theoplayer-settings-menu-button>` - A menu button that opens a {@link SettingsMenu}.
 *
 * @attribute `menu` - The ID of the settings menu.
 * @group Components
 */
export class SettingsMenuButton extends MenuButton {
    constructor() {
        super({ template });
    }

    override connectedCallback() {
        super.connectedCallback();

        if (!this.hasAttribute(Attribute.ARIA_LABEL)) {
            this.setAttribute(Attribute.ARIA_LABEL, 'open settings menu');
        }
    }
}

customElements.define('theoplayer-settings-menu-button', SettingsMenuButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-settings-menu-button': SettingsMenuButton;
    }
}
