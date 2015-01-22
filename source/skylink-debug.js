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
 * @component Log
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
 * @attribute _LOG_KEY
 * @type String
 * @scoped true
 * @readOnly
 * @private
 * @component Log
 * @for Skylink
 * @since 0.5.4
 */
var _LOG_KEY = 'SkylinkJS';


/**
 * The list of level levels based on index.
 * @attribute _LOG_LEVELS
 * @type Array
 * @required
 * @scoped true
 * @private
 * @component Log
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
 * @scoped true
 * @private
 * @component Log
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
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.4
 */
var _enableDebugMode = false;

/**
 * The current state if debugging mode should store
 * the logs in SkylinkLogs.
 * @attribute _enableDebugStack
 * @type Boolean
 * @default false
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _enableDebugStack = false;

/**
 * The current state if debugging mode should
 * print the trace in every log information.
 * @attribute _enableDebugTrace
 * @type Boolean
 * @default false
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _enableDebugTrace = false;

/**
 * An internal array of logs.
 * @attribute _storedLogs
 * @type Array
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _storedLogs = [];

/**
 * Gets the list of logs
 * @method _getStoredLogsFn
 * @param {Integer} [logLevel] The log level that get() should return.
 *  If not provided, it get() will return all logs from all levels.
 *  [Rel: Skylink.LOG_LEVEL]
 * @return {Array} The array of logs
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _getStoredLogsFn = function (logLevel) {
  if (typeof logLevel === 'undefined') {
    return _storedLogs;
  }
  var returnLogs = [];
  for (var i = 0; i < _storedLogs.length; i++) {
    if (_storedLogs[i][1] === _LOG_LEVELS[logLevel]) {
      returnLogs.push(_storedLogs[i]);
    }
  }
  return returnLogs;
};

/**
 * Gets the list of logs
 * @method _clearAllStoredLogsFn
 * @param {Integer} [logLevel] The log level that get() should return.
 *  If not provided, it get() will return all logs from all levels.
 *  [Rel: Skylink.LOG_LEVEL]
 * @return {Array} The array of logs
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _clearAllStoredLogsFn = function () {
  _storedLogs = [];
};

/**
 * Print out all the store logs in console.
 * @method _printAllStoredLogsFn
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _printAllStoredLogsFn = function () {
  for (var i = 0; i < _storedLogs.length; i++) {
    var timestamp = _storedLogs[i][0];
    var log = (console[_storedLogs[i][1]] !== 'undefined') ?
      _storedLogs[i][1] : 'log';
    var message = _storedLogs[i][2];
    var debugObject = _storedLogs[i][3];

    if (typeof debugObject !== 'undefined') {
      console[log](message, debugObject, timestamp);
    } else {
      console[log](message, timestamp);
    }
  }
};

/**
 * Handles the list of Skylink logs.
 * @attribute SkylinkLogs
 * @type JSON
 * @required
 * @global true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
window.SkylinkLogs = {
  /**
   * Gets the list of logs
   * @property SkylinkLogs.getLogs
   * @param {Integer} [logLevel] The log level that getLogs() should return.
   *  If not provided, it getLogs() will return all logs from all levels.
   *  [Rel: Skylink.LOG_LEVEL]
   * @return {Array} The array of logs
   * @type Function
   * @required
   * @global true
   * @component Log
   * @for Skylink
   * @since 0.5.5
   */
  getLogs: _getStoredLogsFn,

  /**
   * Clear all the stored logs.
   * @property SkylinkLogs.clearAllLogs
   * @type Function
   * @required
   * @global true
   * @component Log
   * @for Skylink
   * @since 0.5.5
   */
  clearAllLogs: _clearAllStoredLogsFn,

  /**
   * Print out all the store logs in console.
   * @property SkylinkLogs.printAllLogs
   * @type Function
   * @required
   * @global true
   * @component Log
   * @for Skylink
   * @since 0.5.5
   */
  printAllLogs: _printAllStoredLogsFn
};

