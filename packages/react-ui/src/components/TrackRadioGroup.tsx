import { createComponent } from '@lit/react';
import { TrackRadioGroup as TrackRadioGroupElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { RadioGroupEvents } from './RadioGroup';

/**
 * {@inheritDoc @theoplayer/web-ui!TrackRadioGroup}
 */
export const TrackRadioGroup = createComponent({
    tagName: 'theoplayer-track-radio-group',
    displayName: 'TrackRadioGroup',
    elementClass: TrackRadioGroupElement,
    react: React,
    events: RadioGroupEvents
});
