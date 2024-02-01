import { createComponent, type WebComponentProps } from '@lit/react';
import { SettingsMenu as SettingsMenuElement } from '@theoplayer/web-ui';
import type { PropsWithoutRef } from 'react';
import * as React from 'react';
import { Slotted } from '../slotted';
import type { CommonMenuProps } from './Menu';

const RawSettingsMenu = createComponent({
    tagName: 'theoplayer-settings-menu',
    displayName: 'SettingsMenu',
    elementClass: SettingsMenuElement,
    react: React
});

export interface SettingsMenuProps extends CommonMenuProps, PropsWithoutRef<WebComponentProps<SettingsMenuElement>> {}

export const SettingsMenu = ({ heading, children, ...props }: SettingsMenuProps) => {
    return (
        <RawSettingsMenu {...props}>
            <Slotted slot="heading">{heading}</Slotted>
            {children}
        </RawSettingsMenu>
    );
};
