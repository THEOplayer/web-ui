import { createComponent } from '@lit/react';
import { TextTrackStyleDisplay as TextTrackStyleDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!TextTrackStyleDisplay | TextTrackStyleDisplay in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const TextTrackStyleDisplay = createComponent({
    tagName: 'theoplayer-text-track-style-display',
    displayName: 'TextTrackStyleDisplay',
    elementClass: TextTrackStyleDisplayElement,
    react: React
});
