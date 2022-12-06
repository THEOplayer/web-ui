import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import closeIcon from '../icons/close.svg';
import { createCustomEvent } from '../util/CustomEvent';
import { CLOSE_MENU_EVENT, CloseMenuEvent } from '../events/CloseMenuEvent';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<span part="icon"><slot>${closeIcon}</slot></span>`);
shadyCss.prepareTemplate(template, 'theoplayer-menu-close-button');

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
