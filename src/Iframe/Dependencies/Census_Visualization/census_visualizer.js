Census_Visualizer = {
    initialize: function() {
        this._grpcQuerier = grpc_querier();
    },

    updateViz: function(map) {
        const callback = function(err, response) {
                              if (err) {
                              } else {
                                const medIncome = response.getMedianhouseholdincome();
                                console.log(medIncome);
                                var polygon = L.rectangle(map.getBounds(), {color: 'red'}).addTo(map);
                              }
                            };

        let query = this._grpcQuerier.getCensusData("tract", [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng],
         [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng], "2010", callback, "medianHouseholdIncome");


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
