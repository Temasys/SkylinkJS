/**
 * Syntactically private variables and utility functions.
 * @attribute _EVENTS
 * @type JSON
 * @private
 * @final
 * @required
 * @component Events
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._EVENTS = {
  /**
   * Event fired when the socket connection to the signaling
   * server is open.
   * @event channelOpen
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  channelOpen: [],

  /**
   * Event fired when the socket connection to the signaling
   * server has closed.
   * @event channelClose
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  channelClose: [],

  /**
   * Event fired when the socket connection received a message
   * from the signaling server.
   * @event channelMessage
   * @param {JSON} message
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  channelMessage: [],

  /**
   * Event fired when the socket connection has occurred an error.
   * @event channelError
   * @param {Object|String} error Error message or object thrown.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  channelError: [],

  /**
   * Event fired when the socket re-tries to connection with fallback ports.
   * @event channelRetry
   * @param {String} fallbackType The type of fallback [Rel: Skylink.SOCKET_FALLBACK]
   * @param {Integer} currentAttempt The current attempt of the fallback re-try attempt.
   * @component Events
   * @for Skylink
   * @since 0.5.6
   */
  channelRetry: [],

  /**
   * Event fired when the socket connection failed connecting.
   * - The difference between this and <b>channelError</b> is that
   *   channelError triggers during the connection. This throws
   *   when connection failed to be established.
   * @event socketError
   * @param {String} errorCode The error code.
   *   [Rel: Skylink.SOCKET_ERROR]
   * @param {Integer|String|Object} error The reconnection attempt or error object.
   * @param {String} fallbackType The type of fallback [Rel: Skylink.SOCKET_FALLBACK]
   * @component Events
   * @for Skylink
   * @since 0.5.5
   */
  socketError: [],

  /**
   * Event fired whether the room is ready for use.
   * @event readyStateChange
   * @param {String} readyState [Rel: Skylink.READY_STATE_CHANGE]
   * @param {JSON} error Error object thrown.
   * @param {Integer} error.status Http status when retrieving information.
   *   May be empty for other errors.
   * @param {String} error.content Error message.
   * @param {Integer} error.errorCode Error code.
   *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
   * @component Events
   * @for Skylink
   * @since 0.4.0
   */
  readyStateChange: [],

  /**
   * Event fired when a peer's handshake progress has changed.
   * @event handshakeProgress
   * @param {String} step The handshake progress step.
   *   [Rel: Skylink.HANDSHAKE_PROGRESS]
   * @param {String} peerId PeerId of the peer's handshake progress.
   * @param {Object|String} error Error message or object thrown.
   * @component Events
   * @for Skylink
   * @since 0.3.0
   */
  handshakeProgress: [],

  /**
   * Event fired when an ICE gathering state has changed.
   * @event candidateGenerationState
   * @param {String} state The ice candidate generation state.
   *   [Rel: Skylink.CANDIDATE_GENERATION_STATE]
   * @param {String} peerId PeerId of the peer that had an ice candidate
   *    generation state change.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  candidateGenerationState: [],

  /**
   * Event fired when a peer Connection state has changed.
   * @event peerConnectionState
   * @param {String} state The peer connection state.
   *   [Rel: Skylink.PEER_CONNECTION_STATE]
   * @param {String} peerId PeerId of the peer that had a peer connection state
   *    change.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  peerConnectionState: [],

  /**
   * Event fired when an ICE connection state has changed.
   * @iceConnectionState
   * @param {String} state The ice connection state.
   *   [Rel: Skylink.ICE_CONNECTION_STATE]
   * @param {String} peerId PeerId of the peer that had an ice connection state change.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  iceConnectionState: [],

  /**
   * Event fired when webcam or microphone media access fails.
   * @event mediaAccessError
   * @param {Object|String} error Error object thrown.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessError: [],

  /**
   * Event fired when webcam or microphone media acces passes.
   * @event mediaAccessSuccess
   * @param {Object} stream MediaStream object.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessSuccess: [],

  /**
   * Event fired when it's required to have audio or video access.
   * @event mediaAccessRequired
   * @component Events
   * @for Skylink
   * @since 0.5.5
   */
  mediaAccessRequired: [],

  /**
   * Event fired when media access to MediaStream has stopped.
   * @event mediaAccessStopped
   * @component Events
   * @for Skylink
   * @since 0.5.6
   */
  mediaAccessStopped: [],

  /**
   * Event fired when a peer joins the room.
   * @event peerJoined
   * @param {String} peerId PeerId of the peer that joined the room.
   * @param {JSON} peerInfo Peer's information.
   * @param {JSON} peerInfo.settings Peer's stream settings.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] Peer's audio stream
   *   settings.
   * @param {Boolean} [peerInfo.settings.audio.stereo=false] If peer has stereo
   *   enabled or not.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] Peer's video stream
   *   settings.
   * @param {JSON} [peerInfo.settings.video.resolution]
   *   Peer's video stream resolution [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Integer} [peerInfo.settings.video.resolution.width]
   *   Peer's video stream resolution width.
   * @param {Integer} [peerInfo.settings.video.resolution.height]
   *   Peer's video stream resolution height.
   * @param {Integer} [peerInfo.settings.video.frameRate]
   *   Peer's video stream resolution minimum frame rate.
   * @param {JSON} peerInfo.mediaStatus Peer stream status.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] If peer's audio
   *   stream is muted.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] If peer's video
   *   stream is muted.
   * @param {JSON|String} peerInfo.userData Peer's custom user data.
   * @param {JSON} peerInfo.agent Peer's browser agent.
   * @param {String} peerInfo.agent.name Peer's browser agent name.
   * @param {Integer} peerInfo.agent.version Peer's browser agent version.
   * @param {Boolean} isSelf Is the peer self.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  peerJoined: [],

  /**
   * Event fired when a peer's connection is restarted.
   * @event peerRestart
   * @param {String} peerId PeerId of the peer that is being restarted.
   * @param {JSON} peerInfo Peer's information.
   * @param {JSON} peerInfo.settings Peer's stream settings.
   * @param {Boolean|JSON} peerInfo.settings.audio Peer's audio stream
   *   settings.
   * @param {Boolean} peerInfo.settings.audio.stereo If peer has stereo
   *   enabled or not.
   * @param {Boolean|JSON} peerInfo.settings.video Peer's video stream
   *   settings.
   * @param {JSON} peerInfo.settings.video.resolution
   *   Peer's video stream resolution [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Integer} peerInfo.settings.video.resolution.width
   *   Peer's video stream resolution width.
   * @param {Integer} peerInfo.settings.video.resolution.height
   *   Peer's video stream resolution height.
   * @param {Integer} peerInfo.settings.video.frameRate
   *   Peer's video stream resolution minimum frame rate.
   * @param {JSON} peerInfo.mediaStatus Peer stream status.
   * @param {Boolean} peerInfo.mediaStatus.audioMuted If peer's audio
   *   stream is muted.
   * @param {Boolean} peerInfo.mediaStatus.videoMuted If peer's video
   *   stream is muted.
   * @param {JSON|String} peerInfo.userData Peer's custom user data.
   * @param {JSON} peerInfo.agent Peer's browser agent.
   * @param {String} peerInfo.agent.name Peer's browser agent name.
   * @param {Integer} peerInfo.agent.version Peer's browser agent version.
   * @param {Boolean} isSelfInitiateRestart Is it us who initiated the restart.
   * @component Events
   * @for Skylink
   * @since 0.5.5
   */
  peerRestart: [],

  /**
   * Event fired when a peer information is updated.
   * @event peerUpdated
   * @param {String} peerId PeerId of the peer that had information updaed.
   * @param {JSON} peerInfo Peer's information.
   * @param {JSON} peerInfo.settings Peer's stream settings.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] Peer's audio stream
   *   settings.
   * @param {Boolean} [peerInfo.settings.audio.stereo=false] If peer has stereo
   *   enabled or not.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] Peer's video stream
   *   settings.
   * @param {JSON} [peerInfo.settings.video.resolution]
   *   Peer's video stream resolution [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Integer} [peerInfo.settings.video.resolution.width]
   *   Peer's video stream resolution width.
   * @param {Integer} [peerInfo.settings.video.resolution.height]
   *   Peer's video stream resolution height.
   * @param {Integer} [peerInfo.settings.video.frameRate]
   *   Peer's video stream resolution minimum frame rate.
   * @param {JSON} peerInfo.mediaStatus Peer stream status.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] If peer's audio
   *   stream is muted.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] If peer's video
   *   stream is muted.
   * @param {JSON|String} peerInfo.userData Peer's custom user data.
   * @param {JSON} peerInfo.agent Peer's browser agent.
   * @param {String} peerInfo.agent.name Peer's browser agent name.
   * @param {Integer} peerInfo.agent.version Peer's browser agent version.
   * @param {Boolean} isSelf Is the peer self.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  peerUpdated: [],

  /**
   * Event fired when a peer leaves the room
   * @event peerLeft
   * @param {String} peerId PeerId of the peer that left.
   * @param {JSON} peerInfo Peer's information.
   * @param {JSON} peerInfo.settings Peer's stream settings.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] Peer's audio stream
   *   settings.
   * @param {Boolean} [peerInfo.settings.audio.stereo=false] If peer has stereo
   *   enabled or not.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] Peer's video stream
   *   settings.
   * @param {JSON} [peerInfo.settings.video.resolution]
   *   Peer's video stream resolution [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Integer} [peerInfo.settings.video.resolution.width]
   *   Peer's video stream resolution width.
   * @param {Integer} [peerInfo.settings.video.resolution.height]
   *   Peer's video stream resolution height.
   * @param {Integer} [peerInfo.settings.video.frameRate]
   *   Peer's video stream resolution minimum frame rate.
   * @param {JSON} peerInfo.mediaStatus Peer stream status.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] If peer's audio
   *   stream is muted.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] If peer's video
   *   stream is muted.
   * @param {JSON|String} peerInfo.userData Peer's custom user data.
   * @param {JSON} peerInfo.agent Peer's browser agent.
   * @param {String} peerInfo.agent.name Peer's browser agent name.
   * @param {Integer} peerInfo.agent.version Peer's browser agent version.
   * @param {Boolean} isSelf Is the peer self.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  peerLeft: [],

  /**
   * Event fired when a remote stream has become available.
   * - This occurs after the user joins the room.
   * - This is changed from <b>addPeerStream</b> event.
   * - Note that <b>addPeerStream</b> is removed from the specs.
   * - There has been a documentation error whereby the stream it is
   *   supposed to be (stream, peerId, isSelf), but instead is received
   *   as (peerId, stream, isSelf) in 0.5.0.
   * @event incomingStream
   * @param {String} peerId PeerId of the peer that is sending the stream.
   * @param {Object} stream MediaStream object.
   * @param {Boolean} isSelf Is the peer self.
   * @param {JSON} peerInfo Peer's information.
   * @component Events
   * @for Skylink
   * @since 0.5.5
   */
  incomingStream: [],

  /**
   * Event fired when a message being broadcasted is received.
   * - This is changed from <b>chatMessageReceived</b>,
   *   <b>privateMessage</b> and <b>publicMessage</b> event.
   * - Note that <b>chatMessageReceived</b>, <b>privateMessage</b>
   *   and <b>publicMessage</b> is removed from the specs.
   * @event incomingMessage
   * @param {JSON} message Message object that is received.
   * @param {JSON|String} message.content Data that is broadcasted.
   * @param {String} message.senderPeerId PeerId of the sender peer.
   * @param {String} message.targetPeerId PeerId that is specifically
   *   targeted to receive the message.
   * @param {Boolean} message.isPrivate Is data received a private message.
   * @param {Boolean} message.isDataChannel Is data received from a
   *   data channel.
   * @param {String} peerId PeerId of the sender peer.
   * @param {JSON} peerInfo Peer's information.
   * @param {JSON} peerInfo.settings Peer's stream settings.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] Peer's audio stream
   *   settings.
   * @param {Boolean} [peerInfo.settings.audio.stereo=false] If peer has stereo
   *   enabled or not.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] Peer's video stream
   *   settings.
   * @param {JSON} [peerInfo.settings.video.resolution]
   *   Peer's video stream resolution [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Integer} [peerInfo.settings.video.resolution.width]
   *   Peer's video stream resolution width.
   * @param {Integer} [peerInfo.settings.video.resolution.height]
   *   Peer's video stream resolution height.
   * @param {Integer} [peerInfo.settings.video.frameRate]
   *   Peer's video stream resolution minimum frame rate.
   * @param {JSON} peerInfo.mediaStatus Peer stream status.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] If peer's audio
   *   stream is muted.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] If peer's video
   *   stream is muted.
   * @param {JSON|String} peerInfo.userData Peer's custom user data.
   * @param {JSON} peerInfo.agent Peer's browser agent.
   * @param {String} peerInfo.agent.name Peer's browser agent name.
   * @param {Integer} peerInfo.agent.version Peer's browser agent version.
   * @param {Boolean} isSelf Is the peer self.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  incomingMessage: [],

  /**
   * Event fired when connected to a room and the lock status has changed.
   * @event roomLock
   * @param {Boolean} isLocked Is the room locked.
   * @param {String} peerId PeerId of the peer that is locking/unlocking
   *   the room.
   * @param {JSON} peerInfo Peer's information.
   * @param {JSON} peerInfo.settings Peer's stream settings.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] Peer's audio stream
   *   settings.
   * @param {Boolean} [peerInfo.settings.audio.stereo=false] If peer has stereo
   *   enabled or not.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] Peer's video stream
   *   settings.
   * @param {JSON} [peerInfo.settings.video.resolution]
   *   Peer's video stream resolution [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Integer} [peerInfo.settings.video.resolution.width]
   *   Peer's video stream resolution width.
   * @param {Integer} [peerInfo.settings.video.resolution.height]
   *   Peer's video stream resolution height.
   * @param {Integer} [peerInfo.settings.video.frameRate]
   *   Peer's video stream resolution minimum frame rate.
   * @param {JSON} peerInfo.mediaStatus Peer stream status.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] If peer's audio
   *   stream is muted.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] If peer's video
   *   stream is muted.
   * @param {JSON|String} peerInfo.userData Peer's custom user data.
   * @param {JSON} peerInfo.agent Peer's browser agent.
   * @param {String} peerInfo.agent.name Peer's browser agent name.
   * @param {Integer} peerInfo.agent.version Peer's browser agent version.
   * @param {Boolean} isSelf Is the peer self.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  roomLock: [],

  /**
   * Event fired when a peer's datachannel state has changed.
   * @event dataChannelState
   * @param {String} state The datachannel state.
   *   [Rel: Skylink.DATA_CHANNEL_STATE]
   * @param {String} peerId PeerId of peer that has a datachannel
   *   state change.
   * @param {String} [error] Error message in case there is failure
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  dataChannelState: [],

  /**
   * Event fired when a data transfer state has changed.
   * - Note that <u>transferInfo.data</u> sends the blob data, and
   *   no longer a blob url.
   * @event dataTransferState
   * @param {String} state The data transfer state.
   *   [Rel: Skylink.DATA_TRANSFER_STATE]
   * @param {String} transferId TransferId of the data.
   * @param {String} peerId PeerId of the peer that has a data
   *   transfer state change.
   * @param {JSON} transferInfo Data transfer information.
   * @param {JSON} transferInfo.percentage The percetange of data being
   *   uploaded / downloaded.
   * @param {JSON} transferInfo.senderPeerId PeerId of the sender.
   * @param {JSON} transferInfo.data The blob data. See the
   *   [createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL)
   *   method on how you can convert the blob to a download link.
   * @param {JSON} transferInfo.name Data name.
   * @param {JSON} transferInfo.size Data size.
   * @param {JSON} error The error object.
   * @param {String} error.message Error message thrown.
   * @param {String} error.transferType Is error from uploading or downloading.
   *   [Rel: Skylink.DATA_TRANSFER_TYPE]
   * @component Events
   * @for Skylink
   * @since 0.4.1
   */
  dataTransferState: [],

  /**
   * Event fired when the signaling server warns the user.
   * @event systemAction
   * @param {String} action The action that is required for
   *   the user to follow. [Rel: Skylink.SYSTEM_ACTION]
   * @param {String} message The reason for the action.
   * @param {String} reason The reason why the action is given.
   *   [Rel: Skylink.SYSTEM_ACTION_REASON]
   * @component Events
   * @for Skylink
   * @since 0.5.1
   */
  systemAction: []
};

