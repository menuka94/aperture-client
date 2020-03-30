const {TargetQueryRequest, TargetQueryResponse, Expression, Predicate, MatchingStrand} = require("./targeted_query_service_pb.js")
const {TargetedQueryServiceClient} = require('./targeted_query_service_grpc_web_pb.js');

NOAAVisualization = {
    initialize: function(options) {
        var service = new TargetedQueryServiceClient("http://"+window.location.hostname+":9092")
        var request = new TargetQueryRequest()
        var temporalLower = new Predicate()
        temporalLower.setComparisonop(Predicate.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO)
        temporalLower.setIntegervalue(new Date("2015-01-01T00:00:00Z").getTime())
        var temporalUpper = new Predicate()
        temporalUpper.setComparisonop(Predicate.ComparisonOperator.LESS_THAN)
        temporalUpper.setIntegervalue(new Date("2015-01-03T12:00:00Z").getTime())
        var temporal = new Expression()
        temporal.setPredicate1(temporalLower)
        temporal.setPredicate2(temporalUpper)
        temporal.setCombineop(Expression.CombineOperator.AND)
        
        var geohash = new Predicate()
        geohash.setStringvalue("9y8")
        
        request.setDataset("noaa_2015_jan")
        request.setSpatialscopeList([geohash])
        request.setTemporalscope(temporal)
        
        console.log("hi")
        var stream = service.query(request, {})
        stream.on('data', function(response) {
            console.log(response.getStrandsList());
        });
        stream.on('status', function(status) {
            console.log(status.code);
            console.log(status.details);
            console.log(status.metadata);
        });
        stream.on('end', function(end) {
            // stream end signal
        });
    },
    
    
}

noaa_visualization = function(options) {
    return NOAAVisualization.initialize(options);
};
