import Skylink from '../../index';
import { hasAudioTrack, hasVideoTrack } from '../../utils/helpers';
import PeerMedia from '../../peer-media';

const buildPeerStreamList = (state, peerId, peerStreams) => {
  const peerStreamList = {};
  peerStreamList.streams = {
    video: null,
    audio: null,
    screenShare: null,
  };
  Object.keys(peerStreams[peerId]).forEach((streamId) => {
    if (hasAudioTrack(peerStreams[peerId][streamId])) {
      peerStreamList.streams.audio = peerStreamList.streams.audio || {};
      peerStreamList.streams.audio[streamId] = peerStreams[peerId][streamId];
    } else if (hasVideoTrack(peerStreams[peerId][streamId]) && PeerMedia.retrieveScreenMediaInfo(state.room, peerId, { streamId })) {
      peerStreamList.streams.screenShare = peerStreamList.streams.screenShare || {};
      peerStreamList.streams.screenShare[streamId] = peerStreams[peerId][streamId];
    } else {
      peerStreamList.streams.video = peerStreamList.streams.video || {};
      peerStreamList.streams.video[streamId] = peerStreams[peerId][streamId];
    }
  });
  return peerStreamList;
};

/**
 * @description Function that gets the list of connected Peers Streams in the Room.
 * @param {SkylinkState} roomState
 * @param {boolean} [includeSelf=true] - The flag if self streams are included.
 * @return {Object}
 * @memberOf PeerDataHelpers
 */
const getStreams = (roomState, includeSelf = true) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const { peerStreams, user } = state;
  const streamList = {};
  const peerIds = Object.keys(peerStreams);

  for (let i = 0; i < peerIds.length; i += 1) {
    const peerId = peerIds[i];
    if (includeSelf && peerId === user.sid) {
      streamList[peerId] = buildPeerStreamList(state, peerId, peerStreams);
      streamList[peerId].isSelf = true;
    } else if (peerId !== user.sid) {
      streamList[peerId] = buildPeerStreamList(state, peerId, peerStreams);
    }
  }

  return streamList;
};

export default getStreams;
