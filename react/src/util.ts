import { useCallback, useEffect, useState } from 'react';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import type { DefaultUI, UIContainer } from '@theoplayer/web-ui';

export function usePlayer(onReady?: (player: ChromelessPlayer) => void): {
    player: ChromelessPlayer | undefined;
    onReadyEvent: (event: Event) => void;
} {
    const [player, setPlayer] = useState<ChromelessPlayer | undefined>(undefined);

    // Store player once 'theoplayerready' event fires.
    const onReadyEvent = useCallback(
        (event: Event) => {
            const target = event.target as DefaultUI | UIContainer;
            setPlayer(target.player);
        },
        [setPlayer]
    );

    // Call onReady once player is available.
    useEffect(() => {
        if (!player) return;
        onReady?.(player);
    }, [player, onReady]);

    return { player, onReadyEvent };
}
