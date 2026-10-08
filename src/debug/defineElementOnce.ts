/**
 * Register a custom element only when its name is not already defined.
 */
export function defineElementOnce(name: string, constructor: CustomElementConstructor): void {
    if (!customElements.get(name)) {
        customElements.define(name, constructor);
    }
}
