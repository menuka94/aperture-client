/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

var ProtoBuffSerializedStrand_pb = require('./ProtoBuffSerializedStrand_pb.js');
goog.exportSymbol('proto.Expression', null, global);
goog.exportSymbol('proto.Expression.CombineOperator', null, global);
goog.exportSymbol('proto.Predicate', null, global);
goog.exportSymbol('proto.Predicate.ComparisonOperator', null, global);
goog.exportSymbol('proto.TargetQueryRequest', null, global);
goog.exportSymbol('proto.TargetQueryResponse', null, global);

/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.TargetQueryRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.TargetQueryRequest.repeatedFields_, null);
};
goog.inherits(proto.TargetQueryRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.TargetQueryRequest.displayName = 'proto.TargetQueryRequest';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.TargetQueryRequest.repeatedFields_ = [2,4,5];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.TargetQueryRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.TargetQueryRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.TargetQueryRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.TargetQueryRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    dataset: jspb.Message.getFieldWithDefault(msg, 1, ""),
    spatialscopeList: jspb.Message.toObjectList(msg.getSpatialscopeList(),
    proto.Predicate.toObject, includeInstance),
    temporalscope: (f = msg.getTemporalscope()) && proto.Expression.toObject(includeInstance, f),
    featurepredicatesList: jspb.Message.toObjectList(msg.getFeaturepredicatesList(),
    proto.Expression.toObject, includeInstance),
    metadatapredicatesList: jspb.Message.toObjectList(msg.getMetadatapredicatesList(),
    proto.Expression.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.TargetQueryRequest}
 */
proto.TargetQueryRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.TargetQueryRequest;
  return proto.TargetQueryRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.TargetQueryRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.TargetQueryRequest}
 */
proto.TargetQueryRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setDataset(value);
      break;
    case 2:
      var value = new proto.Predicate;
      reader.readMessage(value,proto.Predicate.deserializeBinaryFromReader);
      msg.addSpatialscope(value);
      break;
    case 3:
      var value = new proto.Expression;
      reader.readMessage(value,proto.Expression.deserializeBinaryFromReader);
      msg.setTemporalscope(value);
      break;
    case 4:
      var value = new proto.Expression;
      reader.readMessage(value,proto.Expression.deserializeBinaryFromReader);
      msg.addFeaturepredicates(value);
      break;
    case 5:
      var value = new proto.Expression;
      reader.readMessage(value,proto.Expression.deserializeBinaryFromReader);
      msg.addMetadatapredicates(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.TargetQueryRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.TargetQueryRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.TargetQueryRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.TargetQueryRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDataset();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getSpatialscopeList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.Predicate.serializeBinaryToWriter
    );
  }
  f = message.getTemporalscope();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.Expression.serializeBinaryToWriter
    );
  }
  f = message.getFeaturepredicatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      proto.Expression.serializeBinaryToWriter
    );
  }
  f = message.getMetadatapredicatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      5,
      f,
      proto.Expression.serializeBinaryToWriter
    );
  }
};


/**
 * optional string dataset = 1;
 * @return {string}
 */
proto.TargetQueryRequest.prototype.getDataset = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.TargetQueryRequest.prototype.setDataset = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * repeated Predicate spatialScope = 2;
 * @return {!Array<!proto.Predicate>}
 */
proto.TargetQueryRequest.prototype.getSpatialscopeList = function() {
  return /** @type{!Array<!proto.Predicate>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.Predicate, 2));
};


/** @param {!Array<!proto.Predicate>} value */
proto.TargetQueryRequest.prototype.setSpatialscopeList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.Predicate=} opt_value
 * @param {number=} opt_index
 * @return {!proto.Predicate}
 */
proto.TargetQueryRequest.prototype.addSpatialscope = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.Predicate, opt_index);
};


proto.TargetQueryRequest.prototype.clearSpatialscopeList = function() {
  this.setSpatialscopeList([]);
};


/**
 * optional Expression temporalScope = 3;
 * @return {?proto.Expression}
 */
proto.TargetQueryRequest.prototype.getTemporalscope = function() {
  return /** @type{?proto.Expression} */ (
    jspb.Message.getWrapperField(this, proto.Expression, 3));
};


/** @param {?proto.Expression|undefined} value */
proto.TargetQueryRequest.prototype.setTemporalscope = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.TargetQueryRequest.prototype.clearTemporalscope = function() {
  this.setTemporalscope(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.TargetQueryRequest.prototype.hasTemporalscope = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * repeated Expression featurePredicates = 4;
 * @return {!Array<!proto.Expression>}
 */
proto.TargetQueryRequest.prototype.getFeaturepredicatesList = function() {
  return /** @type{!Array<!proto.Expression>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.Expression, 4));
};


/** @param {!Array<!proto.Expression>} value */
proto.TargetQueryRequest.prototype.setFeaturepredicatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.Expression=} opt_value
 * @param {number=} opt_index
 * @return {!proto.Expression}
 */
proto.TargetQueryRequest.prototype.addFeaturepredicates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.Expression, opt_index);
};


