import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import { minify, swc } from 'rollup-plugin-swc3';
import { minifyHTML } from './build/minify-html.mjs';
import postcss from 'rollup-plugin-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import postcssMixins from 'postcss-mixins';
import { readFile } from 'fs/promises';
import { string } from 'rollup-plugin-string';
import dts from 'rollup-plugin-dts';

const fileName = 'THEOplayerUI';
const umdName = 'THEOplayerUI';

const { browserslist: browserslistModern, version, license } = JSON.parse(await readFile('./package.json', { encoding: 'utf8' }));
const browserslistLegacy = ['last 2 versions', 'ie >= 11'];
const production = process.env.BUILD === 'production';

const banner = `/*!
 * THEOplayer Web UI v${version}
 * License: ${license}
 */`;
const theoplayerModule = 'theoplayer/THEOplayer.chromeless';

export default defineConfig([
    {
        input: './src/index.ts',
        output: [
            {
                file: `./dist/${fileName}.js`,
                format: 'umd',
                name: umdName,
                sourcemap: true,
                indent: false,
                banner,
                globals: {
                    [theoplayerModule]: 'THEOplayer'
                }
            },
            {
                file: `./dist/${fileName}.mjs`,
                format: 'es',
                sourcemap: true,
                indent: false
            }
        ],
        context: 'self',
        external: [theoplayerModule],
        plugins: jsPlugins({ es5: false, production, sourcemap: true })
    },
    {
        input: './src/index.ts',
        output: [
            {
                file: `./dist/${fileName}.es5.js`,
                format: 'umd',
                name: umdName,
                sourcemap: false,
                indent: false,
                banner,
                globals: {
                    [theoplayerModule]: 'THEOplayer'
                }
            },
            {
                file: `./dist/${fileName}.es5.mjs`,
                format: 'es',
                sourcemap: false,
                indent: false
            }
        ],
        context: 'self',
        external: [theoplayerModule],
        plugins: jsPlugins({ es5: true, production, sourcemap: false })
    },
    {
        input: './src/index.ts',
        output: [
            {
                file: `./dist/${fileName}.d.ts`,
                format: 'es',
                indent: false,
                banner,
                footer: `export as namespace ${umdName};`
            }
        ],
        external: [theoplayerModule],
        plugins: [dts()]
    }
]);

/**
 * @return {import("rollup").Plugin[]}
 */
function jsPlugins({ es5 = false, production = false, sourcemap = false }) {
    const browserslist = es5 ? browserslistLegacy : browserslistModern;
    return [
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
            sourceMaps: sourcemap,
            tsconfig: false,
            env: {
                loose: true,
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
            sourceMaps: sourcemap,
            tsconfig: false,
            env: {
                loose: true,
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
                      sourceMap: sourcemap,
                      mangle: {
                          toplevel: true
                      },
                      toplevel: true,
                      ecma: es5 ? 5 : 2017
                  })
              ]
            : [])
    ];
}
