import { createComponent } from '@lit/react';
import { QualityRadioButton as QualityRadioButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { RadioButtonEvents } from './RadioButton';

/**
 * See {@link @theoplayer/web-ui!QualityRadioButton | QualityRadioButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const QualityRadioButton = createComponent({
    tagName: 'theoplayer-quality-radio-button',
    displayName: 'QualityRadioButton',
    elementClass: QualityRadioButtonElement,
    react: React,
    events: RadioButtonEvents
});
