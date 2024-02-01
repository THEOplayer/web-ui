import { createComponent } from '@lit/react';
import { ActiveQualityDisplay as ActiveQualityDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * {@inheritDoc @theoplayer/web-ui!ActiveQualityDisplay}
 */
export const ActiveQualityDisplay = createComponent({
    tagName: 'theoplayer-active-quality-display',
    displayName: 'ActiveQualityDisplay',
    elementClass: ActiveQualityDisplayElement,
    react: React
});
