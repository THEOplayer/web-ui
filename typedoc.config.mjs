/** @type {import('typedoc').TypeDocOptions} */
export default {
    entryPoints: ['src/index.ts'],
    out: 'api',
    hostedBaseUrl: 'https://theoplayer.github.io/web-ui/api/',
    readme: 'none',
    plugin: ['typedoc-plugin-external-resolver', 'typedoc-plugin-mdn-links', import.meta.resolve('./scripts/typedoc-symbol-resolver.mjs')],
    navigationLinks: {
        GitHub: 'https://github.com/THEOplayer/web-ui'
    },
    githubPages: true,
    excludePrivate: true,
    excludeInternal: true,
    excludeExternals: true,
    excludeTags: [
        '@nocollapse' // appears a lot in Lit docs
    ],
    externalDocumentation: {
        theoplayer: {
            dtsPath: '~/THEOplayer.d.ts',
            externalBaseURL: 'https://www.theoplayer.com/docs/theoplayer/v8/api-reference/web'
        }
    },
    externalSymbolLinkMappings: {
        'lit-element': {
            LitElement: 'https://lit.dev/docs/api/LitElement/',
            '*': 'https://lit.dev/docs/'
        },
        '@lit/reactive-element': {
            html: 'https://lit.dev/docs/api/templates/#html',
            TemplateResult: 'https://lit.dev/docs/api/templates/#TemplateResult',
            css: 'https://lit.dev/docs/api/styles/#css',
            CSSResult: 'https://lit.dev/docs/api/styles/#CSSResult',
            '*': 'https://lit.dev/docs/'
        }
    }
};
