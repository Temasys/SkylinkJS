/* eslint-disable no-unused-vars */
import Skylink from '../../../../../index';
import PeerData from '../../../../../peer-data/index';
import SessionDescription from '../../../../../session-description';
import logger from '../../../../../logger';
import handleNegotiationStats from '../../../../../skylink-stats/handleNegotiationStats';
import messages from '../../../../../messages';
import { HANDSHAKE_PROGRESS } from '../../../../../constants';
import PeerMedia from '../../../../../peer-media/index';
import { handshakeProgress } from '../../../../../skylink-events';
import { dispatchEvent } from '../../../../../utils/skylinkEventManager';
import PeerConnection from '../../../../../peer-connection/index';

const getCommonMessage = (resolve, targetMid, roomState, sessionDescription, restartOfferMsg) => {
  // TODO: Full implementation to be done from _setLocalAndSendMessage under peer-handshake.js
  const state = Skylink.getSkylinkState(roomState.room.id);
  // const initOptions = Skylink.getInitOptions();
  const {
    peerConnections, peerConnectionConfig, bufferedLocalOffer, peerPriorityWeight, room,
  } = state;
  const { STATS_MODULE: { HANDLE_NEGOTIATION_STATS } } = messages;
  const { AdapterJS } = window;
  const peerConnection = peerConnections[targetMid];
  const sd = {
    type: sessionDescription.type,
    sdp: sessionDescription.sdp,
  };

  peerConnection.processingLocalSDP = true;

  // sd.sdp = SessionDescription.removeSDPFirefoxH264Pref(targetMid, sd, roomState.room.id);
  // sd.sdp = SessionDescription.setSDPCodecParams(targetMid, sd, roomState.room.id);
  // sd.sdp = SessionDescription.removeSDPUnknownAptRtx(targetMid, sd, roomState.room.id);
  // sd.sdp = SessionDescription.removeSDPCodecs(targetMid, sd, roomState.room.id);
  // sd.sdp = SessionDescription.handleSDPConnectionSettings(targetMid, sd, roomState.room.id, 'local');
  // sd.sdp = SessionDescription.removeSDPREMBPackets(targetMid, sd, roomState.room.id);

  if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
    SessionDescription.setOriginalDTLSRole(state, sd, false);
    sd.sdp = SessionDescription.modifyDTLSRole(state, sessionDescription);
  }

  if (peerConnectionConfig.disableBundle) {
    sd.sdp = sd.sdp.replace(/a=group:BUNDLE.*\r\n/gi, '');
  }

  logger.log.INFO([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local session description updated ->'], sd.sdp);

  if (sessionDescription.type === HANDSHAKE_PROGRESS.OFFER) {
    handleNegotiationStats.send(room.id, HANDLE_NEGOTIATION_STATS.OFFER.offer, targetMid, sessionDescription, false);

    logger.log.INFO([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local offer saved.']);
    bufferedLocalOffer[targetMid] = sessionDescription;

    const offer = {
      type: sd.type,
      sdp: sd.sdp, // SessionDescription.renderSDPOutput(targetMid, sd, roomState.room.id),
      mid: state.user.sid,
      target: targetMid,
      rid: roomState.room.id,
      userInfo: PeerData.getUserInfo(roomState.room),
      weight: peerPriorityWeight,
      mediaInfoList: PeerMedia.retrieveMediaInfoForOfferAnswer(room, sd),
    };

    // Merging Restart and Offer messages. The already present keys in offer message will not be overwritten.
    // Only news keys from restartOfferMsg are added.
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
    handleNegotiationStats.send(room.id, HANDLE_NEGOTIATION_STATS.ANSWER.answer, targetMid, sessionDescription, false);

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
