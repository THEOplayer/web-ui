import * as shadyCss from '@webcomponents/shadycss';
import { Button, ButtonOptions, buttonTemplate } from './Button';
import { createCustomEvent } from '../util/EventUtils';
import { OPEN_MENU_EVENT, type OpenMenuEvent } from '../events/OpenMenuEvent';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<slot></slot>`);
shadyCss.prepareTemplate(template, 'theoplayer-menu-button');

export class MenuButton extends Button {
    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.MENU];
    }

    constructor(options?: Partial<ButtonOptions>) {
        super({ template, ...options });
    }

    override connectedCallback() {
        super.connectedCallback();

        this._upgradeProperty('menu');

        if (!this.hasAttribute('aria-haspopup')) {
            this.setAttribute('aria-haspopup', 'true');
        }
    }

    get menu(): string | null {
        return this.getAttribute(Attribute.MENU);
    }

    set menu(menuId: string | null) {
        if (menuId) {
            this.setAttribute(Attribute.MENU, menuId);
        } else {
            this.removeAttribute(Attribute.MENU);
        }
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (attrName === Attribute.MENU) {
            if (!this.hasAttribute('aria-controls') || this.getAttribute('aria-controls') === oldValue) {
                this.setAttribute('aria-controls', newValue);
            }
        }
    }

    protected override handleClick() {
        const menu = this.menu;
        if (menu) {
            const event: OpenMenuEvent = createCustomEvent(OPEN_MENU_EVENT, {
                bubbles: true,
                composed: true,
                detail: { menu }
            });
            this.dispatchEvent(event);
        }
    }
}

customElements.define('theoplayer-menu-button', MenuButton);
