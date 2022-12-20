import type { DefaultUI } from '../DefaultUI';

export type Extension = (ui: DefaultUI) => HTMLElement | HTMLElement[];

const extensionRegistry: Extension[] = [];

export function registerExtension(extension: Extension): void {
    extensionRegistry.push(extension);
}

export function applyExtensions(ui: DefaultUI): void {
    for (const extension of extensionRegistry) {
        extension(ui);
    }
}
