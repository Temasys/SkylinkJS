import { loggedOnConsole } from '../skylink-events';
import { dispatchEvent } from '../utils/skylinkEventManager';
import SkylinkLogger from './index';

const logMethods = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
];

const LEVEL_STORAGE_KEY = 'loglevel:skylinkjs';

const checkSupport = (methodName) => {
  let hasSupport = true;
  if (typeof console === 'undefined') {
    hasSupport = false;
  } else if (typeof console[methodName] === 'undefined') { // eslint-disable-line no-console
    hasSupport = false;
  }
  return hasSupport;
};

const getFormattedMessage = (message) => {
  let log = 'SkylinkJS -';
  if (Array.isArray(message)) {
    // fragment1 - peerId
    // fragment2 - tag
    // fragment3 - additional info / state
    const [fragment1, fragment2, fragment3, messageString] = message;
    log += fragment1 ? ` [${fragment1}]` : ' -';
    // eslint-disable-next-line no-nested-ternary
    log += fragment2 ? ` <<${fragment2}>>` : (fragment1 ? '' : ' <<Method>>');
    if (fragment3) {
      if (Array.isArray(fragment3)) {
        for (let i = 0; i < fragment3.length; i += 1) {
          log += ` (${fragment3[i]})`;
        }
      } else {
        log += ` (${fragment3})`;
      }
    }
    log += ` ${messageString}`;
  } else {
    log += ` ${message}`;
  }
  return log;
};

export const logFn = (logger, level, message, debugObject = null) => {
  const datetime = `[${(new Date()).toISOString()}]`;
  const currentLevel = logger.level;
  const { logLevels } = logger;
  if (currentLevel <= level && currentLevel !== logLevels.SILENT) {
    const methodName = logMethods[level];
    const hasSupport = checkSupport(methodName);

    if (!hasSupport) {
      return;
    }

    const formattedMessage = getFormattedMessage(message);
    if (checkSupport(methodName)) {
      console[methodName](datetime, formattedMessage, debugObject || ''); // eslint-disable-line no-console
      dispatchEvent(loggedOnConsole({ level: methodName, message: formattedMessage, debugObject }));
    }

    if (SkylinkLogger.storeLogs) {
      const logItems = [datetime, methodName.toUpperCase(), formattedMessage];
      if (debugObject) {
        logItems.push(debugObject);
      }
      SkylinkLogger.storedLogs.push(logItems);
    }
  }
};

export const persistLogLevel = (level) => {
  try {
    window.localStorage.setItem(LEVEL_STORAGE_KEY, level);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ENVIRONMENT] window.localStorage is unavailable. Defaulting to log level: Error');
  }
};

export const getPersistedLevel = (logLevels) => {
  try {
    const level = window.localStorage.getItem(LEVEL_STORAGE_KEY);
    return level !== null && !Number.isNaN(+level) ? +level : logLevels.ERROR;
  } catch (err) {
    return logLevels.ERROR;
  }
};
