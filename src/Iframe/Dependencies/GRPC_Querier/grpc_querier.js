const {Query, CompoundRequest} = require("./sustain_pb.js")
const {SustainClient} = require('./sustain_grpc_web_pb.js');

/**
 * @namespace GRPCQuerier
 * @file Object used for performing gRPC queries
 * @author Kevin Bruhwiler
 */
GRPCQuerier = {
    /**
      * Initialize the GRPCQuerier object and service
      *
      * @memberof GRPCQuerier
      * @method initialize
      */
    initialize: function () {
        this.service = new SustainClient("http://lattice-46:50055");
        return this;
    },

    /**
      * Creates a gRPC stream for the given query
      *
      * @memberof GRPCQuerier
      * @method getStreamForQuery
      * @param {string} host
      *        The name of the machine hosting the queried dataset
      * @param {Number} port
      *        The port of the machine hosting the queried dataset
      * @param {string} collection
      *        The name of the collection being queried
      * @param {string} query
      *        A stringified mongodb query, in JSON format
      * @return {Object}
      *         The gRPC query stream
      */
    getStreamForQuery: function (host, port, collection, query) {
        const request = new CompoundRequest();
        const q = new Query();
        q.setHost(host);
        q.setPort(port);
        q.setCollection(collection);
        q.setQuery(query);
        request.setFirstQuery(q);
        return this.service.query(request, {});
    },
};

/**
  * returns a grpcQuerier object
  *
  * @function grpc_querier
  * @return {GRPCQuerier} 
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
