import * as React from 'react';
import { type PropsWithoutRef, type ReactNode, useState } from 'react';
import { DefaultUI as DefaultUIElement } from '@theoplayer/web-ui';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { createComponent, type WebComponentProps } from '@lit/react';
import { usePlayer } from './util';
import { PlayerContext } from './context';
import { type Menu, SlotContainer } from './components';

const RawDefaultUI = createComponent({
    tagName: 'theoplayer-default-ui',
    displayName: 'DefaultUI',
    elementClass: DefaultUIElement,
    react: React,
    events: {
        onReady: 'theoplayerready'
    } as const
});

export interface DefaultUIProps extends PropsWithoutRef<Omit<WebComponentProps<DefaultUIElement>, 'title'>> {
    /**
     * A slot for the stream's title in the top control bar.
     */
    title?: ReactNode;
    /**
     * A slot for extra UI controls in the top control bar.
     */
    topControlBar?: ReactNode;
    /**
     * A slot for extra UI controls in the bottom control bar.
     */
    bottomControlBar?: ReactNode;
    /**
     * A slot to replace the controls in the center of the player, layered on top of other controls.
     */
    centeredChrome?: ReactNode;
    /**
     * A slot for extra menus (see {@link Menu}).
     */
    menu?: ReactNode;
    /**
     * A slot for an error display, to show when the player encounters a fatal error.
     * By default, this shows an {@link ErrorDisplay}.
     */
    error?: ReactNode;
    /**
     * Use a named slot instead, such as:
     *  - {@link title}
     *  - {@link topControlBar}
     *  - {@link bottomControlBar}
     *  - {@link menu}
     */
    children?: never;
    /**
     * Called when the backing player is created.
     *
     * @param player
     */
    onReady?: (player: ChromelessPlayer) => void;
}

/**
 * A default UI for THEOplayer.
 *
 * This default UI provides a great player experience out-of-the-box, that works well on all types of devices
 * and for all types of streams. It provides all the common playback controls for playing, seeking,
 * changing languages and qualities. It also supports advertisements and casting.
 *
 * ## Usage
 *
 * 1. Create a `<DefaultUI>` component, passing a valid player configuration as its `configuration` property
 *    and a valid stream source as its `source` property.
 *    ```jsx
 *    <DefaultUI
 *        configuration={{
 *            license: 'your_license_goes_here',
 *            libraryLocation: '/path/to/node_modules/theoplayer/'
 *        }}
 *        source={{
 *            sources: [{ src: 'https://example.com/my_stream.m3u8', type: 'application/x-mpegurl' }]
 *        }}
 *    />
 *    ```
 * 2. Optionally, customize the player using CSS custom properties and/or extra controls.
 *
 * ## Customization
 *
 * The styling can be controlled using CSS custom properties (see {@link UIContainer}).
 * Additional controls can be added to the {@link DefaultUIProps.topControlBar}
 * and {@link DefaultUIProps.bottomControlBar} slots.
 * For more extensive customizations, we recommend defining your own custom UI using a {@link UIContainer}.
 *
 * See {@link @theoplayer/web-ui!DefaultUI | DefaultUI in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const DefaultUI = (props: DefaultUIProps) => {
    const { title, topControlBar, bottomControlBar, centeredChrome, menu, error, onReady, ...otherProps } = props;
    const [ui, setUi] = useState<DefaultUIElement | null>(null);
    const player = usePlayer(ui, onReady);
    return (
        <RawDefaultUI {...otherProps} ref={setUi}>
            <PlayerContext.Provider value={player}>
                {title && <SlotContainer slot="title">{title}</SlotContainer>}
                {topControlBar && <SlotContainer slot="top-control-bar">{topControlBar}</SlotContainer>}
                {bottomControlBar && <SlotContainer slot="bottom-control-bar">{bottomControlBar}</SlotContainer>}
                {centeredChrome && <SlotContainer slot="centered-chrome">{centeredChrome}</SlotContainer>}
                {menu && <SlotContainer slot="menu">{menu}</SlotContainer>}
                {error && <SlotContainer slot="error">{error}</SlotContainer>}
            </PlayerContext.Provider>
        </RawDefaultUI>
    );
};
