import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { roomLock } from '../../../../skylink-events';
import PeerData from '../../../../peer-data';
import Skylink from '../../../../index';
import Room from '../../../../room';

const roomLockHandler = (message) => {
  const { rid, lock, mid } = message;
  const state = Skylink.getSkylinkState(rid);
  state.room.isLocked = lock;
  Skylink.setSkylinkState(state, state.room.id);

  dispatchEvent(roomLock({
    isLocked: lock,
    peerInfo: PeerData.getPeerInfo(mid, state.room),
    peerId: mid,
    isSelf: false,
    room: Room.getRoomInfo(rid),
  }));
};

export default roomLockHandler;
