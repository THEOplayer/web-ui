import React, { type JSX, useEffect, useState } from 'react';
import Example, { type Props as ExampleProps } from '../../components/Example';
import { type SourceName, sources } from '../../components/sources';

export interface Props extends ExampleProps {}

export default function ReactExample(props: Props): JSX.Element {
    const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
    const [sourceName, setSourceName] = useState<SourceName>('hls');

    // Send message to <iframe> when source changes
    useEffect(() => {
        iframe?.contentWindow?.postMessage({
            type: 'source',
            source: sources[sourceName]
        });
    }, [iframe, sourceName]);

    return (
        <Example
            ref={setIframe}
            {...props}
            options={
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
            }
        />
    );
}
