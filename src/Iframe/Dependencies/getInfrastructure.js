//Author: Daniel Reynolds
//Purpose: Get osm nodes, ways, and relations, and then translate them onto a leaflet map
//Dependencies: osmtogeojson, jquery, Leaflet.markerCluster
//----globals------------------------------
const FLYTOOPTIONS = { //for clicking on icons
    easeLinearity: 0.4,
    duration: 0.25,
    maxZoom: 17
};
const ATTRIBUTE = { //attribute enums
    icon: 'icon',
    color: 'color'
}
const commonTagNames = ["waterway", "man_made", "landuse", "water", "amenity"]; //tags that are allowed from OSM data, ie: waterway=dam or man_made=water_works, precedence goes down left to right
const blacklistTags = ["yes", "amenity"]; //tags that arent allowed for titles, ie: hydropower=yes is NOT a title for a dam

let currentLayers;
let currentQueries;
let currentBounds;
let map;
let markerCluster;
let blacklist;
let forceGarbageCleanup = false;
//-----------------------------------------

function config(markerClusterIn, mapIn) { //basically a constructor
    map = mapIn;
    markerCluster = markerClusterIn;
    currentLayers = [];
    currentQueries = [];
    currentBounds = [];
    blacklist = [];
}

function updateObjects(queryListOrig, forceDraw) { //gets the objects within the current viewport
    let bBounds = leafletBoundsToObj(map.getBounds());
    let queryURLs = queryDefault(queryListOrig, bBounds); 
    if(queryURLs != null){
        queryURLs.forEach(queryURL =>
            queryObjectsFromServer(queryURL, forceDraw, bBounds, true)
        );
    }
    //updateObjectsPan(bBounds, boundsString, queryListOrig);
}

function updateObjectsPan(origBounds, origBoundsString, queryList) { //this function updates the objects around the current viewport, since users 
    //generally pan around when looking at the map, therefore there's less loading time seen by the user time.
    let newBounds = {
        north: origBounds.north + (origBounds.north - origBounds.south),
        south: origBounds.south - (origBounds.north - origBounds.south),
        east: origBounds.east + (origBounds.east - origBounds.west),
        west: origBounds.west - (origBounds.east - origBounds.west)
    }
    let newBoundsString = makeBoundsString(newBounds);
    let queryFString = createQuery(queryList, newBoundsString);
    //let queryURL = queryDefault(queryListOrig, boundsString, origBoundsString);
    let queryURL = 'https://overpass.kumi.systems/api/interpreter?data=[out:json][timeout:15];(' + queryFString + ')->.a;(.a;-node(' + origBoundsString + ');)->.a;(.a;-way(' + origBoundsString + ');)->.a;(.a;-relation(' + origBoundsString + '););out body geom;';
    queryObjectsFromServer(queryURL, false, newBounds, true);
    for (let i = 0; i < queryList.length; i++) {
        if (queryList[i].query === 'custom=Natural_Gas_Pipeline' && !blacklist.includes('Natural_Gas_Pipeline')) {
            queryURL = queryNaturalGas(newBounds);
            queryObjectsFromServer(queryURL, true, newBounds, false); //natrl gas
        }
    }
}

function queryObjectsFromServer(queryURL, forceDraw, bounds, isOsm) { //in: queryURL for a json, out: calls rendering methods with geojson
    if (!withinCurrentBounds(bounds) || forceDraw) {
        cleanUpQueries(bounds);
        if (isOsm) {
            queryAlertText.parentElement.style.display = "block";
            queryAlertText.innerHTML = "Loading Data...";
        }
        let startLoad = Date.now();
        let query = $.getJSON(queryURL, function (dataAsJson) {
            if(!withinCurrentBounds(bounds)){
                currentBounds.push(bounds);
            }
            if(isOsm){
                console.log("Loadtime: " + (Date.now() - startLoad) + "ms");
            }
            for(let i = 0; i < currentQueries.length; i++){
                if(currentQueries[i].query === query){
                    currentQueries.splice(i,1)
                    break;
                }
            }
            if (map.getZoom() >= MINRENDERZOOM && currentQueries.length == 0) {
                queryAlertText.parentElement.style.display = "none";
            }
            if (forceGarbageCleanup) {
                cleanupCurrentMap();
                forceGarbageCleanup = false;
            }
            if (isOsm) {
                drawObjectsToMap(osmtogeojson(dataAsJson));
            }
            else {
                drawObjectsToMap(dataAsJson);
            }
        });
        currentQueries.push({ query: query, bounds: bounds });
    }
}

