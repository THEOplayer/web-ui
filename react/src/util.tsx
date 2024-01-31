import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import type { DefaultUI as DefaultUIElement, UIContainer as UIContainerElement } from '@theoplayer/web-ui';

export function usePlayer(onReady?: (player: ChromelessPlayer) => void): {
    player: ChromelessPlayer | undefined;
    setUi: (ui: DefaultUIElement | UIContainerElement | null) => void;
    onReadyHandler: (event: Event) => void;
} {
    const [ui, setUi] = useState<DefaultUIElement | UIContainerElement | null>(null);
    const [player, setPlayer] = useState<ChromelessPlayer | undefined>(undefined);

    // Update player when UI is created, or when 'theoplayerready' event fires.
    useEffect(() => {
        setPlayer(ui?.player);
    }, [ui]);
    const onReadyHandler = useCallback(
        (_event: Event) => {
            setPlayer(ui?.player);
        },
        [ui]
    );

    // Call onReady once player is available.
    useEffect(() => {
        if (!player) return;
        onReady?.(player);
    }, [player, onReady]);

    return { player, setUi, onReadyHandler };
}
