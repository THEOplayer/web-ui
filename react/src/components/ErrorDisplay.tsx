import { createComponent } from '@lit/react';
import { ErrorDisplay as ErrorDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!ErrorDisplay | ErrorDisplay in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const ErrorDisplay = createComponent({
    tagName: 'theoplayer-error-display',
    displayName: 'ErrorDisplay',
    elementClass: ErrorDisplayElement,
    react: React
});
