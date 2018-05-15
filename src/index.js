"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Alexa = require("alexa-sdk");
const alexaController_1 = require("./controllers/alexaController");
const handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers({
        'NewSession': function () { new alexaController_1.AlexaController(this).newSession(); },
        'Record': function () { new alexaController_1.AlexaController(this).record(); },
        'PreviousRecord': function () { new alexaController_1.AlexaController(this).previousRecord(); },
        'AMAZON.HelpIntent': function () { new alexaController_1.AlexaController(this).help(); },
        'AMAZON.CancelIntent': function () { new alexaController_1.AlexaController(this).cancel(); },
        'AMAZON.StopIntent': function () { new alexaController_1.AlexaController(this).stop(); },
        'Unhandled': function () { new alexaController_1.AlexaController(this).unhandled(); }
    });
};
//# sourceMappingURL=index.js.map