import type { Duration, DurationFormatter } from './Locale';

export function durationFormatterForLocale(locale: string): DurationFormatter {
    try {
        // Use Intl.DurationFormat (if supported).
        const formatter = new Intl.DurationFormat(locale, { style: 'long' });
        const zeroFormat = new Intl.DurationFormat(locale, { style: 'long', secondsDisplay: 'always' }).format({ seconds: 0 });
        return (duration) => {
            // If duration is zero, shows "0 seconds".
            return duration.hours === 0 && duration.minutes === 0 && duration.seconds === 0 ? zeroFormat : formatter.format(duration);
        };
    } catch {
        // Fall back to English.
        return defaultFormatDuration;
    }
}

export function defaultFormatDuration({ hours, minutes, seconds }: Duration): string {
    return [
        hours === 0 ? '' : `${hours} hour${hours === 1 ? '' : 's'}`,
        minutes === 0 ? '' : `${minutes} minute${minutes === 1 ? '' : 's'}`,
        seconds === 0 && (hours > 0 || minutes > 0) ? '' : `${seconds} second${seconds === 1 ? '' : 's'}`
    ]
        .filter((part) => part !== '')
        .join(', ');
}
