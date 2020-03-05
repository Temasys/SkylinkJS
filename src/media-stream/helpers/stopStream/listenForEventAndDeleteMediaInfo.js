import { EVENTS, HANDSHAKE_PROGRESS, TRACK_KIND } from '../../../constants';
import PeerMedia from '../../../peer-media';
import Skylink from '../../../index';
import { addEventListener, removeEventListener } from '../../../utils/skylinkEventManager';
import { hasAudioTrack } from '../../../utils/helpers';

const listenForEventAndDeleteMediaInfo = (room, stream) => {
  const state = Skylink.getSkylinkState(room.id);

  const executeOfferCallback = (evt) => {
    const s = stream;
    const { user } = state;
    const { detail } = evt;
    if (detail.state === HANDSHAKE_PROGRESS.OFFER) {
      const mediaId = PeerMedia.retrieveMediaId(hasAudioTrack(s) ? TRACK_KIND.AUDIO : TRACK_KIND.VIDEO, s.id);
      PeerMedia.deleteUnavailableMedia(room, user.sid, mediaId);
    }
  };

  const executeMediaDeletedCallback = () => {
    removeEventListener(EVENTS.HANDSHAKE_PROGRESS, executeOfferCallback);
    removeEventListener(EVENTS.MEDIA_INFO_DELETED, executeMediaDeletedCallback);
  };

  addEventListener(EVENTS.HANDSHAKE_PROGRESS, executeOfferCallback);
  addEventListener(EVENTS.MEDIA_INFO_DELETED, executeMediaDeletedCallback);
};

export default listenForEventAndDeleteMediaInfo;
