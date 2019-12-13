import Skylink from '../../index';

// requires the mid to be set after setOffer both local or remote
const retrieveTransceiverMid = (room, track) => {
  const roomState = Skylink.getSkylinkState(room.id);
  const { peerConnections } = roomState;
  const RTCPeerConnections = Object.values(peerConnections);
  let transceiverMid = null;

  for (let p = 0; p < RTCPeerConnections.length; p += 1) {
    const transceivers = RTCPeerConnections[p].getTransceivers();
    for (let t = 0; t < transceivers.length; t += 1) {
      if (transceivers[t].sender.track && transceivers[t].sender.track.id === track.id) {
        transceiverMid = transceivers[t].mid;
        break;
      }
    }
  }
  return transceiverMid;
};

export default retrieveTransceiverMid;
