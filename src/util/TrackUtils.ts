import type { MediaTrack, Quality, TextTrack, VideoQuality } from 'theoplayer';

export function isSubtitleTrack(track: TextTrack): boolean {
    return track.kind === 'subtitles' || track.kind === 'captions';
}

export function getTargetQualities(videoTrack: MediaTrack | undefined): Quality[] | undefined {
    let targetQualities = videoTrack?.targetQuality;
    if (targetQualities !== undefined && !Array.isArray(targetQualities)) {
        targetQualities = [targetQualities];
    }
    return targetQualities;
}

export function formatQualityLabel(quality: VideoQuality): string | undefined {
    if (quality.label && quality.label !== '') {
        return quality.label;
    }
    if (quality.height) {
        return `${quality.height}p`;
    }
    if (quality.bandwidth) {
        return formatBandwidth(quality);
    }
    return '';
}

function formatBandwidth(quality: VideoQuality): string | undefined {
    if (!quality.bandwidth) {
        return undefined;
    } else if (quality.bandwidth > 1e7) {
        return `${(quality.bandwidth / 1e6).toFixed(0)}Mbps`;
    } else if (quality.bandwidth > 1e6) {
        return `${(quality.bandwidth / 1e6).toFixed(1)}Mbps`;
    } else {
        return `${(quality.bandwidth / 1e3).toFixed(0)}kbps`;
    }
}
