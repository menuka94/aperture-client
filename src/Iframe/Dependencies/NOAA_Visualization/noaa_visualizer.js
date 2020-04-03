NOAA_Visualizer = {
    initialize: function(options) {
        this._options = options || {};
        this._grpcQuerier = grpc_querier();
        this._percentageToColor = {
            0.0: [0, 0, 255],
            0.5: [0, 255, 0],
            1.0: [255, 0, 0]
        };

    },

    _drawStrand: function(strand, ctx, map) {
        const lat_lng = decode_geohash(strand.getGeohash());
        lat_lng.lon += 360;
        let features;
        if (strand.getObservationcount() === 1){
            features = strand.getFeaturesList();
        } else {
            features = strand.getMeanList();
        }
        const center = map.latLngToContainerPoint(lat_lng);
        //temperature
        ctx.fillStyle = this._rgbaToString(this._getColorForPercentage((features[0] - 255) / (310 - 255), 0.5));

        ctx.fillRect(center.x, center.y, 1, 1);
    },

    _rgbaToString: function(rgba){
        return "rgba("+rgba[0]+", "+rgba[1]+", "+rgba[2]+", "+rgba[3]+")"
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
        const r = Math.floor(this._percentageToColor[lower][0]*pctLower + this._percentageToColor[upper][0]*pctUpper);
        const g = Math.floor(this._percentageToColor[lower][1]*pctLower + this._percentageToColor[upper][1]*pctUpper);
        const b = Math.floor(this._percentageToColor[lower][2]*pctLower + this._percentageToColor[upper][2]*pctUpper);
        return [r, g, b, alpha];
    },

    queryTime: function(startTime, endTime, ctx, map) {
        const stream = this._grpcQuerier.getStreamForQuery("noaa_2015_jan", ["",], startTime, endTime);
        stream.on('data', function (response) {
            for (const strand of response.getStrandsList()) {
                this._drawStrand(strand, ctx, map);
            }
        }.bind(this));
        stream.on('status', function (status) {
            console.log(status.code, status.details, status.metadata);
        });
        stream.on('end', function (end) { });
    }
};

noaa_visualizer = function(options) {
    const noaaVisualizer = NOAA_Visualizer;
    noaaVisualizer.initialize(options);
    return noaaVisualizer;
};