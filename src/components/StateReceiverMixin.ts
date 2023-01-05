import { Constructor, fromArrayLike, isArray } from '../util/CommonUtils';
import type { ChromelessPlayer, THEOplayerError } from 'theoplayer';

export const StateReceiverProps = Symbol('THEOplayerUIStateReceiver');

export interface StateReceiverPropertyMap {
    player: ChromelessPlayer | undefined;
    fullscreen: boolean;
    error: THEOplayerError | undefined;
}

export type StateReceiverMethods = {
    [T in keyof StateReceiverPropertyMap as `set${Capitalize<T>}`]?: (value: StateReceiverPropertyMap[T]) => void;
};

export interface StateReceiverElement extends StateReceiverMethods, Element {
    readonly [StateReceiverProps]: Array<keyof StateReceiverPropertyMap>;
}

export function isStateReceiverElement(element: Element): element is StateReceiverElement {
    return isArray((element as Partial<StateReceiverElement>)[StateReceiverProps]);
}

export function StateReceiverMixin<T extends Constructor<Element>>(base: T, props: Array<keyof StateReceiverPropertyMap>) {
    abstract class StateReceiver extends base implements StateReceiverElement {
        get [StateReceiverProps](): Array<keyof StateReceiverPropertyMap> {
            return props;
        }
    }

    return StateReceiver;
}

export async function forEachStateReceiverElement(
    element: Element,
    playerElement: HTMLElement,
    callback: (receiver: StateReceiverElement) => void
): Promise<void> {
    // Don't look inside the THEOplayer chromeless player
    if (playerElement.contains(element)) {
        return;
    }
    // Upgrade custom elements if needed
    if (element.nodeName.indexOf('-') >= 0 && !isStateReceiverElement(element)) {
        // web-components-polyfill does not correctly resolve `whenDefined()`
        // when called during an upgrade reaction such as `connectedCallback()`.
        // Workaround by waiting one microtask.
        await Promise.resolve();
        await customElements.whenDefined(element.nodeName.toLowerCase());
        customElements.upgrade(element);
    }
    // Check the element
    if (isStateReceiverElement(element)) {
        callback(element);
    }
    // Check all its children
    const children: Element[] = [...fromArrayLike(element.children ?? []), ...fromArrayLike(element.shadowRoot?.children ?? [])];
    if (children.length > 0) {
        await Promise.all(children.map((child) => forEachStateReceiverElement(child, playerElement, callback)));
    }
}
