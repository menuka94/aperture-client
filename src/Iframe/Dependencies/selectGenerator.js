//Author: Daniel Reynolds
//Purpose: Add selectable checkboxes to html for getInfrastructure.js
//Dependencies: getInfrastructure.js


let Generator = {
    elementsJson:null,
    selectContainer:null,
    colorCode:null,
    /** Configurates the select container
     * @param {JSON} elementsJson Json containing the info like colors and icons
     * from getInfrastructure
     * @param {HTMLElement} selectContainer Where to add the checkboxes
     * @param {boolean} colorCode should elements with color attributes have colors near
     * @param {Function} callFunc should elements with color attributes have colors near
     * their checkboxes?
     */
    config: function(elementsJson,selectContainer,colorCode,callFunc){
        if(selectContainer == null || elementsJson == null){
            return;
        }
        for(element in elementsJson){
            if(!elementsJson[element]['query']){
                continue;
            }
            let checked = elementsJson[element]['defaultRender'] ? 'checked' : '';
            let color = colorCode && elementsJson[element]['color'] ? 'style="border-bottom:3px solid ' + elementsJson[element]['color'] + ';"' : '';
            selectContainer.innerHTML+='<div style="margin-top:3px;margin-bottom:3px"><input type="checkbox" id="' + element + '" onchange="' + callFunc.name + '(this)" ' + checked + '><label for="' + element + '" ' + color + '>' + Util.capitalizeString(Util.underScoreToSpace(element)) + '</label></div>'
        }
    }
}

//mocha-test stuff only down from here

try {
    module.exports = {
        Generator:Generator
    }
} catch (e) { }