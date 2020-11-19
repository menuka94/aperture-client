
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
    allowRender: false,
    streams: [],
    layers: [],
    sviWeightFlag: false,
    makeQuery: function (map) {
        if (!this.allowRender) {
            return 1;
        }
        this.streams.forEach(s => s.cancel());

        if (this.sviWeightFlag) {
            this.clear();
            this.sviWeightFlag = false;
        }

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
        let tractData = {};
        stream.on('data', function (r) {
            const data = JSON.parse(r.getData());
            tractData[data.GISJOIN] = data;
            GISJOINS.push(data.GISJOIN);
            if (GISJOINS.length > 20) {
                this.continueQuery(GISJOINS, tractData);
                GISJOINS = [];
                tractData = {};
            }
        }.bind(this));
        stream.on('end', function (r) {
            this.continueQuery(GISJOINS, tractData);
        }.bind(this));
    },
    clear: function () {
        RenderInfrastructure.removeSpecifiedLayersFromMap(this.layers);
        this.layers = [];
    },
    continueQuery: function (GISJOINS, tractData) {
        const q2 = [{ "$match": { "GISJOIN": { "$in": GISJOINS } } }];
        const stream = this._sustainQuerier.getStreamForQuery("lattice-46", 27017, "svi_tract_GISJOIN", JSON.stringify(q2));
        //console.log(JSON.stringify(q2));
        stream.on('data', function (r) {
            const data = JSON.parse(r.getData());
            tractData[data.GISJOIN].properties = {
                ...tractData[data.GISJOIN].properties,
                ...data
            }
            let num = 0;
            let denom = 0;
            for(prop in SVIMAP){
                num += data[prop]
                denom += 1
            }
            const SVI = num / denom;
            console.log(SVI + " == " + data.RPL_THEMES);
            // sviData[data.GISJOIN] = data;
            // GISJOINS.push(data.GISJOIN);
            // if(GISJOINS.length > 20){

            //     GISJOINS = [];
            //     sviData = {};
            // }
        }.bind(this));

    },
    renderSVI: function () {
        if (!this.allowRender) {
            return 1;
        }

    }
}
