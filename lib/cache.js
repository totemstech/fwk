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

/*
 * cash.js
 * a cach implementation for javascript, used LRU
 * algorithm to evict elements from the cash when 
 * it is full
 */
var base = require('./base.js');
var cache = function(spec, my) {
  my = my || {};
  my.size = spec.size;
  my.interval = spec.interval;
  my.cache = {};

  var that = {};
  
  //public
  var get;                      /* get(key{optional}) */
  var set;                      /* set(key, value, timeout) */ 
  var invalidate;               /* invalidate(key{optional}) */ 
  
  //private
  var runloop;
  
  /**
   * Function for retrieving an object
   * from the cache given it's key
   */ 
  get = function(key) {
    if(my.cache[key]) {
      my.cache[key].dte = Date.now();
      return my.cache[key].value;
    }
  };

  /**
   * Function for adding an object
   * to the cache given, timeout is optional
   * when not set, the object live undefinitly
   * until it's invalidated by calling
   * invalidate(key)
   */ 
  set = function(key, value, timeout) {
    my.cache[key] = { value: value,
                      timeout:timeout,
                      dte: Date.now() };
  };
  
  /**
   * Function for invalidation an object
   * from the cache give. If key is not
   * specified the whole cache is invalidated
   */ 
  invalidate = function(key) {
    if(key && my.cache[key]) {
      delete my.cache[key];
    } else if(!key) {
      my.cache = {};
    }
  };
  
  /**
   * Private Function for keeping the cash invalidate
   * expired element at my.interval rate.
   * It also invalidate least recently used objects
   * when the cash is full
   */ 
  runloop = function() {
    setInterval(function() {
      var now = Date.now();
      var count = 0;
      var expired = [];
      for(var s in my.cache) {
        if(my.cache.hasOwnProperty(s)) {
          count ++;
          if(!my.cache[s].timeout) continue;
          if((now - my.cache[s].dte) > my.cache[s].timeout) {
            expired.push(s);
          }
        }
      }
      
      for(var i = 0; i < expired.length; i ++) {
        invalidate(expired[i]);
      }

      // LRU
      while(count > my.size) {
        var min = Date.now();
        var evct;
        count = 0;
        for(var s in my.cache) {
          if(my.cache.hasOwnProperty(s)) {
            count++;
            if(my.cache[s].dte < min) {
              min = my.cache[s].dte;
              evct = s;
            }
          }
        }
        invalidate(evct);
      }
      
    }, my.interval);
  }
  
  runloop();
  
  base.method(that, 'get', get);
  base.method(that, 'set', set);
  base.method(that, 'invalidate', invalidate);

  return that;
}

exports.cache = cache;
