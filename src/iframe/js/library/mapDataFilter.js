/**
 * @class  MapDataFilter
 * @author Pierce Smith
 */

class MapDataFilter {
    constructor() {
        this.msCacheMaxAge = 10000;
        this.data = [];
    }

    /** Inserts a data element or array of data elements into the filter.
      * Data elements should be complete responses from the database,
      * with valid `geometry` and `properties` props.
      * 
      * @memberof MapDataFilter
      * @method add
      * @param {(object|Array<object>)} newData - the data to add, as a direct response from the database
      */
    add(newData) {
        if (Array.isArray(newData)) {
            this.addMultiple(newData);
        } else {
            this.addSingle(newData);
        }
    }

    /** Inserts a single data element to the filter.
      * @memberof MapDataFilter
      * @method add
      * @param {object} newData - the data to add, as a direct response from the database
      * @see add
      */
    addSingle(newData) {
        let entryAlreadyExists = this.data.find(entry => entry.GISJOIN === newData.GISJOIN);
        if (entryAlreadyExists) {
            return;
        }

        newData.entryTime = Date.now();
        this.data.push(newData);
        return true;
    }

    /** Inserts an array of data elements into the filter.
      * @memberof MapDataFilter
      * @method addMultiple
      * @param {Array<object>} newData - an array of data elements
      * @see add
      */
    addMultiple(newData) {
        for (let data of newData) {
            this.addSingle(data);
        }
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
        let filteredData = this.filter(this.data, bounds);

        if (Array.isArray(feature)) {
            return this.getMultipleModel(feature, filteredData);
        } else {
            return this.getSingleModel(feature, filteredData);
        }
    }

    /** Remove all of the data from the filter.
      * @memberof MapDataFilter
      * @method clear
      */
    clear() {
        data = [];
    }

    /** Given a set of raw data and a leaflet bounds object,
      * return only the data that the filter is interested in.
      * This means, at a minimum, that any data outside the bounds
      * is discarded.
      * @memberof MapDataFilter
      * @method filter
      * @param {Array<object>} data - an array of raw data as passed into the `add` method
      * @param {Leaflet Bounds} bounds
      * @returns {Array<object>} a subset of the data including only entries the filter is interested in
      */
    filter(data, bounds) {
        return data.filter(entry => this.isInBounds(entry, bounds));
    }

    /** Given a single entry of data and a leaflet bounds object, determines
      * (approximately) if the entry's geometry intersects the bounds at all.
      * @memberof MapDataFilter
      * @method isInBounds
      * @param {object} entry - a single entry of data as passed into the `add` method
      * @param {Leaflet Bounds} bounds
      * @returns {boolean} true if the entry seems to intersect the bounds at all, false otherwise
      */
    isInBounds(entry, bounds) {
        const featureType = Util.getFeatureType(entry);
        switch (featureType) {
            case Util.FEATURETYPE.point: {
                let point = [entry.geometry.coordinates[1], entry.geometry.coordinates[0]];
                return bounds.contains(point);
            }
            case Util.FEATURETYPE.multiPolygon: {
                let polygons = entry.geometry.coordinates;
                bounds = Util.mirrorLatLngBounds(bounds);
                return polygons.find(polygon => Util.arePointsApproximatelyInBounds(polygon[0], bounds));
            }
        }

        discardOldData(msCacheMaxAge);
        return false;
    }

    /** Removes any data from the filter that is older in miliseconds than the
      * given max age.
      * @memberof MapDataFilter
      * @method discardOldData
      * @param {number} maxAge - the age, in milliseconds, that which any older data should be removed
      */
    discardOldData(maxAge) {
        this.data = this.data.filter(entry => (Date.now() - entry.entryTime) > maxAge)
    }

    /** Gets a model for a single feature.
      * See the getModel function for more information on what a 
      * "model" means in this context.
      * @memberof MapDataFilter
      * @method getSingleModel
      * @param {string} feature - the feature to model
      * @param {Array<object>} data - the data to create the model from
      * returns {object} the model
      */
    getSingleModel(feature, data) {
        const model = {};
        model[feature] = [];

        for (const entry of data) {
            if (entry.properties[feature] !== undefined) {
                model[feature].push(entry.properties[feature]);
            }
        }

        return model;
    }

    /** Gets an array of models for multiple features.
      * See the getModel function for more information on what a 
      * "model" means in this context.
      * @memberof MapDataFilter
      * @method getSingleModel
      * @param {Array<string>} features - the features to model
      * @param {Array<object>} data - the data to create the model from
      * returns {Array<object>} the models
      */
    getMultipleModel(features, data) {
        let model = {};

        for (const feature of features) {
            const singleModel = this.getSingleModel(feature, data);
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
