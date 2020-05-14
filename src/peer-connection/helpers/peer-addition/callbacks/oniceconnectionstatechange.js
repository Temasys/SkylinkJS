import HandleIceConnectionStats from '../../../../skylink-stats/handleIceConnectionStats';
import logger from '../../../../logger';
import messages from '../../../../messages';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { iceConnectionState } from '../../../../skylink-events';
import * as constants from '../../../../constants';
import Skylink from '../../../../index';
import PeerConnection from '../../../index';
import HandleBandwidthStats from '../../../../skylink-stats/handleBandwidthStats';
import BandwidthAdjuster from '../../bandwidthAdjuster';

const isIceConnectionStateCompleted = (pcIceConnectionState) => {
  const { ICE_CONNECTION_STATE } = constants;
  return [ICE_CONNECTION_STATE.COMPLETED,
    ICE_CONNECTION_STATE.CONNECTED].indexOf(pcIceConnectionState) > -1;
};

/**
 * @param {RTCPeerConnection} peerConnection
 * @param {String} targetMid - The Peer Id
 * @param {SkylinkState} currentRoomState
 * @fires iceConnectionState
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
const oniceconnectionstatechange = (peerConnection, targetMid, currentRoomState) => {
  const { PEER_CONNECTION } = messages;
  const { ICE_CONNECTION_STATE, PEER_CONNECTION_STATE, BROWSER_AGENT } = constants;
  const { AdapterJS } = window;
  const { webrtcDetectedBrowser, webrtcDetectedType } = AdapterJS;
  const state = Skylink.getSkylinkState(currentRoomState.room.id);
  let statsInterval = null;
  let pcIceConnectionState = peerConnection.iceConnectionState;

  if (webrtcDetectedType === BROWSER_AGENT.REACT_NATIVE && !state && pcIceConnectionState === ICE_CONNECTION_STATE.CLOSED) {
    return;
  }

  const { streams } = state;

  if (!state) {
    logger.log.DEBUG([targetMid, 'RTCIceConnectionState', null, PEER_CONNECTION.no_room_state]);
    return;
  }

  const {
    hasMCU, bandwidthAdjuster, peerInformations, peerConnStatus, peerStats,
  } = state;
  const handleIceConnectionStats = new HandleIceConnectionStats();


  logger.log.DEBUG([targetMid, 'RTCIceConnectionState', null, PEER_CONNECTION.ice_connection_state], pcIceConnectionState);

  if (webrtcDetectedBrowser === 'edge') {
    if (pcIceConnectionState === 'connecting') {
      pcIceConnectionState = ICE_CONNECTION_STATE.CHECKING;
    } else if (pcIceConnectionState === 'new') {
      pcIceConnectionState = ICE_CONNECTION_STATE.FAILED;
    }
  }

  if (webrtcDetectedType === 'AppleWebKit' && pcIceConnectionState === ICE_CONNECTION_STATE.CLOSED) {
    setTimeout(() => {
      if (!peerConnection.iceConnectionStateClosed) {
        handleIceConnectionStats.send(currentRoomState.room.id, ICE_CONNECTION_STATE.CLOSED, targetMid);
        dispatchEvent(iceConnectionState({
          state: ICE_CONNECTION_STATE.CLOSED,
          peerId: targetMid,
        }));
      }
    }, 10);
    return;
  }

  if (state && peerConnection.iceConnectionState !== ICE_CONNECTION_STATE.CONNECTED) {
    handleIceConnectionStats.send(currentRoomState.room.id, peerConnection.iceConnectionState, targetMid);
  }

  dispatchEvent(iceConnectionState({
    state: pcIceConnectionState,
    peerId: targetMid,
  }));

  if (pcIceConnectionState === ICE_CONNECTION_STATE.FAILED) {
    if (AdapterJS.webrtcDetectedBrowser === BROWSER_AGENT.FIREFOX && !streams.userMedia) { // no audio and video requested will throw ice trickle
      // failure although ice candidates are exchanged
      return;
    }
    dispatchEvent(iceConnectionState({
      state: ICE_CONNECTION_STATE.TRICKLE_FAILED,
      peerId: targetMid,
    }));
  }

  if (peerConnStatus && peerConnStatus[targetMid]) {
    peerConnStatus[targetMid].connected = isIceConnectionStateCompleted(pcIceConnectionState);
  }

  if (!statsInterval && isIceConnectionStateCompleted(pcIceConnectionState) && !peerStats[targetMid]) {
    statsInterval = true;
    peerStats[targetMid] = {};

    logger.log.DEBUG([targetMid, 'RTCStatsReport', null, 'Retrieving first report to tabulate results']);

    // Do an initial getConnectionStatus() to backfill the first retrieval in order to do (currentTotalStats - lastTotalStats).
    PeerConnection.getConnectionStatus(state, targetMid).then(() => {
      handleIceConnectionStats.send(currentRoomState.room.id, peerConnection.iceConnectionState, targetMid);
      statsInterval = setInterval(() => {
        if (peerConnection.signalingState === PEER_CONNECTION_STATE.CLOSED || peerConnection.iceConnectionState === PEER_CONNECTION_STATE.CLOSED) {
          clearInterval(statsInterval);
        } else {
          new HandleBandwidthStats().send(state.room.id, peerConnection, targetMid);
        }
      }, 20000);
    });
  }

  if (!hasMCU && isIceConnectionStateCompleted(pcIceConnectionState) && !!bandwidthAdjuster && AdapterJS.webrtcDetectedBrowser !== 'edge'
        && (((peerInformations[targetMid] || {}).agent || {}).name || 'edge') !== 'edge') {
    new BandwidthAdjuster({
      targetMid,
      state,
      peerConnection,
    }).setAdjustmentInterval();
  }
};

export default oniceconnectionstatechange;
