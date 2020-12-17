
const AutoMenu = {
    _sustainQuerier: sustain_querier(),

    build: async function (menuMetaData, overwrite) {
        //stream the metadata catalog in
        const q = [];
        const stream = this._sustainQuerier.getStreamForQuery("lattice-46", 27017, "Metadata", JSON.stringify(q));
        let catalog = {};
        stream.on('data', function (r) {
            const data = JSON.parse(r.getData());
            catalog[data.collection] = data;
        }.bind(this));


        stream.on('end', function (end) {
            console.log(this.bindMenuToCatalog(menuMetaData, catalog));
        }.bind(this));
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
            if(fieldIndex !== -1){
                constraint = { //bind defined values
                    ...constraint,
                    ...metadata.fieldMetadata[fieldIndex]
                }
                constraint.hideByDefault = false;
            }
            constraint = this.convertFromDefault(constraint);

            result[constraint.name] = constraint;
        });

        return result;
    },

    arrayIndexOf: function(fieldName, fieldMetadata){
        if(!fieldMetadata){
            return -1;
        }

        let count = 0;
        for(let i = 0; i < fieldMetadata.length; i++){
            if(fieldMetadata[i].name === fieldName){
                return i;
            }
        }
        return -1;
    },

    convertFromDefault: function(constraint){
        if(constraint.type === "STRING"){
            constraint.type = "multiselect";
        }
        else if(constraint.type === "NUMBER"){
            constraint.type = "range";
            if(!constraint.min || constraint.min === -999){
                constraint.min = 0;
            }
        }
        else if(constraint.type === "DATE"){
            constraint.type = "date";
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

    buildStandardConstraint: function(constraint){
        let result = {};
        if(constraint.label){
            result.label = constraint.label;
        }

        if(constraint.type === "range"){
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
        }
        else if(constraint.type = "multiselect"){

        }
    }
}