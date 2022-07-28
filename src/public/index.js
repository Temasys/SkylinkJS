/* eslint-disable class-methods-use-this */
import {
  getParamValidity, getRoomStateByName, isAString, statelessGetUserMedia, isAObj, generateUUID,
} from '../utils/helpers';
import { dispatchEvent } from '../utils/skylinkEventManager';
import { streamEnded } from '../skylink-events';
import { SDK_VERSION } from '../constants';
import PeerConnection from '../peer-connection/index';
import PeerData from '../peer-data/index';
import PeerPrivileged from '../peer-privileged/index';
import ScreenSharing from '../features/screen-sharing/index';
import MediaStream from '../media-stream/index';
import Room from '../room/index';
import Recording from '../features/recording/index';
import RTMP from '../features/rtmp/index';
import AsyncMessaging from '../features/messaging/async-messaging';
import EncryptedMessaging from '../features/messaging/encrypted-messaging';
import Messaging from '../features/messaging';
import DataTransfer from '../features/data-transfer';

/**
 * @classdesc This class lists all the public methods of Skylink.
 * @interface
 * @private
 */
class SkylinkPublicInterface {
  /**
   * @description Method that starts a room session.
   * <p>Resolves with an array of <code>MediaStreams</code> or null if pre-fetched
   * stream was passed into <code>joinRoom</code> method. First item in array is <code>MediaStream</code> of kind audio and second item is
   * <code>MediaStream</code> of kind video.</p>
   * @param {joinRoomOptions} [options] - The options available to join the room and configure the session.
   * @param {MediaStream} [prefetchedStream] - The pre-fetched media stream object obtained when the user calls {@link Skylink#getUserMedia|getUserMedia} method before {@link Skylink#joinRoom|joinRoom} method.
   * @return {Promise.<MediaStreams>}
   * @example
   * Example 1: Calling joinRoom with options
   *
   * const joinRoomOptions = {
   *    audio: true,
   *    video: true,
   *    roomName: "Room_1",
   *    userData: {
   *        username: "GuestUser_1"
   *    },
   * };
   *
   * skylink.joinRoom(joinRoomOptions)
   *    .then((streams) => {
   *        if (streams[0]) {
   *          window.attachMediaStream(audioEl, streams[0]); // first item in array is an audio stream
   *        }
   *        if (streams[1]) {
   *          window.attachMediaStream(videoEl, streams[1]); // second item in array is a video stream
   *        }
   *    })
   *    .catch((error) => {
   *        // handle error
   *    });
   * @example
   * Example 2: Retrieving a pre-fetched stream before calling joinRoom
   *
   * // REF: {@link Skylink#getUserMedia|getUserMedia}
   * const prefetchedStreams = skylink.getUserMedia();
   *
   * const joinRoomOptions = {
   *    roomName: "Room_1",
   *    userData: {
   *        username: "GuestUser_1"
   *    },
   * };
   *
   * skylink.joinRoom(joinRoomOptions, prefetchedStreams)
   *    .catch((error) => {
   *    // handle error
   *    });
   * @alias Skylink#joinRoom
   */
  async joinRoom(options = {}, prefetchedStream) {
    return Room.joinRoom(options, prefetchedStream);
  }

  /**
   * @description Method that sends a message to peers via the data channel connection.
   * @param {String} [roomName] - The name of the room the message is intended for.
   * When not provided, the message will be broadcast to all rooms where targetPeerId(s) are found (if provided).
   * Note when roomName is provided, targetPeerId should be provided as null.
   * @param {String|JSON} message - The message.
   * @param {String|Array} [targetPeerId] - The target peer id to send message to.
   * When provided as an Array, it will send the message to only peers which ids are in the list.
   * When not provided, it will broadcast the message to all connected peers with data channel connection in a room.
   * @example
   * Example 1: Broadcasting to all peers in all rooms
   *
   * const message = "Hello everyone!";
   *
   * skylink.sendP2PMessage(message);
   * @example
   * Example 2: Broadcasting to all peers in a room
   *
   * const message = "Hello everyone!";
   * const roomName = "Room_1";
   *
   * skylink.sendP2PMessage(roomName, message);
   * @example
   * Example 3: Sending message to a peer in all rooms
   *
   * const message = "Hello!";
   * const targetPeerId = "peerId";
   *
   * skylink.sendP2PMessage(message, targetPeerId);
   * @example
   * Example 4: Sending message to a peer in a room
   *
   * const message = "Hello!";
   * const targetPeerId = "peerId";
   * const roomName = "Room_1";
   *
   * skylink.sendP2PMessage(roomName, message, targetPeerId);
   * @example
   * Example 5: Sending message to selected Peers in a room
   *
   * const message = "Hello!";
   * const selectedPeers = ["peerId_1", "peerId_2"];
   * const roomName = "Room_1";
   *
   * skylink.sendP2PMessage(roomName, message, selectedPeers);
   * @example
   * // Listen for onIncomingMessage event
   * skylink.addEventListener(SkylinkEvents.ON_INCOMING_MESSAGE, (evt) => {
   *   const detail = evt.detail;
   *   if (detail.isSelf) {
   *     // handle message from self
   *   } else {
   *     // handle message from remote peer
   *   }
   * }
   * @fires {@link SkylinkEvents.event:ON_INCOMING_MESSAGE|ON_INCOMING_MESSAGE} event
   * @alias Skylink#sendP2PMessage
   */
  sendP2PMessage(roomName = '', message = '', targetPeerId = '') {
    PeerConnection.sendP2PMessage(roomName, message, targetPeerId);
  }

  /**
   * @description Function that sends a message to peers via the Signaling socket connection.
   * <p><code>sendMessage</code> can also be used to trigger call actions on the remote. Refer to Example 3 for muting the remote peer.</p>
   * @param {String} roomName - room name to send the message.
   * @param {String|JSON} message - The message.
   * @param {String|Array} [targetPeerId] - The target peer id to send message to.
   * - When provided as an Array, it will send the message to only peers which ids are in the list.
   * - When not provided, it will broadcast the message to all connected peers in the room.
   * @param {String} [peerSessionId] - The peer session id can be used to attribute the message to a client across sessions. It will replace the
   * peerId. The peer session id is returned in the peerInfo object.
   * @example
   * Example 1: Broadcasting to all peers in a room
   *
   * let sendMessage = (roomName) => {
   *    const message = "Hi!";
   *    skylink.sendMessage(roomName, message);
   * }
   * @example
   * Example 2: Broadcasting to selected peers
   *
   * let sendMessage = (roomName) => {
   *    const message = "Hi all!";
   *    const selectedPeers = ["PeerID_1", "PeerID_2"];
   *    skylink.sendMessage(roomName, message, selectedPeers);
   * }
   * @example
   * Example 3: Muting the remote peer
   *
   * // The local peer - send custom message object
   * const msgObject = JSON.stringify({ data: "data-content", type: "muteStreams", audio: true, video: false });
   * this.skylink.sendP2PMessage(roomName, msgObject);
   *
   * // The remote peer - add an event listener for ON_INCOMING_MESSAGE and check for the custom message object
   * SkylinkEventManager.addEventListener(skylinkConstants.EVENTS.ON_INCOMING_MESSAGE, (evt) => {
   *    const {message, peerId, isSelf, room} = evt.detail;
   *    const msg = JSON.parse(message.content);
   *    if (msg.type === "muteStreams") {
   *       skylink.muteStreams(roomName, { audioMuted: msg.audio, videoMuted: msg.video });
   *      }
   *    });
   * @fires {@link SkylinkEvents.event:ON_INCOMING_MESSAGE|ON_INCOMING_MESSAGE} event
   * @alias Skylink#sendMessage
   * @since 0.4.0
   */
  sendMessage(roomName = '', message = '', targetPeerId = '', peerSessionId = '') {
    Messaging.sendMessage(roomName, message, targetPeerId, peerSessionId);
  }

