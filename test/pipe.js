var assert = require('assert');
var Pipe = require('../src/dependencies/pipe').Pipe

let string1 = "";
let listener1 = function(data){
    string1 += data;
}

let string2 = "";
let listener2 = function(data){
    string2 += data;
}

describe('createPipe()', function() {
    it('should create a pipe with a given ID and listener, and return the name of the pipe if it has not already been declared', function() {
        assert.strictEqual(Pipe.createPipe("one", listener1), true);
        assert.strictEqual(Pipe.createPipe("two", listener2), true);
        assert.strictEqual(Pipe.createPipe("one", listener1), false); //duplicates should return null
    });
});

describe('pipe()', function() {
    it('should call the listener with the data provided with the name', function() {
        Pipe.pipe("one", "test1234");
        assert.strictEqual(string1, "test1234");
        
        Pipe.pipe("one", "56789");
        assert.strictEqual(string1, "test123456789");

        Pipe.pipe("two", "hello world");
        assert.strictEqual(string2, "hello world");
    });
});

describe('removePipe()', function() {
    it('removes a pipe by its id', function() {
        assert.strictEqual(Pipe.removePipe("one"), true);
        assert.strictEqual(Pipe.removePipe("one"), false); //already removed now

        const string1Was = JSON.parse(JSON.stringify(string1));
        Pipe.pipe("one", "test"); //this should just do nothing
        assert.strictEqual(string1Was, string1);
    });
});