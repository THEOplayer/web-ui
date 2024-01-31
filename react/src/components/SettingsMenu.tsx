import { createComponent, type WebComponentProps } from '@lit/react';
import { SettingsMenu as SettingsMenuElement } from '@theoplayer/web-ui';
import type { PropsWithoutRef, ReactNode } from 'react';
import * as React from 'react';
import { Slotted } from '../slotted';

const RawSettingsMenu = createComponent({
    tagName: 'theoplayer-settings-menu',
    displayName: 'SettingsMenu',
    elementClass: SettingsMenuElement,
    react: React
});

export interface SettingsMenuProps extends PropsWithoutRef<WebComponentProps<SettingsMenuElement>> {
    /**
     * A slot for the menu's heading.
     */
    heading?: ReactNode;
}

export const SettingsMenu = ({ heading, children, ...props }: SettingsMenuProps) => {
    return (
        <RawSettingsMenu {...props}>
            <Slotted slot="heading">{heading}</Slotted>
            {children}
        </RawSettingsMenu>
    );
};
