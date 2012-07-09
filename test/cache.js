/**
 * Test dependencies.
 */

var cache;
var should = require('should');

describe("cache test suit ", function() {
  
  describe("LRU cache", function(doneLRU) {
    //test suit initialization
    before(function(){
      cache = require("../lib/cache.js");
      cache = cache.cache({interval: 1,
                           evict: 'LRU',
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
    
    it('should invalidate the least used element LRU', function(done){
      cache.set("France", "Paris");
      
      setTimeout(function() {
        cache.set("Germany", "Berlin")
      }, 1);
      
      setTimeout(function() {
        cache.set("UK", "London");
      }, 2);
      
      setTimeout(function() {
        cache.set("Norway", "Oslo");
      }, 3);

      setTimeout(function() {
        should.equal(cache.get("UK"), "London");
        should.equal(cache.get("Norway"), "Oslo");
        should.equal(cache.get("Germany"), "Berlin");
        should.equal(cache.get("France"), undefined);
        done();
      }, 4);
    });
  });  
  
  describe("MRU", function() {
    before(function(done){
      cache = require("../lib/cache.js");
      cache = cache.cache({interval: 1,
                           evict: 'MRU',
                           size: 3});
      done();
    });

    it("it should invalidate the most used element", function(done) {
      cache.set("France", "Paris");
      
      setTimeout(function() {
        cache.set("UK", "London");
      }, 1);
      
      setTimeout(function() {
        cache.set("Germany", "Berlin")
      }, 2);
      
      setTimeout(function() {
        cache.set("Norway", "Oslo");
      }, 4);

      setTimeout(function() {
        should.equal(cache.get("France"), "Paris");
        should.equal(cache.get("UK"), "London");
        should.equal(cache.get("Germany"), "Berlin");  
        should.equal(cache.get("Norway"), undefined);
        done();
      }, 5);
    });
  });

  describe("RR", function() {
    before(function(done){
      cache = require("../lib/cache.js");
      cache = cache.cache({interval: 1,
                           evict: 'RR',
                           size: 3});
      done();
    });

    it("it should invalidate a random  element", function(done) {
      cache.set("France", "Paris");
      
      setTimeout(function() {
        cache.set("Germany", "Berlin")
      }, 1);
      
      setTimeout(function() {
        cache.set("UK", "London");
      }, 2);
      
      setTimeout(function() {
        cache.set("Norway", "Oslo");
      }, 3);

      setTimeout(function() {
        var res = [];
        var containUndefined = false;
        res.push(cache.get("UK"));
        res.push(cache.get("Germany"));
        res.push(cache.get("France"));
        res.push(cache.get("Norway"));
      
        for(var i = 0; i < res.length; i++) {
          if(res[i] === undefined)
            containUndefined = true;
        }
        
        should.equal(containUndefined, true);
        done();
      }, 4);
    });
  });
  
});
