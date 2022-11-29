import { Constructor, fromArrayLike } from './utils';
import type { ChromelessPlayer } from 'theoplayer';

export const PlayerReceiverMarker = Symbol('THEOplayerPlayerReceiver');

export interface PlayerReceiverElement extends Element {
    readonly [PlayerReceiverMarker]: true;

    attachPlayer(player: ChromelessPlayer | undefined): void;
}

export function isPlayerReceiverElement(element: Element): element is PlayerReceiverElement {
    return (element as Partial<PlayerReceiverElement>)[PlayerReceiverMarker] === true;
}

export function PlayerReceiverMixin<T extends Constructor<Element>>(base: T) {
    abstract class PlayerReceiver extends base implements PlayerReceiverElement {
        get [PlayerReceiverMarker](): true {
            return true;
        }

        abstract attachPlayer(player: ChromelessPlayer | undefined): void;
    }

    return PlayerReceiver;
}

export async function forEachPlayerReceiverElement(element: Element, callback: (receiver: PlayerReceiverElement) => void): Promise<void> {
    if (element.nodeName.indexOf('-') >= 0 && !isPlayerReceiverElement(element)) {
        await window.customElements.whenDefined(element.nodeName.toLowerCase());
    }
    if (isPlayerReceiverElement(element)) {
        callback(element);
    }
    const children: Element[] = [...fromArrayLike(element.children ?? []), ...fromArrayLike(element.shadowRoot?.children ?? [])];
    if (children.length > 0) {
        await Promise.all(children.map((child) => forEachPlayerReceiverElement(child, callback)));
    }
}
