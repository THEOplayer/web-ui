import globalCss from './Global.css';
import { setTextContent } from './util/CommonUtils';
import { supportsAdoptingStyleSheets } from 'lit';

const GLOBAL_STYLE_ID = 'theoplayer-ui-global-styles';

let globalStylesAdded = false;

export function addGlobalStyles() {
    if (globalStylesAdded) {
        return;
    }
    if (supportsAdoptingStyleSheets) {
        document.adoptedStyleSheets.push(globalCss.styleSheet!);
    } else if (!document.getElementById(GLOBAL_STYLE_ID)) {
        const styleEl = document.createElement('style');
        styleEl.id = GLOBAL_STYLE_ID;
        // See https://lit.dev/docs/api/LitElement/#LitElement.styles
        const nonce = (window as any)['litNonce'];
        if (nonce !== undefined) {
            styleEl.setAttribute('nonce', nonce);
        }
        setTextContent(styleEl, globalCss.cssText);
        document.head.appendChild(styleEl);
    }
    globalStylesAdded = true;
}
