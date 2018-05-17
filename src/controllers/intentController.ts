import {Handler, Request} from 'alexa-sdk';

export class IntentController {
    protected handler: Handler<Request>;

    constructor(handler: Handler<Request>) {
        this.handler = handler;
    }
}