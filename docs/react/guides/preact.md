---
layout: page
title: Using with Preact
slug: /react/guides/preact
description: Use the Open Video UI for React in a Preact app.
sidebar_position: 2
sidebar_custom_props: { 'icon': '⚛️' }
---

The Open Video UI for React also works with [Preact](https://preactjs.com/), without any changes to your code.
All you need to do is alias `react` (and `react-dom`) to `preact/compat`, as you would for any other React library.

## Alias React to Preact

Preact's documentation explains [how to set up the alias](https://preactjs.com/guide/v10/getting-started#aliasing-react-to-preact)
for the most common bundlers, such as Vite, Webpack and Rollup.
Once configured, you can import and use the Open Video UI for React as usual:

```jsx
import { DefaultUI } from '@theoplayer/react-ui';

const App = () => <DefaultUI configuration={configuration} source={source} />;
```

## Without a bundler

If you're not using a bundler, you can alias `react` to `preact/compat`
[using an import map](https://preactjs.com/guide/v10/getting-started#aliasing-with-import-maps) instead:

```html
<script type="importmap">
    {
        "imports": {
            "preact": "https://esm.sh/preact@10",
            "preact/hooks": "https://esm.sh/preact@10/hooks",
            "preact/compat": "https://esm.sh/preact@10/compat",
            "react": "https://esm.sh/preact@10/compat",
            "react-dom/client": "https://esm.sh/preact@10/compat/client"
        }
    }
</script>
```

See [examples/preact/default-ui.html](https://github.com/THEOplayer/web-ui/blob/main/examples/preact/default-ui.html)
for a complete example.
