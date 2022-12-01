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
