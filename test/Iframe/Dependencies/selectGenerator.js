const assert = require('assert');
var selectGenerator = require('../../../src/Iframe/Dependencies/selectGenerator');
global.Util = require('../../../src/Iframe/Dependencies/getInfrastructure.js').Util;
var jsdom = require('jsdom-global');
let jsonData = require("../../../src/Iframe/Dependencies/waterInfrastructure.json");
global.elem = document.createElement('div');
elem.id = 'area';

function notAFunction() { }

describe('SelectGenerator', function () {
    describe('config()', function () {
        it('should configurate the select box', function () {
            selectGenerator.Generator.config(jsonData, null, true, notAFunction);
            assert.deepEqual(elem.innerHTML, '');
            selectGenerator.Generator.config(jsonData, elem, true, notAFunction);
            assert.deepEqual(elem.childElementCount, 11);
            document.body.appendChild(elem);
            var coll = document.getElementsByClassName("collapsible");
            for (let i = 0; i < coll.length; i++) {
                coll[i].click();
            }
        });
    });

    describe('clearChecks()', function () {
        it('should configurate the select box', function () {
            selectGenerator.Generator.clearChecks();
            var features = document.getElementsByClassName("featureCheck");
            let checked = false;
            for (let i = 0; i < features.length; i++) {
                if (features[i].checked) {
                    checked = true;
                }
            }
            assert.deepEqual(checked, false);
        });
    });
});