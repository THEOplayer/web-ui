import React, { type ComponentPropsWithoutRef, forwardRef, type JSX, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface Props extends ComponentPropsWithoutRef<'iframe'> {
    customStyle?: string;
}

export default forwardRef<HTMLIFrameElement | null, Props>(function Example({ customStyle, ...props }: Props, ref): JSX.Element {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    useImperativeHandle(ref, () => iframeRef.current, [iframeRef.current]);

    const [deviceType, setDeviceType] = useState('');
    useEffect(() => {
        if (!iframeRef.current || !deviceType) return;
        const ui = iframeRef.current.contentDocument.querySelector('theoplayer-default-ui, theoplayer-ui');
        ui?.setAttribute('device-type', deviceType);
    }, [iframeRef.current, deviceType]);

    return (
        <>
            <iframe ref={iframeRef} {...props}></iframe>
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
        </>
    );
});