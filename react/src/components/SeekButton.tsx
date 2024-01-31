import { createComponent } from '@lit/react';
import { SeekButton as SeekButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

export const SeekButton = createComponent({
    tagName: 'theoplayer-seek-button',
    displayName: 'SeekButton',
    elementClass: SeekButtonElement,
    react: React,
    events: ButtonEvents
});
