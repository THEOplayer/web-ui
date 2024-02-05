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
 * See {@link @theoplayer/web-ui!TextTrackStyleMenu | TextTrackStyleMenu in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const TextTrackStyleMenu = (props: TextTrackStyleMenuProps) => {
    const { heading, children, ...otherProps } = props;
    return (
        <RawTextTrackStyleMenu {...otherProps}>
            <Slotted slot="heading">{heading}</Slotted>
            {children}
        </RawTextTrackStyleMenu>
    );
};
