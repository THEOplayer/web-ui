import { useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { PlayerContext } from '../context';

export interface ClipTimes {
    startTime: number;
    endTime: number;
}

const DEFAULT_CLIP: ClipTimes = { startTime: 0, endTime: Infinity };

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
    const getSnapshot = useMemo(() => {
        let snapshot = DEFAULT_CLIP;
        return (): ClipTimes => {
            const startTime = player?.clip.startTime ?? 0;
            const endTime = player?.clip.endTime ?? Infinity;
            if (!Object.is(snapshot.startTime, startTime) || !Object.is(snapshot.endTime, endTime)) {
                snapshot = { startTime, endTime };
            }
            return snapshot;
        };
    }, [player]);
    return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_CLIP);
}
