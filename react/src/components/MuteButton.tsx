import { createComponent } from '@lit/react';
import { MuteButton as MuteButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

export const MuteButton = createComponent({
    tagName: 'theoplayer-mute-button',
    displayName: 'MuteButton',
    elementClass: MuteButtonElement,
    react: React,
    events: ButtonEvents
});
