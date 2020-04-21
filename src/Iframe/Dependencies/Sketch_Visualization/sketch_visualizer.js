try{
    const fs = require('fs');
    eval(fs.readFileSync('src/display.js')+'');
} catch(e) { }

Sketch_Visualizer = {
    initialize: function(percentageToColor) {
        this._grpcQuerier = grpc_querier();
        this._percentageToColor = percentageToColor;
        this._zoomToPixelSize = {
            3: 2,
            4: 3,
            5: 5,
            6: 8,
            7: 16,
            8: 35
        };
        this._zoomScaleFactor = {
            3: 10,
            4: 10,
            5: 8,
            6: 6,
            7: 2,
            8: 0
        };
        this._decay = 0.9999;
        this._stream = undefined;
    },

    _drawStrand: function(strand, ctx, map, epsilon) {
        const lat_lng = decode_geohash(strand.getGeohash());
        lat_lng.lon += 360;

        const center = map.latLngToContainerPoint(lat_lng);
        ctx.fillStyle = this._rgbaToString(this._getColorForPercentage((strand.getMeanList()[0] - 250) / (330 - 250), 0.5));

        const pixelSize = this._zoomToPixelSize[map.getZoom()] *
            Math.max((epsilon * this._zoomScaleFactor[map.getZoom()]), 1);

        center.x = Math.round(center.x- (pixelSize / 2));
        center.y = Math.round(center.y- (pixelSize / 2));

        ctx.clearRect(center.x, center.y, pixelSize, pixelSize);
        ctx.fillRect(center.x, center.y, pixelSize, pixelSize);
    },

    _rgbaToString: function(rgba){
        return "rgba("+rgba[0]+", "+rgba[1]+", "+rgba[2]+", "+rgba[3]+")";
    },

    _getColorValue: function(bounds, pcts, idx){
        return this._percentageToColor[bounds[0]][idx]*pcts[0] + this._percentageToColor[bounds[1]][idx]*pcts[1];
    },

    _getColorForPercentage: function(pct, alpha) {
        if(pct === 0) {
            pct += 0.00001;
        } else if (pct % 0.5 === 0) {
            pct -= 0.00001;
        }
        const lower = 0.5*(Math.floor(Math.abs(pct/0.5)));
        const upper = 0.5*(Math.ceil(Math.abs(pct/0.5)));
        const rangePct = (pct - lower) / (upper - lower);
        const pctLower = 1 - rangePct;
        const pctUpper = rangePct;
        const r = Math.floor(this._getColorValue([lower, upper], [pctLower, pctUpper], 0));
        const g = Math.floor(this._getColorValue([lower, upper], [pctLower, pctUpper], 1));
        const b = Math.floor(this._getColorValue([lower, upper], [pctLower, pctUpper], 2));
        return [r, g, b, alpha];
    },

    _getBoundingGeohash: function(bounds) {
        const b1 = encode_geohash(bounds._northEast.lat, bounds._northEast.lng-360);
        const b2 = encode_geohash(bounds._southWest.lat, bounds._southWest.lng-360);
        let boundingGeo = "";
        for(let i = 0; i < b1.length; i++){
            if (b1.charAt(i) === b2.charAt(i)){
                boundingGeo += b1.charAt(i)
            } else { break; }
        }
        return boundingGeo
    },

    _searchForIntersectingGeohashes: function(bounds, baseGeo, geohashList, precision=2){
        for (let i = 0; i < getGeohashBase().length; i++) {
            const candidateGeo = baseGeo + getGeohashBase().charAt(i);
            const candidateBounds = geohash_bounds(candidateGeo);
            if(this._checkBoundIntersection(bounds, candidateBounds)) {
                if (candidateGeo.length >= precision) {
                    geohashList.push(candidateGeo);
                } else {
                    this._searchForIntersectingGeohashes(bounds, candidateGeo, geohashList, precision)
                }
            }
        }
        return geohashList;
    },

    _checkBoundIntersection: function(b1, b2) {
        return !(b2.sw.lat > b1.ne.lat ||
            b2.ne.lat < b1.sw.lat ||
            b2.ne.lng > b1.sw.lng ||
            b2.sw.lng < b1.ne.lng);
    },

    _standardizeBounds: function(bounds){
        return {ne: bounds._northEast, sw: bounds._southWest};
    },

    queryTime: function(startTime, endTime, ctx, map) {
        const geohashList = [];
        this._searchForIntersectingGeohashes(this._standardizeBounds(map.getBounds()),
            this._getBoundingGeohash(map.getBounds()), geohashList);

        if (this._stream)
            this._stream.cancel();

        stream = this._grpcQuerier.getStreamForQuery("noaa_2015_jan", geohashList, startTime, endTime);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        let epsilon = this._zoomToPixelSize[map.getZoom()];
        stream.on('data', function (response) {
            for (const strand of response.getStrandsList()) {
                this._drawStrand(strand, ctx, map, epsilon);
                epsilon *= this._decay;
            }
        }.bind(this));
        stream.on('status', function (status) {
            console.log(status.code, status.details, status.metadata);
        });
        stream.on('end', function (end) {
        }.bind(this));

        this._stream = stream;
    },
};

sketch_visualizer = function(percentageToColor) {
    const sketchVisualizer = Sketch_Visualizer;
    sketchVisualizer.initialize(percentageToColor);
    return sketchVisualizer;
};

try{
    module.exports = {
        sketch_visualizer: sketch_visualizer
    }
} catch(e) { }