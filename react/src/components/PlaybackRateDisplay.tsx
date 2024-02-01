import { createComponent } from '@lit/react';
import { PlaybackRateDisplay as PlaybackRateDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * @group Components
 */
export const PlaybackRateDisplay = createComponent({
    tagName: 'theoplayer-playback-rate-display',
    displayName: 'PlaybackRateDisplay',
    elementClass: PlaybackRateDisplayElement,
    react: React
});
