import Skylink from '../../../index';
import PeerMedia from '../../../peer-media';

const updateMediaInfoMediaState = (room, stream) => {
  const state = Skylink.getSkylinkState(room.id);
  const { user } = state;
  const streamId = stream.id;
  const mediaId = PeerMedia.retrieveMediaId(stream.getTracks()[0].kind, streamId);
  PeerMedia.setMediaStateToUnavailable(room, user.sid, mediaId);
};

export default updateMediaInfoMediaState;
