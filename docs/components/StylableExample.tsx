import React, { type JSX, useEffect, useState } from 'react';
import Example, { type Props as ExampleProps, useIframeDocument } from './Example';
import { CodeInput, CodeInputElement } from '@site/src/components/CodeInput';

export interface Props extends ExampleProps {
    defaultCustomStyle?: string;
}

export default function StylableExample({ defaultCustomStyle, ...props }: Props): JSX.Element {
    const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
    const iframeDocument = useIframeDocument(iframe);
    const [customStyle, setCustomStyle] = useState(defaultCustomStyle);

    // Update <style> with custom style
    useEffect(() => {
        const styleEl = iframeDocument?.querySelector('style#custom-style');
        if (styleEl) {
            styleEl.textContent = customStyle;
        }
    }, [iframeDocument, customStyle]);

    return (
        <>
            <Example ref={setIframe} {...props} />
            <CodeInput lang="CSS" onInput={(e) => setCustomStyle((e.target as CodeInputElement).value)}>
                {defaultCustomStyle}
            </CodeInput>
        </>
    );
}
