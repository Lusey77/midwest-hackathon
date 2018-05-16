'use strict';

let Alexa = require('alexa-sdk');
let AWS = require('aws-sdk');

// AWS.config.update({
//   region: "us-east-1"
// });

//I'v gotta ask scott for help tomorrow. I'm sorry.
let dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler =  function (event, context) {
    const handlers = {
        'NewSession': function () {
            this.emit(':ask', 'Welcome to the medical recording app scribe. I will assist you in recording and accessing the details of your patient. Please start by saying Patient ID: followed by the identification number of the patient.');
            console.log("Session Starting");
        },
        'GetName': function () {
            let intent = this;
            intent.attributes['patient_id'] = (event.request.intent.slots.PatientId.value);
            let patient_id = intent.attributes['patient_id'];
            console.log("patient_id: " + patient_id );

            var params = {
                TableName: 'Patients',
                Key: {
                    'PatientId' : {S: intent.attributes['patient_id']},
                },
            };
            console.log("TableName: " + params.TableName);
            console.log("Key : " + params.Key.PatientId.S);

            dynamodb.getItem(params, function(err, data) {
                console.log("inside query");
                if (err){
                    console.log("error occured")
                    console.log(err, err.stack); // an error occurred
                    intent.emit(':tell', 'There was an error inside the query.')
                }
                console.log('Query successful');           // successful response

                intent.attributes['first_name'] = data.Item.FirstName.S;
                intent.attributes['last_name'] = data.Item.LastName.S;
                intent.attributes['date_of_birth'] = data.Item.DateOfBirth.S;

            const FirstName = intent.attributes['first_name'];
            const LastName = intent.attributes['last_name'];
            const DateOfBirth = intent.attributes['date_of_birth'];

            console.log("Patient Name: " + FirstName + '' + LastName);
            var speechOutput = '<break time="0.3s"/> Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19910726</say-as>';

            intent.emit(':ask',"Starting session for patient : "+ FirstName + ' ' + LastName + speechOutput, '');
            });
        },
        'GetBirthday': function(){
            let intent = this;
            intent.attributes['patient_stated_dob'] = event.request.intent.slots.birthday.value;
            console.log(intent.attributes['patient_stated_dob']); //Has to be this in the database to work "1991-07-26"
            if (intent.attributes['first_name'] == undefined){
                console.log('Patient name has not been set.');
                intent.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.', '');
            }else{
                const pause = '<break time="0.3s"/>';
                console.log("Getting patient's birthday.")
                if (intent.attributes['patient_stated_dob'] != intent.attributes['date_of_birth']){
                    intent.emit(':ask', 'The birthday that you gave does not match what is stated in the database. Please verify the birthday again or select a different patient.');
                }else{
                    intent.emit(':ask', 'We will now start entering information for' + intent.attributes['first_name'] + pause + ' born on ' + intent.attributes['date_of_birth'] + pause + '. Please give the systolic and diastolic measurements for '+ intent.attributes['first_name'] + pause + ' Please say the systolic measurement over the diastolic measurement', '');
                }
            }
        },
        'BloodPressure': function(){
            let intent = this;
            let systolic = event.request.intent.slots.systolic.value;
            let diastolic = event.request.intent.slots.diastolic.value;
            if ((intent.attributes['first_name'] == undefined) && (intent.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.')
            }
            else if ((intent.attributes['first_name'] != undefined) && (intent.attributes['date_of_birth'] == undefined)){
                intent.emit(':ask', 'You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19910726</say-as>')
            }else{
                intent.emit(':ask', '' + intent.attributes['first_name'] + "'s blood pressure is " + systolic + ' over ' + diastolic, '')
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
