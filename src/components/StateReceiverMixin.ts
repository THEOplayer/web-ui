import { type Constructor, fromArrayLike, isArray, isElement, isHTMLElement, isHTMLSlotElement } from '../util/CommonUtils';
import type { ChromelessPlayer, THEOplayerError, VideoQuality } from 'theoplayer';
import type { StreamType } from '../util/StreamType';

/** @internal */
export const StateReceiverProps = 'theoplayerUiObservedProperties' as const;

export interface StateReceiverPropertyMap {
    player: ChromelessPlayer | undefined;
    fullscreen: boolean;
    streamType: StreamType;
    playbackRate: number;
    activeVideoQuality: VideoQuality | undefined;
    targetVideoQualities: VideoQuality[] | undefined;
    error: THEOplayerError | undefined;
    previewTime: number;
}

/**
 * A custom element that automatically receives selected state updates
 * from an ancestor {@link UIContainer | `<theoplayer-ui>`} element.
 *
 * Do not implement this interface directly, instead use {@link StateReceiverMixin}.
 *
 * @see {@link StateReceiverMixin}
 */
export interface StateReceiverElement extends Partial<StateReceiverPropertyMap>, Element {
    /**
     * The names of the properties this element will receive.
     */
    readonly [StateReceiverProps]: Array<keyof StateReceiverPropertyMap>;
}

/** @internal */
export function isStateReceiverElement(element: Element): element is StateReceiverElement {
    return StateReceiverProps in element && isArray((element as Partial<StateReceiverElement>)[StateReceiverProps]);
}

/**
 * A [mixin class](https://www.typescriptlang.org/docs/handbook/mixins.html) to apply on the superclass of a custom element,
 * such that it will automatically receive selected state updates from an ancestor {@link UIContainer | `<theoplayer-ui>`} element.
 *
 * For each property name in `props`, the custom element *MUST* implement a corresponding property with a setter.
 * For example, if `props` equals `["player", "fullscreen"]`, then the element must have writable `player` and `fullscreen`
 * properties.
 *
 * @param base - The superclass for the new element class.
 * @param props - The names of the properties this element will receive.
 * @returns A class constructor that extends `base` and implements {@link StateReceiverElement}.
 * @see {@link StateReceiverElement}
 */
export function StateReceiverMixin<T extends Constructor<Element>>(
    base: T,
    props: Array<keyof StateReceiverPropertyMap>
): T & Constructor<StateReceiverElement> {
    abstract class StateReceiver extends base implements StateReceiverElement {
        get [StateReceiverProps](): Array<keyof StateReceiverPropertyMap> {
            return props;
        }
    }

    return StateReceiver;
}

/** @internal */
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
    const children: Element[] = [
        // Element.children does not exist for SVG elements in Internet Explorer.
        // Assume those won't contain any state receivers.
        ...(isHTMLElement(element) ? fromArrayLike(element.children) : []),
        ...(element.shadowRoot ? fromArrayLike(element.shadowRoot.children) : []),
        ...(isHTMLSlotElement(element) ? element.assignedNodes().filter(isElement) : [])
    ];
    if (children.length > 0) {
        await Promise.all(children.map((child) => forEachStateReceiverElement(child, playerElement, callback)));
    }
}
