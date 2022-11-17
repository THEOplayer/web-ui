import { createFilter } from '@rollup/pluginutils';
import { minifyHTMLLiterals } from 'minify-html-literals';

export function minifyHTML({ include, exclude, ...options } = {}) {
    const filter = createFilter(include, exclude);
    return {
        name: 'minify-html-template-literals',
        transform: (code, id) => {
            if (!filter(id)) return null;
            const result = minifyHTMLLiterals(code, { fileName: id, ...options });
            return result ? { code: result.code, map: result.map } : null;
        }
    };
}
