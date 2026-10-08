import { createComponent } from '@lit/react';
import { DebugDisplay as DebugDisplayElement } from '@theoplayer/web-ui/debug';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!DebugDisplay | DebugDisplay in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const DebugDisplay = createComponent({
    tagName: 'theoplayer-debug-display',
    displayName: 'DebugDisplay',
    elementClass: DebugDisplayElement,
    react: React
});
