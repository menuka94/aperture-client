var Geohash = {};
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
            var hash = encode_geohash(lat, lon, p);
            var posn = decode_geohash(hash);
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


function LatLngBounds(corner1, corner2) { // (LatLng, LatLng) or (LatLng[])
	this._southWest = corner1
	this._northEast = corner2
}


function LatLng(lat, lng) {
	if (isNaN(lat) || isNaN(lng)) {
		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
	}

	// @property lat: Number
	// Latitude in degrees
	this.lat = +lat;

	// @property lng: Number
	// Longitude in degrees
	this.lng = +lng;
}

LatLng.prototype = {
};

LatLngBounds.prototype = {
	pad: function (bufferRatio) {
		var sw = this._southWest,
		    ne = this._northEast,
		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

		return new LatLngBounds(
		        new LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
		        new LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
	},

	// @method getCenter(): LatLng
	// Returns the center point of the bounds.
	getCenter: function () {
		return new LatLng(
		        (this._southWest.lat + this._northEast.lat) / 2,
		        (this._southWest.lng + this._northEast.lng) / 2);
	},

	// @method getSouthWest(): LatLng
	// Returns the south-west point of the bounds.
	getSouthWest: function () {
		return this._southWest;
	},

	// @method getNorthEast(): LatLng
	// Returns the north-east point of the bounds.
	getNorthEast: function () {
		return this._northEast;
	},

	// @method getNorthWest(): LatLng
	// Returns the north-west point of the bounds.
	getNorthWest: function () {
		return new LatLng(this.getNorth(), this.getWest());
	},

	// @method getSouthEast(): LatLng
	// Returns the south-east point of the bounds.
	getSouthEast: function () {
		return new LatLng(this.getSouth(), this.getEast());
	},

	// @alternative
	// @method contains (latlng: LatLng): Boolean
	// Returns `true` if the rectangle contains the given point.
	contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2, ne2;

		if (obj instanceof LatLngBounds) {
			sw2 = obj.getSouthWest();
			ne2 = obj.getNorthEast();
		} else {
			sw2 = ne2 = obj;
		}

		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
	}
};

function Point(x, y, round) {
	// @property x: Number; The `x` coordinate of the point
	this.x = (round ? Math.round(x) : x);
	// @property y: Number; The `y` coordinate of the point
	this.y = (round ? Math.round(y) : y);
}
Point.prototype = {
};

var R = 6378137
var R_MINOR = 6356752.314245179

function project(latlng) {
    var d = Math.PI / 180,
	r = this.R,
	y = latlng.lat * d,
	tmp = this.R_MINOR / r,
	e = Math.sqrt(1 - tmp * tmp),
	con = e * Math.sin(y);

    var ts = Math.tan(Math.PI / 4 - y / 2) / Math.pow((1 - con) / (1 + con), e / 2);
    y = -r * Math.log(Math.max(ts, 1E-10));

    return new Point(latlng.lng * d * r, y);
}

function scale(zoom) {
    return 256 * Math.pow(2, zoom);
}

function transform(point, scale) {
    scale = scale || 1;
    point.x = scale * (this._a * point.x + this._b);
    point.y = scale * (this._c * point.y + this._d);
    return point;
}

function latLngToPoint(latlng, zoom) {
    var projectedPoint = project(latlng)
    var scale = this.scale(zoom);
    return transform(projectedPoint, scale);
}

function pad(bufferRatio, sw, ne) {
    var heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio
    var widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

    return [new Point(sw.lat - heightBuffer, sw.lng - widthBuffer),
	    new Point(ne.lat + heightBuffer, ne.lng + widthBuffer)];
}

class VoronoiBuffer {
    constructor(queryString, x, y, geohash, precision, tempCheck, humCheck, preCheck, visCheck, bounds, canvas, northWest, southEast, zoom) {
    	this._xhr = new XMLHttpRequest();
	this._xhr.open("POST", "http://lattice-213.cs.colostate.edu:5711/synopsis", true);
	this._xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	this._xhr.send(queryString)
	importScripts("simple-voronoi.js")
	importScripts("d3-delaunay.js")
	this._canvas = canvas
	//this._canvas = new OffscreenCanvas(canvas.width, canvas.height)
	this._voronoi = simplevoronoi(this._canvas)
	this._geohash = geohash
	this._precision = precision
	this._tempCheck = tempCheck
	this._humCheck = humCheck
	this._preCheck = preCheck
	this._visCheck = visCheck
	this._zoom = zoom
	this._bounds = bounds
	this._northWest = northWest
	this._southEast = southEast
	this.percentColors = [
        	{ pct: 0.0, color: { r: 0x00, g: 0x00, b: 0xff } },
       		{ pct: 0.5, color: { r: 0x00, g: 0xff, b: 0x00 } },
        	{ pct: 1.0, color: { r: 0xff, g: 0x00, b: 0x00 } }
        ]
	this.precisionToPerimeter = {
		5: 0.9,
		4: 1.9,
		3: 7
    	}
	var me = this
	this._xhr.onreadystatechange = function() {
            if (this.readyState == XMLHttpRequest.DONE) {
	        me._data = JSON.parse(this.responseText);
	        me.prepareData();
            }
        }
    }

