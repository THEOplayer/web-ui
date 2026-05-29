import { createContext } from '@lit/context';
import type { UIContainer } from '../UIContainer';

/**
 * Context for the language.
 *
 * If a component does not have its own {@link HTMLElement.lang} attribute,
 * it should read the language from this context.
 *
 * @see {@link UIContainer.lang}
 */
export const languageContext = createContext<string>('theoplayer-ui-lang');