function cleanUpQueries(bounds) { //in: bounds of a query, out: cleans up currently running queries that dont exist in the current viewport
    for (let i = 0; i < currentQueries.length; i++) {
        if (queryNeedsCancelling(currentQueries[i], bounds)) {
            currentQueries.splice(i, 1);
            console.log("kill");
            currentBounds = [];
            forceGarbageCleanup = true;
        }
    }
}

function drawObjectsToMap(dataToDraw) { //in: geoJson containing only things contained in 'getAttributes', out: a map with what is contained in the geoJson
    let resultLayer = L.geoJson(dataToDraw, {
        style: function (feature) {
            return { color: getAttribute(parseIconNameFromContext(feature), ATTRIBUTE.color) };
        },
        filter: function (feature) {
            if (!featureShouldBeDrawn(feature)) {
                return false;
            }
            currentLayers.push(feature.id);
            return true;
        },
        onEachFeature: function (feature, layer) {
            latlng = latLngFromFeature(feature);
            if(latlng === -1){
                return;
            }
            let iconName = parseIconNameFromContext(feature);
            let iconDetails = parseDetailsFromContext(feature, iconName);
            addIconToMap(getAttribute(iconName, ATTRIBUTE.icon), latlng, iconDetails);
            layer.bindPopup(iconDetails);
            layer.on('click', function (e) {
                map.flyToBounds(layer.getBounds(), FLYTOOPTIONS);
            });
        },
        pointToLayer: function () {
            return L.marker([0, 0], {
                opacity: 0
            });
        }

    }).addTo(map);
    markerCluster.refreshClusters();
    return resultLayer;
}

function removeFromBlacklist(idToRemove) {
    if (blacklist.includes(idToRemove)) {
        blacklist.splice(blacklist.indexOf(idToRemove), 1);
        currentBounds = [];
        return true;
    }
    else {
        return false;
    }
}

function cleanupCurrentMap() { //in: nothing, out: cleans up map outside of the current viewport
    map.eachLayer(function (layer) {
        if (layer.feature != null) {
            let ltlng = map.getCenter;
            if(latLngFromFeature(layer.feature) != null){
                ltlng = latLngFromFeature(layer.feature);
            }
            if(!pointIsWithinBoundsX2(ltlng,map.getBounds())){
                if (layer.feature.properties.type == 'node' || layer.feature.properties.type == 'way' || layer.feature.properties.type == 'relation' || layer.feature.properties.TYPEPIPE != null) {
                    map.removeLayer(layer);
                    currentLayers.splice(currentLayers.indexOf(layer.feature.id),1);
                }
            }
        }
    });
    let iconsToRemove = [];
    markerCluster.eachLayer(function(layer){
        let ltlng = layer._latlng;
        if(!pointIsWithinBoundsX2(ltlng,map.getBounds())){
            iconsToRemove.push(layer);
        }
    });
    markerCluster.removeLayers(iconsToRemove);
}


