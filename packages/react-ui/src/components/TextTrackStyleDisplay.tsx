import { createComponent } from '@lit/react';
import { TextTrackStyleDisplay as TextTrackStyleDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

export const TextTrackStyleDisplay = createComponent({
    tagName: 'theoplayer-text-track-style-display',
    displayName: 'TextTrackStyleDisplay',
    elementClass: TextTrackStyleDisplayElement,
    react: React
});
