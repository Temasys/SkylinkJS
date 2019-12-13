import Skylink from '../../index';

const resetPeerMedia = (room, peerId) => {
  const updatedState = Skylink.getSkylinkState(room.id);
  const peerMedia = updatedState.peerMedias[peerId];

  if (peerMedia) {
    updatedState.peerMedias[peerId] = {};
  }

  return updatedState;
};

export default resetPeerMedia;
