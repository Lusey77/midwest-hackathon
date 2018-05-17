'use strict';

let Alexa = require('alexa-sdk');
let AWS = require('aws-sdk');

let dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler =  function (event, context) {
    const handlers = {
        'NewSession': function () {
            this.emit(':ask', 'Welcome to the medical recording app scribe. I will assist you in recording and accessing the details of your patient. Please start by saying Patient ID: followed by the identification number of the patient.');
            console.log("Session Starting");
        },
        'GetName': function () {
            let intent = this;
            this.attributes['physician_id'] = (1928374650).toString();
            this.attributes['patient_id'] = (event.request.intent.slots.PatientId.value).toString();
            let patient_id = this.attributes['patient_id'];
            console.log("patient_id: " + patient_id );

            var params = {
                TableName: 'Patients',
                Key: {
                    'PatientId' : {S: this.attributes['patient_id']},
                },
            };
            console.log("TableName: " + params.TableName);
            console.log("Key : " + params.Key.PatientId.S);

            dynamodb.getItem(params, function(err, data) {
                console.log("inside query");
                if (err){
                    console.log("error occured");
                    console.log(err, err.stack); // an error occurred
                    intent.emit(':ask', 'I did not find the patient in the database. Please state the patient id again by saying patient ID followed by the identification number of the patient.');
                }
                console.log(data);
                console.log('Query successful');           // successful response
                intent.attributes['first_name'] = data.Item.FirstName.S;
                console.log("Name was set correctly");
                intent.attributes['last_name'] = data.Item.LastName.S;
                intent.attributes['date_of_birth'] = data.Item.DateOfBirth.S;
                // this.attributes['all_db_info'] = data.Item;

                let FirstName = intent.attributes['first_name'];
                let LastName = intent.attributes['last_name'];
                let DateOfBirth = intent.attributes['date_of_birth'];
                console.log("Patient Name: " + FirstName + '' + LastName);
                var speechOutput = '<break time="0.3s"/> Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19910726</say-as>';

                intent.emit(':ask',"Starting session for patient : "+ FirstName + ' ' + LastName + speechOutput, '');

            });
        },
        'GetBirthday': function(){
            let intent = this;
            this.attributes['patient_stated_dob'] = event.request.intent.slots.birthday.value;
            console.log(this.attributes['patient_stated_dob']); //Has to be this in the database to work "1991-07-26"
            if (this.attributes['first_name'] == undefined){
                console.log('Patient name has not been set.');
                intent.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.', '');
            }else{
                const pause = '<break time="0.3s"/>';
                console.log("Getting patient's birthday.");
                if (this.attributes['patient_stated_dob'] != this.attributes['date_of_birth']){
                    intent.emit(':ask', 'The birthday that you gave does not match what is stated in the database. Please verify the birthday again or select a different patient.');
                }else{
                    intent.emit(':ask', 'We will now start entering information for' + this.attributes['first_name'] + pause + ' born on ' + this.attributes['date_of_birth'] + pause + '. to record a note say take note, record note, or make note followed by the note that you would like to record.', '');
                }
            }
        },
        'BloodPressure': function(){
            let intent = this;
            let systolic = event.request.intent.slots.systolic.value;
            let diastolic = event.request.intent.slots.diastolic.value;
            if ((this.attributes['first_name'] == undefined) && (this.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
            }
            else if ((this.attributes['first_name'] != undefined) && (this.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19910726</say-as>');
            }else{
                intent.emit(':ask', '' + this.attributes['first_name'] + "'s blood pressure is " + systolic + ' over ' + diastolic, '');
            }
        },
        'TakeNote': function(){
            let intent = this;
            this.attributes['current_date'] = new Date();
            if ((this.attributes['first_name'] == undefined) && (this.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
            }
            else if ((this.attributes['first_name'] != undefined) && (this.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19910726</say-as>');
            }
            else{
                let note_to_add = event.request.intent.slots.note.value;
                const pause = '<break time="0.3s"/>';
                let date = intent.attributes['current_date'].toString().slice(0, -24);
                var params = {
                    TableName: 'Patients',
                    Item:  {
                        "PatientId": {S: intent.attributes['patient_id']},
                        "FirstName": {S: intent.attributes['first_name']},
                        "LastName": {S: intent.attributes['last_name']},
                        "DateOfBirth": {S: intent.attributes['date_of_birth']},
                        "Note": {L: [
                            {M: {
                                "Date": {"S": intent.attributes['current_date'].toString()},
                                "PhysicianId": {"S": intent.attributes['physician_id']},
                                "NoteAdded": {"S": note_to_add},
                                }
                            }
                        ]}
                    },
                };

                dynamodb.putItem(params, function(err, data) {
                    console.log("Inside the query");
                    if (err){
                        console.log("error in put item");
                        console.log(err, err.stack); // an error occurred
                    }else{
                        console.log("successfully put items");
                        console.log(data);           // successful response
                        intent.emit(':ask', 'You recorded' + note_to_add + pause +'The note was successfully recorded. To record another note say take note, record note, or make note followed by the note that you would like to record.','')
                    }

                });

            }
        },
        'AMAZON.HelpIntent': function () {
            this.emit(':tell', 'Hey yo, I\'m sorry, but you don\'t get no help. Sucka!');
        },
        'AMAZON.CancelIntent': function () {
            this.emit(':tell', 'Cancelling ok');
        },
        'AMAZON.StopIntent': function () {
            this.emit(':tell', 'Stopping ok');
        },
        'Unhandled': function() {
            this.emit(':ask', 'I am sorry, but  do not know how to handle your request. If you would like to record, just say record this followed by what ever you would like to record.');
        },
    };

    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
            // this.attributes['nam'] = event.request.intent.slots.Query.value;
            // <say-as interpret-as="interjection">all righty!</say-as>
