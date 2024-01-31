import { createComponent, type WebComponentProps } from '@lit/react';
import { LanguageMenu as LanguageMenuElement } from '@theoplayer/web-ui';
import type { PropsWithoutRef } from 'react';
import * as React from 'react';
import { Slotted } from '../slotted';
import type { CommonMenuProps } from './Menu';

const RawLanguageMenu = createComponent({
    tagName: 'theoplayer-language-menu',
    displayName: 'LanguageMenu',
    elementClass: LanguageMenuElement,
    react: React
});

export interface LanguageMenuProps extends CommonMenuProps, PropsWithoutRef<WebComponentProps<LanguageMenuElement>> {}

export const LanguageMenu = ({ heading, children, ...props }: LanguageMenuProps) => {
    return (
        <RawLanguageMenu {...props}>
            <Slotted slot="heading">{heading}</Slotted>
            {children}
        </RawLanguageMenu>
    );
};
