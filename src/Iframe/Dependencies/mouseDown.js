document.addEventListener('mousedown', function(event) {
    parent.clearAll();
    parent.mouse1 = true;
});
document.addEventListener('mouseup', function(event) {
    parent.mouse1 = false;
});