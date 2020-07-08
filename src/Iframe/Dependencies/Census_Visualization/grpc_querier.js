const {TargetedQueryRequest, CensusResolution, Predicate, Decade, SpatialTemporalInfo, SpatialRequest} = require("./census_pb.js")
const {CensusClient} = require('./census_grpc_web_pb.js');

/**
 * @namespace Census_GRPCQuerier
 * @file Contains utilities for sending and recieving gRPC queries to a server containing census data
 * @author Kevin Bruhwiler
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

    /**
      * Converts the bounds of a rectangle into a geojson string
      *
      * @memberof Census_GRPCQuerier
      * @method _makeGeoJson
      * @param {Object} southwest 
      *        A lat/lng object identifying the southwest corner of the bounding box
      * @param {Object} northeast 
      *        A lat/lng object identifying the northeast corner of the bounding box
      * @return {string} 
      *         A geojson string representing the bounding polygon
      */
    _makeGeoJson: function (southwest, northeast) {
      const geo = {type: "Feature", properties: {}};
      const geometry = {type: "polygon", coordinates: [[
        [southwest.lng, southwest.lat],
        [southwest.lng, northeast.lat],
        [northeast.lng, northeast.lat],
        [northeast.lng, southwest.lat],
        [southwest.lng, southwest.lat]]]
      };
      geo.geometry = geometry;
      return JSON.stringify(geo);
    },

    /**
      * Converts the bounds of a rectangle into a geojson string
      *
      * @memberof Census_GRPCQuerier
      * @function getCensusData
      * @param {Number} resolution 
      *        The resolution of the census data being queried
      * @param {Object} southwest 
      *        A lat/lng object identifying the southwest corner of the bounding box
      * @param {Object} northeast 
      *        A lat/lng object identifying the northeast corner of the bounding box
      * @param {Callback} callback 
      *        The function called on the returned data
      * @param {Number} feature 
      *        The feature being queried
      * @return {string} 
      *         A geojson string representing the bounding polygon
      */
    getCensusData: function (resolution, southwest, northeast, callback, feature) {
        const request = new SpatialRequest();
        request.setCensusresolution(resolution); //tract
        request.setCensusfeature(feature); //median household income
        request.setSpatialop(1); //intersection
        request.setRequestgeojson(this._makeGeoJson(southwest, northeast));
        return this.service.spatialQuery(request, {}, callback)
    },
};

/**
   * Returns a GRPCQuerier object
   *
   * @method grpc_querier
   * @return {Census_GRPCQuerier}
   *         A GRPCQuerier object
   */
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
