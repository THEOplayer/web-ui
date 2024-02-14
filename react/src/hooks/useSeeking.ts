import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '../context';
import type { PlayerEventMap } from 'theoplayer';

const SEEKING_CHANGE_EVENTS = ['seeking', 'seeked', 'emptied'] satisfies ReadonlyArray<keyof PlayerEventMap>;

/**
 * Returns {@link theoplayer!ChromelessPlayer.seeking | the player's seeking state}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link DefaultUI} or {@link UIContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export function useSeeking(): boolean {
    const player = useContext(PlayerContext);
    const subscribe = useCallback(
        (callback: () => void) => {
            player?.addEventListener(SEEKING_CHANGE_EVENTS, callback);
            return () => player?.removeEventListener(SEEKING_CHANGE_EVENTS, callback);
        },
        [player]
    );
    return useSyncExternalStore(
        subscribe,
        () => (player ? player.seeking : false),
        () => false
    );
}
