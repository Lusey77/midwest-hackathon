import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import {SlotValue} from 'alexa-sdk';
import {MockHandler} from '../testing';
import {AlexaController} from './alexaController';
import {pause} from './ssml.helpers';

chai.use(sinonChai);
let expect = chai.expect;
let mockHandler;
let emitStub;
let alexaController;

describe('Alexa Controller', () => {
    describe('NewSession', () => {
        it('emits expected message', () => {
            mockHandler = new MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AlexaController(mockHandler);
            alexaController.newSession();

            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':ask', 'Welcome to the medical recording app scribe. I will assist you in recording and accessing the details of your patient. Please start by saying Patient ID: followed by the identification number of the patient.');
        });
    });

    describe('Unopened session', () => {
        it('emits expected message when first name is null', () => {
            mockHandler = new MockHandler();
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AlexaController(mockHandler);
            const slots: Record<string, SlotValue> = {
                'birthday': {
                    name: 'value',
                    value: 19890615
                }
            };

            mockHandler.createEvent(slots);
            alexaController.getBirthday();

            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
        });

        it('emits expected message when first name is null', () => {
            mockHandler = new MockHandler();
            mockHandler.setAttributes('first_name', 'Kaleb');
            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AlexaController(mockHandler);
            const slots: Record<string, SlotValue> = {
                'birthday': {
                    name: 'value',
                    value: 19890615
                }
            };

            mockHandler.createEvent(slots);
            alexaController.getBirthday();

            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':ask', 'The birthday that you gave does not match what is stated in the database. Please verify the birthday again or select a different patient.');
        });
    });

    describe('GetName', () => {
        it('calls dynamoDb', () => {
            mockHandler = new MockHandler();

            const slots: Record<string, SlotValue> = {
                'PatientId': {
                    name: 'value',
                    value: '2345'
                }
            };

            const params = {
                TableName: 'Patients',
                Key: {
                    'PatientId': {S: '2345'}
                }
            };

            mockHandler.createEvent(slots);

            let dynamodbmock = {
                getItem: () => {
                    return true;
                }
            };

            const spy = sinon.spy(dynamodbmock, 'getItem');

            alexaController = new AlexaController(mockHandler);
            alexaController._dynamodb = dynamodbmock;

            alexaController.getName();

            expect(spy.calledOnce).to.equal(true);
            expect(spy.calledWith(params)).to.equal(true);
        });
    });

    describe('GetBirthday', () => {
        it('emits expected message', () => {
            mockHandler = new MockHandler();

            const slots: Record<string, SlotValue> = {
                'birthday': {
                    name: 'value',
                    value: 19890615
                }
            };

            mockHandler.createEvent(slots);
            mockHandler.setAttributes('first_name', 'Kaleb');
            mockHandler.setAttributes('date_of_birth', 19890615);

            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AlexaController(mockHandler);

            alexaController.getBirthday();

            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':ask', `We will now start entering information for Kaleb ${pause} born on 19890615 ${pause}. To record a note say take note, record note, or make note followed by the note that you would like to record.`);
        });
    });

    describe('GetBloodPressure', () => {
        it('emits expected message', () => {
            mockHandler = new MockHandler();

            const slots: Record<string, SlotValue> = {
                'systolic': {
                    name: 'value',
                    value: 100
                },
                'diastolic': {
                    name: 'value',
                    value: 80
                }
            };

            mockHandler.createEvent(slots);
            mockHandler.setAttributes('first_name', 'Kaleb');
            mockHandler.setAttributes('date_of_birth', 19890615);

            emitStub = sinon.stub(mockHandler, 'emit');
            alexaController = new AlexaController(mockHandler);

            alexaController.getBloodPressure();

            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(':ask', `Kaleb's blood pressure is 100 over 80`);
        });
    });

    describe('Take Note', () => {
        it('sends items to dynamoDb', () => {
            mockHandler = new MockHandler();

            const slots: Record<string, SlotValue> = {
                'note': {
                    name: 'value',
                    value: 'I am a note'
                }
            };

            mockHandler.createEvent(slots);
            mockHandler.setAttributes('first_name', 'Kaleb');
            mockHandler.setAttributes('last_name', 'Luse');
            mockHandler.setAttributes('date_of_birth', 19890615);
            mockHandler.setAttributes('current_date', 20180512);
            mockHandler.setAttributes('all_db_info', {Note: {L: []}, Diagnosis: {L: []}});
            mockHandler.setAttributes('patient_id', '2345');
            mockHandler.setAttributes('physician_id', '1234');

            const params = {
                TableName: 'Patients',
                Item: {
                    'PatientId': {S: '2345'},
                    'FirstName': {S: 'Kaleb'},
                    'LastName': {S: 'Luse'},
                    'DateOfBirth': {S: 19890615},
                    'Note': {L: [{M: {
                                'Date': {'S': new Date(0).toString().slice(0, -24)},
                                'PhysicianId': {'S': '1234'},
                                'NoteAdded': {'S': 'I am a note'},
                            }}]},
                    'Diagnosis': {L: []}
                },
            };

            let dynamodbmock = {
                putItem: () => {
                    return true;
                }
            };

            const spy = sinon.spy(dynamodbmock, 'putItem');

            alexaController = new AlexaController(mockHandler);
            alexaController._dynamodb = dynamodbmock;
            alexaController.today = function() {
                return new Date(0);
            };

            alexaController.takeNote();

            expect(spy.calledOnce).to.equal(true);
            expect(spy.calledWith(params)).to.equal(true);
        });
    });

    describe('GetLastNote', () => {
        it('calls dynamoDb', () => {
            mockHandler = new MockHandler();

            const params = {
                TableName: 'Patients',
                Key: {
                    'PatientId': {S: '2345'}
                }
            };

            let dynamodbmock = {
                getItem: () => {
                    return true;
                }
            };

            const spy = sinon.spy(dynamodbmock, 'getItem');

            alexaController = new AlexaController(mockHandler);
            alexaController._dynamodb = dynamodbmock;
            mockHandler.setAttributes('first_name', 'Kaleb');
            mockHandler.setAttributes('date_of_birth', 19890615);
            mockHandler.setAttributes('patient_id', '2345');


            alexaController.getLastNote();

            expect(spy.calledOnce).to.equal(true);
            expect(spy.calledWith(params)).to.equal(true);
        });
    });

    describe('Re-Record Note', () => {
        it('sends items to dynamoDb', () => {
            mockHandler = new MockHandler();

            const slots: Record<string, SlotValue> = {
                'query': {
                    name: 'value',
                    value: 'I am a note'
                }
            };

            mockHandler.createEvent(slots);
            mockHandler.setAttributes('first_name', 'Kaleb');
            mockHandler.setAttributes('last_name', 'Luse');
            mockHandler.setAttributes('date_of_birth', 19890615);
            mockHandler.setAttributes('current_date', 20180512);
            mockHandler.setAttributes('all_db_info', {Note: {L: ['a note']}, Diagnosis: {L: []}});
            mockHandler.setAttributes('patient_id', '2345');
            mockHandler.setAttributes('physician_id', '1234');

            const params = {
                TableName: 'Patients',
                Item: {
                    'PatientId': {S: '2345'},
                    'FirstName': {S: 'Kaleb'},
                    'LastName': {S: 'Luse'},
                    'DateOfBirth': {S: 19890615},
                    'Note': {L: [{M: {
                                'Date': {'S': new Date(0).toString().slice(0, -24)},
                                'PhysicianId': {'S': '1234'},
                                'NoteAdded': {'S': 'I am a note'},
                            }}]},
                    'Diagnosis': {L: []}
                },
            };

            let dynamodbmock = {
                putItem: () => {
                    return true;
                }
            };

            const spy = sinon.spy(dynamodbmock, 'putItem');

            alexaController = new AlexaController(mockHandler);
            alexaController._dynamodb = dynamodbmock;
            alexaController.today = function() {
                return new Date(0);
            };

            alexaController.reRecordNote();

            expect(spy.calledOnce).to.equal(true);
            expect(spy.calledWith(params)).to.equal(true);
        });
    });

    describe('SetDiagnosis', () => {
        it('sends items to dynamoDb', () => {
            mockHandler = new MockHandler();

            const slots: Record<string, SlotValue> = {
                'diagnosis': {
                    name: 'value',
                    value: 'Strep'
                }
            };

            mockHandler.createEvent(slots);
            mockHandler.setAttributes('first_name', 'Kaleb');
            mockHandler.setAttributes('last_name', 'Luse');
            mockHandler.setAttributes('date_of_birth', 19890615);
            mockHandler.setAttributes('current_date', 20180512);
            mockHandler.setAttributes('all_db_info', {Note: {L: []}, Diagnosis: {L: []}});
            mockHandler.setAttributes('patient_id', '2345');
            mockHandler.setAttributes('physician_id', '1234');

            const params = {
                TableName: 'Patients',
                Item: {
                    'PatientId': {S: '2345'},
                    'FirstName': {S: 'Kaleb'},
                    'LastName': {S: 'Luse'},
                    'DateOfBirth': {S: 19890615},
                    'Note': {L: []},
                    'Diagnosis': {L: [{M: {
                                'Date': {'S': new Date(0).toString().slice(0, -24)},
                                'PhysicianId': {'S': '1234'},
                                'Diagnosis': {'S': 'Strep'},
                            }
                        }]}
                },
            };

            let dynamodbmock = {
                putItem: () => {
                    return true;
                }
            };

            const spy = sinon.spy(dynamodbmock, 'putItem');

            alexaController = new AlexaController(mockHandler);
            alexaController._dynamodb = dynamodbmock;
            alexaController.today = function() {
                return new Date(0);
            };

            alexaController.setDiagnosis();

            expect(spy.calledOnce).to.equal(true);
            expect(spy.calledWith(params)).to.equal(true);
        });
    });

    describe('GetLastDiagnosis', () => {
        it('calls dynamoDb', () => {
            mockHandler = new MockHandler();

            const params = {
                TableName: 'Patients',
                Key: {
                    'PatientId': {S: '2345'}
                }
            };

            let dynamodbmock = {
                getItem: () => {
                    return true;
                }
            };

            const spy = sinon.spy(dynamodbmock, 'getItem');

            alexaController = new AlexaController(mockHandler);
            alexaController._dynamodb = dynamodbmock;
            mockHandler.setAttributes('first_name', 'Kaleb');
            mockHandler.setAttributes('date_of_birth', 19890615);
            mockHandler.setAttributes('patient_id', '2345');

            alexaController.getLastDiagnosis();

            expect(spy.calledOnce).to.equal(true);
            expect(spy.calledWith(params)).to.equal(true);
        });
    });
});
