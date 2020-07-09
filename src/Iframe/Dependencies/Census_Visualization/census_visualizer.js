/**
 * @namespace Census_Visualizer
 * @file Responsible for querying census data and drawing it as polygons on a leaflet map
 * @author Kevin Bruhwiler
 */
Census_Visualizer = {

    /**
      * Initializes the Census_Visualizer object
      *
      * @memberof Census_Visualizer
      * @method initialize
      */
    initialize: function() {
        this._grpcQuerier = grpc_querier();
        this._percentageToColor = {
            0.0: [0, 0, 255],
            0.5: [0, 255, 0],
            1.0: [255, 0, 0]
        },
        this.markers = [];
        this.featureMap = {"Total Population": 0, "Avg. Household Income": 1,
          "Population by Age": 2, "Median Age": 3, "No. Below Poverty Line": 4, "Demographics": 5};
        this.propertyMap = {0: "2010_total_population", 1: "2010_median_household_income",
          2: "2010_population_by_age", 3: "2010_median_age", 4: "2010_poverty", 5: "2010_race"};
        this.featureName = ""
        this.feature = -1;
    },

    /**
      * Sets the current census feature being displayed
      *
      * @memberof Census_Visualizer
      * @method setFeature
      * @param {string} f 
      *        The name of the feature being displayed
      */
    setFeature: function(f){
        this.feature = this.featureMap[f];
        this.featureName = f;
    },

    /**
      * Converts an array representing RGBA values into a string
      *
      * @memberof Census_Visualizer
      * @method _rgbaToString
      * @param {Array.<Number>} rgba 
      *        A length four array in RGBA order
      * @return {string} 
      *         An rgba string in CSS format
      */
    _rgbaToString: function(rgba){
        return "rgba("+rgba[0]+", "+rgba[1]+", "+rgba[2]+", "+rgba[3]+")";
    },

    /**
      * Gets an R, G, or B color value based on the current _percentageToColor object
      *
      * @memberof Census_Visualizer
      * @method _getColorValue
      * @param {Array.<Number>} bounds 
      *        The lower and upper bounds for the color
      * @param {Array.<Number>} pcts 
      *        The lower and upper percentages for the color
      * @param {Number} idx 
      *        The index of the color being computed
      * @return {Number} 
      *         The value of the color
      */
    _getColorValue: function(bounds, pcts, idx){
        return this._percentageToColor[bounds[0]][idx]*pcts[0] + this._percentageToColor[bounds[1]][idx]*pcts[1];
    },

    /**
      * Gets an RGBA CSS string for the given percentage and alpha value
      *
      * @memberof Census_Visualizer
      * @method _getColorForPercentage
      * @param {Number} pct 
      *        The percentage value being converted into a color
      * @param {Number} alpha 
      *        The alpha value for the RGBA string
      * @return {string} 
      *         An rgba string in CSS format
      */
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

    /**
      * Converts a geojson polygon from lng/lat format to lat/lng format
      *
      * @memberof Census_Visualizer
      * @method _reverseLatLngPolgon
      * @param {Array.<Array.<Number>>} poly 
      *        The polygon being converted
      * @return {Array.<Array.<Number>>} 
      *         The reformatted polygon
      */
    _reverseLatLngPolgon: function(poly){
      const out = [];
      for (p in poly[0][0]){
          out.push([poly[0][0][p][1], poly[0][0][p][0]])
      }
      return out;
    },

    /**
      * Gets the minimum and maximum values from the returned gRPC query
      *
      * @memberof Census_Visualizer
      * @method _getMinAndMax
      * @param {Array.<Object>} responseList 
      *        The response returned by the gRPC query
      * @return {Array.<Number>} 
      *         An array of length two containing the minimum and maximum values in the response
      */
    _getMinAndMax: function(responseList){
      let min = Number.MAX_VALUE;
      let max = 0;
      for (r in responseList){
        try{
            const data = JSON.parse(responseList[r].getData());
            const num = data[this.propertyMap[this.feature]];
            min = Math.min(min, num)
            max = Math.max(max, num)
          } catch (err) {
            console.log(err)
          }
      }
      return [min, max];
    },

    /**
      * Normalizes a value between the given minimum and maximum values
      *
      * @memberof Census_Visualizer
      * @method _normalize
      * @param {Number} val 
      *        The value being normalized
      * @param {Number} max 
      *        The maximum value
      * @param {Number} min 
      *        The minimum value
      * @return {Number} 
      *         A value between 0 and 1
      */
    _normalize: function(val, max, min){
      return (val - min) / (max - min);
    },

    /**
      * Updates the Census visualization with the current feature
      *
      * @memberof Census_Visualizer
      * @method updateViz
      * @param {Object} map 
      *        The leaflet map being updated
      */
    updateViz: function(map) {
        const callback = function(bounds, err, response) {
                              if (err) {
                                } else {
                                  for(var i = 0; i < this.markers.length; i++){
                                    map.removeLayer(this.markers[i]);
                                  }
                                  this.markers = [];
                                  
                                  const responseList = response.getSinglespatialresponseList();
                                  const vals = this._getMinAndMax(responseList);
                                  const min = vals[1];
                                  const max = vals[0];
                                  for (r in responseList){
                                    try{
                                      const geo = JSON.parse(responseList[r].getResponsegeojson());
                                      const data = JSON.parse(responseList[r].getData());
                                      var polygon = L.polygon(this._reverseLatLngPolgon(geo.geometry.coordinates), {color:
                                        this._getColorForPercentage(this._normalize(data[this.propertyMap[this.feature]], min, max), 0.5)}).addTo(map);
                                      polygon.bindTooltip("2010 " + this.featureName + " of: " + data[this.propertyMap[this.feature]]);
                                      this.markers.push(polygon);
                                    } catch (err) {
                                      console.log(err)
                                    }
                                  }
                                }
                              }.bind(this, map.getBounds());

        if(this.featureName === "")
          return;
        const b = map.wrapLatLngBounds(map.getBounds());
        const query = this._grpcQuerier.getCensusData(2, b._southWest, b._northEast, callback, this.feature);
    },
};

/**
  * Returns a census_visualizer object
  *
  * @function census_visualizer
  * @return {Census_Visualizer} 
  *         A census_visualizer object
  */
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
