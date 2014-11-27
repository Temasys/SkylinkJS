/**
 * The log levels.
 * - Order from highest to lowest is: error > warn > info > log > debug.
 * - A log level displays logs of his level and higher (e.g warn level displays warn and error).
 * @attribute LOG_LEVEL
 * @type JSON
 * @param {Integer} DEBUG Level 5. Shows debug logs.
 * @param {Integer} LOG Level 4. Shows normal logs.
 * @param {Integer} INFO Level 3. Show informational logs related to user.
 * @param {Integer} WARN Level 2. Shows warnings.
 * @param {Integer} ERROR Level 1. Shows the errors that are thrown during
 *   execution.
 * @readOnly
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype.LOG_LEVEL = {
  DEBUG: 4,
  LOG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0
};

/**
 * The log key
 * @type String
 * @global true
 * @readOnly
 * @for Skylink
 * @since 0.5.4
 */
var _LOG_KEY = 'SkylinkJS';


/**
 * The list of level levels based on index.
 * @attribute _LOG_LEVELS
 * @type Array
 * @required
 * @global true
 * @private
 * @for Skylink
 * @since 0.5.5
 */
var _LOG_LEVELS = ['error', 'warn', 'info', 'log', 'debug'];

/**
 * The log level of Skylink
 * @attribute _logLevel
 * @type String
 * @default Skylink.LOG_LEVEL.ERROR
 * @required
 * @global true
 * @private
 * @for Skylink
 * @since 0.5.4
 */
var _logLevel = 0;

/**
 * The current state if debugging mode is enabled.
 * @attribute _enableDebugMode
 * @type Boolean
 * @default false
 * @private
 * @required
 * @global true
 * @for Skylink
 * @since 0.5.4
 */
var _enableDebugMode = false;

/**
 * Handles the list of Skylink logs.
 * @attribute SkylinkLogs
 * @type Class
 * @required
 * @global true
 * @for Skylink
 * @since 0.5.5
 */
/* jshint ignore:start */
window.SkylinkLogs = new (function () {
/* jshint ignore:end */
  /**
   * An internal array of logs.
   * @property SkylinkLogs._logs
   * @type Array
   * @required
   * @global true
   * @private
   * @for Skylink
   * @since 0.5.5
   */
  this._logs = [];

  /**
   * Gets the list of logs
   * @property SkylinkLogs.get
   * @param {Integer} [logLevel] The log level that get() should return.
   *  If not provided, it get() will return all logs from all levels.
   *  [Rel: Skylink.LOG_LEVEL]
   * @return {Array} The array of logs
   * @type Function
   * @required
   * @global true
   * @for Skylink
   * @since 0.5.5
   */
  this.get = function (logLevel) {
    if (typeof logLevel === 'undefined') {
      return this._logs;
    }
    var logs = [];
    for (var i = 0; i < this._logs.length; i++) {
      if (this._logs[i][1] === _LOG_LEVELS[logLevel]) {
        logs.push(this._logs[i]);
      }
    }
    return logs;
  };

  /**
   * Clear all the stored logs.
   * @property SkylinkLogs.clear
   * @type Function
   * @required
   * @global true
   * @for Skylink
   * @since 0.5.5
   */
  this.clear = function () {
    this._logs = [];
  };

  /**
   * Print out all the store logs in console.
   * @property SkylinkLogs.printStack
   * @type Function
   * @required
   * @global true
   * @for Skylink
   * @since 0.5.5
   */
  this.printStack = function () {
    for (var i = 0; i < this._logs.length; i++) {
      var timestamp = this._logs[i][0];
      var log = (console[this._logs[i][1]] !== 'undefined') ?
        this._logs[i][1] : 'log';
      var message = this._logs[i][2];
      var debugObject = this._logs[i][3];

      if (typeof debugObject !== 'undefined') {
        console[log](message, debugObject, timestamp);
      } else {
        console[log](message, timestamp);
      }
    }
  };
/* jshint ignore:start */
})();
/* jshint ignore:end */

/**
 * Logs all the console information.
 * @method _log
 * @param {String} logLevel The log level.
 * @param {Array|String} message The console message.
 * @param {String} message.0 The targetPeerId the message is targeted to.
 * @param {String} message.1 The interface the message is targeted to.
 * @param {String|Array} message.2 The events the message is targeted to.
 * @param {String} message.3: The log message.
 * @param {Object|String} [debugObject] The console parameter string or object.
 * @private
 * @required
 * @global true
 * @for Skylink
 * @since 0.5.5
 */
var _logFn = function(logLevel, message, debugObject) {
  var outputLog = _LOG_KEY;

  if (typeof message === 'object') {
    outputLog += (message[0]) ? ' [' + message[0] + '] -' : ' -';
    outputLog += (message[1]) ? ' <<' + message[1] + '>>' : '';
    if (message[2]) {
      outputLog += ' ';
      if (typeof message[2] === 'object') {
        for (var i = 0; i < message[2].length; i++) {
          outputLog += '(' + message[2][i] + ')';
        }
      } else {
        outputLog += '(' + message[2] + ')';
      }
    }
    outputLog += ' ' + message[3];
  } else {
    outputLog += ' - ' + message;
  }

  if (_enableDebugMode) {
    // store the logs
    var logItem = [(new Date()), _LOG_LEVELS[logLevel], outputLog];

    if (typeof debugObject !== 'undefined') {
      logItem.push(debugObject);
    }
    window.SkylinkLogs._logs.push(logItem);
  }

  if (_logLevel >= logLevel) {
    // Fallback to log if failure
    logLevel = (typeof console[_LOG_LEVELS[logLevel]] === 'undefined') ? 3 : logLevel;

    if (_enableDebugMode) {
      var logConsole = (typeof console.trace === 'undefined') ? logLevel[3] : 'trace';
      if (typeof debugObject !== 'undefined') {
        console[_LOG_LEVELS[logLevel]](outputLog, debugObject);
        // output if supported
        if (typeof console.trace !== 'undefined') {
          console.trace('');
        }
      } else {
        console[_LOG_LEVELS[logLevel]](outputLog);
        // output if supported
        if (typeof console.trace !== 'undefined') {
          console.trace('');
        }
      }
    } else {
      if (typeof debugObject !== 'undefined') {
        console[_LOG_LEVELS[logLevel]](outputLog, debugObject);
      } else {
        console[_LOG_LEVELS[logLevel]](outputLog);
      }
    }
  }
};

