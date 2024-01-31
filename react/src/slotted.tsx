import * as React from 'react';
import { Children, cloneElement, Fragment, isValidElement, type ReactNode } from 'react';

export interface SlottedProps {
    slot: string;
    children?: ReactNode;
}

/**
 * A component that puts its children inside a specific slot of a custom element.
 */
export const Slotted = ({ slot, children }: SlottedProps) => {
    if (!children) {
        return null;
    }
    return (
        // https://lit.dev/docs/frameworks/react/#using-slots
        <div slot={slot} style={{ display: 'contents' }} children={children} />
    );
};

/**
 * A component that puts its children inside a specific slot of a custom element,
 * by adding a `slot` property directly to each child.
 *
 * This should be used with caution! If a component is wrapped in another component that doesn't forward all props
 * (such as a `<Context.Consumer>`), then the slot property might not end up at the desired child.
 */
export const SlottedInPlace = ({ slot, children }: SlottedProps): ReactNode => {
    if (!children) {
        return null;
    }
    return Children.map(children, (child) => cloneWithSlot(slot, child));
};

function cloneWithSlot<T extends ReactNode>(slot: string, child: T): ReactNode {
    if (isValidElement(child)) {
        if (child.type === Fragment) {
            return cloneElement(child, undefined, <SlottedInPlace slot={slot} children={child.props.children} />);
        } else {
            return cloneElement(child, { slot });
        }
    } else {
        return <Slotted slot={slot} children={child} />;
    }
}
