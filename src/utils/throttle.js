/**
 * Function that throttles a method function to prevent multiple invokes over a specified amount of time.
 * Returns a function to be invoked <code>._throttle(fn, 1000)()</code> to make throttling functionality work.
 * @method throttle
 * @param {Function} func
 * @param {Number} limit
 * @private
 *
 * @since 0.5.8
 */

const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  /* eslint-disable func-names */
  /* eslint-disable prefer-rest-params */
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

export default throttle;
