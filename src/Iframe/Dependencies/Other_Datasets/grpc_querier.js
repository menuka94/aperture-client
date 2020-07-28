const { TargetedQueryRequest, CensusResolution, Predicate, Decade, SpatialTemporalInfo, SpatialRequest, OsmRequest, DatasetRequest } = require("./census_pb.js")
const { CensusClient } = require('./census_grpc_web_pb.js');

/**
 * @namespace Census_GRPCQuerier
 * @file Contains utilities for sending and recieving gRPC queries to a server containing census data
 * @author Kevin Bruhwiler, edited by Daniel Reynolds
*/

GRPCQuerier = {
  /**
    * Initializes the GRPCQuerier object
    *
    * @memberof Census_GRPCQuerier
    * @method initialize
    */
  initialize: function () {
    this.service = new CensusClient("http://" + window.location.hostname + ":9092", "census");
  },

  getOSMData: function (dataset, geojson, filter) {
    const request = new OsmRequest();
    request.setDataset(dataset);
    request.setSpatialop(1); //intersection
    request.setRequestgeojson(geojson);
    request.clearRequestparamsMap();
    let params = request.getRequestparamsMap();
    params.set('properties.' + filter.key, filter.value);
    return this.service.osmQuery(request, {});
  },

  getDatasetData: function(dataset, geojson){
    const request = new DatasetRequest();
    request.setDataset(dataset);
    request.setSpatialop(1);
    request.setRequestgeojson(geojson);
    request.clearRequestparamsMap();
    return this.service.datasetQuery(request, {});
  }
};

/**
   * Returns a GRPCQuerier object
   *
   * @method grpc_querier
   * @return {Census_GRPCQuerier}
   *         A GRPCQuerier object
   */
grpc_querier = function () {
  const grpcQuerier = GRPCQuerier;
  grpcQuerier.initialize();
  return grpcQuerier;
};

try {
  module.exports = {
    grpc_querier: grpc_querier
  }
} catch (e) { }
