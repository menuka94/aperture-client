/**
* Where utility functions are
* @namespace Util
*/
Util = {
    //enums
    FEATURETYPE: {
        point: 0,
        lineString: 1,
        polygon: 2
    },
    /**
     * What is the best latLng point for a GeoJSON feature?
     * @memberof Util
     * @method getLatLngFromGeoJsonFeature
     * @param {object} feature GeoJSON feature, a latlng point will be extracted. Can be a point, linestring, or polygon.
     * @returns {object} Leaflet latLng object
     */
    getLatLngFromGeoJsonFeature: function (feature) {
        let type = this.getFeatureType(feature);
        latlng = [];
        if (type === this.FEATURETYPE.polygon) {
            let pos = L.latLngBounds(feature.geometry.coordinates[0]).getCenter();
            latlng.push(pos.lat);
            latlng.push(pos.lng);
        }
        else if (type === this.FEATURETYPE.lineString) {
            let pos = L.latLngBounds(feature.geometry.coordinates).getCenter();
            latlng.push(pos.lat);
            latlng.push(pos.lng);
        }
        else if (type === this.FEATURETYPE.point) {
            latlng = feature.geometry.coordinates;
        }
        else {
            return {lat: 0,lng: 0};
                
        }
        return L.latLng(latlng[1], latlng[0]);
    },
    /**
     * What type is a GeoJSON feature?
     * @memberof Util
     * @method getFeatureType
     * @param {object} feature GeoJSON feature, a latlng point will be extracted. Can be a point, linestring, or polygon.
     * @returns {number} Enum from FEATURETYPE or -1 if not found
     */
    getFeatureType: function (feature) {
        if ((feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "Polygon")) {
            return this.FEATURETYPE.polygon;
        }
        else if ((feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "LineString")) {
            return this.FEATURETYPE.lineString;
        }
        else if ((feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "Point")) {
            return this.FEATURETYPE.point;
        }
        else {
            return -1;
        }
    },
    /**
     * Simplifies GeoJSON 
     * @memberof Util
     * @method simplifyGeoJSON
     * @param {object} GeoJSON GeoJSON obj
     * @param {number} threshold threshold to simplify by
     */
    simplifyGeoJSON: function (geoJSON, threshold) {
        if (geoJSON.features) {
            geoJSON.features.forEach(feature => {
                this.simplifyFeatureCoords(feature, threshold);
            });
        }
        else if(geoJSON.geometry){
            this.simplifyFeatureCoords(geoJSON, threshold);
        }
    },
    /**
     * Helper for simplify GeoJSON, simplifies a single feature
     * @memberof Util
     * @method simplifyFeatureCoords
     * @param {object} feature feature to be simplified
     * @param {number} threshold threshold to simplify by
     */
    simplifyFeatureCoords: function (feature, threshold) {
        let type = this.getFeatureType(feature);
        if (type === -1 || type === this.FEATURETYPE.point) {
            return;
        }
        if (type === this.FEATURETYPE.polygon) {
            feature.geometry.coordinates[0] = simplify(feature.geometry.coordinates[0], threshold, false);
        }
        else if (type === this.FEATURETYPE.lineString) {
            feature.geometry.coordinates = simplify(feature.geometry.coordinates, threshold, false);
        }
    },
    /**                                                                            
     * gets JSON data defined name for geojson feature
     * @memberof Util
     * @method getNameFromGeoJsonFeature
     * @param {object} feature feature to get name of
     * @param {JSON} indexData (optional) custom JSON data (if you don't want to use Renderinfrastructure.data as your indexing file)
     * @returns {string} name/id of feature, "none" if not found
     */
    getNameFromGeoJsonFeature: function (feature, indexData) {
        let pTObj = this.getParamsAndTagsFromGeoJsonFeature(feature);
        let params = pTObj.params;
        let tagsObj = pTObj.tagsObj;
        const datasource = indexData ? indexData : RenderInfrastructure.data;
        if (indexData) { //this is quite a bit simpler than the other way.
            return Object.keys(indexData)[0];
        }
        for (element in datasource) { 
            if (datasource[element]["identityField"]) {
                for (let i = 0; i < params.length; i++) {
                    if (params[i] === datasource[element]["identityField"]) {
                        if (datasource[element]["identityKey"]) {
                            if (tagsObj[params[i]] === datasource[element]["identityKey"]) {
                                return element;
                            }
                        }
                        else {
                            return element;
                        }
                    }
                }
            }

        }
        return 'none';
    },
    /**                                                                            
     * creates popup based on the JSON data
     * @memberof Util
     * @method createDetailsFromGeoJsonFeature
     * @param {object} feature
     * @param {string} name
     * @param {JSON} indexData (optional) custom JSON data (if you don't want to use Renderinfrastructure.data as your indexing file)
     * @returns {string} html to put on popup
     */
    createDetailsFromGeoJsonFeature: function (feature, name, indexData) {
        let pTObj = this.getParamsAndTagsFromGeoJsonFeature(feature);
        return this.createPopup(name, pTObj, indexData);
    },
    /**                                                                            
     * gets tags from GeoJSON feature
     * @memberof Util
     * @method getParamsAndTagsFromGeoJsonFeature
     * @param {object} feature
     * @returns {object} object with params and tags
     */
    getParamsAndTagsFromGeoJsonFeature: function (feature) {
        let params;
        let tagsObj;
        if (feature.properties.tags) {
            params = Object.keys(feature.properties.tags);
            tagsObj = feature.properties.tags;
            if (params.length == 0) {
                params = Object.keys(feature.properties.relations[0].reltags);
                tagsObj = feature.properties.relations[0].reltags;
            }
        }
        else if (feature.properties) { //non-osm data is here
            params = Object.keys(feature.properties);
            tagsObj = feature.properties;
        }
        else {
            return "nodata";
        }
        return { params: params, tagsObj: tagsObj };
    },
    /**                                                                            
     * Capitalizes First Letter In Every Word Unless The Word is 2 Chars or Less
     * @memberof Util
     * @method capitalizeString
     * @param {string} str
     * @returns {string} 
     */
    capitalizeString: function (str) {
        if (str == null || str.length == 0) {
            return "";
        }
        str = str.split(" ");
        for (var i = 0, x = str.length; i < x; i++) {
            if (str[i] == null || str[i].length <= 2) {
                continue;
            }
            str[i] = str[i][0].toUpperCase() + str[i].substr(1);
        }
        return str.join(" ");
    },
    /**                                                                            
     * Converts_underscores -> to spaces.
     * @memberof Util
     * @method underScoreToSpace
     * @param {string} str
     * @returns {string} 
     */
    underScoreToSpace: function (str) {
        if (str == null) 
            return "noname"
        if (typeof str !== 'string')
            str = str.toString();
        return str.replace(/_/gi, " ");
    },
    /**                                                                            
     * Converts_spaces -> to underscores.
     * @memberof Util
     * @method underScoreToSpace
     * @param {string} str
     * @returns {string} 
     */
    spaceToUnderScore: function (str) {
        if (typeof str !== 'string')
            str = str.toString();
        return str.replace(/ /gi, "_");
    },
    /**                                                                            
     * Creates a full geojson object from a feature array
     * @memberof Util
     * @method createGeoJsonObj
     * @param {Array} features
     * @returns {object} full geojson
     */
    createGeoJsonObj: function (features) {
        const geojson = {
            "type": "FeatureCollection",
            "features": features
        }
        return geojson;
    },
    /**                                                                            
     * Changed linestring to polygon if it is misidentified
     * @memberof Util
     * @method fixGeoJSONID
     * @param geoJSON object or collection
     * @returns {Object} geoJSON, object or full group
     */
    fixGeoJSONID: function (geoJSON) {
        if (geoJSON.features) {
            geoJSON.features.forEach(feature => {
                this.fixFeatureID(feature);
            });
        }
        else {
            this.fixFeatureID(geoJSON);
        }
    },
    /**                                                                            
     * Changed linestring to polygon if it is misidentified
     * @memberof Util
     * @method fixFeatureID
     * @param {Object} feature geojson feature
     */
    fixFeatureID: function (feature) {
        if (this.getFeatureType(feature) === this.FEATURETYPE.lineString && JSON.stringify(feature.geometry.coordinates[0]) === JSON.stringify(feature.geometry.coordinates[feature.geometry.coordinates.length - 1])) {
            feature.geometry.type = "Polygon";
            feature.geometry.coordinates = [feature.geometry.coordinates];
        }
    },
    /**                                                                            
     * Normalizes id's to the format feature.id
     * @memberof Util
     * @method normalizeFeatureID
     * @param {Object} feature geojson feature
     */
    normalizeFeatureID: function (feature) {
        if (!feature.id && feature._id.$oid) 
            feature.id = feature._id.$oid;
    },
    /**                                                                            
     * Makes popup text
     * @memberof Util
     * @method createPopup
     * @param {string} id JSON data id
     * @param {object} pTObj params and tags object created with @method getParamsAndTagsFromGeoJsonFeature
     * @param {JSON} indexData (optional) custom JSON data (if you don't want to use Renderinfrastructure.data as your indexing file)
     * @returns {string} html to put in popup
     */
    createPopup: function (id, pTObj, indexData) {
        let params = pTObj.params;
        let tagsObj = pTObj.tagsObj;
        let details = "<b>" + this.capitalizeString(this.underScoreToSpace(id)) + "</b><br>";
        const datasource = indexData ? indexData : RenderInfrastructure.data;
        if (!datasource[id]['popup']) {
            details += "<ul style='padding-inline-start:20px;margin-block-start:2.5px;'>";
            params.forEach(param => details += "<li>" + this.capitalizeString(this.underScoreToSpace(param)) + ": " + this.capitalizeString(this.underScoreToSpace(tagsObj[param])) + "</li>");
            details += "</ul>";
        }
        else {
            let tokens = datasource[id]['popup'].split(" ");
            tokens.forEach(token => {
                if (token.substring(0, 2) === "@@") {
                    let to = token.substring(2).indexOf("@@"); //second @@
                    let tokenMark = tagsObj[token.substring(2, to + 2)];
                    if (tokenMark && tokenMark.length > 2) {
                        tokenMark = this.capitalizeString(tokenMark.toLowerCase());
                    }
                    details += tokenMark + token.substring(to + 4);
                }
                else {
                    details += token;
                }
                details += " ";
            });
            details = details.substring(0, details.length - 1);
        }
        return details;
    },
    /**
      * Removes properties. from name of variable
      * @memberof AutoQuery
      * @method removePropertiesPrefix
      * @param {string} str
      * @returns {string} string with truncated properties.
      */
    removePropertiesPrefix(str) {
        return str.substr(0, 11) === "properties." ? str.substring(11, str.length) : str; //removes a "properties." if it exists
    }
}

try {
    module.exports = {
        Util: Util
    }
} catch (e) { }