import { mediaAccessStopped, peerUpdated } from '../../../skylink-events';
import Skylink from '../../../index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { hasVideoTrack, hasAudioTrack } from '../../../utils/helpers';
import logger from '../../../logger';
import MESSAGES from '../../../messages';
import PeerData from '../../../peer-data/index';
import helpers from '../../../peer-data/helpers';
import { TAGS } from '../../../constants';
import Room from '../../../room';
import PeerStream from '../../../peer-stream';
import { STREAM_ENDED } from '../../../skylink-events/constants';

/**
 * Function that handles the <code>RTCPeerConnection.removeTracks(sender)</code> on the local MediaStream.
 * @param {SkylinkRoom} room
 * @param {MediaStream} stream - The stream.
 * @param {boolean} isScreensharing
 * @memberOf MediaStreamHelpers
 * @fires STREAM_ENDED
 */
const dispatchEvents = (room, stream, isScreensharing = false) => {
  const state = Skylink.getSkylinkState(room.id);
  const { MEDIA_STREAM } = MESSAGES;
  const { user } = state;
  const isSelf = true;

  logger.log.INFO([user.sid, TAGS.MEDIA_STREAM, null, MEDIA_STREAM.STOP_SETTINGS], {
    peerId: user.sid, isSelf, isScreensharing, stream,
  });

  PeerStream.dispatchStreamEvent(STREAM_ENDED, {
    room: Room.getRoomInfo(room),
    peerId: user.sid,
    peerInfo: PeerData.getCurrentSessionInfo(room),
    isSelf,
    isScreensharing,
    streamId: stream.id,
    isVideo: hasVideoTrack(stream),
    isAudio: hasAudioTrack(stream),
  });

  dispatchEvent(mediaAccessStopped({
    isScreensharing,
    streamId: stream.id,
  }));

  dispatchEvent(peerUpdated({
    peerId: user.sid,
    peerInfo: helpers.getCurrentSessionInfo(room),
    isSelf: true,
  }));
};

export default dispatchEvents;
