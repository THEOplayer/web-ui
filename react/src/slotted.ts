import type { ReactNode } from 'react';

export interface SlottedProps {
    slot: string;
}

export type SlottedChildren = (props?: SlottedProps) => ReactNode;
