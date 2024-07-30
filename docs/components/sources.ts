interface TypedSource {
    src: string;
    type?: string;
}

interface TextTrackDescription {
    src: string;
    srclang?: string;
    kind?: string;
    format?: string;
    label?: string;
    id?: string;
    default?: boolean;
}

interface SourceDescription {
    sources: TypedSource | TypedSource[];
    metadata: {
        title: string;
    };
    textTracks?: TextTrackDescription[];
}

export const sources = {
    hls: {
        sources: { src: 'https://cdn.theoplayer.com/video/big_buck_bunny/big_buck_bunny.m3u8' },
        metadata: { title: 'Big Buck Bunny' },
        textTracks: [
            {
                default: true,
                src: 'https://cdn.theoplayer.com/video/big_buck_bunny/thumbnails.vtt',
                label: 'thumbnails',
                kind: 'metadata'
            }
        ]
    },
    dash: {
        sources: { src: 'https://cdn.theoplayer.com/video/big_buck_bunny/big_buck_bunny.m3u8' },
        metadata: { title: 'Big Buck Bunny' }
    }
} as const satisfies Record<string, SourceDescription>;

export type SourceName = keyof typeof sources;
