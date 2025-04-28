import { useCallback, useContext, useState, useSyncExternalStore } from 'react';
import { PlayerContext } from '../context';
import type { PlayerEventMap } from 'theoplayer/chromeless';

const TIME_CHANGE_EVENTS = ['timeupdate', 'seeking', 'seeked', 'emptied'] satisfies ReadonlyArray<keyof PlayerEventMap>;

/**
 * Returns {@link theoplayer!ChromelessPlayer.currentTime | the player's current time}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link DefaultUI} or {@link UIContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export function useCurrentTime(): number {
    const player = useContext(PlayerContext);
    const [currentTime, setCurrentTime] = useState(player ? player.currentTime : 0);
    const subscribe = useCallback(
        (callback: () => void) => {
            const listener = () => {
                setCurrentTime(player!.currentTime);
                callback();
            };
            player?.addEventListener(TIME_CHANGE_EVENTS, listener);
            return () => player?.removeEventListener(TIME_CHANGE_EVENTS, listener);
        },
        [player]
    );
    return useSyncExternalStore(
        subscribe,
        () => currentTime,
        () => currentTime
    );
}
