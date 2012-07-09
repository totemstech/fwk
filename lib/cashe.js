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
var cashe = function(spec, my) {
  my = my || {};
  my.size = spec.size;
  my.interval = spec.interval;
  my.cashe = {};

  var that = {};
  
  //public
  var get;
  var set;
  var invalidate;
  var invalidateCashe;

  get = function(key) {
    if(my.cashe.key) {
      my.cashe.key.dte = Date.now();
      return my.cashe.key;
    }
  };
  
  set = function(key, value, timeout) {
    my.cashe[key] = { value: value,
                      timeout:timeout,
                      dte: Date.now() };
  };
  
  invalidate = function(key) {
    if(my.cashe[key]) {
      delete my.cashe[key];
    }
  };
  
  invalidateCashe = function() {
    my.cashe = {};
  };

  setInterval(function() {
    var now = Date.now();
    var count = 0;
    var expired = [];
    for(var s in my.cashe) {
      if(my.cashe.hasOwnProperty(s)) {
        count ++;
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
            min = my.cache[s][t].dte;
            evct = s;
          }
        }
      }
      invalidate(evct);
    }
    
  }, my.interval);
  
  base.method(that, 'get', get);
  base.method(that, 'set', set);
  base.method(that, 'invalidate', invalidate);
  base.method(that, 'invalidateCashe', invalidateCashe);

  return that;
}

exports.cashe = cashe;
