import type { Ad } from 'theoplayer/chromeless';

export function isLinearAd(ad: Ad): boolean {
    return ad.type === 'linear';
}
