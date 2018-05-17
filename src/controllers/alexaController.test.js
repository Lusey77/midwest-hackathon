"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const testing_1 = require("../testing");
const alexaController_1 = require("./alexaController");
const ssml_helpers_1 = require("./ssml.helpers");
chai.use(sinonChai);
let expect = chai.expect;
let mockHandler;
let emitStub;
let alexaController;
describe('Alexa Controller', () => {
    describe('NewSession', () => {
        it('returns expected message', () => {
            mockHandler = new testing_1.MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new alexaController_1.AlexaController(mockHandler);
            alexaController.newSession();
            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':ask', 'Welcome to this recording app. I can help you by recording your voice. I am ready to start recording at any time. Just say record this followed by what ever you would like to record.');
        });
    });
    describe('Record', () => {
        it('should record and read back recording', () => {
            mockHandler = new testing_1.MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            const slots = {
                'Query': {
                    name: 'value',
                    value: 'previous record'
                }
            };
            const request = {
                type: 'IntentRequest',
                requestId: '1',
                timestamp: 'atimestamp',
                intent: {
                    name: 'Who knows',
                    slots: slots
                }
            };
            const event = {
                version: '1',
                session: undefined,
                request: request,
                context: undefined
            };
            mockHandler.setEvent(event);
            alexaController = new alexaController_1.AlexaController(mockHandler);
            mockHandler.attributes['recording'] = 'previous record';
            alexaController.record();
            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':ask', `You recorded: previous record ${ssml_helpers_1.pause} If you would like to record something else, just say record this followed by what ever you would like to record, or listen to what you recorded by asking: What did i just re-cord?`, `Just say record this followed by what ever you would like to record, or listen to what you recorded by asking: What did i just re-cord?`);
        });
    });
    describe('Previous Record', () => {
        describe('When no previous record', () => {
            it('returns a message saying no recordings exist', () => {
                mockHandler = new testing_1.MockHandler();
                emitStub = sinon.stub(mockHandler, 'emit');
                alexaController = new alexaController_1.AlexaController(mockHandler);
                mockHandler.attributes['recording'] = undefined;
                alexaController.previousRecord();
                expect(emitStub).to.have.been.calledOnce;
                expect(emitStub).to.have.been.calledWith(':ask', 'You have not recorded anything during this session. If you would like to record something, just say record this followed by what ever you would like to record.', 'Just say record this followed by what ever you would like to record.');
            });
        });
        describe('When previous record', () => {
            it('returns a message saying with previous recording', () => {
                mockHandler = new testing_1.MockHandler();
                emitStub = sinon.stub(mockHandler, 'emit');
                alexaController = new alexaController_1.AlexaController(mockHandler);
                mockHandler.attributes['recording'] = 'previous record';
                alexaController.previousRecord();
                expect(emitStub).to.have.been.calledOnce;
                expect(emitStub).to.have.been.calledWith(':ask', `${ssml_helpers_1.interjection('all righty!')} You previously recorded the following: previous record ${ssml_helpers_1.pause} If you would like to record something else, just say record this followed by what ever you would like to record.`);
            });
        });
    });
});
//# sourceMappingURL=alexaController.test.js.map