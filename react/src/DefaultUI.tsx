import * as React from 'react';
import { type PropsWithoutRef } from 'react';
import { DefaultUI as DefaultUIElement } from '@theoplayer/web-ui';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { createComponent, type WebComponentProps } from '@lit/react';
import { usePlayer } from './util';
import { PlayerContext } from './context';
import type { SlottedChildren } from './slotted';

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
    title?: SlottedChildren;
    /**
     * A slot for extra UI controls in the top control bar.
     */
    topControlBar?: SlottedChildren;
    /**
     * A slot for extra UI controls in the bottom control bar.
     */
    bottomControlBar?: SlottedChildren;
    /**
     * A slot for extra menus (see {@link Menu}).
     */
    menu?: SlottedChildren;
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

export const DefaultUI = ({ title, topControlBar, bottomControlBar, menu, onReady, ...props }: DefaultUIProps) => {
    const { player, setUi, onReadyHandler } = usePlayer(onReady);
    return (
        <RawDefaultUI {...props} ref={setUi} onReady={onReadyHandler}>
            <PlayerContext.Provider value={player}>
                {title?.({ slot: 'title' })}
                {topControlBar?.({ slot: 'top-control-bar' })}
                {bottomControlBar?.({ slot: 'bottom-control-bar' })}
                {menu?.({ slot: 'menu' })}
            </PlayerContext.Provider>
        </RawDefaultUI>
    );
};
