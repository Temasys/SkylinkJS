/* eslint-disable */
import {
  CHANNEL_OPEN,
  CHANNEL_REOPEN,
  CHANNEL_CLOSE,
  CHANNEL_ERROR,
  CHANNEL_MESSAGE,
  CHANNEL_RETRY,
  SOCKET_ERROR,
  SYSTEM_ACTION,
} from './constants';

import SkylinkEvent from '../utils/skylinkEvent'

/**
 * @event SkylinkEvents.CHANNEL_OPEN
 * @description Event triggered when socket connection to Signaling server has opened.
 * @param {Object} detail - Event's payload.
 * @param {socketSession} detail.session The socket connection session information.
 * @param {string} detail.peerId The Peer ID.
 */
export const channelOpen = detail => new SkylinkEvent(CHANNEL_OPEN, { detail });

// Ref: ESS-2024
/**
 * @event SkylinkEvents.CHANNEL_REOPEN
 * @description [DEPRECATED] Event triggered when socket connection to Signaling server has re-opened.
 *  <blockquote class="info">
 *   This event has been replaced with {@link SkylinkEvents.event:SESSION_DISCONNECT|SESSION_DISCONNECT}. Implementation of reconnecting back to a
 *   room remains the same.</blockquote>
 * @param {Object} detail - Event's payload.
 * @param {socketSession} detail.session The socket connection session information.
 */
export const channelReopen = detail => new SkylinkEvent(CHANNEL_REOPEN, { detail });

/**
 * @description Event triggered when socket connection to Signaling server has closed.
 * @event SkylinkEvents.CHANNEL_CLOSE
 * @param {Object} detail - Event's payload.
 * @param {socketSession} detail.session The socket connection session information.
 * @param {string} detail.peerId The Peer ID.
 */
export const channelClose = detail => new SkylinkEvent(CHANNEL_CLOSE, { detail });

/**
 * @description This may be caused by Javascript errors in the event listener when subscribing to events.<br>
 * It may be resolved by checking for code errors in your Web App in the event subscribing listener.<br>
 * Event triggered when socket connection encountered exception.
 * @event SkylinkEvents.CHANNEL_ERROR
 * @param {Object} detail - Event's payload.
 * @param {Error|String} detail.error The error object.
 * @param {socketSession} detail.session The socket connection session information.
 * @param {string} detail.peerId The Peer ID.
 */
export const channelError = detail => new SkylinkEvent(CHANNEL_ERROR, { detail });

/**
 * @description Note that this is used only for SDK developer purposes.
 * Event triggered when receiving socket message from the Signaling server.
 * @event SkylinkEvents.CHANNEL_MESSAGE
 * @param {Object} detail - Event's payload.
 * @param {Object} detail.message The socket message object.
 * @param {socketSession} detail.session The socket connection session information.
 */
export const channelMessage = detail => new SkylinkEvent(CHANNEL_MESSAGE, { detail });

// Ref: ESS-2024
/**
 * @description Event triggered when attempting to establish socket connection to Signaling server when failed.
 * @event SkylinkEvents.CHANNEL_RETRY
 * @param {Object} detail - Event's payload.
 * @param {SkylinkConstants.SOCKET_FALLBACK} detail.fallbackType The current fallback state.
 * @param {Number} detail.currentAttempt The current socket reconnection attempt.
 * @param {socketSession} detail.session The socket connection session information.
 */
export const channelRetry = detail => new SkylinkEvent(CHANNEL_RETRY, { detail });

/**
 * @description Event triggered when attempt to establish socket connection to Signaling server has failed.
 * @event SkylinkEvents.SOCKET_ERROR
 * @param {Object} detail - Event's payload.
 * @param {SkylinkConstants.SOCKET_ERROR} detail.errorCode The socket connection error code.
 * @param {Error|String|Number} detail.error The error object.
 * @param {SkylinkConstants.SOCKET_FALLBACK} detail.type The fallback state of the socket connection attempt.
 * @param {socketSession} detail.session The socket connection session information.
 */
export const socketError = detail => new SkylinkEvent(SOCKET_ERROR, { detail });

/**
 * @description Event triggered when Signaling server reaction state has changed.
 * @event SkylinkEvents.SYSTEM_ACTION
 * @param {Object} detail - Event's payload.
 * @param {SkylinkConstants.SYSTEM_ACTION} detail.action The current Signaling server reaction state.
 * @param {String} detail.message The message.
 * @param {SkylinkConstants.SYSTEM_ACTION_REASON} detail.reason The Signaling server reaction state reason of action code.
 */
export const systemAction = detail => new SkylinkEvent(SYSTEM_ACTION, { detail });
