var Geohash = {};
var points = [];
var pointLocations = {}
var bounds = {};
var mins = {}
var maxes = {}
var featureDict = {}
var delaunay = null;
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

function encode_geohash(lat, lon, precision) {
    // infer precision?
    if (typeof precision == 'undefined') {
        // refine geohash until it matches precision of supplied lat/lon
        for (var p=1; p<=12; p++) {
            var hash = Geohash.encode(lat, lon, p);
            var posn = Geohash.decode(hash);
            if (posn.lat==lat && posn.lon==lon) return hash;
        }
        precision = 12; // set to maximum
    }

    lat = Number(lat);
    lon = Number(lon);
    precision = Number(precision);

    if (isNaN(lat) || isNaN(lon) || isNaN(precision)) throw new Error('Invalid geohash');

    var idx = 0; // index into base32 map
    var bit = 0; // each char holds 5 bits
    var evenBit = true;
    var geohash = '';

    var latMin =  -90, latMax =  90;
    var lonMin = -180, lonMax = 180;

    while (geohash.length < precision) {
        if (evenBit) {
            // bisect E-W longitude
            var lonMid = (lonMin + lonMax) / 2;
            if (lon >= lonMid) {
                idx = idx*2 + 1;
                lonMin = lonMid;
            } else {
                idx = idx*2;
                lonMax = lonMid;
            }
        } else {
            // bisect N-S latitude
            var latMid = (latMin + latMax) / 2;
            if (lat >= latMid) {
                idx = idx*2 + 1;
                latMin = latMid;
            } else {
                idx = idx*2;
                latMax = latMid;
            }
        }
        evenBit = !evenBit;

        if (++bit == 5) {
            // 5 bits gives us a character: append it and start over
            geohash += Geohash.base32.charAt(idx);
            bit = 0;
            idx = 0;
        }
    }

    return geohash;
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

L.timeDimension.layer.VoronoiLayer = function(points, options) {
    return new L.TimeDimension.Layer.VoronoiLayer(points, options);
};

mymap = L.map('mapid', {renderer: L.canvas(), minZoom: 4, timeDimension: true, timeDimensionControl: true}).setView(view, zoomLevel);

var tiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    	maxZoom: 18,
    	id: 'mapbox.streets',
    	accessToken: 'pk.eyJ1Ijoia2V2aW5icnVod2lsZXIiLCJhIjoiY2ptdjBuMzRiMGNzeTNwbm9sYml5aWhvcyJ9.i6hZMqiVZgDiyDj5zcFcIA',
	maxBounds: [[],[]]
	}).addTo(mymap);

polygonLayer = L.timeDimension.layer.VoronoiLayer(points,
               	{dataMin: mins, dataMax: maxes, features: featureDict, bounds: bounds, minOpacity:0.4, map:mymap});
polygonLayer.addTo(mymap);

L.Control.TimeDimensionCustom = L.Control.TimeDimension.extend({
    _getDisplayDateFormat: function(date){
        return date.format("mmmm yyyy");
    }
});
var timeDimensionControl = new L.Control.TimeDimensionCustom({
    playerOptions: {
        buffer: 1,
        minBufferReady: -1
    }
});
mymap.addControl(this.timeDimensionControl);

/*
polygonLayer = new L.voronoiLayer(points,
               	{dataMin: mins, dataMax: maxes, features: featureDict, bounds: bounds, minOpacity:0.4, map:mymap}).addTo(mymap)

var td = L.timeDimension.layer(polygonLayer)
td.addTo(mymap);
var tdControl = L.control.timeDimension()
tdControl.addTo(mymap);
//var tdPlayer = new L.TimeDimension.Player({}, L.timeDimension)
//tdPlayer.addTo(mymap);
*/

mymap.addEventListener('mousemove', function(ev) {
   var mouseLat = ev.latlng.lat;
   var mouseLng = ev.latlng.lng;
   var mouseGeohash = encode_geohash(mouseLat,mouseLng,5)
   var center = decode_geohash(mouseGeohash);
   var centerLatLng = [center["lat"], center["lon"]]
   if (pointLocations[centerLatLng] !== undefined){
	var data = points[pointLocations[centerLatLng]]
   }
});


