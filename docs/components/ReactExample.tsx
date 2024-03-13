import React, { type JSX, useEffect, useState } from 'react';
import Example, { type Props as ExampleProps } from './Example';

const sources = {
    hls: {
        sources: { src: 'https://cdn.theoplayer.com/video/elephants-dream/playlist.m3u8' },
        metadata: { title: "Elephant's Dream" },
        textTracks: [
            {
                default: true,
                src: 'https://cdn.theoplayer.com/video/elephants-dream/thumbnails.vtt',
                label: 'thumbnails',
                kind: 'metadata'
            }
        ]
    },
    dash: {
        sources: { src: 'https://cdn.theoplayer.com/video/big_buck_bunny/big_buck_bunny.m3u8' },
        metadata: { title: 'Big Buck Bunny' }
    }
};

export interface Props extends ExampleProps {}

export default function ReactExample(props: Props): JSX.Element {
    const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
    const [sourceName, setSourceName] = useState('hls');

    // Send message to <iframe> when source changes
    useEffect(() => {
        iframe?.contentWindow.postMessage({
            type: 'source',
            source: sources[sourceName]
        });
    }, [iframe, sourceName]);

    return (
        <>
            <p>
                <label>
                    Source:&nbsp;
                    <select value={sourceName} onChange={(ev) => setSourceName(ev.target.value)}>
                        {Object.entries(sources).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value.metadata.title}
                            </option>
                        ))}
                    </select>
                </label>
            </p>
            <Example ref={setIframe} {...props} />
        </>
    );
}
