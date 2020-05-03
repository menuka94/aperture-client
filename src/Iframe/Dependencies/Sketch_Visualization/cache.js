Custom_Cache = {
    initialize: function(options) {
        this._options = options | {max: 5};
        this._cache = new Map();
    },

    getCanvasForTime: function(time){
        return this._cache.get(time);
    },

    addToCache: function(time, ctx, dataLoader){
        if(this.isInCache(time)){
            this._cache.delete(time);
        } else if (this._cache.size === this._options.max){
            this._cache.delete(this._first());
        }
        this._cache.set(time, [ctx, dataLoader]);
    },

    removeFromCache: function(time){
        this._cache.get(time)[0].cancelActiveStreams();
        this._cache.delete(time);
    },

    isInCache: function (time) {
        return this._cache.has(time);
    },

    clear: function(){
        this._cache.clear();
    },

    _first: function(){
        return this._cache.keys().next().value;
    }
};


cache = function(options) {
    const cache = Custom_Cache;
    cache.initialize(options);
    return cache;
};

try{
    module.exports = {
        cache: cache
    }
} catch(e) { }