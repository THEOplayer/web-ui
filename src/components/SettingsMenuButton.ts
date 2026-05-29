import { html, type HTMLTemplateResult, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { MenuButton } from './MenuButton';
import settingsIcon from '../icons/settings.svg';
import { getLocale } from '../i18n';
import { stateReceiver } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';

/**
 * A menu button that opens a {@link SettingsMenu}.
 *
 * @attribute `menu` - The ID of the settings menu.
 */
@customElement('theoplayer-settings-menu-button')
@stateReceiver(['lang'])
export class SettingsMenuButton extends MenuButton {
    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    accessor lang: string = '';

    override willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties);
        this._updateAriaLabel();
    }

    private _updateAriaLabel(): void {
        const locale = getLocale(this.lang);
        this.ariaLabel = locale.openSettingsMenuAria;
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
