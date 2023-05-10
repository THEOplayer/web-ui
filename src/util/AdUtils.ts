import type { Ad } from 'theoplayer/THEOplayer.chromeless';

export function isLinearAd(ad: Ad): boolean {
    return ad.type === 'linear';
}
