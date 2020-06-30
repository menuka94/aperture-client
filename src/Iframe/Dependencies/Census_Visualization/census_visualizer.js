Census_Visualizer = {
    initialize: function() {
        this._grpcQuerier = grpc_querier();
        this._percentageToColor = {
            0.0: [0, 0, 255],
            0.5: [0, 255, 0],
            1.0: [255, 0, 0]
        },
        this.markers = []
    },

    _splitBounds: function(bounds, subRectangles){
        const x_step = (bounds._northEast.lat-bounds._southWest.lat) / subRectangles;
        const y_step = (bounds._northEast.lng-bounds._southWest.lng) / subRectangles;
        const subBounds = [];

        for(let i = bounds._southWest.lat; i < bounds._northEast.lat; i += x_step){
          for(let j = bounds._southWest.lng; j < bounds._northEast.lng; j += y_step){
            subBounds.push([[i, j], [i+x_step, j+y_step]])
          }
        }
        return subBounds
    },

    _rgbaToString: function(rgba){
        return "rgba("+rgba[0]+", "+rgba[1]+", "+rgba[2]+", "+rgba[3]+")";
    },

    _getColorValue: function(bounds, pcts, idx){
        return this._percentageToColor[bounds[0]][idx]*pcts[0] + this._percentageToColor[bounds[1]][idx]*pcts[1];
    },

    _getColorForPercentage: function(pct, alpha) {
        if(pct === 0) {
            pct += 0.00001;
        } else if (pct % 0.5 === 0) {
            pct -= 0.00001;
        }
        const lower = 0.5*(Math.floor(Math.abs(pct/0.5)));
        const upper = 0.5*(Math.ceil(Math.abs(pct/0.5)));
        const rangePct = (pct - lower) / (upper - lower);
        const pctLower = 1 - rangePct;
        const pctUpper = rangePct;
        const r = Math.floor(this._getColorValue([lower, upper], [pctLower, pctUpper], 0));
        const g = Math.floor(this._getColorValue([lower, upper], [pctLower, pctUpper], 1));
        const b = Math.floor(this._getColorValue([lower, upper], [pctLower, pctUpper], 2));
        return this._rgbaToString([r, g, b, alpha]);
    },

    updateViz: function(map) {
        for(var i = 0; i < this.markers.length; i++){
          map.removeLayer(this.markers[i]);
        }
        this.markers = [];

        const allBounds = this._splitBounds(map.getBounds(), 5);
        for (bounds in allBounds){
          let callback = function(bounds, err, response) {
                                if (err) {
                                } else {
                                  const medIncome = response.getMedianhouseholdincome();
                                  if (!isNaN(medIncome)){
                                    var polygon = L.rectangle(allBounds[bounds], {color: this._getColorForPercentage(medIncome/80000, 0.5)}).addTo(map);
                                    polygon.bindTooltip("Median income of: " + medIncome);
                                    this.markers.push(polygon);
                                  }
                                }
                              }.bind(this, bounds);

          let query = this._grpcQuerier.getCensusData("tract", allBounds[bounds][0],
            allBounds[bounds][1], "2010", callback, "medianHouseholdIncome");
         }
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
