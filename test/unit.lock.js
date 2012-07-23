var util = require('util');
/**
 * Test dependencies.
 */

var lock  = require("../lib/lock.js").lock();
var should = require('should');

describe("unit:lock", function() {
  
  it('wlock', function(done){
    var i = 0;
    
    lock.wlock("write", function(unlock) {
      setTimeout(function() {
        i = 2;
        unlock(); 
      }, 3);
    });      
    
    lock.wlock("write", function(unlock) {
      setTimeout(function() {
        i = 3;
        unlock();
      }, 1);
    });
    
    setTimeout(function() {
      i.should.equal(3);
      done();
    }, 5);

  });
  
  it('rlock', function(done){
      var j = 0;
    
      lock.rlock("read", function(unlock) {
        setTimeout(function() {
          j = 2;
          unlock(); 
        }, 3);
      });      
    
      lock.rlock("read", function(unlock) {
        setTimeout(function() {
          j = 3;
          unlock();
        }, 1);
      });
    
      setTimeout(function() {
        j.should.equal(3);
        done();
      }, 5);

});
});
