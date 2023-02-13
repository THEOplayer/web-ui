# THEOplayer Web UI

A component library for building a world-class video player experience powered by
the [THEOplayer Web SDK](https://www.theoplayer.com/product/theoplayer).

-   Use the default UI for a great out-of-the-box experience, or use the individual components to build your own custom UI.
-   Built using [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components), so works great with (or without) any app framework.
-   Easy to customize: use HTML to lay out your controls, and CSS to style them.

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
