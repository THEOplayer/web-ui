import esbuild from 'esbuild';
import swc from '@swc/core';
import { writeFile } from 'fs/promises';

const buildStart = process.hrtime();
const bundle = await esbuild.build({
    bundle: true,
    write: false,
    platform: 'browser',
    entryPoints: ['./src/index.ts'],
    outfile: './dist/THEOplayerUI.js',
    format: 'esm',
    target: 'es2019',
    sourcemap: true,
    tsconfig: './tsconfig.json',
    plugins: [swcPlugin()]
});
for (const outputFile of bundle.outputFiles) {
    await writeFile(outputFile.path, outputFile.contents);
}
const buildEnd = process.hrtime(buildStart);
console.log(`Done in ${buildEnd[0]}s ${buildEnd[1] / 1e6}ms`);

/**
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
 * @param {import("esbuild").OutputFile} outputFile
 * @param {string} text
 */
function updateOutputFile(outputFile, text) {
    outputFile.contents = new TextEncoder().encode(text);
}
