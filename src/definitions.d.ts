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
