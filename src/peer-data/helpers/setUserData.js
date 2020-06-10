import Skylink from '../../index';
import SkylinkSignalingServer from '../../server-communication/signaling-server';
import helpers from './index';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { peerUpdated } from '../../skylink-events';
import logger from '../../logger';
import MESSAGES from '../../messages';

/**
 * @description Function that overwrites the User current custom data.
 * @private
 * @param {SkylinkRoom} room
 * @param {String | Object} userData
 * @memberOf PeerDataHelpers
 * @fires PEER_UPDATED
 */
const setUserData = (room, userData) => {
  const roomState = Skylink.getSkylinkState(room.id);
  const { PEER_INFORMATIONS: { UPDATE_USER_DATA } } = MESSAGES;
  const updatedUserData = userData || '';

  roomState.user.userData = updatedUserData;
  Skylink.setSkylinkState(roomState, roomState.room.id);

  new SkylinkSignalingServer().setUserData(roomState);

  dispatchEvent(peerUpdated({
    peerId: roomState.user.sid,
    peerInfo: helpers.getCurrentSessionInfo(room),
    isSelf: true,
  }));

  logger.log.INFO(UPDATE_USER_DATA, updatedUserData);
};

export default setUserData;
