---
'@theoplayer/web-ui': patch
---

Fixed `<theoplayer-time-range>` repeatedly triggering seeks when updating its value from the player's current time, which caused noticeable stutters on Safari.
