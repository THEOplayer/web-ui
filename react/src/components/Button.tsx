import { createComponent } from '@lit/react';
import { Button as ButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';

export const ButtonEvents = {
    onClick: 'click'
} as const;

/**
 * @group Components
 */
export const Button = createComponent({
    tagName: 'theoplayer-button',
    displayName: 'Button',
    elementClass: ButtonElement,
    react: React,
    events: ButtonEvents
});
