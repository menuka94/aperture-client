
/**
 * @namespace MenuGenerator
 * @file Build's menu UI for the Aperture Client
 * @author Daniel Reynolds
 * @dependencies 
 * @notes Work in progress!
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
    map: function () { return RenderInfrastructure.map; }
}

let updateQueue = {};
function updateLayers() {
    for (layerUpdate in updateQueue) {
        //console.log(layerUpdate);
        updateQueue[layerUpdate](layerUpdate);
    }
}

const MenuGenerator = {
    /** Generates the menu within a container
     * @memberof MenuGenerator
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
                //console.log(obj);
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
                    const layerObj = nested_json_map[obj][header][layer];

                    const layerQuerier = new AutoQuery(layerObj);

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
                    if (layerObj["defaultRender"]) {
                        selector.checked = true;
                    }
                    layerSelector.appendChild(selectorLabel);
                    layerSelector.appendChild(selector);
                    layerContainer.appendChild(layerSelector);

                    if(!layerObj["noAutoQuery"]){
                        if(!layerObj["collection"]){
                            layerObj["collection"] = layer;
                        }

                        layerObj["onConstraintChange"] = function(layer,constraintName,value,isActive){ 
                            layerQuerier.updateConstraint(layer,constraintName,value,isActive); 
                        };
                        layerObj["onUpdate"] = function(){ layerQuerier.query();};
                        layerObj["onAdd"] = function(){ layerQuerier.onAdd();};
                        layerObj["onRemove"] = function(){ layerQuerier.onRemove();};
                    }

                    const onAdd = layerObj["onAdd"];
                    const onRemove = layerObj["onRemove"];
                    const onUpdate = layerObj["onUpdate"];


                    const layerName = layer;
                    selector.onchange = function () {
                        if (selector.checked) {
                            onAdd(layerName);
                            updateQueue[layerName] = onUpdate;
                            onUpdate(layerName);
                        }
                        else {
                            delete updateQueue[layerName];
                            onRemove(layerName);
                        }
                    }




                    //logic for constraints
                    if (layerObj["constraints"]) {
                        const layerConstraints = document.createElement("div");
                        layerConstraints.className = "layerConstraints";


                        for (constraint in layerObj["constraints"]) {
                            const constraintName = constraint;
                            const constraintObj = layerObj["constraints"][constraintName];

                            let container;
                            if (constraintObj["type"] === "slider") {
                                container = this.createSliderContainer(constraintName, constraintObj, layerObj, layerName);
                            }
                            else if (constraintObj["type"] === "selector") {
                                container = this.createCheckboxContainer(constraintName, constraintObj, layerObj, layerName, "radio");
                            }
                            else if (constraintObj["type"] === "multiselector") {
                                container = this.createCheckboxContainer(constraintName, constraintObj, layerObj, layerName, "checkbox");
                            }

                            if (constraintObj["hide"]) {
                                layerQuerier.constraintSetActive(constraintName, false);
                                container.style.display = "none";
                            }
                            else{
                                layerQuerier.constraintSetActive(constraintName, true);
                            }

                            layerConstraints.appendChild(container);
                        }
                        layerContainer.appendChild(layerConstraints);

                        const dropdown = document.createElement("img");
                        dropdown.src = "../../images/dropdown_white.png";
                        dropdown.className = "dropdown";
                        dropdown.style.cursor = "pointer";
                        dropdown.style.transform = layerConstraints.style.display === "none" ? "rotate(0deg)" : "rotate(180deg)";
                        dropdown.onclick = function () {
                            layerConstraints.style.display = layerConstraints.style.display === "none" ? "block" : "none";
                            dropdown.style.transform = layerConstraints.style.display === "none" ? "rotate(0deg)" : "rotate(180deg)";
                        }
                        layerSelector.appendChild(dropdown);

                        const settings = document.createElement("img");
                        settings.className = "dropdown";
                        settings.src = "../../images/gear.png";
                        settings.style.cursor = "pointer";
                        settings.onclick = function () {
                            MenuGenerator.selectOptions(layerConstraints, function(constraint, active){
                                layerQuerier.constraintSetActive(constraint,active)
                            });
                        }
                        layerSelector.appendChild(settings);
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

    //work in progress
    selectOptions: function (layerConstraints, setActive) {
        if (document.getElementById("editConstraints")) {
            return;
        }

        const editDiv = document.createElement("div");
        editDiv.className = "editConstraints";
        editDiv.id = "editConstraints";

        for (let i = 0; i < layerConstraints.childNodes.length; i++) {
            const holderDiv = document.createElement("div");

            const child = layerConstraints.childNodes[i];
            const selectLabel = document.createElement("label");
            selectLabel.innerHTML = Util.capitalizeString(Util.underScoreToSpace(child.id));

            const select = document.createElement("input");
            select.type = "checkbox";
            select.checked = child.style.display !== "none";
            //console.log(child.style);
            select.onchange = function(){
                setActive(child.id, select.checked);
                child.style.display = select.checked ? "block" : "none";
            }

            holderDiv.appendChild(selectLabel);
            holderDiv.appendChild(select);

            editDiv.appendChild(holderDiv);
        }

        //ignore this gross css stuff
        const saveAndClose = document.createElement("button");
        saveAndClose.style.bottom = "25px";
        saveAndClose.style.right = "25px";
        saveAndClose.style.position = "absolute";
        saveAndClose.innerHTML = "Close menu"
        saveAndClose.onclick = function(){
            document.body.removeChild(editDiv);
        }

        editDiv.appendChild(saveAndClose);

        document.body.appendChild(editDiv);
    },

    createSliderContainer: function (constraint, constraintObj, layerObj, layerName) {
        const sliderContainer = document.createElement("div");
        sliderContainer.className = "sliderContainer";
        sliderContainer.id = constraint;

        const slider = document.createElement("div");
        const sliderLabel = document.createElement("div");

        slider.style.margin = '5px';
        slider.id = layerName + "_" + constraint;
        noUiSlider.create(slider, {
            start: constraintObj['default'] ? constraintObj['default'] : [constraintObj['range'][0]], //default is minimum

            step: constraintObj['step'] ? constraintObj['step'] : 1, //default 1,

            range: {
                'min': constraintObj['range'][0],
                'max': constraintObj['range'][1]
            },

            connect: true,
        });
        const name = Util.capitalizeString(Util.underScoreToSpace(constraintObj["label"] ? constraintObj["label"] : constraint));
        const step = constraintObj['step'] ? constraintObj['step'] : 1;
        const isDate = constraintObj['isDate'];
        slider.noUiSlider.on('update', function (values) {
            sliderLabel.innerHTML = name + ": " + (isDate ? (new Date(Number(values[0]))).toUTCString().substr(0, 16) : (step < 1 ? values[0] : Math.floor(values[0])));
            for (let i = 1; i < values.length; i++) {
                sliderLabel.innerHTML += " - " + (isDate ? (new Date(Number(values[i]))).toUTCString().substr(0, 16) : (step < 1 ? values[i] : Math.floor(values[i])));
            }
        });
        const onConstraintChange = layerObj['onConstraintChange'];
        if (onConstraintChange) {
            onConstraintChange(layerName, constraint, slider.noUiSlider.get());
            slider.noUiSlider.on('change', function (values) {
                onConstraintChange(layerName, constraint, values);
            });
        }

        sliderContainer.appendChild(sliderLabel);
        sliderContainer.appendChild(slider);

        return sliderContainer;
    },

    createCheckboxContainer: function (constraint, constraintObj, layerObj, layerName, type) {
        const checkboxContainer = document.createElement("div");
        checkboxContainer.className = "checkboxContainer";
        checkboxContainer.id = layerName + "_" + constraint;

        //add label
        const checkboxLabel = document.createElement("div");
        checkboxLabel.className = "checkboxConstraintLabel";
        checkboxLabel.innerHTML = Util.capitalizeString(Util.underScoreToSpace(constraint));
        checkboxContainer.appendChild(checkboxLabel);

        const checkboxConstraintContainer = document.createElement("div");
        checkboxConstraintContainer.className = "checkboxConstraintContainer";
        checkboxContainer.appendChild(checkboxConstraintContainer);


        let isFirstCheckbox = true;
        constraintObj["options"].forEach(option => {
            if (option) {
                const checkboxSelectorContainer = document.createElement("div");
                const checkboxSelector = document.createElement("input");
                checkboxSelector.type = type;
                checkboxSelector.id = Util.spaceToUnderScore(option);
                checkboxSelector.checked = type === "radio" ? isFirstCheckbox : true;
                checkboxSelector.name = constraint;
                isFirstCheckbox = false;
                const labelForRadioSelector = document.createElement("label");
                labelForRadioSelector.innerHTML = Util.capitalizeString(Util.underScoreToSpace(option));

                checkboxSelectorContainer.appendChild(labelForRadioSelector);
                checkboxSelectorContainer.appendChild(checkboxSelector);

                const onConstraintChange = layerObj['onConstraintChange'];
                const onUpdate = layerObj['onUpdate'];
                const optionName = option;
                if (onConstraintChange) {
                    if (checkboxSelector.checked)
                        onConstraintChange(layerName, constraint, optionName, true);

                    checkboxSelectorContainer.onchange = function () {
                        if (checkboxSelector.checked) {
                            onConstraintChange(layerName, constraint, optionName, true);
                        }
                        else if (type === "checkbox") {
                            onConstraintChange(layerName, constraint, optionName, false);
                        }
                    };
                }
                checkboxConstraintContainer.appendChild(checkboxSelectorContainer);
            }
        });

        
        return checkboxContainer;
    }
}