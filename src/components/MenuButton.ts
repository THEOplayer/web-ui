import { Button } from './Button';
import { createCustomEvent } from '../util/EventUtils';
import { TOGGLE_MENU_EVENT, type ToggleMenuEvent } from '../events/ToggleMenuEvent';
import { Attribute } from '../util/Attribute';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<theoplayer-menu-button>` - A menu button that opens a {@link Menu}.
 *
 * @attribute `menu` - The ID of the menu to open.
 * @group Components
 */
@customElement('theoplayer-menu-button')
export class MenuButton extends Button {
    private _menuId: string | null = null;

    override connectedCallback() {
        super.connectedCallback();

        if (!this.hasAttribute('aria-haspopup')) {
            this.setAttribute('aria-haspopup', 'true');
        }
    }

    /**
     * The ID of the menu to open.
     */
    get menu(): string | null {
        return this._menuId;
    }

    @property({ reflect: true, type: String, attribute: Attribute.MENU })
    set menu(menuId: string | null) {
        if (menuId) {
            if (this._ariaControls == null || this._ariaControls === this._menuId) {
                this._ariaControls = menuId;
            }
        } else {
            if (this._ariaControls === this._menuId) {
                this._ariaControls = null;
            }
        }
        this._menuId = menuId;
    }

    @property({ reflect: true, state: true, type: String, attribute: 'aria-controls' })
    private accessor _ariaControls: string | null = null;

    protected override handleClick() {
        const menu = this.menu;
        if (menu) {
            const event: ToggleMenuEvent = createCustomEvent(TOGGLE_MENU_EVENT, {
                bubbles: true,
                composed: true,
                detail: { menu }
            });
            this.dispatchEvent(event);
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-menu-button': MenuButton;
    }
}
