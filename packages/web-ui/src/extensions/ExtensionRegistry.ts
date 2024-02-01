import type { DefaultUI } from '../DefaultUI';

/**
 * An extension for the default UI.
 *
 * This is called whenever a `<theoplayer-default-ui>` element is created.
 * The extension can then choose to modify this element, for example by appending extra elements
 * or attaching extra event listeners.
 *
 * @example
 * The following extension adds an extra button to the bottom control bar of every default UI:
 * ```javascript
 * THEOplayerUI.registerExtension((ui) => {
 *     // Create a new button
 *     const button = new THEOplayerUI.Button();
 *     button.innerHTML = "Click me!";
 *     button.addEventListener("click", () => alert("I was clicked!"));
 *     // Place it in the bottom control bar
 *     button.slot = "bottom-control-bar";
 *     ui.appendChild(button);
 * });
 * ```
 * See the documentation of `<theoplayer-default-ui>` for more information about the available slots
 * in which you can add extra elements.
 */
export type Extension = (ui: DefaultUI) => void;

const extensionRegistry: Extension[] = [];

/**
 * Registers an extension for the default UI.
 *
 * @param extension The extension.
 * @see {@link Extension}
 */
export function registerExtension(extension: Extension): void {
    extensionRegistry.push(extension);
}

export function applyExtensions(ui: DefaultUI): void {
    for (const extension of extensionRegistry) {
        extension(ui);
    }
}
