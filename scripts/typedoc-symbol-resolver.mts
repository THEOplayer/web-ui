import type { Application } from 'typedoc';

export function load(app: Application) {
    app.converter.addUnknownSymbolResolver((declaration, _refl, _part, _symbolId) => {
        // The Lit docs have some references to `html` and `css` without importing these types from `lit-element`.
        // Resolve them manually.
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
