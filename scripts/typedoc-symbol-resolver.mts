import type { Application } from 'typedoc';

/**
 * Resolves references to `html` and `css` in Lit docs,
 * which are lacking an explicit import from `lit-element`.
 */
export function load(app: Application) {
    app.converter.addUnknownSymbolResolver((declaration, _refl, _part, _symbolId) => {
        if (declaration.moduleSource === undefined) {
            const path = declaration.symbolReference?.path;
            if (path && path.length === 1) {
                switch (path[0].path) {
                    case 'css':
                        return 'https://lit.dev/docs/api/styles/#css';
                    case 'html':
                        return 'https://lit.dev/docs/api/templates/#html';
                }
            }
        }
    });
}
