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
proto.census = require('./census_pb.js');

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
 *   !proto.census.TotalPopulationRequest,
 *   !proto.census.TotalPopulationResponse>}
 */
const methodDescriptor_Census_GetTotalPopulation = new grpc.web.MethodDescriptor(
  '/census.Census/GetTotalPopulation',
  grpc.web.MethodType.UNARY,
  proto.census.TotalPopulationRequest,
  proto.census.TotalPopulationResponse,
  /**
   * @param {!proto.census.TotalPopulationRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.TotalPopulationResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.census.TotalPopulationRequest,
 *   !proto.census.TotalPopulationResponse>}
 */
const methodInfo_Census_GetTotalPopulation = new grpc.web.AbstractClientBase.MethodInfo(
  proto.census.TotalPopulationResponse,
  /**
   * @param {!proto.census.TotalPopulationRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.TotalPopulationResponse.deserializeBinary
);


/**
 * @param {!proto.census.TotalPopulationRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.census.TotalPopulationResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.census.TotalPopulationResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.census.CensusClient.prototype.getTotalPopulation =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/census.Census/GetTotalPopulation',
      request,
      metadata || {},
      methodDescriptor_Census_GetTotalPopulation,
      callback);
};


/**
 * @param {!proto.census.TotalPopulationRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.census.TotalPopulationResponse>}
 *     A native promise that resolves to the response
 */
proto.census.CensusPromiseClient.prototype.getTotalPopulation =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/census.Census/GetTotalPopulation',
      request,
      metadata || {},
      methodDescriptor_Census_GetTotalPopulation);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.census.MedianAgeRequest,
 *   !proto.census.MedianAgeResponse>}
 */
const methodDescriptor_Census_GetMedianAge = new grpc.web.MethodDescriptor(
  '/census.Census/GetMedianAge',
  grpc.web.MethodType.UNARY,
  proto.census.MedianAgeRequest,
  proto.census.MedianAgeResponse,
  /**
   * @param {!proto.census.MedianAgeRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.MedianAgeResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.census.MedianAgeRequest,
 *   !proto.census.MedianAgeResponse>}
 */
const methodInfo_Census_GetMedianAge = new grpc.web.AbstractClientBase.MethodInfo(
  proto.census.MedianAgeResponse,
  /**
   * @param {!proto.census.MedianAgeRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.MedianAgeResponse.deserializeBinary
);


/**
 * @param {!proto.census.MedianAgeRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.census.MedianAgeResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.census.MedianAgeResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.census.CensusClient.prototype.getMedianAge =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/census.Census/GetMedianAge',
      request,
      metadata || {},
      methodDescriptor_Census_GetMedianAge,
      callback);
};


/**
 * @param {!proto.census.MedianAgeRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.census.MedianAgeResponse>}
 *     A native promise that resolves to the response
 */
proto.census.CensusPromiseClient.prototype.getMedianAge =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/census.Census/GetMedianAge',
      request,
      metadata || {},
      methodDescriptor_Census_GetMedianAge);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.census.MedianHouseholdIncomeRequest,
 *   !proto.census.MedianHouseholdIncomeResponse>}
 */
