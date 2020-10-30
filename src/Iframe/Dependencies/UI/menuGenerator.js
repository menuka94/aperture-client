/**
 * @namespace MenuGenerator
 * @file Build's menu UI for the Aperture Client
 * @author Daniel Reynolds
 * @dependencies 
 */

const DEFAULT_OPTIONS = {
    colorCode: true, //should objects have a color from their corresponding render color
}
const DEFAULT_OBJECT = {
    group: "Other",
    subGroup: "Other",
    color: "#000000",
    popup: null,
    constraints: null,
    onConstraintChange: null
}

const MenuGenerator = {
    /** Generates the menu within a container
     * @memberof Generator
     * @method generate
     * @param {JSON} json_map JSON map
     * @param {HTMLElement} container Where to generate the menu
     * @param {object} options options object
     */
    generate(json_map,container,options){
        let ops = JSON.parse(JSON.stringify(DEFAULT_OPTIONS)); //deep copy
        if(options){ //if options arg exists, merge options
            ops = { ...ops, ...options}; //merge both options into one obj
        }

        container.innerHTML = ""; //clear out container


    },
    /** Helper method for @method generate
     * @memberof Generator
     * @method getColumnsAndHeadings
     * @param {JSON} json_map JSON map
     */
    getColumnsAndHeadings(json_map){
        let columnsAndHeadings = {}; //what will be returned
        for(obj in json_map){ //just loop over the json
            if(json_map[obj]){
                const mergeWithDefalt = { //merge default and user-given object
                    ...DEFAULT_OBJECT,
                    ...json_map[obj]
                };
            }
        }
    }
}