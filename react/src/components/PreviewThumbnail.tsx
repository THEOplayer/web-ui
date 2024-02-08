import { createComponent } from '@lit/react';
import { PreviewThumbnail as PreviewThumbnailElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!PreviewThumbnail | PreviewThumbnail in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const PreviewThumbnail = createComponent({
    tagName: 'theoplayer-preview-thumbnail',
    displayName: 'PreviewThumbnail',
    elementClass: PreviewThumbnailElement,
    react: React
});
