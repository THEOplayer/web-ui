import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import { createCustomEvent } from '../util/CustomEvent';
import { OPEN_MENU_EVENT, type OpenMenuEvent } from '../events/OpenMenuEvent';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<slot></slot>`);
shadyCss.prepareTemplate(template, 'theoplayer-menu-button');

const ATTR_MENU = 'menu';

export class MenuButton extends Button {
    static get observedAttributes() {
        return [...Button.observedAttributes, ATTR_MENU];
    }

    constructor() {
        super({ template });
    }

    connectedCallback() {
        super.connectedCallback();

        if (!this.hasAttribute('aria-haspopup')) {
            this.setAttribute('aria-haspopup', 'true');
        }
    }

    get menu(): string | null {
        return this.getAttribute(ATTR_MENU);
    }

    set menu(menuId: string | null) {
        if (menuId) {
            this.setAttribute(ATTR_MENU, menuId);
        } else {
            this.removeAttribute(ATTR_MENU);
        }
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (attrName === ATTR_MENU) {
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
