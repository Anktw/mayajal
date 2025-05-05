export function addMinutesToDate(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
}

export function formatTime(totalMinutes: number): string {
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const seconds = 0;
    const parts = [];
    if (days) parts.push(`${days} D`);
    if (hours) parts.push(`${hours} H`);
    if (minutes) parts.push(`${minutes} M`);
    if (seconds) parts.push(`${seconds} S`);
    return parts.length ? parts.join(':') : '0 min';
}

export function formatTimeFromSeconds(totalSeconds: number): string {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (days) parts.push(`${days} D`);
    if (hours) parts.push(`${hours} H`);
    if (minutes) parts.push(`${minutes} M`);
    if (seconds) parts.push(`${seconds} S`);
    return parts.length ? parts.join(' : ') : '0 S';
}