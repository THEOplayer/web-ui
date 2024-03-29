import { createComponent } from '@lit/react';
import { TextTrackRadioButton as TextTrackRadioButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { RadioButtonEvents } from './RadioButton';

/**
 * See {@link @theoplayer/web-ui!TextTrackRadioButton | TextTrackRadioButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const TextTrackRadioButton = createComponent({
    tagName: 'theoplayer-text-track-radio-button',
    displayName: 'TextTrackRadioButton',
    elementClass: TextTrackRadioButtonElement,
    react: React,
    events: RadioButtonEvents
});
