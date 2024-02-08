import { createComponent } from '@lit/react';
import { LinkButton as LinkButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * See {@link @theoplayer/web-ui!LinkButton | LinkButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const LinkButton = createComponent({
    tagName: 'theoplayer-link-button',
    displayName: 'LinkButton',
    elementClass: LinkButtonElement,
    react: React,
    events: ButtonEvents
});
