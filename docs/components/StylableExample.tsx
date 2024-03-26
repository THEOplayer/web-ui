import React, { type JSX, useEffect, useState } from 'react';
import Example, { type Props as ExampleProps } from './Example';
import { CodeInput, CodeInputElement } from '@site/src/components/CodeInput';

export interface Props extends ExampleProps {
    defaultCustomStyle?: string;
}

export default function StylableExample({ defaultCustomStyle, ...props }: Props): JSX.Element {
    const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
    const [customStyle, setCustomStyle] = useState(defaultCustomStyle);

    // Send message to <iframe> when style changes
    useEffect(() => {
        iframe?.contentWindow?.postMessage({
            type: 'style',
            style: customStyle
        });
    }, [iframe, customStyle]);

    return (
        <>
            <Example ref={setIframe} {...props} />
            <CodeInput lang="CSS" onInput={(e) => setCustomStyle((e.target as CodeInputElement).value)}>
                {defaultCustomStyle}
            </CodeInput>
        </>
    );
}
