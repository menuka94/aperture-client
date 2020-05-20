const assert = require('assert');
var selectGenerator = require('../../../src/Iframe/Dependencies/selectGenerator');
global.Util = require('../../../src/Iframe/Dependencies/getInfrastructure.js').Util;
var jsdom = require('jsdom-global');
let jsonData = require("../../../src/Iframe/Dependencies/waterInfrastructure.json");
global.elem = document.createElement('div');
elem.id = 'area';
document.body.appendChild(elem);

function notAFunction(){}

describe('SelectGenerator', function () {
    describe('config()', function () {
        it('should configurate the select box', function () {
            selectGenerator.Generator.config(jsonData, null, true, notAFunction);
            assert.deepEqual(elem.innerHTML,'');
            selectGenerator.Generator.config(jsonData, elem, true, notAFunction);
            assert.deepEqual(elem.childElementCount,15);
        });
    });
});