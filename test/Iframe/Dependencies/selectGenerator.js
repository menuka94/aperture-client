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
            assert.deepEqual(elem.innerHTML,'<input type="checkbox" id="dam" onchange="notAFunction(this)" checked=""><label for="dam">Dam</label><br><input type="checkbox" id="water_tap" onchange="notAFunction(this)" checked=""><label for="water_tap">Water Tap</label><br><input type="checkbox" id="water_tower" onchange="notAFunction(this)" checked=""><label for="water_tower">Water Tower</label><br><input type="checkbox" id="water_well" onchange="notAFunction(this)" checked=""><label for="water_well">Water Well</label><br><input type="checkbox" id="water_works" onchange="notAFunction(this)" checked=""><label for="water_works">Water Works</label><br><input type="checkbox" id="wastewater_plant" onchange="notAFunction(this)" checked=""><label for="wastewater_plant">Wastewater Plant</label><br><input type="checkbox" id="reservoir" onchange="notAFunction(this)" checked=""><label for="reservoir">Reservoir</label><br><input type="checkbox" id="canal" onchange="notAFunction(this)" checked=""><label for="canal">Canal</label><br><input type="checkbox" id="river" onchange="notAFunction(this)" checked=""><label for="river">River</label><br><input type="checkbox" id="basin" onchange="notAFunction(this)" checked=""><label for="basin">Basin</label><br><input type="checkbox" id="stream" onchange="notAFunction(this)"><label for="stream">Stream</label><br><input type="checkbox" id="Natural_Gas_Pipeline" onchange="notAFunction(this)" checked=""><label for="Natural_Gas_Pipeline">Natural Gas Pipeline</label><br><input type="checkbox" id="lock_gate" onchange="notAFunction(this)" checked=""><label for="lock_gate">Lock Gate</label><br><input type="checkbox" id="weir" onchange="notAFunction(this)" checked=""><label for="weir">Weir</label><br><input type="checkbox" id="tidal_channel" onchange="notAFunction(this)" checked=""><label for="tidal_channel">Tidal Channel</label><br>');
        });
    });
});