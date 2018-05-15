import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import {MockHandler} from '../testing';
import {AlexaController} from './alexaController';


chai.use(sinonChai);
let expect = chai.expect;
let mockHandler;
let emitStub;
let alexaController;


describe('Alexa Controller', () => {
//     beforeEach(() => {
//         mockHandler = new MockHandler();
//         emitStub = sinon.stub(mockHandler, 'emit');
//         alexaController = new AlexaController(mockHandler);
//     });

//     describe('NewSession', () => {
//         alexaController.newSession();

//         it('returns expected message', () => {
//             expect(emitStub).to.have.been.calledOnce;
//             expect(emitStub).to.have.been.calledWith(':ask', 'Welcome to this recording app. I can help you by recording your voice. I am ready to start recording at any time. Just say record this followed by what ever you would like to record.');
//         });
//     });

//     describe('Record', () => {
//         mockHandler.attributes['recording'] = 'previous record';
//         alexaController.record();

//         it('should record and read back recording', () => {
//             expect(emitStub).to.have.been.calledOnce;
//             expect(emitStub).to.have.been.calledWith(':ask','You recorded: previous record <break time="0.3s"/> If you would like to record something else, just say record this followed by what ever you would like to record, or listen to what you recorded by asking: What did i just record?', 'Just say record this followed by what ever you would like to record, or listen to what you recorded by asking: What did i just re-cord?');
//         });
//     });

//     describe('Previous Record', () => {
//         describe('When no previous record', () => {
//             beforeEach(() => {
//                 mockHandler.attributes['recording'] = undefined;
//                 alexaController.previousRecord();
//             });

//             it('returns a message saying no recordings exist', () => {
//                 expect(emitStub).to.have.been.calledOnce;
//                 expect(emitStub).to.have.been.calledWith(':ask', 'You have not recorded anything during this session. If you would like to record something, just say record this followed by what ever you would like to record.', 'Just say record this followed by what ever you would like to record.');
//             });
//         });

//         describe('When previous record', () => {
//             beforeEach(() => {
//                 mockHandler.attributes['recording'] = 'previous record';
//                 alexaController.previousRecord();
//             });

//             it('returns a message saying with previous recording', () => {
//                 expect(emitStub).to.have.been.calledOnce;
//                 expect(emitStub).to.have.been.calledWith(':ask', '<say-as interpret-as="interjection">all righty!</say-as> You previously recorded the following: previous record <break time="0.3s"/> If you would like to record something eles, just say record this followed by what ever you would like to record.');
//             });
//         });

//         it('returns hello world', () => {
//             expect(emitStub).to.have.been.calledOnce;
//             expect(emitStub).to.have.been.calledWith(':ask', 'Welcome to this recording app. I can help you by recording your voice. I am ready to start recording at any time. Just say record this followed by what ever you would like to record.');
//         });
//     });

    describe('Help', () => {
        it('returns expected message', () => {
            mockHandler = new MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AlexaController(mockHandler);
            alexaController.help();
            
            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':tell', 'Hey yo, I\'m sorry, but you don\'t get no help. Sucka!');
        });
    });

    describe('Cancel', () => {
        it('returns expected message', () => {
            mockHandler = new MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AlexaController(mockHandler);
            alexaController.cancel();
            
            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':tell', 'Cancelling ok');
        });
    });

    describe('Stop', () => {
        it('returns expected message', () => {
            mockHandler = new MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AlexaController(mockHandler);
            alexaController.stop();
            
            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':tell', 'Stopping ok');
        });
    });

    describe('Unhandled', () => {
        it('returns expected message', () => {
            mockHandler = new MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AlexaController(mockHandler);
            alexaController.unhandled();
            
            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':ask', 'I am sorry, but  do not know how to handle your request. If you would like to record, just say record this followed by what ever you would like to record.');
        });
    });
});
