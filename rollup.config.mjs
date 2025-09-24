import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import { minify, swc } from 'rollup-plugin-swc3';
import { minifyHTML } from './scripts/minify-html.mjs';
import minifyHtmlLiterals from 'rollup-plugin-minify-html-literals-v3';
import postcss from 'rollup-plugin-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import postcssMixins from 'postcss-mixins';
import postcssLit from 'rollup-plugin-postcss-lit';
import * as path from 'node:path';
import { readFile } from 'node:fs/promises';
import { string } from 'rollup-plugin-string';
import replace from '@rollup/plugin-replace';
import dts from 'rollup-plugin-dts';
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
const globals = {
    [theoplayerModule]: 'THEOplayer'
};
const external = Object.keys(globals);
const nodeExternal = [/^lit/, /^@lit/];

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
            plugins: jsPlugins({ es5: true, module: false, production: true, sourcemap: false })
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
            external,
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
                globals
            },
            context: 'self',
            external,
            plugins: jsPlugins({ es5, module: false, production, sourcemap })
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
            external,
            plugins: jsPlugins({ es5, module: true, production, sourcemap })
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
            external: nodeExternal,
            plugins: jsPlugins({ es5, node, module: true, production, sourcemap })
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
                [theoplayerModule]: `export const ChromelessPlayer = undefined;`
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
        postcssLit({
            include: './src/**/*.css'
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
                include: ['./node_modules/lit/**', './node_modules/lit-html/**', './node_modules/@lit/**'],
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
            extensions: ['.ts', '.js', '.html', '.css'],
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
                    syntax: 'typescript',
                    decorators: true
                },
                transform: {
                    decoratorVersion: '2022-03'
                }
            }
        }),
        // Transpile dependencies for older browsers.
        swc({
            include: './node_modules/**',
            exclude: ['./src/**', './node_modules/@swc/helpers/**'],
            sourceMaps: sourcemap,
            tsconfig: false,
            env: {
                loose: false,
                targets: browserslist
            },
            jsc: {
                loose: false,
                externalHelpers: true,
                assumptions: {
                    constantSuper: true,
                    noDocumentAll: true,
                    ignoreFunctionName: true,
                    ignoreFunctionLength: true,
                    ignoreToPrimitiveHint: true,
                    iterableIsArray: false // must NEVER be true!
                }
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
