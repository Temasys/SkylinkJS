import helpers from '../../../media-stream/helpers';
import PeerData from '../../../peer-data';
import { TRACK_KIND } from '../../../constants';
import PeerMedia from '../../../peer-media';
import { DEFAULTS } from '../../../defaults';
import Room from '../../../room';
import PeerStream from '../../../peer-stream';
import { ON_INCOMING_SCREEN_STREAM } from '../../../skylink-events/constants';
import MediaStream from '../../../media-stream';

const onScreenStreamAccessSuccess = (state, stream) => {
  const { room, user } = state;
  const settings = helpers.parseStreamSettings(DEFAULTS.MEDIA_OPTIONS.SCREENSHARE);
  PeerStream.addStream(user.sid, stream, room.id);
  PeerMedia.processPeerMedia(room, user.sid, stream, true);
  MediaStream.buildStreamSettings(room, stream, settings);

  helpers.updateStreamsMutedSettings(room.id, settings, stream);
  helpers.updateStreamsMediaStatus(room.id, settings, stream);
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
};

const setScreenStateToUnavailable = (state, stream) => {
  const { user, room } = state;
  const mediaId = PeerMedia.retrieveMediaId(TRACK_KIND.VIDEO, stream.id);
  PeerMedia.setMediaStateToUnavailable(room, user.sid, mediaId);
};

export default {
  onScreenStreamAccessSuccess,
  setScreenStateToUnavailable,
};
