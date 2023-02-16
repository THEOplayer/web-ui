import { defineConfig } from 'rollup';
import { typescriptPaths } from 'rollup-plugin-typescript-resolve';
import nodeResolve from '@rollup/plugin-node-resolve';
import { minify, swc } from 'rollup-plugin-swc3';
import { minifyHTML } from './build/minify-html.mjs';
import postcss from 'rollup-plugin-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import postcssMixins from 'postcss-mixins';
import { readFile } from 'fs/promises';
import { string } from 'rollup-plugin-string';

const { browserslist } = JSON.parse(await readFile('./package.json', { encoding: 'utf8' }));
const production = process.env.BUILD === 'production';

export default defineConfig([
    {
        input: './src/index.ts',
        output: [
            {
                file: './dist/THEOplayerUI.js',
                format: 'umd',
                name: 'THEOplayerUI',
                sourcemap: true,
                indent: false,
                globals: {
                    theoplayer: 'THEOplayer'
                }
            },
            {
                file: './dist/THEOplayerUI.mjs',
                format: 'es',
                sourcemap: true,
                indent: false
            }
        ],
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
                minimize: production
            }),
            // Minify HTML and CSS.
            minifyHTML({
                include: ['./src/**/*.html'],
                removeComments: production,
                removeRedundantAttributes: true,
                sortClassName: true,
                collapseWhitespace: production
            }),
            // Import HTML and SVG as strings.
            string({
                include: ['./src/**/*.html', './src/**/*.svg']
            }),
            // Transpile TypeScript.
            swc({
                include: './src/**',
                sourceMaps: true,
                tsconfig: false,
                env: {
                    targets: browserslist
                },
                jsc: {
                    loose: true,
                    externalHelpers: true,
                    parser: {
                        syntax: 'typescript'
                    }
                }
            }),
            // Transpile dependencies for older browsers.
            swc({
                include: './node_modules/**',
                exclude: './src/**',
                sourceMaps: true,
                tsconfig: false,
                env: {
                    targets: browserslist
                },
                jsc: {
                    loose: true,
                    externalHelpers: true
                }
            }),
            ...(production
                ? [
                      minify({
                          sourceMap: true,
                          mangle: {
                              toplevel: true
                          },
                          toplevel: true
                      })
                  ]
                : [])
        ]
    }
]);
