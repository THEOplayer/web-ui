import { durationFormatterForLocale } from './DurationFormatter';
import { percentageFormatterForLocale } from './PercentageFormatter';
import type {
    AdClickThroughButton,
    AdCountdown,
    AdDisplay,
    AdSkipButton,
    AirPlayButton,
    BadNetworkModeButton,
    ChromecastButton,
    CloseMenuButton,
    FullscreenButton,
    LanguageMenuButton,
    LiveButton,
    MuteButton,
    PlaybackRateMenuButton,
    PlayButton,
    SeekButton,
    SettingsMenuButton,
    TimeRange,
    VolumeRange
} from '../components';

export interface Locale {
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link PlayButton} when it is showing a "play" button,
     * i.e. when the player is paused.
     */
    playAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link PlayButton} when it is showing a "pause" button
     * i.e. when the player is playing.
     */
    pauseAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link PlayButton} when it is showing a "replay" button
     * i.e. when the player is paused at the end of the stream.
     */
    replayAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link MuteButton} when it is showing a "mute" button.
     */
    muteAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link MuteButton} when it is showing an "unmute" button.
     */
    unmuteAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link VolumeRange}.
     */
    volumeAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link TimeRange}.
     */
    seekAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link SeekButton} with a positive {@link SeekButton.seekOffset}.
     *
     * @param offset An offset that was formatted with {@link formatDuration}.
     */
    seekForwardAria(offset: string): string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link SeekButton} with a negative {@link SeekButton.seekOffset}.
     *
     * @param offset An offset that was formatted with {@link formatDuration}.
     */
    seekBackwardAria(offset: string): string;
    /**
     * The text on a {@link LiveButton}, e.g. "LIVE".
     */
    live: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link LiveButton}.
     */
    seekToLiveAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link FullscreenButton}.
     */
    fullscreenAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link FullscreenButton} when in fullscreen mode.
     */
    fullscreenExitAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link AirPlayButton}.
     */
    airplayAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link AirPlayButton} when it is connected to AirPlay.
     */
    airplayConnectedAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link ChromecastButton}.
     */
    chromecastAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link ChromecastButton} when it is connected to Chromecast.
     */
    chromecastConnectedAria: string;
    /**
     * The text on an {@link AdDisplay}, e.g. "Ad".
     */
    adText: string;
    /**
     * The text on an {@link AdDisplay} when playing multiple ads in an ad break, e.g. "Ad X of Y".
     *
     * @param currentAd The number of the currently playing ad.
     * @param totalAds The total number of ads in the current ad break.
     */
    adBreakText(currentAd: number, totalAds: number): string;
    /**
     * The text on an {@link AdClickThroughButton}, e.g. "Visit Advertiser".
     */
    adClickThroughText: string;
    /**
     * The text on an {@link AdCountdown}, e.g. "Content will resume in X seconds".
     *
     * @param remainingDuration The remaining time until the content can be resumed, after being formatted with {@link formatNarrowDuration}.
     */
    adCountdownText(remainingDuration: string): string;
    /**
     * The text on an {@link AdSkipButton}, e.g. "Skip Ad".
     */
    adSkipButtonText: string;
    /**
     * The text on an {@link AdSkipButton} when it is showing a countdown.
     *
     * @param remainingDuration The remaining time until the ad can be skipped, after being formatted with {@link formatNarrowDuration}.
     */
    adSkipCountdownText(remainingDuration: string): string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link CloseMenuButton}.
     */
    closeMenuAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link LanguageMenuButton}.
     */
    openLanguageMenuAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link PlaybackRateMenuButton}.
     */
    openPlaybackRateMenuAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link SettingsMenuButton}.
     */
    openSettingsMenuAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link BadNetworkModeButton}.
     */
    openBadNetworkModeMenuAria: string;
    /**
     * Formats the given time duration as a human-readable string.
     *
     * This is optional. If not provided, a default {@link Intl.DurationFormat} with the {@link Intl.DurationFormatStyle | `"long"` style} is used.
     *
     * Examples:
     * - `{ seconds: 5 }` &rarr; "5 seconds"
     * - `{ minutes: 2, seconds: 10 }` &rarr; "2 minutes and 10 seconds"
     *
     * @param duration A duration, compatible with {@link Intl.DurationFormat.format}.
     */
    formatDuration(duration: Duration): string;
    /**
     * Formats the given time duration as a narrow human-readable string.
     *
     * This is optional. If not provided, a default {@link Intl.DurationFormat} with the {@link Intl.DurationFormatStyle | `"narrow"` style} is used.
     *
     * Examples:
     * - `{ seconds: 5 }` &rarr; "5s"
     * - `{ minutes: 2, seconds: 10 }` &rarr; "2m 10s"
     *
     * @param duration A duration, compatible with {@link Intl.DurationFormat.format}.
     */
    formatNarrowDuration(duration: Duration): string;
    /**
     * Formats the given remaining time duration as a human-readable string.
     *
     * Examples:
     * - "5 seconds" &rarr; "5 seconds remaining"
     * - "2 minutes and 10 seconds" &rarr; "2 minutes and 10 seconds remaining"
     *
     * @param duration A duration that was formatted with {@link formatDuration}.
     */
    formatRemainingDuration(duration: string): string;
    /**
     * Formats the given percentage as a human-readable string.
     *
     * This is optional. If not provided, a default {@link Intl.NumberFormat} with the {@link Intl.NumberFormatOptions.style | `"percent"` style} is used.
     *
     * Examples:
     * - `0.75` &rarr; "75%"
     * - `1.0` &rarr; "100%"
     *
     * @param percentage A percentage, between `0.0` and `1.0`.
     */
    formatPercentage(percentage: number): string;
}

export interface Duration {
    hours: number;
    minutes: number;
    seconds: number;
}

export const defaultLocaleName = 'en';
export const defaultLocale: Locale = {
    playAria: 'play',
    pauseAria: 'pause',
    replayAria: 'replay',
    muteAria: 'mute',
    unmuteAria: 'unmute',
    volumeAria: 'volume',
    seekAria: 'seek',
    seekForwardAria: (offset) => `seek forward by ${offset}`,
    seekBackwardAria: (offset) => `seek backward by ${offset}`,
    live: 'LIVE',
    seekToLiveAria: 'seek to live',
    fullscreenAria: 'enter fullscreen',
    fullscreenExitAria: 'exit fullscreen',
    airplayAria: 'start playing on AirPlay',
    airplayConnectedAria: 'stop playing on AirPlay',
    chromecastAria: 'start casting to Chromecast',
    chromecastConnectedAria: 'stop casting to Chromecast',
    adText: 'Ad',
    adBreakText: (currentAd: number, totalAds: number) => `Ad ${currentAd} of ${totalAds}`,
    adClickThroughText: 'Visit Advertiser',
    adCountdownText: (remainingDuration: string) => `Content will resume in ${remainingDuration}`,
    adSkipButtonText: 'Skip Ad',
    adSkipCountdownText: (remainingDuration: string) => `Skip in ${remainingDuration}`,
    closeMenuAria: 'close menu',
    openLanguageMenuAria: 'open language menu',
    openPlaybackRateMenuAria: 'open playback speed menu',
    openSettingsMenuAria: 'open settings menu',
    openBadNetworkModeMenuAria: 'open bad network mode menu',
    formatDuration: durationFormatterForLocale(defaultLocaleName, 'long'),
    formatNarrowDuration: durationFormatterForLocale(defaultLocaleName, 'narrow'),
    formatRemainingDuration: (duration: string) => `${duration} remaining`,
    formatPercentage: percentageFormatterForLocale(defaultLocaleName)
};
