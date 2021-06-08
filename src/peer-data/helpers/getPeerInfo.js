import clone from 'clone';
import Skylink from '../../index';
import logger from '../../logger';
import messages from '../../messages';
import { DATA_CHANNEL_STATE } from '../../constants';
import PeerData from '../index';

const isUser = (peerId, roomState) => {
  const { user } = roomState;
  return peerId === user.sid;
};

/**
 * @description Function that returns the User / Peer current session information.
 * @private
 * @param {String} peerId
 * @param {SkylinkRoom} room
 * @return {peerInfo}
 * @memberOf PeerDataHelpers
 */
const getPeerInfo = (peerId, room) => {
  let peerInfo = null;
  if (!peerId) {
    return null;
  }
  const state = Skylink.getSkylinkState(room.id);

  if (!state) {
    logger.log.ERROR(`${messages.ROOM_STATE.NOT_FOUND} ${room.id}`);
    return peerInfo;
  }

  if (isUser(peerId, state)) {
    return PeerData.getCurrentSessionInfo(room);
  }

  peerInfo = clone(state.peerInformations[peerId]);

  if (!peerInfo) {
    logger.log.ERROR(`${messages.PEER_INFORMATIONS.NO_PEER_INFO} ${peerId}`);
    return peerInfo;
  }

  peerInfo.room = room.roomName;
  peerInfo.settings.data = !!(state.peerDataChannels[peerId] && state.peerDataChannels[peerId].main && state.peerDataChannels[peerId].main.channel && state.peerDataChannels[peerId].main.channel.readyState === DATA_CHANNEL_STATE.OPEN);

  return peerInfo;
};

export default getPeerInfo;
