import * as Alexa from 'alexa-sdk';
import { AlexaController } from './controllers/alexaController';
import { AmazonController } from './controllers/amazonController';

const handler = function (event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context, callback: (err: any, response: any) => void): void {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers({
        'NewSession': function () {
            new AlexaController(this).newSession();
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
        'RerecordNote': function () {
            new AlexaController(this).reRecordNote();
        },
        'SetDiagnosis': function () {
            new AlexaController(this).setDiagnosis();
        },
        'GetLastDiagnosis': function () {
            new AlexaController(this).getLastDiagnosis();
        },
        'HelpIntent': function () {
            new AmazonController(this).help();
        },
        'CancelIntent': function () {
            new AmazonController(this).cancel();
        },
        'StopIntent': function () {
            new AmazonController(this).stop();
        },
        'Unhandled': function () {
            new AmazonController(this).unhandled();
        }
    });
    alexa.execute();
};

export default handler;
