 /*
 * @namespace MenuFormatter
 * @file Build's menu UI for the Aperture Client
 * @author Matt Young w/ Daniel Reynolds
 * @dependencies 
 * @notes Work in progress!
 */
const MenuFormatter = {
    /** Generates the menu within a container
     * @memberof MenuFormatter
     * @method generate
     * @param {JSON} json_map JSON map
     * @param {HTMLElement} container Where to generate the menu
     * @param {object} options options object
     */
    generate(json_map, container, options) {
        // console.log(json_map);
        let ops = JSON.parse(JSON.stringify(DEFAULT_OPTIONS)); //deep copy
        if (options) { //if options arg exists, merge options
            ops = { ...ops, ...options }; //merge both options into one obj
        }

        const nested_json_map = this.makeNested(json_map); //convert to nested format
        const categoryCount = Object.keys(nested_json_map).length;
        this.configureContainer(container, categoryCount);
        this.addColumns(container, nested_json_map);
        this.addContentToColumns(nested_json_map);
    },

    /** Helper method for @method generate
     * @memberof MenuFormatter
     * @method makeNested
     * @param {JSON} json_map JSON map
     */
    makeNested(json_map) {
        let columnsAndHeadings = {}; //what will be returned
        for (obj in json_map) { //just loop over the json
            if (json_map[obj]["notAQueryableLayer"]) {
                continue;
            }
            const mergeWithDefalt = { //merge default and user-given object
                ...DEFAULT_OBJECT,
                ...json_map[obj]
            };
            //make bits if they dont exist
            if (!columnsAndHeadings[mergeWithDefalt["group"]]) {
                columnsAndHeadings[mergeWithDefalt["group"]] = {};
            }
            if (!columnsAndHeadings[mergeWithDefalt["group"]][mergeWithDefalt["subGroup"]]) {
                columnsAndHeadings[mergeWithDefalt["group"]][mergeWithDefalt["subGroup"]] = {};
            }
            //create obj
            columnsAndHeadings[mergeWithDefalt["group"]][mergeWithDefalt["subGroup"]][obj] = mergeWithDefalt;
        }
        //console.log(columnsAndHeadings);
        return columnsAndHeadings;
    },

    /** Set up the main row with 2 columns
    * @member of MenuFormatter
    * @method configureContainer
    * @param {container} the sidebar div
    */
    configureContainer(container) {
        //The container is sidebar-container. The whole thing.
        container.innerHTML = "";

        const mainRow = document.createElement("div");
        mainRow.className = "row";
        mainRow.id = "mainRow-id";
        container.appendChild(mainRow);

        const column1 = document.createElement("div");
        column1.className = "col";
        column1.id = "column1-id";
        mainRow.appendChild(column1);
        //Put headings into this column..statically?

        const column2 = document.createElement("div");
        column2.className = "col";
        column2.id = "column2-id";
        mainRow.appendChild(column2);
        //Put heading into this column..statically?
    },

    /** Set up the main row with 2 columns
    * @member of MenuFormatter
    * @method splitJSON
    * @param {nested_json_map} the json organized
    */
    splitJSON(nested_json_map) {
    // Need a function to split the json into 2 parts representing both columns
    // Get DANIEL's help with this
    }

    addHeaders(container, nested_json_map) {
        const header = document.createElement("div");
        columnTitle.innerHTML = "<div class='sidebar-header'>" + obj + "</div>";
    }


}