import { durationFormatterForLocale } from './DurationFormatter';
import { percentageFormatterForLocale } from './PercentageFormatter';
import { bandwidthFormatterForLocale } from './BandwidthFormatter';
import { languageFormatterForLocale } from './LanguageFormatter';
import type { EdgeStyle } from 'theoplayer/chromeless';
import type {
    ActiveQualityDisplay,
    AdClickThroughButton,
    AdCountdown,
    AdDisplay,
    AdSkipButton,
    AirPlayButton,
    AutomaticQualitySelector,
    BadNetworkModeButton,
    BadNetworkModeMenu,
    BadNetworkModeSelector,
    ChromecastButton,
    ChromecastDisplay,
    CloseMenuButton,
    ErrorDisplay,
    FullscreenButton,
    LanguageMenu,
    LanguageMenuButton,
    LiveButton,
    MuteButton,
    PlaybackRateDisplay,
    PlaybackRateMenu,
    PlaybackRateMenuButton,
    PlayButton,
    QualityRadioButton,
    SeekButton,
    SettingsMenu,
    SettingsMenuButton,
    TextTrackOffRadioButton,
    TextTrackStyleDisplay,
    TextTrackStyleMenu,
    TextTrackStyleRadioGroup,
    TextTrackStyleResetButton,
    TimeDisplay,
    TimeRange,
    VolumeRange
} from '../components';
import type { THEOliveDefaultUI } from '../THEOliveDefaultUI';

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
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link MuteButton} when it is showing a "mute" button.
     */
    muteAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link MuteButton} when it is showing an "unmute" button.
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
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link FullscreenButton}.
     */
    fullscreenAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link FullscreenButton} when in fullscreen mode.
     */
    fullscreenExitAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link VRButton}.
     */
    vrAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link VRButton} when VR (stereo) mode is active.
     */
    vrExitAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link VRButton} when no VR capable device is available.
     */
    vrUnavailableAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link AirPlayButton}.
     */
    airplayAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for an {@link AirPlayButton} when it is connected to AirPlay.
     */
    airplayConnectedAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link ChromecastButton}.
     */
    chromecastAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link ChromecastButton} when it is connected to Chromecast.
     */
    chromecastConnectedAria: string;
    /**
     * The heading for a {@link ChromecastDisplay} when playing on Chromecast.
     * This heading precedes the name of the connected Chromecast receiver.
     */
    chromecastHeading: string;
    /**
     * The default receiver name for a {@link ChromecastDisplay} when playing on a Chromecast receiver with an unknown name.
     * This follows the {@link chromecastHeading}.
     */
    chromecastDefaultReceiverName: string;
    /**
     * The {@link HTMLElement.ariaValueText | `aria-valuetext`} for a {@link TimeDisplay} and {@link TimeRange}
     * when it has both a valid time and duration to display.
     *
     * Examples:
     * - "5 seconds" and "10 seconds" &rarr; "5 seconds of 10 seconds"
     *
     * @param time A time duration that was formatted with {@link formatDuration} or {@link formatRemainingDuration}.
     * @param totalDuration A total duration that was formatted with {@link formatDuration} or {@link formatRemainingDuration}.
     */
    timeOfTotalAria(time: string, totalDuration: string): string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link TimeDisplay}.
     */
    playbackTimeAria: string;
    /**
     * The {@link HTMLElement.ariaValueText | `aria-valuetext`} for a {@link TimeDisplay} and {@link TimeRange}
     * when it does not have a valid time to display.
     */
    unknownTimeAria: string;
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
     * The announcement message on a {@link THEOliveDefaultUI} when the stream is loading.
     */
    liveStreamLoading: string;
    /**
     * The announcement message on a {@link THEOliveDefaultUI} when the stream is offline and hasn't started yet.
     */
    liveStreamOffline: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link CloseMenuButton}.
     */
    closeMenuAria: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link LanguageMenuButton}.
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
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link PlaybackRateMenuButton}.
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
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link SettingsMenuButton}.
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
     * The label for a {@link TextTrackStyleResetButton} to reset the text track style.
     */
    textTrackStyleResetLabel: string;
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
     * The label for an {@link ActiveQualityDisplay} or {@link QualityRadioButton} when it is showing the "Automatic" quality selection option.
     */
    automaticQualityLabel: string;
    /**
     * The label for a {@link ActiveQualityDisplay} when it is showing a quality selection option
     * without any usable label.
     */
    unknownQualityLabel: string;
    /**
     * The label for an {@link AutomaticQualitySelector} for THEOlive's {@link BadNetworkModeMenu}.
     */
    highQualityLabel: string;
    /**
     * The label for a {@link BadNetworkModeSelector} for THEOlive's {@link BadNetworkModeMenu}.
     */
    lowQualityLabel: string;
    /**
     * The heading for an {@link ErrorDisplay}.
     */
    errorHeading: string;
    /**
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link BadNetworkModeButton}.
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
    /**
     * Formats a bandwidth value.
     *
     * This is optional. If not provided, a default {@link Intl.NumberFormat} with the {@link Intl.NumberFormatOptions.style | `"unit"` style} is used
     * that dynamically picks between the `"kilobit-per-second"` or `"megabit-per-second"` {@link Intl.NumberFormatOptions.unit | unit}s.
     *
     * Examples:
     * - `150_000` &rarr; "150kb/s"
     * - `2_500_000` &rarr; "2.5Mb/s"
     *
     * @param bandwidth A bandwidth value, in bits per second.
     */
    formatBandwidth(bandwidth: number): string;
    /**
     * Formats a language name.
     *
     * This is optional. If not provided, a default {@link Intl.DisplayNames} with the {@link Intl.DisplayNamesOptions.type | `"language"` type} is used.
     *
     * Examples for an English locale:
     * - `"en"` &rarr; "English"
     * - `"fr"` &rarr; "French"
     * - `"pt-BR"` &rarr; "Brazilian Portuguese"
     *
     * Examples for a French locale:
     * - `"en"` &rarr; "anglais"
     * - `"fr"` &rarr; "français"
     * - `"pt-BR"` &rarr; "portugais brésilien"
     *
     * @param languageCode
     * @return A localized language name, or `undefined` if the language code is unknown.
     */
    formatLanguage(languageCode: string): string | undefined;
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
    vrAria: 'watch in VR',
    vrExitAria: 'stop watching in VR',
    vrUnavailableAria: 'no VR capable device found',
    airplayAria: 'start playing on AirPlay',
    airplayConnectedAria: 'stop playing on AirPlay',
    chromecastAria: 'start casting to Chromecast',
    chromecastConnectedAria: 'stop casting to Chromecast',
    chromecastHeading: 'Playing on',
    chromecastDefaultReceiverName: 'Chromecast',
    timeOfTotalAria: (currentTime: string, totalDuration: string) => `${currentTime} of ${totalDuration}`,
    playbackTimeAria: 'playback time',
    unknownTimeAria: 'video not loaded, unknown time',
    adText: 'Ad',
    adBreakText: (currentAd: number, totalAds: number) => `Ad ${currentAd} of ${totalAds}`,
    adClickThroughText: 'Visit Advertiser',
    adCountdownText: (remainingDuration: string) => `Content will resume in ${remainingDuration}`,
    adSkipButtonText: 'Skip Ad',
    adSkipCountdownText: (remainingDuration: string) => `Skip in ${remainingDuration}`,
    liveStreamLoading: 'Loading...',
    liveStreamOffline: `The live stream hasn't started yet`,
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
    textTrackStyleResetLabel: 'Reset',
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
    automaticQualityLabel: 'Automatic',
    unknownQualityLabel: 'Unknown',
    highQualityLabel: 'High Quality',
    lowQualityLabel: 'Low Quality',
    errorHeading: 'An error occurred',
    openBadNetworkModeMenuAria: 'open bad network mode menu',
    formatDuration: durationFormatterForLocale(defaultLocaleName, 'long'),
    formatNarrowDuration: durationFormatterForLocale(defaultLocaleName, 'narrow'),
    formatRemainingDuration: (duration: string) => `${duration} remaining`,
    formatPercentage: percentageFormatterForLocale(defaultLocaleName),
    formatBandwidth: bandwidthFormatterForLocale(defaultLocaleName),
    formatLanguage: languageFormatterForLocale(defaultLocaleName)
};
