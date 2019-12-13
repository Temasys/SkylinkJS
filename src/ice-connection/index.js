import helpers from './helpers/index';

/**
 * @classdesc Class representing an IceConnection. Helper methods are listed inside <code>{@link IceConnectionHelpers}</code>.
 * @private
 * @class
 */
class IceConnection {
  /**
   * @description Function that filters and configures the ICE servers received from Signaling
   * based on the <code>init()</code> configuration and returns the updated list of ICE servers to be used when constructing Peer connection.
   * @param {RTCIceServer[]} iceServers - The list of IceServers passed | {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer}
   * @return {filteredIceServers}
   */
  static setIceServers(iceServers) {
    return helpers.setIceServers(iceServers);
  }

  /**
   * @description Function that adds all the Peer connection buffered ICE candidates received.
   * This should be called only after the remote session description is received and set.
   * @param {string} targetMid - The mid of the target peer
   * @param {SkylinkRoom} room - Current Room
   */
  static addIceCandidateFromQueue(targetMid, room) {
    return helpers.addIceCandidateFromQueue(targetMid, room);
  }

  /**
   * Function that adds the ICE candidate to Peer connection.
   * @param {string} targetMid - The mid of the target peer
   * @param {string} candidateId - The id of the ICE Candidate
   * @param {string} candidateType - Type of the ICE Candidate
   * @param {RTCIceCandidate} nativeCandidate - An RTCIceCandidate Object | {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate}
   * @param {SkylinkState} roomState - Skylink State
   * @fires candidateProcessingState
   */
  static addIceCandidate(targetMid, candidateId, candidateType, nativeCandidate, roomState) {
    return helpers.addIceCandidate(targetMid, candidateId, candidateType, nativeCandidate, roomState);
  }

  /**
   *
   * @param targetMid - The mid of the target peer
   * @param {RTCPeerConnectionIceEvent} rtcIceConnectionEvent - {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnectionIceEvent}
   * @param {SkylinkRoom} room - Current room
   * @fires candidateGenerationState
   * @return {null}
   */
  static onIceCandidate(targetMid, rtcIceConnectionEvent, room) {
    return helpers.onIceCandidate(targetMid, rtcIceConnectionEvent, room);
  }
}

export default IceConnection;
