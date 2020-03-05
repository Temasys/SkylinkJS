import Skylink from '../../../../index';
import MediaStream from '../../../../media-stream/index';
import callbacks from './index';
import logger from '../../../../logger/index';
import { TRACK_KIND } from '../../../../constants';
import PeerMedia from '../../../../peer-media';
import PeerConnection from '../../../index';

const matchPeerIdWithTransceiverMid = (state, transceiver) => {
  const { peerMedias, user } = state;
  const peerIds = Object.keys(peerMedias);

  for (let i = 0; i < peerIds.length; i += 1) {
    if (peerIds[i] !== user.sid) {
      const mediaInfos = Object.values(peerMedias[peerIds[i]]);
      for (let m = 0; m < mediaInfos.length; m += 1) {
        if (mediaInfos[m].transceiverMid === transceiver.mid) {
          return peerIds[i];
        }
      }
    }
  }

  return null;
};

/**
 * Function that handles the <code>RTCPeerConnection.addTrack</code> remote MediaTrack received.
 * @param {RTCPeerConnection} RTCPeerConnection
 * @param {String} targetMid
 * @param {SkylinkState} currentRoomState
 * @param {RTCTrackEvent} rtcTrackEvent
 * @returns {null}
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
const ontrack = (RTCPeerConnection, targetMid, currentRoomState, rtcTrackEvent) => {
  const state = Skylink.getSkylinkState(currentRoomState.room.id);
  const {
    peerConnections, room, hasMCU,
  } = state;
  const { receiver } = rtcTrackEvent;
  const { AdapterJS } = window;
  const stream = rtcTrackEvent.streams[0];

  // eslint-disable-next-line prefer-const
  let { transceiver, track } = rtcTrackEvent;
  let peerId = targetMid;

  if (AdapterJS.webrtcDetectedBrowser === 'safari') {
    const transceivers = peerConnections[targetMid].getTransceivers();
    transceivers.forEach((tscvr) => {
      if (tscvr.receiver.track.id === receiver.track.id) {
        transceiver = tscvr;
      }
    });
  }

  if (transceiver.mid === null) {
    logger.log.WARN('Transceiver mid is null', transceiver);
  }

  if (!peerConnections[peerId]) return null;

  if (hasMCU) {
    peerId = matchPeerIdWithTransceiverMid(state, transceiver);
  }

  const isScreensharing = PeerMedia.isVideoScreenTrack(state, peerId, transceiver.mid);
  const callbackExtraParams = [peerId, room, isScreensharing];
  stream.onremovetrack = callbacks.onremovetrack.bind(this, ...callbackExtraParams);
  PeerMedia.updateStreamIdFromOntrack(state.room, peerId, transceiver.mid, stream.id);
  PeerConnection.updatePeerInformationsMediaStatus(state.room, peerId, transceiver, stream);
  MediaStream.updateRemoteStreams(state.room, peerId, stream);
  MediaStream.onRemoteTrackAdded(stream, currentRoomState, peerId, isScreensharing, track.kind === TRACK_KIND.VIDEO, track.kind === TRACK_KIND.AUDIO);

  return null;
};

export default ontrack;
