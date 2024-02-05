import { createComponent } from '@lit/react';
import { LanguageMenuButton as LanguageMenuButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * See {@link @theoplayer/web-ui!LanguageMenuButton | LanguageMenuButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const LanguageMenuButton = createComponent({
    tagName: 'theoplayer-language-menu-button',
    displayName: 'LanguageMenuButton',
    elementClass: LanguageMenuButtonElement,
    react: React,
    events: ButtonEvents
});
