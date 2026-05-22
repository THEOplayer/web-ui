import type { EdgeStyle } from 'theoplayer/chromeless';
import type { KnownColor, KnownFontFamily } from '../i18n';

export const knownColors: ReadonlyArray<[KnownColor, string]> = [
    ['White', 'rgb(255,255,255)'],
    ['Yellow', 'rgb(255,255,0)'],
    ['Green', 'rgb(0,255,0)'],
    ['Cyan', 'rgb(0,255,255)'],
    ['Blue', 'rgb(0,0,255)'],
    ['Magenta', 'rgb(255,0,255)'],
    ['Red', 'rgb(255,0,0)'],
    ['Black', 'rgb(0,0,0)']
];

export const knownFontFamilies: ReadonlyArray<[KnownFontFamily, string]> = [
    ['Monospace Serif', '"Courier New", Courier, "Nimbus Mono L", "Cutive Mono", monospace'],
    ['Proportional Serif', '"Times New Roman", Times, Georgia, Cambria, "PT Serif Caption", serif'],
    ['Monospace Sans', '"Deja Vu Sans Mono", "Lucida Console", Monaco, Consolas, "PT Mono", monospace'],
    ['Proportional Sans', 'Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif']
];

export const knownEdgeStyles: ReadonlyArray<EdgeStyle> = ['none', 'dropshadow', 'raised', 'depressed', 'uniform'];
