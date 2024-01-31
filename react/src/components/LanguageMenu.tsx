import { createComponent } from '@lit/react';
import { LanguageMenu as LanguageMenuElement } from '@theoplayer/web-ui';
import * as React from 'react';

export const LanguageMenu = createComponent({
    tagName: 'theoplayer-language-menu',
    displayName: 'LanguageMenu',
    elementClass: LanguageMenuElement,
    react: React
});
