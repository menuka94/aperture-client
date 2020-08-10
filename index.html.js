document.addEventListener('mousedown', function(event) { //since these two being called means the mouse is not on any map, set all to false
    map1IsMoused = false;
    map2IsMoused = false;
    map3IsMoused = false;
    map4IsMoused = false;
});
document.addEventListener('mouseup', function(event) {
    map1IsMoused = false;
    map2IsMoused = false;
    map3IsMoused = false;
    map4IsMoused = false;
});