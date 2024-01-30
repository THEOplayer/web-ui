import * as React from 'react';
import { forwardRef } from 'react';
import { DefaultUI as DefaultUIElement } from '@theoplayer/web-ui';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { createComponent, type WebComponentProps } from '@lit/react';
import { usePlayer } from './util';
import { PlayerContext } from './context';

const RawDefaultUI = createComponent({
    tagName: 'theoplayer-default-ui',
    displayName: 'DefaultUI',
    elementClass: DefaultUIElement,
    react: React,
    events: {
        onReady: 'theoplayerready' as const
    }
});

export interface DefaultUIProps extends WebComponentProps<DefaultUIElement> {
    onReady?: (player: ChromelessPlayer) => void;
}

export const DefaultUI = forwardRef<DefaultUIElement, DefaultUIProps>(({ children, onReady, ...props }, ref) => {
    const { player, setUi, onReadyHandler } = usePlayer(onReady);
    return (
        <RawDefaultUI {...props} ref={setUi} onReady={onReadyHandler}>
            <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
        </RawDefaultUI>
    );
});
