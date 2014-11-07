/**
 * The log levels.
 * - Logs are shown based on the level, if the level is highest, it shows logs
 *   which level are lower than theirs. If the level is lower, it shows only
 *   logs that are lower or are the same level, not the higher ones.
 * - Order from lowest to the highest is: error > warn > info > log > debug.
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
 * [GLOBAL VARIABLE] The log key
 * @type String
 * @readOnly
 * @for Skylink
 * @since 0.5.4
 */
var _LOG_KEY = 'SkylinkJS';

/**
 * [GLOBAL VARIABLE] The log level of Skylink
 * @attribute _logLevel
 * @type String
 * @default Skylink.LOG_LEVEL.WARN - 1
 * @required
 * @private
 * @for Skylink
 * @since 0.5.4
 */
var _logLevel = 4;

/**
 * [GLOBAL VARIABLE] The current state if debugging mode is enabled.
 * @attribute _enableDebugMode
 * @type Boolean
 * @default false
 * @private
 * @required
 * @for Skylink
 * @since 0.5.4
 */
var _enableDebugMode = false;

/**
 * [GLOBAL VARIABLE] Logs all the console information.
 * - Note: This is a variable outside of Skylink scope
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
 * @for Skylink
 * @since 0.5.4
 */
var _logFn = function(logLevel, message, debugObject) {
  var levels = ['error', 'warn', 'info', 'log', 'debug'];
  var outputLog = _LOG_KEY;

  if (_logLevel >= logLevel) {
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
    // Fallback to log if failure
    var enableDebugOutputLog = '++ ' + levels[logLevel].toUpperCase() + ' ++  ' + outputLog;

    logLevel = (typeof console[levels[logLevel]] === 'undefined') ? 3 : logLevel;

    if (_enableDebugMode) {
      var logConsole = (typeof console.trace === 'undefined') ? logLevel[3] : 'trace';
      if (typeof debugObject !== 'undefined') {
        console[logConsole](enableDebugOutputLog, debugObject);
      } else {
        console[logConsole](enableDebugOutputLog);
      }
    } else {
      if (typeof debugObject !== 'undefined') {
        console[levels[logLevel]](outputLog, debugObject);
      } else {
        console[levels[logLevel]](outputLog);
      }
    }
  }
};

/**
 * [GLOBAL VARIABLE] Logs all the console information.
 * - Note: This is a variable outside of Skylink scope
 * @attribute log
 * @type JSON
 * @param {Function} debug For debug mode.
 * @param {Function} log For log mode.
 * @param {Function} info For info mode.
 * @param {Function} warn For warn mode.
 * @param {Function} serror For error mode.
 * @private
 * @required
 * @for Skylink
 * @since 0.5.4
 */
/**
 * [GLOBAL VARIABLE] Outputs a debug log in the console.
 * - Note: This is a variable outside of Skylink scope
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
 * @for Skylink
 * @since 0.5.4
 */
/**
 * [GLOBAL VARIABLE] Outputs a normal log in the console.
 * - Note: This is a variable outside of Skylink scope
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
 * @for Skylink
 * @since 0.5.4
 */
/**
 * [GLOBAL VARIABLE] Outputs an info log in the console.
 * - Note: This is a variable outside of Skylink scope
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
 * @for Skylink
 * @since 0.5.4
 */
/**
 * [GLOBAL VARIABLE] Outputs a warning log in the console.
 * - Note: This is a variable outside of Skylink scope
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
 * [GLOBAL VARIABLE] Outputs an error log in the console.
 * - Note: This is a variable outside of Skylink scope
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
 * Sets the debugging log level.
 * - The default log level is Skylink.LOG_LEVEL.WARN
 * @method setLogLevel
 * @param {String} logLevel The log level. [Rel: Skylink.LOG_LEVEL]
 * @example
 *   SkylinkDemo.setLogLevel(SkylinkDemo.LOG_LEVEL.TRACE);
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.setLogLevel = function(logLevel) {
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
 * Sets Skylink in debugging mode to display stack trace.
 * - By default, debugging mode is turned off.
 * @method setDebugMode
 * @param {Boolean} isDebugMode If debugging mode is turned on or off.
 * @example
 *   SkylinkDemo.setDebugMode(true);
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.setDebugMode = function(isDebugMode) {
  _enableDebugMode = isDebugMode;
};