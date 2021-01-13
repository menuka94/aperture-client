class GeometryLoader {
    constructor(collection, map, maxSize) {
        this.map = map;
        this.sustainQuerier = sustain_querier(); //init querier
        this.collection = collection;
        this.maxSize = maxSize;

        this.cache = [];
        this.tempCache = [];
        this.listeners = [];
        this.streams = [];
    }


    //public functions ------------------------
    getCachedGISJOINS() {
        return this.convertArrayToGISJOINS(this.cache);
    }

    getGeometryFromGISJOIN(GISJOIN, arr) {
        const indx = arr ? this.indexInArray(GISJOIN, arr) : this.indexInCache(GISJOIN);
        if (indx === -1)
            return null;
        return arr ? arr[indx] : this.cache[indx];
    }

    addNewResultListener(func) {
        this.listeners.push(func);
    }

    convertArrayToGISJOINS(arr) {
        let ret = [];
        for (const obj of arr) {
            ret.push(obj.GISJOIN);
        }
        return ret;
    }

    runQuery(){
        this.killAllStreams();
        this.getData();
    }


    //private functions -----------------------
    broadcastNewResults(newResults) {
        for (const callback of this.listeners) {
            callback(newResults);
        }
    }

    getData() {
        const stream = this.sustainQuerier.getStreamForQuery("lattice-46", 27017, this.collection, JSON.stringify(this.getBasicSpatialQuery()));
        this.streams.push(stream);
        let newResults = [];
        stream.on('data', function (r) {
            const data = JSON.parse(r.getData());
            Util.normalizeFeatureID(data);

            //remove an existing refrence
            const indexInCache = this.indexInCache(data.GISJOIN);
            if (indexInCache !== -1){
                this.cache.splice(indexInCache, 1);
            }
            else{
                newResults.push(data);
            }

            this.cache.unshift(data); //add it to the front of the arr

            if (this.cache.length > this.maxSize){ //if length is too long, pop from end
                this.cache.pop();
            }
        }.bind(this));
        stream.on('end', function (r) {
            this.broadcastNewResults(newResults);
        }.bind(this));
    }

    indexInCache(GISJOIN) {
        return this.indexInArray(GISJOIN, this.cache);
    }

    killAllStreams(){
        for(const stream of this.streams){
            stream.cancel();
        }
        this.streams = [];
    }

    indexInArray(GISJOIN, arr){
        let indx = 0;
        for (const obj of arr) {
            if (obj.GISJOIN === GISJOIN){
                return indx;
            }
            indx++;
        }
        return -1;
    }

    getMapBoundsArray() {
        const b = this.map.wrapLatLngBounds(this.map.getBounds());
        const barray = [[b._southWest.lng, b._southWest.lat], [b._southWest.lng, b._northEast.lat],
        [b._northEast.lng, b._northEast.lat], [b._northEast.lng, b._southWest.lat],
        [b._southWest.lng, b._southWest.lat]];

        return barray;
    }

    getBasicSpatialQuery() {
        return [{ "$match": { geometry: { "$geoIntersects": { "$geometry": { type: "Polygon", coordinates: [this.getMapBoundsArray()] } } } } }];
    }
}