"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MockHandler {
    constructor() {
        this.emitWithState = {};
        this.state = {};
        this.handler = {};
        this.event = {};
        this.attributes = {};
        this.context = {};
        this.name = {};
        this.isOverriden = {};
        this.i18n = {};
        this.locale = {};
        this.callback = {};
        this.t = {};
        this.response = {};
    }
    emit(event, ...args) {
        return true;
    }
    setEvent(event) {
        this.event = event;
    }
}
exports.MockHandler = MockHandler;
//# sourceMappingURL=testing.js.map