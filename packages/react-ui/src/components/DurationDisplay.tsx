import { createComponent } from '@lit/react';
import { DurationDisplay as DurationDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * {@inheritDoc @theoplayer/web-ui!DurationDisplay}
 */
export const DurationDisplay = createComponent({
    tagName: 'theoplayer-duration-display',
    displayName: 'DurationDisplay',
    elementClass: DurationDisplayElement,
    react: React
});
