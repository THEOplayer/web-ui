# THEOplayer Open Video UI for Web

[![NPM version](https://img.shields.io/npm/v/%40theoplayer%2Fweb-ui)](https://www.npmjs.com/package/@theoplayer/web-ui)
[![Build status](https://github.com/THEOplayer/web-ui/workflows/CI/badge.svg)](https://github.com/THEOplayer/web-ui/actions/workflows/ci.yml)
[![API docs](https://img.shields.io/badge/api%20docs-orange.svg)](https://theoplayer.github.io/web-ui/api/)
[![GitHub issues](https://img.shields.io/github/issues/THEOplayer/web-ui)](https://github.com/THEOplayer/web-ui/issues)

A component library for building a world-class video player experience powered by
the [THEOplayer Web SDK](https://www.theoplayer.com/product/theoplayer).

- Use the default UI for a great out-of-the-box experience, or use the individual components to build your own custom UI.
- Built using [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components), so works great with (or without) any app framework.
- Easy to customize: use HTML to lay out your controls, and CSS to style them.

| ![Screenshot on desktop](https://raw.githubusercontent.com/THEOplayer/web-ui/v1.0.0/docs/assets/screenshot-desktop.png) | ![Screenshot on mobile](https://raw.githubusercontent.com/THEOplayer/web-ui/v1.0.0/docs/assets/screenshot-mobile.png) |
| :---------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------: |
|                                                         Desktop                                                         |                                                        Mobile                                                         |

## Motivation

The current THEOplayer Web SDK comes with a built-in UI based on [video.js](https://github.com/videojs/video.js) through [the `Player` constructor](https://www.theoplayer.com/docs/theoplayer/v8/api-reference/web/classes/Player.html). This new UI aims to solve some limitations from the old approach:

- Designed with customization in mind. With the old UI, customizing anything beyond changing some text and icon colors was difficult, and could break in unpredictable ways when updating to a new THEOplayer version. With the new UI, all components can be customized in a variety of ways with well-documented attributes and CSS custom properties.
- Built for the modern web. The old UI was built at a time when Internet Explorer was still a major browser, so it couldn't use newer web technologies. The new UI breaks with the past and takes full advantage of Web Components, so it works well in modern web apps.
- Developed in the open. Although the old UI is based on the open-source video.js library, any custom components bundled with THEOplayer remained closed-source. With the new UI, the source code of all components is publicly available. Advanced users can learn about the inner workings of each component, modify them, and even contribute their changes back to Open Video UI.

> [!NOTE]  
> THEOplayer Open Video UI for Web currently exists separately from the old THEOplayer UI. In the future, we hope to deprecate and remove the old UI, and ship this new UI as default UI for the THEOplayer Web SDK.

## Installation

1. This project requires the THEOplayer Web SDK to be installed.
    ```sh
    npm install theoplayer
    ```
    You can also install a different variant of the THEOplayer npm package if you don't need all features, as long as it's aliased as `theoplayer`.
    ```sh
    npm install theoplayer@npm:@theoplayer/basic-hls
    ```
2. Install the Open Video UI for Web.
    ```sh
    npm install @theoplayer/web-ui
    ```
3. Add `@theoplayer/web-ui` to your app:
    - Option 1: in your HTML.
        ```html
        <script src="/path/to/node_modules/theoplayer/THEOplayer.chromeless.js"></script>
        <script src="/path/to/node_modules/@theoplayer/web-ui/dist/THEOplayerUI.js"></script>
        ```
    - Option 2: in your JavaScript.
        ```js
        import { DefaultUI } from '@theoplayer/web-ui';
        ```
        Open Video UI will import THEOplayer from `theoplayer/chromeless` and [Lit](https://lit.dev/) from `lit`.
        If you're using a bundler such as Webpack or Rollup, these dependencies should automatically get bundled with your web app.
        Alternatively, you can use an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) to let the browser resolve it:
        ```html
        <script type="importmap">
            {
                "imports": {
                    "theoplayer/chromeless": "/path/to/node_modules/theoplayer/THEOplayer.chromeless.esm.js",
                    "lit": "/path/to/node_modules/lit/index.js",
                    "lit/decorators.js": "/path/to/node_modules/lit/decorators.js",
                    "lit/directives/": "/path/to/node_modules/lit/directives/"
                }
            }
        </script>
        <!-- Import maps polyfill for browsers without import maps support (e.g. Safari 16.3) -->
        <script async src="https://ga.jspm.io/npm:es-module-shims@2.6.2/dist/es-module-shims.js" crossorigin="anonymous"></script>
        <script type="module" src="/path/to/my_app.js"></script>
        ```

## Usage

### Default UI

`<theoplayer-default-ui>` provides a fully-featured video player experience with minimal setup, and allows for small customizations such as changing colors or fonts.

- Option 1: in your HTML.
    ```html
    <theoplayer-default-ui
        configuration='{"libraryLocation":"/path/to/node_modules/theoplayer/","license":"your_theoplayer_license_goes_here"}'
        source='{"sources":{"src":"https://example.com/stream.m3u8"}}'
    ></theoplayer-default-ui>
    <script>
        // Optionally, access the underlying THEOplayer player instance
        const ui = document.querySelector('theoplayer-default-ui');
        ui.player.addEventListener('playing', () => console.log('THEOplayer is now playing'));
    </script>
    ```
- Option 2: in your JavaScript.
    ```js
    import { DefaultUI } from '@theoplayer/web-ui';
    const ui = new DefaultUI({
        libraryLocation: '/path/to/node_modules/theoplayer/',
        license: 'your_theoplayer_license_goes_here'
    });
    // Set a source for the player to play
    ui.source = {
        sources: {
            src: 'https://example.com/stream.m3u8'
        }
    };
    // Optionally, access the underlying THEOplayer player instance
    ui.player.addEventListener('playing', () => console.log('THEOplayer is now playing'));
    ```

See [default-ui/demo.html](https://github.com/THEOplayer/web-ui/blob/main/docs/static/open-video-ui/v1/examples/web/default-ui/demo.html) for a complete example.

### Custom UI

If you want to fully customize your video player layout, you can use a `<theoplayer-ui>` instead.

```html
<theoplayer-ui
    configuration='{"libraryLocation":"/path/to/node_modules/theoplayer/","license":"your_theoplayer_license_goes_here"}'
    source='{"sources":{"src":"https://example.com/stream.m3u8"}}'
>
    <!-- Choose your own layout using the provided components (or your own!) -->
    <theoplayer-control-bar>
        <theoplayer-time-range></theoplayer-time-range>
    </theoplayer-control-bar>
    <theoplayer-control-bar>
        <theoplayer-play-button></theoplayer-play-button>
        <theoplayer-mute-button></theoplayer-mute-button>
        <theoplayer-volume-range></theoplayer-volume-range>
    </theoplayer-control-bar>
</theoplayer-ui>
```

See [custom-ui/demo.html](https://github.com/THEOplayer/web-ui/blob/main/docs/static/open-video-ui/v1/examples/web/custom-ui/demo.html) for a complete example.

### Legacy browser support

By default, Open Video UI for Web targets modern browsers that support modern JavaScript syntax (such as [async/await](https://caniuse.com/async-functions)) and native [Custom Elements](https://caniuse.com/custom-elementsv1). This keeps the download size small, so your viewers can spend less time waiting for your page to load and start watching their video faster.

On older browsers (such as Internet Explorer 11 and older smart TVs), you need to load a different version of the Open Video UI that uses older JavaScript syntax. You also need to load additional polyfills for missing features such as `Promise`, `Symbol.iterator` or Custom Elements:

- For ES2015 features like `Promise` and `Symbol.iterator`, we recommend [the Cloudflare mirror of Polyfill.io](https://cdnjs.cloudflare.com/polyfill/).
- For Custom Elements, we recommend loading our polyfill bundle from `@theoplayer/web-ui/polyfills`. Alternatively, you can load the [Web Components Polyfills](https://github.com/webcomponents/polyfills) along with [Lit's `polyfill-support` module](https://lit.dev/docs/v2/tools/requirements/#polyfills).

* Option 1: in your HTML. This uses [differential serving](https://css-tricks.com/differential-serving/) so modern browsers will load the modern build (with `type="module"`), while legacy browsers will load the legacy build (with `nomodule`).

    ```html
    <!-- Modern browsers -->
    <script type="importmap">
        {
            "imports": {
                "theoplayer/chromeless": "/path/to/node_modules/theoplayer/THEOplayer.chromeless.esm.js",
                "lit": "/path/to/node_modules/lit/index.js",
                "lit/decorators.js": "/path/to/node_modules/lit/decorators.js",
                "lit/directives/": "/path/to/node_modules/lit/directives/"
            }
        }
    </script>
    <!-- Import maps polyfill for browsers without import maps support (e.g. Safari 16.3) -->
    <script async src="https://ga.jspm.io/npm:es-module-shims@2.6.2/dist/es-module-shims.js" crossorigin="anonymous"></script>
    <script type="module" src="/path/to/node_modules/@theoplayer/web-ui/dist/THEOplayerUI.mjs"></script>
    <!-- Legacy browsers -->
    <script nomodule src="https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?features=es2015%2CglobalThis%2CReflect"></script>
    <script nomodule src="/path/to/node_modules/theoplayer/THEOplayer.chromeless.js"></script>
    <script nomodule src="/path/to/node_modules/@theoplayer/web-ui/dist/THEOplayerUI.polyfills.js"></script>
    <script nomodule src="/path/to/node_modules/@theoplayer/web-ui/dist/THEOplayerUI.es5.js"></script>
    ```

* Option 2: in your JavaScript. This will load the legacy build on both modern and legacy browsers, which is suboptimal. Instead, we recommend configuring your bundler to produce a modern and legacy build of your entire web app, and to import the appropriate version of Open Video UI for each build flavor.

    ```js
    import '@theoplayer/web-ui/polyfills';
    import { DefaultUI } from '@theoplayer/web-ui/es5'; // note the "/es5" suffix
    ```
