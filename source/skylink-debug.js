/**
 * The list of Skylink <code>console</code> logging levels available.
 * Refer to [Javascript Web Console](https://developer.mozilla.org/en/docs/Web/API/console).
 * @attribute LOG_LEVEL
 * @type JSON
 * @param {Number} DEBUG Displays <code>debug</code>, <code>log</code>,
 *   <code>info</code>, <code>warn</code> and <code>error</code> console logs.
 * @param {Number} LOG Displays <code>log</code>,
 *   <code>info</code>, <code>warn</code> and <code>error</code> console logs.
 * @param {Number} INFO Displays <code>info</code>, <code>warn</code> and
 *   <code>error</code> console logs.
 * @param {Number} WARN Displays <code>warn</code> and <code>error</code> console logs.
 * @param {Number} ERROR <i>This is the default log level.</i> Displays <code>error</code> console logs only.
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
 * The format string that is printed in every Skylink console logs for Skylink logs identification.<br>
 * <small>Example: <code>"SkylinkJS - <<logs here>>"</code></small>
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
 * Stores the list of Skylink console logging levels in an array.
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
 * Stores the current Skylink log level.
 * By default, the value is <code>ERROR</code>.
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
 * The flag that indicates if Skylink debugging mode is enabled.
 * This is not to be confused with {{#crossLink "Skylink/setLogLevel:method"}}setLogLevel(){{/crossLink}}
 *   functionality, as that touches the output Web console log levels, and this
 *   enables the debugging trace of the logs <code>console.trace()</code> or storage of the console logs.
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
 * The flag that indicates if Skylink should store the logs in
 *   {{#crossLink "Skylink/_storedLogs:attribute"}}_storedLogs{{/crossLink}}.
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
 * The flag that indicates if Skylink console logs should all output as
 *   <code>console.trace()</code>.
 * If <code>console.trace()</code> is not supported, it will fallback and
 *   output as <code>console.log()</code>.
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
 * Stores all Skylink console logs.
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
 * Gets the stored Skylink console logs from
 *   {{#crossLink "Skylink/_storedLogs:attribute"}}_storedLogs{{/crossLink}}.
 * @method _getStoredLogsFn
 * @param {Number} [logLevel] The specific log level of Skylink console logs
 *   that should be returned. If value is not provided, it will return all stored console logs.
 *  [Rel: Skylink.LOG_LEVEL]
 * @return {Array} The array of stored console logs based on the log level provided.
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
 * Clears the stored Skylink console logs in
 *   {{#crossLink "Skylink/_storedLogs:attribute"}}_storedLogs{{/crossLink}}.
 * @method _clearAllStoredLogsFn
 * @param {Number} [logLevel] The specific log level of Skylink console logs
 *   that should be cleared. If value is not provided, it will clear all stored console logs.
 *  [Rel: Skylink.LOG_LEVEL]
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
 * Prints all the stored Skylink console logs into the Web console from
 *   {{#crossLink "Skylink/_storedLogs:attribute"}}_storedLogs{{/crossLink}}.
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
 * The object that handles the stored Skylink console logs.
 * Skylink {{#crossLink "Skylink/setDebugMode:method"}}setDebugMode(){{/crossLink}} <code>storeLogs</code>
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
   *   that should be returned. If value is not provided, it will return all stored console logs.
   *  [Rel: Skylink.LOG_LEVEL]
   * @return {Array} The array of stored console logs based on the log level provided.
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
   * @required
   * @global true
   * @component Log
   * @for Skylink
   * @since 0.5.5
   */
  printAllLogs: _printAllStoredLogsFn
};

