function isValidNumber(x: number): boolean {
    return !isNaN(x) && isFinite(x);
}

const timeUnitLabels = [
    ['hour', 'hours'],
    ['minute', 'minutes'],
    ['second', 'seconds']
] as const;

export function toTimeUnitPhrase(timeUnitValue: number, unitIndex: 0 | 1 | 2): string {
    const unitLabel = timeUnitLabels[unitIndex][timeUnitValue === 1 ? 0 : 1];
    return `${timeUnitValue} ${unitLabel}`;
}

export function formatAsTimePhrase(time: number): string {
    if (!isValidNumber(time)) return '';
    const negative = time < 0;
    time = Math.abs(time);

    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);

    const timePhrase = [
        hours === 0 ? '' : toTimeUnitPhrase(hours, 0),
        minutes === 0 ? '' : toTimeUnitPhrase(minutes, 1),
        seconds === 0 ? '' : toTimeUnitPhrase(seconds, 2)
    ]
        .filter((part) => part !== '')
        .join(', ');

    // If the time was negative, assume it represents some remaining amount of time/"count down".
    const negativeSuffix = negative ? ' remaining' : '';

    return `${timePhrase}${negativeSuffix}`;
}
