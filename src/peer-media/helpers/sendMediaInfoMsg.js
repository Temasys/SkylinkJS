import SkylinkSignalingServer from '../../server-communication/signaling-server/index';
import Skylink from '../../index';
import { PEER_TYPE } from '../../constants';

const sendMediaInfoMsg = (room, updatedMediaInfo) => {
  const signaling = new SkylinkSignalingServer();
  const state = Skylink.getSkylinkState(room.id);
  const { peerMedias, user, hasMCU } = state;
  const peerIds = hasMCU ? [PEER_TYPE.MCU] : Object.keys(peerMedias).filter(peerId => peerId !== user.sid);

  peerIds.forEach((target) => {
    signaling.mediaInfoEvent(state, target, updatedMediaInfo);
  });
};

export default sendMediaInfoMsg;
