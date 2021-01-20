const assert = require('assert');
var mdf = require('../../../../src/iframe/js/library/mapDataFilter.js');

const exampleData = [
    { median_income: 44000 },
    { median_income: 43000 },
    { median_income: 16000 },
    { median_income: 73000 },
    { median_income: 244000 },
    { median_income: 8000 },
    { population: 7000 },
    { population: 65000 },
    { population: 9000 },
    { population: 2000 },
];
/*
describe('MapDataFilter', () => {
    describe('getModel()', () => {
        it('correctly compiles a list from one feature', () => {
            let filter = new mdf.MapDataFilter(exampleData);
            assert.deepEqual(filter.getSingleModel('median_income'), {
                median_income: [44000, 43000, 16000, 73000, 244000, 8000],
            });
            assert.deepEqual(filter.getSingleModel('population'), {
                population: [7000, 65000, 9000, 2000],
            });
        });

        it('correct compiles a list from multiple features', () => {
            let filter = new mdf.MapDataFilter(exampleData);
            assert.deepEqual(filter.getMultipleModel(['median_income', 'population']), {
                median_income: [44000, 43000, 16000, 73000, 244000, 8000],
                population: [7000, 65000, 9000, 2000],
            });
        });
    });
});
*/
