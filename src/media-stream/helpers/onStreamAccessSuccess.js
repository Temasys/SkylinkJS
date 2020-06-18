import helpers from './index';
import { hasAudioTrack, hasVideoTrack } from '../../utils/helpers';
import PeerMedia from '../../peer-media';
import PeerStream from '../../peer-stream';
import Skylink from '../../index';
import logger from '../../logger';
import { TAGS } from '../../constants';
import MESSAGES from '../../messages';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { mediaAccessSuccess } from '../../skylink-events';
import MediaStream from '../index';
import { ON_INCOMING_SCREEN_STREAM, ON_INCOMING_STREAM } from '../../skylink-events/constants';
import Room from '../../room';
import PeerData from '../../peer-data';

const onStreamAccessSuccess = (roomKey, ogStream, audioSettings, videoSettings, isAudioFallback, isScreensharing = false) => {
  const streams = isScreensharing ? [ogStream] : helpers.splitAudioAndVideoStream(ogStream);
  const state = Skylink.getSkylinkState(roomKey);
  const { room, user } = state;

  streams.forEach((stream) => {
    if (!stream) return;
    PeerStream.addStream(user.sid, stream, roomKey);
    MediaStream.buildStreamSettings(room, stream, hasAudioTrack(stream) ? audioSettings : videoSettings);
    helpers.updateStreamsMutedSettings(room.id, hasAudioTrack(stream) ? audioSettings : videoSettings, stream);
    helpers.updateStreamsMediaStatus(room.id, hasAudioTrack(stream) ? audioSettings : videoSettings, stream);
    PeerMedia.processPeerMedia(room, user.sid, stream, isScreensharing);

    if (isAudioFallback) {
      logger.log.DEBUG([user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.FALLBACK_SUCCESS]);
    }

    if (isScreensharing) {
      logger.log.DEBUG([user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.START_SCREEN_SUCCESS]);
      PeerStream.dispatchStreamEvent(ON_INCOMING_SCREEN_STREAM, {
        stream,
        peerId: user.sid,
        room: Room.getRoomInfo(room.id),
        isSelf: true,
        peerInfo: PeerData.getCurrentSessionInfo(room),
        streamId: stream.id,
        isVideo: stream.getVideoTracks().length > 0,
        isAudio: stream.getAudioTracks().length > 0,
      });
    } else if (user.sid) {
      // used.sid is null before inRoom message from sig
      PeerStream.dispatchStreamEvent(ON_INCOMING_STREAM, {
        stream,
        peerId: user.sid,
        room: Room.getRoomInfo(room.id),
        isSelf: true,
        peerInfo: PeerData.getCurrentSessionInfo(room),
        streamId: stream.id,
        isVideo: stream.getVideoTracks().length > 0,
        isAudio: stream.getAudioTracks().length > 0,
      });
    }

    dispatchEvent(mediaAccessSuccess({
      stream,
      isScreensharing,
      isAudioFallback,
      streamId: stream.id,
      isAudio: hasAudioTrack(stream),
      isVideo: hasVideoTrack(stream),
    }));
  });

  return streams;
};

export default onStreamAccessSuccess;
