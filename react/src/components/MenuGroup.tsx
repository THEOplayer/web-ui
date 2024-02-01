import { createComponent } from '@lit/react';
import { MenuGroup as MenuGroupElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * @group Components
 */
export const MenuGroup = createComponent({
    tagName: 'theoplayer-menu-group',
    displayName: 'MenuGroup',
    elementClass: MenuGroupElement,
    react: React
});
