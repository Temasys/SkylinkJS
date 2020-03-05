import {
  CANDIDATE_PROCESSING_STATE,
  CANDIDATE_GENERATION_STATE,
  CANDIDATES_GATHERED,
  ICE_CONNECTION_STATE,
} from './constants';

import SkylinkEvent from '../utils/skylinkEvent';

/**
 * @event SkylinkEvents.candidateProcessingState
 * @description Event triggered when remote ICE candidate processing state has changed when Peer is using trickle ICE.
 * @param {Object} detail - Event's payload.
 * @param {SkylinkRoom} detail.room - The current room
 * @param {String} detail.peerId - The peer's id
 * @param {SkylinkConstants.CANDIDATE_PROCESSING_STATE} detail.state - The ICE candidate processing state.
 * @param {String} detail.candidateId - The remote ICE candidate session ID.
 * @param {String} detail.candidateType - The remote ICE candidate type.
 * @param {Object} detail.candidate - The remote ICE candidate.
 * @param {String} detail.candidate.candidate - The remote ICE candidate connection description.
 * @param {String} detail.candidate.sdpMid- The remote ICE candidate identifier based on the remote session description.
 * @param {number} detail.candidate.sdpMLineIndex - The remote ICE candidate media description index (starting from 0) based on the remote session description.
 * @param {Error} detail.error - The error object.
 */
export const candidateProcessingState = detail => new SkylinkEvent(CANDIDATE_PROCESSING_STATE, { detail });

/**
 * @event SkylinkEvents.candidateGenerationState
 * @description Event triggered when a Peer connection ICE gathering state has changed.
 * @param {Object} detail - Event's payload.
 * @param {SkylinkRoom} detail.room - The current room
 * @param {String} detail.peerId - The peer's id
 * @param {SkylinkConstants.CANDIDATE_GENERATION_STATE} detail.state - The current Peer connection ICE gathering state.
 */
export const candidateGenerationState = detail => new SkylinkEvent(CANDIDATE_GENERATION_STATE, { detail });

/**
 * @event SkylinkEvents.candidatesGathered
 * @description Event triggered when all remote ICE candidates gathering has completed and been processed.
 * @param {Object} detail - Event's payload.
 * @param {SkylinkRoom} detail.room - The current room
 * @param {String} detail.peerId - The peer's id
 * @param {Object} detail.candidatesLength - The remote ICE candidates length.
 * @param {number} detail.candidatesLength.expected - The expected total number of remote ICE candidates to be received.
 * @param {number} detail.candidatesLength.received - The actual total number of remote ICE candidates received.
 * @param {number} detail.candidatesLength.processed - The total number of remote ICE candidates processed.
 */
export const candidatesGathered = detail => new SkylinkEvent(CANDIDATES_GATHERED, { detail });

/**
 * @description Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * Event triggered when a Peer connection ICE connection state has changed.
 * @event SkylinkEvent.iceConnectionState
 * @param {SkylinkEvents.ICE_CONNECTION_STATE} state The current Peer connection ICE connection state.
 * @param {String} peerId The Peer ID.
 */
export const iceConnectionState = detail => new SkylinkEvent(ICE_CONNECTION_STATE, { detail });
