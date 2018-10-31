var Geohash = {};
var points = [];
var bounds = {};
var delaunay = null;
var dataMax = Number.MIN_VALUE
var dataMin = Number.MAX_VALUE
var mymap = null
var polygonLayer = null
var polygonLayerGroup = null
var view = {lat: 39.839, lng: -104.990}
var zoomLevel = 10
Geohash.base32 = '0123456789bcdefghjkmnpqrstuvwxyz';

function decode_geohash(geohash) {

    var bounds = geohash_bounds(geohash); // <-- the hard work
    // now just determine the centre of the cell...

    var latMin = bounds.sw.lat, lonMin = bounds.sw.lon;
    var latMax = bounds.ne.lat, lonMax = bounds.ne.lon;

    // cell centre
    var lat = (latMin + latMax)/2;
    var lon = (lonMin + lonMax)/2;

    // round to close to centre without excessive precision: ⌊2-log10(Δ°)⌋ decimal places
    lat = lat.toFixed(Math.floor(2-Math.log(latMax-latMin)/Math.LN10));
    lon = lon.toFixed(Math.floor(2-Math.log(lonMax-lonMin)/Math.LN10));

    return { lat: Number(lat), lon: Number(lon) };
};

function geohash_bounds(geohash) {
    if (geohash.length === 0) throw new Error('Invalid geohash');

    geohash = geohash.toLowerCase();

    var evenBit = true;
    var latMin =  -90, latMax =  90;
    var lonMin = -180, lonMax = 180;

    for (var i=0; i<geohash.length; i++) {
        var chr = geohash.charAt(i);
        var idx = Geohash.base32.indexOf(chr);
        if (idx == -1) throw new Error('Invalid geohash');

        for (var n=4; n>=0; n--) {
            var bitN = idx >> n & 1;
            if (evenBit) {
                // longitude
                var lonMid = (lonMin+lonMax) / 2;
                if (bitN == 1) {
                    lonMin = lonMid;
                } else {
                    lonMax = lonMid;
                }
            } else {
                // latitude
                var latMid = (latMin+latMax) / 2;
                if (bitN == 1) {
                    latMin = latMid;
                } else {
                    latMax = latMid;
                }
            }
            evenBit = !evenBit;
        }
    }

    var bounds = {
        sw: { lat: latMin, lon: lonMin },
        ne: { lat: latMax, lon: lonMax },
    };

    return bounds;
};

mymap = L.map('mapid', {renderer: L.canvas(), minZoom: 4}).setView(view, zoomLevel);

var tiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    	maxZoom: 18,
    	id: 'mapbox.streets',
    	accessToken: 'pk.eyJ1Ijoia2V2aW5icnVod2lsZXIiLCJhIjoiY2ptdjBuMzRiMGNzeTNwbm9sYml5aWhvcyJ9.i6hZMqiVZgDiyDj5zcFcIA',
	maxBounds: [[],[]]
	}).addTo(mymap);

var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
	var data = JSON.parse(xhr.responseText);  
	dataMax = Number.MIN_VALUE
	dataMin = Number.MAX_VALUE
	points = [] 
	if (document.getElementById("geohash").value !== ""){
	    bounds = geohash_bounds(document.getElementById("geohash").value);
	    bounds["se"] = [bounds["sw"]["lat"], bounds["ne"]["lon"]]
	    bounds["nw"] = [bounds["ne"]["lat"], bounds["sw"]["lon"]]
	} else {
	    bounds["se"] = [-Number.MAX_VALUE, Number.MAX_VALUE]
	    bounds["nw"] = [Number.MAX_VALUE, -Number.MAX_VALUE]
	}
	for (var key in data) {
    	    if (data.hasOwnProperty(key)) {
		var features = data[key].split(",")
		var temperature = parseFloat(features[0]);
		var relativeHumidity = parseFloat(features[1]);
                var geohash = key;
		var center = decode_geohash(geohash);
		points.push([center["lat"], center["lon"], temperature])
		if (dataMax < temperature){
		    dataMax = temperature
		}
		if (dataMin > temperature){
		    dataMin = temperature
		}
	    }
	}
	if (polygonLayer == null){
	    polygonLayer = new L.voronoiLayer(points,
	        {dataMin: dataMin, dataMax: dataMax, bounds: bounds, minOpacity:0.4, map:mymap}).addTo(mymap);	
	} else {
	    polygonLayer.setLatLngs(points,
		{dataMin: dataMin, dataMax: dataMax, bounds: bounds, minOpacity:0.4, map:mymap})
	}
    }
}

function query(e) {
	xhr.open("POST", "http://localhost:5711/synopsis", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	var geohash = document.getElementById("geohash").value;
	var mintemp = document.getElementById("mintemp").value;
	var maxtemp = document.getElementById("maxtemp").value;
	var minhum = document.getElementById("minhum").value;
	var maxhum = document.getElementById("maxhum").value;
	xhr.send(geohash+","+mintemp+","+maxtemp+","+minhum+","+maxhum);
}

var geohash_element = document.getElementById("geohash");
var mintemp_element = document.getElementById("mintemp");
var maxtemp_element = document.getElementById("maxtemp");
var minhum_element = document.getElementById("minhum");
var maxhum_element = document.getElementById("maxhum");
geohash_element.oninput = query();
mintemp_element.oninput = query();
maxtemp_element.oninput = query();
minhum_element.oninput = query();
maxhum_element.oninput = query();


