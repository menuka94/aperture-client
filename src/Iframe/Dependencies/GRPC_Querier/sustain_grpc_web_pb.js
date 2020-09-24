/**
 * @fileoverview gRPC-Web generated client stub for 
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!



const grpc = {};
grpc.web = require('grpc-web');

const proto = require('./sustain_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.SustainClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.SustainPromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.CensusRequest,
 *   !proto.CensusResponse>}
 */
const methodDescriptor_Sustain_CensusQuery = new grpc.web.MethodDescriptor(
  '/Sustain/CensusQuery',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.CensusRequest,
  proto.CensusResponse,
  /**
   * @param {!proto.CensusRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.CensusResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.CensusRequest,
 *   !proto.CensusResponse>}
 */
const methodInfo_Sustain_CensusQuery = new grpc.web.AbstractClientBase.MethodInfo(
  proto.CensusResponse,
  /**
   * @param {!proto.CensusRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.CensusResponse.deserializeBinary
);


/**
 * @param {!proto.CensusRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.CensusResponse>}
 *     The XHR Node Readable Stream
 */
proto.SustainClient.prototype.censusQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Sustain/CensusQuery',
      request,
      metadata || {},
      methodDescriptor_Sustain_CensusQuery);
};


/**
 * @param {!proto.CensusRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.CensusResponse>}
 *     The XHR Node Readable Stream
 */
proto.SustainPromiseClient.prototype.censusQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Sustain/CensusQuery',
      request,
      metadata || {},
      methodDescriptor_Sustain_CensusQuery);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.OsmRequest,
 *   !proto.OsmResponse>}
 */
const methodDescriptor_Sustain_OsmQuery = new grpc.web.MethodDescriptor(
  '/Sustain/OsmQuery',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.OsmRequest,
  proto.OsmResponse,
  /**
   * @param {!proto.OsmRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.OsmResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.OsmRequest,
 *   !proto.OsmResponse>}
 */
const methodInfo_Sustain_OsmQuery = new grpc.web.AbstractClientBase.MethodInfo(
  proto.OsmResponse,
  /**
   * @param {!proto.OsmRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.OsmResponse.deserializeBinary
);


/**
 * @param {!proto.OsmRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.OsmResponse>}
 *     The XHR Node Readable Stream
 */
proto.SustainClient.prototype.osmQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Sustain/OsmQuery',
      request,
      metadata || {},
      methodDescriptor_Sustain_OsmQuery);
};


/**
 * @param {!proto.OsmRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.OsmResponse>}
 *     The XHR Node Readable Stream
 */
proto.SustainPromiseClient.prototype.osmQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Sustain/OsmQuery',
      request,
      metadata || {},
      methodDescriptor_Sustain_OsmQuery);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.DatasetRequest,
 *   !proto.DatasetResponse>}
 */
const methodDescriptor_Sustain_DatasetQuery = new grpc.web.MethodDescriptor(
  '/Sustain/DatasetQuery',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.DatasetRequest,
  proto.DatasetResponse,
  /**
   * @param {!proto.DatasetRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.DatasetResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.DatasetRequest,
 *   !proto.DatasetResponse>}
 */
const methodInfo_Sustain_DatasetQuery = new grpc.web.AbstractClientBase.MethodInfo(
  proto.DatasetResponse,
  /**
   * @param {!proto.DatasetRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.DatasetResponse.deserializeBinary
);


/**
 * @param {!proto.DatasetRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.DatasetResponse>}
 *     The XHR Node Readable Stream
 */
proto.SustainClient.prototype.datasetQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Sustain/DatasetQuery',
      request,
      metadata || {},
      methodDescriptor_Sustain_DatasetQuery);
};


/**
 * @param {!proto.DatasetRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.DatasetResponse>}
 *     The XHR Node Readable Stream
 */
proto.SustainPromiseClient.prototype.datasetQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Sustain/DatasetQuery',
      request,
      metadata || {},
      methodDescriptor_Sustain_DatasetQuery);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.SVIRequest,
 *   !proto.SVIResponse>}
 */
