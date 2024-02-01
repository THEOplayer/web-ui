import { createComponent } from '@lit/react';
import { ControlBar as ControlBarElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * @group Components
 */
export const ControlBar = createComponent({
    tagName: 'theoplayer-control-bar',
    displayName: 'ControlBar',
    elementClass: ControlBarElement,
    react: React
});
