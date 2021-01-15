const assert = require('assert');
var util = require('../../../../src/iframe/js/library/apertureUtil');
describe('Util', function () {
    describe('getParamsAndTagsFromGeoJsonFeature()', function () {
        it('gets params and tags from the object passed to it', function () {
            assert.deepEqual(util.Util.getParamsAndTagsFromGeoJsonFeature({ properties: { tags: { man_made: "water_works", waterway: "dam" } } }), { params: ["man_made", "waterway"], tagsObj: { man_made: "water_works", waterway: "dam" } });
        });
    });
    describe('getLatLngFromGeoJsonFeature()', function () {
        it('gets latlng from the object passed to it', function () {
            assert.deepEqual(util.Util.getLatLngFromGeoJsonFeature({ geometry: { type: "none", coordinates: L.latLng(40, 90) } }), [0, 0]);
        });
    });

});