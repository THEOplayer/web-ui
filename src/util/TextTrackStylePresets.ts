import type { EdgeStyle } from 'theoplayer/chromeless';
import type { KnownColor, KnownFontFamily } from '../i18n';

export const colorOptions: ReadonlyArray<{ label: KnownColor; value: `rgb(${number},${number},${number})` | '' }> = [
    { label: 'White', value: 'rgb(255,255,255)' },
    { label: 'Yellow', value: 'rgb(255,255,0)' },
    { label: 'Green', value: 'rgb(0,255,0)' },
    { label: 'Cyan', value: 'rgb(0,255,255)' },
    { label: 'Blue', value: 'rgb(0,0,255)' },
    { label: 'Magenta', value: 'rgb(255,0,255)' },
    { label: 'Red', value: 'rgb(255,0,0)' },
    { label: 'Black', value: 'rgb(0,0,0)' }
];
export const fontFamilyOptions: ReadonlyArray<{ label: KnownFontFamily; value: string }> = [
    { label: 'Monospace Serif', value: '"Courier New", Courier, "Nimbus Mono L", "Cutive Mono", monospace' },
    { label: 'Proportional Serif', value: '"Times New Roman", Times, Georgia, Cambria, "PT Serif Caption", serif' },
    { label: 'Monospace Sans', value: '"Deja Vu Sans Mono", "Lucida Console", Monaco, Consolas, "PT Mono", monospace' },
    { label: 'Proportional Sans', value: 'Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif' }
];
export const sizeOptions: ReadonlyArray<number> = [0.5, 0.75, 1.0, 1.5, 2.0];
export const opacityOptions: ReadonlyArray<number> = [0.25, 0.5, 0.75, 1.0];
export const edgeStyleOptions: ReadonlyArray<EdgeStyle> = ['none', 'dropshadow', 'raised', 'depressed', 'uniform'];
