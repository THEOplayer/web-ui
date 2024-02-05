import { createComponent } from '@lit/react';
import { SettingsMenuButton as SettingsMenuButtonElement } from '@theoplayer/web-ui';
import * as React from 'react';
import { ButtonEvents } from './Button';

/**
 * See {@link @theoplayer/web-ui!SettingsMenuButton | SettingsMenuButton in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const SettingsMenuButton = createComponent({
    tagName: 'theoplayer-settings-menu-button',
    displayName: 'SettingsMenuButton',
    elementClass: SettingsMenuButtonElement,
    react: React,
    events: ButtonEvents
});
