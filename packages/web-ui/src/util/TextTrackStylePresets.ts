import type { EdgeStyle } from 'theoplayer/chromeless';

export const knownColors: ReadonlyArray<[string, string]> = [
    ['White', 'rgb(255,255,255)'],
    ['Yellow', 'rgb(255,255,0)'],
    ['Green', 'rgb(0,255,0)'],
    ['Cyan', 'rgb(0,255,255)'],
    ['Blue', 'rgb(0,0,255)'],
    ['Magenta', 'rgb(255,0,255)'],
    ['Red', 'rgb(255,0,0)'],
    ['Black', 'rgb(0,0,0)']
];

export const knownFontFamilies: ReadonlyArray<[string, string]> = [
    ['Monospace Serif', '"Courier New", Courier, "Nimbus Mono L", "Cutive Mono", monospace'],
    ['Proportional Serif', '"Times New Roman", Times, Georgia, Cambria, "PT Serif Caption", serif'],
    ['Monospace Sans', '"Deja Vu Sans Mono", "Lucida Console", Monaco, Consolas, "PT Mono", monospace'],
    ['Proportional Sans', 'Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif']
];

export const knownEdgeStyles: ReadonlyArray<[string, EdgeStyle]> = [
    ['None', 'none'],
    ['Drop shadow', 'dropshadow'],
    ['Raised', 'raised'],
    ['Depressed', 'depressed'],
    ['Uniform', 'uniform']
];
