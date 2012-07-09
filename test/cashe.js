/**
 * Test dependencies.
 */

var cashe = require("../lib/cashe.js");
var should = require('should');

describe("cash test suit ", function() {
  //test suit initialization
  before(function(){
    cashe = cashe.cashe({interval: 1000,
                         size: 5});
  });

  it("should return undefined after timeout", function(){
    cashe.set("hello", "World", 500);
    setTimeout(function(){
      should.equal(cashe.get("hello"), undefined);
    }, 700);
  });
  
  it('should return "World" timeout not reached yet', function(){
    cashe.set("hello", "World", 500);
    setTimeout(function(){
      should.equal(cashe.get("hello"), "World");
    }, 300);
  });


});
