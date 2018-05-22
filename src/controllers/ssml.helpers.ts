export const pause = `<break time="0.4s"/>`;

export function interjection(value: any) {
    return `<say-as interpret-as="interjection">${value}</say-as>`;
}

export function date(value: any) {
    return `<say-as interpret-as="date">${value}</say-as>`;
}
