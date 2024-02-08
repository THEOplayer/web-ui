import { createComponent } from '@lit/react';
import { AdCountdown as AdCountdownElement } from '@theoplayer/web-ui';
import * as React from 'react';

/**
 * See {@link @theoplayer/web-ui!AdCountdown | AdCountdown in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const AdCountdown = createComponent({
    tagName: 'theoplayer-ad-countdown',
    displayName: 'AdCountdown',
    elementClass: AdCountdownElement,
    react: React
});
