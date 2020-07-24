import clone from 'clone';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { peerConnectionState, roomRejoin } from '../../../../skylink-events';
import HandleIceConnectionStats from '../../../../skylink-stats/handleIceConnectionStats';
import { PEER_CONNECTION_STATE, ICE_CONNECTION_STATE } from '../../../../constants';
import logger from '../../../../logger';
import MESSAGES from '../../../../messages';
import SkylinkApiResponse from '../../../../models/api-response';
import Room from '../../../../room';

const onconnectionstatechange = (peerConnection, targetMid, state) => {
  const { room, user } = state;
  const { connectionState, iceConnectionState } = peerConnection;
  const { hasMCU } = new SkylinkApiResponse(null, room.id);

  // some states are not dispatched on oniceconnectionstatechange
  const handleIceConnectionStats = new HandleIceConnectionStats();
  handleIceConnectionStats.send(room.id, connectionState === PEER_CONNECTION_STATE.FAILED ? ICE_CONNECTION_STATE.FAILED : iceConnectionState, targetMid);

  logger.log.DEBUG([targetMid, 'RTCPeerConnectionState', null, MESSAGES.PEER_CONNECTION.STATE_CHANGE], peerConnection.connectionState);
  dispatchEvent(peerConnectionState({
    state: connectionState,
    peerId: targetMid,
  }));

  if (peerConnection.connectionState === PEER_CONNECTION_STATE.FAILED && peerConnection.iceConnectionState === ICE_CONNECTION_STATE.FAILED && !hasMCU) {
    const roomInfo = clone(Room.getRoomInfo(room.id));
    Room.leaveRoom(state)
      .then(() => {
        dispatchEvent(roomRejoin({
          room: roomInfo,
          peerId: user.sid,
        }));
      });
  }
};

export default onconnectionstatechange;
