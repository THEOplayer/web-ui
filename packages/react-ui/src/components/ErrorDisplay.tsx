import { createComponent } from '@lit/react';
import { ErrorDisplay as ErrorDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * {@inheritDoc @theoplayer/web-ui!ErrorDisplay}
 */
export const ErrorDisplay = createComponent({
    tagName: 'theoplayer-error-display',
    displayName: 'ErrorDisplay',
    elementClass: ErrorDisplayElement,
    react: React
});
