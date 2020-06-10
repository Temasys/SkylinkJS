import { logFn, persistLogLevel, getPersistedLevel } from './log-helpers';
import MESSAGES from '../messages';
import { isANumber } from '../utils/helpers';

/**
 * @classdesc Class used for logging messages on the console. Exports a singleton logger object.
 * @class SkylinkLogger
 * @public
 * @example
 * import { SkylinkLogger } from 'skylinkjs';
 *
 * const skylinkLogger = new SkylinkLogger();
 */
class SkylinkLogger {
  constructor() {
    /**
     * @description List of log levels.
     * @type {Object} logLevels
     * @property {number} TRACE - All logs.
     * @property {number} DEBUG
     * @property {number} INFO
     * @property {number} WARN
     * @property {number} ERROR
     * @property {number} SILENT - No logs.
     */
    this.logLevels = {
      TRACE: 0, // All Logs
      DEBUG: 1,
      INFO: 2,
      WARN: 3,
      ERROR: 4, // Ideal level for Production Env.
      SILENT: 5, // No logging
    };

    this.level = getPersistedLevel(this.logLevels);

    /**
     * @description The flag that enables the store logs function.
     * @type {boolean}
     */
    this.storeLogs = false;

    /**
     * @description The stored logs when storeLogs flag is set to true.
     * @type {Array.<logItems>} The array of stored logs
     */
    this.storedLogs = [];
  }

  /**
   * @description Method that sets the log level.
   * @param {number} level - The log level to be set. REF: {@link SkylinkLogger#logLevels|logLevels}
   * @param {Boolean} storeLogs - The flag if logs should be stored.
   * @public
   * @example
   * skylinkLogger.setLogLevels(skylinkLogger.logLevels.TRACE);
   * @alias SkylinkLogger#setLevel
   */
  setLevel(level = this.levels.ERROR, storeLogs) {
    if (isANumber(level)) {
      this.level = level;
      persistLogLevel(this.level);
    } else {
      this.level = this.levels.ERROR;
    }

    if (storeLogs) {
      this.storeLogs = storeLogs;
    }
  }

  /**
   * @description Enables logging with highest level (TRACE).
   * @public
   * @alias SkylinkLogger#enableAll
   */
  enableAll() {
    this.setLevel(this.logLevels.TRACE);
  }

  /**
   * @description Disables all logging with lowest level (SILENT).
   * @public
   * @alias SkylinkLogger#disableAll
   */
  disableAll() {
    this.setLevel(this.logLevels.SILENT);
  }

  getLogs() {
    if (this.storeLogs) {
      return this.storedLogs;
    }

    this.log.WARN(MESSAGES.LOGGER.LOGS_NOT_STORED);
    return null;
  }

  clearLogs() {
    this.log.INFO(MESSAGES.LOGGER.LOGS_CLEARED);
    this.storedLogs = [];
  }
}

/**
 * @type {SkylinkLogger}
 * @private
 */
const logger = new SkylinkLogger();

/**
 * @description Method to trigger a log
 * @type {{TRACE: SkylinkLogger.log.TRACE, DEBUG: SkylinkLogger.log.DEBUG, INFO: SkylinkLogger.log.INFO, WARN: SkylinkLogger.log.WARN, ERROR: SkylinkLogger.log.ERROR}}
 * @private
 */
SkylinkLogger.prototype.log = {
  TRACE: (...params) => {
    logFn(logger, logger.logLevels.TRACE, ...params);
  },
  DEBUG: (...params) => {
    logFn(logger, logger.logLevels.DEBUG, ...params);
  },
  INFO: (...params) => {
    logFn(logger, logger.logLevels.INFO, ...params);
  },
  WARN: (...params) => {
    logFn(logger, logger.logLevels.WARN, ...params);
  },
  ERROR: (...params) => {
    logFn(logger, logger.logLevels.ERROR, ...params);
  },
};

export default logger;
