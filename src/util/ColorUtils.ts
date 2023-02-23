import { stringStartsWith } from './CommonUtils';

export interface RgbaColor {
    r_: number; // 0..255
    g_: number; // 0..255
    b_: number; // 0..255
    a_: number; // 0..1
}

function parseHexColor(hex: string): RgbaColor | null {
    const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    return m
        ? {
              r_: parseInt(m[1], 16),
              g_: parseInt(m[2], 16),
              b_: parseInt(m[3], 16),
              a_: 1
          }
        : null;
}

function parseRgbaColor(rgbaString: string): RgbaColor | null {
    const m = rgbaString.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)$/i);
    return m
        ? {
              r_: parseInt(m[1], 10),
              g_: parseInt(m[2], 10),
              b_: parseInt(m[3], 10),
              a_: m[4] ? parseFloat(m[4]) : 1
          }
        : null;
}

export function parseColor(colorString: string | null | undefined): RgbaColor | null {
    if (!colorString) {
        return null;
    } else if (stringStartsWith(colorString, 'rgb')) {
        return parseRgbaColor(colorString);
    } else if (stringStartsWith(colorString, '#')) {
        return parseHexColor(colorString);
    } else {
        return null;
    }
}

export function toRgba(color: RgbaColor): string {
    return `rgba(${color.r_},${color.g_},${color.b_},${color.a_})`;
}

export function toRgb(color: RgbaColor): string {
    return `rgb(${color.r_},${color.g_},${color.b_})`;
}

export function colorWithAlpha(color: RgbaColor, alpha: number): RgbaColor {
    return {
        r_: color.r_,
        g_: color.g_,
        b_: color.b_,
        a_: alpha
    };
}

export function rgbEquals(left: RgbaColor, right: RgbaColor): boolean {
    return left.r_ === right.r_ && left.g_ === right.g_ && left.b_ === right.b_;
}

export const COLOR_WHITE: RgbaColor = parseColor('#ffffff')!;
export const COLOR_BLACK: RgbaColor = parseColor('#000000')!;
