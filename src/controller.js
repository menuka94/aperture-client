var view = {lat: 40.7580, lng: 286.0145};
var zoomLevel = 3;

var setterFunctions = []; //these are added at the end of each map's html

var map1IsBeingMoved = false;
var map2IsBeingMoved = false;
var map3IsBeingMoved = false;
var map4IsBeingMoved = false;

function setGlobalZoom(_zoomLevel,mapNumber){
    if(checkIfAnyCanMove()){
        initializeMap(mapNumber,true);
    }
    if(!verifyCorrectMap(mapNumber)){
        //console.log("map " + mapNumber + " wasnt the corrent map");
        return;
    }
    //console.log("setting global zoom to map " + mapNumber);
    //zoomLevel = _zoomLevel;
    //updateMaps(mapNumber);
}

function setGlobalPosition(_view,mapNumber){
    if(checkIfAnyCanMove()){
        initializeMap(mapNumber,true);
        //console.log("map " + mapNumber + " set to true");
    }
    if(!verifyCorrectMap(mapNumber)){
        //console.log("map1 wasnt ready for move");
        return;
    }
    //console.log("setting postion of 1");
    view = _view;
    updateMaps(mapNumber);
}

function updateMaps(mapNumber){
    for(var i = 1; i <= setterFunctions.length; i++){
        if(i != mapNumber){
            setterFunctions[i - 1](view,zoomLevel);
            //console.log("updating map " + i);
        }
    }
}

function checkIfAnyCanMove(){ //checks if any map can start moving at the current moment
    if(map1IsBeingMoved || map2IsBeingMoved || map3IsBeingMoved || map4IsBeingMoved){
        return false;
    }
    else{
        return true;
    }
}

function initializeMap(mapNumber,TorF){ //sets mapNumber to True or False
    //console.log("setting map " + mapNumber + " to true");
    switch(mapNumber){
        case 1:
            map1IsBeingMoved = TorF;
            break;
        case 2:
            map2IsBeingMoved = TorF;
            break;
        case 3:
            map3IsBeingMoved = TorF;
            break;
        case 4:
            map4IsBeingMoved = TorF;
            break;
        default:
            return;
    }
}

function verifyCorrectMap(mapNumber){
    if(map1IsBeingMoved || map2IsBeingMoved || map3IsBeingMoved || map4IsBeingMoved){ //check if any map is being moved currently
        switch(mapNumber){ //checks if the map that is calling the function is the one being moved, returns true if it is, false if it isnt
            case 1:
                return map1IsBeingMoved;
            case 2:
                return map2IsBeingMoved;
            case 3:
                return map3IsBeingMoved;
            case 4:
                return map4IsBeingMoved;
            default:
                return false;
        }
    }
    else{
        return false;
    }
}