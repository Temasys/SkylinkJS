import SkylinkSignalingServer from '../../server-communication/signaling-server/index';
import Skylink from '../../index';
import { PEER_TYPE } from '../../constants';

const sendMediaInfoMsg = (room, updatedMediaInfo) => {
  const signaling = new SkylinkSignalingServer();
  const state = Skylink.getSkylinkState(room.id);
  const { user, hasMCU, peerConnections } = state;
  const peerIds = hasMCU ? [PEER_TYPE.MCU] : Object.keys(peerConnections).filter(peerId => (peerId !== user.sid) && (peerId !== PEER_TYPE.MCU));

  peerIds.forEach((target) => {
    signaling.mediaInfoEvent(state, target, updatedMediaInfo);
  });
};

export default sendMediaInfoMsg;
