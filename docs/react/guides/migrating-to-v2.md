---
layout: page
title: Migrating to Open Video UI for React 2.x
slug: /react/guides/migrating-to-v2
---

This article will guide you through updating to Open Video UI for React version 2 (from version 1),
and the changes needed in your code.

## Update dependencies

Run the following command to install Open Video UI for React version 2:

```sh
npm install @theoplayer/react-ui@2
```

Open Video UI for React now depends on [Lit version 3](https://www.npmjs.com/package/lit).
If your project already uses Lit, make sure you use a compatible version.

## Update polyfill for legacy browsers

In version 1, we recommended loading the [Web Components Polyfills](https://github.com/webcomponents/polyfills)
on legacy browsers that do not natively support the Custom Elements API.

As of version 2, Open Video UI for React ships its own polyfill bundle, which includes:

- [Web Components Polyfills](https://github.com/webcomponents/polyfills)
- [Lit's `polyfill-support` module](https://lit.dev/docs/v2/tools/requirements/#polyfills)

We recommend switching to our polyfill bundle, so you'll always have all the necessary polyfills needed
to support legacy browsers. Alternatively, [you can load these polyfills manually](https://github.com/THEOplayer/web-ui/blob/%40theoplayer/react-ui%402.0.0-beta.0/src/polyfills.ts).

```diff
- import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js';
- import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
+ import '@theoplayer/web-ui/polyfills';
```
