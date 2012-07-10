// Copyright Teleportd
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var base = require('./base.js');

/*
 * cache.js
 * a cache implementation for javascript
 * uses LRU as default algorithm to evict 
 * elements from the cash when it is full
 * @extends {}
 * @param spec {cfg [, size] [, interval] [,evict]}
 */
var cache = function(spec, my) {
  my = my || {};
  var _super = {};
  
  my.size = spec.size || 1000;
  my.interval = spec.interval || 100;
  my.cache = {};
  my.evict = spec.evict ||"LRU";
  
  //List of available algo used to evict elements from 
  //the cache when it is full. spec.evict is the param 
  //used to choose on of them
  my.modes = { LRU: 0,
               MRU: 1,
               RR: 2};
  
  //public
  var get;                      /* get(key{optional}) */
  var set;                      /* set(key, value, timeout) */ 
  var invalidate;               /* invalidate(key{optional}) */ 
  
  //private
  var runloop;
  var evict = [];
  
  var that = {};
  
  //LRU (Least Recently Used) algo
  evict[0] = function(count) {
    while(count > my.size ) {
      var min = Date.now();
      var evct;
      for(var s in my.cache) {
        if(my.cache.hasOwnProperty(s)) {
          if(my.cache[s].dte < min) {
            min = my.cache[s].dte;
            evct = s;
          }
        }
      }
      count--;
      invalidate(evct);
    }
  };

  //MRU (Most Recently Used)
  evict[1] = function(count) {
    while(count > my.size) {
      var max = 0;
      var evct;
      for(var s in my.cache) {
        if(my.cache.hasOwnProperty(s)) {
          if(my.cache[s].dte > max) {
            max = my.cache[s].dte;
            evct = s;
          }
        }
      }
      count--;
      invalidate(evct);
    }
  };

  //RR (Random and Replacement)
  evict[2] = function(count) {
    while(count > my.size) {
      var index = Math.floor(count * Math.random());
      var evct;
      for(var s in my.cache) {
        if(my.cache.hasOwnProperty(s)) {
          if(count == index) 
            evct = s;
        }
      }
      count--;
      invalidate(evct);
    }
  };

  /**
   * Function for retrieving an object from the cache given it's key
   * @param key, key used to retrieve associated value in the cache
   */ 
  get = function(key) {
    if(my.cache[key]) {
      my.cache[key].dte = Date.now();
      return my.cache[key].value;
    }
  };

  /**
   * Function for adding an object to the cache given, timeout 
   * is optional when not set, the object live undefinitly 
   * until it is invalidated by calling invalidate(key)
   * @param key, key that will be used after to retrieve value
   * @param value,  value to be cached
   * @param timeout, the time after wich to invalidate value
   */ 
  set = function(key, value, timeout) {
    my.cache[key] = { value: value,
                      timeout:timeout,
                      dte: Date.now() };
    var count = 0;
    for(var s in my.cache) {
      if(my.cache.hasOwnProperty(s)) {
        count ++;
      }
    }
    
    if(count > my.size)
      evict[my.modes[my.evict]](count);
  };
  
  /**
   * Function for invalidation an object from the 
   * cache give. If key is not specified the whole 
   * cache is invalidated
   * @param key, key of the object to be invalidated
   */ 
  invalidate = function(key) {
    if(my.cache[key]) {
      delete my.cache[key];
    } else if(typeof key == "undefined") {
      my.cache = {};
    }
  };
  
  /**
   * Private Function for keeping the cash invalidate
   * expired element at my.interval rate.
   */ 
  runloop = function() {
    var now = Date.now();
    var expired = [];
    for(var s in my.cache) {
      if(my.cache.hasOwnProperty(s)) {
        if(typeof my.cache[s].timeout == "undefined") continue;
        if((now - my.cache[s].dte) > my.cache[s].timeout) {
          expired.push(s);
        }
      }
    }
    
    for(var i = 0; i < expired.length; i ++) {
      invalidate(expired[i].key);
    }

  };
    
  setInterval(runloop, my.interval);
  
  base.method(that, 'get', get, _super);
  base.method(that, 'set', set, _super);
  base.method(that, 'invalidate', invalidate, _super);

  return that;
}

exports.cache = cache;
