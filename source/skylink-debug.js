/**
 * The log levels.
 * - Logs are shown based on the level, if the level is highest, it shows logs
 *   which level are lower than theirs. If the level is lower, it shows only
 *   logs that are lower or are the same level, not the higher ones.
 * - Order from lowest to the highest is: error > warn > info > log > debug.
 * @attribute PEER_CONNECTION_STATE
 * @type JSON
 * @param {String} DEBUG Level 5. Shows debug logs.
 * @param {String} TRACE Level 4. Shows trace logs.
 * @param {String} INFO Level 3. Show informational logs related to user.
 * @param {String} WARN Level 2. Shows warnings.
 * @param {String} ERROR Level 1. Shows the errors that are thrown during
 *   execution.
 * @readOnly
 * @since 0.5.2
 */
Skylink.prototype.LOG_LEVEL = {
  DEBUG: 'debug',
  TRACE: 'log',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

/**
 * The log level of Skylink
 * @attribute _logLevel
 * @type String
 * @default 'warn'
 * @required
 * @private
 * @since 0.5.2
 */
Skylink.prototype._logLevel = 'warn';

/**
 * The current state if debugging mode is enabled.
 * @attribute _enableDebugMode
 * @type Boolean
 * @default false
 * @private
 * @required
 * @since 0.5.2
 */
Skylink.prototype._enableDebugMode = false;

/**
 * Logs all the console information.
 * - TODO: Set all interface information.
 * @method _log
 * @param {String} logLevel The log level. [Rel: Skylink.LOG_LEVEL]
 * @param {JSON|String} message The console message.
 * @param {String} message.target The targetPeerId the message is targeted to.
 * @param {String} message.interface The interface the message is targeted to.
 * @param {Array|String} message.keys The events the message is targeted to.
 * @param {String} message.log The log message.
 * @param {Object|String} debugObject The console parameter string or object.
 * @private
 * @required
 * @since 0.5.2
 */
Skylink.prototype._log = function(logLevel, message, debugObject) {
  var logOrders = { debug: 4, log: 3, info: 2, warn: 1, error: 0 };
  if (typeof logOrders[logLevel] !== 'number') {
    this._log(this.LOG_LEVEL.ERROR, {
      interface: 'Log',
      log: 'Invalid log level provided. Provided log level: '
    }, logLevel);
    return;
  }
  if (logOrders[this._logLevel] >= logOrders[logLevel]) {
    var outputLog = 'SkylinkJS';
    if (typeof message === 'object') {
      outputLog += (message.target) ? ' [' + message.target + '] -' : ' -';
      outputLog += (message.interface) ? ' <<' + message.interface + '>>' : '';
      if (message.keys) {
        outputLog += ' ';
        if (typeof message.keys === 'object') {
          for (var i = 0; i < message.keys.length; i++) {
            outputLog += '(' + message.keys[i] + ')';
          }
        } else {
          outputLog += '(' + message.keys + ')';
        }
      }
      outputLog += ' ' + message.log;
    } else {
      outputLog += ' - ' + message;
    }
    // Fallback to log if failure
    logLevel = (typeof console[logLevel] === 'undefined') ? this.LOG_LEVEL.TRACE : logLevel;
    if (this._enableDebugMode) {
      if (typeof debugObject !== 'undefined') {
        console[logLevel](outputLog, debugObject, this._getStack());
      } else {
        console[logLevel](outputLog, this._getStack());
      }
    } else {
      if (typeof debugObject !== 'undefined') {
        console[logLevel](outputLog, debugObject);
      } else {
        console[logLevel](outputLog);
      }
    }
  }
};

/**
 * Stack class of Skylink.
 * @property SkylinkStack
 * @param {Array} stack The stack object.
 * @private
 * @since 0.5.2
 */
Skylink.prototype.SkylinkStack = function (stack) {
  this.stack = stack;
};

/**
 * Stacks all the caller functions.
 * @author codeovertones.com
 * @method _getStack
 * @return {Object} SkylinkStack object.
 * @private
 * @required
 * @since 0.5.2
 */
Skylink.prototype._getStack = function() {
  var e = new Error('SkylinkStack');
  var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
      .replace(/^\s+at\s+/gm, '')
      .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
      .split('\n');
  return new this.SkylinkStack(stack);
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
      this._logLevel = logLevel;
      this._log(this.LOG_LEVEL.TRACE, {
        interface: 'Log',
        keys: level,
        log: 'Log level exists. Level is set'
      });
      return;
    }
  }
  this._log(this.LOG_LEVEL.ERROR, {
    interface: 'Log',
    keys: level,
    log: 'Log level does not exist. Level is not set'
  });
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
  this._enableDebugMode = isDebugMode;
  };