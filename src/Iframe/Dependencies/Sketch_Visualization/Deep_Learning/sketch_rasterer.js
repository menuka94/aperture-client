Sketch_Rasterer = {
    initialize: async function () {
        const session = new onnx.InferenceSession();
        const url = "Dependencies/Sketch_Visualization/Deep_Learning/viz_net.onnx";
        await session.loadModel(url);
       // const model =  await tf.loadLayersModel("Sketch_Visualization/Deep_Learning/saved_model.pb");

        //const runner = await webdnn.load('graph_descriptor');
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