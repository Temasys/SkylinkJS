import clone from 'clone';
import Skylink from '../../../index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { channelClose, sessionDisconnect } from '../../../skylink-events';
import logger from '../../../logger';
import PeerData from '../../../peer-data';

const handleSocketClose = (roomKey, reason) => {
  const state = Skylink.getSkylinkState(roomKey) || Object.values(Skylink.getSkylinkState())[0]; // to handle leaveAllRooms method

  const {
    socketSession, inRoom, room, user,
  } = state;

  logger.log.INFO([null, 'Socket', null, `Channel closed. Reason - ${reason}`]);

  state.channelOpen = false;
  Skylink.setSkylinkState(state, roomKey);

  dispatchEvent(channelClose({
    socketSession: clone(socketSession),
  }));

  if (inRoom && user && user.sid) {
    dispatchEvent(sessionDisconnect({
      peerId: user.sid,
      peerInfo: PeerData.getCurrentSessionInfo(room),
    }));
  }
};

export default handleSocketClose;
