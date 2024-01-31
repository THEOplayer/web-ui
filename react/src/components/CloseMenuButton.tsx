import { createComponent } from '@lit/react';
import { CloseMenuButton as CloseMenuButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

export const CloseMenuButton = createComponent({
    tagName: 'theoplayer-close-menu-button',
    displayName: 'CloseMenuButton',
    elementClass: CloseMenuButtonElement,
    react: React,
    events: ButtonEvents
});
