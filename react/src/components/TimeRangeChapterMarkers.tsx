import { createComponent } from '@lit/react';
import { TimeRangeChapterMarkers as TimeRangeChapterMarkersElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!TimeRangeChapterMarkers | TimeRangeChapterMarkers in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const TimeRangeChapterMarkers = createComponent({
    tagName: 'theoplayer-time-range-chapter-markers',
    displayName: 'TimeRangeChapterMarkers',
    elementClass: TimeRangeChapterMarkersElement,
    react: React
});
