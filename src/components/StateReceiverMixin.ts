import { Constructor, fromArrayLike } from '../util/CommonUtils';
import type { ChromelessPlayer } from 'theoplayer';

export const StateReceiverMarker = Symbol('THEOplayerUIStateReceiver');

export interface StateReceiverElement extends Element {
    readonly [StateReceiverMarker]: true;

    attachPlayer(player: ChromelessPlayer | undefined): void;
}

export function isStateReceiverElement(element: Element): element is StateReceiverElement {
    return (element as Partial<StateReceiverElement>)[StateReceiverMarker] === true;
}

export function StateReceiverMixin<T extends Constructor<Element>>(base: T) {
    abstract class StateReceiver extends base implements StateReceiverElement {
        get [StateReceiverMarker](): true {
            return true;
        }

        abstract attachPlayer(player: ChromelessPlayer | undefined): void;
    }

    return StateReceiver;
}

export async function forEachStateReceiverElement(element: Element, callback: (receiver: StateReceiverElement) => void): Promise<void> {
    if (element.nodeName.indexOf('-') >= 0 && !isStateReceiverElement(element)) {
        await window.customElements.whenDefined(element.nodeName.toLowerCase());
    }
    if (isStateReceiverElement(element)) {
        callback(element);
    }
    const children: Element[] = [...fromArrayLike(element.children ?? []), ...fromArrayLike(element.shadowRoot?.children ?? [])];
    if (children.length > 0) {
        await Promise.all(children.map((child) => forEachStateReceiverElement(child, callback)));
    }
}
