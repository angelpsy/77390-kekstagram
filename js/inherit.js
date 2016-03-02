  'use strict';

  var inherit = function(FuncChild, FuncParent) {
    if (typeof FuncChild !== 'function' || typeof FuncParent !== 'function') {
      console.log('переданы не функции');
      return;
    }
    var Empty = function() {};
    Empty.prototype = FuncParent.prototype;
    FuncChild.prototype = new Empty();
  };

  module.exports = inherit;
