import { createComponent, type WebComponentProps } from '@lit/react';
import { PlaybackRateMenu as PlaybackRateMenuElement } from '@theoplayer/web-ui';
import type { PropsWithoutRef } from 'react';
import * as React from 'react';
import { Slotted } from '../slotted';
import type { CommonMenuProps } from './Menu';

const RawPlaybackRateMenu = createComponent({
    tagName: 'theoplayer-playback-rate-menu',
    displayName: 'PlaybackRateMenu',
    elementClass: PlaybackRateMenuElement,
    react: React
});

export interface PlaybackRateMenuProps extends CommonMenuProps, PropsWithoutRef<WebComponentProps<PlaybackRateMenuElement>> {}

/**
 * @group Components
 */
export const PlaybackRateMenu = ({ heading, children, ...props }: PlaybackRateMenuProps) => {
    return (
        <RawPlaybackRateMenu {...props}>
            <Slotted slot="heading">{heading}</Slotted>
            {children}
        </RawPlaybackRateMenu>
    );
};
