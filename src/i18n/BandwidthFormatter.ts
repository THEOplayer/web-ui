export type BandwidthFormatter = (bandwidth: number) => string;

export function bandwidthFormatterForLocale(locale: string): BandwidthFormatter {
    try {
        // Use Intl.Number (if supported).
        const options: Intl.NumberFormatOptions = {
            style: 'unit',
            unitDisplay: 'narrow'
        };
        const kbpsFormatter = new Intl.NumberFormat(locale, {
            ...options,
            unit: 'kilobit-per-second',
            maximumFractionDigits: 0
        });
        const mbpsFormatter = new Intl.NumberFormat(locale, {
            ...options,
            unit: 'megabit-per-second',
            minimumSignificantDigits: 2,
            maximumFractionDigits: 1,
            roundingPriority: 'lessPrecision'
        });
        return (bandwidth) => {
            if (bandwidth > 1e6) {
                return mbpsFormatter.format(bandwidth / 1e6);
            } else {
                return kbpsFormatter.format(bandwidth / 1e3);
            }
        };
    } catch {
        return defaultBandwidthFormatter;
    }
}

function defaultBandwidthFormatter(bandwidth: number): string {
    if (bandwidth > 1e7) {
        return `${(bandwidth / 1e6).toFixed(0)}Mb/s`;
    } else if (bandwidth > 1e6) {
        return `${(bandwidth / 1e6).toFixed(1)}Mb/s`;
    } else {
        return `${(bandwidth / 1e3).toFixed(0)}kb/s`;
    }
}
