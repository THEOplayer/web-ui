import { createComponent } from '@lit/react';
import { CastButton as CastButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * @group Components
 */
export const CastButton = createComponent({
    tagName: 'theoplayer-cast-button',
    displayName: 'CastButton',
    elementClass: CastButtonElement,
    react: React,
    events: ButtonEvents
});
