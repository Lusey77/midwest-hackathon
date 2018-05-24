import * as Alexa from "alexa-sdk";
import {RequestBody} from "alexa-sdk";
import {SlotValue} from "alexa-sdk";
import {IntentRequest} from "alexa-sdk";

export class MockHandler implements Alexa.Handler<Alexa.Request> {
    on: any;

    emit(event: string, ...args: any[]): boolean {
        return true;
    }

    emitWithState: any = {};
    state: any = {};
    handler: any = {};
    event: any = {};
    attributes: any = {};
    context: any = {};
    name: any = {};
    isOverriden: any = {};
    i18n: any = {};
    locale: any = {};
    callback: any = {};
    t: any = {};
    response: any = {};

    setEvent(event: RequestBody<Alexa.Request>) {
        this.event = event;
    }

    createEvent(slots: Record<string, SlotValue>) {
        const request: IntentRequest = {
            type: 'IntentRequest',
            requestId: '1',
            timestamp: 'atimestamp',
            intent: {
                name: 'Who knows',
                slots: slots
            }
        };

        this.event = {
            version: '1',
            session: undefined,
            request: request,
            context: undefined
        };
    }

    setAttributes(key: string, value: string) {
        this.attributes[key] = value;
    }
}