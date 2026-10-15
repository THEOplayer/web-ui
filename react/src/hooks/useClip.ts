import { useContext, useEffect, useState } from 'react';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { PlayerContext } from '../context';

export interface ClipTimes {
    startTime: number;
    endTime: number;
}

const getClipTimes = (player: ChromelessPlayer | undefined): ClipTimes => ({
    startTime: player?.clip.startTime ?? 0,
    endTime: player?.clip.endTime ?? Infinity
});

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
    const [clip, setClip] = useState<ClipTimes>(() => getClipTimes(player));
    useEffect(() => {
        const update = () => {
            const { startTime, endTime } = getClipTimes(player);
            setClip((prev) => (prev.startTime === startTime && prev.endTime === endTime ? prev : { startTime, endTime }));
        };
        update();
        player?.clip.addEventListener('change', update);
        return () => player?.clip.removeEventListener('change', update);
    }, [player]);
    return clip;
}
