import Skylink from '../../index';

const closePeerConnection = (roomState, peerId) => {
  const updatedState = Skylink.getSkylinkState(roomState.room.id);
  const { peerConnections, room } = updatedState;
  const { AdapterJS } = window;

  peerConnections[peerId].close();

  // FIXME: Check if needed. Polyfill for safari 11 "closed" event not triggered for "iceConnectionState" and "signalingState".
  if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
    if (!updatedState.peerConnections[peerId].signalingStateClosed) {
      updatedState.peerConnections[peerId].signalingStateClosed = true;
      // trigger('peerConnectionState', this.PEER_CONNECTION_STATE.CLOSED, peerId);
    }
    if (!updatedState.peerConnections[peerId].iceConnectionStateClosed) {
      updatedState.peerConnections[peerId].iceConnectionStateClosed = true;
      // handleIceConnectionStats(ICE_CONNECTION_STATE.CLOSED, peerId);
      // trigger('iceConnectionState', this.ICE_CONNECTION_STATE.CLOSED, peerId);
    }
  }

  Skylink.setSkylinkState(updatedState, room.id);
};

export default closePeerConnection;
