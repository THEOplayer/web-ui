import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '../context';

/**
 * Returns {@link theoplayer!ChromelessPlayer.muted | the player's muted state}, automatically updating whenever it changes.
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
