/**
 **      ==================================
 **      OOOO   OOOO OOOO  O      O   OOOO
 **      O   O  O    O     O     O O  O   O
 **      O   O  O    O     O     O O  O   O
 **      OOOO   OOOO OOOO  O     OOO  OOOO
 **      O   O     O    O  O    O   O O   O
 **      O   O     O    O  O    O   O O   O
 **      OOOO   OOOO OOOO  OOOO O   O OOOO
 **      ==================================
 **      BSSLAB, Dr. Stefan Bosse http://www.bsslab.de
 **
 **      COPYRIGHT: THIS SOFTWARE, EXECUTABLE AND SOURCE CODE IS OWNED
 **                 BY THE AUTHOR.
 **                 THIS SOURCE CODE MAY NOT BE COPIED, EXTRACTED,
 **                 MODIFIED, OR OTHERWISE USED IN A CONTEXT
 **                 OUTSIDE OF THE SOFTWARE SYSTEM.
 **
 **    $AUTHORS:     Vadim Kiryukhin, Stefan Bosse
 **    $INITIAL:     (C) 2006-2016 Vadim Kiryukhin
 **    $MODIFIED:    by sbosse.
 **    $VERSION:     1.1.3
 **
 **    $INFO:
 **
 ** JSONfn - javascript (both node.js and browser) plugin to stringify, 
 **          parse and clone objects with Functions with restricted environments.
 **
 **     browser:
 **         JSONfn.stringify(obj);
 **         JSONfn.parse(str[, date2obj]);
 **         JSONfn.clone(obj[, date2obj]);
 **
 **     nodejs:
 **       var JSONfn = require('path/to/json-fn');
 **       JSONfn.stringify(obj);
 **       JSONfn.parse(str[, date2obj]);
 **       JSONfn.clone(obj[, date2obj]);
 **
 **
 **     @obj      -  Object;
 **     @str      -  String, which is returned by JSONfn.stringify() function; 
 **     @date2obj - Boolean (optional); if true, date string in ISO8061 format
 **                 is converted into a Date object; otherwise, it is left as a String.
 **
 **    $ENDOFINFO
 */

var Comp = Require('com/compat');
var current=none;
var Aios = none;

(function (exports) {

  exports.stringify = function (obj) {

    return JSON.stringify(obj, function (key, value) {
      if (value instanceof Function || typeof value == 'function') {
        return value.toString();
      }
      if (value instanceof RegExp) {
        return '_PxEgEr_' + value;
      }
      return value;
    });
  };

  exports.parse = function (str, mask) {
    var code;
    with (mask) {
      code= JSON.parse(str, function (key, value) {
        var prefix;

        try {
          if (typeof value != 'string') {
            return value;
          }
          if (value.length < 8) {
            return value;
          }

          prefix = value.substring(0, 8);

          if (prefix === 'function') {
            return eval('(' + value + ')');
          }
          if (prefix === '_PxEgEr_') {
            return eval(value.slice(8));
          }
          return value;
        } catch (e) {
          current.error=value;
          throw e;
        }
      });
   };
   return code;
  };

  exports.clone = function (obj, date2obj) {
    return exports.parse(exports.stringify(obj), date2obj);
  };

  exports.current =function (module) { current=module.current; Aios=module; };

}(typeof exports === 'undefined' ? (window.JSONfn = {}) : exports));


