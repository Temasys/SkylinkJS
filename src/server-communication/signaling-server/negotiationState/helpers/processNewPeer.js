/* eslint-disable no-underscore-dangle */
import Skylink from '../../../../index';
import {
  HANDSHAKE_PROGRESS, PEER_TYPE, SERVER_PEER_TYPE, TAGS,
} from '../../../../constants';
import PeerConnection from '../../../../peer-connection';
import logger from '../../../../logger';
import MESSAGES from '../../../../messages';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { handshakeProgress, peerJoined, serverPeerJoined } from '../../../../skylink-events';
import Room from '../../../../room';
import PeerData from '../../../../peer-data';
import parsers from '../../parsers';

const _addPeerConnection = (params) => {
  const {
    currentRoom,
    targetMid,
    cert,
    userInfo,
    message,
  } = params;
  const state = Skylink.getSkylinkState(currentRoom.id);
  const hasScreenshare = !!userInfo.screenshare;

  PeerConnection.buildAndSetPeerInformations(targetMid, message.userInfo, state);

  PeerConnection.addPeer({
    currentRoom,
    targetMid,
    peerBrowser: {
      agent: userInfo.agent.name,
      version: userInfo.agent.version,
      os: userInfo.agent.os,
    },
    cert,
    hasScreenshare,
  });
};

const _processPeerFromWelcome = (params) => {
  const {
    currentRoom,
    targetMid,
    message,
  } = params;
  const state = Skylink.getSkylinkState(currentRoom.id);
  const { hasMCU, peerInformations } = state;

  // process based on room type
  switch (hasMCU) {
    case true:
      // MCU will always send welcome
      // 1) process the new MCU connection
      if (targetMid === PEER_TYPE.MCU && !peerInformations.MCU) {
        _addPeerConnection(params);

        logger.log.INFO([targetMid, TAGS.PEER_CONNECTION, null, MESSAGES.PEER_CONNECTION.MCU]);

        state.hasMCU = true;

        dispatchEvent(serverPeerJoined({
          peerId: targetMid,
          serverPeerType: SERVER_PEER_TYPE.MCU,
          room: Room.getRoomInfo(currentRoom.id),
        }));

        dispatchEvent(handshakeProgress({
          peerId: targetMid,
          state: HANDSHAKE_PROGRESS.WELCOME,
          error: null,
          room: Room.getRoomInfo(currentRoom.id),
        }));
      }

      // process other peers in the room if any
      if (Array.isArray(message.peersInRoom) && message.peersInRoom.length) {
        const userId = state.user.sid;
        for (let peersInRoomIndex = 0; peersInRoomIndex < message.peersInRoom.length; peersInRoomIndex += 1) {
          const PEER_ID = message.peersInRoom[peersInRoomIndex].mid;
          if (PEER_ID !== userId) {
            const parsedMsg = parsers.enterAndWelcome(message.peersInRoom[peersInRoomIndex]);
            const peerUserInfo = parsedMsg.userInfo;

            PeerConnection.buildAndSetPeerInformations(PEER_ID, peerUserInfo, state);

            dispatchEvent(peerJoined({
              peerId: PEER_ID,
              peerInfo: PeerData.getPeerInfo(PEER_ID, currentRoom),
              isSelf: false,
              room: Room.getRoomInfo(currentRoom.id),
            }));
          }
        }
      }


      break;
    case false: // P2P
      if (!peerInformations[targetMid]) {
        _addPeerConnection(params);

        dispatchEvent(peerJoined({
          peerId: targetMid,
          peerInfo: PeerData.getPeerInfo(targetMid, currentRoom),
          isSelf: false,
          room: Room.getRoomInfo(currentRoom.id),
        }));

        dispatchEvent(handshakeProgress({
          peerId: targetMid,
          state: HANDSHAKE_PROGRESS.WELCOME,
          error: null,
          room: Room.getRoomInfo(currentRoom.id),
        }));
      }

      break;
    default:
      // should not come here
      break;
  }
};

const _processPeerFromEnter = (params) => {
  const {
    currentRoom,
    userInfo,
    targetMid,
  } = params;
  const state = Skylink.getSkylinkState(currentRoom.id);
  const { hasMCU, peerInformations } = state;

  switch (hasMCU) {
    case true:
      // enter is forwarded by the MCU from a new peer that enters a room
      PeerConnection.buildAndSetPeerInformations(targetMid, userInfo, state);

      dispatchEvent(peerJoined({
        peerId: targetMid,
        peerInfo: PeerData.getPeerInfo(targetMid, currentRoom),
        isSelf: false,
        room: Room.getRoomInfo(currentRoom.id),
      }));

      break;
    case false:

      if (!peerInformations[targetMid]) {
        _addPeerConnection(params);

        dispatchEvent(peerJoined({
          peerId: targetMid,
          peerInfo: PeerData.getPeerInfo(targetMid, currentRoom),
          isSelf: false,
          room: Room.getRoomInfo(currentRoom.id),
        }));
      }

      break;
    default:
      // should not come here
      break;
  }
};

/**
 * Function that adds a Peer Connection and updates the state(Skylink State).
 * @param {JSON} message
 * @memberOf SignalingMessageHandler
 * @fires SERVER_PEER_JOINED
 * @fires PEER_JOINED
 * @fires HANDSHAKE_PROGRESS
 */
const processNewPeer = (message) => {
  const parsedMsg = parsers.enterAndWelcome(message);
  const {
    rid, mid, userInfo, publisherId,
  } = parsedMsg;
  const state = Skylink.getSkylinkState(rid);
  const { hasMCU } = state;
  const targetMid = hasMCU && publisherId ? publisherId : mid;
  const peerParams = {
    currentRoom: state.room,
    targetMid,
    userInfo,
    message: parsedMsg,
  };
  const updatedState = Skylink.getSkylinkState(rid);

  // TODO: check if this is used
  updatedState.peerMessagesStamps[targetMid] = updatedState.peerMessagesStamps[targetMid] || {
    userData: 0,
    audioMuted: 0,
    videoMuted: 0,
  };
  Skylink.setSkylinkState(updatedState, rid);

  if (message.type === 'enter') {
    _processPeerFromEnter(peerParams);
  } else if (message.type === 'welcome') {
    _processPeerFromWelcome(peerParams);
  }
};

export default processNewPeer;
