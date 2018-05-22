import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import {IntentRequest, RequestBody, SlotValue} from 'alexa-sdk';
import {MockHandler} from '../testing';
import {AlexaController} from './alexaController';
import {interjection, pause} from './ssml.helpers';

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
            expect(emitStub).to.have.been.calledWith(':ask', 'Welcome to the medical recording app scribe. I will assist you in recording and accessing the details of your patient. Please start by saying Patient ID: followed by the identification number of the patient.');

        });
    });
});