const methodDescriptor_Sustain_SVIQuery = new grpc.web.MethodDescriptor(
  '/Sustain/SVIQuery',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.SVIRequest,
  proto.SVIResponse,
  /**
   * @param {!proto.SVIRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.SVIResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.SVIRequest,
 *   !proto.SVIResponse>}
 */
const methodInfo_Sustain_SVIQuery = new grpc.web.AbstractClientBase.MethodInfo(
  proto.SVIResponse,
  /**
   * @param {!proto.SVIRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.SVIResponse.deserializeBinary
);


/**
 * @param {!proto.SVIRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.SVIResponse>}
 *     The XHR Node Readable Stream
 */
proto.SustainClient.prototype.sVIQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Sustain/SVIQuery',
      request,
      metadata || {},
      methodDescriptor_Sustain_SVIQuery);
};


/**
 * @param {!proto.SVIRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.SVIResponse>}
 *     The XHR Node Readable Stream
 */
proto.SustainPromiseClient.prototype.sVIQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Sustain/SVIQuery',
      request,
      metadata || {},
      methodDescriptor_Sustain_SVIQuery);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.TargetedCensusRequest,
 *   !proto.TargetedCensusResponse>}
 */
const methodDescriptor_Sustain_ExecuteTargetedCensusQuery = new grpc.web.MethodDescriptor(
  '/Sustain/ExecuteTargetedCensusQuery',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.TargetedCensusRequest,
  proto.TargetedCensusResponse,
  /**
   * @param {!proto.TargetedCensusRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.TargetedCensusResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.TargetedCensusRequest,
 *   !proto.TargetedCensusResponse>}
 */
const methodInfo_Sustain_ExecuteTargetedCensusQuery = new grpc.web.AbstractClientBase.MethodInfo(
  proto.TargetedCensusResponse,
  /**
   * @param {!proto.TargetedCensusRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.TargetedCensusResponse.deserializeBinary
);


/**
 * @param {!proto.TargetedCensusRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.TargetedCensusResponse>}
 *     The XHR Node Readable Stream
 */
proto.SustainClient.prototype.executeTargetedCensusQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Sustain/ExecuteTargetedCensusQuery',
      request,
      metadata || {},
      methodDescriptor_Sustain_ExecuteTargetedCensusQuery);
};


/**
 * @param {!proto.TargetedCensusRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.TargetedCensusResponse>}
 *     The XHR Node Readable Stream
 */
proto.SustainPromiseClient.prototype.executeTargetedCensusQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Sustain/ExecuteTargetedCensusQuery',
      request,
      metadata || {},
      methodDescriptor_Sustain_ExecuteTargetedCensusQuery);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.CompoundRequest,
 *   !proto.CompoundResponse>}
 */
const methodDescriptor_Sustain_CompoundQuery = new grpc.web.MethodDescriptor(
  '/Sustain/CompoundQuery',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.CompoundRequest,
  proto.CompoundResponse,
  /**
   * @param {!proto.CompoundRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.CompoundResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.CompoundRequest,
 *   !proto.CompoundResponse>}
 */
const methodInfo_Sustain_CompoundQuery = new grpc.web.AbstractClientBase.MethodInfo(
  proto.CompoundResponse,
  /**
   * @param {!proto.CompoundRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.CompoundResponse.deserializeBinary
);


/**
 * @param {!proto.CompoundRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.CompoundResponse>}
 *     The XHR Node Readable Stream
 */
proto.SustainClient.prototype.compoundQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Sustain/CompoundQuery',
      request,
      metadata || {},
      methodDescriptor_Sustain_CompoundQuery);
};


/**
 * @param {!proto.CompoundRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.CompoundResponse>}
 *     The XHR Node Readable Stream
 */
proto.SustainPromiseClient.prototype.compoundQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Sustain/CompoundQuery',
      request,
      metadata || {},
      methodDescriptor_Sustain_CompoundQuery);
};


module.exports = proto;

