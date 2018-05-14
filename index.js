var Alexa = require('alexa-sdk');
var AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = function (event, context) {
    const handlers = {
        'NewSession': function () {
            this.emit(':ask', 'Welcome to the medical recording app scribe. I will assist you in recording and accessing the details of your patient. Please start by saying Patient ID: followed by the identification number of the patient.');
        },
        'GetName': function () {
            let intent = this;
            this.attributes['patient_id'] = (event.request.intent.slots.patient_id.value).toString();
            let patient_id = this.attributes['patient_id'];
            const params = {
                    Key: {
                       "PatientId": {
                         S: patient_id
                        },
                    }, 
                    TableName: 'Patients',
                }
            let FirstName;
            let LastName;
            let DateOfBirth;
            dynamodb.getItem(params, function(err, data) {
                    console.log('inside query');
                    if(err){
                        console.log('err: ', err);
                        intent.emit(':tell', 'there was an error.');
                    }else{
                        console.log('data: ', data);
                        
                        if(!data.Item){
                            intent.emit(':tell', 'Could not find ' + patient_id);
                        }else{
                            // const FirstName = Date.parse(data.Item.AvailabilityDate.S);
                            // const currentDate = new Date();
                            this.attributes['first_name'] = data.Item.FirstName;
                            this.attributes['last_name'] = data.Item.LastName;
                            this.attributes['date_of_birth'] = data.Item.DateOfBirth;
                            }
                        }
                });
            
            FirstName = this.attributes['first_name'];
            LastName = this.attributes['last_name'];
            DateOfBirth = this.attributes['date_of_birth'];
            
            
            
            
            console.log("Patient Name: " + FirstName + LastName);
            var speechOutput = '<break time="0.3s"/> Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19910726</say-as>'; 
            
            intent.emit(':ask',"Starting session for patient : "+ FirstName + LastName + speechOutput, '');
        },
        'GetBirthday': function(){
            let intent = this;
            let name = this.attributes['first_name'];
            this.attributes['date_of_birth'] = event.request.intent.slots.birthday.value;
            let birthday = this.attributes['date_of_birth']
            if (name == undefined){
                intent.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.', '');
            }else{
                var pause = '<break time="0.3s"/>'; 

                intent.emit(':ask', 'We will now start entering information for' + this.attributes['name'] + pause + ' born on ' + birthday + pause + '. Please give the systolic and diastolic measurements for '+ this.attributes['name'] + pause + ' Please say the systolic measurement over the diastolic measurement', '');
            }
        },
        'BloodPressure': function(){
            let intent = this;
            let systolic = event.request.intent.slots.systolic.value;
            let diastolic = event.request.intent.slots.diastolic.value;
            if ((this.attributes['name'] == undefined) && (this.attributes['birthday'] == undefined)){
                intent.emit(':ask', 'You have not stated the name of the patient. Please start by saying Patient: followed by the name of the patient.')
            }
            else if ((this.attributes['name'] != undefined) && (this.attributes['birthday'] == undefined)){
                intent.emit(':ask', 'You have not stated the birthday of the patient. Please verify the patient by stating the paytients birthday like this, <say-as interpret-as="date">19910726</say-as>')
            }else{
                intent.emit('ask:', '' + this.attributes['name'] + "'s blood pressure is " + systolic + ' over ' + diastolic, '')
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