import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import {MockHandler} from '../testing';
import {AlexaController} from './alexaController';
import {IntentRequest, RequestBody, SlotValue} from "alexa-sdk";

chai.use(sinonChai);
let expect = chai.expect;
let mockHandler;
let emitStub;
let alexaController;

describe('Alexa Controller', () => {
    describe('NewSession', () => {
        it('returns expected message', () => {
            mockHandler = new MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AlexaController(mockHandler);
            alexaController.newSession();

            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':ask', 'Welcome to this recording app. I can help you by recording your voice. I am ready to start recording at any time. Just say record this followed by what ever you would like to record.');
        });
    });

    describe('Record', () => {
        it('should record and read back recording', () => {
            mockHandler = new MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');

            const slots: Record<string, SlotValue> = {
                'Query': {
                    name: 'value',
                    value: 'previous record'
                }
            };

            const request: IntentRequest = {
                type: 'IntentRequest',
                requestId: '1',
                timestamp: 'atimestamp',
                intent: {
                    name: 'Who knows',
                    slots: slots
                }
            };

            const event: RequestBody<IntentRequest> = {
                version: '1',
                session: null,
                request: request,
                context: null
            };

            mockHandler.setEvent(event);

            alexaController = new AlexaController(mockHandler);

            mockHandler.attributes['recording'] = 'previous record';
            alexaController.record();

            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':ask', 'You recorded: previous record<break time="0.3s"/> If you would like to record something else, just say record this followed by what ever you would like to record, or listen to what you recorded by asking: What did i just record?', 'Just say record this followed by what ever you would like to record, or listen to what you recorded by asking: What did i just re-cord?');
        });
    });

    describe('Previous Record', () => {
        describe('When no previous record', () => {
            it('returns a message saying no recordings exist', () => {
                mockHandler = new MockHandler();
                emitStub = sinon.stub(mockHandler, 'emit');
                alexaController = new AlexaController(mockHandler);

                mockHandler.attributes['recording'] = undefined;
                alexaController.previousRecord();

                expect(emitStub).to.have.been.calledOnce;
                expect(emitStub).to.have.been.calledWith(':ask', 'You have not recorded anything during this session. If you would like to record something, just say record this followed by what ever you would like to record.', 'Just say record this followed by what ever you would like to record.');
            });
        });

        describe('When previous record', () => {
            it('returns a message saying with previous recording', () => {
                mockHandler = new MockHandler();
                emitStub = sinon.stub(mockHandler, 'emit');
                alexaController = new AlexaController(mockHandler);

                mockHandler.attributes['recording'] = 'previous record';
                alexaController.previousRecord();

                expect(emitStub).to.have.been.calledOnce;
                expect(emitStub).to.have.been.calledWith(':ask', '<say-as interpret-as="interjection">all righty!</say-as> You previously recorded the following: previous record <break time="0.3s"/> If you would like to record something eles, just say record this followed by what ever you would like to record.');
            });
        });
    });
});
