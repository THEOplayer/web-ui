import { createComponent } from '@lit/react';
import { ChromecastButton as ChromecastButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * See {@link @theoplayer/web-ui!ChromecastButton | ChromecastButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const ChromecastButton = createComponent({
    tagName: 'theoplayer-chromecast-button',
    displayName: 'ChromecastButton',
    elementClass: ChromecastButtonElement,
    react: React,
    events: ButtonEvents
});
