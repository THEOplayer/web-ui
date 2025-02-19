/** @type {import('typedoc').TypeDocOptions} */
export default {
    extends: ['../typedoc.config.mjs'],
    entryPoints: ['src/index.ts'],
    out: '../react-api',
    hostedBaseUrl: 'https://theoplayer.github.io/web-ui/react-api/',
    plugin: ['typedoc-plugin-external-resolver', 'typedoc-plugin-mdn-links'],
    readme: 'none',
    navigationLinks: {
        GitHub: 'https://github.com/THEOplayer/web-ui/tree/main/react'
    },
    highlightLanguages: ['jsx'],
    externalDocumentation: {
        theoplayer: {
            dtsPath: '~/THEOplayer.d.ts',
            externalBaseURL: 'https://www.theoplayer.com/docs/theoplayer/v8/api-reference/web'
        },
        '@theoplayer/web-ui': {
            dtsPath: '~/dist/THEOplayerUI.d.ts',
            externalBaseURL: '/web-ui/api'
        }
    },
    externalSymbolLinkMappings: {
        react: {
            '*': 'https://react.dev/reference/react'
        }
    }
};
