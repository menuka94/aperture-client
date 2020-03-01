'use strict';

L.VoronoiLayer = (L.Layer ? L.Layer : L.Class).extend({

    initialize: function (canvas) {
		this._canvas = canvas
    },

    setCanvas: function (canvas) {
		this._canvas = canvas;
		return this.redraw();
    },

    redraw: function () {
        if (this._voronoi && !this._frame && this._map && !this._map._animating) {
            this._frame = L.Util.requestAnimFrame(this._redraw, this);
        }
        return this;
    },

    onAdd: function (map) {
        this._map = map;

        if (this.options.pane) {
            this.getPane().appendChild(this._canvas);
        }else{
            map._panes.overlayPane.appendChild(this._canvas);
        }

        map.on('moveend', this._reset, this);

        if (map.options.zoomAnimation && L.Browser.any3d) {
            map.on('zoomanim', this._animateZoom, this);
        }

        this._reset();
    },

    onRemove: function (map) {
        if (this.options.pane) {
            this.getPane().removeChild(this._canvas);
       }else{
            map.getPanes().overlayPane.removeChild(this._canvas);
        }

        map.off('moveend', this._reset, this);

        if (map.options.zoomAnimation) {
            map.off('zoomanim', this._animateZoom, this);
        }
    },

    addTo: function (map) {
		this._map = map
        map.addLayer(this);
        return this;
    },

    _reset: function () {
        var topLeft = this._map.latLngToLayerPoint([65.0, -165.0]);
        var bottomRight = this._map.latLngToLayerPoint([3.0, -40.0]);

		this._canvas.style.width = ""+bottomRight.x - topLeft.x+"px"
        this._canvas.style.height = ""+bottomRight.y - topLeft.y+"px"
        L.DomUtil.setPosition(this._canvas, topLeft);
        this._redraw();
    },

    _redraw: function () {
        if (!this._map) {
			this._frame = null
            return;
        }
        this._frame = null;
    },
    
    _extractNumber: function (txt) {
		var numb = txt.match(/\d/g)
		numb = numb.join("")
		return parseInt(numb)
	},

    _animateZoom: function (e) {
        var scale = this._map.getZoomScale(e.zoom)
        var offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

        if (L.DomUtil.setTransform) {
            L.DomUtil.setTransform(this._canvas, offset, scale);
            

        } else {
            this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
        }
    }
});

L.voronoiLayer = function (latlngs, options) {
    return new L.VoronoiLayer(latlngs, options);
};
