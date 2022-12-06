import type { TextTrack } from 'theoplayer';

export function isSubtitleTrack(track: TextTrack): boolean {
    return track.kind === 'subtitles' || track.kind === 'captions';
}
