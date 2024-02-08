import { createComponent } from '@lit/react';
import { SeekButton as SeekButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * See {@link @theoplayer/web-ui!SeekButton | SeekButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const SeekButton = createComponent({
    tagName: 'theoplayer-seek-button',
    displayName: 'SeekButton',
    elementClass: SeekButtonElement,
    react: React,
    events: ButtonEvents
});
