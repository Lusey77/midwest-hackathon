import * as Alexa from 'alexa-sdk';
import {AlexaController} from './controllers/alexaController';
import {AmazonController} from "./controllers/amazonController";

const handler = function (event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context): void {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers({
        'NewSession': function () {
            new AlexaController(this).newSession();
        },
        'Record': function () {
            new AlexaController(this).record();
        },
        'PreviousRecord': function () {
            new AlexaController(this).previousRecord();
        },
        'AMAZON.HelpIntent': function () {
            new AmazonController(this).help();
        },
        'AMAZON.CancelIntent': function () {
            new AmazonController(this).cancel();
        },
        'AMAZON.StopIntent': function () {
            new AmazonController(this).stop();
        },
        'Unhandled': function () {
            new AmazonController(this).unhandled();
        }
    });
}; 
