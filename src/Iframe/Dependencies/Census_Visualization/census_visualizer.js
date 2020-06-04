Census_Visualizer = {
    initialize: function() {
        this._grpcQuerier = grpc_querier();
        this._stream = undefined;
        this.queryTime(0,0,0)
    },

    queryTime: function(startTime, endTime, map) {
        if (this._stream)
            this._stream.cancel();

        let stream = this._grpcQuerier.getStreamForQuery("noaa_2015_jan", [], startTime, endTime);

      //  stream.on('data', function (response) {
      //    console.log("hi")
      //  }.bind(this));
        //stream.on('status', function (status) {
      //      console.log(status.code, status.details, status.metadata);
    //    });
        //stream.on('end', function (end) {
        //  console.log("hi")
      //  }.bind(this));

        this._stream = stream;
    },
};

census_visualizer = function() {
    const censusVisualizer = Census_Visualizer;
    censusVisualizer.initialize();
    return censusVisualizer;
};

try{
    module.exports = {
        census_visualizer: census_visualizer
    }
} catch(e) { }
