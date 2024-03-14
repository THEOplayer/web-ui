import { createTemplate } from '../util/TemplateUtils';
import slotContainerCss from './SlotContainer.css';

const template = createTemplate('theoplayer-slot-container', `<style>${slotContainerCss}</style><slot></slot>`);

export class SlotContainer extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template().content.cloneNode(true));
    }
}

customElements.define('theoplayer-slot-container', SlotContainer);

export function isSlotContainer(element: Element): element is SlotContainer {
    return element.nodeName.toLowerCase() === 'theoplayer-slot-container';
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-slot-container': SlotContainer;
    }
}
