const assert = require('assert');
var getInfrastructure = require('../../../../src/iframe/js/library/renderInfrastructure');
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
            getInfrastructure.RenderInfrastructure.config(testMap, testMap, jsonData, { timeout: 15, queryAlertText: elem2, attributeData: jsonData, simplifyThreshold: 0.001 });
            getInfrastructure.RenderInfrastructure.preProcessData = streamflowData;
            assert.deepEqual(getInfrastructure.RenderInfrastructure.map, testMap);
            assert.deepEqual(getInfrastructure.RenderInfrastructure.options.timeout, 15);
        });
    });
    describe('update()', function () {
        it('should attempt to call the renderer for the current map bounds', function () {
            getInfrastructure.RenderInfrastructure.update();
            assert.deepEqual(getInfrastructure.RenderInfrastructure.currentQueries[0].bounds,
                {
                    north: 40.54654802898779,
                    east: -105.2263641357422,
                    south: 40.44211337197962,
                    west: -105.3636932373047
                }
            );
            getInfrastructure.RenderInfrastructure.currentQueries.forEach(element => {
                //element.query.abort();
            });
            currentQueries = [];
        });
    });
    describe('renderGeoJson()', function () {
        it('should render geojson onto map', function () {
            assert.deepEqual(getInfrastructure.RenderInfrastructure.renderGeoJson(sampleQuery).length, 19);
        });
    });
    describe('removeFeatureFromMap()', function () {
        it('should remove features from map', function () {
            let toRemove = 'dam';
            getInfrastructure.RenderInfrastructure.removeFeatureFromMap(toRemove);
            assert.deepEqual(getInfrastructure.RenderInfrastructure.blacklist.includes(toRemove), true);
            assert.deepEqual(Object.keys(getInfrastructure.RenderInfrastructure.map._layers).length, 21);
        });
    });
    describe('cleanupMap()', function () {
        it('should remove features outside the current viewport', function () {
            getInfrastructure.RenderInfrastructure.removeFeatureFromMap('dam');
            getInfrastructure.RenderInfrastructure.renderGeoJson(sampleQuery);
            testMap.setView(L.latLng(48.494351, -105.295029), 22);
            getInfrastructure.RenderInfrastructure.cleanupMap();
            assert.deepEqual(Object.keys(getInfrastructure.RenderInfrastructure.map._layers).length, 22);
        });
    });
    describe('getAttribute()', function () {
        it('gets attributes from a name', function () {
            getInfrastructure.RenderInfrastructure.config(testMap, testMap, jsonData, { overpassInterpreter: 'https://overpass.nchc.org.tw/api/interpreter' });
            //console.log(getInfrastructure.RenderInfrastructure.options.attributeData);
            assert.deepEqual(getInfrastructure.RenderInfrastructure.getAttribute("drinking_water", getInfrastructure.ATTRIBUTE.icon), "noicon");
            assert.deepEqual(getInfrastructure.RenderInfrastructure.getAttribute("reservoir", getInfrastructure.ATTRIBUTE.color), "#00FFFF");
            assert.deepEqual(getInfrastructure.RenderInfrastructure.getAttribute("dam", getInfrastructure.ATTRIBUTE.icon), new L.Icon({
                iconUrl: "../../../images/dam.png",
                iconSize: [25, 25]
            }));
            assert.deepEqual(getInfrastructure.RenderInfrastructure.getAttribute("reservoir", getInfrastructure.ATTRIBUTE.color), "#00FFFF");
        });
    });
    getInfrastructure.RenderInfrastructure.currentQueries.forEach(element => {
        element.query.abort();
    });
    describe('addFeatureToMap()', function () {
        it('should add feature to map', function () {
            getInfrastructure.RenderInfrastructure.currentQueries = [];
            getInfrastructure.RenderInfrastructure.removeFeatureFromMap('dam');
            getInfrastructure.RenderInfrastructure.currentQueries.push({ bounds: { n: 1, e: 1, s: 1, w: 1 }, query: { abort: function () { } } });
            getInfrastructure.RenderInfrastructure.queries = [];
            getInfrastructure.RenderInfrastructure.addFeatureToMap('dam');
            getInfrastructure.RenderInfrastructure.addFeatureToMap('water_tap');
            //console.log(getInfrastructure.RenderInfrastructure.currentQueries);
            assert.deepEqual(getInfrastructure.RenderInfrastructure.currentQueries[0].bounds, {
                east: -0,
                north: 0,
                south: 0,
                west: 0
            });
            assert.deepEqual(getInfrastructure.RenderInfrastructure.currentBounds, []);
        });
    });
    getInfrastructure.RenderInfrastructure.currentQueries.forEach(element => {
        element.query.abort();
    });
    describe('removeAllFeaturesFromMap()', function () {
        it('removes all features from map', function () {
            //getInfrastructure.RenderInfrastructure.renderGeoJson(sampleQuery);
            getInfrastructure.RenderInfrastructure.currentQueries = [{query:{cancel:function(){}}},{query:{abort:function(){}}}];
            getInfrastructure.RenderInfrastructure.removeAllFeaturesFromMap();
            assert.deepEqual(Object.keys(getInfrastructure.RenderInfrastructure.map._layers).length, 0);
        });
    });
});

describe('Util', function () {
    describe('getParamsAndTagsFromGeoJsonFeature()', function () {
        it('gets params and tags from the object passed to it', function () {
            assert.deepEqual(getInfrastructure.Util.getParamsAndTagsFromGeoJsonFeature({ properties: { tags: { man_made: "water_works", waterway: "dam" } } }), { params: ["man_made", "waterway"], tagsObj: { man_made: "water_works", waterway: "dam" } });
        });
    });
    describe('getLatLngFromGeoJsonFeature()', function () {
        it('gets latlng from the object passed to it', function () {
            assert.deepEqual(getInfrastructure.Util.getLatLngFromGeoJsonFeature({ geometry: { type: "none", coordinates: L.latLng(40, 90) } }), [0, 0]);
        });
    });
    describe('binaryToBool()', function () {
        it('converts 110 to true, true, false and such', function () {
            assert.deepEqual(getInfrastructure.Util.binaryToBool(111), { node: true, way: true, relation: true });
            assert.deepEqual(getInfrastructure.Util.binaryToBool(101), { node: true, way: false, relation: true });
        });
    });

});
