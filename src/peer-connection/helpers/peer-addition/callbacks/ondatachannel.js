import logger from '../../../../logger';
import Skylink from '../../../../index';
import PeerConnection from '../../index';

/* eslint-disable no-param-reassign */
/**
 * @param {RTCPeerConnection} peerConnection
 * @param {String} targetMid
 * @param {SkylinkState} currentRoomState
 * @param {Event} event
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
const ondatachannel = (peerConnection, targetMid, currentRoomState, event) => {
  const dataChannel = event.channel || event;
  const initOptions = Skylink.getInitOptions();
  const state = Skylink.getSkylinkState(currentRoomState.room.id);
  const { peerInformations } = state;
  const { enableDataChannel } = initOptions;

  logger.log.DEBUG([targetMid, 'RTCDataChannel', dataChannel.label, 'Received datachannel ->'], dataChannel);
  if (enableDataChannel && peerInformations[targetMid].config.enableDataChannel) {
    // if peer does not have main channel, the first item is main
    if (!peerConnection.hasMainChannel) {
      peerConnection.hasMainChannel = true;
    }
    PeerConnection.createDataChannel({ peerId: targetMid, dataChannel, roomState: currentRoomState });
  } else {
    logger.log.WARN([targetMid, 'RTCDataChannel', dataChannel.label, 'Not adding datachannel as enable datachannel is set to false']);
  }
};

export default ondatachannel;
