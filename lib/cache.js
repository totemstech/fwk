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

/**
 * cache.js
 *
 * a cache implementation for javascript uses LRU as default algorithm to evict 
 * elements from the cache when it is full.
 * does not expose a set method for caching value, to cache a value use the get
 * function wich take as a parameter a closure (options.getter) to fetch the value
 * 
 * cache.get(key, {getter:getter,
 *                 timeout:... }, cb); // cb(err, value)
 *
 * this is to what resemble a getter  
 * var getter = function(key, cb) {
 *  var value = get(key..) // fetch the value to be cached from your api, database...
 *    cb(null, value);
 * };
 *
 *
 * If a valued is not in the cache and there is many conccurent get for it
 * the closure is fired only once. That allows doing reddundant calls.
 * 
 * The structure of a cache element is the following
 * { date: 123456789, // last access date to this cached element
 *   [value: ...,] // the cached value
 *   timeout: 123456789, // date at which to invalidate this cache element
 *   queue: [] } // the queue of callbacks, empty if the value is already cached
 *   all cb in the queue (queue) are fired after the value is returned by getter
 * @extends {}
 *
 * @param spec {[size] [, interval] [,evict]}
 */
var cache = function(spec, my) {
  my = my || {};
  var _super = {};
  
  my.size = spec.size || 1000;
  my.interval = spec.interval || 100;
  my.cache = {};
  my.evict = spec.evict || 'LRU';
  
  my.modes = { LRU: 0,
               MRU: 1,
               RR: 2};
  
  //public
  var get;                      /* get(key{optional}) */
  var invalidate;               /* invalidate(key{optional}) */ 
  var count;                    /* size() */
  
  //private
  var runloop;
  var evict = [];
  
  var that = {};
  
  /**
   * List of available eviction algorithms. The algorithms used is driven
   * by the current mode: 'LRU', 'MRU', or 'RR'
   * @param count the current cache size
   */
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
   * @param key under which the value returned by options.getter
   * closure is stored.
   * @param options {getter, timeout}
   * options.getter is closure for getting the value to be cached
   * options.timeout absolute time to invalidate the value associated
   */ 
  get = function(key, options, cb) {
    if(typeof my.cache[key] !== 'undefined') {
      if(typeof my.cache[key].value !== 'undefined') {
        my.cache[key].date = Date.now();
        // returns the value
        cb(null, my.cache[key].value);
      } 
      else {
        my.cache[key].queue.push(cb);
      }

      // timeout comparison
      if(typeof options.timeout === 'number') {
        var t = Date.now() + options.timeout;
        if(typeof my.cache[key].timeout === 'undefined' ||
           my.cache[key].timeout > t) {
          my.cache[key].timeout = t;
        }
      }
    }
    else if(typeof options.getter === 'function') {
      my.cache[key] = { queue: [cb] };
      // timeout setting
      if(typeof options.timeout === 'number') {
        my.cache[key].timeout = Date.now() + options.timeout;
      }
      // getter asynchonous call
      options.getter(key, function(err, val) {
        if(!err && typeof val === 'undefined') {
          err = new Error('undefined val returned by getter');
        }
        var queue = my.cache[key].queue;

        if(!err) {
          my.cache[key].date = Date.now();
          my.cache[key].value = val; 
          delete my.cache[key].queue;
        }
        else {
          delete my.cache[key];
        }    
      
        queue.forEach(function(cb) {
          cb(err, val);
        });
      });
    }
    else {
      cb();
    }
  
    var count = that.count();
    if(count > my.size)
      evict[my.modes[my.evict]](count);
  };
 
  /**
   * Function for invalidating a value or more from the cache
   * given a key or a regex matching all the keys whose value
   * to be invalidated 
   * @param key {string or regex}
   */ 
  invalidate = function(key) {
    if(typeof key === "string") {
      if(my.cache[key])
        delete my.cache[key];
      return;
    }

    //regex on whole map
    if(typeof key === "object" && key instanceof RegExp) {
      base.forEach(my.cache, function(thisp, k, v) {
        if(key.test(k)) {
          delete my.cache[k]; 
        }
      });
    }
    
    if(typeof key == "undefined") {
      my.cache = {};
    }
  };

  /**
   * @return count the number of elements within the cache.
   */
  count = function() {
    var count = 0;
    for(var s in my.cache) {
      if(my.cache.hasOwnProperty(s)) {
        count ++;
      }
    }
    return count;
  };
  
  /**
   * Private Function for keeping the cash invalidate expired element at 
   * my.interval rate.
   */  
  runloop = function() {
    var now = Date.now();
    var expired = [];
    for(var s in my.cache) {
      if(my.cache.hasOwnProperty(s)) {
        if(typeof my.cache[s].timeout == "undefined" ||
           typeof my.cache[s].value == "undefined") 
          continue;
        
        if(now > my.cache[s].timeout) {
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
  base.method(that, 'invalidate', invalidate, _super);
  base.method(that, 'count', count, _super);

  return that;
}

exports.cache = cache;
