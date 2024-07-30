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
    poster?: string;
    textTracks?: TextTrackDescription[];
}

export const sources = {
    bigBuckBunny: {
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
    elephantsDream: {
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
    starWarsTrailer: {
        sources: {
            src: 'https://cdn.theoplayer.com/video/star_wars_episode_vii-the_force_awakens_official_comic-con_2015_reel_(2015)/index.m3u8'
        },
        metadata: {
            title: 'Star Wars Episode VII Trailer'
        },
        poster: 'https://cdn.theoplayer.com/video/star_wars_episode_vii-the_force_awakens_official_comic-con_2015_reel_(2015)/poster.jpg'
    }
} as const satisfies Record<string, SourceDescription>;

export type SourceName = keyof typeof sources;
