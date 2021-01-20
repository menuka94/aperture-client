/**
 * @class  MapDataFilter
 * @author Pierce Smith
 */

class MapDataFilter {
    constructor() {
        this.msCacheMaxAge = 10000;
        this.data = [];
    }

    add(newData) {
        let entryAlreadyExists = this.data.find(entry => entry.GISJOIN === newData.GISJOIN);
        if (entryAlreadyExists) {
            return false;
        }

        newData.entryTime = Date.now();
        this.data.push(newData);
    }

    getModel(feature, bounds) {
        let model;

        let filteredData = this.filter(this.data, bounds);

        if (Array.isArray(feature)) {
            return this.getMultipleModel(feature, filteredData);
        } else {
            return this.getSingleModel(feature, filteredData);
        }
    }

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
