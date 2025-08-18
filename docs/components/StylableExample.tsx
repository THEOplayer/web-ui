import React, { type JSX, useEffect, useRef, useState } from 'react';
import Example, { type Controller as ExampleController, type Props as ExampleProps } from './Example';
import { CodeInput, CodeInputElement } from '@site/src/components/CodeInput';

export interface Props extends ExampleProps {
    defaultCustomStyle?: string;
}

export default function StylableExample({ defaultCustomStyle, ...props }: Props): JSX.Element {
    const controllerRef = useRef<ExampleController | null>(null);
    const [customStyle, setCustomStyle] = useState(defaultCustomStyle);

    // Send message to <iframe> when style changes
    useEffect(() => {
        controllerRef.current?.postMessage({
            type: 'style',
            style: customStyle
        });
    }, [customStyle]);

    return (
        <>
            <Example ref={controllerRef} {...props} />
            <CodeInput lang="CSS" defaultValue={defaultCustomStyle} onInput={(e) => setCustomStyle((e.target as CodeInputElement).value)} />
        </>
    );
}
