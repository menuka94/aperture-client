Sketch_Rasterer = {
    initialize: async function () {
        const session = new onnx.InferenceSession({ backendHint: "webgl" });
        const url = "Dependencies/Sketch_Visualization/Deep_Learning/viz_net.onnx";
        await session.loadModel(url).then(() => {
            const input = this._getInput();
            const query = this._getQuery();

            session.run([input, query]).then(output => {
                let outputTensor = output.values().next().value;
                console.log(`model output tensor: ${outputTensor.data}.`);
            });
        });
    },

    _getInput: function() {
        const x = new Float32Array(400 * 850).fill(0.5);
        return new onnx.Tensor(x, "float32", [1, 1, 1, 400, 850]);
    },

    _getQuery: function() {
        const q = new Float32Array(13).fill(0.5);
        return new onnx.Tensor(q, "float32", [1, 13]);
    }
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