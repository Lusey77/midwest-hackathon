import * as Alexa from 'alexa-sdk';

import { IntentController } from './intentController';

export class AlexaController extends IntentController {
    constructor(handler: Alexa.Handler<Alexa.Request>) {
        super(handler);
    }

    newSession(): void {
        this.handler.emit(':ask', 'Welcome to this recording app. I can help you by recording your voice. I am ready to start recording at any time. Just say record this followed by what ever you would like to record.');
    }

    record(): void {
        const request: Alexa.IntentRequest = this.handler.event.request;

        this.handler.attributes['recording'] = request.intent.slots.Query.value;
        const recording = this.handler.attributes['recording'];
        const speechOutput = '<break time="0.3s"/> If you would like to record something else, just say record this followed by what ever you would like to record, or listen to what you recorded by asking: What did i just record?';

        this.handler.emit(':ask','You recorded: '+ recording + speechOutput, 'Just say record this followed by what ever you would like to record, or listen to what you recorded by asking: What did i just re-cord?');
    }

    previousRecord(): void {
        const record = this.handler.attributes['recording'];
        if (record === undefined) {
            this.handler.emit(':ask', 'You have not recorded anything during this session. If you would like to record something, just say record this followed by what ever you would like to record.', 'Just say record this followed by what ever you would like to record.');
        } else {
            this.handler.emit(':ask', `<say-as interpret-as="interjection">all righty!</say-as> You previously recorded the following: ${record} <break time="0.3s"/> If you would like to record something eles, just say record this followed by what ever you would like to record.`);
        }
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