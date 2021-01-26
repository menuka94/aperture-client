// exampleFilterDigester.js

// Create a filter.
let filter = new MapDataFilter();

// Tell the RenderInfrastructure object to use it.
RenderInfrastructure.useFilter(filter);

// use .getModel to get information from it.
window.setInterval(() => {
    console.log(filter.getModel("temp", map.getBounds()));
    console.log(`${map.getBounds().getWest()}, ${map.getBounds().getEast()}`);
}, 2000);


