---
'@theoplayer/web-ui': minor
---

Added `stream-type-only` and `stream-type-hidden` attributes to show or hide UI elements for specific stream types.
Both attributes take a space-separated list of stream types, for example `stream-type-hidden="live"` hides an element
for livestreams without DVR, while keeping it for VOD streams and for livestreams with DVR.
The existing `live-only` and `live-hidden` attributes are now shorthands for `stream-type-only="live dvr"`
and `stream-type-hidden="live dvr"`, and are complemented with new `dvr-only` and `dvr-hidden` attributes.
