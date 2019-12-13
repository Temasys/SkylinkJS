import { isEmptyObj } from '../../utils/helpers';
import MediaStream from '../../media-stream';

const hasPeerConnections = (peerConnections, hasMCU) => (hasMCU ? !!peerConnections.MCU.maps : !isEmptyObj(peerConnections));

const getSelfStreams = (streams) => {
  if (streams.userMedia) {
    return streams.userMedia;
  }
  return null;
};

const getSelfScreen = (streams) => {
  if (streams.screenshare) {
    return streams.screenshare;
  }
  return null;
};

/**
 * @description Function that gets the list of connected Peers Streams in the Room.
 * @param {SkylinkState} roomState
 * @param {boolean} [includeSelf=true] - The flag if self streams are included.
 * @return {Object}
 * @memberof PeerDataHelpers
 */
const getPeersStream = (roomState, includeSelf = true) => {
  const listOfPeersStreams = {};
  const {
    peerConnections,
    user,
    streams,
    hasMCU,
  } = roomState;

  if (user && user.sid && includeSelf) {
    const selfStreams = getSelfStreams(streams);
    const selfScreen = getSelfScreen(streams);
    listOfPeersStreams[user.sid] = selfStreams || selfScreen ? {} : null;

    if (selfStreams) {
      Object.keys(selfStreams).forEach((streamId) => {
        listOfPeersStreams[user.sid].isSelf = true;
        listOfPeersStreams[user.sid][streamId] = selfStreams[streamId].stream;
      });
    }

    if (selfScreen) {
      listOfPeersStreams[user.sid].isSelf = true;
      listOfPeersStreams[user.sid][selfScreen.id] = selfScreen;
    }
  }

  if (hasPeerConnections(peerConnections, hasMCU)) {
    const listOfPeers = hasMCU ? Object.keys(peerConnections.MCU.maps) : Object.keys(peerConnections);
    for (let i = 0; i < listOfPeers.length; i += 1) {
      listOfPeersStreams[listOfPeers[i]] = {};
      const remoteStreams = MediaStream.retrieveRemoteStreams(roomState, listOfPeers[i]);
      remoteStreams.forEach((stream) => {
        listOfPeersStreams[listOfPeers[i]][stream.id] = stream;
      });
    }
  }

  return isEmptyObj(listOfPeersStreams) ? null : listOfPeersStreams;
};

export default getPeersStream;
