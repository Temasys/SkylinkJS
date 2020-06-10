import Skylink from '../../index';

const closePeerConnection = (roomState, peerId) => {
  const updatedState = Skylink.getSkylinkState(roomState.room.id);
  const { peerConnections, room } = updatedState;

  peerConnections[peerId].close();

  Skylink.setSkylinkState(updatedState, room.id);
};

export default closePeerConnection;
