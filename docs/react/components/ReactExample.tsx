import React, { type JSX } from 'react';
import Example, { type Props as ExampleProps } from '../../components/Example';

export interface Props extends ExampleProps {}

export default function ReactExample(props: Props): JSX.Element {
    return <Example {...props} />;
}
