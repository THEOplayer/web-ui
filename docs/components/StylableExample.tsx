import React, { type JSX, useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import Example, { type Props as ExampleProps } from './Example';
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
            <CodeInput lang="CSS" value={customStyle} onInput={(e) => setCustomStyle((e.target as CodeInputElement).value)} />
        </>
    );
}

/**
 * Returns `iframe.contentDocument`, but only when its ready state is "interactive" or "complete".
 */
function useIframeDocument(iframe: HTMLIFrameElement | null): Document | null {
    const subscribe = useCallback(
        (cb) => {
            const iframeWindow = iframe?.contentWindow;
            if (!iframeWindow) return;
            const iframeDocument = iframe?.contentDocument;
            iframeWindow.addEventListener('load', cb);
            iframeDocument?.addEventListener('readystatechange', cb);
            return () => {
                iframeWindow.removeEventListener('load', cb);
                iframeDocument?.removeEventListener('readystatechange', cb);
            };
        },
        [iframe]
    );
    return useSyncExternalStore(
        subscribe,
        () => {
            const iframeDocument = iframe?.contentDocument;
            if (!iframeDocument || iframeDocument.readyState === 'loading') {
                return null;
            }
            return iframeDocument;
        },
        () => null
    );
}
