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

## v1.1.0 (2023-04-12)

-   💥 **Breaking Change**: This project now targets modern browsers, so `dist/THEOplayerUI.js` and `dist/THEOplayerUI.mjs` now use ES2017 syntax (such as `class` and `async`/`await`). See "Legacy browser support" in the [README](./README.md) for more information about targeting older browsers. ([#26](https://github.com/THEOplayer/web-ui/issues/26), [#27](https://github.com/THEOplayer/web-ui/pull/27))
-   🚀 Added support for THEOplayer 5.0
-   💅 Improved accessibility ([#21](https://github.com/THEOplayer/web-ui/pull/21))
-   💅 Make menus fill entire player when player is small ([#22](https://github.com/THEOplayer/web-ui/pull/22))
-   🐛 Ensure `player` property is initialized immediately when calling `new UIContainer(configuration)` with a valid player configuration ([#24](https://github.com/THEOplayer/web-ui/pull/24))

## v1.0.0 (2023-04-05)

-   🚀 Initial release
