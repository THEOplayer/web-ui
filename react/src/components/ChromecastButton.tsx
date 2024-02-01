import { createComponent } from '@lit/react';
import { ChromecastButton as ChromecastButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * @group Components
 */
export const ChromecastButton = createComponent({
    tagName: 'theoplayer-chromecast-button',
    displayName: 'ChromecastButton',
    elementClass: ChromecastButtonElement,
    react: React,
    events: ButtonEvents
});
