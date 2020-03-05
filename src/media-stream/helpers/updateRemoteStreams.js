import Skylink from '../../index';

const updateRemoteStreams = (room, peerId, stream) => {
  const updatedState = Skylink.getSkylinkState(room.id);

  updatedState.remoteStreams[peerId] = updatedState.remoteStreams[peerId] || {};
  updatedState.remoteStreams[peerId][stream.id] = stream;

  Skylink.setSkylinkState(updatedState, room.id);
};

export default updateRemoteStreams;
