import Skylink from '../../../../index';
import SkylinkSignalingServer from '../../index';
import IceConnection from '../../../../ice-connection/index';
import PeerData from '../../../../peer-data';
import PeerMedia from '../../../../peer-media/index';
import { peerJoined, onIncomingStream } from '../../../../skylink-events';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { hasAudioTrack, hasVideoTrack } from '../../../../utils/helpers';
import * as constants from '../../../../constants';
import Room from '../../../../room';

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
  const initOptions = Skylink.getInitOptions();
  const { priorityWeightScheme } = initOptions;
  const signaling = new SkylinkSignalingServer();
  let weightAppendValue = 0;

  roomState.room.connection.peerConfig = IceConnection.setIceServers(iceServers);
  roomState.room.inRoom = true;

  if (priorityWeightScheme === constants.PRIORITY_WEIGHT_SCHEME.AUTO) {
    weightAppendValue = 0;
  } else if (priorityWeightScheme === constants.PRIORITY_WEIGHT_SCHEME.ENFORCE_OFFERER) {
    weightAppendValue = 2e+15;
  } else {
    weightAppendValue = -(2e+15);
  }

  roomState.peerPriorityWeight = tieBreaker + weightAppendValue;
  roomState.user.sid = sid;

  PeerMedia.updatePeerMediaWithUserSid(roomState.room, sid);
  Skylink.setSkylinkState(roomState, rid);

  dispatchEvent(peerJoined({
    peerId: roomState.user.sid,
    peerInfo: PeerData.getCurrentSessionInfo(roomState.room),
    isSelf: true,
    room: roomState.room,
  }));

  if (roomState.streams.userMedia) {
    const streamIds = Object.keys(roomState.streams.userMedia);
    streamIds.forEach((streamId) => {
      const mediaStream = roomState.streams.userMedia[streamId].stream;
      dispatchEvent(onIncomingStream({
        stream: mediaStream,
        streamId: mediaStream.id,
        peerId: roomState.user.sid,
        room: Room.getRoomInfo(roomState.room.id),
        isSelf: true,
        peerInfo: PeerData.getCurrentSessionInfo(roomState.room),
        isVideo: hasVideoTrack(mediaStream),
        isAudio: hasAudioTrack(mediaStream),
      }));
    });
  }

  signaling.enterRoom(roomState);
};

export default inRoomHandler;
