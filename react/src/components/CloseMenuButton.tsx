import { createComponent } from '@lit/react';
import { CloseMenuButton as CloseMenuButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * See {@link @theoplayer/web-ui!CloseMenuButton | CloseMenuButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const CloseMenuButton = createComponent({
    tagName: 'theoplayer-close-menu-button',
    displayName: 'CloseMenuButton',
    elementClass: CloseMenuButtonElement,
    react: React,
    events: ButtonEvents
});
