import { useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { PlayerContext } from '../context';

export interface ClipTimes {
    startTime: number;
    endTime: number;
}

/**
 * Returns the start and end time of {@link theoplayer!ChromelessPlayer.clip | the player's clip}, automatically updating whenever it changes.
 *
 * Without a clip, the start time is 0 and the end time is `Infinity`.
 * Note that {@link useDuration} and {@link useCurrentTime} are not relative to the clip.
 *
 * This hook must only be used in a component mounted inside a {@link DefaultUI} or {@link UIContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export function useClip(): ClipTimes {
    const player = useContext(PlayerContext);
    const subscribe = useCallback(
        (callback: () => void) => {
            player?.clip.addEventListener('change', callback);
            return () => player?.clip.removeEventListener('change', callback);
        },
        [player]
    );
    const startTime = useSyncExternalStore(
        subscribe,
        () => player?.clip.startTime ?? 0,
        () => 0
    );
    const endTime = useSyncExternalStore(
        subscribe,
        () => player?.clip.endTime ?? Infinity,
        () => Infinity
    );
    return useMemo(() => ({ startTime, endTime }), [startTime, endTime]);
}
