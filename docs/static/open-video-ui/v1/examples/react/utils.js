import { useSyncExternalStore } from 'react';

let source = undefined;
const listeners = [];

function subscribe(cb) {
    listeners.push(cb);
    return () => {
        const index = listeners.indexOf(cb);
        if (index >= 0) listeners.splice(index, 1);
    };
}

/**
 * Receives messages from the <iframe>'s parent window.
 *
 * Supported message formats for `event.data`:
 * - `{ type: "source", source: SourceDescription }`
 *   Changes the player's source.
 */
window.addEventListener('message', (event) => {
    if (event.origin !== location.origin) return;
    const data = event.data;
    if (typeof data !== 'object' || data == null) return;
    switch (data.type) {
        case 'source': {
            // Source description changed
            source = data.source;
            listeners.forEach((listener) => listener());
            break;
        }
    }
});

/**
 * Returns the source description given by the <iframe>'s parent window (if any).
 */
export function useSourceFromParent() {
    return useSyncExternalStore(
        subscribe,
        () => source,
        () => undefined
    );
}
