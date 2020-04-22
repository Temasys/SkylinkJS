import Skylink from '../../../../index'; import helpers from '../../index';

/**
 * React Native only callback to retrieve senders from the peer connection as the sender object is not returned from peerConnection.addTrack.
 * @param peerConnection
 * @param targetMid
 * @param currentRoomState
 * @param event
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
const onsenderadded = (peerConnection, targetMid, currentRoomState, event) => {
  const updatedState = Skylink.getSkylinkState(currentRoomState.room.id);
  const { sender } = event;
  helpers.processNewSender(updatedState, targetMid, sender);
};

export default onsenderadded;
