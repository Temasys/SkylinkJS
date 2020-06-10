import HandleIceConnectionStats from '../../../../skylink-stats/handleIceConnectionStats';
import logger from '../../../../logger';
import messages from '../../../../messages';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { iceConnectionState, peerConnectionState } from '../../../../skylink-events';
import * as constants from '../../../../constants';
import Skylink from '../../../../index';
import PeerConnection from '../../../index';
import HandleBandwidthStats from '../../../../skylink-stats/handleBandwidthStats';
import BandwidthAdjuster from '../../bandwidthAdjuster';
import { isAgent, isEmptyObj } from '../../../../utils/helpers';

const isIceConnectionStateCompleted = (pcIceConnectionState) => {
  const { ICE_CONNECTION_STATE } = constants;
  return [ICE_CONNECTION_STATE.COMPLETED,
    ICE_CONNECTION_STATE.CONNECTED].indexOf(pcIceConnectionState) > -1;
};

/**
 * @param {RTCPeerConnection} peerConnection
 * @param {String} targetMid - The Peer Id
 * @param {SkylinkState} currentRoomState
 * @fires ICE_CONNECTION_STATE
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
const oniceconnectionstatechange = (peerConnection, targetMid, currentRoomState) => {
  const { ROOM_STATE, ICE_CONNECTION, PEER_CONNECTION } = messages;
  const { ICE_CONNECTION_STATE, PEER_CONNECTION_STATE, BROWSER_AGENT } = constants;
  const state = Skylink.getSkylinkState(currentRoomState.room.id);
  let statsInterval = null;
  const pcIceConnectionState = peerConnection.iceConnectionState;

  if (isAgent(BROWSER_AGENT.REACT_NATIVE) && !state && pcIceConnectionState === ICE_CONNECTION_STATE.CLOSED) {
    return;
  }

  const { streams } = state;

  if (!state) {
    logger.log.DEBUG([targetMid, 'RTCIceConnectionState', null, ROOM_STATE.NOT_FOUND]);
    return;
  }

  const {
    hasMCU, bandwidthAdjuster, peerStats, streamsBandwidthSettings,
  } = state;

  if (pcIceConnectionState === ICE_CONNECTION_STATE.FAILED) { // peer connection 'failed' state is dispatched in onconnectionstatechange
    if (isAgent(BROWSER_AGENT.FIREFOX) && !streams.userMedia) {
      // no audio and video requested will throw ice connection state failed although ice candidates are exchanged
      return;
    }
  }

  logger.log.DEBUG([targetMid, 'RTCIceConnectionState', null, ICE_CONNECTION.STATE_CHANGE], pcIceConnectionState);
  const handleIceConnectionStats = new HandleIceConnectionStats();
  handleIceConnectionStats.send(currentRoomState.room.id, peerConnection.iceConnectionState, targetMid);
  dispatchEvent(iceConnectionState({
    state: pcIceConnectionState,
    peerId: targetMid,
  }));

  if (!statsInterval && isIceConnectionStateCompleted(pcIceConnectionState) && !peerStats[targetMid]) {
    statsInterval = true;
    peerStats[targetMid] = {};

    logger.log.DEBUG([targetMid, 'RTCStatsReport', null, 'Retrieving first report to tabulate results']);

    // Do an initial getConnectionStatus() to backfill the first retrieval in order to do (currentTotalStats - lastTotalStats).
    PeerConnection.getConnectionStatus(state, targetMid).then(() => {
      statsInterval = setInterval(() => {
        const currentState = Skylink.getSkylinkState(state.room.id);
        if (!currentState.room.inRoom) {
          return;
        }
        if (peerConnection.connectionState === PEER_CONNECTION_STATE.CLOSED || peerConnection.iceConnectionState === ICE_CONNECTION_STATE.CLOSED) {
          if (peerConnection.connectionState === PEER_CONNECTION_STATE.CLOSED) { // polyfill for
            // Safari and FF peerConnection state 'closed' when ice failure
            logger.log.DEBUG([targetMid, 'RTCPeerConnectionState', null, PEER_CONNECTION.STATE_CHANGE], peerConnection.connectionState);
            dispatchEvent(peerConnectionState({
              state: PEER_CONNECTION_STATE.CLOSED,
              peerId: targetMid,
            }));
          }

          if (peerConnection.iceConnectionState === ICE_CONNECTION_STATE.CLOSED) {
            logger.log.DEBUG([targetMid, 'RTCIceConnectionState', null, ICE_CONNECTION.STATE_CHANGE], peerConnection.iceConnectionState);
            handleIceConnectionStats.send(currentRoomState.room.id, peerConnection.iceConnectionState, targetMid);
            dispatchEvent(iceConnectionState({
              state: ICE_CONNECTION_STATE.CLOSED,
              peerId: targetMid,
            }));
          }

          clearInterval(statsInterval);
        } else {
          new HandleBandwidthStats().send(state.room.id, peerConnection, targetMid);
        }
      }, 20000);
    });
  }

  if (!hasMCU && isIceConnectionStateCompleted(pcIceConnectionState) && !!bandwidthAdjuster && isEmptyObj(streamsBandwidthSettings.bAS)) {
    new BandwidthAdjuster({
      targetMid,
      state,
      peerConnection,
    }).setAdjustmentInterval();
  }
};

export default oniceconnectionstatechange;
