
let aggregateData = [];
parent.Pipe.createPipe("queryToFilterPipe", (entry) => {
    aggregateData.push(entry);
});

function getFilter() {
    return new DataFilter(aggregateData);
}

