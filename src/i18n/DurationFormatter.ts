import type { Duration } from './Locale';

export type DurationFormatter = (duration: Duration) => string;

export function durationFormatterForLocale(locale: string, style: 'long' | 'narrow'): DurationFormatter {
    try {
        // Use Intl.DurationFormat (if supported).
        const formatter = new Intl.DurationFormat(locale, { style });
        const zeroFormat = new Intl.DurationFormat(locale, { style, secondsDisplay: 'always' }).format({ seconds: 0 });
        return (duration) => {
            // If duration is zero, shows "0 seconds".
            return duration.hours === 0 && duration.minutes === 0 && duration.seconds === 0 ? zeroFormat : formatter.format(duration);
        };
    } catch {
        // Fall back to English.
        return style === 'narrow' ? defaultNarrowFormatDuration : defaultFormatDuration;
    }
}

export function defaultFormatDuration({ hours, minutes, seconds }: Duration): string {
    let s = '';
    if (hours !== 0) {
        s += `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    if (minutes !== 0) {
        if (s !== '') s += ', ';
        s += `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    if (seconds !== 0 || s === '') {
        if (s !== '') s += ', ';
        s += `${seconds} second${seconds === 1 ? '' : 's'}`;
    }
    return s;
}

export function defaultNarrowFormatDuration({ hours, minutes, seconds }: Duration): string {
    let s = '';
    if (hours !== 0) {
        s += `${hours}h`;
    }
    if (minutes !== 0) {
        if (s !== '') s += ' ';
        s += `${minutes}m`;
    }
    if (seconds !== 0 || s === '') {
        if (s !== '') s += ' ';
        s += `${seconds}s`;
    }
    return s;
}
