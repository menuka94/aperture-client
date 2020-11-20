
let SVIweights = {
    below_poverty: 1,
    unemployed: 1,
    income: 1,
    no_high_school_diploma: 1,
    aged_65_or_older: 1,
    aged_17_or_younger: 1,
    age_5_or_older_with_disability: 1,
    single_parent_households: 1,
    minority: 1,
    speaks_english_less_than_well: 1,
    multi_unit_structures: 1,
    mobile_homes: 1,
    crowding: 1,
    no_vehicle: 1,
    group_quarters: 1
}

const SVIMAP = {
    'EPL_POV': 'below_poverty',
    'EPL_UNEMP': 'unemployed',
    'EPL_PCI': 'income',
    'EPL_NOHSDP': 'no_high_school_diploma',
    'EPL_AGE65': 'aged_65_or_older',
    'EPL_AGE17': 'aged_17_or_younger',
    'EPL_DISABL': 'age_5_or_older_with_disability',
    'EPL_SNGPNT': 'single_parent_households',
    'EPL_MINRTY': 'minority',
    'EPL_LIMENG': 'speaks_english_less_than_well',
    'EPL_MUNIT': 'multi_unit_structures',
    'EPL_MOBILE': 'mobile_homes',
    'EPL_CROWD': 'crowding',
    'EPL_NOVEH': 'no_vehicle',
    'EPL_GROUPQ': 'group_quarters'
}


const SVI = {
    _sustainQuerier: sustain_querier(),
    SVIweights: {
        below_poverty: 1,
        unemployed: 1,
        income: 1,
        no_high_school_diploma: 1,
        aged_65_or_older: 1,
        aged_17_or_younger: 1,
        age_5_or_older_with_disability: 1,
        single_parent_households: 1,
        minority: 1,
        speaks_english_less_than_well: 1,
        multi_unit_structures: 1,
        mobile_homes: 1,
        crowding: 1,
        no_vehicle: 1,
        group_quarters: 1
    },
    allowRender: false,
    streams: [],
    layers: [],
    sviWeightFlag: false,
    tractBackingStore: {},
    makeQuery: function (map) {
        if (!this.allowRender) {
            return 1;
        }
        this.streams.forEach(s => s.cancel());
        this.renderSVI();
        const b = map.wrapLatLngBounds(map.getBounds());
        const barray = [[b._southWest.lng, b._southWest.lat], [b._southWest.lng, b._northEast.lat],
        [b._northEast.lng, b._northEast.lat], [b._northEast.lng, b._southWest.lat],
        [b._southWest.lng, b._southWest.lat]];

        const q1 = [{ "$match": { geometry: { "$geoIntersects": { "$geometry": { type: "Polygon", coordinates: [barray] } } } } }];

        const stream = this._sustainQuerier.getStreamForQuery("lattice-46", 27017, "tract_geo_GISJOIN", JSON.stringify(q1));

        //const q_final = this._sustainQuerier.makeCompoundQuery(q1_final, null, q2_final, null, 0);

        //const stream = this._sustainQuerier.executeCompoundQuery(q_final);

        this.streams.push(stream);

        let GISJOINS = [];
        stream.on('data', function (r) {
            const data = JSON.parse(r.getData());
            if (this.tractBackingStore[data.GISJOIN]) {
                //console.log("rejecting");
                return;
            }
            this.tractBackingStore[data.GISJOIN] = data;
            GISJOINS.push(data.GISJOIN);
            //this.continueQuery(GISJOINS);
        }.bind(this));
        stream.on('end', function (r) {
            if (GISJOINS.length !== 0) {
                this.continueQuery(GISJOINS);
            }
        }.bind(this));
    },
    clear: function () {
        RenderInfrastructure.removeSpecifiedLayersFromMap(this.layers);
        this.layers = [];
    },
    continueQuery: function (GISJOINS) {
        const q2 = [{ "$match": { "GISJOIN": { "$in": GISJOINS } } }];
        const stream = this._sustainQuerier.getStreamForQuery("lattice-46", 27017, "svi_tract_GISJOIN", JSON.stringify(q2));
        this.streams.push(stream);
        //console.log(JSON.stringify(q2));
        stream.on('data', function (r) {
            //console.log("adding props");
            const data = JSON.parse(r.getData());
            this.tractBackingStore[data.GISJOIN].properties = {
                ...this.tractBackingStore[data.GISJOIN].properties,
                ...data
            }
            this.tractBackingStore[data.GISJOIN]._id.$oid = '_' + Math.random().toString(36).substr(2, 9);
        }.bind(this));

        stream.on('end', function (r) {
            this.renderSVI();
        }.bind(this));
    },
    renderSVI: function () {
        this.clear();
        if (!this.allowRender)
            return 1;
        tract_loop:
        for (tract in this.tractBackingStore) {
            let num = 0;
            let denom = 0;
            for (prop in SVIMAP) {
                if (this.tractBackingStore[tract].properties[prop] == null) {
                    //console.log(this.tractBackingStore[tract].properties);
                    //console.log(this.tractBackingStore[tract].properties[prop]);
                    continue tract_loop;
                }
                num += this.tractBackingStore[tract].properties[prop] * this.SVIweights[SVIMAP[prop]]
                denom += this.SVIweights[SVIMAP[prop]]
            }
            //console.log(this.tractBackingStore[tract].properties);
            const SVI = num / denom;
            // console.log(SVI + " == " + this.tractBackingStore[tract].properties.RPL_THEMES); //these should equal if testing against the truth!
            // this.tractBackingStore[tract].properties.weightedSVI = SVI;
            // console.log(this.tractBackingStore[tract]);
            let color = Census_Visualizer._normalize(SVI, 0, 1);
            color = this.perc2color(color);
            const newLayers = RenderInfrastructure.renderGeoJson(this.tractBackingStore[tract], false, {
                SVI: {
                    color: color,
                    "identityField": "RPL_THEMES"
                }
            });
            this.layers = this.layers.concat(newLayers);
        }
    },
    perc2color: function (perc) {
        perc *= 100;
        if (perc > 100) {
            perc = 100;
        }
        if (perc < 0) {
            perc = 0;
        }
        var r, g, b = 0;
        if (perc < 50) {
            r = 255;
            g = Math.round(5.1 * perc);
        }
        else {
            g = 255;
            r = Math.round(510 - 5.10 * perc);
        }
        var h = r * 0x10000 + g * 0x100 + b * 0x1;
        return '#' + ('000000' + h.toString(16)).slice(-6);
    },
}
