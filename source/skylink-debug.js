/**
 * These are the logging levels that Skylink provides.
 * - This manipulates the debugging messages sent to <code>console</code> object.
 * - Refer to [Javascript Web Console](https://developer.mozilla.org/en/docs/Web/API/console).
 * @attribute LOG_LEVEL
 * @type JSON
 * @param {Number} DEBUG <small>Value <code>4</code> | Level higher than <code>LOG</code></small>
 *   Displays debugging logs from <code>LOG</code> level onwards with <code>DEBUG</code> logs.
 * @param {Number} LOG <small>Value <code>3</code> | Level higher than <code>INFO</code></small>
 *   Displays debugging logs from <code>INFO</code> level onwards with <code>LOG</code> logs.
 * @param {Number} INFO <small>Value <code>2</code> | Level higher than <code>WARN</code></small>
 *   Displays debugging logs from <code>WARN</code> level onwards with <code>INFO</code> logs.
 * @param {Number} WARN <small>Value <code>1</code> | Level higher than <code>ERROR</code></small>
 *   Displays debugging logs of <code>ERROR</code> level with <code>WARN</code> logs.
 * @param {Number} ERROR <small><b>DEFAULT</b> | Value <code>0</code> | Lowest level</small>
 *   Displays only <code>ERROR</code> logs.
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
 * Stores the log message starting header string.
 * E.g. "<header> - <the log message>".
 * @attribute _LOG_KEY
 * @type String
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.4
 */
var _LOG_KEY = 'SkylinkJS';


/**
 * Stores the list of available SDK log levels.
 * @attribute _LOG_LEVELS
 * @type Array
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _LOG_LEVELS = ['error', 'warn', 'info', 'log', 'debug'];

/**
 * Stores the current SDK log level.
 * Default is ERROR (<code>0</code>).
 * @attribute _logLevel
 * @type String
 * @default 0
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.4
 */
var _logLevel = 0;

/**
 * Stores the flag if debugging mode is enabled.
 * This manipulates the SkylinkLogs interface.
 * @attribute _enableDebugMode
 * @type Boolean
 * @default false
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.4
 */
var _enableDebugMode = false;

/**
 * Stores the flag if logs should be stored in SkylinkLogs interface.
 * @attribute _enableDebugStack
 * @type Boolean
 * @default false
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _enableDebugStack = false;

/**
 * Stores the flag if logs should trace if available.
 * This uses the <code>console.trace</code> API.
 * @attribute _enableDebugTrace
 * @type Boolean
 * @default false
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _enableDebugTrace = false;

/**
 * Stores the logs used for SkylinkLogs object.
 * @attribute _storedLogs
 * @type Array
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _storedLogs = [];

/**
 * Function that gets the stored logs.
 * @method _getStoredLogsFn
 * @private
 * @scoped true
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
 * Function that clears the stored logs.
 * @method _clearAllStoredLogsFn
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _clearAllStoredLogsFn = function () {
  _storedLogs = [];
};

/**
 * Function that prints in the Web Console interface the stored logs.
 * @method _printAllStoredLogsFn
 * @private
 * @scoped true
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
 * The object that handles the stored Skylink console logs.
 * - {{#crossLink "Skylink/setDebugMode:method"}}setDebugMode(){{/crossLink}} <code>storeLogs</code> flag
 *   must be set as <code>true</code> to enable the storage of logs.
 * @property SkylinkLogs
 * @type JSON
 * @required
 * @global true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
window.SkylinkLogs = {
  /**
   * Gets the stored Skylink console logs.
   * @property SkylinkLogs.getLogs
   * @param {Number} [logLevel] The specific log level of Skylink console logs
   *   that should be returned.<br>If value is not provided, it will return all stored console logs.
   *  [Rel: Skylink.LOG_LEVEL]
   * @return {Array} The array of stored console logs based on the log level provided.
   * @example
   *  // Example 1: Get logs of specific level
   *  var debugLogs = SkylinkLogs.getLogs(SkylinkDemo.LOG_LEVEL.DEBUG);
   *
   *  // Example 2: Get all logs
   *  var allLogs = SkylinkLogs.getLogs();
   * @type Function
   * @required
   * @global true
   * @component Log
   * @for Skylink
   * @since 0.5.5
   */
  getLogs: _getStoredLogsFn,

  /**
   * Clears the stored Skylink console logs.
   * @property SkylinkLogs.clearAllLogs
   * @param {Number} [logLevel] The specific log level of Skylink console logs
   *   that should be cleared. If value is not provided, it will clear all stored console logs.
   *  [Rel: Skylink.LOG_LEVEL]
   * @type Function
   * @example
   *   SkylinkLogs.clearAllLogs(); // empties all logs
   * @required
   * @global true
   * @component Log
   * @for Skylink
   * @since 0.5.5
   */
  clearAllLogs: _clearAllStoredLogsFn,

  /**
   * Prints all the stored Skylink console logs into the [Web console](https://developer.mozilla.org/en/docs/Web/API/console).
   * @property SkylinkLogs.printAllLogs
   * @type Function
   * @example
   *   SkylinkLogs.printAllLogs(); // check the console
   * @required
   * @global true
   * @component Log
   * @for Skylink
   * @since 0.5.5
   */
  printAllLogs: _printAllStoredLogsFn
};

/**
 * Function that handles the logs received and prints in the Web Console interface according to the log level set.
 * @method _logFn
 * @private
 * @required
 * @scoped true
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
 * Stores the logging functions.
 * @attribute log
 * @param {Function} debug The function that handles the DEBUG level logs.
 * @param {Function} log The function that handles the LOG level logs.
 * @param {Function} info The function that handles the INFO level logs.
 * @param {Function} warn The function that handles the WARN level logs.
 * @param {Function} error The function that handles the ERROR level logs.
 * @type JSON
 * @private
 * @scoped true
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
 * Configures the Skylink console log level that would determine the
 *   type of console logs that would be printed in the [Web console](https://developer.mozilla.org/en/docs/Web/API/console).
 * @method setLogLevel
 * @param {Number} [logLevel] The log level of console message logs to
 *    be printed in the Web console. [Rel: Skylink.LOG_LEVEL]
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
 * Configures the Skylink debugging tools.
 * @method setDebugMode
 * @param {Boolean|JSON} [options=false] The debugging settings for Skylink.
 *   If provided options is a <var>typeof</var> <code>boolean</code>,
 *   <code>storeLogs</code> and <code>trace</code> will be set to <code>true</code>.
 * @param {Boolean} [options.trace=false] The flag that indicates if Skylink console
 *   logs should all output as <code>console.trace()</code>.
 *   If <code>console.trace()</code> is not supported, it will fallback and
 *   output as <code>console.log()</code>.
 * @param {Boolean} [options.storeLogs=false] The flag that indicates if
 *   Skylink should store the logs in
 *   {{#crossLink "Skylink/SkylinkLogs:property"}}SkylinkLogs{{/crossLink}}.
 * @example
 *   // Example 1: just to enable
 *   SkylinkDemo.setDebugMode(true);
 *   // or
 *   SkylinkDemo.setDebugMode();
 *
 *   // Example 2: just to disable
 *   SkylinkDemo.setDebugMode(false);
 *
 *   // Example 3: disable storeLogs or trace feature individually
 *   SkylinkDemo.setDebugMode({ trace: true });
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