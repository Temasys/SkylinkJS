import { isEmptyArray } from '../../../utils/helpers';
import PeerConnection from '../../../peer-connection';
import Skylink from '../../../index';
import { addEventListener, dispatchEvent } from '../../../utils/skylinkEventManager';
import { peerUpdated } from '../../../skylink-events';
import PeerData from '../../../peer-data';
import PeerMedia from '../../../peer-media/index';
import { EVENTS, HANDSHAKE_PROGRESS } from '../../../constants';

const dispatchPeerUpdatedEvent = (roomState) => {
  const { room, user } = roomState;

  dispatchEvent(peerUpdated({
    peerId: user.sid,
    isSelf: true,
    peerInfo: PeerData.getCurrentSessionInfo(room),
  }));
};

// eslint-disable-next-line consistent-return
const initRefreshConnectionAndResolve = (room, fromLeaveRoom, resolve, reject) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;

  try {
    if (!fromLeaveRoom) {
      if (!isEmptyArray(Object.keys(peerConnections))) {
        // eslint-disable-next-line consistent-return
        const executeAnswerAckCallback = (evt) => {
          const { detail } = evt;
          if (detail.state === HANDSHAKE_PROGRESS.ANSWER_ACK) {
            return (resolve());
          }
        };

        addEventListener(EVENTS.HANDSHAKE_PROGRESS, executeAnswerAckCallback);

        PeerConnection.refreshConnection(state);
      } else {
        dispatchPeerUpdatedEvent(state);
        PeerMedia.deleteUnavailableMedia(state.room, state.user.sid);
        return resolve();
      }
    }
  } catch (err) {
    reject(err);
  }
};

export default initRefreshConnectionAndResolve;
