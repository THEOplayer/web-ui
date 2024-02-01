import { createComponent } from '@lit/react';
import { TextTrackStyleResetButton as TextTrackStyleResetButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * @group Components
 */
export const TextTrackStyleResetButton = createComponent({
    tagName: 'theoplayer-text-track-style-reset-button',
    displayName: 'TextTrackStyleResetButton',
    elementClass: TextTrackStyleResetButtonElement,
    react: React,
    events: ButtonEvents
});