/**
 * Handles the Skylink logs and stores the console log message in
 *   {{#crossLink "Skylink/_storedLogs:attribute"}}_storedLogs{{/crossLink}}
 *   if {{#crossLink "Skylink/_enableDebugStack:attribute"}}_enableDebugStack{{/crossLink}} is
 *   set to <code>true</code> and prints out the log to the Web console.
 * @method _logFn
 * @param {String} logLevel The console log message log level. [Rel: Skylink.LOG_LEVEL]
 * @param {Array|String} message The console log message contents.
 * @param {String} message.[0] The Peer ID the message is associated with.
 * @param {String} message.1 The interface the message is associated with.
 * @param {String|Array} message.2 Any additional message information that the message is
 *    associated with.
 * @param {String} message.3: The console log message message data.
 * @param {Object|String} [debugObject] The console debugging message object to accompany
 *    and display that associates with the console log message.
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
 * The object that handles the logging functionality in Skylink.
 * @attribute log
 * @type JSON
 * @param {Function} debug See {{#crossLink "Skylink/log.debug:property"}}log.debug(){{/crossLink}}.
 * @param {Function} log See {{#crossLink "Skylink/log.log:property"}}log.log(){{/crossLink}}.
 * @param {Function} info See {{#crossLink "Skylink/log.info:property"}}log.info(){{/crossLink}}.
 * @param {Function} warn See {{#crossLink "Skylink/log.warn:property"}}log.warn(){{/crossLink}}.
 * @param {Function} error See {{#crossLink "Skylink/log.error:property"}}log.error(){{/crossLink}}.
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.4
 */
var log = {
  /**
   * Handles the <code>console.debug</code> console log message.
   * @property log.debug
   * @type Function
   * @param {Array|String} message The console log message contents.
   * @param {String} message.[0] The Peer ID the message is associated with.
   * @param {String} message.1 The interface the message is associated with.
   * @param {String|Array} message.2 Any additional message information that the message is
   *    associated with.
   * @param {String} message.3: The console log message message data.
   * @param {Object|String} [debugObject] The console debugging message object to accompany
   *    and display that associates with the console log message.
   * @example
   *   // Logging for message
   *   log.debug("This is my message", object);
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
   * Handles the <code>console.log</code> console log message.
   * @property log.log
   * @type Function
   * @param {Array|String} message The console log message contents.
   * @param {String} message.[0] The Peer ID the message is associated with.
   * @param {String} message.1 The interface the message is associated with.
   * @param {String|Array} message.2 Any additional message information that the message is
   *    associated with.
   * @param {String} message.3: The console log message message data.
   * @param {Object|String} [debugObject] The console debugging message object to accompany
   *    and display that associates with the console log message.
   * @example
   *   // Logging for message
   *   log.log("This is my message", object);
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
   * Handles the <code>console.info</code> console log message.
   * @property log.info
   * @type Function
   * @param {Array|String} message The console log message contents.
   * @param {String} message.[0] The Peer ID the message is associated with.
   * @param {String} message.1 The interface the message is associated with.
   * @param {String|Array} message.2 Any additional message information that the message is
   *    associated with.
   * @param {String} message.3: The console log message message data.
   * @param {Object|String} [debugObject] The console debugging message object to accompany
   *    and display that associates with the console log message.
   * @example
   *   // Logging for message
   *   log.debug("This is my message", object);
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
   * Handles the <code>console.warn</code> console log message.
   * @property log.warn
   * @type Function
   * @param {Array|String} message The console log message contents.
   * @param {String} message.[0] The Peer ID the message is associated with.
   * @param {String} message.1 The interface the message is associated with.
   * @param {String|Array} message.2 Any additional message information that the message is
   *    associated with.
   * @param {String} message.3: The console log message message data.
   * @param {Object|String} [debugObject] The console debugging message object to accompany
   *    and display that associates with the console log message.
   * @example
   *   // Logging for message
   *   log.debug("Here's a warning. Please do xxxxx to resolve this issue", object);
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
   * Handles the <code>console.error</code> console log message.
   * @property log.error
   * @type Function
   * @param {Array|String} message The console log message contents.
   * @param {String} message.[0] The Peer ID the message is associated with.
   * @param {String} message.1 The interface the message is associated with.
   * @param {String|Array} message.2 Any additional message information that the message is
   *    associated with.
   * @param {String} message.3: The console log message message data.
   * @param {Object|String} [debugObject] The console debugging message object to accompany
   *    and display that associates with the console log message.
   * @example
   *   // Logging for external information
   *   log.error("There has been an error", object);
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