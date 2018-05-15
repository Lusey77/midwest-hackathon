"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bst = require("bespoken-tools");
const chai_1 = require("chai");
describe("Alexa", function () {
    let server;
    let alexa;
    beforeEach(function (done) {
        server = new bst.LambdaServer("./index.js", 10000, true);
        alexa = new bst.BSTAlexa("http://localhost:10000?disableSignatureCheck=true", "./speechAssets/IntentSchema.json", "./speechAssets/SampleUtterances.txt", "HelloWorld");
        server.start(function () {
            alexa.start(function (error) {
                if (error !== undefined) {
                    console.error("Error: " + error);
                    done();
                }
                else {
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
    describe("LaunchIntent", function () {
        it("launches", function () {
            this.timeout(5000);
            alexa.launched(function (error, payload) {
                chai_1.expect(payload.response.outputSpeech.ssml).to.exist;
                chai_1.expect(payload.response.outputSpeech.ssml).to.contain(""); // TODO: Figure out
            });
        });
    });
});
//# sourceMappingURL=index.ftest.js.map