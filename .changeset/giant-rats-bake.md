---
'@theoplayer/web-ui': major
---

Open Video UI for Web is now built using [Lit](https://lit.dev/).

- All components now extend [`LitElement`](https://lit.dev/docs/api/LitElement/) and use [reactive rendering](https://lit.dev/docs/components/rendering/), making it much easier to build custom UI components. While existing custom UI components should mostly continue to work, we highly recommend updating them to use a `render()` method instead.
- For older browsers that don't support Custom Elements, we recommend loading our new polyfills library from `@theoplayer/web-ui/polyfills`.
