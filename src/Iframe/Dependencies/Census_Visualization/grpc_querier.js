const {TargetedQueryRequest, CensusResolution, Predicate, Decade, SpatialTemporalInfo, TotalPopulationRequest, MedianAgeRequest} = require("./census_pb.js")
const {CensusClient} = require('./census_grpc_web_pb.js');


GRPCQuerier = {
    initialize: function () {
        this.service = new CensusClient("http://" + window.location.hostname + ":9092", "census");
    },

    getStreamForQuery: function (datasetName, geohashList, startEpochMilli, endEpochMilli) {
        const request = new TotalPopulationRequest();
        const spatialTemporalInfo = new SpatialTemporalInfo();
        spatialTemporalInfo.setResolution("state");
        spatialTemporalInfo.setDecade(Decade.ten2010);
        spatialTemporalInfo.setLatitude(40.5);
        spatialTemporalInfo.setLongitude(-80.0);
        request.setSpatialtemporalinfo(spatialTemporalInfo);
        return this.service.getTotalPopulation(request, {}, function(err, response) {
  if (err) {
    console.log(err.code);
    console.log(err.message);
  } else {
    console.log(response)
    console.log(response.getPopulation())
    console.log("hi");
  }
});
    },
};

grpc_querier = function() {
    const grpcQuerier = GRPCQuerier;
    grpcQuerier.initialize();
    return grpcQuerier;
};

try{
    module.exports = {
        grpc_querier: grpc_querier
    }
} catch(e) { }
