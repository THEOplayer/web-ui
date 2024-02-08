import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { minify, swc } from 'rollup-plugin-swc3';
import * as path from 'node:path';
import { readFile } from 'node:fs/promises';
import dts from 'rollup-plugin-dts';

const fileName = 'THEOplayerReactUI';
const umdName = 'THEOplayerReactUI';

const { browserslist: browserslistModern, version, license } = JSON.parse(await readFile('./package.json', { encoding: 'utf8' }));
const browserslistLegacy = ['last 2 versions', 'ie >= 11'];
const production = process.env.BUILD === 'production';

const banner = `/*!
 * THEOplayer Open Video UI for React (v${version})
 * License: ${license}
 */`;
const externals = {
    react: 'React',
    '@theoplayer/web-ui': 'THEOplayerUI',
    '@theoplayer/web-ui/es5': 'THEOplayerUI'
};

/**
 * @param {{configOutputDir?: string}} cliArgs
 * @return {import("rollup").RollupOptions[]}
 */
export default (cliArgs) => {
    const outputDir = cliArgs.configOutputDir || './dist';
    return defineConfig([
        ...jsConfig(outputDir, { es5: false, production, sourcemap: true }),
        ...jsConfig(outputDir, { es5: true, production, sourcemap: false }),
        {
            input: './src/index.ts',
            output: {
                file: path.join(outputDir, `${fileName}.d.ts`),
                format: 'es',
                indent: false,
                banner,
                footer: `export as namespace ${umdName};`
            },
            plugins: [nodeResolve(), dts()]
        }
    ]);
};

/**
 * @return {import("rollup").RollupOptions[]}
 */
function jsConfig(outputDir, { es5 = false, production = false, sourcemap = false }) {
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
                globals: externals
            },
            context: 'self',
            external: Object.keys(externals),
            plugins: jsPlugins({ es5, module: false, production, sourcemap })
        },
        {
            input: './src/index.ts',
            output: {
                file: path.join(outputDir, `${fileName}${es5 ? '.es5' : ''}.mjs`),
                format: 'es',
                sourcemap,
                indent: false
            },
            context: 'self',
            external: Object.keys(externals),
            plugins: jsPlugins({ es5, module: true, production, sourcemap })
        }
    ]);
}

/**
 * @return {import("rollup").Plugin[]}
 */
function jsPlugins({ es5 = false, module = false, production = false, sourcemap = false }) {
    const browserslist = es5 ? browserslistLegacy : browserslistModern;
    return [
        es5 &&
            replace({
                include: './src/**',
                sourceMap: sourcemap,
                preventAssignment: true,
                delimiters: ['', ''],
                values: {
                    // react-ui's ES5 version depends on web-ui's ES5 version
                    "'@theoplayer/web-ui'": "'@theoplayer/web-ui/es5'"
                }
            }),
        nodeResolve(),
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
                    syntax: 'typescript',
                    tsx: true
                },
                transform: {
                    react: {
                        runtime: 'classic'
                    }
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
        production &&
            minify({
                sourceMap: sourcemap,
                mangle: {
                    toplevel: true
                },
                toplevel: true,
                module,
                ecma: es5 ? 5 : 2017
            })
    ].filter(Boolean);
}
