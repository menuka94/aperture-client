const assert = require('assert');
var renderInfrastructure = require('../../../../src/iframe/js/library/renderInfrastructure');
var jsdom = require('jsdom-global');
const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');
global.$ = require('jquery');
global.L = require('leaflet');
global.simplify = require('../../../../src/iframe/js/third-party/simplify.js');

L.Map.prototype.setSize = function (width, height) {
    this._size = new L.Point(width, height);
    this._resetView(this.getCenter(), this.getZoom());
    return this;
};
window.HTMLCanvasElement.prototype.getContext = function (a) {
    return ctx;
}
global.osmtogeojson = require('osmtogeojson');
const elem = document.createElement('div');
elem.style.cssText = 'width: "100%", height: "800px" ';
elem.id = 'testMap';
document.body.appendChild(elem);

let jsonData = require("../infrastructure.json");
let sampleQuery = require("./sampleRes.json");

const elem2 = document.createElement('div');
document.body.appendChild(elem2);

const testMap = L.map('testMap', {
    renderer: L.canvas(), minZoom: 3,
    fullscreenControl: true
}).setView(L.latLng(40.494351, -105.295029), 13);

testMap.setSize(800, 800);

testMap.refreshClusters = function () { };
testMap.removeLayers = function (layers) {
    layers.forEach(element => {
        testMap.removeLayer(element);
    });
};

global.grpc_querier = function(){
    let onner = {
        on: function(a,b){}
    }
    return {
        getOSMData: function(a,b){return onner;},
        getDatasetData: function(a,b){return onner;}
    };
}


describe('RenderInfrastructure', function () {
    describe('config()', function () {
        it('should configurate the renderer', function () {
            renderInfrastructure.RenderInfrastructure.config(testMap, testMap, jsonData, { timeout: 15, queryAlertText: elem2, attributeData: jsonData, simplifyThreshold: 0.001 });
            assert.deepEqual(renderInfrastructure.RenderInfrastructure.map, testMap);
            assert.deepEqual(renderInfrastructure.RenderInfrastructure.options.timeout, 15);
        });
    });
    describe('renderGeoJson()', function () {
        it('should render geojson onto map', function () {
            assert.deepEqual(renderInfrastructure.RenderInfrastructure.renderGeoJson(sampleQuery).length, 24);
        });
    });
    describe('getAttribute()', function () {
        it('gets attributes from a name', function () {
            renderInfrastructure.RenderInfrastructure.config(testMap, testMap, jsonData, {  });
            //console.log(renderInfrastructure.RenderInfrastructure.options.attributeData);
            assert.deepEqual(renderInfrastructure.RenderInfrastructure.getAttribute("drinking_water", renderInfrastructure.ATTRIBUTE.icon), "noicon");
            assert.deepEqual(renderInfrastructure.RenderInfrastructure.getAttribute("reservoir", renderInfrastructure.ATTRIBUTE.color), "#00FFFF");
            assert.deepEqual(renderInfrastructure.RenderInfrastructure.getAttribute("dam", renderInfrastructure.ATTRIBUTE.icon), new L.Icon({
                iconUrl: "../../../images/dam.png",
                iconSize: [25, 25]
            }));
            assert.deepEqual(renderInfrastructure.RenderInfrastructure.getAttribute("reservoir", renderInfrastructure.ATTRIBUTE.color), "#00FFFF");
        });
    });
});

