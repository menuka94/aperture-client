/**
 * @fileoverview gRPC-Web generated client stub for 
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');

const proto = require('./streamflow_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.MetadataServiceClient =
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
proto.MetadataServicePromiseClient =
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
 *   !proto.PublishMetadataRequest,
 *   !proto.PublishMetadataResponse>}
 */
const methodDescriptor_MetadataService_PublishMetadata = new grpc.web.MethodDescriptor(
  '/MetadataService/PublishMetadata',
  grpc.web.MethodType.UNARY,
  proto.PublishMetadataRequest,
  proto.PublishMetadataResponse,
  /**
   * @param {!proto.PublishMetadataRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.PublishMetadataResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.PublishMetadataRequest,
 *   !proto.PublishMetadataResponse>}
 */
const methodInfo_MetadataService_PublishMetadata = new grpc.web.AbstractClientBase.MethodInfo(
  proto.PublishMetadataResponse,
  /**
   * @param {!proto.PublishMetadataRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.PublishMetadataResponse.deserializeBinary
);


/**
 * @param {!proto.PublishMetadataRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.PublishMetadataResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.PublishMetadataResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.MetadataServiceClient.prototype.publishMetadata =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/MetadataService/PublishMetadata',
      request,
      metadata || {},
      methodDescriptor_MetadataService_PublishMetadata,
      callback);
};


/**
 * @param {!proto.PublishMetadataRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.PublishMetadataResponse>}
 *     A native promise that resolves to the response
 */
proto.MetadataServicePromiseClient.prototype.publishMetadata =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/MetadataService/PublishMetadata',
      request,
      metadata || {},
      methodDescriptor_MetadataService_PublishMetadata);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.GetMetadataRequest,
 *   !proto.GetMetadataResponse>}
 */
const methodDescriptor_MetadataService_GetMetadata = new grpc.web.MethodDescriptor(
  '/MetadataService/GetMetadata',
  grpc.web.MethodType.UNARY,
  proto.GetMetadataRequest,
  proto.GetMetadataResponse,
  /**
   * @param {!proto.GetMetadataRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.GetMetadataResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.GetMetadataRequest,
 *   !proto.GetMetadataResponse>}
 */
const methodInfo_MetadataService_GetMetadata = new grpc.web.AbstractClientBase.MethodInfo(
  proto.GetMetadataResponse,
  /**
   * @param {!proto.GetMetadataRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.GetMetadataResponse.deserializeBinary
);


/**
 * @param {!proto.GetMetadataRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.GetMetadataResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.GetMetadataResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.MetadataServiceClient.prototype.getMetadata =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/MetadataService/GetMetadata',
      request,
      metadata || {},
      methodDescriptor_MetadataService_GetMetadata,
      callback);
};


/**
 * @param {!proto.GetMetadataRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.GetMetadataResponse>}
 *     A native promise that resolves to the response
 */
proto.MetadataServicePromiseClient.prototype.getMetadata =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/MetadataService/GetMetadata',
      request,
      metadata || {},
      methodDescriptor_MetadataService_GetMetadata);
};


module.exports = proto;

