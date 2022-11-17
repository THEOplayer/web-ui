declare module '*.css' {
    import { CSSResult } from 'lit';
    const css: CSSResult;
    export default css;
}

declare module '*.html' {
    const htmlText: string;
    export default htmlText;
}
