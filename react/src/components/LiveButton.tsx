import { createComponent } from '@lit/react';
import { LiveButton as LiveButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * See {@link @theoplayer/web-ui!LiveButton | LiveButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const LiveButton = createComponent({
    tagName: 'theoplayer-live-button',
    displayName: 'LiveButton',
    elementClass: LiveButtonElement,
    react: React,
    events: ButtonEvents
});
