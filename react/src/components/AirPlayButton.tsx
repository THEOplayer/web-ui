import { createComponent } from '@lit/react';
import { AirPlayButton as AirPlayButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * See {@link @theoplayer/web-ui!AirPlayButton | AirPlayButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const AirPlayButton = createComponent({
    tagName: 'theoplayer-airplay-button',
    displayName: 'AirPlayButton',
    elementClass: AirPlayButtonElement,
    react: React,
    events: ButtonEvents
});
