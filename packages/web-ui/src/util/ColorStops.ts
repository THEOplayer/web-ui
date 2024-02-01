import { arrayFindIndex } from './CommonUtils';

export type ColorStop = [color: string, percent: number];

export class ColorStops {
    private _stops: ColorStop[] = [['transparent', 100]];

    constructor() {}

    add(color: string, from: number, to: number): void {
        from = Math.max(from, 0);
        to = Math.min(to, 100);
        if (from >= to) {
            return;
        }
        const previousIndex = arrayFindIndex(this._stops, ([, percent]) => from <= percent);
        if (previousIndex < 0) {
            return;
        }
        const [previousColor, previousPercent] = this._stops[previousIndex];
        const newStops: ColorStop[] = [];
        if (from > 0) {
            newStops.push([previousColor, from]);
        }
        newStops.push([color, to]);
        if (to < previousPercent) {
            // New stop is fully contained within previous stop
            // Split previous stop
            newStops.push([previousColor, previousPercent]);
            this._stops.splice(previousIndex, 1, ...newStops);
        } else {
            // New stop extends beyond previous stop
            // Remove overlapping stops
            let nextIndex = previousIndex + 1;
            while (nextIndex < this._stops.length) {
                if (to < this._stops[nextIndex][1]) {
                    break;
                }
                nextIndex++;
            }
            this._stops.splice(previousIndex, nextIndex - previousIndex, ...newStops);
        }
    }

    toGradientStops(): string {
        const gradientStops: string[] = [];
        let prevPercent = 0;
        for (const [color, percent] of this._stops) {
            if (percent < prevPercent) continue;
            gradientStops.push(`${color} ${prevPercent}%`);
            gradientStops.push(`${color} ${percent}%`);
            prevPercent = percent;
        }
        return gradientStops.join(', ');
    }
}
