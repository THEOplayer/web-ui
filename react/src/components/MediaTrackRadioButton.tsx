import { createComponent } from '@lit/react';
import { MediaTrackRadioButton as MediaTrackRadioButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { RadioButtonEvents } from './RadioButton';

/**
 * See {@link @theoplayer/web-ui!MediaTrackRadioButton | MediaTrackRadioButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const MediaTrackRadioButton = createComponent({
    tagName: 'theoplayer-media-track-radio-button',
    displayName: 'MediaTrackRadioButton',
    elementClass: MediaTrackRadioButtonElement,
    react: React,
    events: RadioButtonEvents
});
