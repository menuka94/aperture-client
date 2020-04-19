//Author: Daniel Reynolds
//Purpose: Get osm nodes, ways, and relations, and then translate them onto a leaflet map
//Dependencies: osmtogeojson, jquery, Leaflet.markerCluster
//----globals------------------------------
const FLYTOOPTIONS = {
    easeLinearity: 0.4,
    duration: 0.25,
    maxZoom: 17
};
const ATTRIBUTE = { //attribute enums
    icon: 'icon',
    color: 'color'
}
let currentLayers = [];
let currentQueries = [];
let currentBounds;
let map;
let mapBoundsObj;
let markerCluster;
//-----------------------------------------

function config(markerCluster,map){
    this.map = map;
    this.markerCluster = markerCluster;
}

function updateObjects(queryListOrig,bounds,cleanUpMap){ //gets the objects within the current viewport
    let sw = bounds.getSouthWest().wrap();
    let ne = bounds.getNorthEast().wrap();
    let queryList = queryListOrig.slice(); //clone querylist

    let bBounds = {
        north: ne.lat,
        south: sw.lat,
        east: ne.lng,
        west: sw.lng
    };
    let boundsString = makeBoundsString(bBounds);
    /*for(let i = 0; i < queryList.length; i++){ //filter objects that shouldnt render at this level
        if(queryList[i].zoom > map.getZoom()){
            queryList.splice(i,1);
        }
    }*/
    let queryURL = queryDefault(queryList,boundsString);
    queryObjectsFromServer(queryURL,cleanUpMap,bBounds);
    updateObjectsPan(bBounds,boundsString,queryList);
}

function makeBoundsString(bounds){
    return bounds.south + ',' + bounds.west + ',' + bounds.north + ',' + bounds.east;
}

