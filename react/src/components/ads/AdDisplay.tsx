import { createComponent } from '@lit/react';
import { AdDisplay as AdDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!AdDisplay | AdDisplay in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const AdDisplay = createComponent({
    tagName: 'theoplayer-ad-display',
    displayName: 'AdDisplay',
    elementClass: AdDisplayElement,
    react: React
});
