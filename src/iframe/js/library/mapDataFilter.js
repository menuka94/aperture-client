/**
 * @class  MapDataFilter
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
            return this.getMultipleModel(feature);
        } else {
            return this.getSingleModel(feature);
        }
    }

    getSingleModel(feature) {
        const model = {};
        model[feature] = [];

        for (const entry of this.data) {
            if (entry[feature] !== undefined) {
                model[feature].push(entry[feature]);
            }
        }

        return model;
    }

    getMultipleModel(features) {
        let model = {};

        for (const feature of features) {
            const singleModel = this.getSingleModel(feature);
            model = { ...model, ...singleModel };
        }

        return model;
    }
}


try {
    module.exports = {
        MapDataFilter: MapDataFilter,
    }
} catch (e) { }
