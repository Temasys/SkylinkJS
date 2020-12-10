import Skylink from '../../index';
import { isEmptyArray, isEmptyObj } from '../../utils/helpers';
import helpers from '../../peer-connection/helpers/index';

const isSenderTrackAndTrackMatched = (senderTrack, tracks) => {
  for (let x = 0; x < tracks.length; x += 1) {
    if (senderTrack.id === tracks[x].id) {
      return true;
    }
  }

  return false;
};

const isStreamOnPC = (peerConnection, stream) => {
  const transceivers = peerConnection.getTransceivers ? peerConnection.getTransceivers() : [];
  const tracks = stream.getTracks();

  if (isEmptyArray(transceivers)) {
    return false;
  }

  for (let i = 0; i < transceivers.length; i += 1) {
    if (transceivers[i].sender.track && isSenderTrackAndTrackMatched(transceivers[i].sender.track, tracks)) {
      return true;
    }
  }

  return false;
};

const addTracksToPC = (state, peerId, stream, peerConnection) => {
  const updatedState = state;
  const tracks = stream.getTracks();
  for (let track = 0; track < tracks.length; track += 1) { // there should only be 1 track
    const sender = peerConnection.addTrack(tracks[track], stream);
    if (sender) {
      helpers.processNewSender(updatedState, peerId, sender);
    }
  }

  Skylink.setSkylinkState(updatedState, updatedState.room.id);
};

const addMediaStreams = (state, peerId, streams, peerConnection) => {
  const mediaStreams = Object.values(streams);
  for (let x = 0; x < mediaStreams.length; x += 1) {
    if (!isStreamOnPC(peerConnection, mediaStreams[x])) {
      addTracksToPC(state, peerId, mediaStreams[x], peerConnection);
    }
  }
};

/**
 * Function that sets User's Stream to send to Peer connection.
 * Priority for <code>shareScreen()</code> Stream over <code>{@link MediaStream.getUserMedia}</code> Stream.
 * @param {String} targetMid - The mid of the target peer
 * @param {SkylinkState} roomState - Skylink State of current room
 * @memberOf MediaStreamHelpers
 * @private
 */
const addLocalMediaStreams = (targetMid, roomState) => {
  // TODO: Full implementation (cross-browser) not done. Refer to stream-media.js for checks on AJS
  const state = Skylink.getSkylinkState(roomState.room.id);
  const {
    peerConnections, user, peerStreams,
  } = state;
  const peerConnection = peerConnections[targetMid];


  if (peerStreams[user.sid] && !isEmptyObj(peerStreams[user.sid])) {
    addMediaStreams(state, targetMid, peerStreams[user.sid], peerConnection);
  }
};

export default addLocalMediaStreams;
