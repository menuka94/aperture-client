const {TargetQueryRequest, TargetQueryResponse} = require("./targeted_query_service_pb.js")
const {TargetedQueryServiceClient} = require('./targeted_query_service_grpc_web_pb.js');

NOAAVisualization = {
    initialize: function(options) {
        var service = new TargetedQueryServiceClient("localhost:9092")
        var request = new TargetQueryRequest()
        request.setDataset("hello")
        service.query(request, {}, function(err, response) {
        });
    },
    
    
}

noaa_visualization = function(options) {
    return NOAAVisualization.initialize(options);
};
