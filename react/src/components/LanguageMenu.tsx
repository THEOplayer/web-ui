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

/**
 * See {@link @theoplayer/web-ui!LanguageMenu | LanguageMenu in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const LanguageMenu = (props: LanguageMenuProps) => {
    const { heading, children, ...otherProps } = props;
    return (
        <RawLanguageMenu {...otherProps}>
            <Slotted slot="heading">{heading}</Slotted>
            {children}
        </RawLanguageMenu>
    );
};
