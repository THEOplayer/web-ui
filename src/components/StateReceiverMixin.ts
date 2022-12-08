import { Constructor, fromArrayLike, isArray } from '../util/CommonUtils';
import type { ChromelessPlayer } from 'theoplayer';

export const StateReceiverProps = Symbol('THEOplayerUIStateReceiver');

export interface StateReceiverPropertyMap {
    player: ChromelessPlayer | undefined;
}

export type StateReceiverMethods = {
    [T in keyof StateReceiverPropertyMap as `attach${Capitalize<T>}`]?: (value: StateReceiverPropertyMap[T]) => void;
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
