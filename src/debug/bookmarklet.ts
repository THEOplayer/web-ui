import './DebugDisplay';
import './RollingChart';

const uiSelector = 'theoplayer-default-ui, theolive-default-ui, theoplayer-ui';
const displayTag = 'theoplayer-debug-display';
const frameAttribute = 'data-theoplayer-debug-frame';
const requiredVersion = '2.6.0';
const currentScript = document.currentScript as HTMLScriptElement | null;

/**
 * Collect UI elements from a DOM tree and open shadow roots outside matched UIs.
 */
function collectUIElements(root: ParentNode, elements: HTMLElement[]): void {
    for (const element of root.querySelectorAll<HTMLElement>('*')) {
        if (element.matches(uiSelector)) {
            elements.push(element);
        } else if (element.shadowRoot) {
            collectUIElements(element.shadowRoot, elements);
        }
    }
}

/**
 * Collect documents from accessible frames and their descendants.
 */
function collectDocuments(win: Window, documents: Document[]): void {
    try {
        documents.push(win.document);
    } catch {
        return;
    }

    let frameCount: number;
    try {
        frameCount = win.frames.length;
    } catch {
        return;
    }
    for (let index = 0; index < frameCount; index++) {
        try {
            collectDocuments(win.frames[index], documents);
        } catch {
            // Keep scanning sibling frames if one is inaccessible.
        }
    }
}

/**
 * Check whether a UI exposes the debug overlay slot.
 */
function isSupported(ui: HTMLElement): boolean {
    return !!ui.shadowRoot?.querySelector('slot[name="overlay"]');
}

/**
 * Toggle a direct-child debug panel or append one to the overlay slot.
 */
function toggleDebugDisplay(ui: HTMLElement): void {
    const display = Array.from(ui.children).find((child): child is HTMLElement => child.localName === 'theoplayer-debug-display');
    if (display) {
        display.hidden = !display.hidden;
        return;
    }
    const newDisplay = ui.ownerDocument.createElement(displayTag);
    newDisplay.slot = 'overlay';
    ui.append(newDisplay);
}

/**
 * Inject this bookmarklet into a frame's document.
 */
function injectBookmarklet(doc: Document, src: string): void {
    const script = doc.createElement('script');
    script.src = src;
    script.setAttribute(frameAttribute, '');
    (doc.head ?? doc.documentElement).append(script);
}

/**
 * Read the UI version from the element or its global bundle.
 */
function getUIVersion(ui: HTMLElement): string | undefined {
    return (
        (ui as { version?: string }).version ??
        (ui.ownerDocument.defaultView as { THEOplayerUI?: { version?: string } } | null)?.THEOplayerUI?.version
    );
}

/**
 * Describe why no supported UI was found.
 */
function getNotFoundMessage(unsupported: HTMLElement[]): string {
    if (unsupported.length === 0) {
        return 'No Open Video UI player with debug overlay support found on this page.';
    }

    const version = unsupported.map(getUIVersion).find((value) => value !== undefined);
    return version
        ? `Open Video UI ${version} found, but the debug display requires Open Video UI ${requiredVersion} or higher.`
        : `Open Video UI found, but the debug display requires Open Video UI ${requiredVersion} or higher.`;
}

if (currentScript?.hasAttribute(frameAttribute)) {
    const elements: HTMLElement[] = [];
    collectUIElements(document, elements);
    for (const ui of elements.filter(isSupported)) {
        toggleDebugDisplay(ui);
    }
} else {
    const documents: Document[] = [];
    collectDocuments(window, documents);
    const unsupported: HTMLElement[] = [];
    let foundSupported = false;

    for (const doc of documents) {
        const elements: HTMLElement[] = [];
        collectUIElements(doc, elements);
        const supported = elements.filter(isSupported);
        unsupported.push(...elements.filter((ui) => !isSupported(ui)));
        if (supported.length === 0) {
            continue;
        }

        if (doc === document || doc.defaultView?.customElements.get(displayTag)) {
            for (const ui of supported) {
                toggleDebugDisplay(ui);
            }
            foundSupported = true;
        } else if (currentScript?.src) {
            injectBookmarklet(doc, currentScript.src);
            foundSupported = true;
        }
    }

    if (!foundSupported) {
        window.alert(getNotFoundMessage(unsupported));
    }
}
