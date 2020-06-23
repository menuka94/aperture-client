//Author: Daniel Reynolds
//Purpose: Add selectable checkboxes to html for getInfrastructure.js
//Dependencies: getInfrastructure.js


let Generator = {
    elementsJson: null,
    selectContainer: null,
    colorCode: null,
    /** Configurates the select container
     * @param {JSON} elementsJson Json containing the info like colors and icons
     * from getInfrastructure
     * @param {HTMLElement} selectContainer Where to add the checkboxes
     * @param {boolean} colorCode should elements with color attributes have colors near
     * @param {Function} callFunc should elements with color attributes have colors near
     * their checkboxes?
     */
    config: function (elementsJson, selectContainer, colorCode, callFunc) {
        if (selectContainer == null || elementsJson == null) {
            return;
        }
        let groupInfo = this.groupMods(elementsJson);
        for (let i = 0; i < groupInfo.groups.length; i++) {
            selectContainer.innerHTML+="<button type='button' class='collapsible'>" + groupInfo.groups[i] + "</button>"
            let innerHTML = "";
            groupInfo.elements[i].forEach(element => {
                if(elementsJson[element]){
                    let checked = elementsJson[element]['defaultRender'] ? 'checked' : '';
                    let color = colorCode && elementsJson[element]['color'] ? 'style="border-bottom:3px solid ' + elementsJson[element]['color'] + ';"' : '';
                    innerHTML += '<div style="margin-top:3px;margin-bottom:3px"><input type="checkbox" class="featureCheck" id="' + element + '" onchange="' + callFunc.name + '(this)" ' + checked + '><label for="' + element + '" ' + color + '>' + Util.capitalizeString(Util.underScoreToSpace(element)) + '</label></div>'
                }
            });
            selectContainer.innerHTML+="<div class='content' style='display:none;'>" + innerHTML + "</div>";
        }
        selectContainer.innerHTML+="<button id='clearFeatures' onClick='RenderInfrastructure.removeAllFeaturesFromMap(); Generator.clearChecks();' style='color: white;background-color: red;border: none;border-radius: 3px;padding: 4px;margin-top: 5px;'>Clear All Features</button>";
        var coll = document.getElementsByClassName("collapsible");
        for (let i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.display === "block") {
                    content.style.display = "none";
                } 
                else {
                    content.style.display = "block";
                }
            });
        }
    },
    clearChecks: function () {
        var features = document.getElementsByClassName("featureCheck");
        for (let i = 0; i < features.length; i++) {
            features[i].checked = false;
        }
    },
    groupMods: function (json) {
        let groups = [];
        let groupElements = [];
        for (x in json) {
            if (!json[x]['groupMem'] || !json[x]['query']) {
                continue;
            }
            if (groups.includes(json[x]['groupMem'])) {
                groupElements[groups.indexOf(json[x]['groupMem'])].push(x);
            }
            else {
                groups.push(json[x]['groupMem']);
                groupElements.push([x]);
            }
        }
        return { groups: groups, elements: groupElements };
    }
}

//mocha-test stuff only down from here

try {
    module.exports = {
        Generator: Generator
    }
} catch (e) { }