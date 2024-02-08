import { createComponent } from '@lit/react';
import { MenuButton as MenuButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * See {@link @theoplayer/web-ui!MenuButton | MenuButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const MenuButton = createComponent({
    tagName: 'theoplayer-menu-button',
    displayName: 'MenuButton',
    elementClass: MenuButtonElement,
    react: React,
    events: ButtonEvents
});
