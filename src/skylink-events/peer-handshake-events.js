import { HANDSHAKE_PROGRESS, INTRODUCE_STATE_CHANGE } from './constants';
import SkylinkEvent from '../utils/skylinkEvent';

/**
 * @description Event triggered when a Peer connection establishment state has changed.
 * @event SkylinkEvents.HANDSHAKE_PROGRESS
 * @param {Object} detail - Event's payload.
 * @param {SkylinkConstants.HANDSHAKE_PROGRESS} detail.state The current Peer connection establishment state.
 * @param {String} detail.peerId The Peer ID.
 * @param {SkylinkRoom} detail.room The room.
 * @param {Error|String} [detail.error] The error object.
 *   Defined only when <code>state</code> is <code>ERROR</code>.
 */
export const handshakeProgress = (detail = {}) => new SkylinkEvent(HANDSHAKE_PROGRESS, { detail });

/**
 * @description Event triggered when {@link Skylink#introducePeer}
 * introduction request state changes.
 * @event SkylinkEvents.INTRODUCE_STATE_CHANGE
 * @param {Object} detail - Event's payload.
 * @param {SkylinkConstants.INTRODUCE_STATE} detail.state The current <code>introducePeer()</code> introduction request state.
 * @param {String} detail.privilegedPeerId The User's privileged Peer ID.
 * @param {String} detail.sendingPeerId The Peer ID to be connected with <code>receivingPeerId</code>.
 * @param {String} detail.receivingPeerId The Peer ID to be connected with <code>sendingPeerId</code>.
 * @param {String} [detail.reason] The error object.
 *   Defined only when <code>state</code> payload is <code>ERROR</code>.
 * @ignore
 */
export const introduceStateChange = (detail = {}) => new SkylinkEvent(INTRODUCE_STATE_CHANGE, { detail });
