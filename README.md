# THEOplayer Web UI

A component library for building a world-class video player experience powered by
the [THEOplayer Web SDK](https://www.theoplayer.com/product/theoplayer).

-   Use the default UI for a great out-of-the-box experience, or use the individual components to build your own custom UI.
-   Built using [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components), so works great with (or without) any app framework.
-   Easy to customize: use HTML to lay out your controls, and CSS to style them.

> **Warning**
> This project is experimental, and breaking changes can happen frequently. As such, it is not yet recommended for use in production. We are aiming for a first stable release soon, so feedback is welcome!

## Motivation

The current THEOplayer Web SDK comes with a built-in UI based on [video.js](https://github.com/videojs/video.js) through [the `Player` constructor](https://docs.theoplayer.com/api-reference/web/theoplayer.player.md). This new UI aims to solve some limitations from the old approach:

-   Designed with customization in mind. With the old UI, customizing anything beyond changing some text and icon colors was difficult, and could break in unpredictable ways when updating to a new THEOplayer version. With the new UI, all components can be customized in a variety of ways with well-documented attributes and CSS custom properties.
-   Built for the modern web. The old UI was built at a time when Internet Explorer was still a major browser, so it couldn't use newer web technologies. The new UI breaks with the past and takes full advantage of Web Components, so it works well in modern web apps.
-   Developed in the open. Although the old UI is based on the open-source video.js library, any custom components bundled with THEOplayer remained closed-source. With the new UI, the source code of all components is publicly available. Advanced users can learn about the inner workings of each component, modify them, and even contribute their changes back to THEOplayer Web UI.

> **Note**
> THEOplayer Web UI currently exists separately from the old THEOplayer UI. In the future, we hope to deprecate and remove the old UI, and ship this new UI as default UI for the THEOplayer Web SDK.

## Installation

This project requires the THEOplayer Web SDK to be installed.

```sh
npm install theoplayer theoplayer-web-ui
```

You can also install a different variant of the THEOplayer npm package if you don't need all features, as long as it's aliased as `theoplayer`.

```sh
npm install theoplayer@npm:@theoplayer/basic-hls
npm install theoplayer-web-ui
```

Then add `theoplayer-web-ui` to your app:

-   Option 1: in your HTML.
    ```html
    <script src="/path/to/node_modules/theoplayer-web-ui/dist/THEOplayerUI.js"></script>
    <theoplayer-default-ui></theoplayer-default-ui>
    ```
-   Option 2: in your JavaScript.
    ```js
    import * as THEOplayerUI from 'theoplayer-web-ui';
    const ui = new THEOplayerUI.DefaultUI();
    ```
