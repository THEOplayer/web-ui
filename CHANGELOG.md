---
description: Find out what's new in Open Video UI for Web.
sidebar_custom_props: { 'icon': '📰' }
---

# Changelog

> **Tags:**
>
> -   💥 Breaking Change
> -   🚀 New Feature
> -   🐛 Bug Fix
> -   👎 Deprecation
> -   📝 Documentation
> -   🏠 Internal
> -   💅 Polish

## Unreleased

-   🐛 Fix settings menu and subtitle options menu not displaying correctly on older smart TVs. ([#108](https://github.com/THEOplayer/web-ui/pull/108), [#109](https://github.com/THEOplayer/web-ui/pull/109))

## v1.11.3 (2025-07-22)

-   🐛 Fix issue with the `<theoplayer-ad-clickthrough-button>` component that was triggering the error `Failed to execute 'createElement' on 'Document': The result must not have attributes` when loaded into a React application. ([#106](https://github.com/THEOplayer/web-ui/pull/106))

## v1.11.2 (2025-06-30)

-   🚀 Add `--theoplayer-play-button-icon-color` CSS property to change the icon color of _only_ the `<theoplayer-play-button>`. ([#104](https://github.com/THEOplayer/web-ui/pull/104))
-   🚀 Add `--theoplayer-center-play-button-icon-color` CSS property to change the icon color of _only_ the centered play button in a `<theoplayer-default-ui>`. ([#104](https://github.com/THEOplayer/web-ui/pull/104))

## v1.11.1 (2025-06-30)

-   🐛 Fix pressing `Enter` on TV remote triggering click twice. ([#101](https://github.com/THEOplayer/web-ui/pull/101))
-   🚀 Add `error` slot to default UI, to allow for a custom error display. ([#102](https://github.com/THEOplayer/web-ui/pull/102))

## v1.11.0 (2025-06-12)

-   🚀 Add settings menu button to default UI. ([#99](https://github.com/THEOplayer/web-ui/pull/99))

## v1.10.0 (2025-04-02)

-   🚀 Added support for THEOplayer 9.0.

## v1.9.5 (2025-03-20)

-   💅 Forced subtitles are no longer shown in the subtitle menu. ([#92](https://github.com/THEOplayer/web-ui/pull/92))

## v1.9.4 (2025-02-19)

-   No changes

## v1.9.3 (2024-12-03)

-   🚀 Added support for MBR Millicast streams. ([#81](https://github.com/THEOplayer/web-ui/pull/81))

## v1.9.2 (2024-11-20)

-   🐛 Fixed live UI not showing for Millicast streams. ([#79](https://github.com/THEOplayer/web-ui/pull/79))

## v1.9.1 (2024-09-27)

-   🐛 Fixed <kbd>Enter</kbd> and <kbd>Space</kbd> keys not working to activate buttons in the UI. ([#76](https://github.com/THEOplayer/web-ui/pull/76))

## v1.9.0 (2024-09-06)

-   🚀 Added support for THEOplayer 8.0. ([#72](https://github.com/THEOplayer/web-ui/pull/72))

## v1.8.2 (2024-08-29)

-   🐛 Fixed blank space below UI when using `<theoplayer-default-ui>`.
-   💅 Optimized performance of `<theoplayer-time-range>`. ([#70](https://github.com/THEOplayer/web-ui/issues/70))
    -   Optimized the `requestAnimationFrame` callback used to update the seekbar's progress
        to avoid synchronous re-layouts as much as possible.
    -   When playing a long video, the seek bar no longer uses `requestAnimationFrame` at all to update its progress.
        Instead, it updates using only less frequent `timeupdate` events.

## v1.8.1 (2024-04-18)

-   🐛 Fixed `ui.player.destroy()` not working. ([#59](https://github.com/THEOplayer/web-ui/issues/59), [#62](https://github.com/THEOplayer/web-ui/pull/62))

## v1.8.0 (2024-04-12)

-   💥 **Breaking Change**: This project now requires THEOplayer version 7.0.0 or higher. ([#60](https://github.com/THEOplayer/web-ui/pull/60))
-   🚀 Added `<theolive-default-ui>` that provides a default UI for THEOlive streams. ([#58](https://github.com/THEOplayer/web-ui/pull/58))

## v1.7.2 (2024-03-18)

-   🚀 Added `<theoplayer-slot-container>`. ([#55](https://github.com/THEOplayer/web-ui/pull/55))

## v1.7.1 (2024-02-15)

-   💅 Export `version` in public API. ([#53](https://github.com/THEOplayer/web-ui/pull/53))
-   💅 Allow importing `@theoplayer/web-ui/package.json`. ([#53](https://github.com/THEOplayer/web-ui/pull/53))

## v1.7.0 (2024-02-15)

-   🚀 Added support for loading in Node for static site generation (SSG) or server-side rendering (SSR). ([#50](https://github.com/THEOplayer/web-ui/pull/50))
    -   ⚠️ Although the Node entry point exports all custom element classes as usual, attempting to actually construct those classes will result in errors. Most dependencies are either replaced with stubs (using [`@lit-labs/ssr-dom-shim`](https://lit.dev/docs/ssr/dom-emulation/)) or removed altogether (such as THEOplayer itself).
    -   This should always be used together with an SSG or SSR solution. For example, you can use [Open Video UI for React](https://www.npmjs.com/package/@theoplayer/react-ui) together with [React server rendering](https://react.dev/reference/react-dom/server).
-   🐛 Fixed an issue where `<theoplayer-ui>` could throw an error when the player changes sources before all custom elements are properly registered. ([#49](https://github.com/THEOplayer/web-ui/pull/49))

## v1.6.0 (2024-02-08)

-   🚀 Introducing [Open Video UI for React](https://www.npmjs.com/package/@theoplayer/react-ui). ([#48](https://github.com/THEOplayer/web-ui/pull/48))
    -   Idiomatic React components make the Open Video UI feel right at home in your existing React web app.
-   🚀 Added support for advertisements while casting to Chromecast. This requires THEOplayer version 6.8.0 or higher. ([#47](https://github.com/THEOplayer/web-ui/pull/47))
-   🚀 Added `theoplayerready` event to `<theoplayer-default-ui>` and `<theoplayer-ui>`, which is fired once the backing THEOplayer instance is created. ([#48](https://github.com/THEOplayer/web-ui/pull/48)).

## v1.5.0 (2023-11-27)

-   🚀 Added support for smart TVs. ([#40](https://github.com/THEOplayer/web-ui/pull/40))
    -   Updated `<theoplayer-default-ui>` to automatically switch to an optimized layout when running on a smart TV.
        For custom UIs using `<theoplayer-ui>`, you can use the `tv-only` and `tv-hidden` attributes to show or hide specific UI elements on smart TVs.
    -   Added support for navigating the UI using a TV remote control.
    -   Added a `tv-focus` attribute to specify which UI element should receive the initial focus when showing the controls on a TV.
        In the default UI, initial focus is on the seek bar.
-   🚀 Allow overriding more CSS properties of `<theoplayer-default-ui>`. ([#42](https://github.com/THEOplayer/web-ui/pull/42))
-   💅 Renamed project to "THEOplayer Open Video UI for Web". ([#43](https://github.com/THEOplayer/web-ui/pull/43))

## v1.4.0 (2023-10-04)

-   💥 **Breaking Change**: This project now requires THEOplayer version 6.0.0 or higher.
-   🚀 Open Video UI now imports THEOplayer as a JavaScript module using `import from 'theoplayer/chromeless'`.
    See the [README](https://github.com/THEOplayer/web-ui/blob/v1.4.0/README.md#installation) for updated installation instructions.
-   🐛 When the player's source is empty, the UI will no longer attempt to play when clicked. ([#37](https://github.com/THEOplayer/web-ui/pull/37))

## v1.3.0 (2023-05-16)

-   💥 **Breaking Change**: This project now requires THEOplayer version 5.1.0 or higher.
-   🏠 This project now depends on the chromeless version of THEOplayer, rather than the full version which includes the old video.js-based UI. ([#31](https://github.com/THEOplayer/web-ui/pull/31))
-   🐛 Fix `has-error` attribute not cleared on source change ([#29](https://github.com/THEOplayer/web-ui/pull/29))

## v1.2.0 (2023-04-26)

-   🚀 Improved support for advertisements ([#28](https://github.com/THEOplayer/web-ui/pull/28))
    -   Reworked the ad control bar in `<theoplayer-default-ui>`.
    -   Added a `show-ad-markers` attribute to `<theoplayer-time-range>`, to show markers on the progress bar indicating when the content will be interrupted by an advertisement.
    -   `<theoplayer-ad-skip-button>` and `<theoplayer-ad-clickthrough-button>` are automatically hidden while playing a Google IMA ad. (This is unfortunately necessary, because Google IMA doesn't provide a way to modify or replace its own buttons.)
-   🐛 When the player changes sources, any open menu is now automatically closed

## v1.1.0 (2023-04-12)

-   💥 **Breaking Change**: This project now targets modern browsers, so `dist/THEOplayerUI.js` and `dist/THEOplayerUI.mjs` now use ES2017 syntax (such as `class` and `async`/`await`). See "Legacy browser support" in the [README](https://github.com/THEOplayer/web-ui/blob/v1.1.0/README.md) for more information about targeting older browsers. ([#26](https://github.com/THEOplayer/web-ui/issues/26), [#27](https://github.com/THEOplayer/web-ui/pull/27))
-   🚀 Added support for THEOplayer 5.0
-   💅 Improved accessibility ([#21](https://github.com/THEOplayer/web-ui/pull/21))
-   💅 Make menus fill entire player when player is small ([#22](https://github.com/THEOplayer/web-ui/pull/22))
-   🐛 Ensure `player` property is initialized immediately when calling `new UIContainer(configuration)` with a valid player configuration ([#24](https://github.com/THEOplayer/web-ui/pull/24))

## v1.0.0 (2023-04-05)

-   🚀 Initial release
