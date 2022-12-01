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
