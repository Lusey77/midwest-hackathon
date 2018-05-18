import * as Alexa from 'alexa-sdk';
import {AlexaController} from './controllers/alexaController';
import {AmazonController} from './controllers/amazonController';

export const handler = function (event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context): void {
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
        'GetName': function () {
            new AlexaController(this).getName();
        },
        'GetBirthday': function () {
            new AlexaController(this).getBirthday();
        },
        'BloodPressure': function () {
            new AlexaController(this).getBloodPressure();
        },
        'TakeNote': function () {
            new AlexaController(this).takeNote();
        },
        'GetLastNote': function () {
            new AlexaController(this).getLastNote();
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
    alexa.execute();
};
