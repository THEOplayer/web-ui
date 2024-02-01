import { createComponent } from '@lit/react';
import { AdDisplay as AdDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * @group Components
 */
export const AdDisplay = createComponent({
    tagName: 'theoplayer-ad-display',
    displayName: 'AdDisplay',
    elementClass: AdDisplayElement,
    react: React
});
