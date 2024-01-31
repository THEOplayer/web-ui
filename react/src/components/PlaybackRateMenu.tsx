import { createComponent, type WebComponentProps } from '@lit/react';
import { PlaybackRateMenu as PlaybackRateMenuElement } from '@theoplayer/web-ui';
import type { PropsWithoutRef, ReactNode } from 'react';
import * as React from 'react';
import { Slotted } from '../slotted';

const RawPlaybackRateMenu = createComponent({
    tagName: 'theoplayer-playback-rate-menu',
    displayName: 'PlaybackRateMenu',
    elementClass: PlaybackRateMenuElement,
    react: React
});

export interface PlaybackRateMenuProps extends PropsWithoutRef<WebComponentProps<PlaybackRateMenuElement>> {
    /**
     * A slot for the menu's heading.
     */
    heading?: ReactNode;
}

export const PlaybackRateMenu = ({ heading, children, ...props }: PlaybackRateMenuProps) => {
    return (
        <RawPlaybackRateMenu {...props}>
            <Slotted slot="heading">{heading}</Slotted>
            {children}
        </RawPlaybackRateMenu>
    );
};
