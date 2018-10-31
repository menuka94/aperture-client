'use strict';

if (typeof module !== 'undefined') module.exports = simplevoronoi;

function simplevoronoi(canvas) {
    if (!(this instanceof simplevoronoi)) return new simplevoronoi(canvas);

    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    this._ctx = canvas.getContext('2d');
    this._width = canvas.width;
    this._height = canvas.height;

    this._data = [];
}

simplevoronoi.prototype = {

    data: function (data) {
        this._data = data;
        return this;
    },

    max: function (max) {
        this._max = max;
        return this;
    },

    add: function (point) {
        this._data.push(point);
        return this;
    },

    clear: function () {
        this._data = [];
        return this;
    },

    resize: function () {
        this._width = this._canvas.width;
        this._height = this._canvas.height;
    },

    draw: function (minOpacity) {
        var ctx = this._ctx;
        ctx.clearRect(0, 0, this._width, this._height);
	
        for (var i = 0, len = this._data.length, p; i < len; i++) {
            p = this._data[i];
	    ctx.fillStyle = p[1]
	    ctx.beginPath();
            ctx.globalAlpha = 0.5//Math.min(Math.max(p[2] / this._max, minOpacity === undefined ? 0.05 : minOpacity), 1);
	    ctx.moveTo(p[0][0][0], p[0][0][1])
	    for (var j = 1; j < p[0].length; j++){
		ctx.lineTo(p[0][j][0], p[0][j][1])
	    } 
	    ctx.closePath();
	    ctx.fill();
        }
        return this;
    },

    _createCanvas: function () {
        if (typeof document !== 'undefined') {
            return document.createElement('canvas');
        } else {
            // create a new canvas instance in node.js
            // the canvas class needs to have a default constructor without any parameter
            return new this._canvas.constructor();
        }
    }
};
