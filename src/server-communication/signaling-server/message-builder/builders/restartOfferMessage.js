import Skylink from '../../../../index';
import { SIG_MESSAGE_TYPE, SM_PROTOCOL_VERSION, DT_PROTOCOL_VERSION } from '../../../../constants';
import PeerData from '../../../../peer-data/index';

const restartOfferMessage = (roomKey, peerId, doIceRestart) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { AdapterJS } = window;
  const initOptions = Skylink.getInitOptions();
  const {
    user, room, enableIceRestart, peerInformations, peerPriorityWeight,
  } = state;

  return {
    type: SIG_MESSAGE_TYPE.RESTART,
    mid: user.sid,
    rid: room.id,
    agent: AdapterJS.webrtcDetectedBrowser,
    version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
    os: window.navigator.platform,
    userInfo: PeerData.getUserInfo(room),
    target: peerId,
    weight: peerPriorityWeight,
    receiveOnly: PeerData.getCurrentSessionInfo(room).config.receiveOnly,
    publishOnly: PeerData.getCurrentSessionInfo(room).config.publishOnly,
    enableDataChannel: initOptions.enableDataChannel,
    enableIceRestart,
    doIceRestart: doIceRestart === true && enableIceRestart && peerInformations[peerId]
      && peerInformations[peerId].config.enableIceRestart,
    isRestartResend: false,
    temasysPluginVersion: null,
    SMProtocolVersion: SM_PROTOCOL_VERSION,
    DTProtocolVersion: DT_PROTOCOL_VERSION,
  };
};

export default restartOfferMessage;
