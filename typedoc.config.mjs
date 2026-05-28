/** @type {import('typedoc').TypeDocOptions} */
export default {
    entryPoints: ['src/index.ts'],
    out: 'api',
    hostedBaseUrl: 'https://theoplayer.github.io/web-ui/api/',
    readme: 'none',
    plugin: [
        'typedoc-plugin-external-resolver',
        'typedoc-plugin-mdn-links',
        import.meta.resolve('./scripts/typedoc-lit-decorators.mts'),
        import.meta.resolve('./scripts/typedoc-symbol-resolver.mts'),
        import.meta.resolve('./scripts/typedoc-collapsible-tags.mts')
    ],
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
            externalBaseURL: 'https://www.theoplayer.com/docs/theoplayer/v11/api-reference/web'
        }
    },
    externalSymbolLinkMappings: {
        typescript: {
            'ARIAMixin.ariaLabel': 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label',
            'ARIAMixin.ariaValueText': 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuetext',
            'Intl.DurationFormatStyle':
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/DurationFormat#style',
            'Intl.NumberFormatOptions.style':
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#style',
            'Intl.NumberFormatOptions.unit':
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#unit_2',
            'Intl.DisplayNamesOptions.type':
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames/DisplayNames#type'
        },
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
