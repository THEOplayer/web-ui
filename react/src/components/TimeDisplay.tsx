import { createComponent } from '@lit/react';
import { TimeDisplay as TimeDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

export const TimeDisplay = createComponent({
    tagName: 'theoplayer-time-display',
    displayName: 'TimeDisplay',
    elementClass: TimeDisplayElement,
    react: React
});
