/**
 * @class  MapDataFilter
 * @author Pierce Smith
 */

class MapDataFilter {
    constructor() {
        this.msCacheMaxAge = 10000;
        this.data = [];
    }

    /* Inserts a data element into the filter.
     * Data elements should be complete responses from the database,
     * with a valid `geometry` and `properties` props.
     * This function is called via a pipe created in `graph.js` that reads
     * complete data from renderInfrastructure.js.
     */
    add(newData) {
        let entryAlreadyExists = this.data.find(entry => entry.GISJOIN === newData.GISJOIN);
        if (entryAlreadyExists) {
            return false;
        }

        newData.entryTime = Date.now();
        this.data.push(newData);
    }

    /* Given the name of a feature and the bounds of the map, return a
     * formatted "model" of this data in the filter.  
     * Only data entries whose geometry fits in the bounds will be added.
     * For instance, if you want to model temperature, this is stored as a
     * "temp" property in the data entires, so you'd pass "temp" as
     * the feature.
     * Multiple features can also be passed in an array and it will model
     * each one.  
     * The resulting "model" is an object with one property for each
     * feature, whose key is the name of the feature requested and whose 
     * value is a list of all of the values associated with that feature
     * found in the data set.
     */
    getModel(feature, bounds) {
        let model;

        let filteredData = this.filter(this.data, bounds);

        if (Array.isArray(feature)) {
            return this.getMultipleModel(feature, filteredData);
        } else {
            return this.getSingleModel(feature, filteredData);
        }
    }

    /* Everything below is helpers for getModel. */

    filter(data, bounds) {
        return data.filter(entry => this.isInBounds(entry, bounds));
    }

    isInBounds(entry, bounds) {
        /*
        const featureType = Util.getFeatureType(entry);
        switch (featureType) {
            case FEATURETYPE.point:
                entryBounds = [entry.geometry.coordinates[1], entry.geometry.coordinates[0]];
                return viewport.contains(entryBounds);
            case FEATURETYPE.polygon:
        }
        */
        return true;
    }

    getSingleModel(feature) {
        const model = {};
        model[feature] = [];

        for (const entry of this.data) {
            if (entry.properties[feature] !== undefined) {
                model[feature].push(entry.properties[feature]);
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
