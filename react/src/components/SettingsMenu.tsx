import { createComponent } from '@lit/react';
import { SettingsMenu as SettingsMenuElement } from '@theoplayer/web-ui';
import * as React from 'react';

export const SettingsMenu = createComponent({
    tagName: 'theoplayer-settings-menu',
    displayName: 'SettingsMenu',
    elementClass: SettingsMenuElement,
    react: React
});
