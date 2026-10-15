import type { ChromelessPlayer } from 'theoplayer/chromeless';

/**
 * The duration of the stream, limited to the end of the clip (if any).
 */
export function getClipEndTime(player: ChromelessPlayer): number {
    return Math.min(player.duration, player.clip.endTime);
}
