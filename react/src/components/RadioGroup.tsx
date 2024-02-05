import { createComponent } from '@lit/react';
import { RadioGroup as RadioGroupElement } from '@theoplayer/web-ui';
import * as React from 'react';

export const RadioGroupEvents = {
    onChange: 'change'
} as const;

/**
 * See {@link @theoplayer/web-ui!RadioGroup | RadioGroup in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const RadioGroup = createComponent({
    tagName: 'theoplayer-radio-group',
    displayName: 'RadioGroup',
    elementClass: RadioGroupElement,
    react: React,
    events: RadioGroupEvents
});
