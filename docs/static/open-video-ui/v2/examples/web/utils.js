/*
 * Utilities for the examples of Open Video UI for Web.
 */

/**
 * Receives messages from the <iframe>'s parent window.
 *
 * Supported message formats for `event.data`:
 * - `{ type: "deviceType", deviceType: "" | "desktop" | "mobile" | "tv" }`
 *   Overrides the player's device type.
 * - `{ type: "source", source: SourceDescription }`
 *   Changes the player's source.
 * - `{ type: "style", style: string }`
 *   Updates the custom CSS style.
 */
window.addEventListener('message', (event) => {
    if (event.origin !== location.origin) return;
    const data = event.data;
    if (typeof data !== 'object' || data == null) return;
    switch (data.type) {
        case 'deviceType': {
            const ui = document.querySelector('theoplayer-default-ui, theoplayer-ui');
            ui?.setAttribute('device-type', data.deviceType);
            break;
        }
        case 'source': {
            const ui = document.querySelector('theoplayer-default-ui, theoplayer-ui');
            if (ui) {
                ui.source = data.source;
            }
            break;
        }
        case 'style': {
            const styleEl = document.querySelector('style#custom-style');
            if (styleEl) {
                styleEl.textContent = data.style;
            }
            break;
        }
    }
});
