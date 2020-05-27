import Skylink from '../../../../index';
import { SIG_MESSAGE_TYPE, SM_PROTOCOL_VERSION, DT_PROTOCOL_VERSION } from '../../../../constants';
import PeerData from '../../../../peer-data/index';

const getWelcomeMessage = (currentRoom, targetMid) => {
  // FIXME: Welcome and Enter are exactly same but for targetMid which is extra in welcomeMsg. @Ishan to merge code for Welcome and Enter
  const state = Skylink.getSkylinkState(currentRoom.id);
  const initOptions = Skylink.getInitOptions();
  const {
    user, peerPriorityWeight, enableIceRestart, room,
  } = state;
  const { enableDataChannel } = initOptions;
  const { AdapterJS } = window;
  const userInfo = PeerData.getUserInfo(room);

  return {
    type: SIG_MESSAGE_TYPE.WELCOME,
    mid: user.sid,
    rid: room.id,
    agent: AdapterJS.webrtcDetectedBrowser,
    version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
    os: window.navigator.platform,
    userInfo,
    receiveOnly: PeerData.getCurrentSessionInfo(room).config.receiveOnly,
    weight: peerPriorityWeight,
    temasysPluginVersion: null,
    enableDataChannel,
    enableIceRestart,
    SMProtocolVersion: SM_PROTOCOL_VERSION,
    DTProtocolVersion: DT_PROTOCOL_VERSION,
    target: targetMid,
  };
};

export default getWelcomeMessage;
