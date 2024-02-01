import { createComponent } from '@lit/react';
import { RadioGroup as RadioGroupElement } from '@theoplayer/web-ui';
import * as React from 'react';

export const RadioGroupEvents = {
    onChange: 'change'
} as const;

export const RadioGroup = createComponent({
    tagName: 'theoplayer-radio-group',
    displayName: 'RadioGroup',
    elementClass: RadioGroupElement,
    react: React,
    events: RadioGroupEvents
});
