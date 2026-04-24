import type {Config} from '@custom-elements-manifest/analyzer';

module.exports = {
    globs: ['src/**/*.ts'],
    outdir: 'dist/',
    dependencies: false,
    packagejson: true,
    litelement: true
} satisfies Config;
