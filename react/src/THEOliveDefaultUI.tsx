import * as React from 'react';
import { type PropsWithoutRef, type ReactNode, useState } from 'react';
import { THEOliveDefaultUI as THEOliveDefaultUIElement } from '@theoplayer/web-ui';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { createComponent, type WebComponentProps } from '@lit/react';
import { usePlayer } from './util';
import { PlayerContext } from './context';
import { SlotContainer } from './components';

const RawTHEOliveDefaultUI = createComponent({
    tagName: 'theolive-default-ui',
    displayName: 'THEOliveDefaultUI',
    elementClass: THEOliveDefaultUIElement,
    react: React,
    events: {
        onReady: 'theoplayerready'
    } as const
});

export interface THEOliveDefaultUIProps extends PropsWithoutRef<WebComponentProps<THEOliveDefaultUIElement>> {
    /**
     * A slot for the loading announcement, shown before the publication is loaded.
     */
    loadingAnnouncement?: ReactNode;
    /**
     * A slot for the offline announcement, shown when all publications are offline.
     */
    offlineAnnouncement?: ReactNode;
    /**
     * Use a named slot instead, such as:
     *  - {@link loadingAnnouncement}
     *  - {@link offlineAnnouncement}
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
 * A default UI for THEOlive.
 *
 * @group Components
 */
export const THEOliveDefaultUI = (props: THEOliveDefaultUIProps) => {
    const { loadingAnnouncement, offlineAnnouncement, onReady, ...otherProps } = props;
    const [ui, setUi] = useState<THEOliveDefaultUIElement | null>(null);
    const player = usePlayer(ui, onReady);
    return (
        <RawTHEOliveDefaultUI {...otherProps} ref={setUi}>
            <PlayerContext.Provider value={player}>
                {loadingAnnouncement && <SlotContainer slot="loading-announcement">{loadingAnnouncement}</SlotContainer>}
                {offlineAnnouncement && <SlotContainer slot="offline-announcement">{offlineAnnouncement}</SlotContainer>}
            </PlayerContext.Provider>
        </RawTHEOliveDefaultUI>
    );
};
