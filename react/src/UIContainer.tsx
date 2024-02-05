import * as React from 'react';
import { type PropsWithoutRef, type ReactNode } from 'react';
import { UIContainer as UIContainerElement } from '@theoplayer/web-ui';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { createComponent, type WebComponentProps } from '@lit/react';
import { usePlayer } from './util';
import { PlayerContext } from './context';
import { Slotted, SlottedInPlace } from './slotted';
import type { ChromecastButton, ErrorDisplay, Menu, PlayButton, TimeRange } from './components';

const RawUIContainer = createComponent({
    tagName: 'theoplayer-ui',
    displayName: 'UIContainer',
    elementClass: UIContainerElement,
    react: React,
    events: {
        onReady: 'theoplayerready'
    } as const
});

export interface UIContainerProps extends PropsWithoutRef<WebComponentProps<UIContainerElement>> {
    /**
     * A slot for controls at the top of the player.
     *
     * Can be used to display the stream's title, or for a cast button ({@link ChromecastButton}).
     */
    topChrome?: ReactNode;
    /**
     * A slot for controls in the middle of the player (between the top and bottom chrome).
     */
    middleChrome?: ReactNode;
    /**
     * A slot for controls at the bottom of the player.
     *
     * Can be used for controls such as a play button ({@link PlayButton}) or a seek bar ({@link TimeRange}).
     */
    bottomChrome?: ReactNode;
    /**
     * A slot for controls centered on the player, on top of other controls.
     */
    centeredChrome?: ReactNode;
    /**
     * A slot for a loading indicator centered on the player, on top of other controls but behind the centered chrome.
     */
    centeredLoading?: ReactNode;
    /**
     * A slot for extra menus (see {@link Menu}).
     */
    menu?: ReactNode;
    /**
     * A slot for an error display, to show when the player encounters a fatal error (see {@link ErrorDisplay}).
     */
    error?: ReactNode;
    /**
     * Use a named slot instead, such as:
     *  - {@link topChrome}
     *  - {@link middleChrome}
     *  - {@link bottomChrome}
     *  - {@link centeredChrome}
     *  - {@link centeredLoading}
     *  - {@link menu}
     *  - {@link error}
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
 * The container component for a THEOplayer UI.
 *
 * This component provides a basic layout structure for a general player UI, and handles the creation and management
 * of a {@link ChromelessPlayer | THEOplayer player instance} for this UI.
 *
 * ## Usage
 *
 * 1. Create a `<UIContainer>` component, passing a valid player configuration as its `configuration` property
 *    and a valid stream source as its `source` property.
 *    Additionally, place your UI components into one of the slots of the `<UIContainer>`, such as
 *    ```jsx
 *    <UIContainer
 *        configuration={{
 *            license: 'your_license_goes_here',
 *            libraryLocation: '/path/to/node_modules/theoplayer/'
 *        }}
 *        source={{
 *            sources: [{ src: 'https://example.com/my_stream.m3u8', type: 'application/x-mpegurl' }]
 *        }}
 *        // ...
 *    />
 *    ```
 * 2. Place your UI components into one of the slots of the `<UIContainer>`, such as {@link UIContainerProps.bottomChrome}
 *    or {@link UIContainerProps.centeredChrome}. You can use the provided THEOplayer UI components
 *    (such as {@link PlayButton} or {@link TimeRange}), or use any of your own components.
 *    ```jsx
 *    <UIContainer
 *        // ...
 *        topChrome={<span class="title">My awesome video</span>}
 *        centeredChrome={<PlayButton />}
 *        bottomChrome={
 *            <>
 *                <ControlBar>
 *                    <TimeRange />
 *                </ControlBar>
 *                <ControlBar>
 *                    <PlayButton />
 *                    <MuteButton />
 *                    <TimeDisplay />
 *                    <FullscreenButton />
 *                </ControlBar>
 *            </>
 *        }
 *    />
 *    ```
 *
 * ## Customization
 *
 * This component does not provide any UI components by default, you need to add all components as children of
 * one of the `<UIContainer>` slots. If you're looking for a simple out-of-the-box player experience instead,
 * see {@link DefaultUI}.
 *
 * See {@link @theoplayer/web-ui!UIContainer | UIContainer in @theoplayer/web-ui}.
 *
 * @group Components
 */
export const UIContainer = (props: UIContainerProps) => {
    const { topChrome, middleChrome, bottomChrome, centeredChrome, centeredLoading, menu, error, onReady, ...otherProps } = props;
    const { player, setUi, onReadyHandler } = usePlayer(onReady);
    return (
        <RawUIContainer {...otherProps} ref={setUi} onReady={onReadyHandler}>
            <PlayerContext.Provider value={player}>
                <Slotted slot="top-chrome">{topChrome}</Slotted>
                <Slotted slot="middle-chrome">{middleChrome}</Slotted>
                <Slotted slot="centered-chrome">{centeredChrome}</Slotted>
                <Slotted slot="centered-loading">{centeredLoading}</Slotted>
                {bottomChrome}
                <SlottedInPlace slot="menu">{menu}</SlottedInPlace>
                <Slotted slot="error">{error}</Slotted>
            </PlayerContext.Provider>
        </RawUIContainer>
    );
};
