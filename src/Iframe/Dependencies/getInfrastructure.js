//Author: Daniel Reynolds
//Purpose: Get osm nodes, ways, and relations, and then translate them onto a leaflet map
//Dependencies: osmtogeojson, jquery, Leaflet.markerCluster

let currentLayers = [];
function updateObjects(queryListOrig,bounds,markerCluster,map){ //gets the objects within the current viewport
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
    queryObjectsFromServer(map,fQuery,markerCluster);
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

function queryObjectsFromServer(map,fQuery,markerCluster){
    $.getJSON('https://overpass.kumi.systems/api/interpreter' + fQuery, function(osmDataAsJson) {
        drawObjectsToMap(map,osmtogeojson(osmDataAsJson),markerCluster);
    });
}

function drawObjectsToMap(map,dataToDraw,markerCluster){
    /*if(cleanUpMap){
        cleanupCurrentMap(map);
    }*/
    let resultLayer = L.geoJson(dataToDraw, {
        style: function (feature) {
            return {color: "#ff0000"};
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
            addIconToMap(getIcon(parseIconNameFromContext(feature)),markerCluster,latlng);
        },
        pointToLayer: function(geoJsonPoint, latlng) {
            return L.marker(latlng,{
                opacity:0
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

function addIconToMap(mIcon,map,latlng){
    //filtration code
    if(mIcon == null){
        return false;
    }
    map.addLayer(L.marker(latlng,{
        icon: mIcon
    }));
    return true;
}

function getIcon(option) {
    switch(option){
        case "drinking_water":
            return new L.Icon({
                iconUrl: "../../../images/drinking_fountain.png",
                iconSize: [25, 25]
            });
        case "fountain":
            return new L.Icon({
                iconUrl: "../../../images/fountain.png",
                iconSize: [20, 20]
            });
        case "fire_hydrant":
            return new L.Icon({
                iconUrl: "../../../images/fire_hydrant.png",
                iconSize: [20, 20]
            });
        case "dam":
            return new L.Icon({
                iconUrl: "../../../images/dam.png",
                iconSize: [25, 25]
            });
        case "water_tap":
            return new L.Icon({
                iconUrl: "../../../images/tap_water.png",
                iconSize: [25, 25]
            });
        case "water_tower":
            return new L.Icon({
                iconUrl: "../../../images/water_tower.png",
                iconSize: [25, 25]
            });
        case "water_well":
            return new L.Icon({
                iconUrl: "../../../images/water_well.png",
                iconSize: [25, 25]
            });
        case "water_works":
            return new L.Icon({
                iconUrl: "../../../images/water_works.png",
                iconSize: [25, 25]
            });
        case "wastewater_plant":
            return new L.Icon({
                iconUrl: "../../../images/sewage.png",
                iconSize: [25, 25]
            });
    }
};