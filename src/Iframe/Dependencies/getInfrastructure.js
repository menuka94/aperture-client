//Author: Daniel Reynolds
//Purpose: Get osm nodes, ways, and relations, and then translate them onto a leaflet map
//Dependencies: Leaflet, osmtogeojson, jquery, Leaflet.markerCluster

const FLYTOOPTIONS = { //for clicking on icons
    easeLinearity: 0.4,
    duration: 0.25,
    maxZoom: 17
};
const NSEW = {
    ns: 0,
    ew: 1
}
const ATTRIBUTE = { //attribute enums
    icon: 'icon',
    color: 'color'
}

let RenderInfrastructure = {
    map: null,
    markerLayer: null,
    currentBounds: [],
    currentLayers: [],
    currentQueries: [],
    blacklist: [],
    options: {
        overpassInterpreter: 'https://overpass.kumi.systems/api/interpreter',
        timeout: 30,
        maxElements: 5000,
        maxLayers: 10,
        minRenderZoom: 10,
        commonTagNames: ["waterway", "man_made", "landuse", "water", "amenity"],
        blacklistedTagValues: ["yes", "amenity"],
        queryAlertText: null
    },
    config: function (map, markerLayer, options) { //basically a constructor
        L.Util.setOptions(this, options);
        this.map = map;
        this.markerLayer = markerLayer;
        this.currentBounds = [];
        this.currentLayers = [];
        this.currentQueries = [];
        this.blacklist = [];
    },
    update: function (queries) {
        let bounds = Util.Convert.leafletBoundsToNESWObject(this.map.getBounds());
        let usefulQueries = Querier.createOverpassQueryList(queries, bounds);
        if (usefulQueries != null) {
            usefulQueries.forEach(query => {
                Querier.queryGeoJsonFromServer(query.query, query.bounds, true, RenderInfrastructure.renderGeoJson);
            });
        }
    },
    renderGeoJson: function (geoJsonData) {
        let resultLayer = L.geoJson(geoJsonData, {
            style: function (feature) {
                return { color: getAttribute(Util.getNameFromGeoJsonFeature(feature), ATTRIBUTE.color) };
            },
            filter: function (feature) {
                if (RenderInfrastructure.currentLayers.includes(feature.id) || RenderInfrastructure.map.getZoom() < RenderInfrastructure.options.minRenderZoom || RenderInfrastructure.blacklist.includes(Util.getNameFromGeoJsonFeature(feature))) {
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
                let iconName = Util.getNameFromGeoJsonFeature(feature);
                let iconDetails = Util.getDetailsFromGeoJsonFeature(feature, iconName);
                RenderInfrastructure.addIconToMap(getAttribute(iconName, ATTRIBUTE.icon), latlng, iconDetails);
                layer.bindPopup(iconDetails);
                layer.on('click', function (e) {
                    RenderInfrastructure.map.flyToBounds(layer.getBounds(), FLYTOOPTIONS);
                });
            },
            pointToLayer: function () {
                return L.marker([0, 0], {
                    opacity: 0
                });
            }

        }).addTo(RenderInfrastructure.map);
        if(RenderInfrastructure.options.queryAlertText){
            if (RenderInfrastructure.map.getZoom() >= RenderInfrastructure.options.minRenderZoom && RenderInfrastructure.currentQueries.length == 0) {
                RenderInfrastructure.options.queryAlertText.parentElement.style.display = "none";
            }
            else {
                RenderInfrastructure.options.queryAlertText.parentElement.style.display = "block";
                RenderInfrastructure.options.queryAlertText.innerHTML = "Loading Data...";
            }
        }
        RenderInfrastructure.markerLayer.refreshClusters();
        return resultLayer;
    },
    addIconToMap: function (icon, latLng, popUpContent) {
        if (icon == null || icon === "noicon") {
            return false;
        }
        this.markerLayer.addLayer(L.marker(latLng, {
            icon: icon,
            opacity: 1
        }).on('click', function (e) {
            if (this.map.getZoom() < 16) {
                this.map.flyTo(e.latlng, 16, FLYTOOPTIONS);
            }
            else {
                this.map.flyTo(e.latlng, this.map.getZoom(), FLYTOOPTIONS);
            }
        }).bindPopup(popUpContent));
        return true;
    },
    removeFeatureFromMap: function (featureId) {
        if (getAttribute(featureId, ATTRIBUTE.icon) != "noicon") {
            let iconUrlToSeachFor = getAttribute(featureId, ATTRIBUTE.icon).options.iconUrl;
            this.markerLayer.eachLayer(function (layer) {
                if (layer.options.icon) {
                    if (iconUrlToSeachFor === layer.options.icon.options.iconUrl) {
                        RenderInfrastructure.markerLayer.removeLayer(layer);
                    }
                }
            });
        }
        this.map.eachLayer(function (layer) {
            if (layer.feature) {
                if (Util.getNameFromGeoJsonFeature(layer.feature) == featureId) {
                    RenderInfrastructure.map.removeLayer(layer);
                    RenderInfrastructure.currentLayers.splice(RenderInfrastructure.currentLayers.indexOf(layer.feature.id), 1);
                }
            }
        });
        this.blacklist.push(featureId);
        return true;
    },
    cleanupMap: function () {
        this.map.eachLayer(function (layer) {
            if (layer.feature != null) {
                let ltlng = RenderInfrastructure.map.getCenter;
                if (Util.getLatLngFromGeoJsonFeature(layer.feature) != null) {
                    ltlng = Util.getLatLngFromGeoJsonFeature(layer.feature);
                }
                if (!Util.pointIsWithinBounds(ltlng, Util.expandBounds(Util.Convert.leafletBoundsToNESWObject(RenderInfrastructure.map.getBounds())))) {
                    if (layer.feature.properties.type == 'node' || layer.feature.properties.type == 'way' || layer.feature.properties.type == 'relation' || layer.feature.properties.TYPEPIPE != null) {
                        RenderInfrastructure.map.removeLayer(layer);
                        RenderInfrastructure.currentLayers.splice(RenderInfrastructure.currentLayers.indexOf(layer.feature.id), 1);
                    }
                }
            }
        });
        let iconsToRemove = [];
        this.markerLayer.eachLayer(function (layer) {
            let ltlng = layer._latlng;
            if (!Util.pointIsWithinBounds(ltlng, Util.expandBounds(Util.Convert.leafletBoundsToNESWObject(RenderInfrastructure.map.getBounds())))) {
                iconsToRemove.push(layer);
            }
        });
        this.markerLayer.removeLayers(iconsToRemove);
        this.currentBounds = [Util.Convert.leafletBoundsToNESWObject(this.map.getBounds())];
        return true;
    },
    removeFromBlacklist: function (tagToRemove) {
        this.currentBounds = [];
        if (this.blacklist.includes(tagToRemove)) {
            this.blacklist.splice(this.blacklist.indexOf(tagToRemove), 1);
            return true;
        }
        else {
            return false;
        }
    }
}

const Querier = {
    queryGeoJsonFromServer: function (queryURL, bounds, isOsmData, callbackFn) {
        this.removeUnnecessaryQueries();
        let query = $.getJSON(queryURL, function (dataAsJson) {
            for (let i = 0; i < RenderInfrastructure.currentQueries.length; i++) {
                if (RenderInfrastructure.currentQueries[i].query === query) {
                    RenderInfrastructure.currentQueries.splice(i, 1)
                    break;
                }
            }
            if (RenderInfrastructure.currentLayers.length > 5000) {
                RenderInfrastructure.cleanupMap();
            }
            else if (RenderInfrastructure.currentBounds.length > 10) {
                RenderInfrastructure.currentBounds = [Util.Convert.leafletBoundsToNESWObject(RenderInfrastructure.map.getBounds())];
            }
            if (isOsmData) {
                callbackFn(osmtogeojson(dataAsJson));
            }
            else {
                callbackFn(dataAsJson);
            }
        });
        RenderInfrastructure.currentQueries.push({ query: query, bounds: bounds });
        if(RenderInfrastructure.options.queryAlertText){
            if (RenderInfrastructure.map.getZoom() >= RenderInfrastructure.options.minRenderZoom && RenderInfrastructure.currentQueries.length == 0) {
                RenderInfrastructure.options.queryAlertText.parentElement.style.display = "none";
            }
            else {
                RenderInfrastructure.options.queryAlertText.parentElement.style.display = "block";
                RenderInfrastructure.options.queryAlertText.innerHTML = "Loading Data...";
            }
        }
    },
    removeUnnecessaryQueries: function () {
        for (let i = 0; i < RenderInfrastructure.currentQueries.length; i++) {
            let bound = Util.Convert.leafletBoundsToNESWObject(RenderInfrastructure.map.getBounds());
            bound = Util.expandBounds(bound);
            if (Util.boundsAreOutsideOfBounds(RenderInfrastructure.currentQueries[i].bounds, bound)) {
                RenderInfrastructure.currentQueries[i].query.abort();
                RenderInfrastructure.currentQueries.splice(i, 1);
                i--;
            }
        }
    },
    createOverpassQueryList: function (queryList, queryBounds) {
        let boundsToQuery = [];
        if ((RenderInfrastructure.currentBounds.length == 0 && RenderInfrastructure.currentQueries.length == 0)) {
            boundsToQuery = [queryBounds];
        }
        else {
            if (RenderInfrastructure.currentBounds.length > 0) {
                boundsToQuery = Util.subtractBounds(queryBounds, RenderInfrastructure.currentBounds[0]);
                if (boundsToQuery.length > 0) {
                    for (let j = 1; j < RenderInfrastructure.currentBounds.length; j++) {
                        boundsToQuery = Util.subtractBoundsFromList(boundsToQuery,RenderInfrastructure.currentBounds[j]);
                    }
                }
            }
            if (RenderInfrastructure.currentQueries.length > 0) {
                let startIndex = 0;
                if (boundsToQuery.length == 0) {
                    boundsToQuery = Util.subtractBounds(queryBounds, RenderInfrastructure.currentQueries[0].bounds);
                    startIndex = 1;
                }
                if (boundsToQuery.length > 0) {
                    for (let n = startIndex; n < RenderInfrastructure.currentQueries.length; n++) {
                        boundsToQuery = Util.subtractBoundsFromList(boundsToQuery, RenderInfrastructure.currentQueries[n].bounds);
                    }
                }
            }
        }
        if (boundsToQuery.length == 0) return null;
        boundsToQuery = Util.optimizeBoundsList(boundsToQuery, 0.005);
        if (boundsToQuery.length == 0) return null;
        let queries = [];
        for (let i = 0; i < boundsToQuery.length; i++) {
            queries.push({
                query: this.createOverpassQueryURL(queryList, boundsToQuery[i]),
                bounds: boundsToQuery[i]
            });
        }
        return queries;
    },
    createOverpassQueryURL: function (queryList, bounds) {
        let queryFString = '';
        let boundsString = Util.Convert.createOverpassBoundsString(bounds);
        for (let i = 0; i < queryList.length; i++) {
            if (queryList[i].query.split('=')[0] === 'custom' || RenderInfrastructure.blacklist.includes(queryList[i].query.split('=')[1])) {
                continue; //skip if its a custom query and not a osm query, or if blacklisted
            }
            query = queryList[i].query.replace(/ /g, ''); //remove whitespace
            let queries = {
                nodeQuery: 'node[' + query + '](' + boundsString + ');',
                wayQuery: 'way[' + query + '](' + boundsString + ');',
                relationQuery: 'relation[' + query + '](' + boundsString + ');'
            }
            queryFString += queries.nodeQuery + queries.wayQuery + queries.relationQuery;
        }
        return RenderInfrastructure.options.overpassInterpreter + '?data=[out:json][timeout:' + RenderInfrastructure.options.timeout + '];(' + queryFString + ');out body geom;';
    }
}

const Util = {
    Convert: {
        leafletBoundsToNESWObject: function (leafletBounds) {
            return {
                north: leafletBounds.getNorth(),
                east: leafletBounds.getEast(),
                south: leafletBounds.getSouth(),
                west: leafletBounds.getWest()
            };
        },
        createOverpassBoundsString: function (bounds) {
            return bounds.south + ',' + bounds.west + ',' + bounds.north + ',' + bounds.east;
        }
    },
    boundsAreWithinBounds: function (boundsToCheck, boundsToCheckAgainst) {
        return boundsToCheckAgainst.north >= boundsToCheck.north && boundsToCheckAgainst.south <= boundsToCheck.south && boundsToCheckAgainst.west <= boundsToCheck.west && boundsToCheckAgainst.east >= boundsToCheck.east;
    },
    boundsAreOutsideOfBounds: function (boundsToCheck, boundsToCheckAgainst) {
        return boundsToCheck.east < boundsToCheckAgainst.west || boundsToCheck.west > boundsToCheckAgainst.east || boundsToCheck.south > boundsToCheckAgainst.north || boundsToCheck.north < boundsToCheckAgainst.south;
    },
    pointIsWithinBounds: function (latLngPoint, boundsToCheckAgainst) {
        if (latLngPoint == null) {
            return true;
        }
        return latLngPoint.lng > boundsToCheckAgainst.west && latLngPoint.lat > boundsToCheckAgainst.south && latLngPoint.lng < boundsToCheckAgainst.east && latLngPoint.lat < boundsToCheckAgainst.north;
    },
    getLatLngFromGeoJsonFeature: function (feature) {
        let isPolygon = (feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "Polygon");
        let isLineString = (feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "LineString");
        let isPoint = (feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "Point");
        latlng = [];
        if (isPolygon) {
            let pos = L.latLngBounds(feature.geometry.coordinates[0]).getCenter();
            latlng.push(pos.lat);
            latlng.push(pos.lng);
        }
        else if (isLineString) {
            let pos = L.latLngBounds(feature.geometry.coordinates).getCenter();
            latlng.push(pos.lat);
            latlng.push(pos.lng);
        }
        else if (isPoint) {
            latlng = feature.geometry.coordinates;
        }
        else {
            return -1;
        }
        return L.latLng(latlng[1], latlng[0]);
    },
    subtractBounds: function (boundsToSlice, boundSlicer) {
        if (this.boundsAreWithinBounds(boundsToSlice, boundSlicer)) {
            return []; //the bounds are within eachother
        }
        if (this.boundsAreOutsideOfBounds(boundsToSlice, boundSlicer)) {
            return [boundsToSlice];
        }
        let returnList = [];
        if (boundSlicer.west > boundsToSlice.west) {
            returnList.push({
                north: boundsToSlice.north,
                south: boundsToSlice.south,
                east: boundSlicer.west,
                west: boundsToSlice.west
            });
        }
        if (boundSlicer.east < boundsToSlice.east) {
            returnList.push({
                north: boundsToSlice.north,
                south: boundsToSlice.south,
                east: boundsToSlice.east,
                west: boundSlicer.east
            });
        }
        if (boundSlicer.south > boundsToSlice.south) {
            returnList.push({
                north: boundSlicer.south,
                south: boundsToSlice.south,
                east: Math.min(boundSlicer.east, boundsToSlice.east),
                west: Math.max(boundSlicer.west, boundsToSlice.west)
            });
        }
        if (boundSlicer.north < boundsToSlice.north) {
            returnList.push({
                north: boundsToSlice.north,
                south: boundSlicer.north,
                east: Math.min(boundSlicer.east, boundsToSlice.east),
                west: Math.max(boundSlicer.west, boundsToSlice.west)
            });
        }
        return returnList;
    },
    subtractBoundsFromList: function (boundsListToEdit, boundsToRemove) {
        let tempBoundsList = [];
        for (let k = 0; k < boundsListToEdit.length; k++) {
            tempBoundsList = tempBoundsList.concat(this.subtractBounds(boundsListToEdit[k], boundsToRemove));
        }
        return tempBoundsList;
    },
    optimizeBoundsList: function (boundsListToOptimize, epsilon) {
        for (let i = 0; i < boundsListToOptimize.length; i++) {
            if (boundsListToOptimize[i].east - boundsListToOptimize[i].west < epsilon || boundsListToOptimize[i].north - boundsListToOptimize[i].south < epsilon) {
                boundsListToOptimize.splice(i, 1);
                i--;
            }
        }
        for (let i = 0; i < boundsListToOptimize.length; i++) {
            for (let j = i + 1; j < boundsListToOptimize.length; j++) {
                if (i < 0 || j < 0) {
                    continue;
                }
                let minimize = false;
                if (Math.abs(boundsListToOptimize[i].north - boundsListToOptimize[j].north) <= epsilon && Math.abs(boundsListToOptimize[i].south - boundsListToOptimize[j].south) <= epsilon && (Math.abs(boundsListToOptimize[i].east - boundsListToOptimize[j].west) <= epsilon || Math.abs(boundsListToOptimize[i].west - boundsListToOptimize[j].east) <= epsilon)) {
                    minimize = true;
                    boundsListToOptimize.push(this.concatenateBounds(boundsListToOptimize[i], boundsListToOptimize[j], NSEW.ns));
                }
                else if (Math.abs(boundsListToOptimize[i].east - boundsListToOptimize[j].east) <= epsilon && Math.abs(boundsListToOptimize[i].west - boundsListToOptimize[j].west) <= epsilon && (Math.abs(boundsListToOptimize[i].south - boundsListToOptimize[j].north) <= epsilon || Math.abs(boundsListToOptimize[i].north - boundsListToOptimize[j].south) <= epsilon)) {
                    minimize = true;
                    boundsListToOptimize.push(this.concatenateBounds(boundsListToOptimize[i], boundsListToOptimize[j], NSEW.ew));
                }
                if (minimize) {
                    boundsListToOptimize.splice(i, 1);
                    i--;
                    boundsListToOptimize.splice(j - 1, 1);
                    j--;
                }
            }
        }
        return boundsListToOptimize;
    },
    concatenateBounds: function (bounds1, bounds2, sharedAxis) {
        if (sharedAxis == NSEW.ns) {
            return {
                north: Math.min(bounds1.north, bounds2.north),
                south: Math.max(bounds1.south, bounds2.south),
                east: Math.max(bounds1.east, bounds2.east),
                west: Math.min(bounds1.west, bounds2.west)
            };
        }
        else {
            return {
                north: Math.max(bounds1.north, bounds2.north),
                south: Math.min(bounds1.south, bounds2.south),
                east: Math.min(bounds1.east, bounds2.east),
                west: Math.max(bounds1.west, bounds2.west)
            };
        }
    },
    expandBounds: function (bounds) {
        return {
            north: bounds.north + (bounds.north - bounds.south),
            south: bounds.south - (bounds.north - bounds.south),
            east: bounds.east + (bounds.east - bounds.west),
            west: bounds.west - (bounds.east - bounds.west)
        };
    },
    getNameFromGeoJsonFeature: function (feature) {
        let pTObj = this.getParamsAndTagsFromGeoJsonFeature(feature);
        let params = pTObj.params;
        let tagsObj = pTObj.tagsObj;
        for (let j = 0; j < RenderInfrastructure.options.commonTagNames.length; j++) {
            for (let i = 0; i < params.length; i++) {
                if (RenderInfrastructure.options.commonTagNames[j] == params[i]) {
                    if (!RenderInfrastructure.options.blacklistedTagValues.includes(tagsObj[params[i]])) {
                        return tagsObj[params[i]];
                    }
                }
                if (params[i] == "TYPEPIPE") {
                    return "Natural_Gas_Pipeline";
                }
            }
        }
        return 'none';
    },
    getDetailsFromGeoJsonFeature: function (feature) {
        name = this.capitalizeString(this.underScoreToSpace(name));
        let pTObj = this.getParamsAndTagsFromGeoJsonFeature(feature);
        let params = pTObj.params;
        let tagsObj = pTObj.tagsObj;
        let details = "<ul style='padding-inline-start:20px;margin-block-start:2.5px;'>";
        params.forEach(param => details += "<li>" + this.capitalizeString(this.underScoreToSpace(param)) + ": " + this.capitalizeString(this.underScoreToSpace(tagsObj[param])) + "</li>");
        details += "</ul>";
        return "<b>" + name + "</b>" + "<br>" + details;
    },
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
        return { params: params, tagsObj: tagsObj };
    },
    capitalizeString: function (str) {
        if (str == null || str.length == 0) {
            return "";
        }
        str = str.split(" ");
        for (var i = 0, x = str.length; i < x; i++) {
            if (str[i] == null || str[i].length <= 1) {
                continue;
            }
            str[i] = str[i][0].toUpperCase() + str[i].substr(1);
        }
        return str.join(" ");
    },
    underScoreToSpace: function (str) {
        if (typeof str !== 'string') {
            str = str.toString();
        }
        return str.replace(/_/gi, " ");
    }
}

