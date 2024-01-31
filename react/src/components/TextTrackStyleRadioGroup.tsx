import { createComponent } from '@lit/react';
import { TextTrackStyleRadioGroup as TextTrackStyleRadioGroupElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { RadioGroupEvents } from './RadioGroup';

export const TextTrackStyleRadioGroup = createComponent({
    tagName: 'theoplayer-text-track-style-radio-group',
    displayName: 'TextTrackStyleRadioGroup',
    elementClass: TextTrackStyleRadioGroupElement,
    react: React,
    events: RadioGroupEvents
});
