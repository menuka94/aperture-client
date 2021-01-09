/**
 * @namespace AutoQuery
 * @file Query layers in a very general fashion
 * @author Daniel Reynolds
 * @dependencies autoMenu.js menuGenerator.js
 * @notes Work in progress!
 */

class AutoQuery {
    constructor(layerData) {
        this.data = layerData;
        this.collection = layerData.collection;
        this.map = layerData.map();
        this.sustainQuerier = sustain_querier() //init querier

        this.constraintData = {};
        this.constraintState = {};
        this.layerCache = {}

        this.streams = [];
        this.mapLayers = [];
        this.layerIDs = [];

        this.enabled = false;
    }

    onAdd() {
        console.log("add");
        this.enabled = true;
    }

    onRemove() {
        console.log("rm");
        this.clearMapLayers();
        this.killStreams();
        this.layerIDs = [];
        this.enabled = false;
    }

    //updates a constraints data, and adds it if not existent
    updateConstraint(layer, constraint, value, isActive) {
        if (!constraint)
            return;
        const constraintMetadata = this.data.constraints[constraint];
        switch (constraintMetadata.type) {
            case "slider":
                if (Array.isArray(value))
                    for (let i = 0; i < value.length; i++) //change string to number
                        value[i] = Number(value[i]);
                else
                    value = Number(value);
                this.constraintData[constraint] = value;
                break;
            case "selector":
                this.constraintData[constraint] = value;
                break;
            case "multiselector":
                if (!this.constraintData[constraint])
                    this.constraintData[constraint] = {};
                this.constraintData[constraint][value] = isActive;
                break;
        }
    }

    constraintSetActive(constraint, active) {
        this.constraintState[constraint] = active;
    }

    query() {
        console.log("q");
        const b = this.map.wrapLatLngBounds(this.map.getBounds());

        const barray = [[b._southWest.lng, b._southWest.lat], [b._southWest.lng, b._northEast.lat],
        [b._northEast.lng, b._northEast.lat], [b._northEast.lng, b._southWest.lat],
        [b._southWest.lng, b._southWest.lat]];

        const q = [
            { "$match": { geometry: { "$geoIntersects": { "$geometry": { type: "Polygon", coordinates: [barray] } } } } }
        ];

        console.log(JSON.stringify(q));
        const stream = this.sustainQuerier.getStreamForQuery("lattice-46", 27017, this.collection, JSON.stringify(q));
        this.streams.push(stream);

        stream.on('data', function (r) {
            console.log("gd");
            const data = JSON.parse(r.getData());
            Util.normalizeFeatureID(data);

            if(!this.layerIDs.includes(data.id)){
                console.log(this.layerIDs);
                this.renderGeoJSON(data);
            }
        }.bind(this));
        stream.on('end', function (r) {

        }.bind(this));
    }

    clearMapLayers() {
        console.log(this.mapLayers);
        RenderInfrastructure.removeSpecifiedLayersFromMap(this.mapLayers);
        this.mapLayers = [];
    }

    killStreams(){
        for(const stream of this.streams)
            stream.cancel();
        this.streams = [];
    }

    renderGeoJSON(data) {
        if(!this.enabled)
            return;
        console.log("rembveder");
        let indexData = {};
        indexData[this.collection] = {
            "color": "FFFF00",
            "iconAddr": "../../../images/water_works.png"
        }
        this.mapLayers = this.mapLayers.concat(RenderInfrastructure.renderGeoJson(data, indexData));
        this.layerIDs.push(data.id); 
    }
}