function createQuery(queryList,boundsString){
    let queryFString = '';
    for(let i = 0; i < queryList.length; i++){
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

function queryObjectsFromServer(queryURL,cleanUpMap,bounds){
    if(!withinBounds(bounds) || cleanUpMap){
        cleanUpQueries(bounds);
        currentBounds = bounds;
        let editMap = this.map; //because this.map wont work inside getJSON for some reason
        queryAlertText.parentElement.style.display = "block";
        queryAlertText.innerHTML = "Loading Data...";
        let query = $.getJSON(queryURL, function(osmDataAsJson) {
            if(editMap.getZoom() >= MINRENDERZOOM){
                queryAlertText.parentElement.style.display = "none";
            }
            drawObjectsToMap(osmtogeojson(osmDataAsJson));
        });
        currentQueries.push({query:query,bounds:bounds});
    }
}

function cleanUpQueries(bounds){
    for(let i = 0; i < currentQueries.length; i++){
        if(queryNeedsCancelling(currentQueries[i],bounds)){
            currentQueries.splice(i,1);
        }
    }
}

function withinBounds(boundsToTest){
    if(currentBounds == null){
        return false;
    }
    //console.log(currentBounds.north > boundsToTest.north);
    if(currentBounds.north >= boundsToTest.north && currentBounds.south <= boundsToTest.south && currentBounds.west <= boundsToTest.west && currentBounds.east >= boundsToTest.east){
        return true;
    }
    return false;
}

function queryNeedsCancelling(queryObj,boundsToCheckAgainst){
    if(queryObj.bounds.east < boundsToCheckAgainst.west || queryObj.bounds.west > boundsToCheckAgainst.east || queryObj.bounds.south > boundsToCheckAgainst.north || queryObj.bounds.north < boundsToCheckAgainst.south){
        queryObj.query.abort();
        return true;
    }
    return false;
}

function queryDefault(queryList,boundsString){
    let queryFString = createQuery(queryList,boundsString);
    let fQuery = '?data=[out:json][timeout:30];(' + queryFString + ');out body geom;';
    return 'https://overpass.kumi.systems/api/interpreter' + fQuery;
}

function queryNaturalGas(){
    //https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Natural_Gas_Liquid_Pipelines/FeatureServer/0/query?where=1%3D1&outFields=*&geometry=-122.554%2C36.544%2C-119.940%2C36.930&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json
}

function drawObjectsToMap(dataToDraw){
    let mapToEdit = this.map;
    let resultLayer = L.geoJson(dataToDraw, {
        style: function (feature) {
            return {color: getAttribute(parseIconNameFromContext(feature),ATTRIBUTE.color)};
        },
        filter: function (feature) {
            if(currentLayers.includes(feature.id) || mapToEdit.getZoom() < MINRENDERZOOM){
                return false;
            } 
            currentLayers.push(feature.id);
            return true;
        },
        onEachFeature: function (feature, layer) {
            let isPolygon = (feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "Polygon");
            let isLineString = (feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "LineString");
            let isPoint = (feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "Point");
            latlng = [];
            if (isPolygon) {
                let pos = L.latLngBounds(feature.geometry.coordinates[0]).getCenter();
                latlng.push(pos.lat);
                latlng.push(pos.lng);
            }
            else if(isLineString){
                let pos = L.latLngBounds(feature.geometry.coordinates).getCenter();
                latlng.push(pos.lat);
                latlng.push(pos.lng);
            }
            else if(isPoint){
                latlng = feature.geometry.coordinates;
            }   
            else{
                return;
            }
            latlng = latlng.reverse();
            let iconName = parseIconNameFromContext(feature);
            let iconDetails = parseDetailsFromContext(feature,iconName);
            addIconToMap(getAttribute(iconName,ATTRIBUTE.icon),latlng,iconDetails);
            layer.bindPopup(iconDetails);
            layer.on('click', function(e) {
                mapToEdit.flyToBounds(layer.getBounds(),FLYTOOPTIONS);
            });
        },
        pointToLayer: function() {
            return L.marker([0,0],{
                opacity: 0
            });
        }
        
    }).addTo(mapToEdit);
    this.markerCluster.refreshClusters();
    return resultLayer;
}

function cleanupCurrentMap(){
    currentLayers = [];
    currentBounds = null;
    currentQueries = [];
    this.map.eachLayer(function(layer){
        if(layer.feature != null){
            if(layer.feature.properties.type == 'node' || layer.feature.properties.type == 'way' || layer.feature.properties.type == 'relation'){
                this.map.removeLayer(layer);
            }   
        }
    });
    this.markerCluster.clearLayers();
}


function updateObjectsPan(origBounds,origBoundsString,queryList){ //this function updates the objects around the current viewport, since users 
                                         //generally pan around when looking at the map, therefore there's less loading time seen by the user time.
    let newBounds = {
        north: origBounds.north + (origBounds.north - origBounds.south),
        south: origBounds.south - (origBounds.north - origBounds.south),
        east: origBounds.east + (origBounds.east - origBounds.west),
        west: origBounds.west - (origBounds.east - origBounds.west)
    }
    let newBoundsString = makeBoundsString(newBounds);
    let queryFString = createQuery(queryList,newBoundsString);
    let queryURL = 'https://overpass.kumi.systems/api/interpreter?data=[out:json][timeout:15];(' + queryFString + ')->.a;(.a;-node(' + origBoundsString + ');)->.a;(.a;-way(' + origBoundsString + ');)->.a;(.a;-relation(' + origBoundsString + '););out body geom;';
    queryObjectsFromServer(queryURL,false,newBounds);
}

function removeFromMap(idToRemove,layerToRemoveFrom,mapToRemoveFrom){
    if(getAttribute(idToRemove,ATTRIBUTE.icon) != "noicon"){
        let iconUrlToSeachFor = getAttribute(idToRemove,ATTRIBUTE.icon).options.iconUrl;
        layerToRemoveFrom.eachLayer(function(layer){
            if(layer.options.icon){
                if(iconUrlToSeachFor === layer.options.icon.options.iconUrl){
                    layerToRemoveFrom.removeLayer(layer);
                }
            }
        });
    }
    mapToRemoveFrom.eachLayer(function(layer){
        if(layer.feature){
            if(parseIconNameFromContext(layer.feature) == idToRemove){
                mapToRemoveFrom.removeLayer(layer);
                currentLayers.splice(currentLayers.indexOf(layer.feature.id),1);
            }
        }
    });
}
//icon getters ------------------------------------------------
var commonTagNames = ["waterway","man_made","landuse","water","amenity"]; //precedence goes down
var blacklist = ["yes","amenity"];

function parseIconNameFromContext(feature){
    let pTObj = getParamsAndTags(feature);
    let params = pTObj.params;
    let tagsObj = pTObj.tagsObj;
    for(let j = 0; j < commonTagNames.length; j++){
        for(let i = 0; i < params.length; i++){
            if(commonTagNames[j] == params[i]){
                if(!blacklist.includes(tagsObj[params[i]])){
                    return tagsObj[params[i]];
                }
            }
        }
    }
    return 'none';
}

function getParamsAndTags(feature){
    let params = Object.keys(feature.properties.tags);
    let tagsObj = feature.properties.tags;
    if(params.length == 0){
        params = Object.keys(feature.properties.relations[0].reltags);
        tagsObj = feature.properties.relations[0].reltags;
    }
    return {params:params,tagsObj:tagsObj};
}

function parseDetailsFromContext(feature,name){
    name = capitalizeString(underScoreToSpace(name));
    let pTObj = getParamsAndTags(feature);
    let params = pTObj.params;
    let tagsObj = pTObj.tagsObj;
    let details = "<ul style='padding-inline-start:20px;margin-block-start:2.5px;'>";
    params.forEach(param => details+="<li>"+capitalizeString(underScoreToSpace(param))+": "+capitalizeString(underScoreToSpace(tagsObj[param]))+"</li>");
    details+="</ul>";
    return "<b>" + name + "</b>" + "<br>" + details;
}

function capitalizeString(str) {
    if(str == null || str.length == 0){
        return "";
    }
    str = str.split(" ");
    for (var i = 0, x = str.length; i < x; i++) {
        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }
    return str.join(" ");
}

function underScoreToSpace(str){
    return str.replace(/_/gi, " ");
}

function addIconToMap(mIcon,latlng,popUpContent){
    //filtration code
    if(mIcon == null || mIcon === "noicon"){
        return false;
    }
    let mapToEdit = this.map;
    this.markerCluster.addLayer(L.marker(latlng,{
        icon: mIcon,
        opacity: 1
    }).on('click', function(e) {
        if(mapToEdit.getZoom() < 16){
            mapToEdit.flyTo(e.latlng,16,FLYTOOPTIONS);
        }
        else{
            mapToEdit.flyTo(e.latlng,mapToEdit.getZoom(),FLYTOOPTIONS);
        }
    }).bindPopup(popUpContent));
    return true;
}

function getAttribute(option,attribute) {
    let icon;
    let color;
    switch(option){
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
        
    }
    if(attribute == ATTRIBUTE.icon){
        return icon;
    }
    else if(attribute == ATTRIBUTE.color){
        return color;
    }
    return false;
}

try{
    module.exports = {
        currentLayers: function(val){
            if(val != null){
                currentLayers = val;
            }
            return currentLayers;
        },
        currentQueries: function(val){
            if(val != null){
                currentQueries = val;
            }
            return currentQueries;
        },
        currentBounds: function(val){
            if(val != null){
                currentBounds = val;
            }
            return currentBounds;
        },
        ATTRIBUTE: ATTRIBUTE,
        makeBoundsString: makeBoundsString,
        createQuery: createQuery,
        withinBounds: withinBounds,
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
        getAttribute: getAttribute
    }
} catch(e) { }