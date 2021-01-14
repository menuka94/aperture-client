//Author: Daniel Reynolds
//Purpose: Get osm nodes, ways, and relations, and then translate them onto a leaflet map
//Dependencies: Leaflet, osmtogeojson, jquery, Leaflet.markerCluster

//legacy code, this giant library is being split up into smaller, more modular libraries like autoQuery.js and geometryLoader.js.
//many functions are still useful though, and are used througout the project.

const FLYTOOPTIONS = { //for clicking on icons
    easeLinearity: 0.4,
    duration: 0.25,
    maxZoom: 17
};
const ATTRIBUTE = { //attribute enums
    icon: 'icon',
    color: 'color'
}
const FEATURETYPE = { //attribute enums
    point: 0,
    lineString: 1,
    polygon: 2
}
const DEFAULTOPTIONS = {
    maxElements: 5000,
    maxLayers: 10,
    minRenderZoom: 0,
    queryAlertText: null,
    iconSize: [25, 25],
    simplifyThreshold: -1
};

/**
 * Where the Rendering/Management related functions are
 * @namespace RenderInfrastructure
*/
RenderInfrastructure = {
    map: null,
    markerLayer: null,
    data: null,
    preProcessData: null,
    queries: [],
    currentBounds: [],
    currentLayers: [],
    currentQueries: [],
    blacklist: [],
    grpcQuerier: null,
    options: JSON.parse(JSON.stringify(DEFAULTOPTIONS)),
    idCounter: 0,
    /**
     * Sets up instance of renderer
     * @memberof RenderInfrastructure
     * @method config
     * @param {L.Map} map - Leaflet map that will have things rendered to it
     * @param {L.markerClusterGroup} markerLayer - Marker cluster that will contain markers
     * @param {JSON} data - JSON that contains needed information for renderable things
     * @param {object} options - object with attributes
     */
    config: function (map, markerLayer, data, options) { //basically a constructor
        this.options = JSON.parse(JSON.stringify(DEFAULTOPTIONS));
        L.Util.setOptions(this, options);
        this.map = map;
        this.markerLayer = markerLayer;
        this.data = data;
        this.currentBounds = [];
        this.currentLayers = [];
        this.idCounter = 0;
    },
    /**
     * Renders geojson
     * @memberof RenderInfrastructure
     * @method renderGeoJson
     * @param {JSON} geoJsonData GeoJSON 
     * @param {JSON} indexData (optional) custom JSON data (if you don't want to use Renderinfrastructure.data as your indexing file)
     * @returns {Array<int>} array of integers which contain the id of added layers
     */
    renderGeoJson: function (geoJsonData, indexData) {
        if (RenderInfrastructure.options.simplifyThreshold !== -1) {
            Util.simplifyGeoJSON(geoJsonData, RenderInfrastructure.options.simplifyThreshold);
        }
        Util.fixGeoJSONID(geoJsonData);
        const datasource = indexData ? indexData : RenderInfrastructure.data;
        let layers = [];
        L.geoJson(geoJsonData, {
            style: function (feature) {
                let weight = 3;
                let fillOpacity = 0.2;
                let name = Util.getNameFromGeoJsonFeature(feature, indexData);
                if (datasource[name] && datasource[name]["noBorder"]) {
                    weight = 0;
                    fillOpacity = 0.75;
                }
                return { color: datasource[name]["color"], weight: weight, fillOpacity: fillOpacity };
            },
            filter: function (feature) {
                Util.normalizeFeatureID(feature);
                let name = Util.getNameFromGeoJsonFeature(feature, indexData);
                if (RenderInfrastructure.currentLayers.includes(feature.id) || RenderInfrastructure.map.getZoom() < RenderInfrastructure.options.minRenderZoom || RenderInfrastructure.blacklist.includes(name) || datasource[name] == null) {
                    return false;
                }
                RenderInfrastructure.currentLayers.push(feature.id);
                return true;
            },
            onEachFeature: function (feature, layer) {
                latlng = Util.getLatLngFromGeoJsonFeature(feature);
                if (latlng === -1) {
                    return;
                }
                layer.specifiedId = RenderInfrastructure.idCounter++;
                let iconName = Util.getNameFromGeoJsonFeature(feature, indexData);
                let iconDetails = Util.createDetailsFromGeoJsonFeature(feature, iconName, indexData);
                RenderInfrastructure.addIconToMap(iconName, latlng, iconDetails, indexData, layer.specifiedId);
                layer.bindPopup(iconDetails);
                layer.on('click', function (e) {
                    RenderInfrastructure.map.flyToBounds(layer.getBounds(), FLYTOOPTIONS);
                });
                layers.push(layer.specifiedId);
            },
            pointToLayer: function () {
                return L.marker([0, 0], {
                    opacity: 0
                });
            }

        }).addTo(RenderInfrastructure.map);
        return layers;
    },
    /**
     * Adds icon to map
     * @memberof RenderInfrastructure
     * @method addIconToMap
     * @param {string} iconName defines the bit of the JSON from this.data the icon will pull from
     * @param {Array} latLng latlng array where the icon will be put
     * @param {string} popUpContent the content that will display for this element when clicked, accepts HTML formatting
     */
    addIconToMap: function (iconName, latLng, popUpContent, indexData, specifiedId) {
        let icon = RenderInfrastructure.getAttribute(iconName, ATTRIBUTE.icon, indexData)
        if (!icon || icon === "noicon") {
            return false;
        }
        let marker = L.marker(latLng, {
            icon: icon,
            opacity: 1
        });
        marker.uniqueId = iconName;
        marker.specifiedId = specifiedId;
        RenderInfrastructure.markerLayer.addLayer(marker.on('click', function (e) {
            if (e.target.__parent._group._spiderfied) {
                return;
            }
            if (RenderInfrastructure.map.getZoom() < 16) {
                RenderInfrastructure.map.flyTo(e.latlng, 16, FLYTOOPTIONS);
            }
            else {
                RenderInfrastructure.map.flyTo(e.latlng, RenderInfrastructure.map.getZoom(), FLYTOOPTIONS);
            }
        }).bindPopup(popUpContent));
        return true;
    },
    /**
     * Removes a feature id from the map
     * @memberof RenderInfrastructure
     * @method removeFeatureFromMap
     * @param {Array<int>} specifiedIds id which should be removed from map, ex: 'dam' or 'weir'
     * @returns {boolean} true if ids were removed
     */
    removeSpecifiedLayersFromMap: function (specifiedIds) {
        this.markerLayer.eachLayer(function (layer) {
            if (layer.specifiedId && specifiedIds.includes(layer.specifiedId)) {
                RenderInfrastructure.markerLayer.removeLayer(layer);
            }
        });
        this.map.eachLayer(function (layer) {
            if (layer.feature && specifiedIds.includes(layer.specifiedId)) {
                RenderInfrastructure.currentLayers.splice(RenderInfrastructure.currentLayers.indexOf(layer.feature.id), 1);
                RenderInfrastructure.map.removeLayer(layer);
            }
        });
        return true;
    },
    /**
     * Removes all features from the map
     * @memberof RenderInfrastructure
     * @method removeAllFeaturesFromMap
     * @returns {boolean} true if successful, there will be an error otherwise
     */
    removeAllFeaturesFromMap: function () {
        this.markerLayer.eachLayer(function (layer) {
            RenderInfrastructure.markerLayer.removeLayer(layer);
        });
        this.map.eachLayer(function (layer) {
            if (layer.feature) {
                RenderInfrastructure.map.removeLayer(layer);
            }
        });
        this.currentLayers = [];
        for (x in RenderInfrastructure.data) {
            if (RenderInfrastructure.data[x]['query']) {
                this.blacklist.push(x);
            }
        }
        return true;
    },
    /**
     * Cleans up elements outside of the current viewportX2
     * @memberof RenderInfrastructure
     * @method getAttribute
     * @param {string} id to get from the data JSON
     * @param {number} attribute options defined in the ATTRIBUTE enum
     * @returns {string} either a address to an icon or a hex color string
     */
    getAttribute: function (tag, attribute, indexData) {
        const datasource = indexData ? indexData : RenderInfrastructure.data;
        if (datasource) {
            if (datasource[tag]) {
                if (attribute == ATTRIBUTE.color) {
                    if (datasource[tag]["color"]) {
                        return datasource[tag]["color"];
                    }
                }
                else {
                    if (datasource[tag]["iconAddr"]) {
                        return Util.makeIcon(datasource[tag]["iconAddr"]);
                    }
                }
            }
        }
        if (attribute == ATTRIBUTE.color) {
            return "#000000";
        }
        else {
            return "noicon"
        }
    }
}

