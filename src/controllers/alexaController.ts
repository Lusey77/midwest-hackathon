import {Handler, IntentRequest, Request} from 'alexa-sdk';
import {DynamoDB} from 'aws-sdk';
import {IntentController} from './intentController';
import {date, interjection, pause} from './ssml.helpers';

export class AlexaController extends IntentController {
    private _dynamodb: DynamoDB;

    constructor(handler: Handler<Request>) {
        super(handler);
        this._dynamodb = new DynamoDB({apiVersion: '2012-08-10'});
    }

    newSession(): void {
        this.handler.emit(':ask', 'Welcome to the medical recording app scribe. I will assist you in recording and accessing the details of your patient. Please start by saying Patient ID: followed by the identification number of the patient.');
    }

    getName() {
        const request: IntentRequest = this.handler.event.request;

        this.handler.attributes['physician_id'] = (1928374650).toString();
        this.handler.attributes['patient_id'] = (request.intent.slots.PatientId.value);

        const params = {
            TableName: 'Patients',
            Key: {
                'PatientId': {S: this.handler.attributes['patient_id']},
            },
        };

        this._dynamodb.getItem(params, (err, data) => {
            if (err) {
                this.handler.emit(':ask', 'I did not find the patient in the database. Please state the patient id again by saying patient ID followed by the identification number of the patient.');
            }

            this.handler.attributes['first_name'] = data.Item.FirstName.S;
            this.handler.attributes['last_name'] = data.Item.LastName.S;
            this.handler.attributes['date_of_birth'] = data.Item.DateOfBirth.S;

            const firstName = this.handler.attributes['first_name'];
            const lastName = this.handler.attributes['last_name'];

            const speechOutput = `${pause} Please verify the patient by stating the paytients birthday like this, ${date(19890615)}`;

            this.handler.emit(':ask', `Starting session for patient: ${firstName} ${lastName} ${speechOutput}`, ``);
        });
    }

    getBirthday() {
        const request: IntentRequest = this.handler.event.request;

        this.handler.attributes['patient_stated_dob'] = request.intent.slots.birthday.value;

        if (this.handler.attributes['first_name'] === undefined) {
            this.handler.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.', '');
        } else if (this.handler.attributes['patient_stated_dob'] !== this.handler.attributes['date_of_birth']) {
            this.handler.emit(':ask', 'The birthday that you gave does not match what is stated in the database. Please verify the birthday again or select a different patient.');
        } else {
            this.handler.emit(':ask', `We will now start entering information for ${this.handler.attributes['first_name']} ${pause} born on ${this.handler.attributes['date_of_birth']} ${pause}. To record a note say take note, record note, or make note followed by the note that you would like to record.`, '');
        }
    }

    getBloodPressure() {
        const request: IntentRequest = this.handler.event.request;

        const systolic = request.intent.slots.systolic.value;
        const diastolic = request.intent.slots.diastolic.value;

        if (this.handler.attributes['first_name'] === undefined && this.handler.attributes['date_of_birth'] === undefined) {
            this.handler.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
        } else if (this.handler.attributes['first_name'] !== undefined && this.handler.attributes['date_of_birth'] === undefined) {
            this.handler.emit(':ask', `You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, ${date(19910726)}`);
        } else {
            this.handler.emit(':ask', `${this.handler.attributes['first_name']}'s blood pressure is ${systolic} over ${diastolic}`, '');
        }
    }

