import { createComponent } from '@lit/react';
import { DebugButton as DebugButtonElement } from '@theoplayer/web-ui/debug';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!DebugButton | DebugButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const DebugButton = createComponent({
    tagName: 'theoplayer-debug-button',
    displayName: 'DebugButton',
    elementClass: DebugButtonElement,
    react: React,
    events: { onClick: 'click' }
});
