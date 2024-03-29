/**
 * User-Agent Client Hints
 * https://wicg.github.io/ua-client-hints/
 */
interface NavigatorUA extends Navigator {
    readonly userAgentData: NavigatorUAData;
}

interface NavigatorUAData {
    readonly mobile: boolean;
}

export function isMobile(): boolean {
    if (typeof navigator !== 'object') {
        return false;
    }
    if ((navigator as NavigatorUA).userAgentData) {
        return (navigator as NavigatorUA).userAgentData.mobile;
    }
    const userAgent = navigator.userAgent;
    if (!userAgent) {
        return false;
    }
    return /Android|iPhone|iPad|iPod|Mobile Safari|Windows Phone/i.test(userAgent);
}

export function isTv(): boolean {
    if (typeof navigator !== 'object') {
        return false;
    }
    const userAgent = navigator.userAgent;
    if (!userAgent) {
        return false;
    }
    return /\b(tv|smart-tv|smarttv|appletv|crkey|googletv|hbbtv|pov_tv|roku|viera|nettv|philipstv)\b/i.test(userAgent);
}