/**
 * Logs all the console information.
 * @method _logFn
 * @param {String} logLevel The log level.
 * @param {Array|String} message The console message.
 * @param {String} message.0 The targetPeerId the message is targeted to.
 * @param {String} message.1 The interface the message is targeted to.
 * @param {String|Array} message.2 The events the message is targeted to.
 * @param {String} message.3: The log message.
 * @param {Object|String} [debugObject] The console parameter string or object.
 * @private
 * @required
 * @scoped true
 * @component Log
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

  if (_enableDebugMode && _enableDebugStack) {
    // store the logs
    var logItem = [(new Date()), _LOG_LEVELS[logLevel], outputLog];

    if (typeof debugObject !== 'undefined') {
      logItem.push(debugObject);
    }
    _storedLogs.push(logItem);
  }

  if (_logLevel >= logLevel) {
    // Fallback to log if failure
    logLevel = (typeof console[_LOG_LEVELS[logLevel]] === 'undefined') ? 3 : logLevel;

    if (_enableDebugMode && _enableDebugTrace) {
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
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.4
 */
var log = {
  /**
   * Outputs a debug log in the console.
   * @property log.debug
   * @type Function
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
   * @scoped true
   * @component Log
   * @for Skylink
   * @since 0.5.4
   */
  debug: function (message, object) {
    _logFn(4, message, object);
  },

  /**
   * Outputs a normal log in the console.
   * @property log.log
   * @type Function
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
   * @scoped true
   * @component Log
   * @for Skylink
   * @since 0.5.4
   */
  log: function (message, object) {
    _logFn(3, message, object);
  },

  /**
   * Outputs an info log in the console.
   * @property log.info
   * @type Function
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
   * @scoped true
   * @component Log
   * @for Skylink
   * @since 0.5.4
   */
  info: function (message, object) {
    _logFn(2, message, object);
  },

  /**
   * Outputs a warning log in the console.
   * @property log.warn
   * @type Function
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
   * @component Log
   * @for Skylink
   * @since 0.5.4
   */
  warn: function (message, object) {
    _logFn(1, message, object);
  },

  /**
   * Outputs an error log in the console.
   * @property log.error
   * @type Function
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
   * @scoped true
   * @component Log
   * @for Skylink
   * @since 0.5.4
   */
  error: function (message, object) {
    _logFn(0, message, object);
  }
};

/**
 * Sets the debugging log level. A log level displays logs of his level and higher:
 * ERROR > WARN > INFO > LOG > DEBUG.
 * - The default log level is Skylink.LOG_LEVEL.WARN
 * @method setLogLevel
 * @param {Integer} [logLevel] The log level.[Rel: Skylink.Data.LOG_LEVEL]
 * @example
 *   //Display logs level: Error, warn, info, log and debug.
 *   SkylinkDemo.setLogLevel(SkylinkDemo.LOG_LEVEL.DEBUG);
 * @component Log
 * @for Skylink
 * @since 0.5.5
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
 * @param {Boolean|JSON} [options=false] Is debugging mode enabled.
 * @param {Boolean} [options.trace=false] If console output should trace.
 * @param {Boolean} [options.storeLogs=false] If SkylinkLogs should store
 *   the output logs.
 * @example
 *   // Example 1: just to enable
 *   SkylinkDemo.setDebugMode(true);
 *   // or
 *   SkylinkDemo.setDebugMode();
 *
 *   // Example 2: just to disable
 *   SkylinkDemo.setDebugMode(false);
 * @component Log
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.setDebugMode = function(isDebugMode) {
  if (typeof isDebugMode === 'object') {
    if (Object.keys(isDebugMode).length > 0) {
      _enableDebugTrace = !!isDebugMode.trace;
      _enableDebugStack = !!isDebugMode.storeLogs;
    } else {
      _enableDebugMode = false;
      _enableDebugTrace = false;
      _enableDebugStack = false;
    }
  }
  if (isDebugMode === false) {
    _enableDebugMode = false;
    _enableDebugTrace = false;
    _enableDebugStack = false;

    return;
  }
  _enableDebugMode = true;
  _enableDebugTrace = true;
  _enableDebugStack = true;
};