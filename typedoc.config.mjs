/** @type {import('typedoc').TypeDocOptions} */
export default {
    entryPoints: ['src/index.ts'],
    out: 'api',
    hostedBaseUrl: 'https://theoplayer.github.io/web-ui/api/',
    readme: 'none',
    plugin: ['typedoc-plugin-external-resolver', 'typedoc-plugin-mdn-links'],
    navigationLinks: {
        GitHub: 'https://github.com/THEOplayer/web-ui'
    },
    githubPages: true,
    excludePrivate: true,
    excludeInternal: true,
    excludeExternals: true,
    externalDocumentation: {
        theoplayer: {
            dtsPath: '~/THEOplayer.d.ts',
            externalBaseURL: 'https://www.theoplayer.com/docs/theoplayer/v8/api-reference/web'
        }
    }
};
