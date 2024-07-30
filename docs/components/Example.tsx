import React, { type ComponentPropsWithoutRef, forwardRef, type JSX, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { type SourceName, sources } from './sources';

export interface Props extends ComponentPropsWithoutRef<'iframe'> {
    hideSource?: boolean;
    hideDeviceType?: boolean;
}

export default forwardRef<HTMLIFrameElement | null, Props>(function Example({ hideSource, hideDeviceType, ...props }: Props, ref): JSX.Element {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    useImperativeHandle(ref, () => iframeRef.current, [iframeRef.current]);

    const [sourceName, setSourceName] = useState<SourceName>('hls');
    const [deviceType, setDeviceType] = useState('');

    // Send message to <iframe> when source changes
    useEffect(() => {
        iframeRef.current?.contentWindow?.postMessage({
            type: 'source',
            source: sources[sourceName]
        });
    }, [iframeRef.current, sourceName]);

    // Send message to <iframe> when device type override changes
    useEffect(() => {
        iframeRef.current?.contentWindow?.postMessage({
            type: 'deviceType',
            deviceType: deviceType
        });
    }, [iframeRef.current, deviceType]);

    const showOptions = !hideSource || !hideDeviceType;
    return (
        <>
            <iframe ref={iframeRef} {...props}></iframe>
            {showOptions && (
                <p>
                    {!hideSource && (
                        <div>
                            <label>
                                Source:{' '}
                                <select value={sourceName} onChange={(ev) => setSourceName(ev.target.value as SourceName)}>
                                    {Object.entries(sources).map(([key, value]) => (
                                        <option key={key} value={key}>
                                            {value.metadata.title}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}
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
                </p>
            )}
        </>
    );
});
