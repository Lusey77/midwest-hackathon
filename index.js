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
                intent.attributes['all_db_info'] = data.Item;
                console.log(intent.attributes['all_db_info']);

                let FirstName = intent.attributes['first_name'];
                let LastName = intent.attributes['last_name'];
                let DateOfBirth = intent.attributes['date_of_birth'];
                console.log("Patient Name: " + FirstName + '' + LastName);
                var speechOutput = '<break time="0.3s"/> Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19890615</say-as>';

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
                intent.emit(':ask', 'You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19890726</say-as>');
            }
            else{
                let note_to_add = event.request.intent.slots.note.value;
                const pause = '<break time="0.3s"/>';
                let date = intent.attributes['current_date'].toString().slice(0, -24);

                let notes = this.attributes['all_db_info'].Note.L;
                let diagnosis = this.attributes['all_db_info'].Diagnosis.L;


                let noteImput =  [{M: {
                    "Date": {"S": date},
                    "PhysicianId": {"S": intent.attributes['physician_id']},
                    "NoteAdded": {"S": note_to_add},
                    }
                }]
                notes.push(noteImput[0]);

                console.log(notes);

                var params = {
                    TableName: 'Patients',
                    Item:  {
                        "PatientId": {S: intent.attributes['patient_id']},
                        "FirstName": {S: intent.attributes['first_name']},
                        "LastName": {S: intent.attributes['last_name']},
                        "DateOfBirth": {S: intent.attributes['date_of_birth']},
                        "Note": {L: notes},
                        "Diagnosis": {L: diagnosis}
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
                        intent.emit(':ask', 'You recorded' + note_to_add + pause +'The note was successfully recorded. To record another note say take note, record note, or make note followed by the note that you would like to record. If you would like to retrieve the last note that you recorded just say get last note','')
                    }

                });

            }
        },
        "GetLastNote": function(){
            let intent = this;

            if ((this.attributes['first_name'] == undefined) && (this.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
            }
            else if ((this.attributes['first_name'] != undefined) && (this.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19910726</say-as>');
            }
            else{
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
                    intent.attributes['last_note_info'] = data.Item.Note.L[data.Item.Note.L.length-1]
                    const pause = '<break time="0.3s"/>';

                    let FirstName = intent.attributes['first_name'];
                    let LastName = intent.attributes['last_name'];
                    var speechOutput = '<break time="0.3s"/> was ' + intent.attributes['last_note_info'].M.NoteAdded.S + pause +" on " + intent.attributes['last_note_info'].M.Date.S;

                    intent.emit(':ask',"The last note added for "+ FirstName + ' ' + LastName + speechOutput, '');

                });
            }
        },
        'RerecordNote': function(){
            let intent = this;
            this.attributes['current_date'] = new Date();
            if ((this.attributes['first_name'] == undefined) && (this.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
            }
            else if ((this.attributes['first_name'] != undefined) && (this.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19890726</say-as>');
            }
            else{
                let note_to_add = event.request.intent.slots.query.value;
                const pause = '<break time="0.3s"/>';
                let date = intent.attributes['current_date'].toString().slice(0, -24);

                let notes = this.attributes['all_db_info'].Note.L;
                let diagnosis = this.attributes['all_db_info'].Diagnosis.L;
                notes.pop()

                let noteImput =  [{M: {
                    "Date": {"S": date},
                    "PhysicianId": {"S": intent.attributes['physician_id']},
                    "NoteAdded": {"S": note_to_add},
                    }
                }]
                notes.push(noteImput[0]);

                console.log(notes);

                var params = {
                    TableName: 'Patients',
                    Item:  {
                        "PatientId": {S: intent.attributes['patient_id']},
                        "FirstName": {S: intent.attributes['first_name']},
                        "LastName": {S: intent.attributes['last_name']},
                        "DateOfBirth": {S: intent.attributes['date_of_birth']},
                        "Note": {L: notes},
                        "Diagnosis": {L: diagnosis}
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
                        intent.emit(':ask', 'You re-recorded the note:' + note_to_add + pause +'The note was successfully recorded. To record another note say take note, record note, or make note followed by the note that you would like to record. To retrieve the last note or diagnosis that you recorded just say get last note or get last diagnosis. To record a note say record note.','')
                    }

                });

            }
        },
         'SetDiagnosis': function(){
            let intent = this;
            this.attributes['current_date'] = new Date();
            if ((this.attributes['first_name'] == undefined) && (this.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
            }
            else if ((this.attributes['first_name'] != undefined) && (this.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19890726</say-as>');
            }
            else{
                let diagnosis_to_add = event.request.intent.slots.diagnosis.value;
                const pause = '<break time="0.3s"/>';
                let date = intent.attributes['current_date'].toString().slice(0, -24);

                let notes = this.attributes['all_db_info'].Note.L;
                let diagnosisList = this.attributes['all_db_info'].Diagnosis.L;


                let diagnosis =  [{M: {
                    "Date": {"S": date},
                    "PhysicianId": {"S": intent.attributes['physician_id']},
                    "Diagnosis": {"S": diagnosis_to_add},
                    }
                }]
                diagnosisList.push(diagnosis[0]);

                console.log(diagnosisList);

                var params = {
                    TableName: 'Patients',
                    Item:  {
                        "PatientId": {S: intent.attributes['patient_id']},
                        "FirstName": {S: intent.attributes['first_name']},
                        "LastName": {S: intent.attributes['last_name']},
                        "DateOfBirth": {S: intent.attributes['date_of_birth']},
                        "Note": {L: notes},
                        "Diagnosis": {L: diagnosisList}
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
                        intent.emit(':ask', 'The diagnosis recorded was' + diagnosis_to_add + pause +'The diagnosis was successfully recorded. To retrieve the last note or diagnosis that you recorded just say get last note or get last diagnosis. To record a note say record note.','')
                    }

                });

            }
        },
        "GetLastDiagnosis": function(){
            let intent = this;

            if ((this.attributes['first_name'] == undefined) && (this.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.');
            }
            else if ((this.attributes['first_name'] != undefined) && (this.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19910726</say-as>');
            }
            else{
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
                    intent.attributes['last_diagnosis_info'] = data.Item.Diagnosis.L[data.Item.Note.L.length-1]
                    const pause = '<break time="0.3s"/>';

                    let FirstName = intent.attributes['first_name'];
                    let LastName = intent.attributes['last_name'];
                    var speechOutput = '<break time="0.3s"/> was ' + intent.attributes['last_diagnosis_info'].M.Diagnosis.S + pause +" on " + intent.attributes['last_diagnosis_info'].M.Date.S;

                    intent.emit(':ask',"The last diagnosis added for "+ FirstName + ' ' + LastName + speechOutput, '');

                });
            }
        },
        'AMAZON.HelpIntent': function () {
            this.emit(':tell', 'Hey yo, I\'m sorry, but you don\'t get no help. Sucka!');
        },
        'AMAZON.CancelIntent': function () {
            this.emit(':tell', 'All information has been stored. The application is ending.');
        },
        'AMAZON.StopIntent': function () {
            this.emit(':tell', 'All information has been stored. Stopping now.');
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
