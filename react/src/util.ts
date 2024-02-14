import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import type { DefaultUI as DefaultUIElement, UIContainer as UIContainerElement } from '@theoplayer/web-ui';

export function usePlayer(onReady?: (player: ChromelessPlayer) => void): {
    player: ChromelessPlayer | undefined;
    setUi: (ui: DefaultUIElement | UIContainerElement | null) => void;
} {
    const [ui, setUi] = useState<DefaultUIElement | UIContainerElement | null>(null);

    // Update player when UI is created, or when 'theoplayerready' event fires.
    const subscribeReady = useCallback(
        (callback: () => void) => {
            ui?.addEventListener('theoplayerready', callback);
            return () => ui?.removeEventListener('theoplayerready', callback);
        },
        [ui]
    );
    const player = useSyncExternalStore<ChromelessPlayer | undefined>(
        subscribeReady,
        () => ui?.player,
        () => undefined
    );

    // Call onReady once player is available.
    useEffect(() => {
        if (!player) return;
        onReady?.(player);
    }, [player, onReady]);

    return { player, setUi };
}
