/* eslint-disable import/prefer-default-export */
import {
  LOGGED_ON_CONSOLE,
} from './constants';

import SkylinkEvent from '../utils/skylinkEvent';

/**
 * @event SkylinkEvents.loggedOnConsole
 * @description Event triggered when Skylink logs to browser's console.
 * @param {Object} detail - Event's payload.
 * @param {JSON} detail.level - The log level.
 * @param {String} detail.message - The log message.
 * @param {JSON} detail.debugObject - A JavaScript object to be logged to help with analysis.
 */
export const loggedOnConsole = (detail = {}) => new SkylinkEvent(LOGGED_ON_CONSOLE, { detail });
