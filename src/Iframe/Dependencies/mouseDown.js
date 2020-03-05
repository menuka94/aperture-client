var thisMapNumber = -1; //set from the MAPNUMBER const in the iframe
document.addEventListener('mousedown', function(event) { 
    parent.mouseDown(thisMapNumber); //gives this map permission to move
});
document.addEventListener('mouseup', function(event) { //look in controller.js for what this does
    parent.mouseUp();
});