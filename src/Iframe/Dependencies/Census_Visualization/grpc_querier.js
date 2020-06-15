const {TargetedQueryRequest, CensusResolution, Predicate, Decade, SpatialTemporalInfo, TotalPopulationRequest, MedianAgeRequest, BoundingBox} = require("./census_pb.js")
const {CensusClient} = require('./census_grpc_web_pb.js');


GRPCQuerier = {
    initialize: function () {
        this.service = new CensusClient("http://" + window.location.hostname + ":9092", "census");
    },

    getResultsFromQuery: function (datasetName, geohashList, startEpochMilli, endEpochMilli) {
        const spatialTemporalInfo = {
            resolution: "tract",
            boundingBox: {
                x1: 40.5,
                y1: -105.0,
                x2: 41.5,
                y2: -104.0
            },
            decade: "_2010"
        };
        const request = {spatialTemporalInfo: spatialTemporalInfo};
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
