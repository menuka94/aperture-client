const {TargetQueryRequest, TargetQueryResponse, Expression, Predicate} = require("./targeted_query_service_pb.js")
const {TargetedQueryServiceClient} = require('./targeted_query_service_grpc_web_pb.js');

NOAAVisualization = {
    initialize: function(options) {
        var service = new TargetedQueryServiceClient("http://"+window.location.hostname+":9092")
        var request = new TargetQueryRequest()
        var temporalLower = new Predicate()
        temporalLower.setAttribute("time")
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
        service.query(request, {}, function(err, response) {
            console.log("hello")
            console.log("Result of Add : ",response.getResult())
        });
    },
    
    
}

noaa_visualization = function(options) {
    return NOAAVisualization.initialize(options);
};
