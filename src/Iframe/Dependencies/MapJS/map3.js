const MAPNUMBER = 3;

var buildingmap = new L.Map('map3');
buildingmap.setView(buildingmap.wrapLatLng(parent.view), 10, false);
console.log(buildingmap.getCenter())

var sidebar = L.control.sidebar('sidebar', {
    position: 'right'
}).addTo(buildingmap);

new L.TileLayer('https://api.mapbox.com/styles/v1/osmbuildings/cjt9gq35s09051fo7urho3m0f/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYnVpbGRpbmdzIiwiYSI6IjNldU0tNDAifQ.c5EU_3V8b87xO24tuWil0w', {
    attribution: '© Map tiles <a href="https://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    maxNativeZoom: 20
}).addTo(buildingmap);

var osmb = new OSMBuildings(buildingmap).load('https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');

const censusViz = census_visualizer();
censusViz.updateViz(buildingmap);

var markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: false,
    disableClusteringAtZoom: 17,
    maxClusterRadius: 55
});
buildingmap.addLayer(markers);

$.getJSON("Dependencies/demographicsAndRisk.json", function (data) {
    RenderInfrastructure.config(buildingmap, markers, data, {
        queryAlertText: document.getElementById('queryInfoText'),
        overpassInterpreter: 'http://lattice-136.cs.colostate.edu:4096/api/interpreter',
        maxElements: 10000,
        maxLayers: 20,
        simplifyThreshold: 0.00005
    });
    Generator.config(data, document.getElementById("checkboxLocation"), true, changeChecked, "checkbox", true);
    runQuery();
});

const g = { groupMem: "Census", query: 1 };
const census = {
    "Total Population": g, "Avg. Household Income": g,
    "Population by Age": g, "Median Age": g, "No. Below Poverty Line": g, "Demographics": g
}

function changeChecked(element) {
    if (element.checked) {
        if (element.id in census) {
            censusViz.setFeature(element.id);
            censusViz.updateViz(buildingmap);
        } else {
            RenderInfrastructure.addFeatureToMap(element.id);
        }
    }
    else {
        if (element.id in census)
            censusViz.setFeature(element.id);
        else
            RenderInfrastructure.removeFeatureFromMap(element.id);
    }
}

function runQuery() {
    RenderInfrastructure.update();
}


Generator.config(census, document.getElementById("checkboxLocation"), true, changeChecked, "radio", true);

//updates controller----------------------------------------------
buildingmap.on("move", function () {
    parent.setGlobalPosition(buildingmap.getCenter(), MAPNUMBER);
});
buildingmap.on("zoomend", function () {
    parent.setGlobalPositionFORCE(buildingmap.getCenter(), MAPNUMBER);
});
buildingmap.on("moveend", function () {
    censusViz.updateViz(buildingmap);
});
//----------------------------------------------------------------

var thisMapsSetter = function (view, zoom) {
    buildingmap.setView(buildingmap.wrapLatLng(view), buildingmap.getZoom());
    censusViz.updateViz(buildingmap);
}
parent.setterFunctions.push({
    setterFunc: thisMapsSetter,
    mapNum: MAPNUMBER
});