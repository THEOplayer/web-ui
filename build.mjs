import esbuild from 'esbuild';
import swc from '@swc/core';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import { readFile, writeFile } from 'fs/promises';
import minimist from 'minimist';

/**
 * @type {import("esbuild").BuildOptions}
 */
const bundleOptions = {
    bundle: true,
    platform: 'browser',
    entryPoints: ['./src/index.ts'],
    outfile: './dist/THEOplayerUI.js',
    format: 'esm',
    target: 'es2019',
    sourcemap: true,
    tsconfig: './tsconfig.json',
    loader: {
        '.css': 'text',
        '.html': 'text'
    },
    plugins: [postcssPlugin([autoprefixer()]), swcPlugin()]
};

async function main() {
    const argv = minimist(process.argv.slice(2), {
        boolean: ['watch']
    });
    if (argv.watch) {
        await watch();
    } else {
        await build();
    }
}

async function build() {
    const buildStart = process.hrtime();
    const bundle = await esbuild.build({
        ...bundleOptions,
        write: false
    });
    await writeOutputFiles(bundle.outputFiles);
    const buildEnd = process.hrtime(buildStart);
    console.log(`Done in ${buildEnd[0]}s ${buildEnd[1] / 1e6}ms`);
}

async function watch() {
    const bundle = await esbuild.build({
        ...bundleOptions,
        write: false,
        watch: {
            async onRebuild(error, result) {
                if (!error && result) {
                    await writeOutputFiles(result.outputFiles);
                }
            }
        }
    });
    await writeOutputFiles(bundle.outputFiles);
    console.log(`Watching...`);
}

/**
 * @param {import("@swc/core").Options} swcOptions
 * @returns {import("esbuild").Plugin}
 */
function swcPlugin(swcOptions = {}) {
    return {
        name: 'swcPlugin',
        setup(build) {
            build.onEnd(async (result) => {
                for (const jsFile of result.outputFiles.filter((x) => x.path.endsWith('.js'))) {
                    const mapFile = result.outputFiles.find((x) => x.path === `${jsFile.path}.map`);
                    const transpiled = await swc.transform(jsFile.text, {
                        filename: jsFile.path,
                        inputSourceMap: mapFile?.text,
                        ...swcOptions
                    });
                    updateOutputFile(jsFile, transpiled.code);
                    if (mapFile && transpiled.map) {
                        updateOutputFile(mapFile, transpiled.map);
                    }
                }
            });
        }
    };
}

/**
 * @param {import("postcss").AcceptedPlugin[]} plugins
 * @returns {import("esbuild").Plugin}
 */
function postcssPlugin(plugins) {
    return {
        name: 'postcssPlugin',
        setup(build) {
            build.onLoad({ filter: /\.css$/ }, async (args) => {
                const input = await readFile(args.path, { encoding: 'utf8' });
                const result = await postcss(plugins).process(input, { from: args.path });
                return {
                    contents: result.css,
                    warnings: convertPostcssWarnings(args.path, input, result.warnings()),
                    loader: 'text'
                };
            });
        }
    };
}

/**
 * @param {string} path
 * @param {string} source
 * @param {import("postcss").Warning[]} warnings
 * @returns {import("esbuild").PartialMessage[]}
 */
function convertPostcssWarnings(path, source, warnings) {
    if (warnings.length === 0) {
        return warnings;
    }
    const sourceLines = source.split(/\r\n|\r|\n/g);
    return warnings.map((warning) => {
        let lineText = sourceLines[warning.line - 1];
        let lineEnd = warning.line === warning.line ? warning.column : lineText.length;
        return {
            text: `[${warning.plugin}] ${warning.text}`,
            location: {
                file: path,
                line: warning.line, // 1-based
                column: warning.column - 1, // 0-based
                length: lineEnd - warning.column,
                lineText
            }
        };
    });
}

/**
 * @param {import("esbuild").OutputFile} outputFile
 * @param {string} text
 */
function updateOutputFile(outputFile, text) {
    outputFile.contents = new TextEncoder().encode(text);
}

/**
 * @param {import("esbuild").OutputFile[]} outputFiles
 */
async function writeOutputFiles(outputFiles) {
    for (const outputFile of outputFiles) {
        await writeFile(outputFile.path, outputFile.contents);
    }
}

await main();
