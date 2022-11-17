import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import swc from 'rollup-plugin-swc3';
import replace from '@rollup/plugin-replace';

export default defineConfig({
    input: './src/index.ts',
    output: {
        file: './dist/THEOplayerUI.js',
        format: 'umd',
        name: 'THEOplayerUI',
        sourcemap: true,
        indent: false
    },
    context: 'self',
    plugins: [
        nodeResolve(),
        replace({
            include: './node_modules/**',
            preventAssignment: true,
            delimiters: ['\\b', '\\b'],
            values: {
                globalThis: 'self'
            }
        }),
        swc({
            include: './src/**',
            sourceMaps: true,
            tsconfig: './tsconfig.json',
            env: {
                path: './package.json'
            },
            jsc: {
                loose: true
            }
        }),
        swc({
            include: './node_modules/**',
            exclude: './src/**',
            sourceMaps: true,
            tsconfig: false,
            env: {
                path: './package.json'
            },
            jsc: {
                loose: true
            }
        })
    ]
});
