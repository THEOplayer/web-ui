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
 * See {@link @theoplayer/web-ui!PlaybackRateMenu | PlaybackRateMenu in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const PlaybackRateMenu = (props: PlaybackRateMenuProps) => {
    const { heading, children, ...otherProps } = props;
    return (
        <RawPlaybackRateMenu {...otherProps}>
            <Slotted slot="heading">{heading}</Slotted>
            {children}
        </RawPlaybackRateMenu>
    );
};
