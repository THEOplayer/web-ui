---
layout: page
title: Localization
slug: /react/guides/localization
description: Localize your UI to support different languages.
sidebar_position: 1
sidebar_custom_props: { 'icon': '🌍' }
---

The Open Video UI for React can be localized to different languages,
enabling you to reach audiences from different regions of the world.

Localization works by [registering one or more locales](#register-a-locale)
and then [selecting one of the registered locales using the `lang` prop](#select-a-language).

## Register a locale

A locale is a JavaScript object mapping translation IDs to translated messages.
You can register a locale with the `addLocale` function:

```javascript title="French locale"
import { addLocale } from '@theoplayer/react-ui';

addLocale('fr', {
    playAria: 'lire',
    pauseAria: 'pauser',
    replayAria: 'revoir'
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
    seekBackwardAria: (offset) => `reculer de ${offset}`
    // ...
});
```

Refer to the [`Locale` interface definition](https://theoplayer.github.io/web-ui/react-api/interfaces/Locale.html)
in the API references for the complete list of translatable messages.

## Select a language

The UI automatically selects the locale based on the `lang` prop of the `<UIContainer>` (or `<DefaultUI>`) component.

The value of the `lang` prop must exactly match the locale name as it was passed to `addLocale`.

```jsx title="Setting the language on the UI"
<DefaultUI lang="fr" source={{ sources: { src: 'https://example.com/stream.m3u8' } }} />
```

## Remarks

### Update translations when upgrading Open Video UI

Newer versions of the Open Video UI for React may add new messages that need to be translated.
We follow [semantic versioning](https://semver.org/), so new messages can only be added in _major_ or _minor_ versions.

When using custom translations in your app, we recommend pinning the `@theoplayer/react-ui` dependency
in your app's `package.json` to a specific minor version using a tilde constraint (`~`).
Avoid using a caret constraint (`^`), since this may cause upgrading past your currently selected minor version.

```json title="package.json"
{
    "dependencies": {
        "@theoplayer/react-ui": "~2.2.0"
    }
}
```

When you decide to upgrade Open Video UI to the latest version, make sure to also update your translations.
Check the history for [`i18n/Locale.ts`](https://github.com/THEOplayer/web-ui/commits/main/src/i18n/Locale.ts)
to see whether any messages were added or changed since the previous version.
