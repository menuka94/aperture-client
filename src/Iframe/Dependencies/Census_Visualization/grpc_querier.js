const {TargetedQueryRequest, CensusResolution, Predicate, Decade, SpatialTemporalInfo, TotalPopulationRequest,
  MedianAgeRequest, BoundingBox, SingleCoordinate, MedianHouseholdIncomeRequest,
  PovertyRequest} = require("./census_pb.js")
const {CensusClient} = require('./census_grpc_web_pb.js');


GRPCQuerier = {
    initialize: function () {
        this.service = new CensusClient("http://" + window.location.hostname + ":9092", "census");
    },

    _getQueryType: function(queryType){
      if (queryType === "totalPopulation"){
        return new TotalPopulationRequest();
      } else if (queryType === "medianAge"){
        return new MedianAgeRequest();
      } else if (queryType === "medianHouseholdIncome"){
        return new MedianHouseholdIncomeRequest();
      } else if (queryType === "poverty"){
        return new PovertyRequest();
      } else if (queryType === "race"){
        return new RaceRequest();
      }
    },

    getCensusData: function (resolution, southwest, northeast, decade, callback, queryType) {
        const request = this._getQueryType(queryType);
        const spatialTemporalInfo = new SpatialTemporalInfo();
        spatialTemporalInfo.setResolution(resolution);
        if (decade === "2010"){
            spatialTemporalInfo.setDecade(Decade.ten2010);
        } else if (decade === "2000") {
            spatialTemporalInfo.setDecade(Decade.zero2000);
        } else if (decade === "1990"){
            spatialTemporalInfo.setDecade(Decade.nineteen1990);
        } else if (decade === "1980"){
            spatialTemporalInfo.setDecade(Decade.nineen1980);
        }
        const boundingBox = new BoundingBox();
        boundingBox.setX1(southwest[0]); //Southwest
        boundingBox.setY1(southwest[1]); //Southwest
        boundingBox.setX2(northeast[0]); //Northeast
        boundingBox.setY2(northeast[1]); //Northeast
        spatialTemporalInfo.setBoundingbox(boundingBox);
        request.setSpatialtemporalinfo(spatialTemporalInfo);
        if (queryType === "totalPopulation"){
          return this.service.getTotalPopulation(request, {}, callback);;
        } else if (queryType === "medianAge"){
          return this.service.getMedianAge(request, {}, callback);;
        } else if (queryType === "medianHouseholdIncome"){
          return this.service.getMedianHouseholdIncome(request, {}, callback);;
        } else if (queryType === "poverty"){
          return this.service.getPoverty(request, {}, callback);;
        } else if (queryType === "race"){
          return this.service.getRace(request, {}, callback);;
        }
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
