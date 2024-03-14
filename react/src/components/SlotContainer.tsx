import { createComponent } from '@lit/react';
import { SlotContainer as SlotContainerElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!SlotContainer | SlotContainer in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const SlotContainer = createComponent({
    tagName: 'theoplayer-slot-container',
    displayName: 'SlotContainer',
    elementClass: SlotContainerElement,
    react: React
});