proto.TargetQueryRequest.prototype.clearFeaturepredicatesList = function() {
  this.setFeaturepredicatesList([]);
};


/**
 * repeated Expression metadataPredicates = 5;
 * @return {!Array<!proto.Expression>}
 */
proto.TargetQueryRequest.prototype.getMetadatapredicatesList = function() {
  return /** @type{!Array<!proto.Expression>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.Expression, 5));
};


/** @param {!Array<!proto.Expression>} value */
proto.TargetQueryRequest.prototype.setMetadatapredicatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 5, value);
};


/**
 * @param {!proto.Expression=} opt_value
 * @param {number=} opt_index
 * @return {!proto.Expression}
 */
proto.TargetQueryRequest.prototype.addMetadatapredicates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.Expression, opt_index);
};


proto.TargetQueryRequest.prototype.clearMetadatapredicatesList = function() {
  this.setMetadatapredicatesList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.TargetQueryResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.TargetQueryResponse.repeatedFields_, null);
};
goog.inherits(proto.TargetQueryResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.TargetQueryResponse.displayName = 'proto.TargetQueryResponse';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.TargetQueryResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.TargetQueryResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.TargetQueryResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.TargetQueryResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.TargetQueryResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    strandsList: jspb.Message.toObjectList(msg.getStrandsList(),
    ProtoBuffSerializedStrand_pb.ProtoBuffSerializedStrand.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.TargetQueryResponse}
 */
proto.TargetQueryResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.TargetQueryResponse;
  return proto.TargetQueryResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.TargetQueryResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.TargetQueryResponse}
 */
proto.TargetQueryResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new ProtoBuffSerializedStrand_pb.ProtoBuffSerializedStrand;
      reader.readMessage(value,ProtoBuffSerializedStrand_pb.ProtoBuffSerializedStrand.deserializeBinaryFromReader);
      msg.addStrands(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.TargetQueryResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.TargetQueryResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.TargetQueryResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.TargetQueryResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getStrandsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      ProtoBuffSerializedStrand_pb.ProtoBuffSerializedStrand.serializeBinaryToWriter
    );
  }
};


/**
 * repeated ProtoBuffSerializedStrand strands = 1;
 * @return {!Array<!proto.ProtoBuffSerializedStrand>}
 */
proto.TargetQueryResponse.prototype.getStrandsList = function() {
  return /** @type{!Array<!proto.ProtoBuffSerializedStrand>} */ (
    jspb.Message.getRepeatedWrapperField(this, ProtoBuffSerializedStrand_pb.ProtoBuffSerializedStrand, 1));
};


/** @param {!Array<!proto.ProtoBuffSerializedStrand>} value */
proto.TargetQueryResponse.prototype.setStrandsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.ProtoBuffSerializedStrand=} opt_value
 * @param {number=} opt_index
 * @return {!proto.ProtoBuffSerializedStrand}
 */
proto.TargetQueryResponse.prototype.addStrands = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.ProtoBuffSerializedStrand, opt_index);
};


