'use strict';

if (typeof module !== 'undefined') module.exports = simplevoronoi;

function simplevoronoi(canvas) {
    if (!(this instanceof simplevoronoi)) return new simplevoronoi(canvas);

    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    this._ctx = canvas.getContext('2d');
    this._width = canvas.width;
    this._height = canvas.height;
    
    var newCanvas = this._createCanvas()
    newCanvas.width = 10
    newCanvas.height = 10
    this._noise = this.perlinNoise(newCanvas)

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

    setFeatures: function(features) {
	this._features = features
    },

    draw: function (minOpacity) {
        var ctx = this._ctx;
        ctx.clearRect(0, 0, this._width, this._height);
        for (var i = 0, len = this._data.length, p; i < len; i++) {
            p = this._data[i];
	    //This is to remove visual of polygons not properly aligned
	    /*
	    if (this._features["hum"] !== undefined){
		ctx.strokeStyle='#D3D3D3';
		ctx.lineWidth=1.00;
	    } 
            */
	    ctx.globalAlpha = 0.2
	    ctx.beginPath();
	    ctx.moveTo(p[0][0][0], p[0][0][1])
	    for (var j = 1; j < p[0].length; j++){
		ctx.lineTo(p[0][j][0], p[0][j][1])
	    }
	    ctx.closePath();
	    ctx.globalAlpha = 0.5
	    if (this._features["temp"] !== undefined){
	        ctx.fillStyle = p[this._features["temp"]]
	        ctx.fill();
	    }
	    if (this._features["hum"] !== undefined){
	        //ctx.fillStyle = ctx.createPattern(this._noise,"no-repeat")
		ctx.fillStyle = '#D3D3D3' //silver gray
		//ctx.fillStyle = '#000000'
	        ctx.globalAlpha = p[this._features["hum"]] * 0.9
	        ctx.fill();
		if (p[this._features["hum"]] > 0.5){
		    //ctx.stroke();
		}
	    }
	    if (this._features["vis"] !== undefined){
	        //ctx.fillStyle = ctx.createPattern(this._noise,"no-repeat")
		ctx.fillStyle = '#000000' 
	        ctx.globalAlpha = p[this._features["vis"]] * 0.5
	        ctx.fill();
		if (p[this._features["vis"]] > 0.5){
		    //ctx.stroke();
		}
	    }
	    if (this._features["pre"] !== undefined){
	        //ctx.fillStyle = ctx.createPattern(this._noise,"no-repeat")
		ctx.fillStyle = '#000056' 
	        ctx.globalAlpha = p[this._features["pre"]] * 0.9
	        ctx.fill();
		if (p[this._features["pre"]] > 0.5){
		    //ctx.stroke();
		}
	    }
        }
        return this;
    },

    randomNoise: function (canvas, x, y, width, height, alpha) {
        x = x || 0;
        y = y || 0;
        width = width || canvas.width;
        height = height || canvas.height;
        alpha = alpha || 255;
        var g = canvas.getContext("2d"),
            imageData = g.getImageData(x, y, width, height),
            random = Math.random,
            pixels = imageData.data,
            n = pixels.length,
            i = 0;
        while (i < n) {
            pixels[i++] = pixels[i++] = pixels[i++] = 200//Math.min((random() * 600),256) | 0;
            pixels[i++] = alpha;
        }
        g.putImageData(imageData, x, y);
        return canvas;
    },

    perlinNoise: function (canvas) {
	var newCanvas = this._createCanvas()
        newCanvas.width = canvas.width
        newCanvas.height = canvas.height
        var noise = this.randomNoise(newCanvas);
        var g = canvas.getContext("2d");
        g.save();
    
        /* Scale random iterations onto the canvas to generate Perlin noise. */
        for (var size = 4; size <= noise.width; size *= 2) {
            var x = (Math.random() * (noise.width - size)) | 0,
                y = (Math.random() * (noise.height - size)) | 0;
            g.globalAlpha = 4 / size;
            g.drawImage(noise, x, y, size, size, 0, 0, canvas.width, canvas.height);
        }
        g.restore();
        return canvas;
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
