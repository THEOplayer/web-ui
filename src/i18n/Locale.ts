import { durationFormatterForLocale } from './DurationFormatter';
import type { PlayButton, TimeRange } from '../components';

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
     * The {@link HTMLElement.ariaLabel | `aria-label`} for a {@link TimeRange}.
     */
    seekAria: string;
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
     * Formats the given remaining time duration as a human-readable string.
     *
     * Examples:
     * - "5 seconds" &rarr; "5 seconds remaining"
     * - "2 minutes and 10 seconds" &rarr; "2 minutes and 10 seconds remaining"
     *
     * @param duration A duration that was formatted with {@link formatDuration}.
     */
    formatRemainingDuration(duration: string): string;
}

export type DurationFormatter = (duration: Duration) => string;

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
    seekAria: 'seek',
    formatDuration: durationFormatterForLocale(defaultLocaleName),
    formatRemainingDuration: (duration: string) => `${duration} remaining`
};
