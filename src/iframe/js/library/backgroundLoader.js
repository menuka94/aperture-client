class BackgroundLoader {
    constructor(collection, map, maxSize) {
        this.map = map;
        this.sustainQuerier = sustain_querier(); //init querier
        this.collection = collection;
        this.maxSize = maxSize;

        this.cache = []; 
        this.listeners = [];

        this.map.on('moveend', function (e) {
            const bounds = map.getBounds();
            console.log(bounds);
            this.getData();
        }.bind(this));
    }


    //public functions ------------------------
    getGISJOINS(){
        return this.convertCacheToGISJOINS();
    }

    getGeometryFromGISJOIN(GISJOIN){
        const indx = this.indexInCache(GISJOIN);
        if(indx === -1)
            return null;
        return this.cache[indx];
    }

    addNewResultListener(func){
        this.listeners.push(func);
    }


    //private functions -----------------------
    broadcastNewResults(newResults){
        for(const callback of this.listeners){
            callback(newResults);
        }
    }

    convertCacheToGISJOINS(){
        console.log(this.cache);
        let ret = [];
        for(const obj of this.cache){
            ret.push(obj.GISJOIN);
        }
    }

    getData(){
        const stream = this.sustainQuerier.getStreamForQuery("lattice-46", 27017, this.collection, JSON.stringify(this.getBasicSpatialQuery()));
        let newResults = [];
        stream.on('data', function (r) {
            const data = JSON.parse(r.getData());
            Util.normalizeFeatureID(data);

            //remove an existing refrence
            const indexInCache = this.indexInCache(data.GISJOIN);
            if(indexInCache !== -1)
                this.cache.splice(indexInCache);
            else
                newResults.push(data.GISJOIN);

            this.cache.unshift(data); //add it to the front of the arr

            if(this.cache.length > this.maxSize) //if length is too long, pop from end
                this.cache.pop(); 
        }.bind(this));
        stream.on('end', function (r) {
            this.broadcastNewResults(newResults);
        }.bind(this));
    }

    indexInCache(GISJOIN){
        let indx = 0;
        for(const obj of this.cache){
            if(obj.GISJOIN === GISJOIN)
                return indx;
            indx++;
        }
        return -1;
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