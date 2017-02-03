/**
 * Factory that handles utils functions.
 */
var UtilsFactory = {
  /**
   * + Function that clones an object.
   */
  clone: function (obj) {
    if (!(obj && typeof obj === 'object')) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.concat([]);
    }

    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      var fn = function (item) {
        if (Array.isArray(item)) {
          return item.concat([]);
        } else if (!(item && typeof item === 'object')) {
          return item;
        }
        var copy = {};
        UtilsFactory.forEach(item, function (opt, prop) {
          copy[prop] = fn(opt);
        });
        return copy;
      };
      return fn(obj);
    }
  },

  /**
   * + Function that loops an object.
   */
  forEach: function (obj, fn) {
    if (Array.isArray(obj)) {
      if (typeof obj.forEach === 'function') {
        obj.UtilsFactory.forEach(fn);
      } else {
        for (var i = 0; i < obj.length; i++) {
          fn(obj[i], i);
        }
      }
    } else if (obj && typeof obj === 'object') {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          fn(obj[prop], prop);
        }
      }
    }
  }
};