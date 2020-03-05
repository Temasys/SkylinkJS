import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { onIncomingStream, peerUpdated, streamEnded } from '../../../../skylink-events';
import PeerData from '../../../../peer-data';
import { getStateByKey, hasVideoTrack } from '../../../../utils/helpers';
import { TRACK_KIND, TAGS } from '../../../../constants';
import logger from '../../../../logger';
import MESSAGES from '../../../../messages';
import Skylink from '../../../../index';

const dispatchPeerUpdated = (state, peerId) => {
  dispatchEvent(peerUpdated({
    peerId,
    peerInfo: PeerData.getPeerInfo(peerId, state.room),
    isSelf: false,
  }));
};

const updateMediaStatus = (state, peerId, streamId) => {
  const updatedState = state;

  delete updatedState.peerInformations[peerId].mediaStatus[streamId];

  Skylink.setSkylinkState(updatedState, updatedState.room.id);
};

const dispatchStreamEndedEvent = (state, peerId, isScreensharing, rtcTrackEvent) => {
  dispatchEvent(streamEnded({
    room: state.room,
    peerId,
    peerInfo: PeerData.getPeerInfo(peerId, state.room),
    isSelf: false,
    isScreensharing,
    streamId: rtcTrackEvent.track.id,
    isVideo: rtcTrackEvent.track.kind === TRACK_KIND.VIDEO,
    isAudio: rtcTrackEvent.track.kind === TRACK_KIND.AUDIO,
  }));
};

const dispatchIncomingCameraStream = (state) => {
  const { streams, room, user } = state;
  const userMediaStreams = streams.userMedia ? Object.values(streams.userMedia) : [];
  userMediaStreams.forEach((streamObj) => {
    if (hasVideoTrack(streamObj.stream)) {
      dispatchEvent(onIncomingStream({
        stream: streamObj.stream,
        streamId: streamObj.id,
        peerId: user.sid,
        room,
        isSelf: true,
        peerInfo: PeerData.getCurrentSessionInfo(room),
        isVideo: true,
        isAudio: false,
      }));
    }
  });
};

/**
 * @param {String} peerId
 * @param {String} room
 * @param {boolean} isScreensharing
 * @param {MediaStreamTrackEvent} rtcTrackEvent
 * @fires streamEnded
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
const onremovetrack = (peerId, room, isScreensharing, rtcTrackEvent) => {
  const state = getStateByKey(room.id);
  const { peerInformations } = state;
  const { MEDIA_STREAM, PEER_INFORMATIONS } = MESSAGES;
  const stream = rtcTrackEvent.target;


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

  updateMediaStatus(state, peerId, stream.id);
  dispatchStreamEndedEvent(state, peerId, isScreensharing, rtcTrackEvent);

  if (isScreensharing) {
    // Dispatch to ensure that the client has a way of retrieving the camera stream. Camera stream was not added to pc and therefore ontrack will not trigger on remote.
    dispatchIncomingCameraStream(state);
  }

  dispatchPeerUpdated(state, peerId);
};

export default onremovetrack;
