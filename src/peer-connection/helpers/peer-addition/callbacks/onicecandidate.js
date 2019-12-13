import IceConnection from '../../../../ice-connection';

/**
 *
 * @param {RTCPeerConnection} peerConnection
 * @param {string} targetMid
 * @param {SkylinkState} roomState - The current state.
 * @param {Event} rtcIceConnectionEvent
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
const onicecandidate = (peerConnection, targetMid, roomState, rtcIceConnectionEvent) => {
  IceConnection.onIceCandidate(targetMid, rtcIceConnectionEvent.candidate || rtcIceConnectionEvent, roomState.room);
};

export default onicecandidate;
