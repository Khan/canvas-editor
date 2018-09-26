import "es5-shim";

import PJSTester from "../../output/pjs/pjs-tester.js";

// Mock out $._, since we don't use any of the sprintf functionality
var i18n = {};
i18n._ = function(str) { return str; };
// TODO(kevinb) remove when all challenge test code is updated to use i18n._
var $ = {};
$._ = i18n._;

var init = false;

var tester;

self.onmessage = function(event) {
    if (!init) {
        init = true;
        tester = new PJSTester();
    }

    tester.test(event.data.code, event.data.validate, event.data.errors,
        function(errors, testResults) {
            // Return the test results to the main code
            self.postMessage({
                 type: "test",
                 message: {
                    testResults: testResults,
                    errors: errors
                }
            });
        });
};
