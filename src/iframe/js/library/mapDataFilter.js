/**
 * @class  MapDataFilter
 * @file   Take in map data + bounds and filter to be passed into graphing
 * @author Pierce Smith
 */

class MapDataFilter {
    constructor(data) {
        this.data = data;
    }

    /**
      * @memberof MapDataFilter
      * @method   getModel
      * @param    {(string|string[])} the name of the feature(s) you wish to model over. Accepts either a single string or an array of strings. 
      * @returns  {Object} an object with a property for each requested feature, whose keys are the name of the feature as passed in and whose values are an array of all of the values of those features in the dataset 
      */
    getModel(feature) {
        if (Array.isArray(feature)) {
            return getMultipleModel(feature);
        } else {
            return getSingleModel(feature);
        }
    }

    getSingleModel(feature) {
        const model = {
            feature: [],
        };

        for (const entry of data) {
            if (entry[feature] !== undefined) {
                model[feature].push(entry[feature]);
            }
        }

        return model;
    }

    getMultipleModel(features) {
        const model = {};

        for (const feature of features) {
            const singleModel = getSingleModel(feature);
            model = { ...model, ...singleModel };
        }

        return model;
    }
}
