import { createComponent } from '@lit/react';
import { ActiveQualityDisplay as ActiveQualityDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!ActiveQualityDisplay | ActiveQualityDisplay in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const ActiveQualityDisplay = createComponent({
    tagName: 'theoplayer-active-quality-display',
    displayName: 'ActiveQualityDisplay',
    elementClass: ActiveQualityDisplayElement,
    react: React
});
