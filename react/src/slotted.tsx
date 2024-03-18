import * as React from 'react';
import { type ReactNode } from 'react';

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
