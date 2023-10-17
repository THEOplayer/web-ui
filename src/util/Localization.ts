import { configureLocalization } from '@lit/localize';
import { sourceLocale, targetLocales } from '../generated/localeCodes';
import * as nl from '../generated/locales/nl';

export { msg, str } from '@lit/localize';

export const { getLocale, setLocale } = configureLocalization({
    sourceLocale,
    targetLocales,
    async loadLocale(rawLocale: string) {
        const locale = rawLocale as (typeof targetLocales)[number];
        switch (locale) {
            case 'nl':
                // TODO Use dynamic import?
                return nl;
        }
    }
});
