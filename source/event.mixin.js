/**
 * Mixin that handles event listeners and subscription.
 */
function EventMixin (obj) {
  // Private properties
  obj._listeners = {
    once: [],
    on: []
  };

  /**
   * Function to subscribe to an event.
   */
  obj.on = function (eventName, fn) {
    if (!Array.isArray(obj._listeners.on[eventName])) {
      obj._listeners.on[eventName] = [];
    }

    obj._listeners.on[eventName].push(fn);
  };

  /**
   * Function to subscribe to an event once.
   */
  obj.once = function (eventName, fn, conditionFn, fireAlways) {
    if (!Array.isArray(obj._listeners.once[eventName])) {
      obj._listeners.once[eventName] = [];
    }

    obj._listeners.once[eventName].push([fn, conditionFn || function () { return true; }, fireAlways]);
  };

  /**
   * Function to subscribe to an event once.
   */
  obj.off = function (eventName, fn) {
    if (typeof eventName === 'string') {
      if (typeof fn === 'function') {
        // Unsubscribe .on() events
        if (Array.isArray(obj._listeners.on[eventName])) {
          var onIndex = 0;
          while (onIndex < obj._listeners.on[eventName].length) {
            if (obj._listeners.on[eventName][onIndex] === fn) {
              obj._listeners.on[eventName].splice(onIndex, 1);
              onIndex--;
            }
            onIndex++;
          }
        }
        // Unsubscribe .once() events
        if (Array.isArray(obj._listeners.once[eventName])) {
          var onceIndex = 0;
          while (onceIndex < obj._listeners.once[eventName].length) {
            if (obj._listeners.once[eventName][onceIndex][0] === fn) {
              obj._listeners.once[eventName].splice(onceIndex, 1);
              onceIndex--;
            }
            onceIndex++;
          }
        }
      } else {
        obj._listeners.on[eventName] = [];
        obj._listeners.once[eventName] = [];
      }
    } else {
      obj._listeners.on = {};
      obj._listeners.once = {};
    }
  };

  /**
   * Function to emit events.
   */
  obj._emit = function (eventName) {
    var params = Array.prototype.slice.call(arguments);
    // Remove the eventName parameter
    params.shift();

    // Trigger .on() event listeners
    if (Array.isArray(obj._listeners.on[eventName])) {
      var onIndex = 0;
      while (onIndex < obj._listeners.on[eventName].length) {
        obj._listeners.on[eventName][onIndex].apply(obj, params);
        onIndex++;
      }
    }

    // Trigger .once() event listeners
    if (Array.isArray(obj._listeners.once[eventName])) {
      var onceIndex = 0;
      while (onceIndex < obj._listeners.once[eventName].length) {
        if (obj._listeners.once[eventName][onceIndex][1].apply(obj, params)) {
          obj._listeners.once[eventName][onceIndex][0].apply(obj, params);
          // Remove event listener if met condition and not "fire always"
          if (obj._listeners.once[eventName][onceIndex][0][2] !== true) {
            obj._listeners.once[eventName].splice(onceIndex, 1);
            onceIndex--;
          }
        }
        onceIndex++;
      }
    }
  };
}