//Author: Daniel Reynolds
//Purpose: Get osm nodes, ways, and relations, and then translate them onto a leaflet map
//Dependencies: osmtogeojson, jquery, Leaflet.markerCluster

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
function updateObjects(queryListOrig,bounds,markerCluster,map,cleanUpMap){ //gets the objects within the current viewport
    let sw = bounds.getSouthWest().wrap();
    let ne = bounds.getNorthEast().wrap();
    let queryList= queryListOrig.slice() //clone querylist
    let bBounds = {
        north: ne.lat,
        south: sw.lat,
        east: ne.lng,
        west: sw.lng
    };
    let boundsString = bBounds.south + ',' + bBounds.west + ',' + bBounds.north + ',' + bBounds.east;
    /*for(let i = 0; i < queryList.length; i++){ //filter objects that shouldnt render at this level
        if(queryList[i].zoom > map.getZoom()){
            queryList.splice(i,1);
        }
    }*/
    let queryFString = createQuery(queryList,boundsString);
    let fQuery = '?data=[out:json][timeout:15];(' + queryFString + ');out body geom;';
    queryObjectsFromServer(map,fQuery,markerCluster,cleanUpMap);
    updateObjectsPan(bBounds,boundsString,queryList,map,markerCluster);
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

function queryObjectsFromServer(map,fQuery,markerCluster,cleanUpMap){
    $.getJSON('https://overpass.kumi.systems/api/interpreter' + fQuery, function(osmDataAsJson) {
        drawObjectsToMap(map,osmtogeojson(osmDataAsJson),markerCluster,cleanUpMap);
    });
}

function drawObjectsToMap(map,dataToDraw,markerCluster,cleanUpMap){
    if(cleanUpMap){
        cleanupCurrentMap(map,markerCluster);
    }
    let resultLayer = L.geoJson(dataToDraw, {
        style: function (feature) {
            return {color: getAttribute(parseIconNameFromContext(feature),ATTRIBUTE.color)};
        },
        filter: function (feature) {
            if(currentLayers.includes(feature.id) || map.getZoom() < MINRENDERZOOM){
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
            addIconToMap(getAttribute(iconName,ATTRIBUTE.icon),markerCluster,latlng,map,iconName);
        },
        pointToLayer: function() {
            return L.marker([0,0],{
                opacity: 0
            });
        }
        
    }).addTo(map);
    markerCluster.refreshClusters();
}

function cleanupCurrentMap(map,markerCluster){
    currentLayers = [];
    map.eachLayer(function(layer){
        if(layer.feature != null){
            if(layer.feature.properties.type == 'node' || layer.feature.properties.type == 'way' || layer.feature.properties.type == 'relation'){
                map.removeLayer(layer);
            }   
        }
    });
    markerCluster.clearLayers();
}


function updateObjectsPan(origBounds,origBoundsString,queryList,map,markerCluster){ //this function updates the objects around the current viewport, since users 
                                         //generally pan around when looking at the map, therefore there's less loading time seen by the user time.
    let newBounds = {
        north: origBounds.north + (origBounds.north - origBounds.south) * 2,
        south: origBounds.south - (origBounds.north - origBounds.south) * 2,
        east: origBounds.east + (origBounds.east - origBounds.west) * 2,
        west: origBounds.west - (origBounds.east - origBounds.west) * 2
    }
    let newBoundsString = newBounds.south + ',' + newBounds.west + ',' + newBounds.north + ',' + newBounds.east;
    let queryFString = createQuery(queryList,newBoundsString);
    let fQuery = '?data=[out:json][timeout:15];(' + queryFString + ')->.a;(.a;-node(' + origBoundsString + ');)->.a;(.a;-way(' + origBoundsString + ');)->.a;(.a;-relation(' + origBoundsString + '););out body geom;';
    queryObjectsFromServer(map,fQuery,markerCluster);
}

function removeFromMap(idToRemove,layerToRemoveFrom,mapToRemoveFrom){
    let iconUrlToSeachFor = getAttribute(idToRemove,ATTRIBUTE.icon).options.iconUrl;
    layerToRemoveFrom.eachLayer(function(layer){
        if(layer.options.icon){
            if(iconUrlToSeachFor === layer.options.icon.options.iconUrl){
                layerToRemoveFrom.removeLayer(layer);
            }
        }
    });
    mapToRemoveFrom.eachLayer(function(layer){
        if(layer.feature){
            if(parseIconNameFromContext(layer.feature) == idToRemove){
                mapToRemoveFrom.removeLayer(layer);
            }
        }
    });
}

//icon getters ------------------------------------------------
var commonTagNames = ["amenity","man_made","waterway","landuse"];
var blacklist = ["yes","amenity"];

function parseIconNameFromContext(feature){
    //console.log(feature.properties.tags);
    let params = Object.keys(feature.properties.tags);
    for(let i = 0; i < params.length; i++){
        if(commonTagNames.includes(params[i])){
            if(!blacklist.includes(feature.properties.tags[params[i]])){
                return feature.properties.tags[params[i]];
            }
        }
        //console.log(feature.properties.tags[Object.keys(feature.properties.tags)[0]]);
    }
    return 'drinking_water';
}

function addIconToMap(mIcon,markerCluster,latlng,map,popUpContent){
    //filtration code
    if(mIcon == null){
        return false;
    }
    markerCluster.addLayer(L.marker(latlng,{
        icon: mIcon,
        opacity: 1
    }).on('click', function(e) {
        if(map.getZoom() < 16){
            map.flyTo(e.latlng,16,FLYTOOPTIONS);
        }
        else{
            map.flyTo(e.latlng,map.getZoom(),FLYTOOPTIONS);
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
            color = "#00FFFF";
            break;
        case "wastewater_plant":
            icon = new L.Icon({
                iconUrl: "../../../images/sewage.png",
                iconSize: [25, 25]
            });
            color = "#FF00FF";
            break;
    }
    if(attribute == ATTRIBUTE.icon){
        return icon;
    }
    else if(attribute == ATTRIBUTE.color){
        return color;
    }
};