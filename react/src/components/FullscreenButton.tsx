import { createComponent } from '@lit/react';
import { FullscreenButton as FullscreenButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * @group Components
 */
export const FullscreenButton = createComponent({
    tagName: 'theoplayer-fullscreen-button',
    displayName: 'FullscreenButton',
    elementClass: FullscreenButtonElement,
    react: React,
    events: ButtonEvents
});
