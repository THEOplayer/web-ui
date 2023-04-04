import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import backIcon from '../icons/back.svg';
import { createCustomEvent } from '../util/EventUtils';
import { CLOSE_MENU_EVENT, CloseMenuEvent } from '../events/CloseMenuEvent';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<span part="icon"><slot>${backIcon}</slot></span>`);
shadyCss.prepareTemplate(template, 'theoplayer-menu-close-button');

/**
 * A button that closes its parent menu.
 *
 * This button must be placed inside a {@link Menu | `<theoplayer-menu>`}.
 *
 * @group Components
 */
export class CloseMenuButton extends Button {
    static get observedAttributes() {
        return [...Button.observedAttributes];
    }

    constructor() {
        super({ template });
    }

    override connectedCallback() {
        super.connectedCallback();

        if (!this.hasAttribute(Attribute.ARIA_LABEL)) {
            this.setAttribute(Attribute.ARIA_LABEL, 'close menu');
        }
    }

    protected override handleClick() {
        const event: CloseMenuEvent = createCustomEvent(CLOSE_MENU_EVENT, {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }
}

customElements.define('theoplayer-menu-close-button', CloseMenuButton);
