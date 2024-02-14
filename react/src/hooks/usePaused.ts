import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '../context';
import type { ChromelessPlayer, PlayerEventMap } from 'theoplayer';

const PAUSED_CHANGE_EVENTS = ['play', 'pause'] satisfies ReadonlyArray<keyof PlayerEventMap>;

/**
 * Returns [the player's paused state]{@link ChromelessPlayer.source}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link DefaultUI} or {@link UIContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export function usePaused(): boolean {
    const player = useContext(PlayerContext);
    const subscribe = useCallback(
        (callback: () => void) => {
            player?.addEventListener(PAUSED_CHANGE_EVENTS, callback);
            return () => player?.removeEventListener(PAUSED_CHANGE_EVENTS, callback);
        },
        [player]
    );
    return useSyncExternalStore(
        subscribe,
        () => (player ? player.paused : true),
        () => true
    );
}
