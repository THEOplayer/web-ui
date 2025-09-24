declare module '*.css' {
    import type { CSSResult } from 'lit';
    const css: CSSResult;
    export default css;
}

declare module '*.html' {
    const htmlText: string;
    export default htmlText;
}

declare module '*.svg' {
    const svg: string;
    export default svg;
}
