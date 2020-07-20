const {TargetQueryRequest, Expression, Predicate} = require("./targeted_query_service_pb.js")
const {TargetedQueryServiceClient} = require('./targeted_query_service_grpc_web_pb.js');

/**
 * @namespace Sketch_GRPCQuerier
 * @file Object used for performing gRPC queries on Synopsis data sketches
 * @author Kevin Bruhwiler
 */
GRPCQuerier = {
    /**
      * Initialized the GRPCQuerier object and service
      *
      * @memberof Sketch_GRPCQuerier
      * @method initialize
      */
    initialize: function () {
        this.service = new TargetedQueryServiceClient("http://" + window.location.hostname + ":9092");
        return this;
    },

    /**
      * Creates a temporal expression from the given start and end times
      *
      * @memberof Sketch_GRPCQuerier
      * @method _getTemporalExpresion
      * @param {Number} startEpochMilli 
      *        The start time for the temporal expression, in millisecond epoch time
      * @param {Number} endEpochMilli 
      *        The end time for the temporal expression, in millisecond epoch time
      * @return {Object} 
      *         The temporal expression object
      */
    _getTemporalExpresion: function (startEpochMilli, endEpochMilli) {
        const temporalLower = new Predicate();
        temporalLower.setComparisonop(Predicate.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO);
        temporalLower.setIntegervalue(startEpochMilli);
        const temporalUpper = new Predicate();
        temporalUpper.setComparisonop(Predicate.ComparisonOperator.LESS_THAN);
        temporalUpper.setIntegervalue(endEpochMilli);
        const temporal = new Expression();
        temporal.setPredicate1(temporalLower);
        temporal.setPredicate2(temporalUpper);
        temporal.setCombineop(Expression.CombineOperator.AND);
        return temporal
    },
    
    /**
      * Creates a spatial scope predicate from the given list of geohashes
      *
      * @memberof Sketch_GRPCQuerier
      * @method _getTemporalExpresion
      * @param {Array.<string>} geohashList 
      *        The list of geohashes being queried
      * @return {Object} 
      *         The spatial scope predicate object
      */
    _getSpatialScopePredicate: function (geohashList) {
        const geohashes = [];
        for (const geo of geohashList) {
            const geohash = new Predicate();
            geohash.setStringvalue(geo);
            geohashes.push(geohash)
        }
        return geohashes
    },

    /**
      * Creates a gRPC stream for the given query
      *
      * @memberof Sketch_GRPCQuerier
      * @method getStreamForQuery
      * @param {string} datasetName 
      *        The name of the dataset being queried
      * @param {Array.<string>} geohashList 
      *        The list of geohash locations being queried
      * @param {Number} startEpochMilli 
      *        The start time for the query, in millisecond epoch time
      * @param {Number} endEpochMilli 
      *        The end time for the query, in millisecond epoch time
      * @return {Object} 
      *         The gRPC query stream
      */
    getStreamForQuery: function (datasetName, geohashList, startEpochMilli, endEpochMilli) {
        const request = new TargetQueryRequest();
        const temporal = this._getTemporalExpresion(startEpochMilli, endEpochMilli);
        const geohashes = this._getSpatialScopePredicate(geohashList);
        request.setDataset(datasetName);
        request.setSpatialscopeList(geohashes);
        request.setTemporalscope(temporal);
        return this.service.query(request, {});
    },
};

/**
  * returns a grpcQuerier object
  *
  * @function grpc_querier
  * @return {Sketch_GRPCQuerier} 
  *         The grpcQuerier object
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
