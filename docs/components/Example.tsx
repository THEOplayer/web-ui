import React, { type ComponentPropsWithoutRef, type JSX, useEffect, useRef, useState } from 'react';

export interface Props extends ComponentPropsWithoutRef<'iframe'> {}

export default function Example(props: Props): JSX.Element {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

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
}