proto.TargetQueryResponse.prototype.clearStrandsList = function() {
  this.setStrandsList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.Expression = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.Expression.oneofGroups_);
};
goog.inherits(proto.Expression, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.Expression.displayName = 'proto.Expression';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.Expression.oneofGroups_ = [[1,2],[4,5]];

/**
 * @enum {number}
 */
proto.Expression.FirstCase = {
  FIRST_NOT_SET: 0,
  EXPRESSION1: 1,
  PREDICATE1: 2
};

/**
 * @return {proto.Expression.FirstCase}
 */
proto.Expression.prototype.getFirstCase = function() {
  return /** @type {proto.Expression.FirstCase} */(jspb.Message.computeOneofCase(this, proto.Expression.oneofGroups_[0]));
};

/**
 * @enum {number}
 */
proto.Expression.SecondCase = {
  SECOND_NOT_SET: 0,
  EXPRESSION2: 4,
  PREDICATE2: 5
};

/**
 * @return {proto.Expression.SecondCase}
 */
proto.Expression.prototype.getSecondCase = function() {
  return /** @type {proto.Expression.SecondCase} */(jspb.Message.computeOneofCase(this, proto.Expression.oneofGroups_[1]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.Expression.prototype.toObject = function(opt_includeInstance) {
  return proto.Expression.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.Expression} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.Expression.toObject = function(includeInstance, msg) {
  var f, obj = {
    expression1: (f = msg.getExpression1()) && proto.Expression.toObject(includeInstance, f),
    predicate1: (f = msg.getPredicate1()) && proto.Predicate.toObject(includeInstance, f),
    combineop: jspb.Message.getFieldWithDefault(msg, 3, 0),
    expression2: (f = msg.getExpression2()) && proto.Expression.toObject(includeInstance, f),
    predicate2: (f = msg.getPredicate2()) && proto.Predicate.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.Expression}
 */
proto.Expression.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.Expression;
  return proto.Expression.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.Expression} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.Expression}
 */
proto.Expression.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.Expression;
      reader.readMessage(value,proto.Expression.deserializeBinaryFromReader);
      msg.setExpression1(value);
      break;
    case 2:
      var value = new proto.Predicate;
      reader.readMessage(value,proto.Predicate.deserializeBinaryFromReader);
      msg.setPredicate1(value);
      break;
    case 3:
      var value = /** @type {!proto.Expression.CombineOperator} */ (reader.readEnum());
      msg.setCombineop(value);
      break;
    case 4:
      var value = new proto.Expression;
      reader.readMessage(value,proto.Expression.deserializeBinaryFromReader);
      msg.setExpression2(value);
      break;
    case 5:
      var value = new proto.Predicate;
      reader.readMessage(value,proto.Predicate.deserializeBinaryFromReader);
      msg.setPredicate2(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.Expression.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.Expression.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.Expression} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.Expression.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getExpression1();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.Expression.serializeBinaryToWriter
    );
  }
  f = message.getPredicate1();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.Predicate.serializeBinaryToWriter
    );
  }
  f = message.getCombineop();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getExpression2();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.Expression.serializeBinaryToWriter
    );
  }
  f = message.getPredicate2();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.Predicate.serializeBinaryToWriter
    );
  }
};


/**
 * @enum {number}
 */
proto.Expression.CombineOperator = {
  AND: 0,
  OR: 1,
  DIFF: 2
};

/**
 * optional Expression expression1 = 1;
 * @return {?proto.Expression}
 */
proto.Expression.prototype.getExpression1 = function() {
  return /** @type{?proto.Expression} */ (
    jspb.Message.getWrapperField(this, proto.Expression, 1));
};


/** @param {?proto.Expression|undefined} value */
proto.Expression.prototype.setExpression1 = function(value) {
  jspb.Message.setOneofWrapperField(this, 1, proto.Expression.oneofGroups_[0], value);
};


