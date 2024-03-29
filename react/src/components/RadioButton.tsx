import { createComponent } from '@lit/react';
import { RadioButton as RadioButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

export const RadioButtonEvents = {
    ...ButtonEvents,
    onChange: 'change',
    onInput: 'input'
} as const;

/**
 * See {@link @theoplayer/web-ui!RadioButton | RadioButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const RadioButton = createComponent({
    tagName: 'theoplayer-radio-button',
    displayName: 'RadioButton',
    elementClass: RadioButtonElement,
    react: React,
    events: RadioButtonEvents
});
