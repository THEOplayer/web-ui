import React, {
    type ComponentPropsWithoutRef,
    forwardRef,
    type JSX,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    useSyncExternalStore
} from 'react';

export interface Props extends ComponentPropsWithoutRef<'iframe'> {
    hideDeviceType?: boolean;
}

export default forwardRef<HTMLIFrameElement | null, Props>(function Example({ hideDeviceType, ...props }: Props, ref): JSX.Element {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    useImperativeHandle(ref, () => iframeRef.current, [iframeRef.current]);

    const [deviceType, setDeviceType] = useState('');
    const iframeDocument = useIframeDocument(iframeRef.current);
    useEffect(() => {
        if (!iframeDocument || !deviceType) return;
        const ui = iframeDocument.querySelector('theoplayer-default-ui, theoplayer-ui');
        ui?.setAttribute('device-type', deviceType);
    }, [iframeRef.current, deviceType]);

    return (
        <>
            <iframe ref={iframeRef} {...props}></iframe>
            {!hideDeviceType && (
                <p>
                    <label style={{ userSelect: 'none' }}>
                        Override device type{' '}
                        <select value={deviceType} onChange={(e) => setDeviceType(e.target.value)}>
                            <option value=""></option>
                            <option value="desktop">Desktop</option>
                            <option value="mobile">Mobile</option>
                            <option value="tv">TV</option>
                        </select>
                    </label>
                </p>
            )}
        </>
    );
});

/**
 * Returns `iframe.contentDocument`, but only when its ready state is "interactive" or "complete".
 */
export function useIframeDocument(iframe: HTMLIFrameElement | null): Document | null {
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
