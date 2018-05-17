"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const intentController_1 = require("./intentController");
const ssml_helpers_1 = require("./ssml.helpers");
class AlexaController extends intentController_1.IntentController {
    constructor(handler) {
        super(handler);
        this._dynamodb = new aws_sdk_1.DynamoDB({ apiVersion: '2012-08-10' });
    }
    newSession() {
        this.handler.emit(':ask', 'Welcome to this recording app. I can help you by recording your voice. I am ready to start recording at any time. Just say record this followed by what ever you would like to record.');
    }
    record() {
        const request = this.handler.event.request;
        this.handler.attributes['recording'] = request.intent.slots.Query.value;
        const recording = this.handler.attributes['recording'];
        const speechOutput = `${ssml_helpers_1.pause} If you would like to record something else, just say record this followed by what ever you would like to record, or listen to what you recorded by asking: What did i just re-cord?`;
        this.handler.emit(':ask', `You recorded: ${recording} ${speechOutput}`, `Just say record this followed by what ever you would like to record, or listen to what you recorded by asking: What did i just re-cord?`);
    }
    previousRecord() {
        const record = this.handler.attributes['recording'];
        if (record === undefined) {
            this.handler.emit(':ask', `You have not recorded anything during this session. If you would like to record something, just say record this followed by what ever you would like to record.`, 'Just say record this followed by what ever you would like to record.');
        }
        else {
            this.handler.emit(':ask', `${ssml_helpers_1.interjection('all righty!')} You previously recorded the following: ${record} ${ssml_helpers_1.pause} If you would like to record something else, just say record this followed by what ever you would like to record.`);
        }
    }
    getName() {
        const request = this.handler.event.request;
        this.handler.attributes['patient_id'] = (request.intent.slots.PatientId.value);
        let params = {
            TableName: 'Patients',
            Key: {
                'PatientId': { S: this.handler.attributes['patient_id'] },
            },
        };
        this._dynamodb.getItem(params, function (err, data) {
            if (err) {
                this.handler.emit(':tell', 'There was an error inside the query.');
            }
            this.handler.attributes['first_name'] = data.Item.FirstName.S;
            this.handler.attributes['last_name'] = data.Item.LastName.S;
            this.handler.attributes['date_of_birth'] = data.Item.DateOfBirth.S;
            const firstName = this.handler.attributes['first_name'];
            const lastName = this.handler.attributes['last_name'];
            let speechOutput = `${ssml_helpers_1.pause} Please verify the patient by stating the paytients birthday like this, ${ssml_helpers_1.date(19910726)}`;
            this.handler.emit(':ask', `Starting session for patient: ${firstName} ${lastName} ${speechOutput}`, ``);
        });
    }
    getBirthday() {
        const request = this.handler.event.request;
        this.handler.attributes['patient_stated_dob'] = request.intent.slots.birthday.value;
        if (this.handler.attributes['first_name'] === undefined) {
            this.handler.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.', '');
        }
        else if (this.handler.attributes['patient_stated_dob'] !== this.handler.attributes['date_of_birth']) {
            this.handler.emit(':ask', 'The birthday that you gave does not match what is stated in the database. Please verify the birthday again or select a different patient.');
        }
        else {
            this.handler.emit(':ask', `We will now start entering information for ${this.handler.attributes['first_name']} ${ssml_helpers_1.pause} born on ${this.handler.attributes['date_of_birth']} ${ssml_helpers_1.pause}. Please give the systolic and diastolic measurements for ${this.handler.attributes['first_name']} ${ssml_helpers_1.pause} Please say the systolic measurement over the diastolic measurement.`, '');
        }
    }
    getBloodPressure() {
        const request = this.handler.event.request;
        let systolic = request.intent.slots.systolic.value;
        let diastolic = request.intent.slots.diastolic.value;
        if (this.handler.attributes['first_name'] === undefined && this.handler.attributes['date_of_birth'] === undefined) {
            this.handler.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
        }
        else if (this.handler.attributes['first_name'] !== undefined && this.handler.attributes['date_of_birth'] === undefined) {
            this.handler.emit(':ask', `You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, ${ssml_helpers_1.date(19910726)}`);
        }
        else {
            this.handler.emit(':ask', '' + this.handler.attributes['first_name'] + "'s blood pressure is " + systolic + ' over ' + diastolic, '');
        }
    }
}
exports.AlexaController = AlexaController;
//# sourceMappingURL=alexaController.js.map