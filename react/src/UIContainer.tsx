import * as React from 'react';
import { type PropsWithoutRef } from 'react';
import { UIContainer as UIContainerElement } from '@theoplayer/web-ui';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { createComponent, type WebComponentProps } from '@lit/react';
import { usePlayer } from './util';
import { PlayerContext } from './context';

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
    onReady?: (player: ChromelessPlayer) => void;
}

export const UIContainer = ({ children, onReady, ...props }: UIContainerProps) => {
    const { player, setUi, onReadyHandler } = usePlayer(onReady);
    return (
        <RawUIContainer {...props} ref={setUi} onReady={onReadyHandler}>
            <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
        </RawUIContainer>
    );
};
