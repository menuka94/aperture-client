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

        if (this.data.linkedGeometry) { //linked geometry stuff
            this.linked = this.data.linkedGeometry;
            this.backgroundLoader = this.linked === "tract_geo_GISJOIN" ? window.backgroundTract : window.backgroundCounty;
            this.backgroundLoader.addNewResultListener(function (updates) {
                if (this.enabled)
                    this.listenForLinkedGeometryUpdates(updates);
            }.bind(this));
        }

        this.color = layerData.color;
        this.colorStyle = layerData.color.style;
        this.colorCode = this.buildColorCode(layerData);
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

        this.reQuery();
    }

    listenForLinkedGeometryUpdates(updates) {
        this.query(updates);
    }

    reQuery() {
        if (this.enabled) {
            this.clearMapLayers();
            this.killStreams();
            this.query();
        }
    }

    getConstraintMetadata(constraintName) {
        return this.data.constraints[constraintName];
    }

    getConstraintType(constraintName) {
        return this.getConstraintMetadata(constraintName).type;
    }

    constraintSetActive(constraintName, active) {
        this.constraintState[constraintName] = active;
        this.reQuery();
    }

    query(forcedGeometry) {
        //console.log("q");
        let q = [];
        if (!this.linked) {
            const b = this.map.wrapLatLngBounds(this.map.getBounds());
            const barray = [[b._southWest.lng, b._southWest.lat], [b._southWest.lng, b._northEast.lat],
            [b._northEast.lng, b._northEast.lat], [b._northEast.lng, b._southWest.lat],
            [b._southWest.lng, b._southWest.lat]];
            q.push({ "$match": { geometry: { "$geoIntersects": { "$geometry": { type: "Polygon", coordinates: [barray] } } } } }); //only get geometry in viewport
        }
        else {
            if(!forcedGeometry)
                this.backgroundLoader.runQuery();
            const GISJOINS = forcedGeometry ? this.backgroundLoader.convertArrayToGISJOINS(forcedGeometry) : this.backgroundLoader.getCachedGISJOINS();
            q.push({ "$match": { "GISJOIN": { "$in": GISJOINS } } });
        }

        q = q.concat(this.buildConstraintPipeline());

        //console.log(q);
        const stream = this.sustainQuerier.getStreamForQuery("lattice-46", 27017, this.collection, JSON.stringify(q));
        
        this.streams.push(stream);

        stream.on('data', function (r) {
            //console.log("gd");
            const data = JSON.parse(r.getData());
            Util.normalizeFeatureID(data);

            if (!this.layerIDs.includes(data.id)) {
                //console.log("rendor");
                this.renderData(data, forcedGeometry);
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

    renderData(data, forcedGeometry) {
        if (this.linked) {
            const GeoJSON = this.backgroundLoader.getGeometryFromGISJOIN(data.GISJOIN, forcedGeometry);
            if (!GeoJSON)
                return;

            GeoJSON.properties = {
                ...GeoJSON.properties,
                ...data
            }
            data = GeoJSON;
        }

        this.renderGeoJSON(data);
    }

    renderGeoJSON(data) {
        if (!this.enabled)
            return;
        let indexData = {};
        indexData[this.collection] = {
            "color": this.getColor(data.properties)
        }

        if (this.getIcon())
            indexData[this.collection]["iconAddr"] = "../../../images/water_works.png";

        this.mapLayers = this.mapLayers.concat(RenderInfrastructure.renderGeoJson(data, indexData));
        this.layerIDs.push(data.id);
    }

    getIcon() {
        return this.data.icon;
    }

    buildConstraintPipeline() {
        let pipeline = [];
        for (const constraintName in this.constraintState) {
            if (this.constraintState[constraintName]) {
                const constraintData = this.constraintData[constraintName];

                if (!this.constraintIsRelevant(constraintName, constraintData))
                    continue;

                const pipelineStep = { "$match": this.buildConstraint(constraintName, constraintData) };
                pipeline.push(pipelineStep);
            }
        }

        return pipeline;
    }

    constraintIsRelevant(constraintName, constraintData) {
        if (this.getConstraintType(constraintName) === "multiselector") {
            for (const key in constraintData) {
                if (!constraintData[key])
                    return true;
            }
            return false;
        }
        else {
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
                console.log("SELECTOR");
                break;
            case "multiselector":
                let $in = [];
                for (const opt in constraintData) {
                    if (constraintData[opt]) {
                        $in.push(opt);
                    }
                }
                step = { "$in": $in };
                break;
        }
        const queryConstraint = {};
        queryConstraint[constraintName] = step;
        return queryConstraint;
    }

    getColor(properties){
        switch(this.colorStyle){
            case "solid":
                return this.colorCode;
            case "gradient":
                const value = properties[this.color.variable];
                const range = this.data.constraints[this.color.variable].range;
                const normalizedValue = Math.round((value - range[0]) / (range[1] - range[0]) * 100); //normalizes value on range. results in #1 - 100
                return this.colorCode[normalizedValue];
            case "sequential":
                const varName = this.color.variable.substr(0,11) === "properties." ? this.color.variable.substring(11, this.color.variable.length) : this.color.variable; //removes a "properties." if it exists
                const v = properties[varName];
                const index = this.data.constraints[this.color.variable].options.indexOf(v);
                return this.colorCode[index];
        }
    }

    buildColorCode(layerData){
        const colorGradient = new Gradient();
        switch(this.colorStyle){
            case "solid":
                return layerData.color.colorCode;
            case "gradient":
                const colors = this.color.gradient ? this.color.gradient : ["#FF0000", "#00FF00"];
                colorGradient.setGradient(colors[0], colors[1]);
                colorGradient.setMidpoint(32);
                return colorGradient.getArray();
            case "sequential":
                const numOptions = layerData.constraints[layerData.color.variable].options.length;
                colorGradient.setGradient("#FF0000", "#00FF00");
                colorGradient.setMidpoint(numOptions);
                return colorGradient.getArray();
        }
    }

}