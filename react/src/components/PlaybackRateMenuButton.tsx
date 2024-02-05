import { createComponent } from '@lit/react';
import { PlaybackRateMenuButton as PlaybackRateMenuButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * See {@link @theoplayer/web-ui!PlaybackRateMenuButton | PlaybackRateMenuButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const PlaybackRateMenuButton = createComponent({
    tagName: 'theoplayer-playback-rate-menu-button',
    displayName: 'PlaybackRateMenuButton',
    elementClass: PlaybackRateMenuButtonElement,
    react: React,
    events: ButtonEvents
});
