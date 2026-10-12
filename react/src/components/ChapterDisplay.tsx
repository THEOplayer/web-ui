import { createComponent } from '@lit/react';
import { ChapterDisplay as ChapterDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!ChapterDisplay | ChapterDisplay in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const ChapterDisplay = createComponent({
    tagName: 'theoplayer-chapter-display',
    displayName: 'ChapterDisplay',
    elementClass: ChapterDisplayElement,
    react: React
});
