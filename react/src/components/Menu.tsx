import { createComponent } from '@lit/react';
import { Menu as MenuElement } from '@theoplayer/web-ui';
import * as React from 'react';

export const Menu = createComponent({
    tagName: 'theoplayer-menu',
    displayName: 'Menu',
    elementClass: MenuElement,
    react: React
});
