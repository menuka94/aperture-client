# [aperture](https://github.com/Project-Sustain/aperture-client#readme) *1.0.0*

> The Aperture client for the Urban-Sustain project - http://urban-sustain.org/


### src/Iframe/Dependencies/getInfrastructure.js


#### RenderInfrastructure() 

Where the Rendering/Management related functions are






##### Returns


- `Void`



#### config(map, markerLayer, data, options) 

Sets up instance of renderer




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| map | `L.Map`  | - Leaflet map that will have things rendered to it | &nbsp; |
| markerLayer | `L.markerClusterGroup`  | - Marker cluster that will contain markers | &nbsp; |
| data | `JSON`  | - JSON that contains needed information for renderable things | &nbsp; |
| options | `object`  | - object with attributes | &nbsp; |




##### Returns


- `Void`



#### update() 

Call this when the map should be updated






##### Returns


- `Void`



#### removeFeatureFromMap(featureId) 

Removes a feature id from the map




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| featureId | `string`  | id which should be removed from map, ex: 'dam' or 'weir' | &nbsp; |




##### Returns


- `boolean`  true if feature was removed, false if not



#### addFeatureToMap(featureId) 

Adds a feature id to the map and forces an update




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| featureId | `string`  | id which should be added to map, ex: 'dam' or 'weir' | &nbsp; |




##### Returns


- `boolean`  true if feature was added, false if JSON doesnt contain tag or objects is already being rendered



#### Querier() 

Where the querying related functions are






##### Returns


- `Void`



#### queryGeoJsonFromServer(queryURL, bounds, isOsmData, callbackFn) 

Queries geoJSON or OSM Xml from an endpoint and returns it as geoJSON




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| queryURL | `string`  | URL where geoJSON/Osm Xml is | &nbsp; |
| bounds | `object`  | (not necessary when using this function by itself) bounds object like: {north:?,east:?,south:?,west:?} | &nbsp; |
| isOsmData | `boolean`  | is the url going to return OSM Xml data? (such as overpass queries) | &nbsp; |
| callbackFn | `Function`  | where the geoJSON will be sent on return, should be a 1-parameter function | &nbsp; |




##### Returns


- `Void`



#### createOverpassQueryURL(queryList, bounds, node_way_relation) 

Creates a overpass query URL 




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| queryList | `Array.<string>`  | list of queries ex: ['waterway=dam','natural=lake'] | &nbsp; |
| bounds | `object`  | bounds object in the form: {north:?,east:?,south:?,west:?}, which states WHERE to query | &nbsp; |
| node_way_relation | `number`  | binary choice for node,way,relation -- ex:111 = nodes, ways, AND relations -- 101 = nodes AND relations -- 100 = nodes only | &nbsp; |




##### Returns


- `string`  a valid overpass URL




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
