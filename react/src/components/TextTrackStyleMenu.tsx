import { createComponent, type WebComponentProps } from '@lit/react';
import { TextTrackStyleMenu as TextTrackStyleMenuElement } from '@theoplayer/web-ui';
import type { PropsWithoutRef } from 'react';
import * as React from 'react';
import { Slotted } from '../slotted';
import type { CommonMenuProps } from './Menu';

const RawTextTrackStyleMenu = createComponent({
    tagName: 'theoplayer-text-track-style-menu',
    displayName: 'TextTrackStyleMenu',
    elementClass: TextTrackStyleMenuElement,
    react: React
});

export interface TextTrackStyleMenuProps extends CommonMenuProps, PropsWithoutRef<WebComponentProps<TextTrackStyleMenuElement>> {}

/**
 * @group Components
 */
export const TextTrackStyleMenu = ({ heading, children, ...props }: TextTrackStyleMenuProps) => {
    return (
        <RawTextTrackStyleMenu {...props}>
            <Slotted slot="heading">{heading}</Slotted>
            {children}
        </RawTextTrackStyleMenu>
    );
};
