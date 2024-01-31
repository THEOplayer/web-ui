import { createComponent } from '@lit/react';
import { TextTrackStyleMenu as TextTrackStyleMenuElement } from '@theoplayer/web-ui';
import * as React from 'react';

export const TextTrackStyleMenu = createComponent({
    tagName: 'theoplayer-text-track-style-menu',
    displayName: 'TextTrackStyleMenu',
    elementClass: TextTrackStyleMenuElement,
    react: React
});
