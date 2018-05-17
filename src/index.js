"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Alexa = require("alexa-sdk");
const alexaController_1 = require("./controllers/alexaController");
const amazonController_1 = require("./controllers/amazonController");
exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers({
        'NewSession': function () {
            new alexaController_1.AlexaController(this).newSession();
        },
        'Record': function () {
            new alexaController_1.AlexaController(this).record();
        },
        'PreviousRecord': function () {
            new alexaController_1.AlexaController(this).previousRecord();
        },
        'GetName': function () {
            new alexaController_1.AlexaController(this).getName();
        },
        'GetBirthday': function () {
            new alexaController_1.AlexaController(this).getBirthday();
        },
        'BloodPressure': function () {
            new alexaController_1.AlexaController(this).getBloodPressure();
        },
        'AMAZON.HelpIntent': function () {
            new amazonController_1.AmazonController(this).help();
        },
        'AMAZON.CancelIntent': function () {
            new amazonController_1.AmazonController(this).cancel();
        },
        'AMAZON.StopIntent': function () {
            new amazonController_1.AmazonController(this).stop();
        },
        'Unhandled': function () {
            new amazonController_1.AmazonController(this).unhandled();
        }
    });
    alexa.execute();
};
//# sourceMappingURL=index.js.map