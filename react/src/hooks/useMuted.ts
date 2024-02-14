import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '../context';
import type { ChromelessPlayer } from 'theoplayer';

/**
 * Returns [the player's muted state]{@link ChromelessPlayer.muted}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link DefaultUI} or {@link UIContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export function useMuted(): boolean {
    const player = useContext(PlayerContext);
    const subscribe = useCallback(
        (callback: () => void) => {
            player?.addEventListener('volumechange', callback);
            return () => player?.removeEventListener('volumechange', callback);
        },
        [player]
    );
    return useSyncExternalStore(
        subscribe,
        () => (player ? player.muted : false),
        () => false
    );
}
