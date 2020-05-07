const assert = require('assert');
var getInfrastructure = require('../../../src/Iframe/Dependencies/getInfrastructure');
var jsdom = require('jsdom-global');
const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');
global.$ = require('jquery');
global.L = require('leaflet');
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

const elem2 = document.createElement('div');
document.body.appendChild(elem2);

const testMap = L.map('testMap', {
    renderer: L.canvas(), minZoom: 3,
    fullscreenControl: true
}).setView(L.latLng(40.494351, -105.295029), 13);


testMap.setSize(800, 800);

testMap.refreshClusters = function () { };




describe('RenderInfrastructure', function () {
    describe('config()', function () {
        it('should configurate the renderer', function () {
            getInfrastructure.RenderInfrastructure(null).config(testMap, testMap, { timeout: 15, queryAlertText: elem2 });
            assert.deepEqual(getInfrastructure.RenderInfrastructure(null).map, testMap);
            assert.deepEqual(getInfrastructure.RenderInfrastructure(null).options.timeout, 15);
            assert.deepEqual(getInfrastructure.RenderInfrastructure(null).options.minRenderZoom, 10);
        });
    });
    describe('update()', function () {
        it('should attempt to call the renderer for the current map bounds', function () {
            getInfrastructure.RenderInfrastructure(null).update([{ query: "waterway=dam" }]);
            assert.deepEqual(getInfrastructure.RenderInfrastructure(null).currentQueries[0].bounds,
                {
                    north: 40.54654802898779,
                    east: -105.2263641357422,
                    south: 40.44211337197962,
                    west: -105.3636932373047
                }
            );
        });
    });
    describe('renderGeoJson()', function () {
        it('should render geojson onto map', function () {
            // testMap.setView(setView(L.latLng(40.494351, -105.295029), 13));
            // getInfrastructure.RenderInfrastructure(null).currentQueries = [];
            // getInfrastructure.RenderInfrastructure(null).currentBounds = [];
            // getInfrastructure.RenderInfrastructure(null).update([{ query: "waterway=dam" }]);

            // assert.deepEqual(getInfrastructure.RenderInfrastructure(null).currentQueries[0].bounds,
               
            // );
        });
    });
});

