import { mediaAccessStopped, peerUpdated, streamEnded } from '../../../skylink-events';
import Skylink from '../../../index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { hasVideoTrack, hasAudioTrack } from '../../../utils/helpers';
import logger from '../../../logger';
import MESSAGES from '../../../messages';
import PeerData from '../../../peer-data/index';
import helpers from '../../../peer-data/helpers';

/**
 * Function that handles the <code>RTCPeerConnection.removeTracks(sender)</code> on the local MediaStream.
 * @param {SkylinkRoom} room
 * @param {MediaStream} stream - The stream.
 * @param {boolean} isScreensharing
 * @memberOf MediaStreamHelpers
 * @fires streamEnded
 */
const dispatchOnLocalStreamEnded = (room, stream, isScreensharing = false) => {
  const state = Skylink.getSkylinkState(room.id);
  const { MEDIA_STREAM } = MESSAGES;
  const { user } = state;
  const isSelf = true;

  logger.log.INFO(MEDIA_STREAM.STOP_SETTINGS, {
    peerId: user.sid, isSelf, isScreensharing, stream,
  });

  dispatchEvent(streamEnded({
    room,
    peerId: user.sid,
    peerInfo: PeerData.getCurrentSessionInfo(room),
    isSelf,
    isScreensharing,
    streamId: stream.id,
    isVideo: hasVideoTrack(stream),
    isAudio: hasAudioTrack(stream),
  }));

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

export default dispatchOnLocalStreamEnded;
