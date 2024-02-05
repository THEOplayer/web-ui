import { createComponent } from '@lit/react';
import { VolumeRange as VolumeRangeElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { RangeEvents } from './Range';

/**
 * See {@link @theoplayer/web-ui!VolumeRange | VolumeRange in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const VolumeRange = createComponent({
    tagName: 'theoplayer-volume-range',
    displayName: 'VolumeRange',
    elementClass: VolumeRangeElement,
    react: React,
    events: RangeEvents
});
