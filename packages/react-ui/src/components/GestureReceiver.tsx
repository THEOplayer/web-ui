import { createComponent } from '@lit/react';
import { GestureReceiver as GestureReceiverElement } from '@theoplayer/web-ui';
import * as React from 'react';

export const GestureReceiver = createComponent({
    tagName: 'theoplayer-gesture-receiver',
    displayName: 'GestureReceiver',
    elementClass: GestureReceiverElement,
    react: React
});
