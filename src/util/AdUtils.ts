import type { Ad } from 'theoplayer';

export function isLinearAd(ad: Ad): boolean {
    return ad.type === 'linear';
}
