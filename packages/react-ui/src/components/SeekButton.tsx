import { createComponent } from '@lit/react';
import { SeekButton as SeekButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * {@inheritDoc @theoplayer/web-ui!SeekButton}
 */
export const SeekButton = createComponent({
    tagName: 'theoplayer-seek-button',
    displayName: 'SeekButton',
    elementClass: SeekButtonElement,
    react: React,
    events: ButtonEvents
});