/**
 * Logs all the console information.
 * @attribute log
 * @type JSON
 * @param {Function} debug For debug mode.
 * @param {Function} log For log mode.
 * @param {Function} info For info mode.
 * @param {Function} warn For warn mode.
 * @param {Function} serror For error mode.
 * @private
 * @required
 * @global true
 * @for Skylink
 * @since 0.5.4
 */
/**
 * Outputs a debug log in the console.
 * @method log.debug
 * @param {Array|String} message or the message
 * @param {String} message.0 The targetPeerId the log is targetted to
 * @param {String} message.1 he interface the log is targetted to
 * @param {String|Array} message.2 The related names, keys or events to the log
 * @param {String} message.3 The log message.
 * @param {String|Object} [object] The log object.
 * @example
 *   // Logging for message
 *   log.debug('This is my message', object);
 * @private
 * @required
 * @global true
 * @for Skylink
 * @since 0.5.4
 */
/**
 * Outputs a normal log in the console.
 * @method log.log
 * @param {Array|String} message or the message
 * @param {String} message.0 The targetPeerId the log is targetted to
 * @param {String} message.1 he interface the log is targetted to
 * @param {String|Array} message.2 The related names, keys or events to the log
 * @param {String} message.3 The log message.
 * @param {String|Object} [object] The log object.
 * @example
 *   // Logging for message
 *   log.log('This is my message', object);
 * @private
 * @required
 * @global true
 * @for Skylink
 * @since 0.5.4
 */
/**
 * Outputs an info log in the console.
 * @method log.info
 * @param {Array|String} message or the message
 * @param {String} message.0 The targetPeerId the log is targetted to
 * @param {String} message.1 he interface the log is targetted to
 * @param {String|Array} message.2 The related names, keys or events to the log
 * @param {String} message.3 The log message.
 * @param {String|Object} [object] The log object.
 * @example
 *   // Logging for message
 *   log.debug('This is my message', object);
 * @private
 * @required
 * @global true
 * @for Skylink
 * @since 0.5.4
 */
/**
 * Outputs a warning log in the console.
 * @method log.warn
 * @param {Array|String} message or the message
 * @param {String} message.0 The targetPeerId the log is targetted to
 * @param {String} message.1 he interface the log is targetted to
 * @param {String|Array} message.2 The related names, keys or events to the log
 * @param {String} message.3 The log message.
 * @param {String|Object} [object] The log object.
 * @example
 *   // Logging for message
 *   log.debug('Here\'s a warning. Please do xxxxx to resolve this issue', object);
 * @private
 * @required
 * @for Skylink
 * @since 0.5.4
 */
/**
 * Outputs an error log in the console.
 * @method log.error
 * @param {Array|String} message or the message
 * @param {String} message.0 The targetPeerId the log is targetted to
 * @param {String} message.1 he interface the log is targetted to
 * @param {String|Array} message.2 The related names, keys or events to the log
 * @param {String} message.3 The log message.
 * @param {String|Object} [object] The log object.
 *   // Logging for external information
 *   log.error('There has been an error', object);
 * @private
 * @required
 * @global true
 * @for Skylink
 * @since 0.5.4
 */
var log = {
  debug: function (message, object) {
    _logFn(4, message, object);
  },
  log: function (message, object) {
    _logFn(3, message, object);
  },
  info: function (message, object) {
    _logFn(2, message, object);
  },
  warn: function (message, object) {
    _logFn(1, message, object);
  },
  error: function (message, object) {
    _logFn(0, message, object);
  }
};

/**
 * Sets the debugging log level. A log level displays logs of his level and higher:
 * ERROR > WARN > INFO > LOG > DEBUG.
 * - The default log level is Skylink.LOG_LEVEL.WARN
 * @method setLogLevel
 * @param {String} [logLevel] The log level.[Rel: Skylink.Data.LOG_LEVEL]
 * @example
 *   //Display logs level: Error, warn, info, log and debug.
 *   SkylinkDemo.setLogLevel(SkylinkDemo.LOG_LEVEL.DEBUG);
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.setLogLevel = function(logLevel) {
  if(logLevel === undefined) {
    logLevel = Skylink.LOG_LEVEL.WARN;
  }
  for (var level in this.LOG_LEVEL) {
    if (this.LOG_LEVEL[level] === logLevel) {
      _logLevel = logLevel;
      log.log([null, 'Log', level, 'Log level exists. Level is set']);
      return;
    }
  }
  log.error([null, 'Log', level, 'Log level does not exist. Level is not set']);
};

/**
 * Sets Skylink in debugging mode to display log stack trace.
 * - By default, debugging mode is turned off.
 * @method setDebugMode
 * @param {Boolean} [isDebugMode=false] Debugging mode value
 * @example
 *   SkylinkDemo.setDebugMode(true);
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.setDebugMode = function(isDebugMode) {
  _enableDebugMode = !!isDebugMode;
};