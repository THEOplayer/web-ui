import React, { type ComponentPropsWithoutRef, forwardRef, type JSX, type ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface Props extends ComponentPropsWithoutRef<'iframe'> {
    hideDeviceType?: boolean;
    options?: ReactNode;
}

export default forwardRef<HTMLIFrameElement | null, Props>(function Example({ hideDeviceType, options, ...props }: Props, ref): JSX.Element {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    useImperativeHandle(ref, () => iframeRef.current, [iframeRef.current]);

    const [deviceType, setDeviceType] = useState('');

    // Send message to <iframe> when device type override changes
    useEffect(() => {
        iframeRef.current?.contentWindow.postMessage({
            type: 'deviceType',
            deviceType: deviceType
        });
    }, [iframeRef.current, deviceType]);

    return (
        <>
            <iframe ref={iframeRef} {...props}></iframe>
            {(options || !hideDeviceType) && (
                <p>
                    {!hideDeviceType && (
                        <div>
                            <label style={{ userSelect: 'none' }}>
                                Override device type:{' '}
                                <select value={deviceType} onChange={(e) => setDeviceType(e.target.value)}>
                                    <option value=""></option>
                                    <option value="desktop">Desktop</option>
                                    <option value="mobile">Mobile</option>
                                    <option value="tv">TV</option>
                                </select>
                            </label>
                        </div>
                    )}
                    {options}
                </p>
            )}
        </>
    );
});
