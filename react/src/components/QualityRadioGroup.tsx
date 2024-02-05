import { createComponent } from '@lit/react';
import { QualityRadioGroup as QualityRadioGroupElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { RadioGroupEvents } from './RadioGroup';

/**
 * See {@link @theoplayer/web-ui!QualityRadioGroup | QualityRadioGroup in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const QualityRadioGroup = createComponent({
    tagName: 'theoplayer-quality-radio-group',
    displayName: 'QualityRadioGroup',
    elementClass: QualityRadioGroupElement,
    react: React,
    events: RadioGroupEvents
});
