/**
 * The log levels.
 * - Logs are shown based on the level, if the level is highest, it shows logs
 *   which level are lower than theirs. If the level is lower, it shows only
 *   logs that are lower or are the same level, not the higher ones.
 * - Order from lowest to the highest is: error > warn > info > log > debug.
 * @attribute PEER_CONNECTION_STATE
 * @type JSON
 * @param {Integer} DEBUG Level 5. Shows debug logs.
 * @param {Integer} LOG Level 4. Shows normal logs.
 * @param {Integer} INFO Level 3. Show informational logs related to user.
 * @param {Integer} WARN Level 2. Shows warnings.
 * @param {Integer} ERROR Level 1. Shows the errors that are thrown during
 *   execution.
 * @readOnly
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
 * @readOnly
 * @since 0.5.4
 */
var _LOG_KEY = 'SkylinkJS';

/**
 * The log level of Skylink
 * @attribute _logLevel
 * @type String
 * @default WARN - 1
 * @required
 * @private
 * @since 0.5.2
 */
var _logLevel = 4;

/**
 * The current state if debugging mode is enabled.
 * @attribute _enableDebugMode
 * @type Boolean
 * @default false
 * @private
 * @required
 * @since 0.5.2
 */
var _enableDebugMode = false;

/**
 * Logs all the console information.
 * - Note: This is a variable outside of Skylink scope
 * @method _log
 * @param {String} logLevel The log level.
 * @param {JSON|String} message The console message.
 * @param {String} message.target The targetPeerId the message is targeted to.
 * @param {String} message.interface The interface the message is targeted to.
 * @param {Array|String} message.keys The events the message is targeted to.
 * @param {String} message.log The log message.
 * @param {Object|String} debugObject The console parameter string or object.
 * @private
 * @required
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
      console.log(levels[logLevel], message);
      if (typeof debugObject !== 'undefined') {
        console[levels[logLevel]](outputLog, debugObject);
      } else {
        console[levels[logLevel]](outputLog);
      }
    }
  }
};

/**
 * Logs all the console information.
 * - Note: This is a variable outside of Skylink scope
 * @method log
 * @param {String} logLevel The log level.
 * - log.debug: For debug mode
 * - log.log: For log mode
 * - log.info: For info mode
 * - log.warn: For warn mode
 * - log.error: For error mode
 * @param {Array|String} message or the message
 * @param {String} message.0 TargetPeerId - The targetPeerId the log is targetted to
 * @param {String} message.1 Interface - The interface the log is targetted to
 * @param {String} message.2 Events - The related names, keys or events to the log
 * @param {String} message.3 Message - The log message
 * @example
 *   // Logging for message
 *   log.debug('This is my message', object);
 *
 *   // Logging for external information
 *   log.error([targetPeerId, 'RTCPeerConnection', 'Connection failed'], object);
 * @private
 * @require
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
 * @since 0.5.2
 */
Skylink.prototype.setDebugMode = function(isDebugMode) {
  _enableDebugMode = isDebugMode;
};