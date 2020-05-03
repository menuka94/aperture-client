'use strict';

L.TimeDimension.Layer.CustomTimeDimension = L.TimeDimension.Layer.extend({

    initialize: function(options, dataLoader) {
        L.TimeDimension.Layer.prototype.initialize.call(this, options);
        this._dataLoader = dataLoader;
        this._cache = cache({});
        this._lastQueryTime = 0;
        this._currentLoadedTime = 0;
        this._currentDataLoader = undefined;
    },
    
    onAdd: function(map) {
		this._map = map;
        L.TimeDimension.Layer.prototype.onAdd.call(this, map);

        this._initCanvas();

        if (this.options.pane) {
            this.getPane().appendChild(this._canvas);
        }else{
            map._panes.overlayPane.appendChild(this._canvas);
        }

		this._getDataForTime(this._timeDimension.getCurrentTime());
        map.on('moveend', this._reset, this);
	},

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

	addControlReference: function(ctrl) {
		this._ctrl = ctrl;
	},
	
    _initCanvas: function () {
        const canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-time-dimension-layer leaflet-layer');
		this._ctx = canvas.getContext("2d");
		this._ctx.globalCompositeOperation = "lighter";

        const originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
        canvas.style[originProp] = '50% 50%';

        this._updateBounds();

        const animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));
        this._reset();
    },

    _initOffscreenCanvas: function() {
        const oc = new OffscreenCanvas(this._canvas.width, this._canvas.height);
        return oc.getContext('2d');
    },

    _initDataLoader: function(){
        return sketch_visualizer({
            0.0: [0, 0, 255],
            0.5: [0, 255, 0],
            1.0: [255, 0, 0]
        });
    },

    _updateBounds: function() {
        const size = this._map.getSize();
        this._canvas.width  = size.x;
        this._canvas.height = size.y;
        const bounds = this._map.getBounds();
        this._topLeft = {lat: bounds._northEast.lat, lng:bounds._southWest.lng};
        this._bottomRight = {lat: bounds._southWest.lat, lng:bounds._northEast.lng};
    },

    _reset: function () {
        const topLeft = this._map.latLngToLayerPoint(this._topLeft);
        const bottomRight = this._map.latLngToLayerPoint(this._bottomRight);
        this._canvas.style.width = ""+bottomRight.x - topLeft.x+"px";
        this._canvas.style.height = ""+bottomRight.y - topLeft.y+"px";
        L.DomUtil.setPosition(this._canvas, topLeft);
    },

    _onNewTimeLoading: function(ev) {
		this._getDataForTime(ev.time);
    },

    isReady: function(time) {
        return (this._currentLoadedTime === time);
    },

    _getMeanAndStd: function(d) {
        const means = [];
        const stds = [];
        for(let j = 0; j < d[0].length; j++){
            let sum = 0;
            for(let i = 0; i< d.length; i++){
                sum += d[i][j];
            }
            means.push(sum/d.length);
        }

        for(let j = 0; j < d[0].length; j++){
            let std = 0;
            for(let i = 0; i< d.length; i++){
                std += Math.pow(d[i][j] - means[j], 2);
            }
            stds.push(Math.sqrt(std / d.length));
        }
        return [means, stds];
    },

    responsivenessBenchmark: async function(){
        const channels = [2, 4, 6, 8];
        const outputData = {};
        for(let channel = 0; channel < channels.length; channel++) {
            const times = [];
            for (let i = 0; i < 10; i++) {
                await new Promise(r => setTimeout(r, 7000));
                this._map.setZoom(3);
                await new Promise(r => setTimeout(r, 7000));
                this._dataLoader.times = [];
                this._dataLoader._iter = -1;
                for (let j = 0; j < 4; j++) {
                    this._getDataForTime(this._currentLoadedTime, channels[channel]);
                    await new Promise(r => setTimeout(r, 7000));
                    this._map.zoomIn(1);
                }
                times.push(this._dataLoader.times);
            }
            outputData[channels[channel]] = this._getMeanAndStd(times);
        }
        console.log(JSON.stringify(outputData));
    },

    cachingBenchmark: function() {
        this._cache = cache({max: 1});
        this._getDataForTime(this.__currentLoadedTime, 2)
    },

    _incrementTime: function(time){
        return time + moment.duration(this._timeDimension.options.period).asMilliseconds();
    },

    _runSimultaneousQueries: async function(startTime){
        await new Promise(r => setTimeout(r, 10000));
        const channels = [1, 5, 10];
        const simuls = [1,3,5,7,9];
        const data = {};
        const initTime = startTime;
        for(const s in simuls) {
            for(const c in channels) {
                const simulData = [];
                const dls = [];
                startTime = initTime;
                for (let i = 0; i < simuls[s]; i++) {
                    const endTime = this._incrementTime(startTime);
                    //if (!this._cache.isInCache(startTime)) {
                    const ocCTX = this._initOffscreenCanvas();
                    const dl = this._initDataLoader();
                    dls.push(dl);
                    dl.queryTime(startTime, endTime, ocCTX, this._map, channels[c]);
                        //this._cache.addToCache(startTime, ocCTX, dl);
                    //}
                    startTime = endTime;
                }
                await new Promise(r => setTimeout(r, 30000*simuls[s]));
                for(const dl in dls){
                    if(dls.hasOwnProperty(dl)) {
                        simulData.push(dls[dl]._completionTime);
                    }
                }
                data[[simuls[s], channels[c]]] = simulData
            }
        }
        console.log(JSON.stringify(data));
    },

	_getDataForTime: function(time, numChannels=2) {
        if(Math.abs(this._lastQueryTime - new Date().getTime()) < 1000)
            return;
        this._lastQueryTime = new Date().getTime();

        this._updateBounds();
        this._reset();

       // if(this._cache.isInCache(time)){
        //    const ctx_dl = this._cache.getCanvasForTime(time);
       //     this._ctx.putImageData(ctx_dl[0].getImageData(0, 0, ctx_dl[0].canvas.height, ctx_dl[0].canvas.width), 0, 0);
        //    this._currentDataLoader = ctx_dl[1];
        //} else {
            if(this._currentDataLoader)
                this._currentDataLoader.cancelActiveStreams();
            const endTime = this._incrementTime(time);
            const dl = this._initDataLoader();
            dl.queryTime(time, endTime, this._ctx, this._map, numChannels);
            this._currentDataLoader = dl;
      //  }

        this._runSimultaneousQueries(this._incrementTime(time));

        this._currentLoadedTime = time;
        this.fire('timeload', {
            time: time
        });
    }
});

L.timeDimension.layer.CustomTimeDimension = function(options, dataLoader) {
    return new L.TimeDimension.Layer.CustomTimeDimension(options, dataLoader);
};
