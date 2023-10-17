import { configureLocalization, LOCALE_STATUS_EVENT, type LocaleStatusEventDetail } from '@lit/localize';
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

export type LocaleStatusEvent = CustomEvent<LocaleStatusEventDetail>;

export function addLocaleChangeListener(listener: (this: unknown, event: LocaleStatusEvent) => void) {
    window.addEventListener(LOCALE_STATUS_EVENT, listener);
}

export function removeLocaleChangeListener(listener: (this: unknown, event: LocaleStatusEvent) => void) {
    window.removeEventListener(LOCALE_STATUS_EVENT, listener);
}

export function isLocaleChangeEvent(event: CustomEvent<LocaleStatusEventDetail>): boolean {
    return event.detail.status === 'ready';
}
