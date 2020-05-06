import Skylink, { SkylinkConstants } from '../index';
import {
  SERVER_PEER_TYPE, PEER_CONNECTION_STATE, DATA_CHANNEL_STATE, PEER_TYPE,
} from '../constants';
import PeerData from '../peer-data';
import { SkylinkSignalingServer } from '../server-communication/index';
import { peerLeft, serverPeerLeft } from '../skylink-events';
import { dispatchEvent, addEventListener, removeEventListener } from '../utils/skylinkEventManager';
import logger from '../logger/index';
import PeerConnection from '../peer-connection/index';
import stopStreamHelpers from '../media-stream/helpers/stopStream/index';
import ScreenSharing from '../features/screen-sharing';
import MESSAGES from '../messages';
import { isEmptyArray } from '../utils/helpers';

/**
 * Emits the peerLeft event when current peer left the room.
 * @param {SkylinkState} state
 * @param {String} peerId
 * @private
 */
const executePeerLeftProcess = (state, peerId) => new Promise((resolve) => {
  const { room, peerConnections } = state;
  const { ROOM: { LEAVE_ROOM } } = MESSAGES;
  const { enableDataChannel } = Skylink.getInitOptions();

  logger.log.INFO([peerId, room.roomName, null, LEAVE_ROOM.PEER_LEFT.START]);

  if (peerId === PEER_TYPE.MCU) {
    dispatchEvent(serverPeerLeft({
      peerId,
      serverPeerType: SERVER_PEER_TYPE.MCU,
      room,
    }));
  } else {
    dispatchEvent(peerLeft({
      peerId,
      peerInfo: PeerData.getCurrentSessionInfo(room),
      isSelf: false,
      room,
    }));
  }

  if (peerConnections[peerId] && peerConnections[peerId].signalingState !== PEER_CONNECTION_STATE.CLOSED) {
    PeerConnection.closePeerConnection(state, peerId);
  }

  if (enableDataChannel) {
    addEventListener(SkylinkConstants.EVENTS.DATA_CHANNEL_STATE, (evt) => {
      const { detail } = evt;
      if (detail.state === DATA_CHANNEL_STATE.CLOSED || detail.state === DATA_CHANNEL_STATE.CLOSING) {
        logger.log.INFO([detail.peerId, room.roomName, null, LEAVE_ROOM.PEER_LEFT.SUCCESS]);
        resolve(detail.peerId);
      }
    });

    PeerConnection.closeDataChannel(state, peerId);
  } else {
    resolve(peerId);
  }
});

/**
 * Method that sends a bye message to the all the peers in order remove the peer information or disconnects the socket connection.
 * @param state
 * @returns {Promise<SkylinkState>}
 * @private
 */
const sendByeOrDisconnectSocket = state => new Promise((resolve) => {
  const updatedState = Skylink.getSkylinkState(state.room.id);
  const { room, peerConnections } = updatedState;
  const { ROOM: { LEAVE_ROOM } } = MESSAGES;
  const skylinkSignalingServer = new SkylinkSignalingServer();
  const isInMoreThanOneRoom = Object.keys(Skylink.getSkylinkState()).length > 1;

  updatedState.inRoom = false;
  Skylink.setSkylinkState(updatedState, room.id);

  if (isInMoreThanOneRoom) {
    // broadcast bye to all peers in the room if there is more than one room
    logger.log.INFO([room.roomName, null, null, LEAVE_ROOM.SENDING_BYE]);
    Object.keys(peerConnections).forEach((peerId) => {
      skylinkSignalingServer.bye(updatedState, peerId);
    });
    resolve(updatedState);
  } else {
    // disconnect socket if it is the last room
    skylinkSignalingServer.config = skylinkSignalingServer.resetSocketConfig(window.location.protocol);

    const handleChannelClose = () => {
      logger.log.INFO([room.roomName, null, null, LEAVE_ROOM.DISCONNECT_SOCKET.SUCCESS]);
      removeEventListener(SkylinkConstants.EVENTS.CHANNEL_CLOSE, handleChannelClose);
      resolve(updatedState);
    };

    addEventListener(SkylinkConstants.EVENTS.CHANNEL_CLOSE, handleChannelClose);

    if (skylinkSignalingServer.socket.connected) {
      skylinkSignalingServer.socket.disconnect();
    } else {
      resolve(updatedState);
    }
  }
});