/*
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

describe('withinCurrentBounds()', function() {
    it('should return true if input bounds are within global object "currentBounds," should return false if null or not within', function() {
        assert.deepEqual(getInfrastructure.withinCurrentBounds({north:59,south:62,east:29,west:32}),true); //within case
        assert.deepEqual(getInfrastructure.withinCurrentBounds({north:61,south:60,east:31,west:30}),false); //not within case
    });
});

describe('withinBounds()', function() {
    it('should return true if the first input bounds are within the seconds input bounds should return false if null or not within', function() {
        assert.deepEqual(getInfrastructure.withinBounds({north:59,south:62,east:29,west:32},{north:60,south:61,east:30,west:31}),true); //within case
        assert.deepEqual(getInfrastructure.withinBounds({north:61,south:60,east:31,west:30},{north:60,south:61,east:30,west:31}),false); //not within case
    });
});

describe('queryDefault()', function() {
    it('should return a url to kami systems', function() {
        getInfrastructure.currentBounds([]);
        assert.deepEqual(getInfrastructure.queryDefault([{query:"waterway=dam"},{query:"waterway=river"}],{north:60,south:59,east:31,west:30})[0].query,"https://overpass.kumi.systems/api/interpreter?data=[out:json][timeout:30];(node[waterway=dam](59,30,60,31);way[waterway=dam](59,30,60,31);relation[waterway=dam](59,30,60,31);node[waterway=river](59,30,60,31);way[waterway=river](59,30,60,31);relation[waterway=river](59,30,60,31););out body geom;");
        getInfrastructure.currentBounds([{north:55,south:45,east:70,west:30}]);
        getInfrastructure.currentQueries([{bounds:{north:62,south:58,east:42,west:38}}]);
        assert.deepEqual(getInfrastructure.queryDefault([{query:"waterway=dam"}],{north:60,south:40,east:60,west:40})[0].bounds,{north:45,south:40,east:60,west:40});
        assert.deepEqual(getInfrastructure.queryDefault([{query:"waterway=dam"}],{north:60,south:40,east:60,west:40})[1].bounds,{north:60,south:55,east:60,west:42});
        assert.deepEqual(getInfrastructure.queryDefault([{query:"waterway=dam"}],{north:60,south:40,east:60,west:40})[2].bounds,{north:58,south:55,east:42,west:40});

    });
});

describe('queryNaturalGas()', function() {
    it('should return a url to arcgis', function() {
        assert.deepEqual(getInfrastructure.queryNaturalGas({north:60,south:61,east:30,west:31}),'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Natural_Gas_Liquid_Pipelines/FeatureServer/0/query?where=1%3D1&outFields=*&geometry=31%2C61%2C30%2C60&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson');
    });
});

describe('cleanUpQueries()', function() {
    it('should edit the list of queries if they shouldnt render anymore', function() {
        getInfrastructure.currentQueries([{bounds:{north:61,south:60,east:31,west:30},query:{abort:function(){}}}]);
        testMap.fitBounds(L.latLngBounds(L.latLng(60,30),L.latLng(59,31)));
        getInfrastructure.cleanUpQueries();
        assert.deepEqual(getInfrastructure.currentQueries(null).length,0);
    });
});

describe('queryNeedsCancelling()', function() {
    it('checks if a query shouldnt render anymore', function() {
        testMap.fitBounds(L.latLngBounds(L.latLng(60,30),L.latLng(61,31)));
        assert.deepEqual(getInfrastructure.queryNeedsCancelling({bounds:{north:61,south:60,east:31,west:30},query:{abort:function(){}}}),false); //false case
        testMap.fitBounds(L.latLngBounds(L.latLng(60,30),L.latLng(59,31)));
        assert.deepEqual(getInfrastructure.queryNeedsCancelling({bounds:{north:61,south:60,east:31,west:30},query:{abort:function(){}}}),true); //true case
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
    it('changed first letter of every word to capital, except for 1 char words', function() {
        assert.deepEqual(getInfrastructure.capitalizeString("this is a test"),"This Is a Test");
    });
});

describe('getAttribute()', function() {
    it('gets attributes from a name', function() {
        assert.deepEqual(getInfrastructure.getAttribute("drinking_water",getInfrastructure.ATTRIBUTE.icon),new L.Icon({
            iconUrl: "../../../images/drinking_fountain.png",
            iconSize: [25, 25]
        }));
        assert.deepEqual(getInfrastructure.getAttribute("reservoir",getInfrastructure.ATTRIBUTE.color),"#00FFFF");
    });
});

describe('pointIsWithinBounds()', function() {
    it('return true if a point is with bounds', function() {
        assert.deepEqual(getInfrastructure.pointIsWithinBounds(L.latLng(0,0),{north:1,south:-1,east:1,west:-1}),true);
        assert.deepEqual(getInfrastructure.pointIsWithinBounds(L.latLng(-2,-2),{north:1,south:-1,east:1,west:-1}),false);
    });
});

describe('expandBoundsX2()', function() {
    it('return return a bounds obj that is 6x bigger than the one passed in', function() {
        assert.deepEqual(getInfrastructure.expandBoundsX2({north:60,south:58,east:60,west:58}),{north:62,south:56,east:62,west:56});
    });
});

describe('removeFromBlacklist()', function() {
    it('removes tag from blacklist', function() {
        assert.deepEqual(getInfrastructure.removeFromBlacklist("weir"),false);
        getInfrastructure.blacklist(["weir"]);
        assert.deepEqual(getInfrastructure.removeFromBlacklist("weir"),true);
    });
});

describe('latLngFromFeature()', function() {
    it('gets lat and lng from a feature', function() {
        assert.deepEqual(getInfrastructure.latLngFromFeature({geometry:{type:"none", coordinates:L.latLng(40,90)}}),-1);
    });
});

describe('subBounds()', function() {
    it('subtracts one rect from another, returning a set of new rects', function() {
        assert.deepEqual(getInfrastructure.subBounds({north:60,south:40,east:60,west:40},{north:55,south:45,east:55,west:45}),[{north:60,south:40,east:45,west:40},{north:60,south:40,east:60,west:55},{north:45,south:40,east:55,west:45},{north:60,south:55,east:55,west:45}]); //case all (boundSlicer in within boundsToSlice, returns 4 rects)
        assert.deepEqual(getInfrastructure.subBounds({north:60,south:40,east:60,west:40},{north:55,south:45,east:70,west:30}),[{north:45,south:40,east:60,west:40},{north:60,south:55,east:60,west:40}]); //case 'hamburger' (it looks like a hamburger!, 2 rects above and below 1, wider rect)
        assert.deepEqual(getInfrastructure.subBounds({north:60,south:40,east:60,west:40},{north:45,south:30,east:45,west:30}),[{north:60,south:40,east:60,west:45},{north:60,south:45,east:45,west:40}]); //case corner (slicer hits corner of boundsToSlice, returns 2 rects)
        assert.deepEqual(getInfrastructure.subBounds({north:60,south:40,east:60,west:40},{north:45,south:40,east:55,west:45}),[{north:60,south:40,east:45,west:40},{north:60,south:40,east:60,west:55},{north:60,south:45,east:55,west:45}]); //case 'helmet' (slicer hits bottom of boundsToSlice, creating 3 rects)
        assert.deepEqual(getInfrastructure.subBounds({north:60,south:40,east:60,west:40},{north:70,south:30,east:45,west:30}),[{north:60,south:40,east:60,west:45}]); //case side (slicer cuts side off boundsToSlice)
        assert.deepEqual(getInfrastructure.subBounds({north:60,south:40,east:60,west:40},{north:39,south:38,east:60,west:40}),[{north:60,south:40,east:60,west:40}]); //outside of case
        assert.deepEqual(getInfrastructure.subBounds({north:60,south:40,east:60,west:40},{north:61,south:39,east:61,west:39}),[]); //within case case
    });
});

describe('optimizeBounds()', function() {
    it('concatinates a list of rects where necessary', function() {
        assert.deepEqual(getInfrastructure.optimizeBounds([
            {
                north:60,
                south:40,
                east:60,
                west:40
            },
            {
                north:60,
                south:40,
                east:80,
                west:60
            },
            {
                north:80,
                south:40,
                east:40,
                west:20
            }
        ],0),[
            {
                north:80,
                south:40,
                east:40,
                west:20
            },
            {
                north:60,
                south:40,
                east:80,
                west:40
            }
        ]);
        assert.deepEqual(getInfrastructure.optimizeBounds([
            {
                north:60,
                south:39,
                east:60,
                west:40
            },
            {
                north:61,
                south:40,
                east:80,
                west:60
            },
            {
                north:80,
                south:40,
                east:40,
                west:20
            }
        ],2),[
            {
                north:80,
                south:40,
                east:40,
                west:20
            },
            {
                north:60,
                south:40,
                east:80,
                west:40
            }
        ]);
        assert.deepEqual(getInfrastructure.optimizeBounds([ //5 to 1 optimization!
            {
                north:60,
                south:40,
                east:60,
                west:40
            },
            {
                north:80,
                south:60,
                east:60,
                west:40
            },
            {
                north:40,
                south:20,
                east:60,
                west:40
            },
            {
                north:80,
                south:20,
                east:40,
                west:20
            },
            {
                north:80,
                south:20,
                east:80,
                west:60
            }
        ],1),[
            {
                north:80,
                south:20,
                east:80,
                west:20
            }
        ]);
        assert.deepEqual(getInfrastructure.optimizeBounds([
            {
                north:60,
                south:40,
                east:40.5,
                west:40
            }
        ],1),[]);
    });
});

describe('concatBounds()', function() {
    it('concatinates two rects', function() {
        assert.deepEqual(getInfrastructure.concatBounds({north:60,south:40,east:60,west:40},{north:55,south:45,east:65,west:35},getInfrastructure.NSEW.ns),{north:55,south:45,east:65,west:35});
        assert.deepEqual(getInfrastructure.concatBounds({north:60,south:40,east:60,west:40},{north:55,south:45,east:65,west:35},getInfrastructure.NSEW.ew),{north:60,south:40,east:60,west:40});
    });
});

describe('boundListSubstitution()', function() {
    it('removes a bound from a list of bounds', function() {
        assert.deepEqual(getInfrastructure.boundListSubstitution({north:55,south:45,east:55,west:45},[{north:60,south:40,east:60,west:40}]),[{north:60,south:40,east:45,west:40},{north:60,south:40,east:60,west:55},{north:45,south:40,east:55,west:45},{north:60,south:55,east:55,west:45}]);
    });
});
*/
/*
cleanupCurrentMap: cleanupCurrentMap,
addIconToMap: addIconToMap,
*/