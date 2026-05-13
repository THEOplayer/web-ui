import type { PercentageFormatter } from './Locale';

export function percentageFormatterForLocale(locale: string): PercentageFormatter {
    try {
        // Use Intl.NumberFormat (if supported).
        const formatter = new Intl.NumberFormat(locale, { style: 'percent' });
        return (percentage) => formatter.format(percentage);
    } catch {
        // Fall back to English.
        return defaultPercentageFormatter;
    }
}

export function defaultPercentageFormatter(percentage: number): string {
    return `${Math.round(percentage * 100)}%`;
}
