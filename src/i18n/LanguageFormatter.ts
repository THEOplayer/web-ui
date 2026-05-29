export type LanguageFormatter = (languageCode: string) => string | undefined;

export function languageFormatterForLocale(locale: string): LanguageFormatter {
    try {
        // Use Intl.DisplayNames (if supported).
        const displayNames = new Intl.DisplayNames([locale, 'en'], { type: 'language', fallback: 'none' });
        return (languageCode) => {
            try {
                return displayNames.of(languageCode);
            } catch {
                return undefined;
            }
        };
    } catch {
        return (_languageCode) => undefined;
    }
}
