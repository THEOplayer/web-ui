import { createComponent } from '@lit/react';
import { PreviewTimeDisplay as PreviewTimeDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!PreviewTimeDisplay | PreviewTimeDisplay in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const PreviewTimeDisplay = createComponent({
    tagName: 'theoplayer-preview-time-display',
    displayName: 'PreviewTimeDisplay',
    elementClass: PreviewTimeDisplayElement,
    react: React
});
