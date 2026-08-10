import React, { type ComponentPropsWithoutRef, type JSX, type Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { type SourceName, sources } from './sources';

export interface Controller {
    postMessage(message: any): void;
}

export interface Props extends ComponentPropsWithoutRef<'iframe'> {
    hideSource?: boolean;
    hideDeviceType?: boolean;
    // This is for the language selector on the Localization example.
    languages?: Record<string, string>;
    ref?: Ref<Controller> | undefined;
}

export default function Example({ hideSource, hideDeviceType, languages, ref, ...props }: Props): JSX.Element {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    useImperativeHandle(ref, () => {
        return {
            postMessage(message: any) {
                iframeRef.current?.contentWindow?.postMessage(message);
            }
        };
    }, []);

    const [sourceName, setSourceName] = useState<SourceName>('bigBuckBunny');
    const [deviceType, setDeviceType] = useState('');
    const [language, setLanguage] = useState(languages ? Object.keys(languages)[0] : '');

    // Send message to <iframe> when language changes
    useEffect(() => {
        if (!languages) return;
        iframeRef.current?.contentWindow?.postMessage({
            type: 'language',
            language: language
        });
    }, [iframeRef.current, language, languages]);

    // Send message to <iframe> when source changes
    useEffect(() => {
        if (hideSource) return;
        iframeRef.current?.contentWindow?.postMessage({
            type: 'source',
            source: sources[sourceName]
        });
    }, [iframeRef.current, sourceName, hideSource]);

    // Send message to <iframe> when device type override changes
    useEffect(() => {
        if (hideDeviceType) return;
        iframeRef.current?.contentWindow?.postMessage({
            type: 'deviceType',
            deviceType: deviceType
        });
    }, [iframeRef.current, deviceType, hideDeviceType]);

    const showOptions = !hideSource || !hideDeviceType || !!languages;
    return (
        <>
            <iframe ref={iframeRef} {...props}></iframe>
            {showOptions && (
                <div>
                    {languages && (
                        <div>
                            <label style={{ userSelect: 'none' }}>
                                Language:{' '}
                                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                    {Object.entries(languages).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}
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
                </div>
            )}
        </>
    );
}
