_grpcQuerier = grpc_querier();
let stream = _grpcQuerier.getStreamForQuery("usgs-stream-flow-5", ["9xjm9q"], Date.now(), Date.now() - 86400000 * 365);

stream.on('data', function (response) {
    for (const strand of response.getStrandsList()) {
        console.log(strand.getStartts());
        let d = new Date(strand.getStartts());
        console.log(strand.getGeohash() + " ---------- " + strand.getMeanList()[0] + " ---------- " + d);
    }
}.bind(this));
stream.on('status', function (status) {
    console.log(status.code, status.details, status.metadata);
});
stream.on('end', function (end) {
}.bind(this));

let _stream = stream;