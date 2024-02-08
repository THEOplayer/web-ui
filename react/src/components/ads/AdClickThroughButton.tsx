import { createComponent } from '@lit/react';
import { AdClickThroughButton as AdClickThroughButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from '../Button';

/**
 * See {@link @theoplayer/web-ui!AdClickThroughButton | AdClickThroughButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const AdClickThroughButton = createComponent({
    tagName: 'theoplayer-ad-clickthrough-button',
    displayName: 'AdClickThroughButton',
    elementClass: AdClickThroughButtonElement,
    react: React,
    events: ButtonEvents
});
