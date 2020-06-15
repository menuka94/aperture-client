const {TargetedQueryRequest, CensusResolution, Predicate, Decade, SpatialTemporalInfo, TotalPopulationRequest, MedianAgeRequest, BoundingBox} = require("./census_pb.js")
const {CensusClient} = require('./census_grpc_web_pb.js');


GRPCQuerier = {
    initialize: function () {
        this.service = new CensusClient("http://" + window.location.hostname + ":9092", "census");
    },

    getResultsFromQuery: function (datasetName, geohashList, startEpochMilli, endEpochMilli) {
        const request = new MedianAgeRequest();
        const spatialTemporalInfo = new SpatialTemporalInfo();
        spatialTemporalInfo.setResolution("county");
        spatialTemporalInfo.setDecade(Decade.ten2010);
        const boundingBox = new BoundingBox();
        boundingBox.setX1(40.5); //Southwest
        boundingBox.setY1(-105.0); //Southwest
        boundingBox.setX2(41.5); //Northeast
        boundingBox.setY2(-104.0); //Northeast
        spatialTemporalInfo.setBoundingbox(boundingBox); //40.5);
        //spatialTemporalInfo.setLongitude(-80.0);
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
