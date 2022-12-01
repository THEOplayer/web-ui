// https://github.com/webmodules/custom-event/blob/master/index.js

const NativeCustomEvent = self.CustomEvent;

// Modern browsers
function supportsNativeCustomEvent() {
    try {
        const p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
        return 'cat' === p.type && 'bar' === p.detail.foo;
    } catch (e) {}
    return false;
}

function createWithNativeCustomEvent(type: string, eventInitDict?: CustomEventInit): CustomEvent {
    return new CustomEvent(type, eventInitDict);
}

// IE >= 9
function createWithCreateEvent(type: string, eventInitDict?: CustomEventInit): CustomEvent {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, eventInitDict?.bubbles || false, eventInitDict?.cancelable || false, eventInitDict?.detail);
    return e;
}

export type CustomEventFactory = <TType extends string = string, TDetail = any>(
    type: TType,
    eventInitDict?: CustomEventInit<TDetail>
) => CustomEvent<TDetail> & { readonly type: TType };

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 */
export const createCustomEvent: CustomEventFactory = (
    supportsNativeCustomEvent() ? createWithNativeCustomEvent : createWithCreateEvent
) as CustomEventFactory;
