import { createComponent } from '@lit/react';
import { PlaybackRateRadioGroup as PlaybackRateRadioGroupElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { RadioGroupEvents } from './RadioGroup';

/**
 * @group Components
 */
export const PlaybackRateRadioGroup = createComponent({
    tagName: 'theoplayer-playback-rate-radio-group',
    displayName: 'PlaybackRateRadioGroup',
    elementClass: PlaybackRateRadioGroupElement,
    react: React,
    events: RadioGroupEvents
});
