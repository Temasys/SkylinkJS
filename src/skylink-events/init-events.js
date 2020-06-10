/* eslint-disable import/prefer-default-export */
import { READY_STATE_CHANGE } from './constants';

import SkylinkEvent from '../utils/skylinkEvent';

/**
 * @event SkylinkEvents.READY_STATE_CHANGE
 * @description Event triggered when <code>init()</code> method ready state changes.
 * @param {Object} detail - Event's payload.
 * @param {SkylinkConstants.READY_STATE_CHANGE} detail.readyState - The current ready state when instantiating <code>new Skylink()</code>.
 * @param {JSON} detail.error - The error result. Defined only when <code>state</code> is <code>ERROR</code>.
 * @param {Number} detail.error.status - The HTTP status code when failed.
 * @param {SkylinkConstants.READY_STATE_CHANGE_ERROR} detail.error.errorCode - The ready state change failure code.
 * @param {Error} detail.error.content - The error object.
 * @param {String} detail.room - The Room to The Room to retrieve session token for.
 */
export const readyStateChange = (detail = {}) => new SkylinkEvent(READY_STATE_CHANGE, { detail });
