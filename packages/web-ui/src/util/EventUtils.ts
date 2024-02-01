// https://github.com/webmodules/custom-event/blob/master/index.js

// Modern browsers
function supportsNativeEvent() {
    try {
        const event = new Event('change');
        return 'change' === event.type;
    } catch (e) {}
    return false;
}

function supportsNativeCustomEvent() {
    try {
        const event = new CustomEvent('cat', { detail: { foo: 'bar' } });
        return 'cat' === event.type && 'bar' === event.detail.foo;
    } catch (e) {}
    return false;
}

function createWithNativeEvent(type: string, eventInitDict?: EventInit): Event {
    return new Event(type, eventInitDict);
}

function createWithNativeCustomEvent(type: string, eventInitDict?: CustomEventInit): CustomEvent {
    return new CustomEvent(type, eventInitDict);
}

// IE >= 9
function createEventWithCreateEvent(type: string, eventInitDict?: EventInit): Event {
    const e = document.createEvent('Event');
    e.initEvent(type, eventInitDict?.bubbles || false, eventInitDict?.cancelable || false);
    return e;
}

function createCustomEventWithCreateEvent(type: string, eventInitDict?: CustomEventInit): CustomEvent {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, eventInitDict?.bubbles || false, eventInitDict?.cancelable || false, eventInitDict?.detail);
    return e;
}

export type EventFactory = <TType extends string = string>(type: TType, eventInitDict?: EventInit) => Event & { readonly type: TType };

export type CustomEventFactory = <TType extends string = string, TDetail = any>(
    type: TType,
    eventInitDict?: CustomEventInit<TDetail>
) => CustomEvent<TDetail> & { readonly type: TType };

/**
 * Cross-browser `Event` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Event/Event
 */
export const createEvent: EventFactory = (supportsNativeEvent() ? createWithNativeEvent : createEventWithCreateEvent) as EventFactory;

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
export const createCustomEvent: CustomEventFactory = (
    supportsNativeCustomEvent() ? createWithNativeCustomEvent : createCustomEventWithCreateEvent
) as CustomEventFactory;
