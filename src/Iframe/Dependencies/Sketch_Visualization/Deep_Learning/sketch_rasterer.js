Sketch_Rasterer = {
    initialize: async function () {
        this._session = new onnx.InferenceSession({ backendHint: "webgl" });
        this._inputTensor =  new Tensor(new Float32Array(400*850), "float32", [1, 1, 1, 400, 850]);
        this._latLookup = this._buildIndexes([12.19, 61.33], 400);
        this._lonLookup = this._buildIndexes([-152.91, -49.33], 850);

        this._grpcQuerier = grpc_querier();
        const url = "Dependencies/Sketch_Visualization/Deep_Learning/viz_net.onnx";
        await this._session.loadModel(url).then(() => {
            //const input = this._getInput();
            //const query = this._getQuery();

            //
        });
    },

    _buildIndexes: function(range, len){
        const out = {};
        let val = range[0];
        const step = (range[1] - range[0]) / len;
        for(let i = 0; i < len; i++){
            out[val] = i;
            val = val + step;
        }
        return out;
    },

    _setInputVal: function(val, x, y){
        if(x !== undefined && y !== undefined)
          this._inputTensor.set(val, 0, 0, 0, x, y);
    },

    _getInput: function() {
        const x = new Float32Array(400 * 850).fill(0.5);
        return new onnx.Tensor(x, "float32", [1, 1, 1, 400, 850]);
    },

    _getQuery: function(geohash) {
        //const q = new Float32Array(13).fill(0.5);
        const lat_lng = decode_geohash(geohash);
        const q = [lat_lng.lat, lat_lng.lon, geohash.length, 1, 0.5, 0.5, 0.5, 0.5,
        0.5,  0.5,  0.5, 0.5, 0.5]
        return new onnx.Tensor(q, "float32", [1, 13]);
    },

    _roundToPrecision: function(val, round){
        r = 10^round;
        return Math.ceil(val*r) / r;
    },

    _drawStrand: function(strand, ctx, map) {
        const lat_lng = decode_geohash(strand.getGeohash());
        lat_lng.lon += 360;

        console.log(this._latLookup[lat_lng.lat],
          this._latLookup[lat_lng.lon])

        this._setInputVal(strand.getMeanList()[0], this._latLookup[lat_lng.lat],
          this._latLookup[lat_lng.lon]);
        //const center = map.latLngToContainerPoint(lat_lng);
        //ctx.fillStyle = this._rgbaToString(this._getColorForPercentage((strand.getMeanList()[0] - 250) / (330 - 250), 0.5));

        //const pixelSize = this._zoomToPixelSize[map.getZoom()];
        //ctx.clearRect(center.x, center.y, pixelSize, pixelSize);
        //ctx.fillRect(center.x, center.y, pixelSize, pixelSize);
    },

    queryTime: function(startTime, endTime, ctx, map) {
        const geohashList = [""];
        const stream = this._grpcQuerier.getStreamForQuery("noaa_2015_jan", geohashList, startTime, endTime);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        stream.on('data', function (response) {
            for (const strand of response.getStrandsList()) {
                this._drawStrand(strand, ctx, map);
            }
        }.bind(this));
        stream.on('status', function (status) {
            console.log(status.code, status.details, status.metadata);
        });
        stream.on('end', function (end) {
            this._session.run([this._inputTensor, this._getQuery("9")]).then(output => {
                let outputTensor = output.values().next().value;
                //console.log(`model output tensor: ${outputTensor.data}.`);
                console.log("model run complete")
                console.log(ctx.canvas.height, ctx.canvas.width)
                const id = ctx.createImageData(400, 850);
                id.data.set(new Uint8ClampedArray(outputTensor.data.map(function(x) { return x * 255; })));
                ctx.putImageData(id, 0, 0);
                console.log(ctx.getImageData(0, 0, 400, 850))
            });
        }.bind(this));
    },
};


sketch_rasterer = function() {
    const sketchRasterer = Sketch_Rasterer;
    sketchRasterer.initialize().then();
    return sketchRasterer;
};

try{
    module.exports = {
        sketch_rasterer: sketch_rasterer
    }
} catch(e) { }
