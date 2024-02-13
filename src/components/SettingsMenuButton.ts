import { MenuButton } from './MenuButton';
import { buttonTemplate } from './Button';
import settingsIcon from '../icons/settings.svg';
import { Attribute } from '../util/Attribute';
import { createTemplate } from '../util/TemplateUtils';

const template = createTemplate('theoplayer-settings-menu-button', buttonTemplate(`<span part="icon"><slot>${settingsIcon}</slot></span>`));

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
