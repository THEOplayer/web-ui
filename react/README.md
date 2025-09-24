# THEOplayer Open Video UI for React ⚛️

[![NPM version](https://img.shields.io/npm/v/%40theoplayer%2Freact-ui)](https://www.npmjs.com/package/@theoplayer/react-ui)
[![Build status](https://github.com/THEOplayer/web-ui/workflows/CI/badge.svg)](https://github.com/THEOplayer/web-ui/actions/workflows/ci.yml)
[![API docs](https://img.shields.io/badge/api%20docs-orange.svg)](https://theoplayer.github.io/web-ui/react-api/)
[![GitHub issues](https://img.shields.io/github/issues/THEOplayer/web-ui)](https://github.com/THEOplayer/web-ui/issues)

A [React](https://react.dev/) component library for building a world-class video player experience powered by
the [THEOplayer Web SDK](https://www.theoplayer.com/product/theoplayer).

- Use the default UI for a great out-of-the-box experience, or use the individual components to build your own custom UI.
- Idiomatic React components make the UI feel right at home in your existing React web app.
- Easy to customize: use JSX to lay out your controls, and CSS to style them.

## Installation

1. This project requires the THEOplayer Web SDK to be installed.
    ```sh
    npm install theoplayer
    ```
    You can also install a different variant of the THEOplayer npm package if you don't need all features, as long as it's aliased as `theoplayer`.
    ```sh
    npm install theoplayer@npm:@theoplayer/basic-hls
    ```
2. Install the Open Video UI for React.
    ```sh
    npm install @theoplayer/react-ui
    ```
3. Add `@theoplayer/react-ui` to your app:
    ```jsx
    import { DefaultUI } from '@theoplayer/react-ui';
    ```
    Open Video UI will import THEOplayer from `theoplayer/chromeless`.
    If you're using a bundler such as Webpack or Rollup, this dependency should automatically get bundled with your web app.

## Usage

### Default UI

`<DefaultUI>` provides a fully-featured video player experience with minimal setup, and allows for small customizations such as changing colors or fonts.

```tsx
import { DefaultUI } from '@theoplayer/react-ui';
import type { ChromelessPlayer } from 'theoplayer/chromeless';

const App = () => {
    // Configure THEOplayer
    const configuration = {
        libraryLocation: '/path/to/node_modules/theoplayer/',
        license: 'your_theoplayer_license_goes_here'
    };
    // Configure a source for the player to play
    const source = {
        sources: {
            src: 'https://example.com/stream.m3u8'
        }
    };
    // Optionally, access the underlying THEOplayer player instance
    const onReady = (player: ChromelessPlayer) => {
        player.addEventListener('playing', () => console.log('THEOplayer is now playing'));
    };

    return <DefaultUI configuration={configuration} source={source} onReady={onReady} />;
};
```

See [default-ui/demo.html](https://github.com/THEOplayer/web-ui/blob/main/docs/static/open-video-ui/v1/examples/react/default-ui/demo.html) for a complete example.

### Custom UI

If you want to fully customize your video player layout, you can use a `<UIContainer>` instead.

```tsx
import { ControlBar, MuteButton, PlayButton, TimeRange, VolumeRange } from '@theoplayer/react-ui';

const App = () => {
    const configuration = {
        libraryLocation: '/path/to/node_modules/theoplayer/',
        license: 'your_theoplayer_license_goes_here'
    };
    const source = {
        sources: {
            src: 'https://example.com/stream.m3u8'
        }
    };

    return (
        <UIContainer
            configuration={configuration}
            source={source}
            bottomChrome={
                <>
                    {/* Choose your own layout using the provided components (or your own!) */}
                    <ControlBar>
                        <TimeRange />
                    </ControlBar>
                    <ControlBar>
                        <PlayButton />
                        <MuteButton />
                        <VolumeRange />
                    </ControlBar>
                </>
            }
        />
    );
};
```

See [custom-ui/demo.html](https://github.com/THEOplayer/web-ui/blob/main/docs/static/open-video-ui/v1/examples/react/custom-ui/demo.html) for a complete example.

### Legacy browser support

By default, Open Video UI for React targets modern browsers that support modern JavaScript syntax (such as [async/await](https://caniuse.com/async-functions)) and native [Custom Elements](https://caniuse.com/custom-elementsv1). This keeps the download size small, so your viewers can spend less time waiting for your page to load and start watching their video faster.

On older browsers (such as Internet Explorer 11 and older smart TVs), you need to load a different version of the Open Video UI that uses older JavaScript syntax. You also need to load additional polyfills for missing features such as Promises or Custom Elements. We recommend [the Cloudflare mirror of Polyfill.io](https://cdnjs.cloudflare.com/polyfill/) and [Web Components Polyfills](https://github.com/webcomponents/polyfills) for these.

The simplest way to do this is to load the legacy build instead:

```tsx
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js';
import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
import { DefaultUI } from '@theoplayer/react-ui/es5'; // note the "/es5" suffix
```

However, this will load unnecessary polyfills in modern browsers, which is suboptimal. Instead, we recommend configuring your bundler to produce a modern and legacy build of your entire web app, and to import the appropriate version of Open Video UI for each build flavor.
