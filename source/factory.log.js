/**
 * + Factory that handles the logging.
 */
function LogFactory (instanceLabel) {
  var logger = {
    header: 'SkylinkJS',
    level: Skylink.prototype.LOG_LEVEL.ERROR,
    trace: false,
    storeLogs: false,
    printTimeStamp: false,
    printInstanceLabel: false,
    instanceLabel: instanceLabel
  };

  /**
   * - Function that handles the log message.
   */
  var fn = function (prop, message, obj) {
    var output = '';
    var printOutput = '';
    var timestamp = (new Date());

    if (Array.isArray(message)) {
      output += message[0] ? ' [' + message[0] + '] -' : ' -';
      output += message[1] ? ' <<' + message[1] + '>>' : '';
      output += message[2] ? '(' + message[2] + ')' : '';
      output += ' ' + message[3];
    } else {
      output += ' - ' + message;
    }

    // Output for printing is different from the output stored in the logs array
    printOutput = (logger.printTimeStamp ? '[' + timestamp.toISOString() + '] ' : '') +
      logger.header + (logger.printInstanceLabel ? ' :: ' + logger.instanceLabel : '') + output;
    output = logger.header + output;

    // Store the log message
    if (logger.storeLogs) {
      LogStorageFactory.push(timestamp, prop, output, obj || null, logger.instanceLabel);
    }

    if (logger.level >= Skylink.prototype.LOG_LEVEL[prop.toUpperCase()]) {
      var useProp = typeof console[prop] === 'undefined' ? 'log' : prop;
      useProp = logger.trace && typeof console.trace !== 'undefined' ? 'trace' : useProp;

      console[useProp]((useProp === 'trace' ? '[' + prop.toUpperCase() + ']' : '') +
        printOutput, typeof obj !== 'undefined' ? obj : '');
    }
  };

  return {
    /**
     * + Function that sets the debugging options.
     */
    setDebugMode: function (trace, storeLogs, printInstanceLabel, printTimeStamp) {
      logger.trace = trace === true;
      logger.storeLogs = storeLogs === true;
      logger.printInstanceLabel = printInstanceLabel === true;
      logger.printTimeStamp = printTimeStamp === true;
    },

    /**
     * + Function that sets the log level.
     */
    setLogLevel: function (level) {
      var hasSet = false;

      if (typeof level === 'number') {
        UtilsFactory.forEach(Skylink.prototype.LOG_LEVEL, function (opt, prop) {
          if (opt === level) {
            logger.level = level;
            hasSet = true;
          }
        });
      }

      if (!hasSet) {
        return new Error('Log level does not exist. Level is not set.');
      }
    },

    /**
     * + Function that prints the console.debug() level.
     */
    debug: function (message, obj) {
      fn('debug', message, obj);
    },

    /**
     * + Function that prints the console.log() level.
     */
    log: function (message, obj) {
      fn('log', message, obj);
    },

    /**
     * + Function that prints the console.info() level.
     */
    info: function (message, obj) {
      fn('info', message, obj);
    },

    /**
     * + Function that prints the console.warn() level.
     */
    warn: function (message, obj) {
      fn('warn', message, obj);
    },

    /**
     * + Function that prints the console.error() level.
     */
    error: function (message, obj) {
      fn('error', message, obj);
    }
  };
}