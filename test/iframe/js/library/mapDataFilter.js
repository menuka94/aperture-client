const assert = require('assert');
var mdf = require('../../../../src/iframe/js/library/mapDataFilter.js');

const exampleData = [
    { properties: { median_income: 44000 }},
    { properties: { median_income: 43000 }},
    { properties: { median_income: 16000 }},
    { properties: { median_income: 73000 }},
    { properties: { median_income: 244000 }},
    { properties: { median_income: 8000 }},
    { properties: { population: 7000 }},
    { properties: { population: 65000 }},
    { properties: { population: 9000 }},
    { properties: { population: 2000 }},
];

describe('MapDataFilter', () => {
    describe('add()', () => {
        it('can add single data points', () => {
            let filter = new mdf.MapDataFilter();
            filter.add(exampleData[0]);
            assert(filter.data.length === 1);
            assert(filter.data[0].properties.median_income === 44000);
            filter.add(exampleData[1]);
            assert(filter.data.length === 2);
            assert(filter.data[1].properties.median_income === 43000);
        });
        it ('can add multiple data points', () => {
            let filter = new mdf.MapDataFilter();
            filter.add(exampleData);
            assert(filter.data.length === exampleData.length);
            assert(filter.data[0].properties.median_income === 44000);
            assert(filter.data[5].properties.median_income === 8000);
            assert(filter.data[6].properties.population === 7000);
        });
    });
    
    describe('clear()', () => {
        it('removes all data points from the filter', () => {
            let filter = new mdf.MapDataFilter();
            filter.add(exampleData);
            filter.clear();
            assert(filter.data.length === 0);
        });
    });

    describe('discardOldData()', () => {
        it('can remove data', (done) => {
            let filter = new mdf.MapDataFilter();
            filter.add(exampleData);
            setTimeout(() => { 
                filter.discardOldData(100);
                assert(filter.data.length === 0);
                done();
            }, 200);
        });

        it('properly removes only outdated data', (done) => {
            let filter = new mdf.MapDataFilter();

            filter.add(exampleData[0]);
            setTimeout(() => { filter.add(exampleData[1]); }, 100);
            setTimeout(() => { filter.add(exampleData[2]); }, 200);
            setTimeout(() => { 
                filter.discardOldData(150); 
                assert(filter.data.length === 1);
                assert(filter.data[0].properties.median_income === 16000);
                done(); 
            }, 300);
        });
    });

    describe('getModel()', () => {
        it('can create single models', () => {
            let filter = new mdf.MapDataFilter();
            filter.add(exampleData);
            let model = filter.getModel('median_income');
            assert(model.median_income.length === 6);
            assert(model.median_income[1] === 43000);
        });

        it('can create multiple models', () => {
            let filter = new mdf.MapDataFilter();
            filter.add(exampleData);
            let model = filter.getModel(['median_income', 'population']);
            assert(model.median_income.length === 6);
            assert(model.population.length === 4);
        });
    });
});
