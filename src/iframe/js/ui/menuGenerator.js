/**
 * @namespace MenuGenerator
 * @file Build's menu UI for the Aperture Client
 * @author Daniel Reynolds
 * @dependencies react.js
 */
const DEFAULT_OPTIONS = {
    colorCode: true, //should objects have a color from their corresponding render color
}
const DEFAULT_OBJECT = {
    group: "Other",
    subGroup: "Other",
    selector: "checkbox", //radio is supported, just make sure its within the same subGroup 
    color: "#000000",
    popup: null,
    constraints: null,
    onChange: function(layer){RenderInfrastructure.addFeatureToMap(layer)},
    map: function(){return RenderInfrastructure.map;},
    mongoQuery: { //format [query,collection]
        query: [{ "$match": { geometry: { "$geoIntersects": { "$geometry": { type: "Polygon", coordinates: ["@@MAP_COORDS@@"] } } } } }],
        collection: "tract_geo"
    }
}

const MenuGenerator = {
    /** Generates the menu within a container
     * @memberof Generator
     * @method generate
     * @param {JSON} json_map JSON map
     * @param {HTMLElement} container Where to generate the menu
     * @param {object} options options object
     */
    generate(json_map, container, options) {
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
     * @memberof Generator
     * @method makeNested
     * @param {JSON} json_map JSON map
     */
    makeNested(json_map) {
        let columnsAndHeadings = {}; //what will be returned
        for (obj in json_map) { //just loop over the json
            if (json_map[obj]["notAQueryableLayer"]) {
                console.log(obj);
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
        console.log(columnsAndHeadings);
        return columnsAndHeadings;
    },

    /** Helper method for @method generate
     * @memberof Generator
     * @method configureContainer
     * @param {HTMLElement} container Where to generate the menu, what we are configing
     * @param {Number} categoryCount how many categories? these will become seperate columns
     */
    configureContainer(container, categoryCount) {
        container.innerHTML = ""; //clear it out

        container.style.display = "grid";

        columns = "";
        const perColPct = Math.floor(100 / categoryCount) + "%";
        for (let i = 0; i < categoryCount; i++)
            columns += perColPct + " ";
        container.style.gridTemplateColumns = columns; //set columns up
        container.style.height = "90%"
    },

    /** Helper method for @method generate
     * @memberof Generator
     * @method addColumns
     * @param {HTMLElement} container Where to generate the menu, what we are configing
     * @param {JSON} nested_json_map nested JSON map from @method makeNested
     */
    addColumns(container, nested_json_map) {
        for (obj in nested_json_map) {
            const newColumn = document.createElement("div"); //create blank element
            newColumn.className = "menuColumn";
            newColumn.id = Util.spaceToUnderScore(obj);
            container.appendChild(newColumn);

            const columnTitle = document.createElement("div");
            columnTitle.className = "categoryName";
            columnTitle.innerHTML = "<div class='vertical-center titleText'>" + obj + "</div>";
            newColumn.appendChild(columnTitle);
        }
    },

    /** Helper method for @method generate
     * @memberof Generator
     * @method addColumns
     * @param {HTMLElement} container Where to generate the menu, what we are configing
     * @param {JSON} nested_json_map nested JSON map from @method makeNested
     */
    addContentToColumns(nested_json_map) {
        for (obj in nested_json_map) {
            for (header in nested_json_map[obj]) {
                const column = document.getElementById(Util.spaceToUnderScore(obj));
                if (!column) {
                    console.error("Error in column generation, could not find column!: " + ob);
                    return 1;
                }
                const subGroup = document.createElement("div");
                subGroup.className = "menuHeader";
                subGroup.id = Util.spaceToUnderScore(obj) + Util.spaceToUnderScore(header);

                const subGroupHeader = document.createElement("div");
                subGroupHeader.className = "menuHeaderLabel";
                subGroupHeader.innerHTML = Util.capitalizeString(Util.underScoreToSpace(header));
                subGroup.appendChild(subGroupHeader);

                const subGroupContainer = document.createElement("div");
                subGroupContainer.className = "menuHeaderContainer";
                subGroup.appendChild(subGroupContainer);

                //now add content to each header
                for (layer in nested_json_map[obj][header]) {
                    const layerContainer = document.createElement("div");
                    layerContainer.className = "layerContainer";
                    layerContainer.id = Util.spaceToUnderScore(layer) + "_layer";

                    const layerSelector = document.createElement("div");
                    layerSelector.className = "layerSelector";
                    const selector = document.createElement("input");
                    const selectorLabel = document.createElement("label");
                    selector.id = layerContainer.id + "_selector";
                    selectorLabel.id = layerContainer.id + "_label";
                    selectorLabel.innerHTML = Util.capitalizeString(Util.underScoreToSpace(layer));
                    selector.type = "checkbox";
                    if (nested_json_map[obj][header][layer]["defaultRender"]) {
                        selector.checked = true;
                    }
                    layerSelector.appendChild(selectorLabel);
                    layerSelector.appendChild(selector);
                    layerContainer.appendChild(layerSelector);

                    const onChange = nested_json_map[obj][header][layer]["onChange"];
                    const layerName = layer;
                    if (onChange) {
                        selector.onchange = function () {
                            onChange(layerName);
                        }
                    }

                    //logic for constraints
                    if (nested_json_map[obj][header][layer]["constraints"]) {
                        const layerConstraints = document.createElement("div");
                        layerConstraints.className = "layerConstraints";


                        for (constraint in nested_json_map[obj][header][layer]["constraints"]) {
                            if (nested_json_map[obj][header][layer]["constraints"][constraint]["type"] === "slider") {
                                const slider = document.createElement("div");
                                const sliderLabel = document.createElement("div");

                                slider.style.marginBottom = '15px';
                                slider.id = layerContainer.id + "_constraint_" + constraint;

                                noUiSlider.create(slider, {
                                    start: nested_json_map[obj][header][layer]["constraints"][constraint]['default'] ? nested_json_map[obj][header][layer]["constraints"][constraint]['default'] : [nested_json_map[obj][header][layer]["constraints"][constraint]['range'][0]], //default is minimum

                                    step: nested_json_map[obj][header][layer]["constraints"][constraint]['step'] ? nested_json_map[obj][header][layer]["constraints"][constraint]['step'] : 1, //default 1,

                                    range: {
                                        'min': nested_json_map[obj][header][layer]["constraints"][constraint]['range'][0],
                                        'max': nested_json_map[obj][header][layer]["constraints"][constraint]['range'][1]
                                    },

                                    connect: true,
                                });
                                const name = Util.capitalizeString(Util.underScoreToSpace(nested_json_map[obj][header][layer]["constraints"][constraint]["label"] ? nested_json_map[obj][header][layer]["constraints"][constraint]["label"] : constraint));
                                const step = nested_json_map[obj][header][layer]["constraints"][constraint]['step'] ? nested_json_map[obj][header][layer]["constraints"][constraint]['step'] : 1;
                                slider.noUiSlider.on('update', function (values) {
                                    sliderLabel.innerHTML = name + ": " + (step < 1 ? values[0] : Math.floor(values[0]));
                                    for (let i = 1; i < values.length; i++) {
                                        sliderLabel.innerHTML += " - " + (step < 1 ? values[i] : Math.floor(values[i]));
                                    }
                                });
                                const onConstraintChange = nested_json_map[obj][header][layer]['onConstraintChange'];
                                if (onConstraintChange) {
                                    slider.noUiSlider.on('change', function (values) {
                                        eval(onConstraintChange);
                                    });
                                }

                                layerConstraints.appendChild(sliderLabel);
                                layerConstraints.appendChild(slider);
                            }
                            else if (nested_json_map[obj][header][layer]["constraints"][constraint]["type"] === "selector") {
                                const radioContainer = document.createElement("div");
                                radioContainer.className = "radioContainer";

                                let isFirstRadio = true;
                                nested_json_map[obj][header][layer]["constraints"][constraint]["options"].forEach(option => {
                                    const radioSelectorContainer = document.createElement("div");
                                    const radioSelector = document.createElement("input");
                                    radioSelector.type = "radio";
                                    radioSelector.name = constraint;
                                    radioSelector.id = Util.spaceToUnderScore(option);
                                    radioSelector.checked = isFirstRadio;
                                    isFirstRadio = false;
                                    const labelForRadioSelector = document.createElement("label");
                                    labelForRadioSelector.innerHTML = Util.capitalizeString(Util.underScoreToSpace(option));

                                    radioSelectorContainer.appendChild(labelForRadioSelector);
                                    radioSelectorContainer.appendChild(radioSelector);

                                    const onConstraintChange = nested_json_map[obj][header][layer]['onConstraintChange'];
                                    if (onConstraintChange) {
                                        radioSelectorContainer.onchange = function () {
                                            onConstraintChange(layerName);
                                        };
                                    }

                                    radioContainer.appendChild(radioSelectorContainer);
                                });



                                layerConstraints.appendChild(radioContainer);
                            }
                        }
                        layerContainer.appendChild(layerConstraints);

                        const dropdown = document.createElement("img");
                        dropdown.src = "../../images/dropdown.png";
                        dropdown.className = "dropdown";
                        dropdown.style.cursor = "pointer";
                        dropdown.style.transform = layerConstraints.style.display === "none" ? "rotate(0deg)" : "rotate(180deg)";
                        dropdown.onclick = function () {
                            layerConstraints.style.display = layerConstraints.style.display === "none" ? "block" : "none";
                            dropdown.style.transform = layerConstraints.style.display === "none" ? "rotate(0deg)" : "rotate(180deg)";
                        }
                        layerSelector.appendChild(dropdown);
                    }

                    subGroupContainer.appendChild(layerContainer);
                }
                subGroupHeader.onclick = function () {
                    subGroupContainer.style.display = subGroupContainer.style.display === "none" ? "block" : "none";
                }


                column.appendChild(subGroup);
            }
        }
    },

    executeFunctionByName: function (functionName, context, args) {
        var args = Array.prototype.slice.call(arguments, 2);
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for (var i = 0; i < namespaces.length; i++) {

            context = context[namespaces[i]];
        }
        return context[func].apply(context, args);
    }
}