function getAttribute(option, attribute) {
    let icon;
    let color;
    switch (option) {
        case "drinking_water":
            icon = new L.Icon({
                iconUrl: "../../../images/drinking_fountain.png",
                iconSize: [25, 25]
            });
            break;
        case "fountain":
            icon = new L.Icon({
                iconUrl: "../../../images/fountain.png",
                iconSize: [20, 20]
            });
            color = "#0000FF";
            break;
        case "fire_hydrant":
            icon = new L.Icon({
                iconUrl: "../../../images/fire_hydrant.png",
                iconSize: [20, 20]
            });
            break;
        case "dam":
            icon = new L.Icon({
                iconUrl: "../../../images/dam.png",
                iconSize: [25, 25]
            });
            color = "#FF0000";
            break;
        case "water_tap":
            icon = new L.Icon({
                iconUrl: "../../../images/tap_water.png",
                iconSize: [25, 25]
            });
            break;
        case "water_tower":
            icon = new L.Icon({
                iconUrl: "../../../images/water_tower.png",
                iconSize: [25, 25]
            });
            color = "#00FF00";
            break;
        case "water_well":
            icon = new L.Icon({
                iconUrl: "../../../images/water_well.png",
                iconSize: [25, 25]
            });
            break;
        case "water_works":
            icon = new L.Icon({
                iconUrl: "../../../images/water_works.png",
                iconSize: [25, 25]
            });
            color = "black";
            break;
        case "wastewater_plant":
            icon = new L.Icon({
                iconUrl: "../../../images/sewage.png",
                iconSize: [25, 25]
            });
            color = "#FF00FF";
            break;
        case "pipeline":
            icon = "noicon";
            color = "#FFFF00";
            break;
        case "reservoir":
            icon = new L.Icon({
                iconUrl: "../../../images/reservoir-lake.png",
                iconSize: [25, 25]
            });
            color = "#00FFFF";
            break;
        case "canal":
            icon = "noicon";
            color = "teal";
            break;
        case "river":
            icon = "noicon";
            color = "#00008B";
            break;
        case "basin":
            icon = new L.Icon({
                iconUrl: "../../../images/reservoir-lake.png",
                iconSize: [25, 25]
            });
            color = "#00FFFF";
            break;
        case "stream":
            icon = "noicon";
            color = "#0000BB";
            break;
        case "Natural_Gas_Pipeline":
            icon = "noicon";
            color = "#8A2BE2";
            break;
        case "lock_gate":
            icon = new L.Icon({
                iconUrl: "../../../images/lock_gate.png",
                iconSize: [25, 25]
            });
            color = "#FF0000";
            break;
        case "weir":
            icon = new L.Icon({
                iconUrl: "../../../images/weir.png",
                iconSize: [25, 25]
            });
            color = "#FF0000";
            break;
        case "tidal_channel":
            icon = "noicon";
            color = "#0080FF";
            break;

    }
    if (attribute == ATTRIBUTE.icon) {
        return icon;
    }
    else if (attribute == ATTRIBUTE.color) {
        return color;
    }
    return false;
}

//mocha-test stuff only down from here

try {
    module.exports = {
        RenderInfrastructure: RenderInfrastructure,
        Querier: Querier,
        Util: Util
    }
} catch (e) { }