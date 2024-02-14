import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '../context';
import type { ChromelessPlayer, PlayerEventMap } from 'theoplayer';

const TIME_CHANGE_EVENTS = ['timeupdate', 'seeking', 'seeked', 'emptied'] satisfies ReadonlyArray<keyof PlayerEventMap>;

/**
 * Returns [the player's current time]{@link ChromelessPlayer.currentTime}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link DefaultUI} or {@link UIContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export function useCurrentTime(): number {
    const player = useContext(PlayerContext);
    const subscribe = useCallback(
        (callback: () => void) => {
            player?.addEventListener(TIME_CHANGE_EVENTS, callback);
            return () => player?.removeEventListener(TIME_CHANGE_EVENTS, callback);
        },
        [player]
    );
    return useSyncExternalStore(
        subscribe,
        () => (player ? player.currentTime : 0),
        () => 0
    );
}
