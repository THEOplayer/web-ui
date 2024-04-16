import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import type { DefaultUI as DefaultUIElement, UIContainer as UIContainerElement } from '@theoplayer/web-ui';

export function usePlayer(
    ui: DefaultUIElement | UIContainerElement | null,
    onReady?: (player: ChromelessPlayer) => void
): ChromelessPlayer | undefined {
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

    // Destroy player on unmount.
    useEffect(() => {
        return () => player?.destroy();
    }, [player]);

    return player;
}
