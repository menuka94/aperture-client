'use strict';

L.TimeDimension.Layer.VoronoiLayer = L.TimeDimension.Layer.extend({

    initialize: function(options) {
		this._initCanvas()
        var layer = new L.VoronoiLayer(this._canvas, options);
		var me = this
        L.TimeDimension.Layer.prototype.initialize.call(this, layer, options);
        this._currentLoadedTime = 0;
        this._currentTimeCanvas = this._canvas
        this._queryOut = false
        this._applyMask = {}
        this._masks = {}
        this._cachedResults = {}
        this._features = []
        this._serverCache = true
        this._clientBuffer = true
        this._panningTrajectory = []
        this._trajectoryPlanning = false
        this._animationPreloading = false
        this._featureColors = {"Temperature": ["#0A32FD","K"], "Humidity": ["#8B8B8B","%"], 
								"Visibility": ["#0D0A0A","m"], "Precipitation": ["#8033C3","mm"]}
		this._featureIndexes = {"Temperature": 2, "Humidity": 3, 
								"Visibility": 1, "Precipitation": 0}
		this._machineIxs = {1:"lattice-1"}
		this._dayIxs = {3:1}
    },
    
    onAdd: function(map) {
		this._map = map
        L.TimeDimension.Layer.prototype.onAdd.call(this, map);
        map.addLayer(this._baseLayer);
        this._player = new L.TimeDimension.Player({}, map.timeDimension);
        if (this._timeDimension) {
            this._getDataForTime(this._timeDimension.getCurrentTime());
        }
        
        var info = L.control();
        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
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
		
		//Update statistics when map is panned or zoomed
		map.on('moveend', function() {
			me.statQuery(me)
		});

		//This listener updates info when the mouse is moved
		map.addEventListener('mousemove', function(ev) {
			if (me._pointData == null){
				return
			}
			var directions = ["n","s","e","w"]
			var mouseLat = ev.latlng.lat;
			var mouseLng = ev.latlng.lng;
			var precision = document.getElementById("precision").value
			var mouseGeohash = encode_geohash(mouseLat,mouseLng,precision)
			var center = decode_geohash(mouseGeohash);
			
			var count = 10
			var value = me._pointData[mouseGeohash]
			me._finalGeo = mouseGeohash
			while (value == null){
				for (var i = 0; i < directions.length; i++){
					if (value == null) {
						var new_geohash = geohash_adjacent(mouseGeohash,directions[i])
						value = me._pointData[new_geohash]
						me._finalGeo = new_geohash
					}
				}
				mouseGeohash = geohash_adjacent(mouseGeohash,directions[Math.floor(Math.random() * 4)])
				count += 1
				if (count > 100){ break }
			}
			me._finalPoint = decode_geohash(me._finalGeo);

			if (value != null){
				var content = "<p>Geohash: "+me._finalGeo+"<br/>"
				content += "Lattitude: "+me._finalPoint.lat.toFixed(2)+"<br/>"
				content += "Longitude: "+me._finalPoint.lon.toFixed(2)+"<br/>"
				var correlations = ""
				var keyData = value.split(',')
				for (var i = 0; i < me._features.length; i++){
					content += me._features[i]+": "+parseFloat(keyData[i]).toFixed(2)+"<br/>"
					
					for (var j = 0; j < me._features.length; j++){
						if (i == j) { break; }
						var cov = (parseFloat(keyData[i])-me._dataMeans[me._featureIndexes[me._features[i]]])*
									(parseFloat(keyData[j])-me._dataMeans[me._featureIndexes[me._features[j]]])
						var cor = cov / (me._dataStds[me._featureIndexes[me._features[i]]]*me._dataStds[me._featureIndexes[me._features[j]]])
						correlations += me._features[i]+"-"+me._features[j]+" correlation"+": "+cor.toFixed(2)+"<br/>"
					}
					
				}
				content += correlations
				content += "</p>"
				info.update(content)
			}
		});
		
		this.addEventListener('timeload', function(ev) {
			var value = me._pointData[me._finalGeo]
			if (value != null){
				var content = "<p>Geohash: "+me._finalGeo+"<br/>"
				content += "Lattitude: "+me._finalPoint.lat.toFixed(2)+"<br/>"
				content += "Longitude: "+me._finalPoint.lon.toFixed(2)+"<br/>"
				var correlations = ""
				var keyData = value.split(',')
				for (var i = 0; i < me._features.length; i++){
					content += me._features[i]+": "+parseFloat(keyData[i]).toFixed(2)+"<br/>"
					for (var j = 0; j < me._features.length; j++){
						if (i == j) { break; }
						var cov = (parseFloat(keyData[i])-me._dataMeans[me._featureIndexes[me._features[i]]])*
									(parseFloat(keyData[j])-me._dataMeans[me._featureIndexes[me._features[j]]])
						var cor = cov / (me._dataStds[me._featureIndexes[me._features[i]]]*me._dataStds[me._featureIndexes[me._features[j]]])
						correlations += me._features[i]+"-"+me._features[j]+" correlation"+": "+cor.toFixed(2)+"<br/>"
					}
				}
				content += correlations
				content += "</p>"
				info.update(content)
			}
		});
	},
	
	boundingGeohash: function(bounds) {
		var b1 = encode_geohash(bounds._northEast.lat, bounds._northEast.lng)
		var b2 = encode_geohash(bounds._southWest.lat, bounds._southWest.lng)
		var boundingGeo = ""
		for(var i = 0; i < b1.length; i++){
			if (b1.charAt(i) === b2.charAt(i)){
				boundingGeo += b1.charAt(i)
			} else { break; }
		}
		return boundingGeo
	},
	
	addControlReference: function(ctrl) {
		this._ctrl = ctrl
	},
	
    _initCanvas: function () {
        var canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-voronoi-layer leaflet-layer');
		this._ctx = canvas.getContext("2d")

        var originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
        canvas.style[originProp] = '50% 50%';

        canvas.width  = 1000;
        canvas.height = 500;

        var animated = false //this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));
    },


    _onNewTimeLoading: function(ev) {
		if (this._ctrl._player._waitingForBuffer) {
			if (ev.time - moment.duration(mymap.timeDimension.options.period) != this._timeDimension.getCurrentTime()){
				return false
			}
		} else {
			if (ev.time - moment.duration(mymap.timeDimension.options.period) == this._timeDimension.getCurrentTime()){
				return false
			}
		}
		this._getDataForTime(ev.time);
        return;
    },

    isReady: function(time) {
        return (this._currentLoadedTime == time);
    },

    _update: function() {
		this._baseLayer.setCanvas(this._currentTimeCanvas);
		return true
    },

    setCanvas: function(canvas) {
		this._baseLayer.setCanvas(this._canvas)
    },
    
    _updateTime: function(queryData) {
		var currTime = parseFloat(this._timeDimension.getCurrentTime())
		currTime = new Date(currTime)
		currTime.setHours(currTime.getHours()+23)
		currTime = currTime.getTime()
		if ((this._timeDimension && (parseFloat(queryData["time"]) == currTime) && !this._ctrl._player._waitingForBuffer) ||
			(this._timeDimension && (parseFloat(queryData["time"]) != currTime) && this._ctrl._player._waitingForBuffer)) {
			if("raster" in queryData){
				var id = new ImageData(new Uint8ClampedArray(queryData["raster"]), 1000, 500);
				this._masks["unmasked"] = queryData["raster"]
				this._ctx.putImageData(id, 0, 0)
			}
			this._update();
			this._pointData = queryData["data"]
			this._currentLoadedTime = currTime;
			this.loadedTime = currTime
			this.statQuery(this)
			currTime = new Date(currTime)
			currTime.setHours(currTime.getHours()-23)
			currTime = currTime.getTime()
			this._currentLoadedTime = currTime;
			this.fire('timeload', {
				time: currTime,
			});	
		}
	},
	
    _getDataForTime: function(time, geohash=null, params={}, asynchronous=true) {
		time = new Date(time)
		time.setHours(time.getHours()+23)
		time = time.getTime()
		var qTime = time
		for(var i = 0; i < 20; i++){
			var queryString = []
			var cutLength = 0
			if (this._serverCache){
				queryString = [0, "cache"]
				cutLength = 7
			}else{
				queryString = [0, "nocache"]
				cutLength = 9
			}
			queryString.push(this.query(qTime, geohash, params));
			queryString = queryString.join("-")
			var idString = queryString.substring(cutLength)
			this._queryForTime(queryString, idString, cutLength, time, qTime, queryString.split("-")[2].split(",")[0], asynchronous)
			var d = new Date(qTime)
			d.setHours(d.getHours()+6);
			qTime = d.getTime()
			if (this._animationPreloading === false){
				break
			}
		}
		
		if (geohash === null)
			geohash = document.getElementById("geohash").value;
			
		if(geohash !== "" && this._trajectoryPlanning){
			if(this._panningTrajectory.length === 2)
				this._panningTrajectory.shift()
			this._panningTrajectory.push(geohash)
			
			if (this._panningTrajectory.length === 2) {
				var directions = ["n","e","s","w","o"]
				var d = "n"
				for(var i=1; i<directions.length; i++){
					if (geohash_adjacent(this._panningTrajectory[0], d) ===  this._panningTrajectory[1])
						break
					d = directions[i]
				}
				if (d === "o"){
					d = ""
					var start = decode_geohash(this._panningTrajectory[0])
					var end = decode_geohash(this._panningTrajectory[1])
					if (start.lat > end.lat)
						d += "s"
					else
						d += "n"
					if (start.lon > end.lon)
						d += "w"
					else
						d += "e"
				}
				var currGeo = this._panningTrajectory[1]
				for(var i=0; i<2; i++){
					var queryString = []
					var cutLength = 0
					if (this._serverCache){
						queryString = [0, "cache"]
						cutLength = 7
					}else{
						queryString = [0, "nocache"]
						cutLength = 9
					}
					queryString.push(this.query(time, currGeo, params));
					queryString = queryString.join("-")
					var idString = queryString.substring(cutLength)
					this._queryForTime(queryString, idString, cutLength, time, time, currGeo, asynchronous)
					if (d.length === 1){
						currGeo = geohash_adjacent(currGeo, d)
					} else {
						currGeo = geohash_adjacent(currGeo, d.charAt(0))
						currGeo = geohash_adjacent(currGeo, d.charAt(1))
					}
				}
				var directions = ["n","e","s","w","nw","ne","sw","se"]
				for(var i=0; i<directions.length; i++){
					var queryString = []
					var cutLength = 0
					if (this._serverCache){
						queryString = [0, "cache"]
						cutLength = 7
					}else{
						queryString = [0, "nocache"]
						cutLength = 9
					}
					var currGeo = ""
					var d = directions[i]
					if (d.length === 1){
						currGeo = geohash_adjacent(this._panningTrajectory[1], d)
					} else {
						currGeo = geohash_adjacent(this._panningTrajectory[1], d[0])
						currGeo = geohash_adjacent(currGeo, d[1])
					}
					queryString.push(this.query(time, currGeo, params));
					queryString = queryString.join("-")
					var idString = queryString.substring(cutLength)
					this._queryForTime(queryString, idString, cutLength, time, time, currGeo, asynchronous)
				}
			}
		}
    },
    
    _queryForTime: function(queryString, idString, cutLength, time, qTime, geohash, asynchronous) {
		//time = parseFloat(time)
		if(this._clientBuffer && idString in this._cachedResults){
			if (parseFloat(this._cachedResults[idString]["time"]) === time){
				this._updateTime(this._cachedResults[idString])
			}
		} else {
			var _me = this
			var _xhr = new XMLHttpRequest();
			_xhr.addEventListener("load", (function(xhr) {
				var response = xhr.currentTarget.response;
				if (response === "failed" || response === ""){
					_me.fire('timeload', {
						time: _me._currentLoadedTime,
					});	
					return
				}
				var queryData = JSON.parse(response);
				if (Object.keys(queryData).length !== 0){
					if (this._clientBuffer){
						if (queryData["querystring"].startsWith("0-no")) {
							this._cachedResults[queryData["querystring"].substring(cutLength+2)] = queryData
						}else {
							this._cachedResults[queryData["querystring"].substring(cutLength)] = queryData
						}
					}
					if(parseFloat(queryData["time"]) === time){
						this._features = []
						if (document.getElementById("tempCheck").checked){
							this._features.push("Temperature")
						}
						if (document.getElementById("humCheck").checked){
							this._features.push("Humidity")
						}
						if (document.getElementById("visCheck").checked){
							this._features.push("Visibility")
						}
						if (document.getElementById("preCheck").checked){
							this._features.push("Precipitation")
						}
						this._updateTime(queryData)
					}
					if(Object.keys(this._cachedResults).length >= 50){
						for (var j in this._cachedResults) {
							delete this._cachedResults[j];
							break;
						}
					}
				}
			}).bind(this));
			_xhr.open("POST", "http://"+this.getMachine(qTime)+".cs.colostate.edu:5711/synopsis", asynchronous);
			_xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
			_xhr.send(queryString);	
		}
	},

    query: function(time, geohash=null, params={}) {
		if (geohash === null)
			geohash = document.getElementById("geohash").value;
		if(!("precision" in params))
			var precision = document.getElementById("precision").value;
		else
			var precision = params["precision"]
		if(!("minTemperature" in params))
			var mintemp = document.getElementById("mintemp").value;
		else
			var mintemp = params["minTemperature"]
		if(!("maxTemperature" in params))
			var maxtemp = document.getElementById("maxtemp").value;
		else
			var maxtemp = params["maxTemperature"]
		if(!("minHumidity" in params))
			var minhum = document.getElementById("minhum").value;
		else
			var minhum = params["minHumidity"]
		if(!("maxHumidity" in params))
			var maxhum = document.getElementById("maxhum").value;
		else
			var maxhum = params["maxHumidity"]
		if(!("minVisibility" in params))
			var minvis = document.getElementById("minvis").value;
		else
			var minvis = params["minVisibility"]
		if(!("maxVisibility" in params))
			var maxvis = document.getElementById("maxvis").value;
		else
			var maxvis = params["maxVisibility"]
		if(!("minPrecipitation" in params))
			var minpre = document.getElementById("minpre").value;
		else
			var minpre = params["minPrecipitation"]
		if(!("maxPrecipitation" in params))
			var maxpre = document.getElementById("maxpre").value;
		else
			var maxpre = params["maxPrecipitation"]
		if (!("tempCheck" in params))
			var tempCheck = document.getElementById("tempCheck").checked
		else
			var tempCheck = params["tempCheck"]
		if (!("humCheck" in params))
			var humCheck = document.getElementById("humCheck").checked
		else
			var humCheck = params["humCheck"]
		if (!("visCheck" in params))
			var visCheck = document.getElementById("visCheck").checked
		else
			var visCheck = params["visCheck"]
		if (!("preCheck" in params))
			var preCheck = document.getElementById("preCheck").checked
		else
			var preCheck = params["preCheck"]
		if (!("time" in params)){
			var time = (new Date(time));
			time = time.getTime()
		}else {
			var time = params["time"]
		}
		this._time = time
		var queryString = geohash
		queryString += ","+time;
		queryString += ","+precision;

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
		return queryString
    },
    
    statQuery: function(me, geos=null, params={}, drawMat=true, drawBar=true, asynchronous=true) {
		var boundingGeo = me.boundingGeohash(me._map.getBounds())
		var queryString = ["stat"]
		if (geos !== null){
			queryString.push(me.query(me.loadedTime, geos.join("+"), params))
		} else if (boundingGeo.length > document.getElementById("geohash").value.length){
			queryString.push(me.query(me.loadedTime, boundingGeo, params))
		} else {
			queryString.push(me.query(me.loadedTime, document.getElementById("geohash").value, params))
		}
		queryString = queryString.join("-")
		var _xhr = new XMLHttpRequest();
		_xhr.addEventListener("load", (function(xhr) {
			var response = xhr.currentTarget.response;
			if (response === "failed"){
				return
			}
			var queryData = JSON.parse(response);
			var matrix = new CorrMatrix(me);
			if(me._features.length > 1){
				if (drawMat)
					matrix.make(queryData["corr"], me._features)
				this._dataMeans = queryData["means"]
				this._dataStds = queryData["stds"]
				if (drawBar){
					var bc = new BarChart(me)
					bc.clear()
					for(var i = 0; i < me._features.length; i++){
						var barChart = new BarChart(me);
						var ix = this._featureIndexes[me._features[i]]
						barChart.make(queryData["buckets"][ix], queryData["labels"][ix], me._features[i], 
									me._featureColors[me._features[i]][0], me._featureColors[me._features[i]][1])
					}
				}
			} else { matrix.remove() }
		}).bind(me));
		_xhr.open("POST", "http://"+this.getMachine(this._currentLoadedTime)+".cs.colostate.edu:5711/synopsis", asynchronous);
		_xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
		_xhr.send(queryString);	
	},
    
    removeMask: function(time, color, rule) {
		if (rule.name == "dist"){
			var min = "min"+rule.feature
			var max = "max"+rule.feature
			this.statQuery(this, null, {min:rule.d1, max:rule.d2}, true, false)
		}
		delete this._masks[JSON.stringify({time, color, rule})]
		if(this._masks["unmasked"] !== undefined && this._masks["unmasked"].length != 0){
			var imageData = this._ctx.getImageData(0, 0, 1000, 500);
			var data = imageData.data;
			for (var i = 0; i < data.length; i += 4) {
				var colorCount = 0
				var colorSum = [0, 0, 0]
				for (var key in this._masks) {
					if (this._masks.hasOwnProperty(key)) {        
						if (key !== "unmasked" && this._masks[key][1][i+3] == 200){
							colorCount += 1
							colorSum[0] += this._masks[key][0].r
							colorSum[1] += this._masks[key][0].g
							colorSum[2] += this._masks[key][0].b
						} else if (key === "unmasked"){
							colorCount += 1
							colorSum[0] += this._masks[key][i]
							colorSum[1] += this._masks[key][i+1]
							colorSum[2] += this._masks[key][i+2]
						}
					}
				}
				data[i] = colorSum[0] / colorCount
				data[i+1] = colorSum[1] / colorCount
				data[i+2] = colorSum[2] / colorCount
			}
			this._ctx.putImageData(imageData, 0, 0)
		}
		this._applyMask = {}
	},
    
    highlightPolygons: function(time, color, rule, duplicate, asynchronous=true, cache="cache") {
		if (JSON.stringify(this._applyMask) === JSON.stringify({time, color, rule}) && !duplicate){
			return
		}
		this._masks[JSON.stringify({time, color, rule})] = "placeholder"
		this._applyMask = {time, color, rule}
		var targetGeohashes = ["mask",cache,this.query(time)]
		if (rule.name === "corr"){
			var dx = this._features.indexOf(rule.dx)
			var dy = this._features.indexOf(rule.dy)
			for (var key in this._pointData) {
				if (this._pointData.hasOwnProperty(key)) {
					if (dx == dy){
						targetGeohashes.push(key)
					} else {
						var keyData = this._pointData[key].split(',')
						var cov = (parseFloat(keyData[dx])-this._dataMeans[this._featureIndexes[this._features[dx]]])*
									(parseFloat(keyData[dy])-this._dataMeans[this._featureIndexes[this._features[dy]]])
						var cor = cov / (this._dataStds[this._featureIndexes[this._features[dx]]]*this._dataStds[this._featureIndexes[this._features[dy]]])
						if (cor >= rule.corr){
							targetGeohashes.push(key)
						}
					}
				}
			}
		} else if (rule.name === "dist"){
			var ix = this._features.indexOf(rule.feature)
			for (var key in this._pointData) {
				if (this._pointData.hasOwnProperty(key)) {
					var keyData = this._pointData[key].split(',')
					if (keyData[ix] > rule.d1 && keyData[ix] <= rule.d2){
						targetGeohashes.push(key)
					}
				}
			}
			var min = "min"+rule.feature
			var max = "max"+rule.feature
			this.statQuery(this, null, {min:rule.d1, max:rule.d2}, true, false)
		} else if (rule.name === "bench"){
			var count = 0
			for (var key in this._pointData) {
				if (this._pointData.hasOwnProperty(key)) {
					var keyData = this._pointData[key].split(',')
					if (count < rule.num){
						count += 1
						targetGeohashes.push(key)
					}
				}
			}
		}
		var queryString = targetGeohashes.join("-")
		
		var _xhr = new XMLHttpRequest();
        _xhr.addEventListener("load", (function(xhr) {
			if (!(JSON.stringify({time, color, rule}) in this._masks)){
				return
			}
            var response = xhr.currentTarget.response;
            if (response === "failed"){
				return
			}
            var queryData = JSON.parse(response);
			var id = new ImageData(new Uint8ClampedArray(queryData["mask"]), 1000, 500);
			var idData = id.data
			this._masks[JSON.stringify({time, color, rule})] = [color, idData]
			var imageData = this._ctx.getImageData(0, 0, 1000, 500);
			var data = imageData.data;
			for (var i = 0; i < data.length; i += 4) {
				var colorCount = 0
				var colorSum = [0, 0, 0]
				for (var key in this._masks) {
					if (this._masks.hasOwnProperty(key)) {        
						if (key !== "unmasked" && this._masks[key][1][i+3] == 200){
							colorCount += 1
							colorSum[0] += this._masks[key][0].r
							colorSum[1] += this._masks[key][0].g
							colorSum[2] += this._masks[key][0].b
						} else if (key === "unmasked"){
							colorCount += 1
							colorSum[0] += this._masks[key][i]
							colorSum[1] += this._masks[key][i+1]
							colorSum[2] += this._masks[key][i+2]
						}
					}
				}
				data[i] = colorSum[0] / colorCount
				data[i+1] = colorSum[1] / colorCount
				data[i+2] = colorSum[2] / colorCount
			}

			if (JSON.stringify(this._applyMask) === JSON.stringify({time, color, rule}) && !duplicate){
				this._ctx.putImageData(imageData, 0, 0)
			}

        }).bind(this));
        
        _xhr.open("POST", "http://"+this.getMachine(time)+".cs.colostate.edu:5711/synopsis", asynchronous);
		_xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        _xhr.send(queryString);	
	},
	
	getMachine: function(time) { 
		return "lattice-1"
		var d = new Date(time);
		d.setHours(d.getHours()+1)
		var month = this._dayIxs[d.getDate()];
		return this._machineIxs[month]
	}

});

L.timeDimension.layer.VoronoiLayer = function(options) {
    return new L.TimeDimension.Layer.VoronoiLayer(options);
};
