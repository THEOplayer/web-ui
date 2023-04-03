import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import backIcon from '../icons/back.svg';
import { createCustomEvent } from '../util/EventUtils';
import { CLOSE_MENU_EVENT, CloseMenuEvent } from '../events/CloseMenuEvent';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<span part="icon"><slot>${backIcon}</slot></span>`);
shadyCss.prepareTemplate(template, 'theoplayer-menu-close-button');

/**
 * A button that closes its parent menu.
 *
 * This button must be placed inside a {@link Menu | `<theoplayer-menu>`}.
 */
export class CloseMenuButton extends Button {
    static get observedAttributes() {
        return [...Button.observedAttributes];
    }

    constructor() {
        super({ template });
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
