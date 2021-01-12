class BackgroundLoader {
    constructor(map) {
        this.map = map;
        this.sustainQuerier = sustain_querier(); //init querier
        this.censusTracts = [];
        this.counties = [];

        this.censusIDs = {};
        this.countyIDs = {};

        map.on('moveend', function (e) {
            const bounds = map.getBounds();
            console.log(bounds);
        });
    }

    runQuery(collection){
        const stream = this._sustainQuerier.getStreamForQuery("lattice-46", 27017, collection, JSON.stringify(this.getBasicSpatialQuery()));
        return stream;
    }

    getCensusTracts(fieldId){
        const stream = runQuery("tract_geo_GISJOIN");
        stream.on('data', function (r) {
            const data = JSON.parse(r.getData());
            
        }.bind(this));
        stream.on('end', function (r) {
            
        }.bind(this));
    }

    getCounties(fieldId){
        const stream = runQuery("county_geo_GISJOIN");
        stream.on('data', function (r) {
            const data = JSON.parse(r.getData());
            
        }.bind(this));
        stream.on('end', function (r) {
            
        }.bind(this));
    }

    getMapBoundsArray(){
        const b = this.map.wrapLatLngBounds(this.map.getBounds());
        const barray = [[b._southWest.lng, b._southWest.lat], [b._southWest.lng, b._northEast.lat],
        [b._northEast.lng, b._northEast.lat], [b._northEast.lng, b._southWest.lat],
        [b._southWest.lng, b._southWest.lat]];

        return barray;
    }

    getBasicSpatialQuery(){
        return [{ "$match": { geometry: { "$geoIntersects": { "$geometry": { type: "Polygon", coordinates: [this.getMapBoundsArray()] } } } } }];
    }
}