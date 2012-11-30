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

var events = require('events');
var base = require("./base.js");

/**
 * Factory
 */
var factory = function(spec, my) {
  var _super = {};
  my = my || {};

  // public
  var forward;      /* forward(obj, type, evt);   */

  // private

  var that = new events.EventEmitter();

  forward = function(obj, type, evt) {
    obj.on(evt, function() {
      that.emit(type + ':' + evt, arguments);
    });
  };


  base.method(that, 'forward', forward, _super);

  return that;
};

var _factory;       // Singleton

exports.factory = factory;

exports.factory_expose = function(exports, factory) {
  if(!_factory)
    _factory = factory({});
  exports.get = function() {
    return _factory;
  }
};