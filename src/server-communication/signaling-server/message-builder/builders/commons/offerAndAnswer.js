import Skylink from '../../../../../index';
import PeerData from '../../../../../peer-data/index';
import logger from '../../../../../logger';
import { HANDSHAKE_PROGRESS } from '../../../../../constants';
import PeerMedia from '../../../../../peer-media/index';

const getCommonMessage = (resolve, targetMid, roomState, sessionDescription, restartOfferMsg) => {
  // TODO: Full implementation to be done from _setLocalAndSendMessage under peer-handshake.js
  const state = Skylink.getSkylinkState(roomState.room.id);
  const {
    peerConnections, bufferedLocalOffer, peerPriorityWeight, room,
  } = state;
  const peerConnection = peerConnections[targetMid];
  const sd = {
    type: sessionDescription.type,
    sdp: sessionDescription.sdp,
  };

  peerConnection.processingLocalSDP = true;

  logger.log.INFO([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local session description updated ->'], sd.sdp);

  if (sessionDescription.type === HANDSHAKE_PROGRESS.OFFER) {
    logger.log.INFO([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local offer saved.']);
    bufferedLocalOffer[targetMid] = sessionDescription;

    const offer = {
      type: sd.type,
      sdp: sd.sdp,
      mid: state.user.sid,
      target: targetMid,
      rid: roomState.room.id,
      userInfo: PeerData.getUserInfo(roomState.room),
      weight: peerPriorityWeight,
      mediaInfoList: PeerMedia.retrieveMediaInfoForOfferAnswer(room, sd),
    };

    // Merging Restart and Offer messages. The already present keys in offer message will not be overwritten.
    // Only new keys from restartOfferMsg are added.
    if (restartOfferMsg && Object.keys(restartOfferMsg).length) {
      const keys = Object.keys(restartOfferMsg);
      const currentMessageKeys = Object.keys(offer);
      for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
        const key = keys[keyIndex];
        if (currentMessageKeys.indexOf(key) === -1) {
          offer[key] = restartOfferMsg[key];
        }
      }
    }

    resolve(offer);
  } else {
    const answer = {
      type: sd.type,
      sdp: sd.sdp,
      mid: state.user.sid,
      target: targetMid,
      rid: roomState.room.id,
      userInfo: PeerData.getUserInfo(roomState.room),
      mediaInfoList: PeerMedia.retrieveMediaInfoForOfferAnswer(room, sd),
    };

    resolve(answer);
  }
};

export default getCommonMessage;