const methodDescriptor_Census_GetMedianHouseholdIncome = new grpc.web.MethodDescriptor(
  '/census.Census/GetMedianHouseholdIncome',
  grpc.web.MethodType.UNARY,
  proto.census.MedianHouseholdIncomeRequest,
  proto.census.MedianHouseholdIncomeResponse,
  /**
   * @param {!proto.census.MedianHouseholdIncomeRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.MedianHouseholdIncomeResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.census.MedianHouseholdIncomeRequest,
 *   !proto.census.MedianHouseholdIncomeResponse>}
 */
const methodInfo_Census_GetMedianHouseholdIncome = new grpc.web.AbstractClientBase.MethodInfo(
  proto.census.MedianHouseholdIncomeResponse,
  /**
   * @param {!proto.census.MedianHouseholdIncomeRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.MedianHouseholdIncomeResponse.deserializeBinary
);


/**
 * @param {!proto.census.MedianHouseholdIncomeRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.census.MedianHouseholdIncomeResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.census.MedianHouseholdIncomeResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.census.CensusClient.prototype.getMedianHouseholdIncome =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/census.Census/GetMedianHouseholdIncome',
      request,
      metadata || {},
      methodDescriptor_Census_GetMedianHouseholdIncome,
      callback);
};


/**
 * @param {!proto.census.MedianHouseholdIncomeRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.census.MedianHouseholdIncomeResponse>}
 *     A native promise that resolves to the response
 */
proto.census.CensusPromiseClient.prototype.getMedianHouseholdIncome =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/census.Census/GetMedianHouseholdIncome',
      request,
      metadata || {},
      methodDescriptor_Census_GetMedianHouseholdIncome);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.census.PopulationByAgeRequest,
 *   !proto.census.PopulationByAgeResponse>}
 */
const methodDescriptor_Census_GetPopulationByAge = new grpc.web.MethodDescriptor(
  '/census.Census/GetPopulationByAge',
  grpc.web.MethodType.UNARY,
  proto.census.PopulationByAgeRequest,
  proto.census.PopulationByAgeResponse,
  /**
   * @param {!proto.census.PopulationByAgeRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.PopulationByAgeResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.census.PopulationByAgeRequest,
 *   !proto.census.PopulationByAgeResponse>}
 */
const methodInfo_Census_GetPopulationByAge = new grpc.web.AbstractClientBase.MethodInfo(
  proto.census.PopulationByAgeResponse,
  /**
   * @param {!proto.census.PopulationByAgeRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.PopulationByAgeResponse.deserializeBinary
);


/**
 * @param {!proto.census.PopulationByAgeRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.census.PopulationByAgeResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.census.PopulationByAgeResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.census.CensusClient.prototype.getPopulationByAge =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/census.Census/GetPopulationByAge',
      request,
      metadata || {},
      methodDescriptor_Census_GetPopulationByAge,
      callback);
};


/**
 * @param {!proto.census.PopulationByAgeRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.census.PopulationByAgeResponse>}
 *     A native promise that resolves to the response
 */
proto.census.CensusPromiseClient.prototype.getPopulationByAge =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/census.Census/GetPopulationByAge',
      request,
      metadata || {},
      methodDescriptor_Census_GetPopulationByAge);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.census.PovertyRequest,
 *   !proto.census.PovertyResponse>}
 */
const methodDescriptor_Census_GetPoverty = new grpc.web.MethodDescriptor(
  '/census.Census/GetPoverty',
  grpc.web.MethodType.UNARY,
  proto.census.PovertyRequest,
  proto.census.PovertyResponse,
  /**
   * @param {!proto.census.PovertyRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.PovertyResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.census.PovertyRequest,
 *   !proto.census.PovertyResponse>}
 */
const methodInfo_Census_GetPoverty = new grpc.web.AbstractClientBase.MethodInfo(
  proto.census.PovertyResponse,
  /**
   * @param {!proto.census.PovertyRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.PovertyResponse.deserializeBinary
);


/**
 * @param {!proto.census.PovertyRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.census.PovertyResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.census.PovertyResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.census.CensusClient.prototype.getPoverty =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/census.Census/GetPoverty',
      request,
      metadata || {},
      methodDescriptor_Census_GetPoverty,
      callback);
};


/**
 * @param {!proto.census.PovertyRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.census.PovertyResponse>}
 *     A native promise that resolves to the response
 */
proto.census.CensusPromiseClient.prototype.getPoverty =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/census.Census/GetPoverty',
      request,
      metadata || {},
      methodDescriptor_Census_GetPoverty);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.census.RaceRequest,
 *   !proto.census.RaceResponse>}
 */
