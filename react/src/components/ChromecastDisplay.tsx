import { createComponent } from '@lit/react';
import { ChromecastDisplay as ChromecastDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!ChromecastDisplay | ChromecastDisplay in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const ChromecastDisplay = createComponent({
    tagName: 'theoplayer-chromecast-display',
    displayName: 'ChromecastDisplay',
    elementClass: ChromecastDisplayElement,
    react: React
});
