import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { peerUpdated } from '../../../../skylink-events';
import PeerData from '../../../../peer-data';
import { getStateByKey, isAgent } from '../../../../utils/helpers';
import { TRACK_KIND, TAGS, BROWSER_AGENT } from '../../../../constants';
import logger from '../../../../logger';
import MESSAGES from '../../../../messages';
import Skylink from '../../../../index';
import PeerStream from '../../../../peer-stream';
import { STREAM_ENDED } from '../../../../skylink-events/constants';

const dispatchPeerUpdated = (state, peerId) => {
  dispatchEvent(peerUpdated({
    peerId,
    peerInfo: PeerData.getPeerInfo(peerId, state.room),
    isSelf: false,
  }));
};

const updatePeerStreamsAndMediaStatus = (state, peerId, streamId) => {
  const updatedState = state;

  delete updatedState.peerInformations[peerId].mediaStatus[streamId];
  PeerStream.deleteStream(peerId, updatedState.room, streamId);

  Skylink.setSkylinkState(updatedState, updatedState.room.id);
};

const dispatchStreamEndedEvent = (state, peerId, isScreensharing, rtcTrackEvent, stream) => {
  PeerStream.dispatchStreamEvent(STREAM_ENDED, {
    room: state.room,
    peerId,
    peerInfo: PeerData.getPeerInfo(peerId, state.room),
    isSelf: false,
    isScreensharing,
    streamId: stream.id,
    isVideo: rtcTrackEvent.track.kind === TRACK_KIND.VIDEO,
    isAudio: rtcTrackEvent.track.kind === TRACK_KIND.AUDIO,
  });
};

/**
 * @param {String} peerId
 * @param {String} room
 * @param {boolean} isScreensharing
 * @param {MediaStreamTrackEvent} rtcTrackEvent
 * @fires STREAM_ENDED
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
const onremovetrack = (peerId, room, isScreensharing, rtcTrackEvent) => {
  const state = getStateByKey(room.id);
  const { peerInformations } = state;
  const { MEDIA_STREAM, PEER_INFORMATIONS } = MESSAGES;
  const stream = isAgent(BROWSER_AGENT.REACT_NATIVE) ? rtcTrackEvent.stream : rtcTrackEvent.target;


  logger.log.INFO([peerId, TAGS.MEDIA_STREAM, null, MEDIA_STREAM.REMOTE_TRACK_REMOVED], {
    peerId, isSelf: false, isScreensharing, track: rtcTrackEvent.track,
  });

  if (!peerInformations[peerId]) {
    // peerInformations[peerId] will be undefined if onremovetrack is called from byeHandler
    logger.log.DEBUG([peerId, TAGS.MEDIA_STREAM, null, `${MEDIA_STREAM.ERRORS.DROPPING_ONREMOVETRACK}` - `${PEER_INFORMATIONS.NO_PEER_INFO} ${peerId}`]);
    return;
  }

  if (!stream) {
    logger.log.DEBUG([peerId, TAGS.MEDIA_STREAM, null, `${MEDIA_STREAM.ERRORS.DROPPING_ONREMOVETRACK}` - `${MEDIA_STREAM.NO_STREAM}`]);
    return;
  }

  updatePeerStreamsAndMediaStatus(state, peerId, stream.id);
  dispatchStreamEndedEvent(state, peerId, isScreensharing, rtcTrackEvent, stream);
  dispatchPeerUpdated(state, peerId);
};

export default onremovetrack;
