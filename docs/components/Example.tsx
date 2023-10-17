import React, { type ComponentPropsWithoutRef, type JSX, useEffect, useRef, useState } from 'react';
import { type SourceName, sources } from './sources';

export interface Props extends ComponentPropsWithoutRef<'iframe'> {
    hideSource?: boolean;
    hideDeviceType?: boolean;
    hideLocale?: boolean;
}

const locales = {
    en: 'English',
    nl: 'Nederlands (Dutch)'
} as const;

export default function Example({ hideSource, hideDeviceType, hideLocale, ...props }: Props): JSX.Element {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const [sourceName, setSourceName] = useState<SourceName>('bigBuckBunny');
    const [deviceType, setDeviceType] = useState('');
    const [locale, setLocale] = useState('en');

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

    // Send message to <iframe> when locale override changes
    useEffect(() => {
        iframeRef.current?.contentWindow?.postMessage({
            type: 'locale',
            locale: locale
        });
    }, [iframeRef.current, locale]);

    const showOptions = !hideSource || !hideDeviceType;
    return (
        <>
            <iframe ref={iframeRef} {...props}></iframe>
            {showOptions && (
                <p>
                    {!hideSource && (
                        <div>
                            <label style={{ userSelect: 'none' }}>
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
                    {!hideLocale && (
                        <div>
                            <label style={{ userSelect: 'none' }}>
                                Language:{' '}
                                <select value={locale} onChange={(ev) => setLocale(ev.target.value)}>
                                    {Object.entries(locales).map(([key, value]) => (
                                        <option key={key} value={key}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}
                </p>
            )}
        </>
    );
}
