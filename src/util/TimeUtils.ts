function isValidNumber(x: number): boolean {
    return !isNaN(x) && isFinite(x);
}

export function formatTime(time: number, guide: number = 0): string {
    // Handle negative values at the end
    let negative = time < 0;
    time = Math.abs(time);

    const guideMinutes = Math.floor((guide / 60) % 60);
    const guideHours = Math.floor(guide / 3600);

    let timeParts: string[];
    if (!isValidNumber(time)) {
        timeParts = [guideHours > 0 ? '--' : '', '--', '--'];
    } else {
        const seconds = Math.floor(time % 60);
        const minutes = Math.floor((time / 60) % 60);
        const hours = Math.floor(time / 3600);
        // Check if we need to show hours.
        const showHours = hours > 0 || guideHours > 0;
        // If hours are showing, we may need to add a leading zero to minutes.
        // Always show at least one digit of minutes.
        const showMinutesLeadingZero = showHours || guideMinutes >= 0;
        timeParts = [
            showHours ? `${hours}` : '',
            showMinutesLeadingZero && minutes < 10 ? `0${minutes}` : `${minutes}`,
            seconds < 10 ? `0${seconds}` : `${seconds}`
        ];
    }

    const timePhrase = timeParts.filter((part) => part !== '').join(':');
    return `${negative ? '-' : ''}${timePhrase}`;
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
