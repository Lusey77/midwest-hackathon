"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pause = `<break time="0.3s"/>`;
function interjection(value) {
    return `<say-as interpret-as="interjection">${value}</say-as>`;
}
exports.interjection = interjection;
function date(value) {
    return `<say-as interpret-as="date">${value}</say-as>`;
}
exports.date = date;
//# sourceMappingURL=ssml.helpers.js.map