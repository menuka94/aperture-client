const COVID = {
    _sustainQuerier: sustain_querier(),
    streams: [],
    layers: [],
    changeFlag: false,
    allowRender: false,
    dateStart: 0,
    dateEnd: 0,
    knownTracts: {},
    makeQuery: function (map) {
        if (!this.allowRender) {
            return 1;
        }
        this.streams.forEach(s => s.cancel());

        if (this.changeFlag) {
            this.clear();
            this.changeFlag = false;
        }

        const b = map.wrapLatLngBounds(map.getBounds());
        const barray = [[b._southWest.lng, b._southWest.lat], [b._southWest.lng, b._northEast.lat],
        [b._northEast.lng, b._northEast.lat], [b._northEast.lng, b._southWest.lat],
        [b._southWest.lng, b._southWest.lat]];

        const q1 = [{ "$match": { geometry: { "$geoIntersects": { "$geometry": { type: "Polygon", coordinates: [barray] } } } } }];

        const stream = this._sustainQuerier.getStreamForQuery("lattice-46", 27017, "county_geo_GISJOIN", JSON.stringify(q1));

        this.streams.push(stream);

        let FIPS = [];
        let tractData = {};
        stream.on('data', function (r) {
            const data = JSON.parse(r.getData());
            const countyFips = data.properties.STATEFP10 + data.properties.COUNTYFP10;
            if (this.knownTracts[countyFips]) {
                return;
            }
            this.knownTracts[countyFips] = 1;
            tractData[countyFips] = data;
            FIPS.push(countyFips);
            if (FIPS.length > 20) {
                this.continueQuery(FIPS, tractData);
                FIPS = [];
                tractData = {};
            }
        }.bind(this));
        stream.on('end', function (r) {
            if (FIPS.length < 1)
                return;
            this.continueQuery(FIPS, tractData);
            this.continueQuery2(FIPS, tractData);
        }.bind(this));
    },
    clear: function () {
        RenderInfrastructure.removeSpecifiedLayersFromMap(this.layers);
        this.knownTracts = {};
        this.layers = [];
    },
    
    continueQuery2: function (FIPS, tractData) {
        const slidingWindowStart = ((this.dateStart - 1580169600000) / (1000 * 60 * 60 * 24));
        const slidingWindowSize = ((this.dateEnd - this.dateStart) / (1000 * 60 * 60 * 24));
        const query = [
            {
                $match: {
                    "countyFipsCode": {
                        $in: FIPS,
                    }
                }
            }
            , { $sort: { "date": 1 } }
            , { $group: { _id: "$countyFipsCode", arr: { $push: { "cases": "$newCaseCount", "date": "$date" } } } }
            , { $addFields: { "numDays": slidingWindowSize, "startDate": { "$arrayElemAt": ["$arr.date", slidingWindowStart] } } }
            , {
                $addFields: {
                    "arr": {
                        $map: {
                            input: { $range: [slidingWindowStart, { $subtract: [{ $size: "$arr" }, (slidingWindowSize - 1)] }] },
                            as: "z",
                            in: {
                                avg: { $avg: { $slice: ["$arr.cases", "$$z", slidingWindowSize] } },
                                d: { $arrayElemAt: ["$arr.date", { $add: ["$$z", (slidingWindowSize - 1)] }] }
                            }
                        }
                    }
                }
            }
        ];
        // console.log(JSON.stringify(query));
        // const stream = this._sustainQuerier.getStreamForQuery("lattice-46", 27017, "covid_county", JSON.stringify(query));
        // this.streams.push(stream);

        // stream.on('data', function (r) {
        //     const data = JSON.parse(r.getData()).arr;

        //     console.log(data);
        // }.bind(this));
        // stream.on('end', function (r) {
        //     console.log("done");
        // }.bind(this));
    },
    continueQuery(FIPS, polys) {
        const q = [{ "$match": { "countyFipsCode": { "$in": FIPS }, "$or": [{ "epoch_time": this.dateStart }, { "epoch_time": this.dateEnd }] } }]
        //console.log(JSON.stringify(q));
        const stream = this._sustainQuerier.getStreamForQuery("lattice-46", 27017, "covid_county", JSON.stringify(q));

        //console.log(JSON.stringify(q));
        this.streams.push(stream);

        stream.on('data', function (r) {
            const data = JSON.parse(r.getData());
            //console.log(data);
            if (data.date.$date === this.dateStart) { //start
                //console.log("here");
                polys[data.countyFipsCode].properties.start_date = new Date(data.date.$date).toUTCString().substr(0, 16);
                polys[data.countyFipsCode].properties.cases_start = data.totalCaseCount;
                polys[data.countyFipsCode].properties.cases_per_1000_pop_start = (data.totalCaseCount / (data.population / 1000)).toFixed(2);
            }
            else if (data.date.$date === this.dateEnd) {
                polys[data.countyFipsCode].properties.end_date = new Date(data.date.$date).toUTCString().substr(0, 16);;
                polys[data.countyFipsCode].properties.cases_end = data.totalCaseCount;
                polys[data.countyFipsCode].properties.cases_per_1000_pop_end = (data.totalCaseCount / (data.population / 1000)).toFixed(2);
            }
            if (polys[data.countyFipsCode].properties.cases_start !== null && polys[data.countyFipsCode].properties.cases_end !== null) {
                polys[data.countyFipsCode].properties.name = data.countyName + ", " + data.stateAbbr;
                polys[data.countyFipsCode].properties.increase_in_cases = polys[data.countyFipsCode].properties.cases_end - polys[data.countyFipsCode].properties.cases_start;
                polys[data.countyFipsCode].properties.increase_in_cases_per_1000_pop = (polys[data.countyFipsCode].properties.cases_per_1000_pop_end - polys[data.countyFipsCode].properties.cases_per_1000_pop_start).toFixed(2);
                let twoWeeksNum = ((this.dateEnd - this.dateStart) / (1000 * 60 * 60 * 24 * 14));
                polys[data.countyFipsCode].properties.increase_in_cases_per_1000_pop_per_2_weeks = ((polys[data.countyFipsCode].properties.cases_per_1000_pop_end - polys[data.countyFipsCode].properties.cases_per_1000_pop_start) / twoWeeksNum).toFixed(2);
                polys[data.countyFipsCode].properties.increase_in_cases_pct = (((polys[data.countyFipsCode].properties.cases_end / polys[data.countyFipsCode].properties.cases_start) - 1) * 100).toFixed(2) + '%';
            }
        }.bind(this));

        stream.on('end', function (end) {
            if (this.allowRender) {
                for (x in polys) {
                    this.covidDraw(polys[x]);
                }
            }
            this.streams.splice(this.streams.indexOf(stream), 1);
        }.bind(this));
    },
    covidDraw: function (poly) {
        //console.log(poly);
        //console.log(poly.properties.increase_in_cases_per_1000_pop);
        //console.log(3 * ((Number(document.getElementById("covid-19_dateRange").noUiSlider.get()[1]) - Number(document.getElementById("covid-19_dateRange").noUiSlider.get()[0])) / (1000 * 60 * 60 * 24 * 14)));
        let color = Census_Visualizer._normalize(poly.properties.increase_in_cases_per_1000_pop, 0, 3 * ((this.dateEnd - this.dateStart) / (1000 * 60 * 60 * 24 * 14)));
        color = SVI.perc2color(color), 75;
        //console.log(color);
        let extra = "<br>";
        if (poly.properties.average_age)
            extra += "<li>Average Age: @@average_age@@</li>";
        if (poly.properties.min_distance_to_hospital)
            extra += "<li>Nearest Hospital: @@min_distance_to_hospital@@</li>";

        let newLayers = RenderInfrastructure.renderGeoJson(poly, false, {
            "COVID-19": {
                "color": color,
                "identityField": "GEOID10",
                "noBorder": true,
                "popup": "<ul style='padding-inline-start:20px;margin-block-start:2.5px;'>" +
                    "<li><b>County: @@name@@</b></li>" +
                    "<li><b>Increase in Cases Raw: @@increase_in_cases@@</b></li>" +
                    "<li><b>Increase in Cases Per 1000 People: @@increase_in_cases_per_1000_pop@@</b></li>" +
                    "<li style='color:red'><b>Increase in Cases Per 1000 People, per 2 Weeks: @@increase_in_cases_per_1000_pop_per_2_weeks@@</b></li>" +
                    "<li><b>Increase in Cases %: @@increase_in_cases_pct@@</b></li>" +
                    "<br><li>Start Date: @@start_date@@</li>" +
                    "<li>Raw Cases Start: @@cases_start@@</li>" +
                    "<li>Cases Per 1000 People Start: @@cases_per_1000_pop_start@@</li>" +
                    "<br><li>End Date: @@end_date@@</li>" +
                    "<li>Raw Cases End: @@cases_end@@</li>" +
                    "<li>Cases Per 1000 People End: @@cases_per_1000_pop_end@@</li>" +
                    extra +
                    "</ul>"
            }
        });
        this.layers = this.layers.concat(newLayers);
    },
}