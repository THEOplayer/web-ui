import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import slotContainerCss from './SlotContainer.css';

/**
 * A container that can be assigned to a slot,
 * and behaves as if all its children are directly assigned to that slot.
 *
 * This behaves approximately like a regular `<div>` with style `display: contents`,
 * but receives some special treatment from e.g. {@link MenuGroup | `<theoplayer-menu-group>`}
 * which normally expects its {@link Menu | menu}s to be slotted in as direct children.
 * Those menus can also be children of a `<theoplayer-slot-container>` instead.
 *
 * This is an internal component, used mainly by Open Video UI for React.
 * You shouldn't need this under normal circumstances.
 * @internal
 */
@customElement('theoplayer-slot-container')
export class SlotContainer extends LitElement {
    static override styles = [slotContainerCss];

    protected override render(): HTMLTemplateResult {
        return html`<slot></slot>`;
    }
}

export function isSlotContainer(element: Element): element is SlotContainer {
    return element.nodeName.toLowerCase() === 'theoplayer-slot-container';
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-slot-container': SlotContainer;
    }
}
