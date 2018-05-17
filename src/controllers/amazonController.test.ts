import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import {MockHandler} from '../testing';
import {AmazonController} from './amazonController';

chai.use(sinonChai);
let expect = chai.expect;
let mockHandler;
let emitStub;
let alexaController;

describe('Amazon Controller', () => {
    describe('Help', () => {
        it('returns expected message', () => {
            mockHandler = new MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AmazonController(mockHandler);
            alexaController.help();

            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':tell', 'Hey yo, I\'m sorry, but you don\'t get no help. Sucka!');
        });
    });

    describe('Cancel', () => {
        it('returns expected message', () => {
            mockHandler = new MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AmazonController(mockHandler);
            alexaController.cancel();

            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':tell', 'Cancelling ok');
        });
    });

    describe('Stop', () => {
        it('returns expected message', () => {
            mockHandler = new MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AmazonController(mockHandler);
            alexaController.stop();

            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':tell', 'Stopping ok');
        });
    });

    describe('Unhandled', () => {
        it('returns expected message', () => {
            mockHandler = new MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AmazonController(mockHandler);
            alexaController.unhandled();

            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':ask', 'I am sorry, but do not know how to handle your request. If you would like to record, just say record this followed by what ever you would like to record.');
        });
    });
});
