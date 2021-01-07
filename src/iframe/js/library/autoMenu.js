const AutoMenu = {
    _sustainQuerier: sustain_querier(),

    build: async function (menuMetaData, overwrite) {
        return new Promise(resolve => {
            //stream the metadata catalog in
            const q = [];
            const stream = this._sustainQuerier.getStreamForQuery("lattice-46", 27017, "Metadata", JSON.stringify(q));
            let catalog = {};
            stream.on('data', function (r) {
                const data = JSON.parse(r.getData());
                catalog[data.collection] = data;
            }.bind(this));


            stream.on('end', function (end) {
                // console.log("end");
                // console.log(catalog);
                const autoMenu = this.bindMenuToCatalog(menuMetaData, catalog);

                resolve({
                    ...autoMenu,
                    ...overwrite
                });

            }.bind(this));
        });
    },

    bindMenuToCatalog: function (menuMetaData, catalog) {
        let result = {};

        menuMetaData.forEach(metadata => {
            if (catalog[metadata.collection]) {
                const catalogLayer = catalog[metadata.collection];

                let autoMenuLayer = {};
                autoMenuLayer["group"] = "Dynamic Layers";
                autoMenuLayer["subGroup"] = "Auto Generated";
                autoMenuLayer["constraints"] = this.buildConstraintsFromCatalog(metadata, catalogLayer);

                const label = metadata.label ? metadata.label : catalogLayer.collection;
                result[label] = autoMenuLayer;
            }
        });

        return result;
    },

    buildConstraintsFromCatalog: function (metadata, catalogLayer) {
        let result = {};
        catalogLayer.fieldMetadata.forEach(constraint => {
            const fieldIndex = this.arrayIndexOf(constraint.name, metadata.fieldMetadata);
            if (fieldIndex !== -1) {
                const hideByDefaultMask = { 
                    hideByDefault: false
                }
                constraint = { //bind defined values
                    ...constraint,
                    ...hideByDefaultMask,
                    ...metadata.fieldMetadata[fieldIndex]
                }
            }
            constraint = this.convertFromDefault(constraint);
            constraint = this.buildStandardConstraint(constraint);
            if(constraint){
                result[constraint.label] = constraint;
            }
        });

        return result;
    },

    arrayIndexOf: function (fieldName, fieldMetadata) {
        if (!fieldMetadata) {
            return -1;
        }

        let count = 0;
        for (let i = 0; i < fieldMetadata.length; i++) {
            if (fieldMetadata[i].name === fieldName) {
                return i;
            }
        }
        return -1;
    },

    convertFromDefault: function (constraint) {
        if (constraint.type === "STRING") {
            constraint.type = "multiselect";
        }
        else if (constraint.type === "NUMBER" || constraint.type === "range") {
            constraint.type = "range";
            if (!constraint.min || constraint.min === -999) {
                constraint.min = 0;
            }
        }
        else if (constraint.type === "DATE" || constraint.type === "date") {
            constraint.type = "date";
            switch(typeof(constraint.maxDate)){
                case 'string':
                    constraint.min = new Date(constraint.minDate).getTime();
                    constraint.max = new Date(constraint.maxDate).getTime();
                    break;
                case 'number':
                    constraint.min = constraint.minDate;
                    constraint.max = constraint.maxDate;
                    break;
                case 'object':
                    if(constraint.maxDate.$numberLong){
                        constraint.min = Number(constraint.minDate.$numberLong);
                        constraint.max = Number(constraint.maxDate.$numberLong);
                    }
                    else{
                        console.error("Cannot deal with date field!");
                        console.error(constraint);
                    }
            }
        }

        const DEFAULTS = {
            hideByDefault: true
        }

        constraint = {
            ...DEFAULTS,
            ...constraint
        }

        return constraint;
    },

    buildStandardConstraint: function (constraint) {
        let result = {};

        result.label = constraint.name;
        if (constraint.label)
            result.label = constraint.label;


        if (constraint.type === "range" || constraint.type === "date") {
            result.step = constraint.step;
            
            const DEFAULTS = {
                step: 1,
            }

            result = {
                ...DEFAULTS,
                ...result
            }


            result.type = "slider";
        
            result.range = [constraint.min, constraint.max];
            result.default = result.range;
            

            if(result.range[0] === result.range[1] || !constraint.max) //error check
                return null;
            

            if(constraint.type === "date")
                result.isDate = true;
        }
        else if (constraint.type = "multiselect") {
            result.type = "multiselector";
            result.options = constraint.values;
            if(!result.options || result.options.length < 1)
                return null;
        }
        else if (constraint.type = "select") {
            result.type = "selector";
            result.options = constraint.values;

            if(!result.options || result.options.length < 1)
                return null;
        }
        

        result.hide = constraint.hideByDefault;

        
        return result;
    }
}