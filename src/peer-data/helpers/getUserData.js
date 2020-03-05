/**
 * @description Function that returns the User / Peer current custom data.
 * @private
 * @param {Skylink} roomState
 * @param {String} peerId
 * @return {roomState.userData}
 * @memberOf PeerDataHelpers
 */
const getUserData = (roomState, peerId) => {
  if (peerId && roomState.peerInformations[peerId]) {
    let peerUserData = roomState.peerInformations[peerId].userData;

    if (!peerUserData) {
      peerUserData = '';
    }
    return peerUserData;
  }
  return roomState.userData;
};

export default getUserData;
