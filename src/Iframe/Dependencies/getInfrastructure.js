//Author: Daniel Reynolds
//Purpose: Get osm nodes, ways, and relations, and then translate them onto a leaflet map
//Dependencies: osmtogeojson, jquery, Leaflet.markerCluster

function updateObjects(queryList,bounds,clusterLayer,map){ //gets the objects within the current viewport
    let sw = bounds.getSouthWest().wrap();
    let ne = bounds.getNorthEast().wrap();
    let queryFString = '';
    let bBounds = {
        north: ne.lat,
        south: sw.lat,
        east: ne.lng,
        west: sw.lng
    };
    let boundsString = bBounds.south + ',' + bBounds.west + ',' + bBounds.north + ',' + bBounds.east;
    for(let i = 0; i < queryList.length; i++){
        if(map.getZoom() >= queryList[i].zoom){
            query = queryList[i].query.replace(/ /g, ''); //remove whitespace
            let queries = {
                nodeQuery: 'node[' + query + '](' + boundsString + ');',
                wayQuery: 'way[' + query + '](' + boundsString + ');',
                relationQuery: 'relation[' + query + '](' + boundsString + ');'
            }
            queryFString += queries.nodeQuery + queries.wayQuery + queries.relationQuery;
        }
    }
    let fQuery = '?data=[out:json][timeout:15];(' + queryFString + ');out body geom;';
    queryObjectsFromServer(map,fQuery);
}

function queryObjectsFromServer(map,fQuery){
    $.getJSON('https://overpass.kumi.systems/api/interpreter' + fQuery, function(osmDataAsJson) {
        drawObjectsToMap(map,osmtogeojson(osmDataAsJson));
    });
}

function drawObjectsToMap(map,dataToDraw){
    cleanupCurrentMap(map);
    let resultLayer = L.geoJson(dataToDraw, {
        style: function (feature) {
            return {color: "#ff0000"};
        },
        filter: function (feature, layer) {
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
            addIconToMap(getIcon(parseIconNameFromContext(feature)),map,latlng);
        },
        pointToLayer: function(geoJsonPoint, latlng) {
            return L.marker(latlng,{
                opacity:0
            });
        }
        
    }).addTo(map);
}

function cleanupCurrentMap(map){
    map.eachLayer(function(layer){
        if(layer.feature != null){
            if(layer.feature.properties.type == 'node' || layer.feature.properties.type == 'way' || layer.feature.properties.type == 'relation'){
                map.removeLayer(layer);
            }   
        }
        if(layer.options.icon != null){
            map.removeLayer(layer);
        }
    });
}



function updateObjectsPan(query,bounds){ //this function updates the objects around the current viewport, since users 
                                         //generally pan around when looking at the map, therefore there's less 'blank' time.
    $.getJSON('https://overpass.kumi.systems/api/interpreter?data=[out:json];' + query, function(data) {
        //data is the JSON string
        console.log(data);
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

function addIconToMap(mIcon,map,latlng){
    let marker = L.marker(latlng,{
        icon: mIcon
    }).addTo(map);
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