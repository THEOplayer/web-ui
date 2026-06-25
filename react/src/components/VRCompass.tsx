import { createComponent } from '@lit/react';
import { VRCompass as VRCompassElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!VRCompass | VRCompass in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const VRCompass = createComponent({
    tagName: 'theoplayer-vr-compass',
    displayName: 'VRCompass',
    elementClass: VRCompassElement,
    react: React
});
