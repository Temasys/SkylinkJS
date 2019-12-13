import { isEmptyArray } from '../../../utils/helpers';
import PeerConnection from '../../../peer-connection';
import Skylink from '../../../index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { peerUpdated } from '../../../skylink-events';
import PeerData from '../../../peer-data';
import PeerMedia from '../../../peer-media/index';

const dispatchPeerUpdatedEvent = (roomState) => {
  const { room, user } = roomState;

  dispatchEvent(peerUpdated({
    room,
    peerId: user.sid,
    isSelf: true,
    peerInfo: PeerData.getCurrentSessionInfo(room),
  }));
};

const initRefreshConnection = (room, fromLeaveRoom) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;

  if (!fromLeaveRoom) {
    if (!isEmptyArray(Object.keys(peerConnections))) {
      PeerConnection.refreshConnection(state);
    } else {
      dispatchPeerUpdatedEvent(state);
      PeerMedia.deleteUnavailableMedia(state.room, state.user.sid);
    }
  }
};

export default initRefreshConnection;
