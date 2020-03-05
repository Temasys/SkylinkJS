import helpers from '../../../media-stream/helpers';
import Skylink from '../../../index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { onIncomingScreenStream } from '../../../skylink-events';
import PeerData from '../../../peer-data';
import { TRACK_KIND } from '../../../constants';
import PeerMedia from '../../../peer-media';

const addScreenStreamToState = (state, stream) => {
  const { room, user } = state;
  const settings = helpers.parseStreamSettings({ video: true });
  const isScreensharing = true;
  const isAudioFallback = false;
  helpers.processStreamInState(stream, settings, room.id, isScreensharing, isAudioFallback);

  dispatchEvent(onIncomingScreenStream({
    stream,
    peerId: user.sid,
    room,
    isSelf: true,
    peerInfo: PeerData.getCurrentSessionInfo(room),
    streamId: stream.id,
    isVideo: stream.getVideoTracks().length > 0,
    isAudio: stream.getAudioTracks().length > 0,
  }));
};

const removeScreenStreamFromState = (state) => {
  const { room, streams } = state;
  streams.screenshare = null;
  Skylink.setSkylinkState(state, room.id);
};

const setScreenStateToUnavailable = (state, stream) => {
  const { user, room } = state;
  const mediaId = PeerMedia.retrieveMediaId(TRACK_KIND.VIDEO, stream.id);
  PeerMedia.setMediaStateToUnavailable(room, user.sid, mediaId);
};

export default {
  addScreenStreamToState,
  removeScreenStreamFromState,
  setScreenStateToUnavailable,
};
