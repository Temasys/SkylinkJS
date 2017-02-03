/**
 * + Factory that handles the stored logs.
 */
var LogStorageFactory = (function () {
  var storedLogs = {};

  return {
    /**
     * + Function that pushes log to storage.
     */
    push: function (timestamp, prop, output, obj, instanceLabel) {
      storedLogs[instanceLabel] = storedLogs[instanceLabel] || [];
      storedLogs[instanceLabel].push([timestamp, prop, output, obj || null, instanceLabel]);
    },

    /**
     * + Function loops for each logs.
     */
    loop: function (instanceLabel, level) {
      var output = [];
      var prop = null;

      if (typeof level === 'number') {
        UtilsFactory.forEach(Skylink.prototype.LOG_LEVEL, function (opt, cprop) {
          if (opt === level) {
            prop = cprop;
          }
        });
      }

      UtilsFactory.forEach(storedLogs, function (logs, clabel) {
        if (instanceLabel && typeof instanceLabel === 'string' ? instanceLabel === clabel : true) {
          UtilsFactory.forEach(logs, function (log) {
            if (prop ? (log[1] || '').toUpperCase() === prop : true) {
              output.push(log);
            }
          });
        }
      });

      return output;
    },

    /**
     * + Function that clears log.
     */
    clear: function (instanceLabel, level) {
      var prop = null;
      var fn = function (instanceLabel) {
        if (!Array.isArray(storedLogs[instanceLabel])) {
          return;
        }

        for (var i = 0; i < storedLogs[instanceLabel].length; i++) {
          if (prop ? (storedLogs[instanceLabel][i][1] || '').toUpperCase() === prop : true) {
            storedLogs[instanceLabel].splice(i, 1);
            i--;
          }
        }
      };

      if (typeof level === 'number') {
        UtilsFactory.forEach(Skylink.prototype.LOG_LEVEL, function (opt, cprop) {
          if (opt === level) {
            prop = cprop;
          }
        });
      }

      if (instanceLabel && typeof instanceLabel === 'string') {
        fn(instanceLabel);
      } else {
        UtilsFactory.forEach(storedLogs, function (logs, clabel) {
          fn(clabel);
        });
      }
    }
  };
})();
