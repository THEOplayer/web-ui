import { createComponent } from '@lit/react';
import { TextTrackOffRadioButton as TextTrackOffRadioButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { RadioButtonEvents } from './RadioButton';

export const TextTrackOffRadioButton = createComponent({
    tagName: 'theoplayer-text-track-off-radio-button',
    displayName: 'TextTrackOffRadioButton',
    elementClass: TextTrackOffRadioButtonElement,
    react: React,
    events: RadioButtonEvents
});