/**
 * Events with callbacks that would be fired only once once condition is met.
 * @attribute _onceEvents
 * @type JSON
 * @private
 * @required
 * @component Events
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._onceEvents = {};

/**
 * The timestamp for throttle function to use.
 * @attribute _timestamp
 * @type JSON
 * @private
 * @required
 * @component Events
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._timestamp = {
  now: Date.now() || function() { return +new Date(); }
};

/**
 * Trigger all the callbacks associated with an event.
 * - Note that extra arguments can be passed to the callback which
 *   extra argument can be expected by callback is documented by each event.
 * @method _trigger
 * @param {String} eventName The Skylink event.
 * @for Skylink
 * @private
 * @component Events
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._trigger = function(eventName) {
  //convert the arguments into an array
  var args = Array.prototype.slice.call(arguments);
  var arr = this._EVENTS[eventName];
  var once = this._onceEvents[eventName] || null;
  args.shift(); //Omit the first argument since it's the event name
  if (arr) {
    // for events subscribed forever
    for (var i = 0; i < arr.length; i++) {
      try {
        log.log([null, 'Event', eventName, 'Event is fired']);
        if(arr[i].apply(this, args) === false) {
          break;
        }
      } catch(error) {
        log.error([null, 'Event', eventName, 'Exception occurred in event:'], error);
        throw error;
      }
    }
  }
  if (once){
    // for events subscribed on once
    for (var j = 0; j < once.length; j++) {
      if (once[j][1].apply(this, args) === true) {
        log.log([null, 'Event', eventName, 'Condition is met. Firing event']);
        if(once[j][0].apply(this, args) === false) {
          break;
        }
        if (!once[j][2]) {
          log.log([null, 'Event', eventName, 'Removing event after firing once']);
          once.splice(j, 1);
          //After removing current element, the next element should be element of the same index
          j--;
        }
      } else {
        log.log([null, 'Event', eventName, 'Condition is still not met. ' +
          'Holding event from being fired']);
      }
    }
  }

  log.log([null, 'Event', eventName, 'Event is triggered']);
};

/**
 * To register a callback function to an event.
 * @method on
 * @param {String} eventName The Skylink event. See the event list to see what you can register.
 * @param {Function} callback The callback fired after the event is triggered.
 * @example
 *   SkylinkDemo.on('peerJoined', function (peerId, peerInfo) {
 *      alert(peerId + ' has joined the room');
 *   });
 * @component Events
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.on = function(eventName, callback) {
  if ('function' === typeof callback) {
    this._EVENTS[eventName] = this._EVENTS[eventName] || [];
    this._EVENTS[eventName].push(callback);
    log.log([null, 'Event', eventName, 'Event is subscribed']);
  } else {
    log.error([null, 'Event', eventName, 'Provided parameter is not a function']);
  }
};

/**
 * To register a callback function to an event that is fired once a condition is met.
 * @method once
 * @param {String} eventName The Skylink event. See the event list to see what you can register.
 * @param {Function} callback The callback fired after the event is triggered.
 * @param {Function} [condition]
 *   The provided condition that would trigger this event.
 *   If not provided, it will return true when the event is triggered.
 *   Return a true to fire the callback.
 * @param {Boolean} [fireAlways=false] The function does not get removed onced triggered,
 *   but triggers everytime the event is called.
 * @example
 *   SkylinkDemo.once('peerConnectionState', function (state, peerId) {
 *     alert('Peer has left');
 *   }, function (state, peerId) {
 *     return state === SkylinkDemo.PEER_CONNECTION_STATE.CLOSED;
 *   });
 * @component Events
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype.once = function(eventName, callback, condition, fireAlways) {
  if (typeof condition === 'boolean') {
    fireAlways = condition;
    condition = null;
  }
  fireAlways = (typeof fireAlways === 'undefined' ? false : fireAlways);
  condition = (typeof condition !== 'function') ? function () {
    return true;
  } : condition;

  if (typeof callback === 'function') {

    this._EVENTS[eventName] = this._EVENTS[eventName] || [];
    // prevent undefined error
    this._onceEvents[eventName] = this._onceEvents[eventName] || [];
    this._onceEvents[eventName].push([callback, condition, fireAlways]);
    log.log([null, 'Event', eventName, 'Event is subscribed on condition']);
  } else {
    log.error([null, 'Event', eventName, 'Provided callback is not a function']);
  }
};

/**
 * To unregister a callback function from an event.
 * @method off
 * @param {String} eventName The Skylink event. See the event list to see what you can unregister.
 * @param {Function} callback The callback fired after the event is triggered.
 *   Not providing any callback turns all callbacks tied to that event off.
 * @example
 *   SkylinkDemo.off('peerJoined', callback);
 * @component Events
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.off = function(eventName, callback) {
  if (callback === undefined) {
    this._EVENTS[eventName] = [];
    this._onceEvents[eventName] = [];
    log.log([null, 'Event', eventName, 'All events are unsubscribed']);
    return;
  }
  var arr = this._EVENTS[eventName];
  var once = this._onceEvents[eventName];

  // unsubscribe events that is triggered always
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === callback) {
      log.log([null, 'Event', eventName, 'Event is unsubscribed']);
      arr.splice(i, 1);
      break;
    }
  }
  // unsubscribe events fired only once
  if(once !== undefined) {
    for (var j = 0; j < once.length; j++) {
      if (once[j][0] === callback) {
        log.log([null, 'Event', eventName, 'One-time Event is unsubscribed']);
        once.splice(j, 1);
        break;
      }
    }
  }
};

/**
 * Does a check condition first to check if event is required to be subscribed.
 * If check condition fails, it subscribes an event with
 *  {{#crossLink "Skylink/once:method"}}once(){{/crossLink}} method to wait for
 * the condition to pass to fire the callback.
 * @method _condition
 * @param {String} eventName The Skylink event.
 * @param {Function} callback The callback fired after the condition is met.
 * @param {Function} checkFirst The condition to check that if pass, it would fire the callback,
 *   or it will just subscribe to an event and fire when condition is met.
 * @param {Function} [condition]
 *   The provided condition that would trigger this event.
 *   If not provided, it will return true when the event is triggered.
 *   Return a true to fire the callback.
 * @param {Boolean} [fireAlways=false] The function does not get removed onced triggered,
 *   but triggers everytime the event is called.
 * @private
 * @component Events
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._condition = function(eventName, callback, checkFirst, condition, fireAlways) {
  if (typeof condition === 'boolean') {
    fireAlways = condition;
    condition = null;
  }
  if (typeof callback === 'function' && typeof checkFirst === 'function') {
    if (checkFirst()) {
      log.log([null, 'Event', eventName, 'First condition is met. Firing callback']);
      callback();
      return;
    }
    log.log([null, 'Event', eventName, 'First condition is not met. Subscribing to event']);
    this.once(eventName, callback, condition, fireAlways);
  } else {
    log.error([null, 'Event', eventName, 'Provided callback or checkFirst is not a function']);
  }
};

/**
 * Sets an interval check. If condition is met, fires callback.
 * @method _wait
 * @param {Function} callback The callback fired after the condition is met.
 * @param {Function} condition The provided condition that would trigger this the callback.
 * @param {Integer} [intervalTime=50] The interval loop timeout.
 * @for Skylink
 * @private
 * @component Events
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._wait = function(callback, condition, intervalTime, fireAlways) {
  fireAlways = (typeof fireAlways === 'undefined' ? false : fireAlways);
  if (typeof callback === 'function' && typeof condition === 'function') {
    if (condition()) {
      log.log([null, 'Event', null, 'Condition is met. Firing callback']);
      callback();
      return;
    }
    log.log([null, 'Event', null, 'Condition is not met. Doing a check.']);

    intervalTime = (typeof intervalTime === 'number') ? intervalTime : 50;

    var doWait = setInterval(function () {
      if (condition()) {
        log.log([null, 'Event', null, 'Condition is met after waiting. Firing callback']);
        if (!fireAlways){
          clearInterval(doWait);
        }
        callback();
      }
    }, intervalTime);
  } else {
    if (typeof callback !== 'function'){
      log.error([null, 'Event', null, 'Provided callback is not a function']);
    }
    if (typeof condition !== 'function'){
      log.error([null, 'Event', null, 'Provided condition is not a function']);
    }
  }
};

/**
 * Returns a wrapper of the original function, which only fires once during
 *  a specified amount of time.
 * @method _throttle
 * @param {Function} func The function that should be throttled.
 * @param {Integer} wait The amount of time that function need to throttled (in ms)
 * @private
 * @component Events
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._throttle = function(func, wait){
  var self = this;
  return function () {
      if (!self._timestamp.func){
        //First time run, need to force timestamp to skip condition
        self._timestamp.func = self._timestamp.now - wait;
      }
      var now = Date.now();
      if (now - self._timestamp.func < wait) {
          return;
      }
      func.apply(self, arguments);
      self._timestamp.func = now;
  };
};