import esbuild from 'esbuild';
import swc from '@swc/core';
import {writeFile} from 'fs/promises';

const buildStart = process.hrtime();
const bundle = await esbuild.build({
    bundle: true,
    write: false,
    platform: 'browser',
    entryPoints: ['./src/THEOplayerUI.ts'],
    outfile: './dist/THEOplayerUI.js',
    format: 'esm',
    target: 'es2019',
    sourcemap: true,
    tsconfig: './tsconfig.json',
});
const bundleEnd = process.hrtime(buildStart);
console.log(`Bundling took ${bundleEnd[0]}s ${bundleEnd[1] / 1e6}ms`);
const transpileStart = process.hrtime();
for (const outputFile of bundle.outputFiles.filter(x => x.path.endsWith(".js"))) {
    const sourceMapPath = `${outputFile.path}.map`;
    const inputSourceMap = bundle.outputFiles.find(x => x.path === sourceMapPath);
    const transpiled = await swc.transform(outputFile.text, {
        filename: outputFile.path,
        inputSourceMap: inputSourceMap?.text
    });
    await writeFile(outputFile.path, transpiled.code, {encoding: 'utf8'});
    if (transpiled.map) {
        await writeFile(sourceMapPath, transpiled.map, {encoding: 'utf8'});
    }
}
const transpileEnd = process.hrtime(transpileStart);
const buildEnd = process.hrtime(buildStart);
console.log(`Transpiling took ${transpileEnd[0]}s ${transpileEnd[1] / 1e6}ms`);
console.log(`Done in ${buildEnd[0]}s ${buildEnd[1] / 1e6}ms`);