/**
 * Stops streams within a Skylink state.
 * @private
 * @param {SkylinkState} state
 */
const stopStreams = (state) => {
  const { room, streams } = state;

  if (streams.userMedia) {
    stopStreamHelpers.prepStopStreams(room.id, null, true);
  }

  if (streams.screenshare) {
    new ScreenSharing(state).stop(true);
  }
};

const clearRoomState = (roomKey) => {
  Skylink.clearRoomStateFromSingletons(roomKey);
  Skylink.removeSkylinkState(roomKey);
};

/**
 * Method that starts the peer left process.
 * @param {SkylinkState} roomState
 * @private
 */
export const leaveRoom = roomState => new Promise((resolve, reject) => {
  const {
    peerConnections, peerInformations, room, hasMCU, user,
  } = roomState;
  const { ROOM: { LEAVE_ROOM } } = MESSAGES;

  try {
    const peerIds = hasMCU ? [PEER_TYPE.MCU] : Array.from(new Set([...Object.keys(peerConnections), ...Object.keys(peerInformations)]));

    if (isEmptyArray(peerIds)) {
      logger.log.DEBUG([room.roomName, null, null, LEAVE_ROOM.NO_PEERS]);
      stopStreams(roomState);
      sendByeOrDisconnectSocket(roomState)
        .then((removedState) => {
          logger.log.INFO([room.roomName, null, null, LEAVE_ROOM.REMOVE_STATE.SUCCESS]);
          dispatchEvent(peerLeft({
            peerId: user.sid,
            peerInfo: PeerData.getCurrentSessionInfo(room),
            isSelf: true,
            room,
          }));
          clearRoomState(removedState.room.id);
          resolve(removedState.room.roomName);
        });
    } else {
      const peerLeftPromises = [];

      peerIds.forEach((peerId) => {
        peerLeftPromises.push(executePeerLeftProcess(roomState, peerId));
      });

      Promise.all(peerLeftPromises)
        .then(() => {
          stopStreams(roomState);
          return sendByeOrDisconnectSocket(roomState);
        })
        .then((removedState) => {
          logger.log.INFO([room.roomName, null, null, LEAVE_ROOM.REMOVE_STATE.SUCCESS]);
          dispatchEvent(peerLeft({
            peerId: user.sid,
            peerInfo: PeerData.getCurrentSessionInfo(room),
            isSelf: true,
            room,
          }));
          clearRoomState(removedState.room.id);
          resolve(removedState.room.roomName);
        });
    }
  } catch (error) {
    logger.log.ERROR([room.roomName, null, null, LEAVE_ROOM.ERROR], error);
    reject(error);
  }
});

/**
 * Method that triggers self to leave all rooms.
 * @param {Array} closedRooms - Array of rooms that have been left
 * @param {Array} resolves - Array of resolves for each room that have been left
 * @private
 */
export const leaveAllRooms = (closedRooms = [], resolves = []) => new Promise((resolve, reject) => {
  const { ROOM: { LEAVE_ROOM } } = MESSAGES;

  try {
    const states = Skylink.getSkylinkState();
    const roomStates = Object.values(states);

    if (roomStates[0]) { // Checks for existing roomStates and picks the first in the array
      leaveRoom(roomStates[0])
        .then((roomName) => {
          closedRooms.push(roomName);
          resolves.push(resolve);
          leaveAllRooms(closedRooms, resolves);
        });
    } else {
      logger.log.INFO([closedRooms, 'Room', null, LEAVE_ROOM.LEAVE_ALL_ROOMS.SUCCESS]);
      resolves.forEach(res => res(closedRooms)); // resolves all promises
    }
  } catch (err) {
    logger.log.ERROR([null, 'Room', null, LEAVE_ROOM.LEAVE_ALL_ROOMS.ERROR], err);
    reject(err);
  }
});
