"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const intentController_1 = require("./intentController");
class AmazonController extends intentController_1.IntentController {
    constructor(handler) {
        super(handler);
    }
    help() {
        this.handler.emit(':tell', 'Hey yo, I\'m sorry, but you don\'t get no help. Sucka!');
    }
    cancel() {
        this.handler.emit(':tell', 'Cancelling ok');
    }
    stop() {
        this.handler.emit(':tell', 'Stopping ok');
    }
    unhandled() {
        this.handler.emit(':ask', 'I am sorry, but do not know how to handle your request. If you would like to record, just say record this followed by what ever you would like to record.');
    }
}
exports.AmazonController = AmazonController;
//# sourceMappingURL=amazonController.js.map