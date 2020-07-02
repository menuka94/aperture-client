const {TargetedQueryRequest, CensusResolution, Predicate, Decade, SpatialTemporalInfo, SpatialRequest} = require("./census_pb.js")
const {CensusClient} = require('./census_grpc_web_pb.js');


GRPCQuerier = {
    initialize: function () {
        this.service = new CensusClient("http://" + window.location.hostname + ":9092", "census");
    },

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

    getCensusData: function (resolution, southwest, northeast, callback, feature) {
        const request = new SpatialRequest();
        request.setCensusresolution(resolution); //tract
        request.setCensusfeature(feature); //median household income
        request.setSpatialop(1); //intersection
        request.setRequestgeojson(this._makeGeoJson(southwest, northeast));
        return this.service.spatialQuery(request, {}, callback)
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
