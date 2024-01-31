import { createComponent, type WebComponentProps } from '@lit/react';
import { LanguageMenu as LanguageMenuElement } from '@theoplayer/web-ui';
import type { PropsWithoutRef, ReactNode } from 'react';
import * as React from 'react';
import { Slotted } from '../slotted';

const RawLanguageMenu = createComponent({
    tagName: 'theoplayer-language-menu',
    displayName: 'LanguageMenu',
    elementClass: LanguageMenuElement,
    react: React
});

export interface LanguageMenuProps extends PropsWithoutRef<WebComponentProps<LanguageMenuElement>> {
    /**
     * A slot for the menu's heading.
     */
    heading?: ReactNode;
}

export const LanguageMenu = ({ heading, children, ...props }: LanguageMenuProps) => {
    return (
        <RawLanguageMenu {...props}>
            <Slotted slot="heading">{heading}</Slotted>
            {children}
        </RawLanguageMenu>
    );
};
