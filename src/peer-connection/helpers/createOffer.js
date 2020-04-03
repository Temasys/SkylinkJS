import Skylink from '../../index';
import logger from '../../logger';
import PeerConnection from '../index';
import MediaStream from '../../media-stream/index';
import SessionDescription from '../../session-description';
import { HANDSHAKE_PROGRESS, PEER_TYPE } from '../../constants';
import getCommonOfferAnswerMessage from '../../server-communication/signaling-server/message-builder/builders/commons/offerAndAnswer';
import handleNegotiationStats from '../../skylink-stats/handleNegotiationStats';
import MESSAGES from '../../messages';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { handshakeProgress } from '../../skylink-events';

const { STATS_MODULE: { HANDLE_NEGOTIATION_STATS } } = MESSAGES;

const onOfferCreated = (resolve, targetMid, roomState, restartOfferMsg, offer) => {
  const { room } = roomState;

  logger.log.DEBUG([targetMid, null, null, 'Created offer'], offer);
  handleNegotiationStats.send(room.id, HANDLE_NEGOTIATION_STATS.OFFER.create, targetMid, offer, false);

  getCommonOfferAnswerMessage(resolve, targetMid, roomState, offer, restartOfferMsg);
};

const onOfferFailed = (reject, targetMid, roomState, error) => {
  const { room } = roomState;

  logger.log.ERROR([targetMid, null, null, 'Failed creating an offer:'], error);
  handleNegotiationStats.send(room.id, HANDLE_NEGOTIATION_STATS.OFFER.create_error, targetMid, null, false, error);
  dispatchEvent(handshakeProgress({
    state: HANDSHAKE_PROGRESS.ERROR,
    peerId: targetMid,
    error,
    room: roomState.room,
  }));
  reject(error);
};

/**
 * @param {SkylinkRoom} currentRoom
 * @param {String} targetMid
 * @param {Boolean} iceRestart
 * @param {object} restartOfferMsg
 * @return {*}
 * @memberOf PeerConnection.PeerConnectionHelpers
 * @fires handshakeProgress
 */
const createOffer = (currentRoom, targetMid, iceRestart = false, restartOfferMsg) => {
  const state = Skylink.getSkylinkState(currentRoom.id);
  const initOptions = Skylink.getInitOptions();
  const { enableDataChannel } = initOptions;
  const {
    peerConnections,
    // sdpSettings,
    hasMCU,
    enableIceRestart,
    peerInformations,
    voiceActivityDetection,
    peerConnStatus,
    dataChannels,
  } = state;
  const { AdapterJS } = window;
  const peerConnection = peerConnections[targetMid];

  const offerConstraints = {
    offerToReceiveAudio: !(!state.sdpSettings.connection.audio && targetMid !== PEER_TYPE.MCU) && SessionDescription.getSDPCommonSupports(targetMid, null, currentRoom.id).video,
    offerToReceiveVideo: !(!state.sdpSettings.connection.video && targetMid !== PEER_TYPE.MCU) && SessionDescription.getSDPCommonSupports(targetMid, null, currentRoom.id).audio,
    iceRestart: !!((peerInformations[targetMid] || {}).config || {}).enableIceRestart && iceRestart && enableIceRestart,
    voiceActivityDetection,
  };

  if (hasMCU && typeof peerConnection.addTransceiver !== 'function') {
    offerConstraints.offerToReceiveVideo = true;
  }

  // Add stream only at offer/answer end
  if (!hasMCU || targetMid === PEER_TYPE.MCU) {
    MediaStream.addLocalMediaStreams(targetMid, state);
  }

  if (enableDataChannel && peerInformations[targetMid].config.enableDataChannel) {
    if (!(dataChannels[targetMid] && dataChannels[targetMid].main)) {
      PeerConnection.createDataChannel({
        peerId: targetMid,
        roomState: state,
        createAsMessagingChannel: true,
      });
      state.peerConnections[targetMid].hasMainChannel = true;
    }
  }

  logger.log.DEBUG([targetMid, null, null, 'Creating offer with config:'], offerConstraints);

  peerConnection.endOfCandidates = false;
  peerConnection.negotiating = true;

  if (peerConnStatus[targetMid]) {
    state.peerConnStatus[targetMid].sdpConstraints = offerConstraints;
  }

  Skylink.setSkylinkState(state, currentRoom.id);

  return new Promise((resolve, reject) => {
    peerConnection.createOffer(AdapterJS.webrtcDetectedType === 'plugin' ? {
      mandatory: {
        OfferToReceiveAudio: offerConstraints.offerToReceiveAudio,
        OfferToReceiveVideo: offerConstraints.offerToReceiveVideo,
        iceRestart: offerConstraints.iceRestart,
        voiceActivityDetection: offerConstraints.voiceActivityDetection,
      },
    } : offerConstraints)
      .then(offer => onOfferCreated(resolve, targetMid, state, restartOfferMsg, offer))
      .catch(error => onOfferFailed(reject, targetMid, state, error));
  });
};

export default createOffer;
