'use strict';

L.TimeDimension.Layer.VoronoiLayer = L.TimeDimension.Layer.extend({

    initialize: function(latlngs, options) {
        var layer = new L.VoronoiLayer(latlngs, options);
	var me = this
	this._options = options
        L.TimeDimension.Layer.prototype.initialize.call(this, layer, options);
        this._currentLoadedTime = 0;
        this._currentTimeLatLngs = latlngs
	this._xhr = new XMLHttpRequest();
	this._canvases = {}
	this._queryTracker = []
	this._xhr.onreadystatechange = function() {
            if (this.readyState == XMLHttpRequest.DONE) {
	        me._data = JSON.parse(this.responseText);
	        me.updateMap();
		me.fire('timeload', {
            	    time: me._time
        	});
            }
        }
    },

    onAdd: function(map) {
	this._map = map
        L.TimeDimension.Layer.prototype.onAdd.call(this, map);
        map.addLayer(this._baseLayer);
        if (this._timeDimension) {
            this._getDataForTime(this._timeDimension.getCurrentTime());
        }

	var info = L.control();
        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update("<p><p/>");
            return this._div;
        };

	info.update = function (content) {
	    this._div.innerHTML = content
	};
	info.addTo(map);

	var precisionToDistance = {
                              5: 0.1,
			      4: 0.2,  
			      3: 0.7
                                  }
	var me = this
	//This listener updates info when the mouse is moved
	map.addEventListener('mousemove', function(ev) {
   	    var mouseLat = ev.latlng.lat;
   	    var mouseLng = ev.latlng.lng;
   	    var precision = document.getElementById("precision").value
   	    var mouseGeohash = encode_geohash(mouseLat,mouseLng,precision)
   	    var center = decode_geohash(mouseGeohash);
   	    var centerLatLng = [center["lat"], center["lon"]]
   	    me.location = null
   	    me.distance = Number.MAX_VALUE
   	    me.finalPoint = null
   	    for (var key in me._pointLocations){
		if(me._pointLocations.hasOwnProperty(key)){
		    var point = key.split(',').map(Number)
		    var new_distance = Math.hypot(point[0]-ev.latlng.lat, point[1]-ev.latlng.lng);
		    if (new_distance < me.distance){
			me.distance = new_distance
			me.location = me._pointLocations[key][0]
			me.finalPoint = point
		    }
		}
	    }	

	    if (me.distance < precisionToDistance[precision]) {
		var dataPoint = me._currentTimeLatLngs[me.location]
		var content = "<p>Geohash: "+encode_geohash(me.finalPoint[0],me.finalPoint[1],precision)+"<br/>"
		content += "Lattitude: "+me.finalPoint[0].toFixed(2)+"<br/>"
		content += "Longitude: "+me.finalPoint[1].toFixed(2)+"<br/>"
		for (var key in me._baseLayer.newOptions.features) {
		    if (me._baseLayer.newOptions.features.hasOwnProperty(key)) {
		        var keyData = key.split(',')
		        content += keyData[0]+": "+dataPoint[me._baseLayer.newOptions.features[key]].toFixed(2)+" "+keyData[1]+"<br/>"
		    }
		}
       		content += "</p>"
		info.update(content)
	    }
	});
	
	this.addEventListener('timeload', function(ev) {
	    var precision = document.getElementById("precision").value
	    if (me.distance < precisionToDistance[precision]) {
		var dataPoint = me._currentTimeLatLngs[me.location]
		var content = "<p>Geohash: "+encode_geohash(me.finalPoint[0],me.finalPoint[1],precision)+"<br/>"
		content += "Lattitude: "+me.finalPoint[0].toFixed(2)+"<br/>"
		content += "Longitude: "+me.finalPoint[1].toFixed(2)+"<br/>"
		for (var key in me._baseLayer.newOptions.features) {
		    if (me._baseLayer.newOptions.features.hasOwnProperty(key)) {
		        var keyData = key.split(',')
		        content += keyData[0]+": "+dataPoint[me._baseLayer.newOptions.features[key]].toFixed(2)+" "+keyData[1]+"<br/>"
		    }
		}
       		content += "</p>"
		info.update(content)
	    }
	});
    },

    updateMap: function(){
	this._currentTimeLatLngs = []
	this._pointLocations = {}
	var bounds = {}
	var mins = {}
	var maxes = {}
	var featureDict = {}
	maxes["temperature"] = -Number.MAX_VALUE
	mins["temperature"] = Number.MAX_VALUE
	maxes["humidity"] = -Number.MAX_VALUE
  	mins["humidity"] = Number.MAX_VALUE
	maxes["visibility"] = -Number.MAX_VALUE
 	mins["visibility"] = Number.MAX_VALUE
	maxes["precipitation"] = -Number.MAX_VALUE
	mins["precipitation"] = Number.MAX_VALUE
	if (document.getElementById("geohash").value !== ""){
	    bounds = geohash_bounds(document.getElementById("geohash").value);
            bounds["se"] = [bounds["sw"]["lat"], bounds["ne"]["lon"]]
            bounds["nw"] = [bounds["ne"]["lat"], bounds["sw"]["lon"]]
        } else {
	    //bounds["sw"] = [-Number.MAX_VALUE, Number.MAX_VALUE]
            //bounds["ne"] = [Number.MAX_VALUE, -Number.MAX_VALUE]
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
            featureDict["Surface Temperature,(K)"] = ix
            ix += 1
        }
        if (humCheck){
            featureDict["Relative Humidity,(%)"] = ix
            ix += 1
        }
        if (visCheck){
            featureDict["Surface Visibility,(m)"] = ix
            ix += 1
        }
        if (preCheck){
            featureDict["Precipitable Water,(mm)"] = ix
            ix += 1
        }

        var count = 0
        for (var key in this._data) {
            if (this._data.hasOwnProperty(key)) {
                var features = this._data[key].split(",")
                var geohash = key;
                var center = decode_geohash(geohash);
                var precision = document.getElementById("precision").value
                if (precision !== geohash.length){
                    geohash = encode_geohash(center["lat"], center["lon"], precision)
                    center = decode_geohash(geohash)
                }
	        var latLng = [center["lat"], center["lon"]]
	        var singlePoint = [center["lat"], center["lon"]]

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
                    maxes["humidity"] = Math.max(relativeHumidity, maxes["humidity"])
                    mins["humidity"] = Math.min(relativeHumidity, mins["humidity"])
                    singlePoint.push(relativeHumidity)
                    ix += 1
                }
                if (visCheck){
                    var visibility = parseFloat(features[ix]);
                    maxes["visibility"] = Math.max(visibility, maxes["visibility"])
                    mins["visibility"] = Math.min(visibility, mins["visibility"])
                    singlePoint.push(visibility)
                    ix += 1
                }
                if (preCheck){
                    var precipitation = parseFloat(features[ix]);
                    maxes["precipitation"] = Math.max(precipitation, maxes["precipitation"])
                    mins["precipitation"] = Math.min(precipitation, mins["precipitation"])
                    singlePoint.push(precipitation)
                    ix += 1
                }

	        if (this._pointLocations[latLng] !== undefined){
	       	    if (this._pointLocations[latLng].length === 1){
		        this._pointLocations[latLng].push(2)
		    } else {
                        this._pointLocations[latLng][1] += 1
	       	    }
		    var p = this._currentTimeLatLngs[this._pointLocations[latLng][0]]
		    var newP = [p[0],p[1]]
		    for(var i = 2; i < p.length; i++){
		        //Cumulative moving average
		        newP.push((p[i]+((this._pointLocations[latLng][1]-1)*singlePoint[i]))/this._pointLocations[latLng][1])
		    }
		    this._currentTimeLatLngs[this._pointLocations[latLng][0]] = newP
	        } else {
                    this._pointLocations[latLng] = [count]
                    count += 1
		    this._currentTimeLatLngs.push(singlePoint)
                }
            }
        }
	/*
        if (polygonLayer === null){
	    polygonLayer = L.timeDimension.layer.VoronoiLayer(points,
               	    {dataMin: mins, dataMax: maxes, features: featureDict, bounds: bounds, minOpacity:0.4, map:mymap});
	    polygonLayer.addTo(mymap)
        } else {
            polygonLayer.setLatLngs(points,
                {dataMin: mins, dataMax: maxes, features: featureDict, bounds: bounds, minOpacity:0.4, map:mymap})
        }
	*/
	this._baseLayer.setOptions({dataMin: mins, dataMax: maxes, features: featureDict, bounds: bounds, minOpacity:0.4, map:mymap})
	this._update()
	/*
	if (this._timeDimension && this._time == this._timeDimension.getCurrentTime() && !this._timeDimension.isLoading()) {
            this._update();
        }
	*/
    },


    _onNewTimeLoading: function(ev) {
        this.query(ev.time);
        return;
    },

    isReady: function(time) {
        return (this._currentLoadedTime == time);
    },

    _update: function() {
	//this._baseLayer.setLatLngs(this._currentTimeLatLngs, this._options);
	/*
	if(this._baseLayer._map !== undefined){
	    var currentQuery = this._queryTracker.shift()
	    var currentCanvas = this._canvases[currentQuery].getContext('2d')
	    delete this._canvases[currentQuery]
     
	    this._baseLayer.setOptions(this._options)
	    this._baseLayer.newCanvas(currentCanvas, this._options)
            return true;
	}
	*/
	
    },

    setLatLngs: function(latlngs, options) {
	this._baseLayer.setLatLngs(latlngs,options)
    },

    _getDataForTime: function(time) {
	this.query(time)
    },

    query: function(time) {
        this._xhr.open("POST", "http://lattice-213.cs.colostate.edu:5711/synopsis", true);
	this._xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	var geohash = document.getElementById("geohash").value;
	//var time = document.getElementById("time").value;
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
	var date = new Date(time);
	this._time = date.getTime()
	console.log(date)
	queryString += ","+date.getTime();

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
	console.log("Query: " + queryString)
	this._xhr.send(queryString);
	
	if(this._canvases[queryString] === undefined) {
	    var worker = new Worker("./src/voronoi-buffer.js")
	    this._canvases[queryString] = L.DomUtil.create('canvas', 'leaflet-voronoi-layer leaflet-layer ' + queryString)
	    var originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
            this._canvases[queryString].style[originProp] = '50% 50%';

            var size = this._map.getSize();
            this._canvases[queryString].width  = size.x;
            this._canvases[queryString].height = size.y;

	    this._queryTracker.push(queryString)
	    var offscreen = this._canvases[queryString].transferControlToOffscreen()
	    worker.postMessage({queryString: queryString, x: this._map.getSize().x, y: this._map.getSize().y,
			    geohash: document.getElementById("geohash").value, precision: document.getElementById("precision").value,
			    tempCheck: document.getElementById("tempCheck").checked, humCheck: document.getElementById("humCheck").checked,
			    visCheck: document.getElementById("visCheck").checked, preCheck: document.getElementById("preCheck").checked,
			    bounds: this._map.getBounds(), canvas: offscreen,
			    northWestBounds: this._map.getBounds().getNorthWest(), southEastBounds: this._map.getBounds().getSouthEast(),
			    zoom: this._map.getZoom()}, [offscreen]);
	    var me = this
	    worker.onmessage = function(e) {
		if (e.data.msg === 'render'){
		    me._baseLayer.setNextBits(me._canvases[queryString]/*e.data.bits*/)
		}
	    }
	}
    }

});

L.timeDimension.layer.VoronoiLayer = function(latlngs, options) {
    return new L.TimeDimension.Layer.VoronoiLayer(latlngs, options);
};
