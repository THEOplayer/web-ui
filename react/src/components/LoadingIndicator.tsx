import { createComponent } from '@lit/react';
import { LoadingIndicator as LoadingIndicatorElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * @group Components
 */
export const LoadingIndicator = createComponent({
    tagName: 'theoplayer-loading-indicator',
    displayName: 'LoadingIndicator',
    elementClass: LoadingIndicatorElement,
    react: React
});
