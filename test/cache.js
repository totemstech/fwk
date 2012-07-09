/**
 * Test dependencies.
 */

var cache = require("../lib/cache.js");
var should = require('should');

describe("cache test suit ", function() {
  //test suit initialization
  before(function(){
    cache = cache.cache({interval: 1,
                         size: 3});
  });

  it("should return undefined after timeout", function(done){
    cache.set("hello", "World", 3);
    setTimeout(function(){
      should.equal(cache.get("hello"), undefined);
      done();
    }, 5);
  });
  
  it('should return "World" timeout not reached yet', function(done){
    cache.set("hello", "World");
    setTimeout(function(){
      should.equal(cache.get("hello"), "World");
      done();
    }, 2);
  });
  
  it('should return "World" timeout never reach until invalidate is called', function(done){
    cache.set("hello", "World");
    setTimeout(function(){
      should.equal(cache.get("hello"), "World");
      cache.invalidate("hello");
      should.equal(cache.get("hello"), undefined);
      done();
    }, 5);
  });
  
  it('should invalidate the least used element', function(done){
    cache.set("France", "Paris");
    cache.set("Germany", "Berlin");
    cache.set("UK", "London");
    cache.set("Norway", "Oslo");
    
    setTimeout(function(){
      should.equal(cache.get("France"), undefined);
      done();
    }, 5);
  });
  
});
