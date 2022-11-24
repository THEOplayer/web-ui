import { createFilter } from '@rollup/pluginutils';
import { minify } from 'html-minifier';

export function minifyHTML({ include, exclude, ...options } = {}) {
    const filter = createFilter(include, exclude);
    return {
        name: 'minify-html',
        transform: (code, id) => {
            if (!filter(id)) return null;
            const result = minify(code, options);
            return { code: result, map: null };
        }
    };
}
