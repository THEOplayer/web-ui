---
description: Find out what's new in Open Video UI for React.
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

## v1.9.2 (2024-11-20)

-   🏠 See changes to [Open Video UI for Web v1.9.2](https://github.com/THEOplayer/web-ui/blob/v1.9.2/CHANGELOG.md)

## v1.9.1 (2024-09-27)

-   🏠 See changes to [Open Video UI for Web v1.9.1](https://github.com/THEOplayer/web-ui/blob/v1.9.1/CHANGELOG.md)

## v1.9.0 (2024-09-06)

-   🚀 Added support for THEOplayer 8.0. ([#72](https://github.com/THEOplayer/web-ui/pull/72))
-   🏠 See changes to [Open Video UI for Web v1.9.0](https://github.com/THEOplayer/web-ui/blob/v1.9.0/CHANGELOG.md)

## v1.8.2 (2024-08-29)

-   🏠 See changes to [Open Video UI for Web v1.8.2](https://github.com/THEOplayer/web-ui/blob/v1.8.2/CHANGELOG.md)

## v1.8.1 (2024-04-18)

-   🐛 Fixed backing THEOplayer not always being destroyed on unmount. ([#59](https://github.com/THEOplayer/web-ui/issues/59), [#62](https://github.com/THEOplayer/web-ui/pull/62))
-   🏠 See changes to [Open Video UI for Web v1.8.1](https://github.com/THEOplayer/web-ui/blob/v1.8.1/CHANGELOG.md)

## v1.8.0 (2024-04-12)

-   💥 **Breaking Change**: This project now requires THEOplayer version 7.0.0 or higher. ([#60](https://github.com/THEOplayer/web-ui/pull/60))
-   🚀 Added `<THEOliveDefaultUI>` that provides a default UI for THEOlive streams. ([#58](https://github.com/THEOplayer/web-ui/pull/58))
-   🏠 See changes to [Open Video UI for Web v1.8.0](https://github.com/THEOplayer/web-ui/blob/v1.8.0/CHANGELOG.md)

## v1.7.2 (2024-03-18)

-   🐛 Fixed `topChrome`, `middleChrome` and `centeredChrome` slots not auto-hiding in `<UIContainer>`. ([#55](https://github.com/THEOplayer/web-ui/pull/55))
-   🐛 Fixed `no-auto-hide` attribute not working for React components. ([#55](https://github.com/THEOplayer/web-ui/pull/55))
-   🚀 Added `<SlotContainer>`. ([#55](https://github.com/THEOplayer/web-ui/pull/55))
-   🏠 See changes to [Open Video UI for Web v1.7.2](https://github.com/THEOplayer/web-ui/blob/v1.7.2/CHANGELOG.md)

## v1.7.1 (2024-02-15)

-   🐛 Fix "Warning: useLayoutEffect does nothing on the server" when using `@theoplayer/react-ui` in Node. ([#52](https://github.com/THEOplayer/web-ui/pull/52))
-   💅 Export `version` in public API. ([#53](https://github.com/THEOplayer/web-ui/pull/53))
-   💅 Allow importing `@theoplayer/react-ui/package.json`. ([#53](https://github.com/THEOplayer/web-ui/pull/53))
-   🏠 See changes to [Open Video UI for Web v1.7.1](https://github.com/THEOplayer/web-ui/blob/v1.7.1/CHANGELOG.md)

## v1.7.0 (2024-02-15)

-   🚀 Added support for loading in Node for static site generation (SSG) or server-side rendering (SSR). ([#50](https://github.com/THEOplayer/web-ui/pull/50))
    -   This allows you to pass React components (such as `<DefaultUI>`, `<UIContainer>` or `<PlayButton>`) to the [Server React DOM APIs](https://react.dev/reference/react-dom/server), or to use them with a framework that supports SSG or SSR (such as Next.js, Remix or Gatsby).
    -   ⚠️ The rendered HTML must still be [hydrated](https://react.dev/reference/react-dom/client/hydrateRoot#hydrating-server-rendered-html) on the client to load the Open Video UI properly. (Usually, this handled automatically by your React framework.)
-   🚀 Added utility hooks such as `useCurrentTime()`, `usePaused()` and `useVolume()`. ([#51](https://github.com/THEOplayer/web-ui/pull/51))
    -   See [the API documentation](https://theoplayer.github.io/web-ui/react-api/) for more information.
-   🏠 See changes to [Open Video UI for Web v1.7.0](https://github.com/THEOplayer/web-ui/blob/v1.7.0/CHANGELOG.md)

## v1.6.0 (2024-02-08)

-   🚀 Initial release
-   🏠 See changes to [Open Video UI for Web v1.6.0](https://github.com/THEOplayer/web-ui/blob/v1.6.0/CHANGELOG.md)