  /**
   * @description Method that retrieves the message history from server if Persistent Message feature is enabled for the key.
   * @param {String} roomName - The name of the room.
   * @param {String} [roomSessionId] - The room session id to retrieve the messages from.
   * @example
   * Example 1: Retrieving stored messages
   *
   * // add event listener to catch storedMessages event
   * SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.STORED_MESSAGES, (evt) => {
   *    const { storedMessages } = evt.detail;
   *    storedMessages.content.forEach((message) => {
   *      // do something
   *    })
   * });
   *
   * let getStoredMessages = (roomName) => {
   *    this.skylink.getStoredMessages(roomName);
   * }
   * @fires {@link SkylinkEvents.event:STORED_MESSAGES|STORED_MESSAGES} event
   * @alias Skylink#getStoredMessages
   * @since 2.1
   */
  getStoredMessages(roomName, roomSessionId = '') {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      new AsyncMessaging(roomState).getStoredMessages(roomSessionId);
    }
  }

  /**
   * @description Method that gets the list of connected peers in the room.
   * @param {String} roomName - The name of the room.
   * @return {JSON.<String, peerInfo>|null} <code>peerInfo</code> keyed by peer id. Additional <code>isSelf</code> flag to determine if peer is user or not. Null is returned if room has not been created.
   * @example
   * Example 1: Get the list of currently connected peers in the same room
   *
   * const peers = skylink.getPeersInRoom(roomName);
   * @alias Skylink#getPeersInRoom
   */
  getPeersInRoom(roomName) {
    if (getParamValidity(roomName, 'roomName', 'getPeersInRoom')) {
      return PeerConnection.getPeersInRoom(roomName);
    }

    return null;
  }

  /**
   * @description Method that returns the user / peer current session information.
   * @param {String} roomName - The name of the room.
   * @param {String|null} [peerId] The peer id to return the current session information from.
   * - When not provided or that the peer id is does not exists, it will return
   *   the user current session information.
   * @return {peerInfo|null} The user / peer current session information.
   * @example
   * Example 1: Get peer current session information
   *
   * const peerPeerInfo = skylink.getPeerInfo(peerId);
   * @example
   * Example 2: Get user current session information
   *
   * const userPeerInfo = skylink.getPeerInfo();
   * @alias Skylink#getPeerInfo
   */
  getPeerInfo(roomName, peerId = null) {
    const roomState = getRoomStateByName(roomName);
    if (peerId && roomState) {
      return PeerData.getPeerInfo(peerId, roomState.room);
    }

    if (!peerId && roomState) {
      return PeerData.getCurrentSessionInfo(roomState.room);
    }

    return null;
  }

  /**
   * @description Method that returns the user / peer current custom data.
   * @param {String} roomName - The room name.
   * @param {String} [peerId] - The peer id to return the current custom data from.
   * - When not provided or that the peer id is does not exists, it will return
   *   the user current custom data.
   * @return {Object|null} The user / peer current custom data.
   * @example
   * Example 1: Get peer current custom data
   *
   * const peerUserData = skylink.getUserData(peerId);
   * @example
   * Example 2: Get user current custom data
   *
   * const userUserData = skylink.getUserData();
   * @alias Skylink#getUserData
   */
  getUserData(roomName, peerId) {
    const roomState = getRoomStateByName(roomName);
    if (roomState && roomState.room) {
      return PeerData.getUserData(roomState, peerId);
    }

    return null;
  }

  /**
   * @description Method that overwrites the user current custom data.
   * @param {String} roomName - The room name.
   * @param {JSON|String} userData - The updated custom data.
   * @fires {@link SkylinkEvents.event:PEER_UPDATED|PEER_UPDATED} event if peer is in room with <code>isSelf=true</code>.
   * @example
   * Example 1: Update user custom data after joinRoom()
   *
   * // add event listener to catch setUserData changes
   * SkylinkEventManager.addEventListener(SkylinkConstants.peerUpdated, (evt) => {
   *    const { detail } = evt;
   *   // do something
   * });
   *
   * const userData = "afterjoin";
   * skylink.setUserData(userData);
   * @alias Skylink#setUserData
   */
  setUserData(roomName, userData) {
    const roomState = getRoomStateByName(roomName);
    if (roomState && roomState.room) {
      return PeerData.setUserData(roomState.room, userData);
    }

    return null;
  }

  /**
   * @description Method that retrieves peer connection bandwidth stats and ICE connection status.
   * @param {String} roomName - The room name.
   * @param {String|Array} [peerId] The target peer id to retrieve connection stats from.
   * - When provided as an Array, it will retrieve all connection stats from all the peer ids provided.
   * - When not provided, it will retrieve all connection stats from the currently connected peers in the room.
   * @return {Promise<Array.<object.<String|statistics>>>}
   * @example
   * Example 1: Retrieving connection statistics from all peers in a room
   *
   * skylink.getConnectionStatus("Room_1")
   *  .then((statistics) => {
   *    // handle statistics
   *  }
   *  .catch((error) => {
   *    // handle error
   *  }
   * @example
   * Example 2: Retrieving connection statistics from selected peers
   *
   * const selectedPeers = ["peerId_1", "peerId_2"];
   * skylink.getConnectionStatus("Room_1", selectedPeers)
   *  .then((statistics) => {
   *    // handle statistics
   *  }
   *  .catch((error) => {
   *    // handle error
   *  }
   * @alias Skylink#getConnectionStatus
   */
  getConnectionStatus(roomName, peerId) {
    const roomState = getRoomStateByName(roomName);

    return PeerConnection.getConnectionStatus(roomState, peerId);
  }

  /**
   * @description Method that retrieves the list of peer ids from rooms within the same App space.
   * <blockquote class="info">
   *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled for the App Key
   *   provided in the {@link initOptions}, as only Users connecting using
   *   the App Key with this flag enabled (which we call privileged Users / peers) can retrieve the list of
   *   peer ids from rooms within the same App space.
   *   {@link https://support.temasys.com.sg/support/solutions/articles/12000012342-what-is-a-privileged-key-|What is a privileged key?}
   * </blockquote>
   * @param {String} roomName - The room name
   * @param {Boolean} [showAll=false] - The flag if Signaling server should also return the list of privileged peer ids.
   * By default, the Signaling server does not include the list of privileged peer ids in the return result.
   * @return {Promise.<Object.<String, Array<String>>>} peerList - Array of peer ids, keyed by room name.
   * @fires {@link SkylinkEvents.event:GET_PEERS_STATE_CHANGE|GET PEERS STATE CHANGE} event with parameter payload <code>state=ENQUIRED</code> upon calling <code>getPeers</code> method.
   * @fires {@link SkylinkEvents.event:GET_PEERS_STATE_CHANGE|GET PEERS STATE CHANGE} event with parameter payload <code>state=RECEIVED</code> when peer list is received from Signaling server.
   * @example
   * Example 1: Retrieve un-privileged peers
   *
   * skylink.getPeers(location)
   *  .then((result) => {
   *      // do something
   *  })
   *  .catch((error) => {
   *      // handle error
   *  })
   *
   * Example 2: Retrieve all (privileged and un-privileged) peers
   *
   * skylink.getPeers(location, true)
   *  .then((result) => {
   *      // do something
   *  })
   *  .catch((error) => {
   *      // handle error
   *  })
   * @alias Skylink#getPeers
   * @since 0.6.1
   */
  getPeers(roomName, showAll = false) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return PeerPrivileged.getPeerList(roomState.room, showAll);
    }

    return null;
  }

  /**
   * @typedef {Object} dataChannelInfo
   * @property {String} channelName - The data channel id.
   * @property {String} channelProp - The data channel property.
   * @property {String} channelType - The data channel type.
   * @property {String} currentTransferId - The data channel connection
   *   current progressing transfer session. Defined as <code>null</code> when there is
   *   currently no transfer session progressing on the data channel connection
   * @property {String} currentStreamId - The data channel connection
   *   current data streaming session id. Defined as <code>null</code> when there is currently
   *   no data streaming session on the data channel connection.
   * @property {String} readyState - The data channel connection readyState.
   * @property {String} bufferedAmountLow - The data channel buffered amount.
   * @property {String} bufferedAmountLowThreshold - The data channel
   *   buffered amount threshold.
   */
  /**
   * @description Method that gets the current list of connected peers data channel connections in the room.
   * @param {String} roomName - The room name.
   * @return {Object.<string, Object.<String, dataChannelInfo>>} - The list of peer data channels keyed by peer id, keyed by data channel id.
   * @example
   * Example 1: Get the list of current peers data channels in the same room
   *
   * const channels = skylink.getPeersDataChannels("Room_1");
   * @alias Skylink#getPeersDataChannels
   * @since 0.6.18
   */
  getPeersDataChannels(roomName) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return PeerData.getPeersDataChannels(roomState);
    }
    return null;
  }

  /**
   * @typedef {Object} customSettings - The peer stream and data settings.
   * @property {Boolean|JSON} data - The flag if peer has any data channel connections enabled.
   *   If <code>isSelf</code> value is <code>true</code>, this determines if user allows
   *   data channel connections, else if value is <code>false</code>, this determines if peer has any active
   *   data channel connections (where {@link SkylinkEvents.event:onDataChannelStateChanged|onDataChannelStateChangedEvent}
   *   triggers <code>state</code> as <code>OPEN</code> and <code>channelType</code> as
   *   <code>MESSAGING</code> for peer) with peer.
   * @property {Boolean|JSON} audio - The peer stream audio settings keyed by stream id.
   *   When defined as <code>false</code>, it means there is no audio being sent from peer.
   * @property {Boolean} audio[streamId].stereo - The flag if stereo band is configured
   *   when encoding audio codec is <code>OPUS</code> for receiving audio data.
   * @property {Boolean} audio[streamId].echoCancellation - The flag if echo cancellation is enabled for audio tracks.
   * @property {String} [audio[streamId].deviceId] - The peer stream audio track source id of the device used.
   * @property {Boolean} audio[streamId].exactConstraints - The flag if peer stream audio track is sending exact
   *   requested values of <code>audio.deviceId</code> when provided.
   * @property {Boolean|JSON} video - The peer stream video settings keyed by stream id.
   *   When defined as <code>false</code>, it means there is no video being sent from peer.
   * @property {JSON} [video[streamId].resolution] - The peer stream video resolution.
   *   [Rel: {@link SkylinkConstants.VIDEO_RESOLUTION|VIDEO_RESOLUTION}]
   * @property {Number|JSON} video[streamId].resolution.width - The peer stream video resolution width or
   *   video resolution width settings.
   *   When defined as a JSON Object, it is the user set resolution width settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).
   * @property {Number|JSON} video[streamId].resolution.height - The peer stream video resolution height or
   *   video resolution height settings.
   *   When defined as a JSON Object, it is the user set resolution height settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).
   * @property {Number|JSON} [video[streamId].frameRate] - The peer stream video
   *   <a href="https://en.wikipedia.org/wiki/Frame_rate">frameRate</a> per second (fps) or video frameRate settings.
   *   When defined as a JSON Object, it is the user set frameRate settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).
   * @property {Boolean} video[streamId].screenshare - The flag if peer stream is a screensharing stream.
   * @property {String} [video[streamId].deviceId] - The peer stream video track source id of the device used.
   * @property {Boolean} video[streamId].exactConstraints The flag if peer stream video track is sending exact
   *   requested values of <code>video.resolution</code>,
   *   <code>video.frameRate</code> and <code>video.deviceId</code>
   *   when provided.
   * @property {String|JSON} [video[streamId].facingMode] - The peer stream video camera facing mode.
   *   When defined as a JSON Object, it is the user set facingMode settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).
   * @property {Object} maxBandwidth The maximum streaming bandwidth sent from peer.
   * @property {Number} [maxBandwidth.audio] - The maximum audio streaming bandwidth sent from peer.
   * @property {Number} [maxBandwidth.video] - The maximum video streaming bandwidth sent from peer.
   * @property {Number} [maxBandwidth.data] - The maximum data streaming bandwidth sent from peer.
   * @property {Object} mediaStatus The peer streaming media status.
   * @property {Number} mediaStatus.audioMuted -  The value of the audio status.
   *   <small>If peer <code>mediaStatus</code> is <code>-1</code>, audio is not present in the stream. If peer <code>mediaStatus</code> is <code>1</code>, audio is present
   *   in the stream and active (not muted). If peer <code>mediaStatus</code> is <code>0</code>, audio is present in the stream and muted.
   *   </small>
   * @property {Number} mediaStatus.videoMuted - The value of the video status.
   *   <small>If peer <code>mediaStatus</code> is <code>-1</code>, video is not present in the stream. If peer <code>mediaStatus</code> is <code>1</code>, video is present
   *   in the stream and active (not muted). If peer <code>mediaStatus</code> is <code>0</code>, video is present in the stream and muted.
   *   </small>
   */
  /**
   * @description Method that gets the list of current custom peer settings sent and set.
   * @param {String} roomName - The room name.
   * @return {Object.<String, customSettings>|null} - The peer custom settings keyed by peer id.
   * @example
   * Example 1: Get the list of current peer custom settings from peers in a room.
   *
   * const currentPeerSettings = skylink.getPeersCustomSettings("Room_1");
   * @alias Skylink#getPeersCustomSettings
   * @since 0.6.18
   */
  getPeersCustomSettings(roomName) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return PeerData.getPeersCustomSettings(roomState);
    }

    return null;
  }

  /**
   * @description Method that refreshes the main messaging data channel.
   * @param {String} roomName - The room name.
   * @param {String} peerId - The target peer id of the peer data channel to refresh.
   * @return {null}
   * @example
   * Example 1: Initiate refresh data channel
   *
   * skylink.refreshDatachannel("Room_1", "peerID_1");
   *
   * @alias Skylink#refreshDatachannel
   * @since 0.6.30
   */
  refreshDatachannel(roomName, peerId) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return PeerConnection.refreshDataChannel(roomState, peerId);
    }

    return null;
  }

  /**
   * @description Method that refreshes peer connections to update with the current streaming.
   * @param {String} roomName - The name of the room.
   * @param {String|Array} [targetPeerId] <blockquote class="info">
   *   Note that this is ignored if MCU is enabled for the App Key provided in
   *   {@link initOptions}. <code>refreshConnection()</code> will "refresh"
   *   all peer connections. </blockquote>
   *   - The target peer id to refresh connection with.
   * - When provided as an Array, it will refresh all connections with all the peer ids provided.
   * - When not provided, it will refresh all the currently connected peers in the room.
   * @param {Boolean} [iceRestart=false] <blockquote class="info">
   *   Note that this flag will not be honoured for MCU enabled peer connections where
   *   <code>options.mcuUseRenegoRestart</code> flag is set to <code>false</code> as it is not necessary since for MCU
   *   "restart" case is to invoke {@link Skylink#joinRoom|joinRoom} again, or that it is
   *   not supported by the MCU.</blockquote>
   *   The flag if ICE connections should restart when refreshing peer connections.
   *   This is used when ICE connection state is <code>FAILED</code> or <code>DISCONNECTED</code>, which
   *   can be retrieved with the {@link SkylinkEvents.event:ICE_CONNECTION_STATE|ICE CONNECTION STATE} event.
   * @param {JSON} [options] <blockquote class="info">
   *   Note that for MCU connections, the <code>bandwidth</code>
   *   settings will override for all peers or the current room connection session settings.</blockquote>
   *   The custom peer configuration settings.
   * @param {JSON} [options.bandwidth] The configuration to set the maximum streaming bandwidth to send to peers.
   *   Object signature follows {@link Skylink#joinRoom|joinRoom}
   *   <code>options.bandwidth</code> settings.
   * @return {Promise.<refreshConnectionResolve>} - The Promise will always resolve.
   * @example
   * Example 1: Refreshing a peer connection
   *
   * skylink.refreshConnection(roomName, peerId)
   * .then((result) => {
   *   const failedRefreshIds = Object.keys(result.refreshErrors);
   *   failedRefreshIds.forEach((peerId) => {
   *     // handle error
   *   });
   * });
   *
   * @example
   * Example 2: Refreshing a list of peer connections
   * let selectedPeers = ["peerID_1", "peerID_2"];
   *
   * skylink.refreshConnection(roomName, selectedPeers)
   * .then((result) => {
   *   const failedRefreshIds = Object.keys(result.refreshErrors);
   *   failedRefreshIds.forEach((peerId) => {
   *     // handle error
   *   });
   * });
   * @example
   * Example 3: Refreshing all peer connections
   *
   * skylink.refreshConnection(roomName)
   * .then((result) => {
   *   const failedRefreshIds = Object.keys(result.refreshErrors);
   *   failedRefreshIds.forEach((peerId) => {
   *    // handle error
   *   });
   * });
   * @alias Skylink#refreshConnection
   * @since 0.5.5
   */
  refreshConnection(roomName, targetPeerId, iceRestart, options) {
    const roomState = getRoomStateByName(roomName);

    return PeerConnection.refreshConnection(roomState, targetPeerId, iceRestart, options);
  }

  /**
   * @description Method that returns starts screenshare and returns the stream.
   * @param {String} roomName - The room name.
   * @param {getDisplayMediaOptions} options - Screen share options.
   * @return {MediaStream|null} - The screen share stream.
   * @alias Skylink#shareScreen
   * @since 2.0.0
   */
  shareScreen(roomName, options) {
    const streamId = null;
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      const screenSharing = new ScreenSharing(roomState);
      return screenSharing.start(streamId, options);
    }

    return null;
  }

  /**
   * <blockquote class="info">
   *   For a better user experience, the functionality is throttled when invoked many times in less
   *   than the milliseconds interval configured in the {@link initOptions}.
   * </blockquote>
   * @description Method that retrieves camera stream.
   * <p>Resolves with an array of <code>MediaStreams</code>. First item in array is <code>MediaStream</code> of kind audio and second item is
   * <code>MediaStream</code> of kind video.</p>
   * @param {String|null} roomName - The room name.
   * - If no roomName is passed or <code>getUserMedia()</code> is called before {@link Skylink#joinRoom|joinRoom}, the returned stream will not be associated with a room. The stream must be maintained independently.
   * To stop the stream, call {@link Skylink#stopPrefetchedStream|stopPrefetchedStream} method.
   * @param {getUserMediaOptions} [options] - The camera stream configuration options.
   * - When not provided, the value is set to <code>{ audio: true, video: true }</code>.
   * @return {Promise.<MediaStreams>}
   * @example
   * Example 1: Get both audio and video after joinRoom
   *
   * skylink.getUserMedia(roomName, {
   *     audio: true,
   *     video: true,
   * }).then((streams) => // do something)
   * .catch((error) => // handle error);
   * @example
   * Example 2: Get only audio
   *
   * skylink.getUserMedia(roomName, {
   *     audio: true,
   *     video: false,
   * }).then((streams) => // do something)
   * .catch((error) => // handle error);
   * @example
   * Example 3: Configure resolution for video
   *
   * skylink.getUserMedia(roomName, {
   *     audio: true,
   *     video: { resolution: skylinkConstants.VIDEO_RESOLUTION.HD },
   * }).then((streams) => // do something)
   * .catch((error) => // handle error);
   * @example
   * Example 4: Configure stereo flag for OPUS codec audio (OPUS is always used by default)
   *
   * this.skylink.getUserMedia(roomName, {
   *     audio: {
   *         stereo: true,
   *     },
   *     video: true,
   * }).then((streams) => // do something)
   * .catch((error) => // handle error);
   * @example
   * Example 5: Get both audio and video before joinRoom
   *
   * // Note: the prefetched stream must be maintained independently
   * skylink.getUserMedia({
   *     audio: true,
   *     video: true,
   * }).then((streams) => // do something)
   * .catch((error) => // handle error);
   * @fires <b>If retrieval of fallback audio stream is successful:</b> <br/> - {@link SkylinkEvents.event:MEDIA_ACCESS_SUCCESS|MEDIA ACCESS SUCCESS} event with parameter payload <code>isScreensharing=false</code> and <code>isAudioFallback=false</code> if initial retrieval is successful.
   * @fires <b>If initial retrieval is unsuccessful:</b> <br/> Fallback to retrieve audio only stream is triggered (configured in {@link initOptions} <code>audioFallback</code>) <br/>&emsp; - {@link SkylinkEvents.event:MEDIA_ACCESS_SUCCESS|MEDIA ACCESS SUCCESS} event{@link SkylinkEvents.event:MEDIA_ACCESS_FALLBACK|MEDIA ACCESS FALLBACK} event with parameter payload <code>state=FALLBACKING</code>, <code>isScreensharing=false</code> and <code>isAudioFallback=true</code> and <code>options.video=true</code> and <code>options.audio=true</code>. <br/> No fallback to retrieve audio only stream <br/> - {@link SkylinkEvents.event:MEDIA_ACCESS_ERROR|MEDIA ACCESS ERROR} event with parameter payload <code>isScreensharing=false</code> and <code>isAudioFallbackError=false</code>.
   * @fires <b>If retrieval of fallback audio stream is successful:</b> <br/> - {@link SkylinkEvents.event:MEDIA_ACCESS_SUCCESS|MEDIA ACCESS SUCCESS} event with parameter payload <code>isScreensharing=false</code> and <code>isAudioFallback=true</code>.
   * @fires <b>If retrieval of fallback audio stream is unsuccessful:</b> <br/> - {@link SkylinkEvents.event:MEDIA_ACCESS_SUCCESS|MEDIA ACCESS SUCCESS} event{@link SkylinkEvents.event:MEDIA_ACCESS_FALLBACK|MEDIA ACCESS FALLBACK} event with parameter payload <code>state=ERROR</code>, <code>isScreensharing=false</code> and <code>isAudioFallback=true</code>. <br/> - {@link SkylinkEvents.event:MEDIA_ACCESS_ERROR|MEDIA ACCESS ERROR} event with parameter payload <code>isScreensharing=false</code> and <code>isAudioFallbackError=true</code>.
   * @alias Skylink#getUserMedia
   * @since 0.5.6
   */
  // eslint-disable-next-line consistent-return
  getUserMedia(roomName = null, options) {
    if (!roomName) {
      return statelessGetUserMedia(options);
    }

    if (isAString(roomName)) {
      const roomState = getRoomStateByName(roomName);
      if (roomState) {
        return MediaStream.processUserMediaOptions(roomState, options);
      }
    } else if (isAObj(roomName)) {
      return statelessGetUserMedia(roomName);
    }
  }

  /**
   * @description Method that stops the {@link Skylink#getUserMedia} stream that is called without roomName param or before {@link Skylink#joinRoom|joinRoom} is called.
   * @param {MediaStream} stream - The prefetched stream.
   * @return {null}
   * @fires {@link SkylinkEvents.event:STREAM_ENDED|STREAM ENDED} event
   * @alias Skylink#stopPrefetchedStream
   * @since 2.0
   * @ignore
   */
  stopPrefetchedStream(stream) {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });

      dispatchEvent(streamEnded({
        room: null,
        peerId: null,
        peerInfo: null,
        isSelf: true,
        isScreensharing: false,
        streamId: stream.id,
      }));
    }

    return null;
  }

  /**
   * @description Method that stops the screen share stream returned from {@link Skylink#shareScreen|shareScreen} method.
   * @param {String} roomName - The room name.
   * @return {null}
   * @example
   * Example 1
   *
   * skylink.stopScreen(roomName);
   *
   * @fires {@link SkylinkEvents.event:MEDIA_ACCESS_STOPPED|MEDIA ACCESS STOPPED} event with parameter payload <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code> value as <code>false</code> if there is a screen stream
   * @fires {@link SkylinkEvents.event:STREAM_ENDED|STREAM ENDED} event with parameter payload <code>isSelf</code> value as <code>true</code> and <code>isScreensharing</code> value as <code>true</code> if user is in the room
   * @fires {@link SkylinkEvents.event:PEER_UPDATED|PEER UPDATED} event with parameter payload <code>isSelf</code> value as <code>true</code>
   * @fires {@link SkylinkEvents.event:ON_INCOMING_STREAM|ON INCOMING STREAM} event  with parameter payload <code>isSelf</code> value as <code>true</code> and <code>stream</code> as {@link Skylink#getUserMedia} stream</a> if there is an existing <code>userMedia</code> stream
   * @alias Skylink#stopScreen
   * @since 0.6.0
   */
  stopScreen(roomName) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      const screenSharing = new ScreenSharing(roomState);
      screenSharing.stop();
    }

    return null;
  }

  /**
   * @description Method that stops the <code>userMedia</code> stream returned from {@link Skylink#getUserMedia|getUserMedia}</a> method.
   * @param {String} roomName - The room name.
   * @param {String} streamId - The stream id of the stream to stop. If streamId is not set, all <code>userMedia</code> streams will be stopped.
   * @return {Promise}
   * @example
   * skylink.stopStreams(roomName)
   * .then(() => // do some thing);
   * @fires {@link SkylinkEvents.event:MEDIA_ACCESS_STOPPED|MEDIA ACCESS STOPPED} event with parameter payload <code>isSelf=true</code> and <code>isScreensharing=false</code> if there is a <code>getUserMedia</code> stream.
   * @fires {@link SkylinkEvents.event:STREAM_ENDED|STREAM ENDED} event with parameter payload <code>isSelf=true</code> and <code>isScreensharing=false</code> if there is a <code>getUserMedia</code> stream and user is in a room.
   * @fires {@link SkylinkEvents.event:PEER_UPDATED|PEER UPDATED} event with parameter payload <code>isSelf=true</code>.
   * @alias Skylink#stopStreams
   * @since 0.5.6
   */
  stopStreams(roomName, streamId) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return MediaStream.stopStreams(roomState, streamId);
    }

    return null;
  }

  /**
   * @description Method that stops the room session.
   * @param {String} roomName  - The room name to leave.
   * @param {Boolean} [stopStreams=true] - The flag if streams should be stopped. Defaults to true.
   * @return {Promise.<String>}
   * @example
   * Example 1:
   *
   * // add event listener to catch peerLeft events when remote peer leaves room
   * SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, (evt) => {
   *    const { detail } = evt;
   *   // handle remote peer left
   * });
   *
   * skylink.leaveRoom(roomName)
   * .then((roomName) => {
   *   // handle local peer left
   * })
   * .catch((error) => // handle error);
   * @fires {@link SkylinkEvents.event:PEER_LEFT|PEER LEFT} event on the remote end of the connection.
   * @alias Skylink#leaveRoom
   * @since 0.5.5
   */
  leaveRoom(roomName, stopStreams = true) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return Room.leaveRoom(roomState, stopStreams);
    }

    return null;
  }

  /**
   * @description Method that stops all room sessions.
   * @param {Boolean} stopStreams - The flag if streams should be stopped. Defaults to true.
   * @return {Promise.<Array.<String>>}
   * @alias Skylink#leaveAllRooms
   * @since 2.0.0
   */
  leaveAllRooms(stopStreams = true) {
    return Room.leaveAllRooms(stopStreams);
  }

  /**
   * @description Method that starts a recording session.
   * <blockquote class="info">
   *   Note that this feature requires MCU and recording to be enabled for the App Key provided in
   *   {@link initOptions}. If recording feature is not available to
   *   be enabled in the {@link https://console.temasys.io|Temasys Developer Console}, please contact us on our support portal {@link https://temasys.atlassian.net/servicedesk/customer/portals|here}.
   * </blockquote>
   * @param {String} roomName - The room name.
   * @return {Promise<String>} recordingId - The recording session id.
   * @example
   * Example 1: Start a recording session
   *
   * skylink.startRecording(roomName)
   * .then(recordingId => {
   *   // do something
   * })
   * .catch(error => {
   *   // handle error
   * });
   * @fires {@link SkylinkEvents.event:RECORDING_STATE|RECORDING STATE} event with payload <code>state=START</code> if recording has started
   * successfully.
   * @fires {@link SkylinkEvents.event:RECORDING_STATE|RECORDING STATE} event with payload <code>error</code> if an error occurred during recording.
   * @alias Skylink#startRecording
   * @since 0.6.16
   */
  startRecording(roomName) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return Recording.start(roomState);
    }

    return null;
  }

  /**
   * @description Method that stops a recording session.
   * <blockquote class="info">
   *   <ul>
   *     <li>
   *      Note that this feature requires MCU and recording to be enabled for the App Key provided in the
   *      {@link initOptions}. If recording feature is not available to be enabled in the {@link https://console.temasys.io|Temasys Developer Console},
   *      please contact us on our support portal {@link https://temasys.atlassian.net/servicedesk/customer/portals|here}.
   *    </li>
   *    <li>
   *      It is mandatory for the recording session to have elapsed for more than 4 minutes before calling <code>stopRecording</code> method.
   *    </li>
   *   </ul>
   * </blockquote>
   * @param {String} roomName - The room name.
   * @return {Promise<String>} recordingId - The recording session id.
   * @example
   * Example 1: Stop the recording session
   *
   * skylink.stopRecording(roomName)
   * .then(recordingId => {
   *   // do something
   * })
   * .catch(error => {
   *   // handle error
   * });
   * @fires {@link SkylinkEvents.event:RECORDING_STATE|RECORDING STATE} event with payload <code>state=STOP</code> if recording has stopped
   * successfully.
   * @fires {@link SkylinkEvents.event:RECORDING_STATE|RECORDING STATE} event with payload <code>error</code> if an error occurred during recording.
   * @alias Skylink#stopRecording
   * @since 0.6.16
   */
  stopRecording(roomName) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return Recording.stop(roomState);
    }

    return null;
  }

  /**
   * @description Method that locks a room.
   * @param {String} roomName - The room name.
   * @return {Boolean}
   * @fires {@link SkylinkEvents.event:ROOM_LOCK|ROOM LOCK} event with payload parameters <code>isLocked=true</code> when the room is successfully locked.
   * @example
   * // add event listener to listen for room locked state when peer tries to join a locked room
   * skylinkEventManager.addEventListener(SkylinkEvents.SYSTEM_ACTION, (evt) => {
   *   const { detail } = evt;
   *   if (detail.reason === SkylinkConstants.SYSTEM_ACTION.LOCKED') {
   *     // handle event
   *   }
   * }
   *
   * // add event listener to listen for room locked/unlocked event after calling lockRoom method
   * skylinkEventManager.addEventListener(SkylinkEvents.ROOM_LOCK, (evt) => {
   *   const { detail } = evt;
   *   if (detail.isLocked) {
   *     // handle room lock event
   *   } else {
   *     // handle room unlock event
   *   }
   * }
   *
   * skylink.lockRoom(roomName);
   * @alias Skylink#lockRoom
   * @since 0.5.0
   */
  lockRoom(roomName) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return Room.lockRoom(roomState);
    }

    return null;
  }

  /**
   * @description Method that unlocks a room.
   * @param {String} roomName - The room name.
   * @return {Boolean}
   * @fires {@link SkylinkEvents.event:ROOM_LOCK|ROOM LOCK} event with payload parameters <code>isLocked=false</code> when the room is successfully locked.
   * @alias Skylink#unlockRoom
   * @since 0.5.0
   */
  unlockRoom(roomName) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return Room.unlockRoom(roomState);
    }

    return null;
  }

  /**
   * @typedef {Object} recordingSessions
   * @property {Object<string, Object>} #recordingId - The recording session keyed by recording id.
   * @property {Boolean} #recordingId.active - The flag that indicates if the recording session is currently active.
   * @property {String} #recordingId.state - The current recording state. [Rel: {@link SkylinkConstants.RECORDING_STATE|RECORDING_STATE}]
   * @property {String} #recordingId.startedStateTime - The recording session started DateTime in
   *   {@link https://en.wikipedia.org/wiki/ISO_8601|ISO}.Note that this value may not be
   *   very accurate as this value is recorded when the start event is received.
   * @property {String} #recordingId.endedDateTime - The recording session ended DateTime in
   *   {@link https://en.wikipedia.org/wiki/ISO_8601|ISO}.Note that this value may not be
   *   very accurate as this value is recorded when the stop event is received.
   *   Defined only after <code>state</code> has triggered <code>STOP</code>.
   * @property {String} #recordingId.mixingDateTime - The recording session mixing completed DateTime in
   *   {@link https://en.wikipedia.org/wiki/ISO_8601|ISO}.Note that this value may not be
   *   very accurate as this value is recorded when the mixing completed event is received.
   *   Defined only when <code>state</code> is <code>LINK</code>.
   * @property {String} #recordingId.links - The recording session links.
   *   Object signature matches the <code>link</code> parameter payload received in the
   *   {@link SkylinkEvents.event:RECORDING_STATE|RECORDING STATE} event event.
   * @property {Error} #recordingId.error - The recording session error.
   *   Defined only when <code>state</code> is <code>ERROR</code>.
   */
  /**
   * Gets the list of current recording sessions since user has connected to the room.
   * @description Method that retrieves the list of recording sessions.
   * <blockquote class="info">
   *   Note that this feature requires MCU and recording to be enabled for the App Key provided in
   *   {@link initOptions}. If recording feature is not available to be enabled in the {@link https://console.temasys.io|Temasys Developer Console},
   *   please contact us on our support portal {@link https://temasys.atlassian.net/servicedesk/customer/portals|here}.
   * </blockquote>
   * @param {String} roomName - The room name.
   * @return {recordingSessions|{}} The list of recording sessions.
   * @example
   * Example 1: Get recording sessions
   *
   * skylink.getRecordings(roomName);
   * @alias Skylink#getRecordings
   * @since 0.6.16
   */
  getRecordings(roomName) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return Recording.getRecordings(roomState);
    }

    return null;
  }

  /**
   * @description Method that mutes both <code>userMedia</code> [{@link Skylink#getUserMedia|getUserMedia}] stream and
   * <code>screen</code> [{@link Skylink#shareScreen|shareScreen}] stream.
   * @param {String} roomName - The room name.
   * @param {JSON} options - The streams muting options.
   * @param {Boolean} [options.audioMuted=true] - The flag if all streams audio
   *   tracks should be muted or not.
   * @param {Boolean} [options.videoMuted=true] - The flag if all streams video
   *   tracks should be muted or not.
   * @param {String} [streamId] - The id of the stream to mute.
   * @return {null}
   * @example
   * Example 1: Mute both audio and video tracks in all streams
   *
   * skylink.muteStreams(roomName, {
   *    audioMuted: true,
   *    videoMuted: true
   * });
   * @example
   * Example 2: Mute only audio tracks in all streams
   *
   * skylink.muteStreams(roomName, {
   *    audioMuted: true,
   *    videoMuted: false
   * });
   * @example
   * Example 3: Mute only video tracks in all streams
   *
   * skylink.muteStreams(roomName, {
   *    audioMuted: false,
   *    videoMuted: true
   * });
   * @fires <b>On local peer:</b> {@link SkylinkEvents.event:LOCAL_MEDIA_MUTED|LOCAL MEDIA MUTED} event, {@link SkylinkEvents.event:STREAM_MUTED|STREAM MUTED} event, {@link SkylinkEvents.event:PEER_UPDATED|PEER UPDATED} event with payload parameters <code>isSelf=true</code> and <code>isAudio=true</code> if a local audio stream is muted or <code>isVideo</code> if local video stream is muted.
   * @fires <b>On remote peer:</b> {@link SkylinkEvents.event:STREAM_MUTED|STREAM MUTED} event, {@link SkylinkEvents.event:PEER_UPDATED|PEER UPDATED} event with with parameter payload <code>isSelf=false</code> and <code>isAudio=true</code> if a remote audio stream is muted or <code>isVideo</code> if remote video stream is muted.
   * @alias Skylink#muteStreams
   * @since 0.5.7
   */
  muteStreams(roomName, options = { audioMuted: true, videoMuted: true }, streamId) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return MediaStream.muteStreams(roomState, options, streamId);
    }

    return null;
  }

  /**
   * @description Method that starts a RTMP session. [Beta]
   * <blockquote class="info">
   *   Note that this feature requires MCU to be enabled for the App Key provided in the
   *   {@link initOptions}.
   * </blockquote>
   * @param {String} roomName - The room name.
   * @param {String} streamId - The stream id to live stream for the session.
   * @param {String} endpoint - The RTMP endpoint.
   * @return {Promise<String>} rtmpId - The RTMP session id.
   * @example
   * Example 1: Start a rtmp session
   *
   * skylink.startRTMPSession(roomName, streamId, endpoint)
   * .then(rtmpId => {
   *   // do something
   * })
   * .catch(error => {
   *   // handle error
   * });
   * @fires {@link SkylinkEvents.event:RTMP_STATE|RTMP STATE} event with parameter payload <code>state=START</code>.
   * @alias Skylink#startRTMPSession
   * @since 0.6.36
   */
  startRTMPSession(roomName, streamId, endpoint) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return RTMP.startSession(roomState, streamId, endpoint);
    }

    return null;
  }

  /**
   * @description Method that stops a RTMP session. [Beta]
   * <blockquote class="info">
   *   Note that this feature requires MCU to be enabled for the App Key provided in {@link initOptions}.
   * </blockquote>
   * @param {String} roomName - The room name.
   * @param {String} rtmpId - The RTMP session id.
   * @return {Promise<String>}
   * @example
   * Example 1: Stop rtmp session
   *
   * skylink.stopRTMPSession(roomName, rtmpId)
   * .then(rtmpId => {
   *   // do something
   * })
   * .catch(error => {
   *   // handle error
   * });
   * @fires {@link SkylinkEvents.event:RTMP_STATE|RTMP STATE} event with parameter payload <code>state=STOP</code>.
   * @alias Skylink#stopRTMPSession
   * @since 0.6.36
   */
  stopRTMPSession(roomName, rtmpId) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return RTMP.stopSession(roomState, rtmpId);
    }
    return null;
  }

  /**
     * @typedef {Object} streamSources
     * @property {Object} audio - The list of audio input (microphone) and output (speakers) sources.
     * @property {Array.<Object>} audio.input - The list of audio input (microphone) sources.
     * @property {String} audio.input.deviceId The audio input source item device id.
     * @property {String} audio.input.label The audio input source item device label name.
     * @property {String} [audio.input.groupId] The audio input source item device physical device id.
     * Note that there can be different <code>deviceId</code> due to differing sources but can share a
     * <code>groupId</code> because it's the same device.
     * @property {Array.<Object>} audio.output - The list of audio output (speakers) sources.
     * Object signature matches <code>audio.input</code> format.
     * @property {Object} video - The list of video input (camera) sources.
     * @property {Array.<Object>} video.input - The list of video input (camera) sources.
     * Object signature matches <code>audio.input</code> format.
     */
  /**
   * @description Method that returns the camera and microphone sources.
   * @return {Promise.<streamSources>} outputSources
   * @alias Skylink#getStreamSources
   * @example
   * Example 1: Get media sources before joinRoom - only available on Chrome browsers
   *
   * const audioInputDevices = [];
   * const videoInputDevices = [];
   *
   * skylink.getStreamSources.then((sources) => {
   *   audioInputDevices = sources.audio.input;
   *   videoInputDevices = sources.video.input;
   * }).catch((error) => // handle error);
   *
   * skylink.getUserMedia(roomName, {
   *   audio: {
   *     deviceId: audioInputDevices[0].deviceId,
   *   },
   *   video: {
   *     deviceId: videoInputDevices[0].deviceId,
   *   }
   * }).then((streams) => // do something)
   * .catch((error) => // handle error);
   */
  getStreamSources() {
    return MediaStream.getStreamSources();
  }

  /**
   * @description Method that sends a new <code>userMedia</code> stream to all connected peers in a room.
   * @param {String} roomName - The room name.
   * @param {JSON|MediaStream|Array.<MediaStream>} options - The {@link Skylink#getUserMedia|getUserMedia} <code>options</code> parameter
   * settings. The MediaStream to send to the remote peer or array of MediaStreams.
   * - When provided as a <code>MediaStream</code> object, this configures the <code>options.audio</code> and
   *   <code>options.video</code> based on the tracks available in the <code>MediaStream</code> object.
   *   Object signature matches the <code>options</code> parameter in the
   *   <code>{@link Skylink#getUserMedia|getUserMedia}</code> method</a>.
   * <blockquote class="info">
   *   Note that the <code>MediaStream</code> object should be obtained by using the {@link Skylink#getUserMedia|getUserMedia} method and NOT
   *   <code>navigator.mediaDevices.getUserMedia</code>. Using the latter may result in unintended side effects such as the {@link SkylinkEvents.event:ON_INCOMING_STREAM|ON INCOMING STREAM}
   *   event not triggering as expected.
   * </blockquote>
   * - If options are passed as argument into the method, it resolves with an array of <code>MediaStreams</code>. First item in array is
   * <code>MediaStream</code> of kind audio and second item is <code>MediaStream</code> of kind video. Otherwise it resolves with the array or
   * <code>MediaStream</code>.
   * @return {Promise.<MediaStreams>}
   * @example
   * Example 1: Send new MediaStream with audio and video
   *
   * let sendStream = (roomName) => {
   * const options = { audio: true, video: true };
   *
   * // Add listener to incomingStream event
   * SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ON_INCOMING_STREAM, (evt) => {
   *   const { detail } = evt;
   *   window.attachMediaStream(localVideoEl, detail.stream);
   * })
   *
   * skylink.sendStream(roomName, options)
   *  // streams can also be obtained from resolved promise
   *  .then((streams) => {
   *        if (streams[0]) {
   *          window.attachMediaStream(audioEl, streams[0]); // first item in array is an audio stream
   *        }
   *        if (streams[1]) {
   *          window.attachMediaStream(videoEl, streams[1]); // second item in array is a video stream
   *        }
   *    })
   *   .catch((error) => { console.error(error) });
   * }
   *
   * Example 2: Use pre-fetched media streams
   *
   * const prefetchedStreams = null;
   * skylink.getUserMedia(null, {
   *    audio: { stereo: true },
   *    video: true,
   *    })
   *    .then((streams) => {
   *      prefetchedStream = streams
   * });
   *
   * skylink.sendStream(roomName, prefetchedStreams)
   *   .catch((error) => { console.error(error) });
   * }
   *
   * @fires {@link SkylinkEvents.event:MEDIA_ACCESS_SUCCESS|MEDIA ACCESS SUCCESS} event with parameter payload <code>isScreensharing=false</code> and
   * <code>isAudioFallback=false</code> if <code>userMedia</code> <code>options</code> is passed into
   * <code>sendStream</code> method.
   * @fires {@link SkylinkEvents.event:ON_INCOMING_STREAM|ON INCOMING STREAM} event with parameter payload <code>isSelf=true</code> and
   * <code>stream</code> as <code>userMedia</code> stream.
   * @fires {@link SkylinkEvents.event:PEER_UPDATED|PEER UPDATED} event with parameter payload <code>isSelf=true</code>.
   * @alias Skylink#sendStream
   * @since 0.5.6
   */
  sendStream(roomName, options) {
    const roomState = getRoomStateByName(roomName);

    return MediaStream.sendStream(roomState, options);
  }

  /**
   * @typedef {Object.<String, Object>} streamsList
   * @property {Object.<String, Object>} #peerId - Peer streams info keyed by peer id.
   * @property {Boolean} #peerId.isSelf - The flag if the peer is local or remote.
   * @property {Object} #peerId.streams - The peer streams.
   * @property {Object} #peerId.streams.audio - The peer audio streams keyed by streamId.
   * @property {MediaStream} #peerId.streams.audio#streamId - streams keyed by stream id.
   * @property {Object} #peerId.streams.video - The peer video streams keyed by streamId.
   * @property {MediaStream} #peerId.streams.video#streamId - streams keyed by stream id.
   * @property {Object} #peerId.streams.screenShare - The peer screen share streams keyed by streamId.
   * @property {MediaStream} #peerId.streams.screenShare#streamId - streams keyed by stream id.
   */
  /**
   * @description Method that returns the list of connected peers streams in the room both user media streams and screen share streams.
   * @param {String} roomName - The room name.
   * @param {Boolean} [includeSelf=true] - The flag if self streams are included.
   * @return {JSON.<String, streamsList>} - The list of peer stream objects keyed by peer id.
   * @example
   * Example 1: Get the list of current peers streams in the same room
   *
   * const streams = skylink.getStreams("Room_1");
   * @alias Skylink#getStreams
   * @since 0.6.16
   */
  getStreams(roomName, includeSelf = true) {
    const roomState = getRoomStateByName(roomName);
    if (roomState) {
      return MediaStream.getStreams(roomState, includeSelf);
    }

    return null;
  }

  /**
   * @description Method that generates an <a href="https://en.wikipedia.org/wiki/Universally_unique_identifier">UUID</a> (Unique ID).
   * @return {String} Returns a generated UUID (Unique ID).
   * @alias Skylink#generateUUID
   * @since 0.5.9
   */
  generateUUID() {
    return generateUUID();
  }

  /**
   * @description Method that stores a secret and secret id pair used for encrypting and decrypting messages.
   * @param {String} roomName - The room name.
   * @param {String} secret - A secret to use for encrypting and decrypting messages.
   * @param {String} secretId - The id of the secret.
   * @alias Skylink#setEncryptSecret
   * @since 2.0.0
   */
  setEncryptSecret(roomName = '', secret = '', secretId = '') {
    const roomState = getRoomStateByName(roomName);
    const encryption = new EncryptedMessaging(roomState);
    return encryption.setEncryptSecret(secret, secretId);
  }

  /**
   * @description Method that returns all the secret and secret id pairs.
   * @param {String} roomName - The room name.
   * @returns {Object|{}}
   * @alias Skylink#getEncryptSecrets
   * @since 2.0.0
   */
  getEncryptSecrets(roomName = '') {
    const roomState = getRoomStateByName(roomName);
    const encryption = new EncryptedMessaging(roomState);
    return encryption.getEncryptSecrets();
  }

  /**
   * @description Method that deletes an encrypt secret.
   * @param {String} roomName - The room name.
   * @param {String} [secretId] - The id of the secret to be deleted. If no secret id is provided, all secrets will be deleted.
   * @alias Skylink#deleteEncryptSecrets
   * @since 2.0.0
   */
  deleteEncryptSecrets(roomName = '', secretId = '') {
    const roomState = getRoomStateByName(roomName);
    const encryption = new EncryptedMessaging(roomState);
    return encryption.deleteEncryptSecrets(secretId);
  }

  /**
   * @description Method that sets the secret to be used in encrypting and decrypting messages.
   * @param {String} roomName - The room name.
   * @param {String} secretId - The id of the secret to be used for encrypting and decrypting messages.
   * @alias Skylink#setSelectedSecret
   * @since 2.0.0
   */
  setSelectedSecret(roomName = '', secretId = '') {
    const roomState = getRoomStateByName(roomName);
    const encryption = new EncryptedMessaging(roomState);
    encryption.setSelectedSecretId(secretId);
  }

  /**
   * @description Method that returns the secret used in encrypting and decrypting messages.
   * @param {String} roomName - The room name.
   * @param {String} secretId - The id of the secret.
   * @returns {String} secret - The secret used for encrypting and decrypting messages.
   * @alias Skylink#getSelectedSecret
   * @since 2.0.0
   */
  getSelectedSecret(roomName, secretId) {
    const roomState = getRoomStateByName(roomName);
    const encryption = new EncryptedMessaging(roomState);
    return encryption.getSelectedSecretId(secretId);
  }

  /**
   * @description Method that overrides the persistent message feature configured at the key level.
   * <blockquote class="info">
   *   Note that to set message persistence at the app level, the persistent message feature MUST be enabled at the key level in the Temasys
   *   Developers Console. Messages will also only be persisted if the messages are encrypted, are public messages and, are sent via the signaling
   *   server using the {@link Skylink#sendMessage|sendMessage} method.
   * </blockquote>
   * @param {String} roomName - The room name.
   * @param {Boolean} isPersistent - The flag if messages should be persisted.
   * @alias Skylink#setMessagePersistence
   * @since 2.0.0
   */
  setMessagePersistence(roomName, isPersistent) {
    const roomState = getRoomStateByName(roomName);
    const asyncMessaging = new AsyncMessaging(roomState);
    return asyncMessaging.setMessagePersistence(isPersistent);
  }

  /**
   * @description Method that retrieves the persistent message feature configured.
   * @param {String} roomName - The room name.
   * @returns {Boolean} isPersistent
   * @alias Skylink#getMessagePersistence
   * @since 2.0.0
   */
  getMessagePersistence(roomName) {
    const roomState = getRoomStateByName(roomName);
    const asyncMessaging = new AsyncMessaging(roomState);
    return asyncMessaging.getMessagePersistence();
  }

  /**
   * @description Method that retrieves the sdk version.
   * @alias Skylink#getSdkVersion
   * @since 2.1.6
   */
  getSdkVersion() {
    return SDK_VERSION;
  }

  /**
   * @typedef {Object.<String, Object>} dataTransferResult
   * @property {Object} #peerId - Data transfer success or error result keyed by peer id.
   * @property {transferInfo} [#peerId.success] - The success return object. Will not be present in the return object if the transfer fails.
   * @property {Error|String} [#peerId.error] - The error return object. Will not be present in the return object if the transfer succeeds.
   * @property {String} #peerId.transferType - The transfer type.
   */
  /**
   * @description Method that sends a Blob to all connected peers in the room.
   * @param {String} roomName - The room name
   * @param {Blob} data - The Blob object
   * @param {String|Array} [peerId] - The peer ID or array of peer IDs. When not provided, it will start uploading data transfers with all peers in
   * the room
   * @param {Number} [timeout = 60] - The duration for which to wait for a response from the remote peer before terminating the transfer
   * @return {Promise<dataTransferResult>} - Always resolves with success or error object.
   * @example
   * Example 1: Send a file
   *
   * // Add listener to incomingStream event
   * SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.DATA_TRANSFER_STATE, (evt) => {
   *   const { state } = evt.detail;
   *
   *   switch (state) {
   *     case SkylinkConstants.DATA_TRANSFER_STATE.UPLOAD_REQUEST:
   *     // Alert peer that a file transfer is requested
   *     // Record user response and call <code>respondBlobRequest</code>
   *     skylink.respondBlobRequest(config.defaultRoom, peerId, transferId, result)
   *      .then((result) => // handle success or error)
   *      .catch((err) => // handle error)
   *     break;
   *     case SkylinkConstants.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED:
   *     // Surface download link to user
   *     break;
   *   }
   * })
   *
   * skylink.sendBlobData(roomName, data)
   *  .then((result) => {
   *        // always resolves with success or error object
   *    })
   *   .catch((error) => // handle error);
   * }
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>USER_UPLOAD_REQUEST</code> on the local peer.
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>UPLOAD_REQUEST</code> on the remote peer.
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>UPLOAD_STARTED</code> when remote peer accepts data transfer.
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>REJECTED</code> when remote peer rejects data transfer.
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>UPLOADING</code> when data is in the process of being transferred.
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>UPLOAD_COMPLETED</code> when data transfer has completed.
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>ERROR</code> when data transfer timeout limit is reached.
   * @alias Skylink#sendBlobData
   * @since 2.0.0
   */
  sendBlobData(roomName, data, peerId, timeout) {
    const roomState = getRoomStateByName(roomName);
    return DataTransfer.sendBlobData(roomState, data, peerId, timeout);
  }

  /**
   * @description Method that responds to a <code>sendBlobData</code> request.
   * @param {String} roomName - The room name.
   * @param {String} peerId - The Peer Id.
   * @param {String }transferId - The transfer Id.
   * @param {Boolean} accept - The flag if the data transfer is accepted by the user.
   * @return {Promise<dataTransferResult>} - Always resolves with success or error object.
   *
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>DOWNLOAD_STARTED</code> when user accepts the data transfer request.
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>USER_REJECTED</code> when user rejects the data transfer request.
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>DOWNLOADING</code> when data is in the process of being transferred.
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>DOWNLOAD_COMPLETED</code> when data transfer has completed.
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>ERROR</code> when data transfer timeout limit is reached.
   * @alias Skylink#respondBlobRequest
   * @since 2.0.0
   */
  respondBlobRequest(roomName, peerId, transferId, accept) {
    const roomState = getRoomStateByName(roomName);
    return DataTransfer.acceptDataTransfer(roomState, peerId, transferId, accept);
  }

  /**
   * @description Method that cancels a data transfer
   * @param {String} roomName - The room name.
   * @param {String} peerId - The Peer Id.
   * @param {String} transferId - The Transfer Id to cancel.
   * @return {Promise<{peerId, transferId}|Error>}
   *
   * @fires {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} event with <code>state</code> value as <code>CANCEL</code>.
   * @alias Skylink#cancelBlobTransfer
   * @since 2.0.0
   */
  cancelBlobTransfer(roomName, peerId, transferId) {
    const roomState = getRoomStateByName(roomName);
    return DataTransfer.cancelBlobTransfer(roomState, peerId, transferId);
  }
}

export default SkylinkPublicInterface;
