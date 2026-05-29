import type { MediaTrack, Quality, TextTrack, VideoQuality } from 'theoplayer/chromeless';
import type { Locale } from '../i18n';

export function isSubtitleTrack(track: TextTrack): boolean {
    return track.kind === 'subtitles' || track.kind === 'captions';
}

export function isNonForcedSubtitleTrack(track: TextTrack): boolean {
    return isSubtitleTrack(track) && !track.forced;
}

export function getTargetQualities(videoTrack: MediaTrack | undefined): Quality[] | undefined {
    let targetQualities = videoTrack?.targetQuality;
    if (targetQualities !== undefined && !Array.isArray(targetQualities)) {
        targetQualities = [targetQualities];
    }
    return targetQualities;
}

export function formatQualityLabel(locale: Locale, quality: VideoQuality | undefined): string | undefined {
    if (!quality) {
        return undefined;
    }
    if (quality.label && quality.label !== '') {
        return quality.label;
    }
    if (quality.height) {
        return `${quality.height}p`;
    }
    if (quality.bandwidth) {
        return locale.formatBandwidth(quality.bandwidth);
    }
    return undefined;
}
