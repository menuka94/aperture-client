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

describe('MapDataFilter', () => {
    describe('add()', () => {
        it('can add single data points', () => {
            let filter = new mdf.MapDataFilter();
            filter.add(exampleData[0]);
            assert(filter.data.length === 1);
            assert(filter.data[0].median_income === 44000);
            filter.add(exampleData[1]);
            assert(filter.data.length === 2);
            assert(filter.data[1].median_income === 43000);
        });
        it ('can add multiple data points', () => {
            let filter = new mdf.MapDataFilter();
            filter.add(exampleData);
            assert(filter.data.length === exampleData.length);
            assert(filter.data[0].median_income === 44000);
            assert(filter.data[5].median_income === 8000);
            assert(filter.data[6].population === 7000);
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
            setTimeout(() => { filter.discardOldData(150); done(); }, 300);
        });
    });
});
