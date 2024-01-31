import { createComponent, type WebComponentProps } from '@lit/react';
import { TextTrackStyleMenu as TextTrackStyleMenuElement } from '@theoplayer/web-ui';
import type { PropsWithoutRef, ReactNode } from 'react';
import * as React from 'react';
import { Slotted } from '../slotted';

const RawTextTrackStyleMenu = createComponent({
    tagName: 'theoplayer-text-track-style-menu',
    displayName: 'TextTrackStyleMenu',
    elementClass: TextTrackStyleMenuElement,
    react: React
});

export interface TextTrackStyleMenuProps extends PropsWithoutRef<WebComponentProps<TextTrackStyleMenuElement>> {
    /**
     * A slot for the menu's heading.
     */
    heading?: ReactNode;
}

export const TextTrackStyleMenu = ({ heading, children, ...props }: TextTrackStyleMenuProps) => {
    return (
        <RawTextTrackStyleMenu {...props}>
            <Slotted slot="heading">{heading}</Slotted>
            {children}
        </RawTextTrackStyleMenu>
    );
};