/**
* Where utility functions are
* @namespace Util
*/
Util = {
    /**
     * Where conversion functions are
     * @namespace Convert
     * @memberof Util
     */
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
        if (type === FEATURETYPE.polygon) {
            let pos = L.latLngBounds(feature.geometry.coordinates[0]).getCenter();
            latlng.push(pos.lat);
            latlng.push(pos.lng);
        }
        else if (type === FEATURETYPE.lineString) {
            let pos = L.latLngBounds(feature.geometry.coordinates).getCenter();
            latlng.push(pos.lat);
            latlng.push(pos.lng);
        }
        else if (type === FEATURETYPE.point) {
            latlng = feature.geometry.coordinates;
        }
        else {
            return [0, 0];
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
            return FEATURETYPE.polygon;
        }
        else if ((feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "LineString")) {
            return FEATURETYPE.lineString;
        }
        else if ((feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "Point")) {
            return FEATURETYPE.point;
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
        if (type === -1 || type === FEATURETYPE.point) {
            return;
        }
        if (type === FEATURETYPE.polygon) {
            feature.geometry.coordinates[0] = simplify(feature.geometry.coordinates[0], threshold, false);
        }
        else if (type === FEATURETYPE.lineString) {
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
        if (indexData) {
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
        if (str == null) {
            return "noname"
        }
        if (typeof str !== 'string') {
            str = str.toString();
        }
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
        if (typeof str !== 'string') {
            str = str.toString();
        }
        return str.replace(/ /gi, "_");
    },
    /**                                                                            
     * Creates a leaflet icon from an image address.
     * @memberof Util
     * @method makeIcon
     * @param {string} address
     * @returns {object} leaflet icon
     */
    makeIcon: function (address) {
        icon = new L.Icon({
            iconUrl: address,
            iconSize: RenderInfrastructure.options.iconSize
        });
        return icon;
    },
    /**                                                                            
     * Creates a full geojson object from a feature array
     * @memberof Util
     * @method createGeoJsonObj
     * @param {Array} features
     * @returns {object} full geojson
     */
    createGeoJsonObj: function (features) {
        let geojson = {
            "type": "FeatureCollection",
            "features": []
        }
        features.forEach(fea => {
            geojson["features"].push(fea);
        });
        return geojson;
    },
    /**                                                                            
     * Gives non-square-rooted 2d distance, one input latlng is reversed
     * @memberof Util
     * @method dist2d
     * @param {Array} p1
     * @param {Array} p2
     * @returns {number} distance
     */
    dist2d: function (p1, p2) { //p2 latlng array is reversed
        return Math.pow(p1[0] - p2[1], 2) + Math.pow(p1[1] - p2[0], 2);
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
        if (this.getFeatureType(feature) === FEATURETYPE.lineString && JSON.stringify(feature.geometry.coordinates[0]) === JSON.stringify(feature.geometry.coordinates[feature.geometry.coordinates.length - 1])) {
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
        if (!feature.id && feature._id.$oid) feature.id = feature._id.$oid;
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
    }
}

//mocha-test stuff only down from here

try {
    module.exports = {
        ATTRIBUTE: ATTRIBUTE,
        RenderInfrastructure: RenderInfrastructure,
        Util: Util
    }
} catch (e) { }
