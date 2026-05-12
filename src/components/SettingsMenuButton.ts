import { html, type HTMLTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { MenuButton } from './MenuButton';
import settingsIcon from '../icons/settings.svg';

/**
 * A menu button that opens a {@link SettingsMenu}.
 *
 * @attribute `menu` - The ID of the settings menu.
 */
@customElement('theoplayer-settings-menu-button')
export class SettingsMenuButton extends MenuButton {
    override connectedCallback() {
        super.connectedCallback();

        if (this.ariaLabel == null) {
            this.ariaLabel = 'open settings menu';
        }
    }

    protected override render(): HTMLTemplateResult {
        return html`<span part="icon"><slot>${unsafeSVG(settingsIcon)}</slot></span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-settings-menu-button': SettingsMenuButton;
    }
}
