import { createComponent, type WebComponentProps } from '@lit/react';
import { Menu as MenuElement } from '@theoplayer/web-ui';
import type { PropsWithoutRef, ReactNode } from 'react';
import * as React from 'react';
import { Slotted } from '../slotted';

const RawMenu = createComponent({
    tagName: 'theoplayer-menu',
    displayName: 'Menu',
    elementClass: MenuElement,
    react: React
});

export interface CommonMenuProps {
    /**
     * A slot for the menu's heading.
     */
    heading?: ReactNode;
    /**
     * The menu's contents.
     */
    children?: ReactNode;
}

export interface MenuProps extends CommonMenuProps, PropsWithoutRef<WebComponentProps<MenuElement>> {}

/**
 * @group Components
 */
export const Menu = (props: MenuProps) => {
    const { heading, children, ...otherProps } = props;
    return (
        <RawMenu {...otherProps}>
            <Slotted slot="heading">{heading}</Slotted>
            {children}
        </RawMenu>
    );
};