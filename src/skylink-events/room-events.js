import {
  ROOM_LOCK,
  BYE,
  ROOM_REJOIN,
} from './constants';

import SkylinkEvent from '../utils/skylinkEvent';

/**
 * @event SkylinkEvents.ROOM_LOCK
 * @description Event triggered when Room locked status has changed.
 * @param {Object} detail - Event's payload
 * @param {Boolean} detail.isLocked The flag if Room is locked.
 * @param {String} detail.peerId The Peer ID.
 * @param {peerInfo} detail.peerInfo The Peer session information. Object signature matches the <code>peerInfo</code> parameter payload received in the <code> {@link SkylinkEvents.event:PEER_JOINED|PEER JOINED}</code> event.
 * @param {Boolean} detail.isSelf The flag if User changed the Room locked status.
 * @param {roomInfo} detail.room The room.
 *
 */
export const roomLock = (detail = {}) => new SkylinkEvent(ROOM_LOCK, { detail });

/**
 * @event SkylinkEvents.ROOM_REJOIN
 * @description Event triggered when <code>joinRoom</code> can be re-initiated. This event is preceded by <code>leaveRoom</code> initiated by the
 * SDK in response to peer connection changing to <code>FAILED</code> state.
 * @param {Object} detail - Event's payload
 * @param {roomInfo} detail.room - The previous room
 * @param {String} detail.peerId - The previous peer id
 * @return {SkylinkEvent}
 */
export const roomRejoin = (detail = {}) => new SkylinkEvent(ROOM_REJOIN, { detail });

/**
 * @event SkylinkEvents.BYE
 * @description Event triggered when a user leaves a room.
 * @param {Object} detail - Event's payload.
 * @param {String} detail.rid - The User's Room session Peer ID
 * @param {peerInfo} detail.mid - The User's id
 * @private
 */
export const bye = (detail = {}) => new SkylinkEvent(BYE, { detail });
