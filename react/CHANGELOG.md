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

-   🚀 Added support for loading in Node for static site generation (SSG) or server-side rendering (SSR). ([#50](https://github.com/THEOplayer/web-ui/pull/50))
    -   This allows you to pass React components (such as `<DefaultUI>`, `<UIContainer>` or `<PlayButton>`) to the [Server React DOM APIs](https://react.dev/reference/react-dom/server), or to use them with a framework that supports SSG or SSR (such as Next.js, Remix or Gatsby).
    -   ⚠️ The rendered HTML must still be [hydrated](https://react.dev/reference/react-dom/client/hydrateRoot#hydrating-server-rendered-html) on the client to load the Open Video UI properly. (Usually, this handled automatically by your React framework.)

## v1.6.0 (2024-02-08)

-   🚀 Initial release
-   🏠 See changes to [Open Video UI for Web v1.6.0](https://github.com/THEOplayer/web-ui/blob/v1.6.0/CHANGELOG.md)
