'use strict';

L.TimeDimension.Layer.CustomTimeDimension = L.TimeDimension.Layer.extend({

    initialize: function(options, dataLoader) {
        L.TimeDimension.Layer.prototype.initialize.call(this, options);
        this._dataLoader = dataLoader;
        this._currentLoadedTime = 0;
        this._NE = {lat:65.0000, lng:-165.0000};
		this._SW = {x:3.0000, y:-40.0000};
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
        this._player = new L.TimeDimension.Player({}, map.timeDimension);

        if (map.options.zoomAnimation && L.Browser.any3d) {
            map.on('zoomanim', this._animateZoom, this);
        }

		this._getDataForTime(this._timeDimension.getCurrentTime());
	},

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

	addControlReference: function(ctrl) {
		this._ctrl = ctrl
	},
	
    _initCanvas: function () {
        const canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-time-dimension-layer leaflet-layer');
		this._ctx = canvas.getContext("2d");
		this._ctx.globalCompositeOperation = "lighter";

        const originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
        canvas.style[originProp] = '50% 50%';

        //canvas.width  = 1000;
        //canvas.height = 500;
        var size = this._map.getSize();
        canvas.width  = size.x;
        canvas.height = size.y;

        const animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));
        this._topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, this._topLeft);
    },

    _animateZoom: function (e) {
        const scale = this._map.getZoomScale(e.zoom);
        const offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

        if (L.DomUtil.setTransform) {
            L.DomUtil.setTransform(this._canvas, offset, scale);
        } else {
            this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
        }
    },

    _reset: function () {
        //const topLeft = this._map.latLngToLayerPoint(this._NE);
        //L.DomUtil.setPosition(this._canvas, this._topLeft);

        //var size = this._map.getSize();
       // this._canvas.width = size.x;
        //this._canvas.height = size.y;
    },

    _onNewTimeLoading: function(ev) {
		this._getDataForTime(ev.time);
    },

    isReady: function(time) {
        return (this._currentLoadedTime === time);
    },

	_getDataForTime: function(time) {
    	const endTime = time + moment.duration(this._timeDimension.options.period).asMilliseconds();
    	this._dataLoader.queryTime(time, endTime, this._ctx, this._map);
    	this._currentLoadedTime = time;
    	this.fire('timeload', {
    		time: this._currentLoadedTime,
		});
    }
});

L.timeDimension.layer.CustomTimeDimension = function(options, dataLoader) {
    return new L.TimeDimension.Layer.CustomTimeDimension(options, dataLoader);
};
