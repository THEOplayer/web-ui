import { defineConfig } from 'rollup';
import { typescriptPaths } from 'rollup-plugin-typescript-resolve';
import nodeResolve from '@rollup/plugin-node-resolve';
import swcPlugin from 'rollup-plugin-swc';
import { minifyHTML } from './build/minify-html.mjs';
import postcss from 'rollup-plugin-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import postcssMixins from 'postcss-mixins';
import { readFile } from 'fs/promises';
import { string } from 'rollup-plugin-string';

const { default: swc } = swcPlugin;
const { browserslist } = JSON.parse(await readFile('./package.json', { encoding: 'utf8' }));

export default defineConfig({
    input: './src/index.ts',
    output: {
        file: './dist/THEOplayerUI.js',
        format: 'umd',
        name: 'THEOplayerUI',
        sourcemap: true,
        indent: false,
        globals: {
            theoplayer: 'THEOplayer'
        }
    },
    context: 'self',
    external: ['theoplayer'],
    plugins: [
        // Use TypeScript's module resolution for source files, and Node's for dependencies.
        typescriptPaths(),
        nodeResolve(),
        // Run PostCSS on .css files.
        postcss({
            include: './src/**/*.css',
            inject: false,
            plugins: [
                postcssPresetEnv({
                    browsers: browserslist,
                    autoprefixer: { grid: 'no-autoplace' },
                    enableClientSidePolyfills: false
                }),
                postcssMixins()
            ],
            minimize: true
        }),
        // Minify HTML and CSS.
        minifyHTML({
            include: ['./src/**/*.html'],
            removeComments: true,
            removeRedundantAttributes: true,
            sortClassName: true,
            collapseWhitespace: true
        }),
        // Import HTML and SVG as strings.
        string({
            include: ['./src/**/*.html', './src/**/*.svg']
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
                externalHelpers: true,
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
                loose: true,
                externalHelpers: true
            }
        })
    ]
});
