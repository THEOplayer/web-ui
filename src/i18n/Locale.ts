import { durationFormatterForLocale } from './DurationFormatter';
import { percentageFormatterForLocale } from './PercentageFormatter';
import type { EdgeStyle } from 'theoplayer/chromeless';
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
    LanguageMenu,
    LanguageMenuButton,
    LiveButton,
    MuteButton,
    PlaybackRateDisplay,
    PlaybackRateMenu,
    PlaybackRateMenuButton,
    PlayButton,
    SeekButton,
    SettingsMenu,
    SettingsMenuButton,
    TextTrackOffRadioButton,
    TextTrackStyleDisplay,
    TextTrackStyleMenu,
    TextTrackStyleRadioGroup,
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
     * The heading for a {@link LanguageMenu}.
     */
    languageMenuHeading: string;
    /**
     * The section header for audio tracks in a {@link LanguageMenu}.
     */
    audioMenuHeading: string;
    /**
     * The section header for subtitle tracks in a {@link LanguageMenu}.
     */
    subtitleMenuHeading: string;
    /**
     * The label for a {@link TextTrackOffRadioButton} to disable the active subtitle track.
     */
    subtitleOff: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link PlaybackRateMenuButton}.
     */
    openPlaybackRateMenuAria: string;
    /**
     * The heading for a {@link PlaybackRateMenu}.
     */
    playbackRateMenuHeading: string;
    /**
     * Formats the given playback rate for a {@link PlaybackRateMenu} and {@link PlaybackRateDisplay}.
     *
     * Examples:
     * - `1` &rarr; "Normal"
     * - `1.5` &rarr; "1.5x"
     *
     * @param rate The playback rate.
     */
    formatPlaybackRate(rate: number): string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link SettingsMenuButton}.
     */
    openSettingsMenuAria: string;
    /**
     * The heading for a {@link SettingsMenu}.
     */
    settingsMenuHeading: string;
    /**
     * The text for the quality option in a {@link SettingsMenu}.
     */
    qualityMenuHeading: string;
    /**
     * The heading for a {@link TextTrackStyleMenu}.
     */
    textTrackStyleMenuHeading: string;
    /**
     * The heading for the font family style option in a {@link TextTrackStyleMenu}.
     */
    textTrackStyleFontFamily: string;
    /**
     * The heading for the font color style option in a {@link TextTrackStyleMenu}.
     */
    textTrackStyleFontColor: string;
    /**
     * The heading for the font opacity style option in a {@link TextTrackStyleMenu}.
     */
    textTrackStyleFontOpacity: string;
    /**
     * The heading for the font size style option in a {@link TextTrackStyleMenu}.
     */
    textTrackStyleFontSize: string;
    /**
     * The heading for the background color style option in a {@link TextTrackStyleMenu}.
     */
    textTrackStyleBackgroundColor: string;
    /**
     * The heading for the background opacity style option in a {@link TextTrackStyleMenu}.
     */
    textTrackStyleBackgroundOpacity: string;
    /**
     * The heading for the window color style option in a {@link TextTrackStyleMenu}.
     */
    textTrackStyleWindowColor: string;
    /**
     * The heading for the window opacity style option in a {@link TextTrackStyleMenu}.
     */
    textTrackStyleWindowOpacity: string;
    /**
     * The heading for the edge style option in a {@link TextTrackStyleMenu}.
     */
    textTrackStyleEdgeStyle: string;
    /**
     * The label for the default style option in a {@link TextTrackStyleRadioGroup}.
     */
    textTrackStyleDefaultLabel: string;
    /**
     * The label for a {@link TextTrackStyleDisplay} when it is showing a style option
     * that does not match any predefined values.
     */
    textTrackStyleCustomLabel: string;
    /**
     * The labels for font family style options in a {@link TextTrackStyleRadioGroup},
     * keyed by the original English label (e.g. "Default" or "Monospace Serif").
     */
    fontFamilyLabels: Record<KnownFontFamily, string>;
    /**
     * The labels for color style options in a {@link TextTrackStyleRadioGroup},
     * keyed by the original English label (e.g. "White", "Black" or "Red").
     */
    colorLabels: Record<KnownColor, string>;
    /**
     * The labels for edge style options in a {@link TextTrackStyleRadioGroup},
     * keyed by an {@link EdgeStyle} value.
     */
    edgeStyleLabels: Record<EdgeStyle, string>;
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

