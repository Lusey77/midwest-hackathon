var Alexa = require('alexa-sdk');

exports.handler = function (event, context) {
    const handlers = {
        'NewSession': function () {
            this.emit(':ask', 'Welcome to this recording app. I can help you by recording your voice. I am ready to start recording at any time. Just say record this followed by what ever you would like to record.');
        },
        'Record': function () {
            let intent = this;
            this.attributes['recording'] = event.request.intent.slots.Query.value;
            let recording = this.attributes['recording'];
            console.log();
            var speechOutput = '<break time="0.3s"/> If you would like to record something eles, just say record this followed by what ever you would like to record, or listen to what you recorded by asking: What did i just record?';

            intent.emit(':ask','You recorded: '+ recording + speechOutput, 'Just say record this followed by what ever you would like to record, or listen to what you recorded by asking: What did i just re-cord?');
        },
        'PreviousRecord': function(){
            let intent = this;
            let record = this.attributes['recording'];
            if (record === undefined){
                intent.emit(':ask', 'You have not recorded anything during this session. If you would like to record something, just say record this followed by what ever you would like to record.', 'Just say record this followed by what ever you would like to record.');
            }else{
                var pause = '<break time="0.3s"/>';

                intent.emit(':ask', '<say-as interpret-as="interjection">all righty!</say-as> You previously recorded the following:' + record + pause + ' If you would like to record something eles, just say record this followed by what ever you would like to record.', 'Just say record this followed by what ever you would like to record.');
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
        }
    };

    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