    takeNote() {
        const request: IntentRequest = this.handler.event.request;

        this.handler.attributes['current_date'] = new Date();

        if (this.handler.attributes['first_name'] === undefined && this.handler.attributes['date_of_birth'] === undefined) {
            this.handler.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
        } else if (this.handler.attributes['first_name'] !== undefined && this.handler.attributes['date_of_birth'] === undefined) {
            this.handler.emit(':ask', `You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, ${date(19910726)}`);
        } else {
            const noteToAdd = request.intent.slots.note.value;

            const date = this.handler.attributes['current_date'].toString().slice(0, -24);

            const notes = this.handler.attributes['all_db_info'].Note.L;

            const diagnosis = this.handler.attributes['all_db_info'].Diagnosis.L;

            const noteInput = [{
                M: {
                    'Date': {'S': date},
                    'PhysicianId': {'S': this.handler.attributes['physician_id']},
                    'NoteAdded': {'S': noteToAdd},
                }
            }];

            notes.push(noteInput[0]);

            const params = {
                TableName: 'Patients',
                Item: {
                    'PatientId': {S: this.handler.attributes['patient_id']},
                    'FirstName': {S: this.handler.attributes['first_name']},
                    'LastName': {S: this.handler.attributes['last_name']},
                    'DateOfBirth': {S: this.handler.attributes['date_of_birth']},
                    'Note': {L: notes},
                    'Diagnosis': {L: diagnosis}
                },
            };
            this._dynamodb.putItem(params, (err) => {
                if (err) {
                    // TODO: Emit event
                } else {
                    this.handler.emit(':ask', `You recorded ${noteToAdd} ${pause} The note was successfully recorded. To record another note say take note, record note, or make note followed by the note that you would like to record. If you would like to retrieve the last note that you recorded just say get last note`, '');
                }
            });
        }
    }

    getLastNote() {
        if ((this.handler.attributes['first_name'] === undefined) && (this.handler.attributes['date_of_birth'] === undefined)) {
            this.handler.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
        } else if ((this.handler.attributes['first_name'] !== undefined) && (this.handler.attributes['date_of_birth'] === undefined)) {
            this.handler.emit(':ask', `You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, ${date(19910726)}`);
        } else {
            const params = {
                TableName: 'Patients',
                Key: {
                    'PatientId': {S: this.handler.attributes['patient_id']},
                },
            };

            this._dynamodb.getItem(params, (err, data) => {
                if (err) {
                    this.handler.emit(':ask', 'I did not find the patient in the database. Please state the patient id again by saying patient ID followed by the identification number of the patient.');
                }

                this.handler.attributes['first_name'] = data.Item.FirstName.S;
                this.handler.attributes['last_name'] = data.Item.LastName.S;
                this.handler.attributes['last_note_info'] = data.Item.Note.L[data.Item.Note.L.length - 1];

                const firstName = this.handler.attributes['first_name'];
                const lastName = this.handler.attributes['last_name'];
                const speechOutput = `${pause} was ${this.handler.attributes['last_note_info'].M.NoteAdded.S} ${pause} on ${this.handler.attributes['last_note_info'].M.Date.S}`;

                this.handler.emit(':ask', `The last note added for ${firstName} ${lastName} ${speechOutput}`, '');

            });
        }
    }

    reRecordNote() {
        const request: IntentRequest = this.handler.event.request;

        this.handler.attributes['current_date'] = new Date();

        if ((this.handler.attributes['first_name'] === undefined) && (this.handler.attributes['date_of_birth'] === undefined)) {
            this.handler.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
        } else if ((this.handler.attributes['first_name'] !== undefined) && (this.handler.attributes['date_of_birth'] === undefined)) {
            this.handler.emit(':ask', `You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, ${date(19890726)}`);
        } else {
            const noteToAdd = request.intent.slots.query.value;

            const date = this.handler.attributes['current_date'].toString().slice(0, -24);

            const notes = this.handler.attributes['all_db_info'].Note.L;

            const diagnosis = this.handler.attributes['all_db_info'].Diagnosis.L;

            notes.pop();

            const noteInput = [{
                M: {
                    'Date': {'S': date},
                    'PhysicianId': {'S': this.handler.attributes['physician_id']},
                    'NoteAdded': {'S': noteToAdd},
                }
            }];

            notes.push(noteInput[0]);

            let params = {
                TableName: 'Patients',
                Item: {
                    'PatientId': {S: this.handler.attributes['patient_id']},
                    'FirstName': {S: this.handler.attributes['first_name']},
                    'LastName': {S: this.handler.attributes['last_name']},
                    'DateOfBirth': {S: this.handler.attributes['date_of_birth']},
                    'Note': {L: notes},
                    'Diagnosis': {L: diagnosis}
                },
            };

            this._dynamodb.putItem(params, (err) => {
                if (err) {

                } else {
                    this.handler.emit(':ask', `You re-recorded the note: ${noteToAdd} ${pause} The note was successfully recorded. To record another note say take note, record note, or make note followed by the note that you would like to record. To retrieve the last note or diagnosis that you recorded just say get last note or get last diagnosis. To record a note say record note.`, '');
                }

            });

        }
    }

