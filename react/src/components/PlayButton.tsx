import { createComponent } from '@lit/react';
import { PlayButton as PlayButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';

export const PlayButton = createComponent({
    tagName: 'theoplayer-play-button',
    displayName: 'PlayButton',
    elementClass: PlayButtonElement,
    react: React,
    events: {
        onClick: 'click'
    } as const
});
