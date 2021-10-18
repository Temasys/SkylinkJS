import Skylink from '../../../../index';
import SkylinkSignalingServer from '../../index';
import IceConnection from '../../../../ice-connection/index';
import PeerData from '../../../../peer-data';
import PeerMedia from '../../../../peer-media/index';
import { peerJoined } from '../../../../skylink-events';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import Room from '../../../../room';
import PeerStream from '../../../../peer-stream';
import { ON_INCOMING_STREAM } from '../../../../skylink-events/constants';
import logger from '../../../../logger';
import MESSAGES from '../../../../messages';
import HandleUserMediaStats from '../../../../skylink-stats/handleUserMediaStats';
import HandleSessionStats from '../../../../skylink-stats/handleSessionStats';
import { TAGS } from '../../../../constants';

const dispatchIncomingStream = (room, sid) => {
  const state = Skylink.getSkylinkState(room.id);
  if (!state.peerStreams[sid]) {
    return;
  }

  Object.values(state.peerStreams[sid]).forEach((stream) => {
    PeerStream.dispatchStreamEvent(ON_INCOMING_STREAM, {
      stream,
      peerId: sid,
      room: Room.getRoomInfo(room.id),
      isSelf: true,
      peerInfo: PeerData.getCurrentSessionInfo(room),
      streamId: stream.id,
      isVideo: stream.getVideoTracks().length > 0,
      isAudio: stream.getAudioTracks().length > 0,
    });
  });
};

const startUserMediaStatsInterval = (roomKey, peerId) => {
  const initOptions = Skylink.getInitOptions();
  new HandleUserMediaStats().send(roomKey); // send first stat

  const interval = setInterval(() => {
    const currentState = Skylink.getSkylinkState(roomKey);
    const userId = currentState ? currentState.user.sid : null;

    if (!currentState || userId !== peerId) { // user has left the room  or there is a new socket connection, so stop sending stats
      clearInterval(interval);
    } else {
      new HandleUserMediaStats().send(currentState.room.id);
    }
  }, initOptions.statsInterval * 1000);
};

/**
 * Function that handles the "inRoom" socket message received.
 * @param {JSON} message
 * @memberOf SignalingMessageHandler
 * @fires PEER_JOINED
 * @fires HANDSHAKE_PROGRESS
 * @fires ON_INCOMING_STREAM
 */
const inRoomHandler = (message) => {
  const {
    pc_config: { iceServers },
    sid,
    rid,
    tieBreaker,
  } = message;
  const roomState = Skylink.getSkylinkState(rid);
  const signaling = new SkylinkSignalingServer();

  roomState.room.connection.peerConfig = IceConnection.setIceServers(rid, iceServers);
  roomState.room.inRoom = true;
  roomState.user.sid = sid;
  logger.log.INFO([null, TAGS.SIG_SERVER, null, `${MESSAGES.PEER_INFORMATIONS.SET_PEER_PRIORITY_WEIGHT}: `], tieBreaker);
  roomState.peerPriorityWeight = tieBreaker;

  PeerMedia.updatePeerMediaWithUserSid(roomState.room, sid);
  PeerStream.updatePeerStreamWithUserSid(roomState.room, sid);
  Skylink.setSkylinkState(roomState, rid);

  dispatchEvent(peerJoined({
    peerId: roomState.user.sid,
    peerInfo: PeerData.getCurrentSessionInfo(roomState.room),
    isSelf: true,
    room: roomState.room,
  }));

  new HandleSessionStats().send(rid, message);

  dispatchIncomingStream(roomState.room, sid);
  startUserMediaStatsInterval(roomState.room.id, sid);
  signaling.enterRoom(roomState);
};

export default inRoomHandler;
