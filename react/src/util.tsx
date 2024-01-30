import * as React from 'react';
import { Children, cloneElement, Fragment, isValidElement, type ReactNode, useCallback, useEffect, useState } from 'react';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import type { DefaultUI as DefaultUIElement, UIContainer as UIContainerElement } from '@theoplayer/web-ui';

export function usePlayer(onReady?: (player: ChromelessPlayer) => void): {
    player: ChromelessPlayer | undefined;
    setUi: (ui: DefaultUIElement | UIContainerElement | null) => void;
    onReadyHandler: (event: Event) => void;
} {
    const [ui, setUi] = useState<DefaultUIElement | UIContainerElement | null>(null);
    const [player, setPlayer] = useState<ChromelessPlayer | undefined>(undefined);

    // Update player when UI is created, or when 'theoplayerready' event fires.
    useEffect(() => {
        setPlayer(ui?.player);
    }, [ui]);
    const onReadyHandler = useCallback(
        (_event: Event) => {
            setPlayer(ui?.player);
        },
        [ui]
    );

    // Call onReady once player is available.
    useEffect(() => {
        if (!player) return;
        onReady?.(player);
    }, [player, onReady]);

    return { player, setUi, onReadyHandler };
}

export function childrenWithSlot(children: ReactNode, slot: string): ReactNode {
    return Children.map(children, (child) => withSlot(child, slot));
}

function withSlot<T extends ReactNode>(child: T, slot: string): ReactNode {
    if (isValidElement(child)) {
        if (child.type === Fragment) {
            return cloneElement(child, undefined, childrenWithSlot(child.props.children, slot));
        } else {
            return cloneElement(child, { slot });
        }
    } else {
        return <div slot={slot}>{child}</div>;
    }
}
