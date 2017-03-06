/**
 * Module that handles utilities functions.
 */
var Utils = {
  /**
   * Function that gets byte length of string.
   */
  getStringByteLength: function (str) {
    // Follow RFC3629 (where UTF-8 characters are at most 4-bytes long)
    var s = str.length;
    for (var i = str.length - 1; i >= 0; i--) {
      var code = str.charCodeAt(i);
      if (code > 0x7f && code <= 0x7ff) {
        s++;
      } else if (code > 0x7ff && code <= 0xffff) {
        s+=2;
      }
      if (code >= 0xDC00 && code <= 0xDFFF) {
        i--;
      }
    }
    return s;
  }
};