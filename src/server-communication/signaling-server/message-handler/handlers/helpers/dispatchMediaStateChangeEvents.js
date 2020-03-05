import PeerData from '../../../../../peer-data';
import { dispatchEvent } from '../../../../../utils/skylinkEventManager';
import { peerUpdated, streamMuted } from '../../../../../skylink-events';

const dispatchMediaStateChangeEvents = (state, streamId, peerId) => {
  const peerInfo = PeerData.getPeerInfo(peerId, state.room);

  dispatchEvent(streamMuted({
    isSelf: false,
    peerId,
    peerInfo,
    streamId,
  }));

  dispatchEvent(peerUpdated({
    isSelf: false,
    peerId,
    peerInfo,
  }));
};

export default dispatchMediaStateChangeEvents;
