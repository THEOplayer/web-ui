---
'@theoplayer/web-ui': minor
---

Added chapter markers to the seek bar. When a `chapters` text track is showing, `<theoplayer-time-range show-chapter-markers>` marks where each chapter starts and highlights the chapter under the pointer. Chapter markers are shown by default in `<theoplayer-default-ui>`. The seek bar's `aria-valuetext` also includes the current chapter title, which can be localized with the new `timeRangeChapterAriaValueText` locale entry.
