export type Constructor<T> = abstract new (...args: any[]) => T;

export function isElement(node: Node): node is Element {
    return node.nodeType === Node.ELEMENT_NODE;
}

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
