import { createTemplate } from '../util/TemplateUtils';
import slotContainerCss from './SlotContainer.css';

const template = createTemplate('theoplayer-slot-container', `<style>${slotContainerCss}</style><slot></slot>`);

/**
 * `<theoplayer-slot-container>` - A container that can be assigned to a slot,
 * and behaves as if all its children are directly assigned to that slot.
 *
 * This behaves approximately like a regular `<div>` with style `display: contents`,
 * but receives some special treatment from e.g. {@link MenuGroup | `<theoplayer-menu-group>`}
 * which normally expects its {@link Menu | menu}s to be slotted in as direct children.
 * Those menus can also be children of a `<theoplayer-slot-container>` instead.
 *
 * This is an internal component, used mainly by Open Video UI for React.
 * You shouldn't need this under normal circumstances.
 *
 * @group Components
 * @internal
 */
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
