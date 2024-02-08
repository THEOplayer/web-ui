import { createComponent } from '@lit/react';
import { TimeRange as TimeRangeElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { RangeEvents } from './Range';

/**
 * See {@link @theoplayer/web-ui!TimeRange | TimeRange in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const TimeRange = createComponent({
    tagName: 'theoplayer-time-range',
    displayName: 'TimeRange',
    elementClass: TimeRangeElement,
    react: React,
    events: RangeEvents
});
