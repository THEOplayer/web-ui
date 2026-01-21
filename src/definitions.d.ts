declare module '*.css' {
    import type { CSSResult } from 'lit';
    const cssText: CSSResult;
    export default cssText;
}

declare module '*.html' {
    const htmlText: string;
    export default htmlText;
}

declare module '*.svg' {
    const svgText: string;
    export default svgText;
}

declare namespace Intl {
    type DurationTimeFormatLocaleMatcher = 'lookup' | 'best fit';
    type DurationFormatStyle = 'long' | 'short' | 'narrow' | 'digital';

    interface DurationFormatOptions {
        localeMatcher?: DurationTimeFormatLocaleMatcher;
        numberingSystem?: string;
        style?: DurationFormatStyle;
        secondsDisplay?: 'always' | 'auto';
    }

    interface DurationFormatInput {
        years?: number;
        months?: number;
        weeks?: number;
        days?: number;
        hours?: number;
        minutes?: number;
        seconds?: number;
        milliseconds?: number;
        microseconds?: number;
        nanoseconds?: number;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat
    class DurationFormat {
        constructor(locales?: LocalesArgument, options?: DurationFormatOptions);

        format(duration: DurationFormatInput): string;
    }
}
