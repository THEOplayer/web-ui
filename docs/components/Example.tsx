import React, { type ComponentPropsWithoutRef, type JSX } from 'react';

export interface Props extends ComponentPropsWithoutRef<'iframe'> {}

export default function Example(props: Props): JSX.Element {
    return <iframe {...props}></iframe>;
}
