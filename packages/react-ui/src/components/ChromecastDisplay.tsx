import { createComponent } from '@lit/react';
import { ChromecastDisplay as ChromecastDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * {@inheritDoc @theoplayer/web-ui!ChromecastDisplay}
 */
export const ChromecastDisplay = createComponent({
    tagName: 'theoplayer-chromecast-display',
    displayName: 'ChromecastDisplay',
    elementClass: ChromecastDisplayElement,
    react: React
});
