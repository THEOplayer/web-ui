import * as React from 'react';
import { type PropsWithoutRef } from 'react';
import { UIContainer as UIContainerElement } from '@theoplayer/web-ui';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { createComponent, type WebComponentProps } from '@lit/react';
import { usePlayer } from './util';
import { PlayerContext } from './context';
import type { SlottedChildren } from './slotted';

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
    topChrome?: SlottedChildren;
    /**
     * A slot for controls in the middle of the player (between the top and bottom chrome).
     */
    middleChrome?: SlottedChildren;
    /**
     * A slot for controls at the bottom of the player.
     *
     * Can be used for controls such as a play button ({@link PlayButton}) or a seek bar ({@link TimeRange}).
     */
    bottomChrome?: SlottedChildren;
    /**
     * A slot for controls centered on the player, on top of other controls.
     */
    centeredChrome?: SlottedChildren;
    /**
     * A slot for a loading indicator centered on the player, on top of other controls but behind the centered chrome.
     */
    centeredLoading?: SlottedChildren;
    /**
     * A slot for extra menus (see {@link Menu}).
     */
    menu?: SlottedChildren;
    /**
     * A slot for an error display, to show when the player encounters a fatal error (see {@link ErrorDisplay}).
     */
    error?: SlottedChildren;
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
                {topChrome?.({ slot: 'top-chrome' })}
                {middleChrome?.({ slot: 'middle-chrome' })}
                {centeredChrome?.({ slot: 'centered-chrome' })}
                {centeredLoading?.({ slot: 'centered-loading' })}
                {bottomChrome?.()}
                {menu?.({ slot: 'menu' })}
                {error?.({ slot: 'error' })}
            </PlayerContext.Provider>
        </RawUIContainer>
    );
};
