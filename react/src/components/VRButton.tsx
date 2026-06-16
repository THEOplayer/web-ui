import { createComponent } from '@lit/react';
import { VRButton as VRButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * See {@link @theoplayer/web-ui!VRButton | VRButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const VRButton = createComponent({
    tagName: 'theoplayer-vr-button',
    displayName: 'VRButton',
    elementClass: VRButtonElement,
    react: React,
    events: ButtonEvents
});
