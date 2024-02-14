import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '../context';
import type { PlayerEventMap } from 'theoplayer';

const DURATION_CHANGE_EVENTS = ['durationchange', 'emptied'] satisfies ReadonlyArray<keyof PlayerEventMap>;

/**
 * Returns {@link theoplayer!ChromelessPlayer.duration | the player's duration}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link DefaultUI} or {@link UIContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export function useDuration(): number {
    const player = useContext(PlayerContext);
    const subscribe = useCallback(
        (callback: () => void) => {
            player?.addEventListener(DURATION_CHANGE_EVENTS, callback);
            return () => player?.removeEventListener(DURATION_CHANGE_EVENTS, callback);
        },
        [player]
    );
    return useSyncExternalStore(
        subscribe,
        () => (player ? player.duration : NaN),
        () => NaN
    );
}