var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
	var data = JSON.parse(xhr.responseText);
	maxes["temperature"] = Number.MIN_VALUE
	mins["temperature"] = Number.MAX_VALUE
	maxes["humidity"] = Number.MIN_VALUE
	mins["humidity"] = Number.MAX_VALUE
	maxes["visibility"] = Number.MIN_VALUE
	mins["visibility"] = Number.MAX_VALUE
	maxes["precipitation"] = Number.MIN_VALUE
	mins["precipitation"] = Number.MAX_VALUE
	points = []
        pointLocations = {}
	if (document.getElementById("geohash").value !== ""){
	    bounds = geohash_bounds(document.getElementById("geohash").value);
	    bounds["se"] = [bounds["sw"]["lat"], bounds["ne"]["lon"]]
	    bounds["nw"] = [bounds["ne"]["lat"], bounds["sw"]["lon"]]
	} else {
	    bounds["se"] = [-Number.MAX_VALUE, Number.MAX_VALUE]
	    bounds["nw"] = [Number.MAX_VALUE, -Number.MAX_VALUE]
	}
	var tempCheck = document.getElementById("tempCheck").checked
	var humCheck = document.getElementById("humCheck").checked
	var visCheck = document.getElementById("visCheck").checked
	var preCheck = document.getElementById("preCheck").checked
	featureDict = {}

	var ix = 2
	if (tempCheck){
	    featureDict["temp"] = ix
	    ix += 1
	}
	if (humCheck){
	    featureDict["hum"] = ix
	    ix += 1
	}
	if (visCheck){
	    featureDict["vis"] = ix
	    ix += 1
	}
	if (preCheck){
	    featureDict["pre"] = ix
	    ix += 1
	}
	count = 0
	for (var key in data) {
    	    if (data.hasOwnProperty(key)) {
		var features = data[key].split(",")
	        var geohash = key;
		var center = decode_geohash(geohash);
		var singlePoint = [center["lat"], center["lon"]]
		pointLocations[singlePoint] = count
		count += 1

		var ix = 0
		if (tempCheck){
		    var temperature = parseFloat(features[ix]);
		    maxes["temperature"] = Math.max(temperature, maxes["temperature"])
		    mins["temperature"] = Math.min(temperature, mins["temperature"])
		    singlePoint.push(temperature)
		    ix += 1
		}
		if (humCheck){
		    var relativeHumidity = parseFloat(features[ix]);
                    //featureDict["hum"] = humCheck
		    maxes["humidity"] = Math.max(relativeHumidity, maxes["humidity"])
		    mins["humidity"] = Math.min(relativeHumidity, mins["humidity"])
		    singlePoint.push(relativeHumidity)
		    ix += 1
		}
		if (visCheck){
		    var visibility = parseFloat(features[ix]);
                    //featureDict["vis"] = visCheck
		    maxes["visibility"] = Math.max(visibility, maxes["visibility"])
		    mins["visibility"] = Math.min(visibility, mins["visibility"])
		    singlePoint.push(visibility)
		    ix += 1
		}
		if (preCheck){
		    var precipitation = parseFloat(features[ix]);
                    //featureDict["pre"] = preCheck
		    maxes["precipitation"] = Math.max(precipitation, maxes["precipitation"])
		    mins["precipitation"] = Math.min(precipitation, mins["precipitation"])
		    singlePoint.push(precipitation)
		    ix += 1
		}

		points.push(singlePoint)
	    }
	}
	if (polygonLayer == null){
	    polygonLayer = new L.voronoiLayer(points,
	        {dataMin: mins, dataMax: maxes, features: featureDict, bounds: bounds, minOpacity:0.4, map:mymap}).addTo(mymap)
	} else {
	    polygonLayer.setLatLngs(points,
		{dataMin: mins, dataMax: maxes, features: featureDict, bounds: bounds, minOpacity:0.4, map:mymap})
	}
    }
}

function query(e) {
	xhr.open("POST", "http://lattice-213.cs.colostate.edu:5711/synopsis", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	var geohash = document.getElementById("geohash").value;
	var mintemp = document.getElementById("mintemp").value;
	var maxtemp = document.getElementById("maxtemp").value;
	var minhum = document.getElementById("minhum").value;
	var maxhum = document.getElementById("maxhum").value;
	var minvis = document.getElementById("minvis").value;
	var maxvis = document.getElementById("maxvis").value;
	var minpre = document.getElementById("minpre").value;
	var maxpre = document.getElementById("maxpre").value;
	var tempCheck = document.getElementById("tempCheck").checked
	var humCheck = document.getElementById("humCheck").checked
	var visCheck = document.getElementById("visCheck").checked
	var preCheck = document.getElementById("preCheck").checked
	var queryString = geohash
	if (tempCheck){
	    queryString += ",temperature_surface:"+mintemp+":"+maxtemp
	}
	if (humCheck){
	    queryString += ",relative_humidity_zerodegc_isotherm:"+minhum+":"+maxhum
	}
	if(visCheck){
	    queryString += ",visibility_surface:"+minvis+":"+maxvis
	}
	if(preCheck){
	    queryString += ",precipitable_water_entire_atmosphere:"+minpre+":"+maxpre
	}
	console.log(queryString)
	xhr.send(queryString);
}

/*
var geohash_element = document.getElementById("geohash");
var mintemp_element = document.getElementById("mintemp");
var maxtemp_element = document.getElementById("maxtemp");
var minhum_element = document.getElementById("minhum");
var maxhum_element = document.getElementById("maxhum");
var minvis_element = document.getElementById("minvis");
var maxvis_element = document.getElementById("maxvis");
var minpre_element = document.getElementById("minpre");
var maxpre_element = document.getElementById("maxpre");
var tempCheck_element = document.getElementById("tempCheck");
var humCheck_element = document.getElementById("humCheck");
var visCheck_element = document.getElementById("visCheck");
var preCheck_element = document.getElementById("preCheck");
geohash_element.oninput = query;
mintemp_element.oninput = query;
maxtemp_element.oninput = query;
minhum_element.oninput = query;
maxhum_element.oninput = query;
minvis_element.oninput = query;
maxvis_element.oninput = query;
minpre_element.oninput = query;
maxpre_element.oninput = query;
tempCheck_element.addEventListener('change', query);
humCheck_element.addEventListener('change', query);
visCheck_element.addEventListener('change', query);
preCheck_element.addEventListener('change', query);
*/
var query_button = document.getElementById("update");
query_button.onclick = query;
query()

