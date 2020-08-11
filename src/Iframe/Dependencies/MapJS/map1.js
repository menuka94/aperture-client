const MAPNUMBER = 1; //refers to whatever map in the grid this refers to

const mymap = L.map('map1', {renderer: L.canvas(), minZoom: 3,
    fullscreenControl: true,
    timeDimension: true,
    inertia: false,
    timeDimensionOptions: {
            timeInterval: "2015-01-02T06:00:00Z/2015-01-31T18:00:00Z",
            transitionTime: 10,
            period: "PT6H",
            currentTime: new Date("2015-01-01T00:00:00Z")},
    }
);

mymap.on("load", function () {
    //when loading is done
});

mymap.setView(mymap.wrapLatLng(window.parent.view), window.parent.zoomLevel);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 8,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoia2V2aW5icnVod2lsZXIiLCJhIjoiY2ptdjBuMzRiMGNzeTNwbm9sYml5aWhvcyJ9.i6hZMqiVZgDiyDj5zcFcIA',
    maxBounds: [[],[]]
}).addTo(mymap);

td = L.timeDimension.layer.CustomTimeDimension({}, sketch_visualizer({
    0.0: [0, 0, 255],
    0.5: [0, 255, 0],
    1.0: [255, 0, 0]
}));

L.Control.TimeDimensionCustom = L.Control.TimeDimension.extend({
    _getDisplayDateFormat: function(date){
        return moment.utc(date).format('HH:mm - MM/DD/YYYY (UTC)');
    }
});

const timeDimensionControl = new L.Control.TimeDimensionCustom({
    autoPlay: false,
    maxSpeed: .5,
});

mymap.addControl(timeDimensionControl);
td.addControlReference(timeDimensionControl);
td.addTo(mymap);

mymap.on("move", function () {
    parent.setGlobalPosition(mymap.getCenter(),MAPNUMBER);
});
mymap.on("zoomend", function () {
    parent.setGlobalPositionFORCE(mymap.getCenter(),MAPNUMBER);
});

var thisMapsSetter = function(view,zoom){
    mymap.setView(mymap.wrapLatLng(view), mymap.getZoom());
}
parent.setterFunctions.push({
    setterFunc: thisMapsSetter,
    mapNum: MAPNUMBER
});