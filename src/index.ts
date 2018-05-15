import * as Alexa from 'alexa-sdk';
import { AlexaController } from './controllers/alexaController';

const handler = function(event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context): void {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers({
        'NewSession': function() { new AlexaController(this).newSession(); },
        'Record': function () { new AlexaController(this).record(); },
        'PreviousRecord': function() { new AlexaController(this).previousRecord(); },
        'AMAZON.HelpIntent': function () { new AlexaController(this).help(); },
        'AMAZON.CancelIntent': function () { new AlexaController(this).cancel(); },
        'AMAZON.StopIntent': function () { new AlexaController(this).stop(); },
        'Unhandled': function() { new AlexaController(this).unhandled(); }
    });
}; 
