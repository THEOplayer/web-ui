---
layout: page
title: Localization
permalink: /guides/localization
description: Localize your UI to support different languages.
sidebar_position: 3
sidebar_custom_props: { 'icon': '🌍' }
---

The Open Video UI for Web can be localized to different languages,
enabling you to reach audiences from different regions of the world.

Localization works by [registering one or more locales](#register-a-locale)
and then [selecting one of the registered locales using the `lang` attribute](#select-a-language).

## Register a locale

A locale is a JavaScript object mapping translation IDs to translated messages.
You can register a locale with the `addLocale` function:

```javascript title="French locale"
import {addLocale} from "@theoplayer/web-ui";

addLocale('fr', {
    playAria: 'lire',
    pauseAria: 'pauser',
    replayAria: 'revoir',
    // ...
});
```

Some messages may need to be formatted with one or more values, based on the configuration or active state of the
player. For those messages, the translation ID maps to a JavaScript function that takes those values as arguments
and returns the formatted translation.

```javascript title="French locale (continued)"
addLocale('fr', {
    // ...
    seekForwardAria: (offset) => `avancer de ${offset}`,
    seekBackwardAria: (offset) => `reculer de ${offset}`,
    // ...
});
```

Refer to the [`Locale` interface definition](https://theoplayer.github.io/web-ui/api/interfaces/Locale.html)
in the API references for the complete list of translatable messages.

## Select a language

The UI automatically selects the locale based on the `lang` attribute of the `<theoplayer-ui>`
(or `<theoplayer-default-ui>`) element, or from the closest parent element with such an attribute.

The value of the `lang` attribute must exactly match the locale name as it was passed to `addLocale`.

```html title="Setting the language on the UI"
<theoplayer-default-ui lang="fr" source='{"sources":{"src":"https://example.com/stream.m3u8"}}'>
</theoplayer-default-ui>
```

You can also put the `lang` attribute on any parent element. For example, if the entire page is in French, you could put
the attribute on the `<html>` element:

```html title="Setting the language on the HTML document"
<html lang="fr">
<head><title>Ma page</title></head>
<body>
<theoplayer-default-ui source='{"sources":{"src":"https://example.com/stream.m3u8"}}'></theoplayer-default-ui>
</body>
</html>
```
