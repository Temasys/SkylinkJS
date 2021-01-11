import Skylink from '../index';
import { SkylinkSignalingServer } from '../server-communication/index';
import { dispatchEvent } from '../utils/skylinkEventManager';
import { roomLock } from '../skylink-events';
import PeerData from '../peer-data';
import Room from './index';

/**
 * @description Method that locks or unlocks a room.
 * @param {SkylinkState} roomState - The room state.
 * @param {boolean} lockRoom - The flag if the room should be locked or unlocked.
 * @private
 */
export const lockOrUnlockRoom = (roomState, lockRoom = true) => {
  const updatedState = roomState;
  const { room, user } = updatedState;
  const signalingServer = new SkylinkSignalingServer();

  updatedState.room.isLocked = lockRoom;
  Skylink.setSkylinkState(updatedState, room.id);

  signalingServer.roomLock(updatedState);

  dispatchEvent(roomLock({
    isLocked: updatedState.room.isLocked,
    peerInfo: PeerData.getCurrentSessionInfo(room),
    peerId: user.sid,
    isSelf: true,
    room: Room.getRoomInfo(room.id),
  }));
};

/**
 * @description Method that locks a room.
 * @param {SkylinkState} roomState - The room state.
 * @private
 */
export const lockRoom = roomState => lockOrUnlockRoom(roomState, true);

/**
 * @description Method that unlocls a room.
 * @param {SkylinkState} roomState - The room state.
 * @private
 */
export const unlockRoom = roomState => lockOrUnlockRoom(roomState, false);
