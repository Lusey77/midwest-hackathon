import * as bst from 'bespoken-tools';
import { expect } from 'chai';

describe('Alexa', function () {
    let server: bst.LambdaServer;
    let alexa: bst.BSTAlexa;

    beforeEach(function (done) {
        server = new bst.LambdaServer('./index.js', 10000, true);
        alexa = new bst.BSTAlexa('http://localhost:10000?disableSignatureCheck=true',
            './assets/intentSchema.json',
            './assets/sampleUtterances.txt',
            'Alexa-Scribe');
        server.start(function () {
            alexa.start(function (error) {
                if (error !== undefined) {
                    console.error('Error: ' + error);
                    done();
                } else {
                    done();
                }
            });
        });
    });

    afterEach(function (done) {
        alexa.stop(function () {
            server.stop(function () {
                done();
            });
        });
    });

    describe('LaunchIntent', function () {
        it('launches', function () {
            this.timeout(5000);
            alexa.launched(function (error, payload) {
                expect(payload.response.outputSpeech.ssml).to.exist;
                expect(payload.response.outputSpeech.ssml).to.contain('Welcome to the medical recording app scribe. I will assist you in recording and accessing the details of your patient. Please start by saying Patient ID: followed by the identification number of the patient.');
            });
        });
    });

    describe('After launch new session', () => {
        beforeEach(function (done) {
            alexa.launched(() => {
                done();
            });
        });

        describe('HelpIntent', function () {
            it('helps', function () {
                this.timeout(5000);
                alexa.spoken('help', function (error, payload) {
                    expect(payload.response.outputSpeech.ssml).to.exist;
                    expect(payload.response.outputSpeech.ssml).to.contain('Hey yo, I\'m sorry, but you don\'t get no help. Sucka!');
                });
            });
        });

        describe('CancelIntent', function () {
            it('cancels', function () {
                this.timeout(5000);
                alexa.spoken('cancel', function (error, payload) {
                    expect(payload.response.outputSpeech.ssml).to.exist;
                    expect(payload.response.outputSpeech.ssml).to.contain('All information has been stored. The application is ending.');
                });
            });
        });

        describe('StopIntent', function () {
            it('stops', function () {
                this.timeout(5000);
                alexa.spoken('stop', function (error, payload) {
                    expect(payload.response.outputSpeech.ssml).to.exist;
                    expect(payload.response.outputSpeech.ssml).to.contain('All information has been stored. Stopping now.');
                });
            });
        });


    });
});
