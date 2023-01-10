export class Rectangle implements DOMRect {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get left(): number {
        return this.x;
    }

    set left(value: number) {
        this.x = value;
    }

    get right(): number {
        return this.x + this.width;
    }

    set right(value: number) {
        this.x = value - this.width;
    }

    get top(): number {
        return this.y;
    }

    set top(value: number) {
        this.y = value;
    }

    get bottom(): number {
        return this.y + this.height;
    }

    set bottom(value: number) {
        this.y = value - this.height;
    }

    static fromRect({ x = 0, y = 0, width = 0, height = 0 }: DOMRectInit): Rectangle {
        return new Rectangle(x, y, width, height);
    }

    overlaps(other: DOMRectReadOnly): boolean {
        return this.x < other.right && this.right > other.x && this.y < other.bottom && this.bottom > other.y;
    }

    contains(other: DOMRectReadOnly): boolean {
        return this.x <= other.x && other.right <= this.right && this.y <= other.y && other.bottom <= this.bottom;
    }

    union(other: DOMRectReadOnly): Rectangle {
        const x = Math.min(this.x, other.x);
        const y = Math.min(this.y, other.y);
        const width = Math.max(this.right, other.right) - x;
        const height = Math.max(this.bottom, other.bottom) - y;
        return new Rectangle(x, y, width, height);
    }

    clone(): Rectangle {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }

    toJSON(): any {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            left: this.left,
            right: this.right,
            top: this.top,
            bottom: this.bottom
        };
    }
}
