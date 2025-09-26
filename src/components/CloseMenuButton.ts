import { html, type HTMLTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { Button } from './Button';
import backIcon from '../icons/back.svg';
import { createCustomEvent } from '../util/EventUtils';
import { CLOSE_MENU_EVENT, type CloseMenuEvent } from '../events/CloseMenuEvent';
import { Attribute } from '../util/Attribute';

/**
 * A button that closes its parent menu.
 *
 * This button must be placed inside a {@link Menu | `<theoplayer-menu>`}.
 */
@customElement('theoplayer-menu-close-button')
export class CloseMenuButton extends Button {
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

    protected override render(): HTMLTemplateResult {
        return html`<span part="icon"><slot>${unsafeSVG(backIcon)}</slot></span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-menu-close-button': CloseMenuButton;
    }
}