     _polygonPerimeter(corners) {
        var n = corners.length
        var length = 0.0
        for (var i = 0; i < n; i++){
            var j = (i + 1) % n
            length += Math.hypot(corners[j][0]-corners[i][0], corners[j][1]-corners[i][1])
	}
        return length
    }

    _getColorForPercentage(pct) {
        for (var i = 1; i < this.percentColors.length - 1; i++) {
            if (pct < this.percentColors[i].pct) {
                break;
            }
        }
        var lower = this.percentColors[i - 1];
        var upper = this.percentColors[i];
        var range = upper.pct - lower.pct;
        var rangePct = (pct - lower.pct) / range;
        var pctLower = 1 - rangePct;
        var pctUpper = rangePct;
        var color = {
            r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
            g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
            b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
        };
        return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    }

    prepareData(){
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
	if (this._geohash !== ""){
	    bounds = geohash_bounds(this._geohash);
            bounds["se"] = [bounds["sw"]["lat"], bounds["ne"]["lon"]]
            bounds["nw"] = [bounds["ne"]["lat"], bounds["sw"]["lon"]]
        } else {
	    //bounds["sw"] = [-Number.MAX_VALUE, Number.MAX_VALUE]
            //bounds["ne"] = [Number.MAX_VALUE, -Number.MAX_VALUE]
            bounds["se"] = [-Number.MAX_VALUE, Number.MAX_VALUE]
            bounds["nw"] = [Number.MAX_VALUE, -Number.MAX_VALUE]
        }
        featureDict = {}

        var ix = 2
        if (this._tempCheck){
            featureDict["Surface Temperature,(K)"] = ix
            ix += 1
        }
        if (this._humCheck){
            featureDict["Relative Humidity,(%)"] = ix
            ix += 1
        }
        if (this._visCheck){
            featureDict["Surface Visibility,(m)"] = ix
            ix += 1
        }
        if (this._preCheck){
            featureDict["Precipitable Water,(mm)"] = ix
            ix += 1
        }

        var count = 0
        for (var key in this._data) {
            if (this._data.hasOwnProperty(key)) {
                var features = this._data[key].split(",")
                var geohash = key;
                var center = decode_geohash(geohash);
                if (this._precision !== geohash.length){
                    geohash = encode_geohash(center["lat"], center["lon"], this._precision)
                    center = decode_geohash(geohash)
                }
	        var latLng = [center["lat"], center["lon"]]
	        var singlePoint = [center["lat"], center["lon"]]

                var ix = 0
                if (this._tempCheck){
                    var temperature = parseFloat(features[ix]);
                    maxes["temperature"] = Math.max(temperature, maxes["temperature"])
                    mins["temperature"] = Math.min(temperature, mins["temperature"])
                    singlePoint.push(temperature)
                    ix += 1
                }
                if (this._humCheck){
                    var relativeHumidity = parseFloat(features[ix]);
                    maxes["humidity"] = Math.max(relativeHumidity, maxes["humidity"])
                    mins["humidity"] = Math.min(relativeHumidity, mins["humidity"])
                    singlePoint.push(relativeHumidity)
                    ix += 1
                }
                if (this._visCheck){
                    var visibility = parseFloat(features[ix]);
                    maxes["visibility"] = Math.max(visibility, maxes["visibility"])
                    mins["visibility"] = Math.min(visibility, mins["visibility"])
                    singlePoint.push(visibility)
                    ix += 1
                }
                if (this._preCheck){
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
	if(this._currentTimeLatLngs.length > 0){
	    this._delaunay = d3.Delaunay.from(this._currentTimeLatLngs)
	    this._options = {dataMin: mins, dataMax: maxes, features: featureDict, bounds: bounds, minOpacity:0.4}
	    this.createPolygons()
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
	//this._baseLayer.setOptions({dataMin: mins, dataMax: maxes, features: featureDict, bounds: bounds, minOpacity:0.4, map:mymap})
	//this._update()
	/*
	if (this._timeDimension && this._time == this._timeDimension.getCurrentTime() && !this._timeDimension.isLoading()) {
            this._update();
        }
	*/
    }

    createPolygons() {
	/*
        if (!this._map || this._latlngs.length < 1) {
	    this._frame = null
            return;
        }
	*/
	var data = []
        var topLeft = latLngToPoint(this._northWest, this._zoom)
        var bottomRight = latLngToPoint(this._southEast, this._zoom)
	var drawLimit = new LatLngBounds(this._bounds._southWest, this._bounds._northEast);

	// console.time('process');
	var voronoi = this._delaunay.voronoi([drawLimit._southWest.lat, drawLimit._southWest.lng, 
						drawLimit._northEast.lat, drawLimit._northEast.lng]);

	var voronoiFeatures = {}
	var ix = 1
	if (this._options.features["Surface Temperature,(K)"] !== undefined){
	    voronoiFeatures["temp"] = ix
	    ix += 1
	}
	if (this._options.features["Relative Humidity,(%)"] !== undefined){
	    voronoiFeatures["hum"] = ix
	    ix += 1
	}
	if (this._options.features["Surface Visibility,(m)"] !== undefined){
	    voronoiFeatures["vis"] = ix
	    ix += 1
	}
	if (this._options.features["Precipitable Water,(mm)"] !== undefined){
	    voronoiFeatures["pre"] = ix
	    ix += 1
	}
	this._voronoi.setFeatures(voronoiFeatures)

	var dataCount = 0
	for (var i = 0; i < this._currentTimeLatLngs.length; i++) {
	    var latlng = new LatLng(this._currentTimeLatLngs[i][0], this._currentTimeLatLngs[i][1]);
  	    if (drawLimit.contains(latlng)) {
		var newPolygon = []
		var polygon = voronoi.cellPolygon(i)
		if (this._polygonPerimeter(polygon) > this.precisionToPerimeter[this._precision]){
		    continue
		}
		var valid = true
		for (var j = 0; j < polygon.length; j++){
		    var point = new LatLng(polygon[j][0], polygon[j][1])
		    if (point.lat <= this._options.bounds['se'][0] || point.lat >= this._options.bounds['nw'][0] || 
	      			point.lng  >= this._options.bounds['se'][1] || point.lng <= this._options.bounds['nw'][1]) {
		        valid = false
		        break 
	  	    }
	  	    var pPoint = latLngToPoint(point)
		    newPolygon.push([pPoint.x- topLeft.x, pPoint.y- topLeft.y])
		}
		if (valid){
		    var singlePoint = [newPolygon]
		    if (this._options.features["Surface Temperature,(K)"] !== undefined){
			var color = this._getColorForPercentage((this._currentTimeLatLngs[i][this._options.features["Surface Temperature,(K)"]] - 
								this._options.dataMin["temperature"]) / 
								(this._options.dataMax["temperature"] - this._options.dataMin["temperature"]))
			singlePoint.push(color)
		    }
		    if (this._options.features["Relative Humidity,(%)"] !== undefined){
			var opacity = (this._currentTimeLatLngs[i][this._options.features["Relative Humidity,(%)"]] - this._options.dataMin["humidity"]) / 
					(this._options.dataMax["humidity"] - this._options.dataMin["humidity"])
			//console.log(opacity)
			singlePoint.push(opacity)
		    }
		    if (this._options.features["Surface Visibility,(m)"] !== undefined){
			var opacity = (this._currentTimeLatLngs[i][this._options.features["Surface Visibility,(m)"]] - this._options.dataMin["visibility"]) / 
					(this._options.dataMax["visibility"] - this._options.dataMin["visibility"])
			singlePoint.push(opacity)
		    }
		    if (this._options.features["Precipitable Water,(mm)"] !== undefined){
			var opacity = (this._currentTimeLatLngs[i][this._options.features["Precipitable Water,(mm)"]] - this._options.dataMin["precipitation"]) / 
					(this._options.dataMax["precipitation"] - this._options.dataMin["precipitation"])
			singlePoint.push(opacity)
		    }
		    dataCount += 1
		    data.push(singlePoint)
		}
	    }
	}
	console.log("Number of data points displayed: "+ dataCount)
        // console.timeEnd('process');

        // console.time('draw ' + data.length);
        this._voronoi.data(data).draw(this._options.minOpacity);
        // console.timeEnd('draw ' + data.length);
	//var offscreen = this._canvas.transferControlToOffscreen();
	//postMessage({canvas: this._canvas}, [this._canvas])
	//var bitmap = this._canvas.transferToImageBitmap()
	console.log(this._voronoi._ctx.getImageData(0,0,1334,980))
	self.postMessage({msg: 'render', bits: "none"});

        this._frame = null;
    }
}

var onmessage = function(e) {
    var VB = new VoronoiBuffer(e.data.queryString, e.data.x, e.data.y,
				e.data.geohash, e.data.precision, e.data.tempCheck,
				e.data.humCheck, e.data.preCheck, e.data.visCheck, e.data.bounds, e.data.canvas,
				e.data.northWestBounds, e.data.southEastBounds, e.data.zoom)
}
