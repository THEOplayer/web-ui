import { createComponent } from '@lit/react';
import { GestureReceiver as GestureReceiverElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!GestureReceiver | GestureReceiver in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const GestureReceiver = createComponent({
    tagName: 'theoplayer-gesture-receiver',
    displayName: 'GestureReceiver',
    elementClass: GestureReceiverElement,
    react: React
});
