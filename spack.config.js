const { config } = require('@swc/core/spack');

module.exports = config({
    entry: {
        THEOplayerUI: __dirname + '/src/THEOplayerUI.ts'
    },
    output: {
        path: __dirname + '/dist'
    }
});
