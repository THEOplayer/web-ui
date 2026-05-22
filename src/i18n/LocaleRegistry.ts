import { defaultLocale, type Locale, type PartialLocale } from './Locale';
import { durationFormatterForLocale } from './DurationFormatter';
import { percentageFormatterForLocale } from './PercentageFormatter';

const localesByName: Record<string, Locale> = {};

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
export function addLocale(name: string, locale: PartialLocale) {
    // TODO Re-render all components that use this locale?
    localesByName[name] = {
        ...defaultLocale,
        ...locale,
        formatDuration: locale.formatDuration ?? durationFormatterForLocale(name, 'long'),
        formatNarrowDuration: locale.formatNarrowDuration ?? durationFormatterForLocale(name, 'narrow'),
        formatPercentage: locale.formatPercentage ?? percentageFormatterForLocale(name)
    };
}
