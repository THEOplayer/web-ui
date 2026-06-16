import { createComponent } from '@lit/react';
import { VRIOSFullscreen as VRIOSFullscreenElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!VRIOSFullscreen | VRIOSFullscreen in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const VRIOSFullscreen = createComponent({
    tagName: 'theoplayer-vr-ios-fullscreen',
    displayName: 'VRIOSFullscreen',
    elementClass: VRIOSFullscreenElement,
    react: React
});
