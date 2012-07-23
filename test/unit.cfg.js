var util = require('util');
/**
 * Test dependencies.
 */

var should = require('should');
var cfg;

describe("unit:cfg", function() {
  before(function() {
    cfg = require("../lib/cfg.js").populateConfig(require("./resources/config/config.js").config);
 }); 
 
 it('callback and go', function() {
   cfg["WORLD"].should.equal("world");
 }); 
  
});
