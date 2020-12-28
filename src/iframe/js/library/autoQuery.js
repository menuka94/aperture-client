/**
 * @namespace MenuGenerator
 * @file Query layers in a very general fashion
 * @author Daniel Reynolds
 * @dependencies autoMenu.js menuGenerator.js
 * @notes Work in progress!
 */

class AutoQuery {
    constructor(data) {
        this.data = data;
        this.sustainQuerier = sustain_querier() //init querier
        this.constraintData = {};
        this.constraintState = {};
        this.layerCache = {}
    }

    onAdd() {
        console.log("add");
    }

    onRemove() {
        console.log("rm");
    }

    updateConstraint(layer, constraint, value, isActive) {
        if (!constraint)
            return;
        const constraintMetadata = this.data.constraints[constraint];
        //console.log(constraintMetadata.type);
        switch (constraintMetadata.type) {
            case "slider":
                if(Array.isArray(value))
                    for(let i = 0; i < value.length; i++) //change string to number
                        value[i] = Number(value[i]);
                else
                    value = Number(value);
                this.constraintData[constraint] = value;
                break;
            case "selector":
                this.constraintData[constraint] = value;
                break;
            case "multiselector":
                console.log("m");
                break;
        }

        // this.constraintData[constraint] = value;
        // this.constraintState[constraint] = isActive;
        console.log(this.constraintData);
    }

    query() {
        console.log("q");
    }
}