import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import swc from 'rollup-plugin-swc3';
import replace from '@rollup/plugin-replace';
import { minifyHTML } from './build/minify-html-literals.mjs';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import autoprefixer from 'autoprefixer';
import { readFile } from 'fs/promises';

const { browserslist } = JSON.parse(await readFile('./package.json', { encoding: 'utf8' }));

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
        postcss({
            include: './src/**/*.css',
            inject: false,
            plugins: [autoprefixer()]
        }),
        postcssLit({
            include: './src/**/*.css',
            importPackage: 'lit'
        }),
        minifyHTML({
            include: './src/**'
        }),
        swc({
            include: './src/**',
            sourceMaps: true,
            tsconfig: './tsconfig.json',
            env: {
                targets: browserslist
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
                targets: browserslist
            },
            jsc: {
                loose: true
            }
        })
    ]
});