proto.Expression.prototype.clearExpression1 = function() {
  this.setExpression1(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.Expression.prototype.hasExpression1 = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional Predicate predicate1 = 2;
 * @return {?proto.Predicate}
 */
proto.Expression.prototype.getPredicate1 = function() {
  return /** @type{?proto.Predicate} */ (
    jspb.Message.getWrapperField(this, proto.Predicate, 2));
};


/** @param {?proto.Predicate|undefined} value */
proto.Expression.prototype.setPredicate1 = function(value) {
  jspb.Message.setOneofWrapperField(this, 2, proto.Expression.oneofGroups_[0], value);
};


proto.Expression.prototype.clearPredicate1 = function() {
  this.setPredicate1(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.Expression.prototype.hasPredicate1 = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional CombineOperator combineOp = 3;
 * @return {!proto.Expression.CombineOperator}
 */
proto.Expression.prototype.getCombineop = function() {
  return /** @type {!proto.Expression.CombineOperator} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {!proto.Expression.CombineOperator} value */
proto.Expression.prototype.setCombineop = function(value) {
  jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * optional Expression expression2 = 4;
 * @return {?proto.Expression}
 */
proto.Expression.prototype.getExpression2 = function() {
  return /** @type{?proto.Expression} */ (
    jspb.Message.getWrapperField(this, proto.Expression, 4));
};


/** @param {?proto.Expression|undefined} value */
proto.Expression.prototype.setExpression2 = function(value) {
  jspb.Message.setOneofWrapperField(this, 4, proto.Expression.oneofGroups_[1], value);
};


proto.Expression.prototype.clearExpression2 = function() {
  this.setExpression2(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.Expression.prototype.hasExpression2 = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional Predicate predicate2 = 5;
 * @return {?proto.Predicate}
 */
proto.Expression.prototype.getPredicate2 = function() {
  return /** @type{?proto.Predicate} */ (
    jspb.Message.getWrapperField(this, proto.Predicate, 5));
};


/** @param {?proto.Predicate|undefined} value */
proto.Expression.prototype.setPredicate2 = function(value) {
  jspb.Message.setOneofWrapperField(this, 5, proto.Expression.oneofGroups_[1], value);
};


proto.Expression.prototype.clearPredicate2 = function() {
  this.setPredicate2(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.Expression.prototype.hasPredicate2 = function() {
  return jspb.Message.getField(this, 5) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.Predicate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.Predicate.oneofGroups_);
};
goog.inherits(proto.Predicate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.Predicate.displayName = 'proto.Predicate';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.Predicate.oneofGroups_ = [[3,4,5]];

/**
 * @enum {number}
 */
proto.Predicate.ValueCase = {
  VALUE_NOT_SET: 0,
  STRINGVALUE: 3,
  INTEGERVALUE: 4,
  DOUBLEVALUE: 5
};

/**
 * @return {proto.Predicate.ValueCase}
 */
proto.Predicate.prototype.getValueCase = function() {
  return /** @type {proto.Predicate.ValueCase} */(jspb.Message.computeOneofCase(this, proto.Predicate.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.Predicate.prototype.toObject = function(opt_includeInstance) {
  return proto.Predicate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.Predicate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.Predicate.toObject = function(includeInstance, msg) {
  var f, obj = {
    attribute: jspb.Message.getFieldWithDefault(msg, 1, ""),
    comparisonop: jspb.Message.getFieldWithDefault(msg, 2, 0),
    stringvalue: jspb.Message.getFieldWithDefault(msg, 3, ""),
    integervalue: jspb.Message.getFieldWithDefault(msg, 4, 0),
    doublevalue: +jspb.Message.getFieldWithDefault(msg, 5, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.Predicate}
 */
proto.Predicate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.Predicate;
  return proto.Predicate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.Predicate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.Predicate}
 */
proto.Predicate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setAttribute(value);
      break;
    case 2:
      var value = /** @type {!proto.Predicate.ComparisonOperator} */ (reader.readEnum());
      msg.setComparisonop(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setStringvalue(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readSint64());
      msg.setIntegervalue(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setDoublevalue(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.Predicate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.Predicate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.Predicate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.Predicate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAttribute();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getComparisonop();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeString(
      3,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeSint64(
      4,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeDouble(
      5,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.Predicate.ComparisonOperator = {
  EQUAL: 0,
  GREATER_THAN: 1,
  LESS_THAN: 2,
  GREATER_THAN_OR_EQUAL: 3,
  LESS_THAN_OR_EQUAL: 4
};

/**
 * optional string attribute = 1;
 * @return {string}
 */
proto.Predicate.prototype.getAttribute = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.Predicate.prototype.setAttribute = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional ComparisonOperator comparisonOp = 2;
 * @return {!proto.Predicate.ComparisonOperator}
 */
proto.Predicate.prototype.getComparisonop = function() {
  return /** @type {!proto.Predicate.ComparisonOperator} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {!proto.Predicate.ComparisonOperator} value */
proto.Predicate.prototype.setComparisonop = function(value) {
  jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional string stringValue = 3;
 * @return {string}
 */
proto.Predicate.prototype.getStringvalue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.Predicate.prototype.setStringvalue = function(value) {
  jspb.Message.setOneofField(this, 3, proto.Predicate.oneofGroups_[0], value);
};


proto.Predicate.prototype.clearStringvalue = function() {
  jspb.Message.setOneofField(this, 3, proto.Predicate.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.Predicate.prototype.hasStringvalue = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional sint64 integerValue = 4;
 * @return {number}
 */
proto.Predicate.prototype.getIntegervalue = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.Predicate.prototype.setIntegervalue = function(value) {
  jspb.Message.setOneofField(this, 4, proto.Predicate.oneofGroups_[0], value);
};


proto.Predicate.prototype.clearIntegervalue = function() {
  jspb.Message.setOneofField(this, 4, proto.Predicate.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.Predicate.prototype.hasIntegervalue = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional double doubleValue = 5;
 * @return {number}
 */
proto.Predicate.prototype.getDoublevalue = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 5, 0.0));
};


/** @param {number} value */
proto.Predicate.prototype.setDoublevalue = function(value) {
  jspb.Message.setOneofField(this, 5, proto.Predicate.oneofGroups_[0], value);
};


proto.Predicate.prototype.clearDoublevalue = function() {
  jspb.Message.setOneofField(this, 5, proto.Predicate.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.Predicate.prototype.hasDoublevalue = function() {
  return jspb.Message.getField(this, 5) != null;
};


goog.object.extend(exports, proto);
