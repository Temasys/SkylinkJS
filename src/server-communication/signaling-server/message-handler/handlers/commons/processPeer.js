import Skylink from '../../../../../index';
import logger from '../../../../../logger';
import PeerConnection from '../../../../../peer-connection';
import { CALLERS } from './enterAndWelcome';
import { peerJoined, handshakeProgress, serverPeerJoined } from '../../../../../skylink-events';
import { dispatchEvent } from '../../../../../utils/skylinkEventManager';
import PeerData from '../../../../../peer-data';
import parsers from '../../../parsers/index';
import { PEER_TYPE, SERVER_PEER_TYPE, HANDSHAKE_PROGRESS } from '../../../../../constants';

const setPeerInformations = (state, peerId, userInfo) => {
  const { room } = state;
  // eslint-disable-next-line no-param-reassign
  state.peerInformations[peerId] = PeerConnection.buildPeerInformations(userInfo, state);
  Skylink.setSkylinkState(state, room.id);
};

/**
 * Function that adds a Peer Connection and updates the state(Skylink State).
 * @param {JSON} params
 * @memberOf SignalingMessageHandler
 * @fires serverPeerJoined
 * @fires peerJoined
 * @fires handshakeProgress
 */
const processPeer = (params) => {
  const {
    currentRoom,
    targetMid,
    cert,
    userInfo,
    message,
    caller,
  } = params;
  let isNewPeer = false;
  const state = Skylink.getSkylinkState(currentRoom.id);
  const { hasMCU } = state;
  const { peerInformations } = state;
  if ((!peerInformations[targetMid] && !hasMCU) || (hasMCU && targetMid === PEER_TYPE.MCU && !peerInformations.MCU)) {
    const hasScreenshare = !!userInfo.screenshare;
    isNewPeer = true;
    state.peerInformations[targetMid] = PeerConnection.buildPeerInformations(message.userInfo, state);

    const peerBrowser = {
      agent: userInfo.agent.name,
      version: userInfo.agent.version,
      os: userInfo.agent.os,
    };

    Skylink.setSkylinkState(state, currentRoom.id);

    PeerConnection.addPeer({
      currentRoom,
      targetMid,
      peerBrowser,
      cert,
      receiveOnly: message.receiveOnly,
      hasScreenshare,
    });

    if (targetMid === PEER_TYPE.MCU) {
      logger.log.INFO([targetMid, 'RTCPeerConnection', null, 'MCU feature has been enabled']);
      state.hasMCU = true;
      dispatchEvent(serverPeerJoined({
        peerId: targetMid,
        serverPeerType: SERVER_PEER_TYPE.MCU,
        room: currentRoom,
      }));
    } else {
      dispatchEvent(peerJoined({
        peerId: targetMid,
        peerInfo: PeerData.getPeerInfo(targetMid, currentRoom),
        isSelf: false,
        room: currentRoom,
      }));
    }
  }

  state.peerMessagesStamps[targetMid] = state.peerMessagesStamps[targetMid] || {
    userData: 0,
    audioMuted: 0,
    videoMuted: 0,
  };

  if (caller === CALLERS.WELCOME) {
    state.peerMessagesStamps[targetMid].hasWelcome = false;
  }

  if (caller === CALLERS.WELCOME && hasMCU && Array.isArray(message.peersInRoom) && message.peersInRoom.length) {
    const userId = state.user.sid;
    for (let peersInRoomIndex = 0; peersInRoomIndex < message.peersInRoom.length; peersInRoomIndex += 1) {
      const PEER_ID = message.peersInRoom[peersInRoomIndex].mid;
      if (PEER_ID !== userId) {
        const parsedMsg = parsers.enterAndWelcome(message.peersInRoom[peersInRoomIndex]);
        const peerUserInfo = parsedMsg.userInfo;
        setPeerInformations(state, PEER_ID, peerUserInfo);
        dispatchEvent(peerJoined({
          peerId: PEER_ID,
          peerInfo: PeerData.getPeerInfo(PEER_ID, currentRoom),
          isSelf: false,
          room: currentRoom,
        }));
      }
    }
  } else if (hasMCU && targetMid !== state.user.sid && targetMid !== PEER_TYPE.MCU) {
    setPeerInformations(state, targetMid, userInfo);
    dispatchEvent(peerJoined({
      peerId: targetMid,
      peerInfo: PeerData.getPeerInfo(targetMid, currentRoom),
      isSelf: false,
      room: currentRoom,
    }));
  }

  Skylink.setSkylinkState(state, currentRoom.id);

  if (isNewPeer) {
    dispatchEvent(handshakeProgress({
      peerId: targetMid,
      state: HANDSHAKE_PROGRESS.WELCOME,
      error: null,
      room: currentRoom,
    }));
  }
};

export default processPeer;
