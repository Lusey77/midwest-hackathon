import * as Alexa from 'alexa-sdk';

import {IntentController} from './intentController';

export class AmazonController extends IntentController {
    constructor(handler: Alexa.Handler<Alexa.Request>) {
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
        this.handler.emit(':ask', 'I am sorry, but  do not know how to handle your request. If you would like to record, just say record this followed by what ever you would like to record.');
    }

}