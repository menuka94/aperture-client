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

    //updates a constraints data, and adds it if not existent
    updateConstraint(layer, constraint, value, isActive) {
        if (!constraint)
            return;
        const constraintMetadata = this.data.constraints[constraint];
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
                if(!this.constraintData[constraint])
                    this.constraintData[constraint] = {};
                this.constraintData[constraint][value] = isActive;
                break;
        }
    }


    constraintSetActive(constraint, active){
        this.constraintState[constraint] = active;
    }

    query() {
        console.log("q");
    }
}