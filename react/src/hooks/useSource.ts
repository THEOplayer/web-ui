import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '../context';
import type { SourceDescription } from 'theoplayer';

/**
 * Returns {@link theoplayer!ChromelessPlayer.source | the player's source}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link DefaultUI} or {@link UIContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export function useSource(): SourceDescription | undefined {
    const player = useContext(PlayerContext);
    const subscribe = useCallback(
        (callback: () => void) => {
            player?.addEventListener('sourcechange', callback);
            return () => player?.removeEventListener('sourcechange', callback);
        },
        [player]
    );
    return useSyncExternalStore(
        subscribe,
        () => player?.source,
        () => undefined
    );
}
