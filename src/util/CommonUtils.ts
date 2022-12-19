export type Constructor<T> = abstract new (...args: any[]) => T;

export function noOp(): void {
    return;
}

export function isElement(node: Node): node is Element {
    return node.nodeType === Node.ELEMENT_NODE;
}

export function isHTMLElement(node: unknown): node is HTMLElement {
    return node instanceof HTMLElement;
}

export const isArray: (arg: unknown) => arg is any[] =
    typeof Array.isArray === 'function'
        ? Array.isArray
        : (arg): arg is any[] => {
              return Object.prototype.toString.call(arg) === '[object Array]';
          };

export const fromArrayLike: <T>(arrayLike: ArrayLike<T>) => T[] =
    typeof Array.from === 'function'
        ? (arrayLike) => {
              return Array.from(arrayLike);
          }
        : (arrayLike) => {
              return Array.prototype.slice.call(arrayLike);
          };

export const arrayFind: <T>(array: readonly T[], predicate: (element: T, index: number, array: readonly T[]) => boolean) => T | undefined =
    typeof Array.prototype.find === 'function'
        ? (array, predicate) => array.find(predicate)
        : (array, predicate) => {
              for (let i = 0; i < array.length; i++) {
                  if (predicate(array[i], i, array)) {
                      return array[i];
                  }
              }
              return undefined;
          };

export const arrayFindIndex: <T>(array: readonly T[], predicate: (element: T, index: number, array: readonly T[]) => boolean) => number =
    typeof Array.prototype.findIndex === 'function'
        ? (array, predicate) => array.findIndex(predicate)
        : (array, predicate) => {
              for (let i = 0; i < array.length; i++) {
                  if (predicate(array[i], i, array)) {
                      return i;
                  }
              }
              return -1;
          };

export function arrayRemove<T>(array: T[], element: T): boolean {
    const index = array.indexOf(element);
    if (index < 0) {
        return false;
    }
    arrayRemoveAt(array, index);
    return true;
}

export function arrayRemoveAt<T>(array: T[], index: number): void {
    array.splice(index, 1);
}

export const localizeLanguageName: (languageCode: string) => string | undefined =
    typeof Intl !== 'undefined' && Intl.DisplayNames
        ? (languageCode) => {
              const displayNames = new Intl.DisplayNames([languageCode, 'en'], { type: 'language', fallback: 'none' });
              const localName = displayNames.of(languageCode);
              if (localName) {
                  return localName.slice(0, 1).toUpperCase() + localName.slice(1);
              }
          }
        : (_languageCode) => undefined;

export function setTextContent(el: HTMLElement, text: string): void {
    if (typeof el.textContent === 'undefined') {
        el.innerText = text;
    } else {
        el.textContent = text;
    }
}

export function containsComposedNode(rootNode: Node, childNode: Node): boolean {
    if (!rootNode || !childNode) {
        return false;
    }
    if (rootNode.contains(childNode)) {
        return true;
    }
    const childRoot = childNode.getRootNode();
    if ((childRoot as ShadowRoot).host) {
        return containsComposedNode(rootNode, (childRoot as ShadowRoot).host);
    }
    return false;
}
