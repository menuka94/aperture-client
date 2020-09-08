/**
 * @fileoverview gRPC-Web generated client stub for census
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.census = require('./sustain_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.census.CensusClient =
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
proto.census.CensusPromiseClient =
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
 *   !proto.census.CensusRequest,
 *   !proto.census.CensusResponse>}
 */
const methodDescriptor_Census_CensusQuery = new grpc.web.MethodDescriptor(
  '/census.Census/CensusQuery',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.census.CensusRequest,
  proto.census.CensusResponse,
  /**
   * @param {!proto.census.CensusRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.CensusResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.census.CensusRequest,
 *   !proto.census.CensusResponse>}
 */
const methodInfo_Census_CensusQuery = new grpc.web.AbstractClientBase.MethodInfo(
  proto.census.CensusResponse,
  /**
   * @param {!proto.census.CensusRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.CensusResponse.deserializeBinary
);


/**
 * @param {!proto.census.CensusRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.census.CensusResponse>}
 *     The XHR Node Readable Stream
 */
proto.census.CensusClient.prototype.censusQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/census.Census/CensusQuery',
      request,
      metadata || {},
      methodDescriptor_Census_CensusQuery);
};


/**
 * @param {!proto.census.CensusRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.census.CensusResponse>}
 *     The XHR Node Readable Stream
 */
proto.census.CensusPromiseClient.prototype.censusQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/census.Census/CensusQuery',
      request,
      metadata || {},
      methodDescriptor_Census_CensusQuery);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.census.OsmRequest,
 *   !proto.census.OsmResponse>}
 */
const methodDescriptor_Census_OsmQuery = new grpc.web.MethodDescriptor(
  '/census.Census/OsmQuery',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.census.OsmRequest,
  proto.census.OsmResponse,
  /**
   * @param {!proto.census.OsmRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.OsmResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.census.OsmRequest,
 *   !proto.census.OsmResponse>}
 */
const methodInfo_Census_OsmQuery = new grpc.web.AbstractClientBase.MethodInfo(
  proto.census.OsmResponse,
  /**
   * @param {!proto.census.OsmRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.OsmResponse.deserializeBinary
);


/**
 * @param {!proto.census.OsmRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.census.OsmResponse>}
 *     The XHR Node Readable Stream
 */
proto.census.CensusClient.prototype.osmQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/census.Census/OsmQuery',
      request,
      metadata || {},
      methodDescriptor_Census_OsmQuery);
};


/**
 * @param {!proto.census.OsmRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.census.OsmResponse>}
 *     The XHR Node Readable Stream
 */
proto.census.CensusPromiseClient.prototype.osmQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/census.Census/OsmQuery',
      request,
      metadata || {},
      methodDescriptor_Census_OsmQuery);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.census.DatasetRequest,
 *   !proto.census.DatasetResponse>}
 */
const methodDescriptor_Census_DatasetQuery = new grpc.web.MethodDescriptor(
  '/census.Census/DatasetQuery',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.census.DatasetRequest,
  proto.census.DatasetResponse,
  /**
   * @param {!proto.census.DatasetRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.DatasetResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.census.DatasetRequest,
 *   !proto.census.DatasetResponse>}
 */
const methodInfo_Census_DatasetQuery = new grpc.web.AbstractClientBase.MethodInfo(
  proto.census.DatasetResponse,
  /**
   * @param {!proto.census.DatasetRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.DatasetResponse.deserializeBinary
);


/**
 * @param {!proto.census.DatasetRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.census.DatasetResponse>}
 *     The XHR Node Readable Stream
 */
proto.census.CensusClient.prototype.datasetQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/census.Census/DatasetQuery',
      request,
      metadata || {},
      methodDescriptor_Census_DatasetQuery);
};


/**
 * @param {!proto.census.DatasetRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.census.DatasetResponse>}
 *     The XHR Node Readable Stream
 */
proto.census.CensusPromiseClient.prototype.datasetQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/census.Census/DatasetQuery',
      request,
      metadata || {},
      methodDescriptor_Census_DatasetQuery);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.census.TargetedCensusRequest,
 *   !proto.census.TargetedCensusResponse>}
 */
const methodDescriptor_Census_ExecuteTargetedCensusQuery = new grpc.web.MethodDescriptor(
  '/census.Census/ExecuteTargetedCensusQuery',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.census.TargetedCensusRequest,
  proto.census.TargetedCensusResponse,
  /**
   * @param {!proto.census.TargetedCensusRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.TargetedCensusResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.census.TargetedCensusRequest,
 *   !proto.census.TargetedCensusResponse>}
 */
const methodInfo_Census_ExecuteTargetedCensusQuery = new grpc.web.AbstractClientBase.MethodInfo(
  proto.census.TargetedCensusResponse,
  /**
   * @param {!proto.census.TargetedCensusRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.TargetedCensusResponse.deserializeBinary
);


/**
 * @param {!proto.census.TargetedCensusRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.census.TargetedCensusResponse>}
 *     The XHR Node Readable Stream
 */
proto.census.CensusClient.prototype.executeTargetedCensusQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/census.Census/ExecuteTargetedCensusQuery',
      request,
      metadata || {},
      methodDescriptor_Census_ExecuteTargetedCensusQuery);
};


/**
 * @param {!proto.census.TargetedCensusRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.census.TargetedCensusResponse>}
 *     The XHR Node Readable Stream
 */
proto.census.CensusPromiseClient.prototype.executeTargetedCensusQuery =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/census.Census/ExecuteTargetedCensusQuery',
      request,
      metadata || {},
      methodDescriptor_Census_ExecuteTargetedCensusQuery);
};


module.exports = proto.census;

