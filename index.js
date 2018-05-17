// dotenv brings in the environment variables from the .env file and
// adds them to process.env
require("dotenv").config();

var handler = require("./dist").default; // the generated module
var bst = require('bespoken-tools');

// Export the handler for the lambda, wrapping the call in Logless to
// capture all the requests and responses
exports.handler = bst.Logless.capture("d849ab1c-85c1-459a-af4c-1e4da77124ba", handler);