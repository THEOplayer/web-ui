import { defineConfig } from 'rollup';
import { typescriptPaths } from 'rollup-plugin-typescript-resolve';
import nodeResolve from '@rollup/plugin-node-resolve';
import swcPlugin from 'rollup-plugin-swc';
import replace from '@rollup/plugin-replace';
import { minifyHTML } from './build/minify-html-literals.mjs';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import autoprefixer from 'autoprefixer';
import { readFile } from 'fs/promises';

const { default: swc } = swcPlugin;
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
        // Use TypeScript's module resolution for source files, and Node's for dependencies.
        typescriptPaths(),
        nodeResolve(),
        // Replace `globalThis` with `self` for older browsers.
        replace({
            include: ['./node_modules/lit/**', './node_modules/lit-element/**'],
            preventAssignment: true,
            delimiters: ['\\b', '\\b'],
            values: {
                globalThis: 'self'
            }
        }),
        // Run PostCSS on .css files, and wrap them in a `css` tagged template literal for use in Lit.
        postcss({
            include: './src/**/*.css',
            inject: false,
            plugins: [autoprefixer()]
        }),
        postcssLit({
            include: './src/**/*.css',
            importPackage: 'lit'
        }),
        // Minify HTML and CSS inside tagged template literals.
        minifyHTML({
            include: './src/**'
        }),
        // Transpile TypeScript.
        swc({
            rollup: {
                include: './src/**'
            },
            sourceMaps: true,
            env: {
                targets: browserslist
            },
            jsc: {
                loose: true,
                parser: {
                    syntax: 'typescript',
                    decorators: true
                }
            }
        }),
        // Transpile dependencies for older browsers.
        swc({
            rollup: {
                include: './node_modules/**',
                exclude: './src/**'
            },
            sourceMaps: true,
            env: {
                targets: browserslist
            },
            jsc: {
                loose: true
            }
        })
    ]
});
