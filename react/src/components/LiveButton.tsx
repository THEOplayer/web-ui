import { createComponent } from '@lit/react';
import { LiveButton as LiveButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

export const LiveButton = createComponent({
    tagName: 'theoplayer-live-button',
    displayName: 'LiveButton',
    elementClass: LiveButtonElement,
    react: React,
    events: ButtonEvents
});
