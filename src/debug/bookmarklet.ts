import './DebugDisplay';
import './RollingChart';

const uiSelector = 'theoplayer-default-ui, theolive-default-ui, theoplayer-ui';

/**
 * Collect UI elements from a DOM tree and open shadow roots outside matched UIs.
 */
function collectUIElements(root: ParentNode, elements: HTMLElement[]): void {
    for (const element of root.querySelectorAll<HTMLElement>('*')) {
        if (element.matches(uiSelector)) {
            elements.push(element);
        } else if (element.shadowRoot) {
            collectUIElements(element.shadowRoot, elements);
        }
    }
}

/**
 * Find UI elements that expose the debug overlay slot.
 */
function findSupportedUIs(): HTMLElement[] {
    const elements: HTMLElement[] = [];
    collectUIElements(document, elements);
    return elements.filter((element) => element.shadowRoot?.querySelector('slot[name="overlay"]'));
}

/**
 * Toggle a direct-child debug panel or append one to the overlay slot.
 */
function toggleDebugDisplay(ui: HTMLElement): void {
    const display = Array.from(ui.children).find((child): child is HTMLElement => child.localName === 'theoplayer-debug-display');
    if (display) {
        display.hidden = !display.hidden;
        return;
    }
    const newDisplay = document.createElement('theoplayer-debug-display');
    newDisplay.slot = 'overlay';
    ui.append(newDisplay);
}

const supportedUIs = findSupportedUIs();
if (supportedUIs.length === 0) {
    window.alert('No Open Video UI player with debug overlay support found on this page.');
} else {
    for (const ui of supportedUIs) {
        toggleDebugDisplay(ui);
    }
}