/**
 * A duration, compatible with {@link Intl.DurationFormat.format} and {@link Temporal.Duration}.
 */
export interface Duration {
    hours: number;
    minutes: number;
    seconds: number;
}

/**
 * The known font families for a {@link TextTrackStyleRadioGroup}.
 */
export type KnownFontFamily = 'Monospace Serif' | 'Proportional Serif' | 'Monospace Sans' | 'Proportional Sans';

/**
 * The known colors for a {@link TextTrackStyleRadioGroup}.
 */
export type KnownColor = 'White' | 'Yellow' | 'Green' | 'Cyan' | 'Blue' | 'Magenta' | 'Red' | 'Black';

/**
 * A partial {@link Locale}.
 */
export type PartialLocale = Partial<Locale> & {
    fontFamilyLabels?: Partial<Locale['fontFamilyLabels']>;
    colorLabels?: Partial<Locale['colorLabels']>;
    edgeStyleLabels?: Partial<Locale['edgeStyleLabels']>;
};

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
    languageMenuHeading: 'Language',
    audioMenuHeading: 'Audio',
    subtitleMenuHeading: 'Subtitles',
    subtitleOff: 'Off',
    openPlaybackRateMenuAria: 'open playback speed menu',
    playbackRateMenuHeading: 'Playback speed',
    formatPlaybackRate: (rate: number) => (rate === 1 ? 'Normal' : `${rate}x`),
    openSettingsMenuAria: 'open settings menu',
    settingsMenuHeading: 'Settings',
    qualityMenuHeading: 'Quality',
    textTrackStyleMenuHeading: 'Subtitle options',
    textTrackStyleFontFamily: 'Font family',
    textTrackStyleFontColor: 'Font color',
    textTrackStyleFontOpacity: 'Font opacity',
    textTrackStyleFontSize: 'Font size',
    textTrackStyleBackgroundColor: 'Background color',
    textTrackStyleBackgroundOpacity: 'Background opacity',
    textTrackStyleWindowColor: 'Window color',
    textTrackStyleWindowOpacity: 'Window opacity',
    textTrackStyleEdgeStyle: 'Character edge style',
    textTrackStyleDefaultLabel: 'Default',
    textTrackStyleCustomLabel: 'Custom',
    fontFamilyLabels: {
        'Monospace Serif': 'Monospace Serif',
        'Proportional Serif': 'Proportional Serif',
        'Monospace Sans': 'Monospace Sans',
        'Proportional Sans': 'Proportional Sans'
    },
    colorLabels: {
        White: 'White',
        Yellow: 'Yellow',
        Green: 'Green',
        Cyan: 'Cyan',
        Blue: 'Blue',
        Magenta: 'Magenta',
        Red: 'Red',
        Black: 'Black'
    },
    edgeStyleLabels: {
        none: 'None',
        dropshadow: 'Drop shadow',
        raised: 'Raised',
        depressed: 'Depressed',
        uniform: 'Uniform'
    },
    openBadNetworkModeMenuAria: 'open bad network mode menu',
    formatDuration: durationFormatterForLocale(defaultLocaleName, 'long'),
    formatNarrowDuration: durationFormatterForLocale(defaultLocaleName, 'narrow'),
    formatRemainingDuration: (duration: string) => `${duration} remaining`,
    formatPercentage: percentageFormatterForLocale(defaultLocaleName)
};
