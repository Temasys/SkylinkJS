import {
  ROOM_LOCK,
  BYE,
} from './constants';

import SkylinkEvent from '../utils/skylinkEvent';

/**
 * @event SkylinkEvents.roomLock
 * @description Event triggered when Room locked status has changed.
 * @param {Object} detail - Event's payload
 * @param {Boolean} detail.isLocked The flag if Room is locked.
 * @param {String} detail.peerId The Peer ID.
 * @param {peerInfo} detail.peerInfo The Peer session information. Object signature matches the <code>peerInfo</code> parameter payload received in the <code>peerJoined</code> event.
 * @param {Boolean} detail.isSelf The flag if User changed the Room locked status.
 */
export const roomLock = (detail = {}) => new SkylinkEvent(ROOM_LOCK, { detail });

/*
 * @event SkylinkEvents.bye
 * @description Event triggered when a user leaves a room.
 * @param {Object} detail - Event's payload.
 * @param {String} detail.rid - The User's Room session Peer ID
 * @param {peerInfo} detail.mid - The User's id
 */
export const bye = (detail = {}) => new SkylinkEvent(BYE, { detail });
