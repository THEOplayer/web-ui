import { durationFormatterForLocale } from './DurationFormatter';

const localesByName: Record<string, Required<Locale>> = {};

export interface Locale {
    playAria: string;
    pauseAria: string;
    replayAria: string;
    formatDuration: (duration: Duration) => string;
    formatRemainingDuration: (duration: string) => string;
}

export type DurationFormatter = (duration: Duration) => string;

export interface Duration {
    hours: number;
    minutes: number;
    seconds: number;
}

const defaultLocaleName = 'en';
const defaultLocale: Locale = {
    playAria: 'play',
    pauseAria: 'pause',
    replayAria: 'replay',
    formatDuration: durationFormatterForLocale(defaultLocaleName),
    formatRemainingDuration: (duration: string) => `${duration} remaining`
};

export function getLocale(name: string): Locale {
    return localesByName[name] ?? defaultLocale;
}

/**
 * Register a new locale with the given name.
 *
 * The locale's name should preferably be a BCP 47 language identifier, so it can be set as
 * a valid [`lang` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/lang)
 * of the UI.
 *
 * @param name The name of the locale.
 * @param locale The locale.
 */
export function addLocale(name: string, locale: Partial<Locale>) {
    localesByName[name] = {
        ...defaultLocale,
        ...locale,
        formatDuration: locale.formatDuration ?? durationFormatterForLocale(name)
    };
}
