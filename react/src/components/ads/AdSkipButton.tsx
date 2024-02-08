import { createComponent } from '@lit/react';
import { AdSkipButton as AdSkipButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from '../Button';

/**
 * See {@link @theoplayer/web-ui!AdSkipButton | AdSkipButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const AdSkipButton = createComponent({
    tagName: 'theoplayer-ad-skip-button',
    displayName: 'AdSkipButton',
    elementClass: AdSkipButtonElement,
    react: React,
    events: ButtonEvents
});
