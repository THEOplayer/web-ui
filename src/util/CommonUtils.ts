import { Attribute } from './Attribute';

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

export function isHTMLSlotElement(element: Element): element is HTMLSlotElement {
    return element.localName.toLowerCase() === 'slot';
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

export type Comparator<T, U = T> = (a: T, b: U) => number;

export function arrayMinByKey<T>(array: ReadonlyArray<T>, keySelector: (element: T) => number): T | undefined {
    return arrayMinBy(array, (first, second) => keySelector(first) - keySelector(second));
}

export function arrayMaxByKey<T>(array: ReadonlyArray<T>, keySelector: (element: T) => number): T | undefined {
    return arrayMaxBy(array, (first, second) => keySelector(first) - keySelector(second));
}

export function arrayMinBy<T>(array: ReadonlyArray<T>, comparator: Comparator<T>): T | undefined {
    if (array.length === 0) {
        return undefined;
    }
    return array.reduce((first, second) => (comparator(first, second) <= 0 ? first : second));
}

export function arrayMaxBy<T>(array: ReadonlyArray<T>, comparator: Comparator<T>): T | undefined {
    const minComparator = (a: T, b: T) => comparator(b, a);
    return arrayMinBy(array, minComparator);
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
export const stringStartsWith: (string: string, search: string) => boolean =
    typeof String.prototype.startsWith === 'function'
        ? (string, search) => string.startsWith(search)
        : (string, search) => string.substring(0, search.length) === search;

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

export function toggleAttribute(element: Element, attribute: string, enabled: boolean): void {
    if (enabled) {
        element.setAttribute(attribute, '');
    } else {
        element.removeAttribute(attribute);
    }
}

export function getChildren(element: Element): ArrayLike<Element> {
    if (element.shadowRoot) {
        return element.shadowRoot.children;
    }
    if (isHTMLSlotElement(element)) {
        const assignedNodes = element.assignedNodes();
        if (assignedNodes.length > 0) {
            return assignedNodes.filter(isElement);
        }
    }
    if (isHTMLElement(element)) {
        // Element.children does not exist for SVG elements in Internet Explorer.
        // Assume those won't contain any state receivers.
        return element.children;
    }
    return [];
}

export function getTvFocusChildren(element: Element): HTMLElement[] | undefined {
    if (!isHTMLElement(element)) {
        return;
    }
    if (getComputedStyle(element).display === 'none') {
        return;
    }
    if (element.getAttribute(Attribute.TV_FOCUS) !== null) {
        return getFocusableChildren(element);
    }

    const children = getChildren(element);
    for (let i = 0; i < children.length; i++) {
        const result = getTvFocusChildren(children[i]);
        if (result) {
            return result;
        }
    }
}

export function getFocusableChildren(element: HTMLElement): HTMLElement[] {
    const result: HTMLElement[] = [];
    collectFocusableChildren(element, result);
    return result;
}

function collectFocusableChildren(element: Element, result: HTMLElement[]) {
    if (!isHTMLElement(element)) {
        return;
    }
    if (getComputedStyle(element).display === 'none') {
        return;
    }
    if (element.hasAttribute('tabindex') && Number(element.getAttribute('tabindex')) >= 0) {
        result.push(element);
        return;
    }
    switch (element.tagName.toLowerCase()) {
        case 'button':
        case 'input':
        case 'textarea':
        case 'select':
        case 'details': {
            result.push(element);
            break;
        }
        case 'a': {
            if ((element as HTMLAnchorElement).href) {
                result.push(element);
            }
            break;
        }
        default: {
            const children = getChildren(element);
            for (let i = 0; i < children.length; i++) {
                collectFocusableChildren(children[i], result);
            }
            break;
        }
    }
}

export function getActiveElement(): Element | null {
    let activeElement = document.activeElement;
    if (activeElement == null) {
        return null;
    }
    let nextActiveElement: Element | null | undefined;
    while ((nextActiveElement = activeElement.shadowRoot?.activeElement) != null) {
        activeElement = nextActiveElement;
    }
    return activeElement;
}
