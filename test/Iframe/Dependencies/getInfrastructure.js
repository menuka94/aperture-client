const assert = require('assert');
var getInfrastrucuture = require('../../../src/Iframe/Dependencies/getInfrastructure');

describe('makeBoundsString()', function() {
    it('should return a bounds string from a bounds object', function() {
        assert.deepEqual(getInfrastrucuture.makeBoundsString({north:60,south:61,east:30,west:31}), 61 + ',' + 31 + ',' + 60 + ',' + 30);
    });
});

describe('createQuery()', function() {
    it('should create an overpass query string from a list of queries and a bounds string', function() {
        assert.deepEqual(getInfrastrucuture.createQuery(["waterway=dam","waterway=river"],"61,31,60,30"),"node[waterway=dam](61,31,60,30);way[waterway=dam](61,31,60,30);relation[waterway=dam](61,31,60,30);node[waterway=river](61,31,60,30);way[waterway=river](61,31,60,30);relation[waterway=river](61,31,60,30);");
    });
});

describe('withinBounds', function() {
    it('should return true if input bounds are within global object "currentBounds," should return false if null or not within', function() {
        assert.deepEqual(getInfrastrucuture.withinBounds({north:60,south:61,east:30,west:31}),false); //null case
        getInfrastrucuture.currentBounds = {north:59,south:62,east:29,west:32};
        assert.deepEqual(getInfrastrucuture.withinBounds({north:60,south:61,east:30,west:31}),true); //within case case
        getInfrastrucuture.currentBounds = {north:61,south:60,east:31,west:30};
        assert.deepEqual(getInfrastrucuture.withinBounds({north:60,south:61,east:30,west:31}),false); //not within case case
    });
});
/*
queryDefault: queryDefault,
cleanUpQueries: cleanUpQueries,
drawObjectsToMap: drawObjectsToMap,
cleanupCurrentMap: cleanupCurrentMap,
parseIconNameFromContext: parseIconNameFromContext,
parseDetailsFromContext: parseDetailsFromContext,
getParamsAndTags: getParamsAndTags,
underScoreToSpace: underScoreToSpace,
capitalizeString: capitalizeString,
addIconToMap: addIconToMap,
getAttribute: getAttribute
*/