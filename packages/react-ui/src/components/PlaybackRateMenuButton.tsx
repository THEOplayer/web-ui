import { createComponent } from '@lit/react';
import { PlaybackRateMenuButton as PlaybackRateMenuButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * {@inheritDoc @theoplayer/web-ui!PlaybackRateMenuButton}
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
