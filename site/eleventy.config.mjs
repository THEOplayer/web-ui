export default function (eleventyConfig) {
    // https://www.11ty.dev/docs/copy/
    eleventyConfig.addPassthroughCopy({
        '../api/': './api/',
        '../react-api/': './react-api/'
    });
}
