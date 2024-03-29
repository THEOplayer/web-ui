import { createComponent } from '@lit/react';
import { DurationDisplay as DurationDisplayElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!DurationDisplay | DurationDisplay in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const DurationDisplay = createComponent({
    tagName: 'theoplayer-duration-display',
    displayName: 'DurationDisplay',
    elementClass: DurationDisplayElement,
    react: React
});
