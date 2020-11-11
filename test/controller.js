var assert = require('assert');
var jsdom = require('jsdom-global')();

var controller = require('../src/dependencies/controller')


describe('verifyCorrectMap()', function() {
    it('should return false if nothing has been changed beforehand, should return true if the correct variable is inputed', function() {
      controller.mouseUp();
      assert.deepEqual(controller.verifyCorrectMap(1), false);

      controller.mouseDown(1);
      controller.initializeMap(1, true);
      assert.deepEqual(controller.verifyCorrectMap(1), true);
      controller.mouseUp();

      controller.mouseDown(2);
      controller.initializeMap(2, true);
      assert.deepEqual(controller.verifyCorrectMap(2), true);
      controller.mouseUp();

      controller.mouseDown(3);
      controller.initializeMap(3, true);
      assert.deepEqual(controller.verifyCorrectMap(3), true);
      controller.mouseUp();

      controller.mouseDown(4);
      controller.initializeMap(4, true);
      assert.deepEqual(controller.verifyCorrectMap(4), true);
      controller.mouseUp();

      controller.mouseDown(4);
      controller.initializeMap(4, true);
      assert.deepEqual(controller.verifyCorrectMap(-1), false);
      controller.mouseUp();
  });
});


describe('checkIfAnyCanMove()', function() {
    it('should return true if no maps are being moved, false if any are moving', function() {
      controller.mouseUp(); //sets all to not moving
      assert.deepEqual(controller.checkIfAnyCanMove(), true);
      controller.mouseDown(1);
      controller.initializeMap(1, true);
      assert.deepEqual(controller.checkIfAnyCanMove(), false);
    });
});

describe('pauseMap()', function() {
  it('should add a map to the pausedMaps list', function() {
    controller.pauseMap(1);
    assert.deepEqual(controller.pausedMaps(null), [1]);
  });
});

describe('unPauseMap()', function() {
  it('should remove a map from the pausedMaps list', function() {
    controller.pausedMaps([1,2])
    controller.unPauseMap(1);
    assert.deepEqual(controller.pausedMaps(null), [2]);
  });
});

describe('setGlobalPosition()', function() {
  it('should trigger all setter functions', function() {
    controller.mouseUp(); 
    controller.mouseDown(1);
    controller.setterFunctions([
      {setterFunc:function(v,z){},mapNum:1,setterFunc:function(v,z){},mapNum:1}
    ]);
    assert.deepEqual(controller.setGlobalPosition({n:1,s:1,e:1,w:1},1),true);
    controller.mouseUp(); 
    controller.initializeMap(1,true);
    controller.mouseDown(1);
    assert.deepEqual(controller.setGlobalPosition({n:1,s:1,e:1,w:1},1),true);
    assert.deepEqual(controller.setGlobalPosition({n:1,s:1,e:1,w:1},2),false);
  });
});

describe('setGlobalPositionFORCE()', function() {
  it('should trigger all setter functions', function() {
    assert.deepEqual(controller.setGlobalPositionFORCE({n:1,s:1,e:1,w:1},2),true);
  });
});



