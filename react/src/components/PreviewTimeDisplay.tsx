import { createComponent } from '@lit/react';
import { PreviewTimeDisplay as PreviewTimeDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * @group Components
 */
export const PreviewTimeDisplay = createComponent({
    tagName: 'theoplayer-preview-time-display',
    displayName: 'PreviewTimeDisplay',
    elementClass: PreviewTimeDisplayElement,
    react: React
});
