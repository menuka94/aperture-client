const assert = require('assert');
var getInfrastructure = require('../../../src/Iframe/Dependencies/getInfrastructure');
global.L = require('leaflet');

describe('makeBoundsString()', function() {
    it('should return a bounds string from a bounds object', function() {
        assert.deepEqual(getInfrastructure.makeBoundsString({north:60,south:61,east:30,west:31}), 61 + ',' + 31 + ',' + 60 + ',' + 30);
    });
});

describe('createQuery()', function() {
    it('should create an overpass query string from a list of queries and a bounds string', function() {
        assert.deepEqual(getInfrastructure.createQuery([{query:"waterway=dam"},{query:"waterway=river"}],"61,31,60,30"),"node[waterway=dam](61,31,60,30);way[waterway=dam](61,31,60,30);relation[waterway=dam](61,31,60,30);node[waterway=river](61,31,60,30);way[waterway=river](61,31,60,30);relation[waterway=river](61,31,60,30);");
    });
});

describe('withinBounds()', function() {
    it('should return true if input bounds are within global object "currentBounds," should return false if null or not within', function() {
        assert.deepEqual(getInfrastructure.withinBounds({north:60,south:61,east:30,west:31}),false); //null case
        getInfrastructure.currentBounds({north:60,south:61,east:30,west:31});
        assert.deepEqual(getInfrastructure.withinBounds({north:59,south:62,east:29,west:32}),true); //within case
        assert.deepEqual(getInfrastructure.withinBounds({north:61,south:60,east:31,west:30}),false); //not within case
    });
});

describe('queryDefault()', function() {
    it('should return a url to kami systems', function() {
        assert.deepEqual(getInfrastructure.queryDefault([{query:"waterway=dam"},{query:"waterway=river"}],"61,31,60,30"),"https://overpass.kumi.systems/api/interpreter?data=[out:json][timeout:30];(node[waterway=dam](61,31,60,30);way[waterway=dam](61,31,60,30);relation[waterway=dam](61,31,60,30);node[waterway=river](61,31,60,30);way[waterway=river](61,31,60,30);relation[waterway=river](61,31,60,30););out body geom;"); 
    });
});

describe('cleanUpQueries()', function() {
    it('should edit the list of queries if they shouldnt render anymore', function() {
        getInfrastructure.currentQueries([{bounds:{north:61,south:60,east:31,west:30},query:{abort:function(){}}}]);
        getInfrastructure.cleanUpQueries({north:59,south:60,east:31,west:30});
        assert.deepEqual(getInfrastructure.currentQueries(null).length,0);
    });
});

describe('queryNeedsCancelling()', function() {
    it('checks if a query shouldnt render anymore', function() {
        assert.deepEqual(getInfrastructure.queryNeedsCancelling({bounds:{north:61,south:60,east:31,west:30},query:{abort:function(){}}},{north:61,south:60,east:31,west:30}),false); //false case
        assert.deepEqual(getInfrastructure.queryNeedsCancelling({bounds:{north:61,south:60,east:31,west:30},query:{abort:function(){}}},{north:59,south:60,east:31,west:30}),true); //true case
    });
});

describe('parseIconNameFromContext()', function() {
    it('gets the name of an object from the object passed to it', function() {
        assert.deepEqual(getInfrastructure.parseIconNameFromContext({properties:{tags:{man_made:"water_works",waterway:"dam"}}}),"dam");
        assert.deepEqual(getInfrastructure.parseIconNameFromContext({properties:{tags:{yes:"no"}}}),"none");
    });
});

describe('parseDetailsFromContext()', function() {
    it('gets the details of an object from the object passed to it', function() {
        assert.deepEqual(getInfrastructure.parseDetailsFromContext({properties:{tags:{man_made:"water_works",waterway:"dam"}}},"dam"),"<b>Dam</b><br><ul style='padding-inline-start:20px;margin-block-start:2.5px;'><li>Man Made: Water Works</li><li>Waterway: Dam</li></ul>");
        assert.deepEqual(getInfrastructure.parseDetailsFromContext({properties:{tags:{yes:"no"}}},"none"),"<b>None</b><br><ul style='padding-inline-start:20px;margin-block-start:2.5px;'><li>Yes: No</li></ul>");
    });
});

describe('getParamsAndTags()', function() {
    it('gets params and tags from the object passed to it', function() {
        assert.deepEqual(getInfrastructure.getParamsAndTags({properties:{tags:{man_made:"water_works",waterway:"dam"}}}),{params:["man_made","waterway"],tagsObj:{man_made:"water_works",waterway:"dam"}});
    });
});

describe('underScoreToSpace()', function() {
    it('does a change from "_" to " "', function() {
        assert.deepEqual(getInfrastructure.underScoreToSpace("this_is_a_test"),"this is a test");
    });
});

describe('capitalizeString()', function() {
    it('changed first letter of every word to capital', function() {
        assert.deepEqual(getInfrastructure.capitalizeString("this is a test"),"This Is A Test");
    });
});

describe('getAttribute()', function() {
    it('gets attributes from a name', function() {
        assert.deepEqual(getInfrastructure.getAttribute("drinking_water",getInfrastructure.ATTRIBUTE.icon),new L.Icon({
            iconUrl: "../../../images/drinking_fountain.png",
            iconSize: [25, 25]
        }));
    });
});



/*
drawObjectsToMap: drawObjectsToMap,
cleanupCurrentMap: cleanupCurrentMap,
addIconToMap: addIconToMap,
getAttribute: getAttribute
*/