import { createComponent } from '@lit/react';
import { AirPlayButton as AirPlayButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * {@inheritDoc @theoplayer/web-ui!AirPlayButton}
 */
export const AirPlayButton = createComponent({
    tagName: 'theoplayer-airplay-button',
    displayName: 'AirPlayButton',
    elementClass: AirPlayButtonElement,
    react: React,
    events: ButtonEvents
});
