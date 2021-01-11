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
        this.sustainQuerier = sustain_querier(); //init querier

        this.constraintData = {};
        this.constraintState = {};
        this.layerCache = {};

        this.streams = [];
        this.mapLayers = [];
        this.layerIDs = [];

        this.constraintChangedFlag = false;
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

        switch (this.getConstraintType(constraint)) {
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

        if (this.enabled){
            this.clearMapLayers();
            this.killStreams();
            this.query();
        }
    }

    getConstraintMetadata(constraintName) {
        return this.data.constraints[constraintName];
    }

    getConstraintType(constraintName) {
        console.log(constraintName);
        return this.getConstraintMetadata(constraintName).type;
    }

    constraintSetActive(constraintName, active) {
        this.constraintState[constraintName] = active;
    }

    query() {
        console.log("q");
        const b = this.map.wrapLatLngBounds(this.map.getBounds());

        const barray = [[b._southWest.lng, b._southWest.lat], [b._southWest.lng, b._northEast.lat],
        [b._northEast.lng, b._northEast.lat], [b._northEast.lng, b._southWest.lat],
        [b._southWest.lng, b._southWest.lat]];

        let q = [];
        q.push({ "$match": { geometry: { "$geoIntersects": { "$geometry": { type: "Polygon", coordinates: [barray] } } } } }); //only get geometry in viewport
        q = q.concat(this.buildConstraintPipeline());

        const stream = this.sustainQuerier.getStreamForQuery("lattice-46", 27017, this.collection, JSON.stringify(q));
        this.streams.push(stream);

        stream.on('data', function (r) {
            console.log("gd");
            const data = JSON.parse(r.getData());
            Util.normalizeFeatureID(data);

            if (!this.layerIDs.includes(data.id)) {
                this.renderGeoJSON(data);
            }
        }.bind(this));
        stream.on('end', function (r) {

        }.bind(this));
    }

    clearMapLayers() {
        RenderInfrastructure.removeSpecifiedLayersFromMap(this.mapLayers);
        this.mapLayers = [];
        this.layerIDs = [];
    }

    killStreams() {
        for (const stream of this.streams)
            stream.cancel();
        this.streams = [];
    }

    renderGeoJSON(data) {
        if (!this.enabled)
            return;
        let indexData = {};
        indexData[this.collection] = {
            "color": "FFFF00",
            "iconAddr": "../../../images/water_works.png"
        }
        this.mapLayers = this.mapLayers.concat(RenderInfrastructure.renderGeoJson(data, indexData));
        this.layerIDs.push(data.id);
    }

    buildConstraintPipeline() {
        // console.log(this.constraintData);
        // console.log(this.constraintState);
        let pipeline = [];
        let key = 0;
        for (const constraintName in this.constraintState) {
            if (this.constraintState[constraintName]) {
                const constraintData = this.constraintData[Object.keys(this.constraintData)[key]];

                if (!this.constraintIsRelevant(constraintName, constraintData))
                    continue;


                const pipelineStep = { "$match": this.buildConstraint(constraintName, constraintData) };
                pipeline.push(pipelineStep);
            }
            key++;
        }
        console.log(JSON.stringify(pipeline));
        return pipeline;
    }

    constraintIsRelevant(constraintName, constraintData) {
        if (this.getConstraintType(constraintName) === "multiselector") {
            for (const key in constraintData) {
                if (!constraintData[key])
                    return true;
            }
            console.log("invalid?");
            console.log(JSON.parse(JSON.stringify(constraintData)));
            return false;
        }
        else{
            return true;
        }
    }

    buildConstraint(constraintName, constraintData) {
        let step;
        switch (this.getConstraintType(constraintName)) {
            case "slider":
                step = {
                    "$gte": constraintData[0],
                    "$lte": constraintData[1]
                };
                break;
            case "selector":

                break;
            case "multiselector":
                let $in = [];
                for(const opt in constraintData){
                    if(constraintData[opt]){
                        $in.push(opt);
                    }
                }
                step = {"$in": $in};
                break;
        }
        const queryConstraint = {};
        queryConstraint[constraintName] = step;
        return queryConstraint;
    }
}