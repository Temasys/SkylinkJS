/**
 * Handles the testing utils.
 * @module utils
 * @public
 */
var utils = {

  /**
   * Handles the constant utils.
   * @method constant
   * @of utils
   */
  constant: function (constant) {
    return {
      /**
       * Check if value exist in constant if not return the default property.
       * @method contains
       * @of constant
       */
      contains: function (checkValue, defaultProp) {
        if (checkValue) {
          for (var prop in Skylink.prototype[constant]) {
            if (Skylink.prototype[constant][prop] === checkValue) {
              return checkValue;
            }
          }
        }
        return Skylink.prototype[constant][defaultProp];
      }
    };
  }

}