const methodDescriptor_Census_GetRace = new grpc.web.MethodDescriptor(
  '/census.Census/GetRace',
  grpc.web.MethodType.UNARY,
  proto.census.RaceRequest,
  proto.census.RaceResponse,
  /**
   * @param {!proto.census.RaceRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.RaceResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.census.RaceRequest,
 *   !proto.census.RaceResponse>}
 */
const methodInfo_Census_GetRace = new grpc.web.AbstractClientBase.MethodInfo(
  proto.census.RaceResponse,
  /**
   * @param {!proto.census.RaceRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.RaceResponse.deserializeBinary
);


/**
 * @param {!proto.census.RaceRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.census.RaceResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.census.RaceResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.census.CensusClient.prototype.getRace =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/census.Census/GetRace',
      request,
      metadata || {},
      methodDescriptor_Census_GetRace,
      callback);
};


/**
 * @param {!proto.census.RaceRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.census.RaceResponse>}
 *     A native promise that resolves to the response
 */
proto.census.CensusPromiseClient.prototype.getRace =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/census.Census/GetRace',
      request,
      metadata || {},
      methodDescriptor_Census_GetRace);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.census.SpatialRequest,
 *   !proto.census.SpatialResponse>}
 */
const methodDescriptor_Census_SpatialQuery = new grpc.web.MethodDescriptor(
  '/census.Census/SpatialQuery',
  grpc.web.MethodType.UNARY,
  proto.census.SpatialRequest,
  proto.census.SpatialResponse,
  /**
   * @param {!proto.census.SpatialRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.SpatialResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.census.SpatialRequest,
 *   !proto.census.SpatialResponse>}
 */
const methodInfo_Census_SpatialQuery = new grpc.web.AbstractClientBase.MethodInfo(
  proto.census.SpatialResponse,
  /**
   * @param {!proto.census.SpatialRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.SpatialResponse.deserializeBinary
);


/**
 * @param {!proto.census.SpatialRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.census.SpatialResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.census.SpatialResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.census.CensusClient.prototype.spatialQuery =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/census.Census/SpatialQuery',
      request,
      metadata || {},
      methodDescriptor_Census_SpatialQuery,
      callback);
};


/**
 * @param {!proto.census.SpatialRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.census.SpatialResponse>}
 *     A native promise that resolves to the response
 */
proto.census.CensusPromiseClient.prototype.spatialQuery =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/census.Census/SpatialQuery',
      request,
      metadata || {},
      methodDescriptor_Census_SpatialQuery);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.census.TargetedQueryRequest,
 *   !proto.census.TargetedQueryResponse>}
 */
const methodDescriptor_Census_ExecuteTargetedQuery = new grpc.web.MethodDescriptor(
  '/census.Census/ExecuteTargetedQuery',
  grpc.web.MethodType.UNARY,
  proto.census.TargetedQueryRequest,
  proto.census.TargetedQueryResponse,
  /**
   * @param {!proto.census.TargetedQueryRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.TargetedQueryResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.census.TargetedQueryRequest,
 *   !proto.census.TargetedQueryResponse>}
 */
const methodInfo_Census_ExecuteTargetedQuery = new grpc.web.AbstractClientBase.MethodInfo(
  proto.census.TargetedQueryResponse,
  /**
   * @param {!proto.census.TargetedQueryRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.census.TargetedQueryResponse.deserializeBinary
);


/**
 * @param {!proto.census.TargetedQueryRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.census.TargetedQueryResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.census.TargetedQueryResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.census.CensusClient.prototype.executeTargetedQuery =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/census.Census/ExecuteTargetedQuery',
      request,
      metadata || {},
      methodDescriptor_Census_ExecuteTargetedQuery,
      callback);
};


/**
 * @param {!proto.census.TargetedQueryRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.census.TargetedQueryResponse>}
 *     A native promise that resolves to the response
 */
proto.census.CensusPromiseClient.prototype.executeTargetedQuery =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/census.Census/ExecuteTargetedQuery',
      request,
      metadata || {},
      methodDescriptor_Census_ExecuteTargetedQuery);
};


module.exports = proto.census;

