import * as React from 'react';
import { type PropsWithoutRef, type ReactNode } from 'react';
import { UIContainer as UIContainerElement } from '@theoplayer/web-ui';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { createComponent, type WebComponentProps } from '@lit/react';
import { usePlayer } from './util';
import { PlayerContext } from './context';
import { Slotted } from './slotted';
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

export const UIContainer = ({
    topChrome,
    middleChrome,
    bottomChrome,
    centeredChrome,
    centeredLoading,
    menu,
    error,
    onReady,
    ...props
}: UIContainerProps) => {
    const { player, setUi, onReadyHandler } = usePlayer(onReady);
    return (
        <RawUIContainer {...props} ref={setUi} onReady={onReadyHandler}>
            <PlayerContext.Provider value={player}>
                <Slotted slot="top-chrome">{topChrome}</Slotted>
                <Slotted slot="middle-chrome">{middleChrome}</Slotted>
                <Slotted slot="centered-chrome">{centeredChrome}</Slotted>
                <Slotted slot="centered-loading">{centeredLoading}</Slotted>
                {bottomChrome}
                <Slotted slot="menu">{menu}</Slotted>
                <Slotted slot="error">{error}</Slotted>
            </PlayerContext.Provider>
        </RawUIContainer>
    );
};
