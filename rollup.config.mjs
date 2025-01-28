import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import { minify, swc } from 'rollup-plugin-swc3';
import { minifyHTML } from './scripts/minify-html.mjs';
import minifyHtmlLiterals from 'rollup-plugin-minify-html-literals-v3';
import postcss from 'rollup-plugin-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import postcssMixins from 'postcss-mixins';
import * as path from 'node:path';
import { readFile } from 'node:fs/promises';
import { string } from 'rollup-plugin-string';
import replace from '@rollup/plugin-replace';
import dts from 'rollup-plugin-dts';
import inject from '@rollup/plugin-inject';
import virtual from '@rollup/plugin-virtual';
import json from '@rollup/plugin-json';

const fileName = 'THEOplayerUI';
const umdName = 'THEOplayerUI';

const { browserslist: browserslistModern, version, license } = JSON.parse(await readFile('./package.json', { encoding: 'utf8' }));
const browserslistLegacy = ['last 2 versions', 'ie >= 11'];
const production = process.env.BUILD === 'production';

const banner = `/*!
 * THEOplayer Open Video UI for Web (v${version})
 * License: ${license}
 */`;
const theoplayerModule = 'theoplayer/chromeless';
const domShimModule = '@lit-labs/ssr-dom-shim';

/**
 * @param {{configOutputDir?: string}} cliArgs
 * @return {import("rollup").RollupOptions[]}
 */
export default (cliArgs) => {
    const outputDir = cliArgs.configOutputDir || './dist';
    return defineConfig([
        ...jsConfig(outputDir, { es5: false, node: true, production, sourcemap: true }),
        ...jsConfig(outputDir, { es5: true, production, sourcemap: false }),
        {
            input: './src/polyfills.ts',
            output: {
                file: path.join(outputDir, `${fileName}.polyfills.js`),
                format: 'iife',
                sourcemap: false,
                indent: false,
                banner
            },
            context: 'self',
            plugins: jsPlugins({ es5: true, module: false, production: true, sourcemap: false }),
            onwarn
        },
        {
            input: './src/index.ts',
            output: {
                file: path.join(outputDir, `${fileName}.d.ts`),
                format: 'es',
                indent: false,
                banner,
                footer: `export as namespace ${umdName};`
            },
            external: [theoplayerModule],
            plugins: [dts()]
        }
    ]);
};

/**
 * @return {import("rollup").RollupOptions[]}
 */
function jsConfig(outputDir, { es5 = false, node = false, production = false, sourcemap = false }) {
    return defineConfig([
        {
            input: './src/index.ts',
            output: {
                file: path.join(outputDir, `${fileName}${es5 ? '.es5' : ''}.js`),
                format: 'umd',
                name: umdName,
                sourcemap,
                indent: false,
                banner,
                globals: {
                    [theoplayerModule]: 'THEOplayer'
                }
            },
            context: 'self',
            external: [theoplayerModule],
            plugins: jsPlugins({ es5, module: false, production, sourcemap }),
            onwarn
        },
        {
            input: './src/index.ts',
            output: {
                file: path.join(outputDir, `${fileName}${es5 ? '.es5' : ''}.mjs`),
                format: 'es',
                sourcemap,
                indent: false,
                banner
            },
            context: 'self',
            external: [theoplayerModule],
            plugins: jsPlugins({ es5, module: true, production, sourcemap }),
            onwarn
        },
        node && {
            input: './src/index.ts',
            output: {
                file: path.join(outputDir, `${fileName}.node${es5 ? '.es5' : ''}.mjs`),
                format: 'es',
                sourcemap,
                indent: false,
                banner
            },
            context: 'globalThis',
            external: [domShimModule],
            plugins: jsPlugins({ es5, node, module: true, production, sourcemap }),
            onwarn
        }
    ]).filter(Boolean);
}

/**
 * @return {import("rollup").Plugin[]}
 */
function jsPlugins({ es5 = false, node = false, module = false, production = false, sourcemap = false }) {
    const browserslist = es5 ? browserslistLegacy : browserslistModern;
    const ecmaVersion = es5 ? 5 : 2017;
    const minifyHtmlOptions = {
        removeComments: production,
        removeRedundantAttributes: true,
        sortClassName: true,
        collapseWhitespace: production
    };
    return [
        nodeResolve({
            exportConditions: [
                // Use Lit's Node entry point for SSR
                node ? 'node' : 'browser',
                production ? false : 'development'
            ].filter(Boolean)
        }),
        // For Node, stub out THEOplayer.
        node &&
            virtual({
                include: './src/**',
                // Remove THEOplayer altogether.
                [theoplayerModule]: `export const ChromelessPlayer = undefined;`,
                // Remove createTemplate() helper.
                ['./src/util/TemplateUtils']: `export function createTemplate() { return () => undefined; }`
            }),
        json(),
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
            minifyOptions: minifyHtmlOptions
        }),
        minifyHtmlLiterals({
            include: ['./src/**/*.ts'],
            options: {
                minifyOptions: minifyHtmlOptions
            }
        }),
        // Import HTML and SVG as strings.
        string({
            include: ['./src/**/*.html', './src/**/*.svg']
        }),
        es5 &&
            replace({
                include: './node_modules/lit-html/**',
                preventAssignment: true,
                delimiters: ['', ''],
                values: {
                    // Replace `globalThis` in lit-html.
                    globalThis: 'self',
                    // HACK: Fix lit-html for IE11.
                    // d.createTreeWalker(d, 129 /* NodeFilter.SHOW_{ELEMENT|COMMENT} */)
                    // ^ This needs additional arguments in IE11.
                    [`129 /* NodeFilter.SHOW_{ELEMENT|COMMENT} */);`]: `129 /* NodeFilter.SHOW_{ELEMENT|COMMENT} */, null, false);`,
                    [`129);`]: `129,null,false);`
                }
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
        // For Node, inject SSR shims for custom elements.
        node &&
            inject({
                include: './src/**',
                sourceMap: sourcemap,
                modules: {
                    HTMLElement: [domShimModule, 'HTMLElement'],
                    customElements: [domShimModule, 'customElements']
                }
            }),
        // Minify production builds.
        production &&
            minify({
                sourceMap: sourcemap,
                mangle: {
                    toplevel: true
                },
                toplevel: true,
                module,
                ecma: ecmaVersion
            })
    ].filter(Boolean);
}

/**
 * @type {import("rollup").WarningHandlerWithDefault}
 */
function onwarn(warning, handler) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
        return; // Ignore circular dependency warnings
    }
    handler(warning);
}
