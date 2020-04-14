import PeerData from '../../../../../peer-data';
import { dispatchEvent } from '../../../../../utils/skylinkEventManager';
import { peerUpdated, streamMuted } from '../../../../../skylink-events';
import { TRACK_KIND } from '../../../../../constants';

const dispatchMediaStateChangeEvents = (state, streamId, peerId, kind, isScreensharing) => {
  const peerInfo = PeerData.getPeerInfo(peerId, state.room);

  dispatchEvent(streamMuted({
    isSelf: false,
    peerId,
    peerInfo,
    streamId,
    isAudio: kind === TRACK_KIND.AUDIO,
    isVideo: kind === TRACK_KIND.VIDEO,
    isScreensharing,
  }));

  dispatchEvent(peerUpdated({
    isSelf: false,
    peerId,
    peerInfo,
  }));
};

export default dispatchMediaStateChangeEvents;