    setDiagnosis() {
        const request: IntentRequest = this.handler.event.request;

        this.handler.attributes['current_date'] = new Date();

        if ((this.handler.attributes['first_name'] === undefined) && (this.handler.attributes['date_of_birth'] === undefined)) {
            this.handler.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
        } else if ((this.handler.attributes['first_name'] !== undefined) && (this.handler.attributes['date_of_birth'] === undefined)) {
            this.handler.emit(':ask', `You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, ${date(19890726)}`);
        } else {
            let diagnosisToAdd = request.intent.slots.diagnosis.value;

            let date = this.handler.attributes['current_date'].toString().slice(0, -24);

            let notes = this.handler.attributes['all_db_info'].Note.L;

            let diagnosisList = this.handler.attributes['all_db_info'].Diagnosis.L;

            let diagnosis =  [{M: {
                    'Date': {'S': date},
                    'PhysicianId': {'S': this.handler.attributes['physician_id']},
                    'Diagnosis': {'S': diagnosisToAdd},
                }
            }];

            diagnosisList.push(diagnosis[0]);

            let params = {
                TableName: 'Patients',
                Item:  {
                    'PatientId': {S: this.handler.attributes['patient_id']},
                    'FirstName': {S: this.handler.attributes['first_name']},
                    'LastName': {S: this.handler.attributes['last_name']},
                    'DateOfBirth': {S: this.handler.attributes['date_of_birth']},
                    'Note': {L: notes},
                    'Diagnosis': {L: diagnosisList}
                },
            };

            this._dynamodb.putItem(params, (err) => {
                if (err) {

                } else {
                    this.handler.emit(':ask', `The diagnosis recorded was ${diagnosisToAdd} ${pause} The diagnosis was successfully recorded. To retrieve the last note or diagnosis that you recorded just say get last note or get last diagnosis. To record a note say record note.`, '');
                }

            });

        }
    }

    getLastDiagnosis() {
        if (this.handler.attributes['first_name'] === undefined && this.handler.attributes['date_of_birth'] === undefined) {
            this.handler.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
        } else if (this.handler.attributes['first_name'] !== undefined && this.handler.attributes['date_of_birth'] === undefined) {
            this.handler.emit(':ask', `You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, ${date(19910726)}`);
        } else {
            const params = {
                TableName: 'Patients',
                Key: {
                    'PatientId' : {S: this.handler.attributes['patient_id']},
                },
            };

            this._dynamodb.getItem(params, (err, data) => {
                if (err) {
                    this.handler.emit(':ask', 'I did not find the patient in the database. Please state the patient id again by saying patient ID followed by the identification number of the patient.');
                }

                this.handler.attributes['first_name'] = data.Item.FirstName.S;
                this.handler.attributes['last_name'] = data.Item.LastName.S;
                this.handler.attributes['last_diagnosis_info'] = data.Item.Diagnosis.L[data.Item.Note.L.length - 1];

                const firstName = this.handler.attributes['first_name'];
                const lastName = this.handler.attributes['last_name'];
                const speechOutput = `${pause} was ${this.handler.attributes['last_diagnosis_info'].M.Diagnosis.S} ${pause} on ${this.handler.attributes['last_diagnosis_info'].M.Date.S}`;

                this.handler.emit(':ask', `The last diagnosis added for ${firstName} ${lastName} ${speechOutput}`, '');
            });
        }
    }
}