import Skylink from '../../index';
import logger from '../../logger';
import PeerConnection from '../index';
import MediaStream from '../../media-stream/index';
import { HANDSHAKE_PROGRESS, PEER_TYPE } from '../../constants';
import getCommonOfferAnswerMessage from '../../server-communication/signaling-server/message-builder/builders/commons/offerAndAnswer';
import handleNegotiationStats from '../../skylink-stats/handleNegotiationStats';
import MESSAGES from '../../messages';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { handshakeProgress } from '../../skylink-events';
import Room from '../../room';

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
    room: Room.getRoomInfo(roomState.room.id),
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
 * @fires HANDSHAKE_PROGRESS
 */
const createOffer = (currentRoom, targetMid, iceRestart = false, restartOfferMsg) => {
  const state = Skylink.getSkylinkState(currentRoom.id);
  const initOptions = Skylink.getInitOptions();
  const { enableDataChannel } = initOptions;
  const {
    peerConnections,
    hasMCU,
    enableIceRestart,
    peerInformations,
    voiceActivityDetection,
    dataChannels,
  } = state;
  const peerConnection = peerConnections[targetMid];

  const offerConstraints = {
    iceRestart: !!((peerInformations[targetMid] || {}).config || {}).enableIceRestart && iceRestart && enableIceRestart,
    voiceActivityDetection,
  };

  if (hasMCU && typeof peerConnection.addTransceiver !== 'function') {
    offerConstraints.offerToReceiveVideo = true;
  }

  // Add stream only at offer/answer end
  if (!hasMCU || targetMid === PEER_TYPE.MCU) {
    MediaStream.addLocalMediaStreams(targetMid, state, true);
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
  peerConnection.sdpConstraints = offerConstraints;

  Skylink.setSkylinkState(state, currentRoom.id);

  return new Promise((resolve, reject) => {
    peerConnection.createOffer(offerConstraints)
      .then(offer => onOfferCreated(resolve, targetMid, state, restartOfferMsg, offer))
      .catch(error => onOfferFailed(reject, targetMid, state, error));
  });
};

export default createOffer;
