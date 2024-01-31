import { createComponent } from '@lit/react';
import { PlaybackRateMenu as PlaybackRateMenuElement } from '@theoplayer/web-ui';
import * as React from 'react';

export const PlaybackRateMenu = createComponent({
    tagName: 'theoplayer-playback-rate-menu',
    displayName: 'PlaybackRateMenu',
    elementClass: PlaybackRateMenuElement,
    react: React
});
