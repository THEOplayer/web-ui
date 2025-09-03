import globalCss from './Global.css';

const GLOBAL_STYLE_ID = 'theoplayer-ui-global-styles';

let globalStylesAdded = false;

export function addGlobalStyles() {
    if (globalStylesAdded) {
        return;
    }
    if (document.getElementById(GLOBAL_STYLE_ID)) {
        globalStylesAdded = true;
        return;
    }
    const styleEl = document.createElement('style');
    styleEl.id = GLOBAL_STYLE_ID;
    styleEl.innerHTML = globalCss;
    document.head.appendChild(styleEl);
    globalStylesAdded = true;
}
