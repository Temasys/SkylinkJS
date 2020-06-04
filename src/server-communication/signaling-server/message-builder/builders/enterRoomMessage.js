import Skylink from '../../../../index';
import {
  SIG_MESSAGE_TYPE, SM_PROTOCOL_VERSION, DT_PROTOCOL_VERSION, PEER_TYPE,
} from '../../../../constants';
import PeerData from '../../../../peer-data/index';

export const getEnterRoomMessage = (roomState) => {
  // FIXME: Welcome and Enter are exactly same but for targetMid which is extra in welcomeMsg. @Ishan to merge code for Welcome and Enter
  const { room } = roomState;
  const state = Skylink.getSkylinkState(room.id);
  const initOptions = Skylink.getInitOptions();
  const {
    user, peerPriorityWeight, enableIceRestart, hasMCU,
  } = state;
  const { enableDataChannel } = initOptions;
  const { AdapterJS, navigator } = window;
  const userInfo = PeerData.getUserInfo(room);
  const enterMsg = {
    type: SIG_MESSAGE_TYPE.ENTER,
    mid: user.sid,
    rid: room.id,
    agent: AdapterJS.webrtcDetectedBrowser,
    version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
    os: navigator.platform,
    userInfo,
    weight: peerPriorityWeight,
    temasysPluginVersion: null,
    enableDataChannel,
    enableIceRestart,
    SMProtocolVersion: SM_PROTOCOL_VERSION,
    DTProtocolVersion: DT_PROTOCOL_VERSION,
  };

  if (hasMCU) {
    enterMsg.target = PEER_TYPE.MCU;
    enterMsg.publisherId = user.sid;
  }

  return enterMsg;
};

export default getEnterRoomMessage;
