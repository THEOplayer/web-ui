import { createComponent } from '@lit/react';
import { TextTrackStyleResetButton as TextTrackStyleResetButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * See {@link @theoplayer/web-ui!TextTrackStyleResetButton | TextTrackStyleResetButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const TextTrackStyleResetButton = createComponent({
    tagName: 'theoplayer-text-track-style-reset-button',
    displayName: 'TextTrackStyleResetButton',
    elementClass: TextTrackStyleResetButtonElement,
    react: React,
    events: ButtonEvents
});