function removeFromMap(idToRemove) { //in: object id, for example 'weir' or 'Natural_Gas_Pipeline', out: removes that id from the map and adds it to the blacklist so it wont render if received
    if (getAttribute(idToRemove, ATTRIBUTE.icon) != "noicon") {
        let iconUrlToSeachFor = getAttribute(idToRemove, ATTRIBUTE.icon).options.iconUrl;
        markerCluster.eachLayer(function (layer) {
            if (layer.options.icon) {
                if (iconUrlToSeachFor === layer.options.icon.options.iconUrl) {
                    markerCluster.removeLayer(layer);
                }
            }
        });
    }
    map.eachLayer(function (layer) {
        if (layer.feature) {
            if (parseIconNameFromContext(layer.feature) == idToRemove) {
                map.removeLayer(layer);
                currentLayers.splice(currentLayers.indexOf(layer.feature.id), 1);
            }
        }
    });
    blacklist.push(idToRemove);
}











//------------------------------------------------------------
//-------------------toolbox----------------------------------
//------------------------------------------------------------
function createQuery(queryList, boundsString) { //in: list of tags to query, out: a query that can be appended to the url for an overpass interpreter
    let queryFString = '';
    for (let i = 0; i < queryList.length; i++) {
        if (isIllegalOsmQuery(queryList[i])) {
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
    return queryFString;
}

function isIllegalOsmQuery(queryObj){ //in query ie: man_made:water_works, out: if not in blacklist and is in common tags
    return queryObj.query.split('=')[0] === 'custom' || blacklist.includes(queryObj.query.split('=')[1]);
}

function makeBoundsString(bounds) { //in: bounds in form of object with nesw, out: string in order for overpass urls
    return bounds.south + ',' + bounds.west + ',' + bounds.north + ',' + bounds.east;
}

function withinCurrentBounds(boundsToTest) { //in bounds, out: true if is withing bounds to check against, false if not within or null
    if (currentBounds == []) {
        return false;
    }
    for(let i = 0; i < currentBounds.length; i++){
        if (withinBounds(boundsToTest,currentBounds[i])) {
            return true;
        }
    }
    return false;
}

function withinBounds(boundsToTest, boundsToTestAgainst){ 
    return boundsToTestAgainst.north >= boundsToTest.north && boundsToTestAgainst.south <= boundsToTest.south && boundsToTestAgainst.west <= boundsToTest.west && boundsToTestAgainst.east >= boundsToTest.east;
}

function outsideOfBounds(boundsToTest, boundsToTestAgainst){ 
    return boundsToTest.east < boundsToTestAgainst.west || boundsToTest.west > boundsToTestAgainst.east || boundsToTest.south > boundsToTestAgainst.north || boundsToTest.north < boundsToTestAgainst.south;
}

function queryNeedsCancelling(queryObj, boundsToCheckAgainst) { //in queryObj from query objects from server, out: true and cancells query if query is not in viewport, false if not
    if (outsideOfBounds(queryObj.bounds,boundsToCheckAgainst)) {
        queryObj.query.abort();
        return true;
    }
    return false;
}

function queryDefault(queryList, queryBounds) { //in: array of queries and a boundsstring, out: valid url to kumi systems
    let boundsToQuery;
    if(currentBounds == [] || currentBounds.length == 0){
        boundsToQuery = [queryBounds];
    }
    else{
        boundsToQuery = subBounds(queryBounds,currentBounds[0]);
        if(boundsToQuery != []){
            for(let j = 1; j < currentBounds.length; j++){
                let tempBoundsToQuery = [];
                for(let k = 0; k < boundsToQuery.length; k++){
                    tempBoundsToQuery = tempBoundsToQuery.concat(subBounds(boundsToQuery[k],currentBounds[j]));
                }
                boundsToQuery = tempBoundsToQuery;
            }
        }
    }
    if(boundsToQuery == null || boundsToQuery == [] || boundsToQuery.length == 0){
        return null;
    }
    let queries = [];
    for(let i = 0; i < boundsToQuery.length; i++){
        let polygon = L.polygon([
            [boundsToQuery[i].south,boundsToQuery[i].west],
            [boundsToQuery[i].south,boundsToQuery[i].east],
            [boundsToQuery[i].north,boundsToQuery[i].east],
            [boundsToQuery[i].north,boundsToQuery[i].west],
            [boundsToQuery[i].south,boundsToQuery[i].west]
        ],{color:'#'+Math.floor(Math.random()*16777215).toString(16)}).addTo(map);
        setTimeout(function(){ map.removeLayer(polygon) }, 3000);
        queries.push('https://overpass.kumi.systems/api/interpreter?data=[out:json][timeout:30];(' + createQuery(queryList, makeBoundsString(boundsToQuery[i])) + ');out body geom;');
    }
    return queries;
}

function queryNaturalGas(bounds) { //in: bounds, out: url for geoJson from arcgis for natural gas pipelines
    return 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Natural_Gas_Liquid_Pipelines/FeatureServer/0/query?where=1%3D1&outFields=*&geometry=' + bounds.west + '%2C' + bounds.south + '%2C' + bounds.east + '%2C' + bounds.north + '&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson';
}

function latLngFromFeature(feature) { //in: geojson feature, out: its parsed latlng as L.latLng
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
    return L.latLng(latlng[1],latlng[0]);
}

function pointIsWithinBounds(point,bounds){ //in: l.latlng and l.latlngbounds, out: true if is within, false if not
    if(point == null){
        return true;
    }
    return point.lng > bounds.getWest() && point.lat > bounds.getSouth() && point.lng < bounds.getEast() && point.lat < bounds.getNorth();
}

function pointIsWithinBoundsX2(point,bounds){ //in: l.latlng and l.latlngbounds, out: true if is within the box plus a box on each side, false if not
    if(point == null){
        return true;
    }
    bounds = L.latLngBounds(L.latLng(bounds.getSouth() - (bounds.getNorth() - bounds.getSouth()),bounds.getWest() - (bounds.getEast() - bounds.getWest())),L.latLng(bounds.getNorth() + (bounds.getNorth() - bounds.getSouth()), bounds.getEast() + (bounds.getEast() - bounds.getWest())));
    return pointIsWithinBounds(point,bounds);
}

function leafletBoundsToObj(leafletBounds){ //in L.latlngBounds, out: nesw obj
    return {north: leafletBounds.getNorth(), east: leafletBounds.getEast(), south: leafletBounds.getSouth(), west: leafletBounds.getWest()};
}

function featureShouldBeDrawn(feature){
    return !(currentLayers.includes(feature.id) || map.getZoom() < MINRENDERZOOM || blacklist.includes(parseIconNameFromContext(feature)));
}

function subBounds(boundsToSlice, boundSlicer){ //in: 2 bounds objects {nsew}, out: a bounds obj list that is bTS - bS 
    if(withinBounds(boundsToSlice,boundSlicer)){
        return []; //the bounds are within eachother
    }
    if(outsideOfBounds(boundsToSlice,boundSlicer)){
        return [boundsToSlice];
    }
    let returnList = [];
    if(boundSlicer.west > boundsToSlice.west){
        returnList.push({
            north:boundsToSlice.north, 
            south:boundsToSlice.south,
            east:boundSlicer.west,
            west:boundsToSlice.west
        });
    }
    if(boundSlicer.east < boundsToSlice.east){
        returnList.push({
            north:boundsToSlice.north, 
            south:boundsToSlice.south,
            east: boundsToSlice.east,
            west: boundSlicer.east
        });
    }
    if(boundSlicer.south > boundsToSlice.south){
        returnList.push({
            north:boundSlicer.south, 
            south:boundsToSlice.south,
            east:Math.min(boundSlicer.east,boundsToSlice.east),
            west:Math.max(boundSlicer.west,boundsToSlice.west)
        });
    }
    if(boundSlicer.north < boundsToSlice.north){
        returnList.push({
            north:boundsToSlice.north, 
            south:boundSlicer.north,
            east:Math.min(boundSlicer.east,boundsToSlice.east),
            west:Math.max(boundSlicer.west,boundsToSlice.west)
        });
    }
    return returnList;
}













//----------------------------------------

function parseIconNameFromContext(feature) {
    let pTObj = getParamsAndTags(feature);
    let params = pTObj.params;
    let tagsObj = pTObj.tagsObj;
    for (let j = 0; j < commonTagNames.length; j++) {
        for (let i = 0; i < params.length; i++) {
            if (commonTagNames[j] == params[i]) {
                if (!blacklistTags.includes(tagsObj[params[i]])) {
                    return tagsObj[params[i]];
                }
            }
            if (params[i] == "TYPEPIPE") {
                return "Natural_Gas_Pipeline";
            }
        }
    }
    return 'none';
}

function getParamsAndTags(feature) {
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
}

function parseDetailsFromContext(feature, name) {
    name = capitalizeString(underScoreToSpace(name));
    let pTObj = getParamsAndTags(feature);
    let params = pTObj.params;
    let tagsObj = pTObj.tagsObj;
    let details = "<ul style='padding-inline-start:20px;margin-block-start:2.5px;'>";
    params.forEach(param => details += "<li>" + capitalizeString(underScoreToSpace(param)) + ": " + capitalizeString(underScoreToSpace(tagsObj[param])) + "</li>");
    details += "</ul>";
    return "<b>" + name + "</b>" + "<br>" + details;
}

function capitalizeString(str) {
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
}

function underScoreToSpace(str) {
    if (typeof str !== 'string') {
        str = str.toString();
    }
    return str.replace(/_/gi, " ");
}

function addIconToMap(mIcon, latlng, popUpContent) {
    //filtration code
    if (mIcon == null || mIcon === "noicon") {
        return false;
    }
    markerCluster.addLayer(L.marker(latlng, {
        icon: mIcon,
        opacity: 1
    }).on('click', function (e) {
        if (map.getZoom() < 16) {
            map.flyTo(e.latlng, 16, FLYTOOPTIONS);
        }
        else {
            map.flyTo(e.latlng, map.getZoom(), FLYTOOPTIONS);
        }
    }).bindPopup(popUpContent));
    return true;
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
        currentLayers: function (val) {
            if (val != null) {
                currentLayers = val;
            }
            return currentLayers;
        },
        currentQueries: function (val) {
            if (val != null) {
                currentQueries = val;
            }
            return currentQueries;
        },
        currentBounds: function (val) {
            if (val != null) {
                currentBounds = val;
            }
            return currentBounds;
        },
        blacklist: function (val) {
            if (val != null) {
                blacklist = val;
            }
            return blacklist;
        },
        ATTRIBUTE: ATTRIBUTE,
        config:config,
        makeBoundsString: makeBoundsString,
        createQuery: createQuery,
        withinBounds: withinBounds,
        withinCurrentBounds: withinCurrentBounds,
        queryDefault: queryDefault,
        cleanUpQueries: cleanUpQueries,
        queryNeedsCancelling: queryNeedsCancelling,
        drawObjectsToMap: drawObjectsToMap,
        cleanupCurrentMap: cleanupCurrentMap,
        parseIconNameFromContext: parseIconNameFromContext,
        parseDetailsFromContext: parseDetailsFromContext,
        getParamsAndTags: getParamsAndTags,
        underScoreToSpace: underScoreToSpace,
        capitalizeString: capitalizeString,
        addIconToMap: addIconToMap,
        getAttribute: getAttribute,
        queryNaturalGas: queryNaturalGas,
        pointIsWithinBounds: pointIsWithinBounds,
        pointIsWithinBoundsX2: pointIsWithinBoundsX2,
        removeFromBlacklist: removeFromBlacklist,
        latLngFromFeature: latLngFromFeature,
        subBounds, subBounds
    }
} catch (e) { }