import { type ArrowKeyCode, KeyCode } from './KeyCode';
import { arrayMinByKey, getActiveElement } from './CommonUtils';
import { Rectangle } from './GeometryUtils';

export function navigateByArrowKey(container: HTMLElement, children: HTMLElement[], key: ArrowKeyCode): boolean {
    const focusedChild = getActiveElement();
    if (!focusedChild) {
        // TODO Default focus?
        if (children.length > 0) {
            children[0].focus();
            return true;
        }
        return false;
    }
    const containerRect = Rectangle.fromRect(container.getBoundingClientRect()).snapToPixels();
    const focusedRect = Rectangle.fromRect(focusedChild.getBoundingClientRect()).snapToPixels();
    const childrenWithRects = children
        .map(
            (child): ChildWithRect => ({
                child,
                rect: Rectangle.fromRect(child.getBoundingClientRect()).snapToPixels()
            })
        )
        .filter((x) => x.rect.width > 0 && x.rect.height > 0);
    // Find focusable children next to the focused child along the key's direction
    let candidates: ChildWithRect[];
    if (key === KeyCode.LEFT || key === KeyCode.RIGHT) {
        const bounds = focusedRect.clone();
        if (key === KeyCode.LEFT) {
            bounds.left = containerRect.left;
            bounds.width = focusedRect.left - containerRect.left;
        } else {
            bounds.left = focusedRect.right;
            bounds.width = containerRect.right - focusedRect.right;
        }
        candidates = childrenWithRects.filter((x) => bounds.contains(x.rect));
        if (candidates.length === 0) {
            bounds.top = containerRect.top;
            bounds.height = containerRect.height;
            candidates = childrenWithRects.filter((x) => bounds.contains(x.rect));
        }
    } else {
        const bounds = focusedRect.clone();
        if (key === KeyCode.UP) {
            bounds.top = containerRect.top;
            bounds.height = focusedRect.top - containerRect.top;
        } else {
            bounds.top = focusedRect.bottom;
            bounds.height = containerRect.bottom - focusedRect.bottom;
        }
        candidates = childrenWithRects.filter((x) => bounds.contains(x.rect));
        if (candidates.length === 0) {
            bounds.left = containerRect.left;
            bounds.width = containerRect.width;
            candidates = childrenWithRects.filter((x) => bounds.contains(x.rect));
        }
    }
    // Find the candidate closest to the currently focused child
    const closestCandidate = arrayMinByKey(candidates, (x) => manhattanDistanceBetweenRects(x.rect, focusedRect));
    if (closestCandidate === undefined) {
        return false;
    }
    // Focus it
    closestCandidate.child.focus();
    return true;
}

interface ChildWithRect {
    child: HTMLElement;
    rect: DOMRectReadOnly;
}

function manhattanDistanceBetweenRects(a: DOMRectReadOnly, b: DOMRectReadOnly): number {
    let distance = 0;
    if (a.right < b.left) {
        distance += b.left - a.right;
    } else if (b.right < a.left) {
        distance += a.left - b.right;
    }
    if (a.bottom < b.top) {
        distance += b.top - a.bottom;
    } else if (b.bottom < a.top) {
        distance += a.top - b.bottom;
    }
    return distance;
}
