/**
 * Function that overwrites the User current custom data.
 * @method setUserData
 * @param {JSON|String} userData The updated custom data.
 * @trigger <ol class="desc-seq">
 *   <li>Updates User custom data. <ol>
 *   <li>If User is in Room: <ol>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers with parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li></ol></li></ol></li></ol>
 * @example
 *   // Example 1: Set/Update User custom data before joinRoom()
 *   var userData = "beforejoin";
 *
 *   skylinkDemo.setUserData(userData);
 *
 *   skylinkDemo.joinRoom(function (error, success) {
 *      if (error) return;
 *      if (success.peerInfo.userData === userData) {
 *        console.log("User data is sent");
 *      }
 *   });
 *
 *   // Example 2: Update User custom data after joinRoom()
 *   var userData = "afterjoin";
 *
 *   skylinkDemo.joinRoom(function (error, success) {
 *     if (error) return;
 *     skylinkDemo.setUserData(userData);
 *     if (skylinkDemo.getPeerInfo().userData === userData) {
 *       console.log("User data is updated and sent");
 *     }
 *   });
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.setUserData = function(userData) {
  var self = this;
  var updatedUserData = '';

  if (!(typeof userData === 'undefined' || userData === null)) {
    updatedUserData = userData;
  }

  this._userData = updatedUserData;

  if (self._inRoom) {
    log.log('Updated userData -> ', updatedUserData);
    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.UPDATE_USER,
      mid: self._user.sid,
      rid: self._room.id,
      userData: updatedUserData,
      stamp: (new Date()).getTime()
    });
    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
  } else {
    log.warn('User is not in the room. Broadcast of updated information will be dropped');
  }
};

/**
 * Function that returns the User / Peer current custom data.
 * @method getUserData
 * @param {String} [peerId] The Peer ID to return the current custom data from.
 * - When not provided or that the Peer ID is does not exists, it will return
 *   the User current custom data.
 * @return {JSON|String} The User / Peer current custom data.
 * @example
 *   // Example 1: Get Peer current custom data
 *   var peerUserData = skylinkDemo.getUserData(peerId);
 *
 *   // Example 2: Get User current custom data
 *   var userUserData = skylinkDemo.getUserData();
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.getUserData = function(peerId) {
  if (peerId && this._peerInformations[peerId]) {
    var userData = this._peerInformations[peerId].userData;
    if (!(userData !== null && typeof userData !== 'undefined')) {
      userData = '';
    }
    return userData;
  }
  return this._userData;
};

/**
 * Function that returns the User / Peer current session information.
 * @method getPeerInfo
 * @param {String} [peerId] The Peer ID to return the current session information from.
 * - When not provided or that the Peer ID is does not exists, it will return
 *   the User current session information.
 * @return {JSON} The User / Peer current session information.
 *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
 * @example
 *   // Example 1: Get Peer current session information
 *   var peerPeerInfo = skylinkDemo.getPeerInfo(peerId);
 *
 *   // Example 2: Get User current session information
 *   var userPeerInfo = skylinkDemo.getPeerInfo();
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.getPeerInfo = function(peerId) {
  var self = this;
  var peerInfo = null;

  if (typeof peerId === 'string' && typeof this._peerInformations[peerId] === 'object') {
    peerInfo = clone(this._peerInformations[peerId]);
    peerInfo.room = clone(this._selectedRoom);
    peerInfo.settings.bandwidth = peerInfo.settings.bandwidth || {};
    peerInfo.settings.googleXBandwidth = peerInfo.settings.googleXBandwidth || {};
    peerInfo.mediaStatus = this._peerInformations[peerId].mediaStatus;

    if (peerInfo.settings.maxBandwidth) {
      peerInfo.settings.bandwidth = clone(peerInfo.settings.maxBandwidth);
      delete peerInfo.settings.maxBandwidth;
    }

    if (peerInfo.settings.video && typeof peerInfo.settings.video === 'object' &&
      peerInfo.settings.video.customSettings && typeof peerInfo.settings.video.customSettings === 'object') {
      if (peerInfo.settings.video.customSettings.frameRate) {
        peerInfo.settings.video.frameRate = clone(peerInfo.settings.video.customSettings.frameRate);
      }
      if (peerInfo.settings.video.customSettings.facingMode) {
        peerInfo.settings.video.facingMode = clone(peerInfo.settings.video.customSettings.facingMode);
      }
      if (peerInfo.settings.video.customSettings.width) {
        peerInfo.settings.video.resolution = peerInfo.settings.video.resolution || {};
        peerInfo.settings.video.resolution.width = clone(peerInfo.settings.video.customSettings.width);
      }
      if (peerInfo.settings.video.customSettings.height) {
        peerInfo.settings.video.resolution = peerInfo.settings.video.resolution || {};
        peerInfo.settings.video.resolution.height = clone(peerInfo.settings.video.customSettings.height);
      }
      if (peerInfo.settings.video.customSettings.facingMode) {
        peerInfo.settings.video.facingMode = clone(peerInfo.settings.video.customSettings.facingMode);
      }
    }

    if (peerInfo.settings.audio && typeof peerInfo.settings.audio === 'object') {
      peerInfo.settings.audio.stereo = peerInfo.settings.audio.stereo === true;
    }

    if (!(peerInfo.userData !== null && typeof peerInfo.userData !== 'undefined')) {
      peerInfo.userData = '';
    }

    peerInfo.parentId = peerInfo.parentId || null;

    if (peerId === 'MCU') {
      peerInfo.config.receiveOnly = true;
      peerInfo.config.publishOnly = false;
    } else if (this._hasMCU) {
      peerInfo.config.receiveOnly = false;
      peerInfo.config.publishOnly = true;
    }

    if (!this._sdpSettings.direction.audio.receive) {
      peerInfo.settings.audio = false;
      peerInfo.mediaStatus.audioMuted = this.MEDIA_STATUS.UNAVAILABLE;
    }

    if (!this._sdpSettings.direction.video.receive) {
      peerInfo.settings.video = false;
      peerInfo.mediaStatus.videoMuted = this.MEDIA_STATUS.UNAVAILABLE;
    }

    if (!this._sdpSettings.connection.audio) {
      peerInfo.settings.audio = false;
      peerInfo.mediaStatus.audioMuted = this.MEDIA_STATUS.UNAVAILABLE;
    }

    if (!this._sdpSettings.connection.video) {
      peerInfo.settings.video = false;
      peerInfo.mediaStatus.videoMuted = this.MEDIA_STATUS.UNAVAILABLE;
    }

    peerInfo.settings.data = !!(this._dataChannels[peerId] && this._dataChannels[peerId].main &&
      this._dataChannels[peerId].main.channel &&
      this._dataChannels[peerId].main.channel.readyState === this.DATA_CHANNEL_STATE.OPEN);
    peerInfo.connected = this._peerConnStatus[peerId] && !!this._peerConnStatus[peerId].connected;
    peerInfo.init = this._peerConnStatus[peerId] && !!this._peerConnStatus[peerId].init;

    // Makes sense to be send direction since we are retrieving information if Peer is sending anything to us
    if (this._sdpSessions[peerId] && this._sdpSessions[peerId].remote &&
      this._sdpSessions[peerId].remote.connection && typeof this._sdpSessions[peerId].remote.connection === 'object') {
      if (!(this._sdpSessions[peerId].remote.connection.audio &&
        this._sdpSessions[peerId].remote.connection.audio.indexOf('send') > -1)) {
        peerInfo.settings.audio = false;
        peerInfo.mediaStatus.audioMuted = this.MEDIA_STATUS.UNAVAILABLE;
      }
      if (!(this._sdpSessions[peerId].remote.connection.video &&
        this._sdpSessions[peerId].remote.connection.video.indexOf('send') > -1)) {
        peerInfo.settings.video = false;
        peerInfo.mediaStatus.videoMuted = this.MEDIA_STATUS.UNAVAILABLE;
      }
      if (!(this._sdpSessions[peerId].remote.connection.data &&
        this._sdpSessions[peerId].remote.connection.data.indexOf('send') > -1)) {
        peerInfo.settings.data = false;
      }
    }

  } else {
    peerInfo = {
      userData: clone(this._userData),
      settings: {
        audio: false,
        video: false
      },
      mediaStatus: self._streamMediaStatus,
      agent: {
        name: AdapterJS.webrtcDetectedBrowser,
        version: AdapterJS.webrtcDetectedVersion,
        os: window.navigator.platform,
        pluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
        SMProtocolVersion: this.SMProtocolVersion,
        DTProtocolVersion: this.DTProtocolVersion
      },
      room: clone(this._selectedRoom),
      config: {
        enableDataChannel: this._initOptions.enableDataChannel,
        enableIceTrickle: this._initOptions.enableIceTrickle,
        enableIceRestart: this._enableIceRestart,
        priorityWeight: this._peerPriorityWeight,
        receiveOnly: false,
        publishOnly: !!this._publishOnly
      },
      connected: null,
      init: null
    };

    if (!(peerInfo.userData !== null && typeof peerInfo.userData !== 'undefined')) {
      peerInfo.userData = '';
    }

    if (this._streams.screenshare) {
      peerInfo.settings = clone(this._streams.screenshare.settings);
    } else if (this._streams.userMedia) {
      peerInfo.settings = clone(this._streams.userMedia.settings);
    }

    peerInfo.settings.bandwidth = clone(this._streamsBandwidthSettings.bAS);
    peerInfo.settings.googleXBandwidth = clone(this._streamsBandwidthSettings.googleX);
    peerInfo.parentId = this._parentId ? this._parentId : null;
    peerInfo.config.receiveOnly = !peerInfo.settings.video && !peerInfo.settings.audio;
    peerInfo.settings.data = this._initOptions.enableDataChannel && this._sdpSettings.connection.data;

    if (peerInfo.settings.audio && typeof peerInfo.settings.audio === 'object') {
      // Override the settings.audio.usedtx
      if (typeof this._initOptions.codecParams.audio.opus.stereo === 'boolean') {
        peerInfo.settings.audio.stereo = this._initOptions.codecParams.audio.opus.stereo;
      }
      // Override the settings.audio.usedtx
      if (typeof this._initOptions.codecParams.audio.opus.usedtx === 'boolean') {
        peerInfo.settings.audio.usedtx = this._initOptions.codecParams.audio.opus.usedtx;
      }
      // Override the settings.audio.maxplaybackrate
      if (typeof this._initOptions.codecParams.audio.opus.maxplaybackrate === 'number') {
        peerInfo.settings.audio.maxplaybackrate = this._initOptions.codecParams.audio.opus.maxplaybackrate;
      }
      // Override the settings.audio.useinbandfec
      if (typeof this._initOptions.codecParams.audio.opus.useinbandfec === 'boolean') {
        peerInfo.settings.audio.useinbandfec = this._initOptions.codecParams.audio.opus.useinbandfec;
      }
    }
  }

  if (!peerInfo.settings.audio && !peerInfo.settings.video) {
    peerInfo.config.receiveOnly = true;
    peerInfo.config.publishOnly = false;
  }

  return peerInfo;
};

/**
 * Function that gets the list of connected Peers in the Room.
 * @method getPeersInRoom
 * @return {JSON} The list of connected Peers. <ul>
 *   <li><code>#peerId</code><var><b>{</b>JSON<b>}</b></var><p>The Peer information.
 *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   <a href="#event_peerJoined"><code>peerJoined</code> event</a> except there is
 *   the <code>isSelf</code> flag that determines if Peer is User or not.</small></p></li></ul>
 * @example
 *   // Example 1: Get the list of currently connected Peers in the same Room
 *   var peers = skylinkDemo.getPeersInRoom();
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.getPeersInRoom = function() {
  var listOfPeersInfo = {};
  var listOfPeers = Object.keys(this._peerInformations);

  for (var i = 0; i < listOfPeers.length; i++) {
    listOfPeersInfo[listOfPeers[i]] = clone(this.getPeerInfo(listOfPeers[i]));
    listOfPeersInfo[listOfPeers[i]].isSelf = false;
  }

  if (this._user && this._user.sid) {
    listOfPeersInfo[this._user.sid] = clone(this.getPeerInfo());
    listOfPeersInfo[this._user.sid].isSelf = true;
  }

  return listOfPeersInfo;
};

/**
 * Function that gets the list of connected Peers Streams in the Room.
 * @method getPeersStream
 * @return {JSON} The list of Peers Stream. <ul>
 *   <li><code>#peerId</code><var><b>{</b>JSON<b>}</b></var><p>The Peer Stream.</p><ul>
 *   <li><code>stream</code><var><b>{</b>MediaStream<b>}</b></var><p>The Stream object.</p></li>
 *   <li><code>streamId</code><var><b>{</b>String<b>}</b></var><p>The Stream ID.</p></li>
 *   <li><code>isSelf</code><var><b>{</b>Boolean<b>}</b></var><p>The flag if Peer is User.</p></li>
 *   </p></li></ul></li></ul>
 * @example
 *   // Example 1: Get the list of current Peers Streams in the same Room
 *   var streams = skylinkDemo.getPeersStream();
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.getPeersStream = function() {
  var listOfPeersStreams = {};
  var listOfPeers = Object.keys(this._peerConnections);

  for (var i = 0; i < listOfPeers.length; i++) {
    var stream = null;
    var streamId = null;

    if (this._peerConnections[listOfPeers[i]] &&
      this._peerConnections[listOfPeers[i]].remoteDescription &&
      this._peerConnections[listOfPeers[i]].remoteDescription.sdp &&
      (this._sdpSettings.direction.audio.receive || this._sdpSettings.direction.video.receive)) {
      stream = this._peerConnections[listOfPeers[i]].remoteStream;
      streamId = stream && (this._peerConnections[listOfPeers[i]].remoteStreamId || stream.id || stream.label);
    }

    listOfPeersStreams[listOfPeers[i]] = {
      streamId: streamId,
      stream: stream,
      isSelf: false
    };
  }

  if (this._user && this._user.sid) {
    var selfStream = null;

    if (this._streams.screenshare && this._streams.screenshare.stream) {
      selfStream = this._streams.screenshare.stream;
    } else if (this._streams.userMedia && this._streams.userMedia.stream) {
      selfStream = this._streams.userMedia.stream;
    }

    listOfPeersStreams[this._user.sid] = {
      streamId: selfStream ? selfStream.id || selfStream.label || null : null,
      stream: selfStream,
      isSelf: true
    };
  }

  return listOfPeersStreams;
};

/**
 * Function that gets the current list of connected Peers Datachannel connections in the Room.
 * @method getPeersDatachannels
 * @return {JSON} The list of Peers Stream. <ul>
 *   <li><code>#peerId</code><var><b>{</b>JSON<b>}</b></var><p>The Peer Datachannels information.</p><ul>
 *   <li><code>#channelName</code><var><b>{</b>JSON<b>}</b></var><p>The Datachannel information.</p><ul>
 *   <li><code>channelName</code><var><b>{</b>String<b>}</b></var><p>The Datachannel ID..</p><ul>
 *   <li><code>channelType</code><var><b>{</b>String<b>}</b></var><p>The Datachannel type.
 *   [Rel: Skylink.DATA_CHANNEL_TYPE]</p></li>
 *   <li><code>channelProp</code><var><b>{</b>String<b>}</b></var><p>The Datachannel property.</p></li>
 *   <li><code>currentTransferId</code><var><b>{</b>String<b>}</b></var><p>The Datachannel connection
 *   current progressing transfer session. <small>Defined as <code>null</code> when there is
 *   currently no transfer session progressing on the Datachannel connection.</small></p></li>
 *   <li><code>currentStreamId</code><var><b>{</b>String<b>}</b></var><p>The Datachannel connection
 *   current data streaming session ID. <small>Defined as <code>null</code> when there is currently
 *   no data streaming session on the Datachannel connection.</small></p></li>
 *   <li><code>readyState</code><var><b>{</b>String<b>}</b></var><p>The Datachannel connection readyState.
 *   [Rel: Skylink.DATA_CHANNEL_STATE]</p></li>
 *   <li><code>bufferedAmountLow</code><var><b>{</b>Number<b>}</b></var><p>The Datachannel buffered amount.</p></li>
 *   <li><code>bufferedAmountLowThreshold</code><var><b>{</b>Number<b>}</b></var><p>The Datachannel
 *   buffered amount threshold.</p></li>
 *   </p></li></p></li></ul></li></ul></li></ul>
 * @example
 *   // Example 1: Get the list of current Peers Datachannels in the same Room
 *   var channels = skylinkDemo.getPeersDatachannels();
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.getPeersDatachannels = function() {
  var listOfPeersDatachannels = {};
  var listOfPeers = Object.keys(this._peerConnections);

  for (var i = 0; i < listOfPeers.length; i++) {
    listOfPeersDatachannels[listOfPeers[i]] = {};

    if (this._dataChannels[listOfPeers[i]]) {
      for (var channelProp in this._dataChannels[listOfPeers[i]]) {
        if (this._dataChannels[listOfPeers[i]].hasOwnProperty(channelProp) &&
          this._dataChannels[listOfPeers[i]][channelProp]) {
          var channel = this._dataChannels[listOfPeers[i]][channelProp];
          listOfPeersDatachannels[listOfPeers[i]][channel.channelName] = this._getDataChannelBuffer(listOfPeers[i], channelProp);
          listOfPeersDatachannels[listOfPeers[i]][channel.channelName].channelName = channel.channelName;
          listOfPeersDatachannels[listOfPeers[i]][channel.channelName].channelType = channel.channelType;
          listOfPeersDatachannels[listOfPeers[i]][channel.channelName].channelProp = channelProp;
          listOfPeersDatachannels[listOfPeers[i]][channel.channelName].currentTransferId = channel.transferId;
          listOfPeersDatachannels[listOfPeers[i]][channel.channelName].currentStreamId = channel.streamId;
          listOfPeersDatachannels[listOfPeers[i]][channel.channelName].readyState = channel.channel ?
            channel.channel.readyState : self.DATA_CHANNEL_STATE.CREATE_ERROR;
        }
      }
    }
  }

  return listOfPeersDatachannels;
};

/**
 * Function that gets the list of current data transfers.
 * @method getCurrentDataTransfers
 * @return {JSON} The list of Peers Stream. <ul>
 *   <li><code>#transferId</code><var><b>{</b>JSON<b>}</b></var><p>The data transfer session.</p><ul>
 *   <li><code>transferInfo</code><var><b>{</b>JSON<b>}</b></var><p>The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   except without the <code>data</code> property.</small></p></li>
 *   <li><code>peerId</code><var><b>{</b>String<b>}</b></var><p>The sender Peer ID.</p></li>
 *   <li><code>isSelf</code><var><b>{</b>Boolean<b>}</b></var><p>The flag if Peer is User.</p></li>
 *   </p></li></ul></li></ul>
 * @example
 *   // Example 1: Get the list of current data transfers in the same Room
 *   var currentTransfers = skylinkDemo.getCurrentDataTransfers();
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.getCurrentDataTransfers = function() {
  var listOfDataTransfers = {};

  if (!(this._user && this._user.sid)) {
    return {};
  }

  for (var prop in this._dataTransfers) {
    if (this._dataTransfers.hasOwnProperty(prop) && this._dataTransfers[prop]) {
      listOfDataTransfers[prop] = {
        transferInfo: this._getTransferInfo(prop, this._user.sid, true, true, true),
        isSelf: this._dataTransfers[prop].senderPeerId === this._user.sid,
        peerId: this._dataTransfers[prop].senderPeerId || this._user.sid
      };
    }
  }

  return listOfDataTransfers;
};

/**
 * Function that gets the list of current data streaming sessions.
 * @method getCurrentDataStreamsSession
 * @return {JSON} The list of Peers Stream. <ul>
 *   <li><code>#streamId</code><var><b>{</b>JSON<b>}</b></var><p>The data streaming session.</p><ul>
 *   <li><code>streamInfo</code><var><b>{</b>JSON<b>}</b></var><p>The data streaming information.
 *   <small>Object signature matches the <code>streamInfo</code> parameter payload received in the
 *   <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   except without the <code>chunk</code> amd <code>chunkSize</code> property.</small></p></li>
 *   <li><code>peerId</code><var><b>{</b>String<b>}</b></var><p>The sender Peer ID.</p></li>
 *   <li><code>isSelf</code><var><b>{</b>Boolean<b>}</b></var><p>The flag if Peer is User.</p></li>
 *   </p></li></ul></li></ul>
 * @example
 *   // Example 1: Get the list of current data streaming sessions in the same Room
 *   var currentDataStreams = skylinkDemo.getCurrentDataStreamsSession();
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.getCurrentDataStreamsSession = function() {
  var listOfDataStreams = {};

  if (!(this._user && this._user.sid)) {
    return {};
  }

  for (var prop in this._dataStreams) {
    if (this._dataStreams.hasOwnProperty(prop) && this._dataStreams[prop]) {
      listOfDataStreams[prop] = {
        streamInfo: {
          chunkType: this._dataStreams[prop].sessionChunkType === 'string' ? this.DATA_TRANSFER_DATA_TYPE.STRING :
            this.DATA_TRANSFER_DATA_TYPE.BLOB,
          isPrivate: this._dataStreams[prop].isPrivate,
          isStringStream: this._dataStreams[prop].sessionChunkType === 'string',
          senderPeerId: this._dataStreams[prop].senderPeerId
        },
        isSelf: this._dataStreams[prop].senderPeerId === this._user.sid,
        peerId: this._dataStreams[prop].senderPeerId || this._user.sid
      };
    }
  }

  return listOfDataStreams;
};

/**
 * Function that gets the list of current custom Peer settings sent and set.
 * @method getPeerCustomSettings
 * @return {JSON} The list of Peers custom settings sent and set. <ul>
 *   <li><code>#peerId</code><var><b>{</b>JSON<b>}</b></var><p>The Peer settings sent and set.</p><ul>
 *   <li><code>settings</code><var><b>{</b>JSON<b>}</b></var><p>The custom Peer settings.
 *   <small>Object signature matches the <code>peerInfo.settings</code> parameter payload received in the
 *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small></p></li>
 *   <li><code>mediaStatus</code><var><b>{</b>JSON<b>}</b></var><p>The custom Peer Stream muted settings.
 *   <small>Object signature matches the <code>peerInfo.mediaStatus</code> parameter payload received in the
 *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small></p></li></ul></li></ul>
 * @example
 *   // Example 1: Get the list of current Peer custom settings
 *   var currentPeerSettings = skylinkDemo.getPeersCustomSettings();
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.getPeersCustomSettings = function () {
  var self = this;
  var customSettingsList = {};

  for (var peerId in self._peerInformations) {
    if (self._peerInformations.hasOwnProperty(peerId) && self._peerInformations[peerId]) {
      customSettingsList[peerId] = self._getPeerCustomSettings(peerId);
    }
  }

  return customSettingsList;
};

/**
 * Function that returns the Peer custom settings.
 * @method _getPeerCustomSettings
 * @private
 * @for Skylink
 * @since 0.6.21
 */
Skylink.prototype._getPeerCustomSettings = function (peerId) {
  var self = this;
  var customSettings = {
    settings: {
      audio: false,
      video: false,
      data: false,
      bandwidth: clone(self._streamsBandwidthSettings.bAS),
      googleXBandwidth: clone(self._streamsBandwidthSettings.googleX)
    },
    mediaStatus: {
      audioMuted: this.MEDIA_STATUS.UNAVAILABLE,
      videoMuted: this.MEDIA_STATUS.UNAVAILABLE,
    }
  };

  var usePeerId = self._hasMCU ? 'MCU' : peerId;

  if (!self._peerInformations[usePeerId]) {
    return customSettings;
  }


  if (self._peerConnections[usePeerId] && self._peerConnections[usePeerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
    var stream = self._peerConnections[usePeerId].localStream;
    var streamId = self._peerConnections[usePeerId].localStreamId || (stream && (stream.id || stream.label));

    customSettings.settings.data = self._initOptions.enableDataChannel && self._peerInformations[usePeerId].config.enableDataChannel;

    if (stream) {
      if (self._streams.screenshare && self._streams.screenshare.stream &&
        streamId === (self._streams.screenshare.stream.id || self._streams.screenshare.stream.label)) {
        customSettings.settings.audio = clone(self._streams.screenshare.settings.audio);
        customSettings.settings.video = clone(self._streams.screenshare.settings.video);
        customSettings.mediaStatus = self._streamMediaStatus;

      } else if (self._streams.userMedia && self._streams.userMedia.stream &&
        streamId === (self._streams.userMedia.stream.id || self._streams.userMedia.stream.label)) {
        customSettings.settings.audio = clone(self._streams.userMedia.settings.audio);
        customSettings.settings.video = clone(self._streams.userMedia.settings.video);
        customSettings.mediaStatus = self._streamMediaStatus;
      }

      if (typeof self._peerConnections[usePeerId].getSenders === 'function' &&
        !(self._initOptions.useEdgeWebRTC && window.msRTCPeerConnection)) {
        var senders = self._peerConnections[usePeerId].getSenders();
        var hasSendAudio = false;
        var hasSendVideo = false;

        for (var i = 0; i < senders.length; i++) {
          if (!(senders[i] && senders[i].track && senders[i].track.kind)) {
            continue;
          }
          if (senders[i].track.kind === 'audio') {
            hasSendAudio = true;
          } else if (senders[i].track.kind === 'video') {
            hasSendVideo = true;
          }
        }

        if (!hasSendAudio) {
          customSettings.settings.audio = false;
          customSettings.mediaStatus.audioMuted = this.MEDIA_STATUS.UNAVAILABLE;
        }

        if (!hasSendVideo) {
          customSettings.settings.video = false;
          customSettings.mediaStatus.videoMuted = this.MEDIA_STATUS.UNAVAILABLE;
        }
      }
    }
  }

  if (self._peerCustomConfigs[usePeerId]) {
    if (self._peerCustomConfigs[usePeerId].bandwidth &&
      typeof self._peerCustomConfigs[usePeerId].bandwidth === 'object') {
      if (typeof self._peerCustomConfigs[usePeerId].bandwidth.audio === 'number') {
        customSettings.settings.bandwidth.audio = self._peerCustomConfigs[usePeerId].bandwidth.audio;
      }
      if (typeof self._peerCustomConfigs[usePeerId].bandwidth.video === 'number') {
        customSettings.settings.bandwidth.video = self._peerCustomConfigs[usePeerId].bandwidth.video;
      }
      if (typeof self._peerCustomConfigs[usePeerId].bandwidth.data === 'number') {
        customSettings.settings.bandwidth.data = self._peerCustomConfigs[usePeerId].bandwidth.data;
      }
    }
    if (self._peerCustomConfigs[usePeerId].googleXBandwidth &&
      typeof self._peerCustomConfigs[usePeerId].googleXBandwidth === 'object') {
      if (typeof self._peerCustomConfigs[usePeerId].googleXBandwidth.min === 'number') {
        customSettings.settings.googleXBandwidth.min = self._peerCustomConfigs[usePeerId].googleXBandwidth.min;
      }
      if (typeof self._peerCustomConfigs[usePeerId].googleXBandwidth.max === 'number') {
        customSettings.settings.googleXBandwidth.max = self._peerCustomConfigs[usePeerId].googleXBandwidth.max;
      }
    }
  }

  // Check we are going to send data to peer
  if (self._sdpSessions[usePeerId] && self._sdpSessions[usePeerId].local &&
    self._sdpSessions[usePeerId].local.connection && typeof self._sdpSessions[usePeerId].local.connection === 'object') {
    if (!(self._sdpSessions[usePeerId].local.connection.audio &&
      self._sdpSessions[usePeerId].local.connection.audio.indexOf('send') > -1)) {
      customSettings.settings.audio = false;
      customSettings.mediaStatus.audioMuted = this.MEDIA_STATUS.UNAVAILABLE;
    }
    if (!(self._sdpSessions[usePeerId].local.connection.video &&
      self._sdpSessions[usePeerId].local.connection.video.indexOf('send') > -1)) {
      customSettings.settings.video = false;
      customSettings.mediaStatus.videoMuted = this.MEDIA_STATUS.UNAVAILABLE;
    }
    if (!(self._sdpSessions[usePeerId].local.connection.data &&
      self._sdpSessions[usePeerId].local.connection.data.indexOf('send') > -1)) {
      customSettings.settings.data = false;
    }
  }

  return customSettings;
};

/**
 * Function that returns the User session information to be sent to Peers.
 * @method _getUserInfo
 * @private
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._getUserInfo = function(peerId) {
  var userInfo = clone(this.getPeerInfo());
  var userCustomInfoForPeer = peerId ? this._getPeerCustomSettings(peerId) : null;

  if (userCustomInfoForPeer && typeof userCustomInfoForPeer === 'object') {
    userInfo.settings = userCustomInfoForPeer.settings;
    userInfo.mediaStatus = userCustomInfoForPeer.mediaStatus;
  }

  // Adhere to SM protocol without breaking the other SDKs.
  if (userInfo.settings.video && typeof userInfo.settings.video === 'object') {
    userInfo.settings.video.customSettings = {};

    if (userInfo.settings.video.frameRate && typeof userInfo.settings.video.frameRate === 'object') {
      userInfo.settings.video.customSettings.frameRate = clone(userInfo.settings.video.frameRate);
      userInfo.settings.video.frameRate = -1;
    }

    if (userInfo.settings.video.facingMode && typeof userInfo.settings.video.facingMode === 'object') {
      userInfo.settings.video.customSettings.facingMode = clone(userInfo.settings.video.facingMode);
      userInfo.settings.video.facingMode = '-1';
    }

    if (userInfo.settings.video.resolution && typeof userInfo.settings.video.resolution === 'object') {
      if (userInfo.settings.video.resolution.width && typeof userInfo.settings.video.resolution.width === 'object') {
        userInfo.settings.video.customSettings.width = clone(userInfo.settings.video.width);
        userInfo.settings.video.resolution.width = -1;
      }

      if (userInfo.settings.video.resolution.height && typeof userInfo.settings.video.resolution.height === 'object') {
        userInfo.settings.video.customSettings.height = clone(userInfo.settings.video.height);
        userInfo.settings.video.resolution.height = -1;
      }
    }
  }

  if (userInfo.settings.bandwidth) {
    userInfo.settings.maxBandwidth = clone(userInfo.settings.bandwidth);
    delete userInfo.settings.bandwidth;
  }

  if (!this._getSDPCommonSupports(peerId).video) {
    userInfo.settings.video = false;
    userInfo.mediaStatus.videoMuted = this.MEDIA_STATUS.UNAVAILABLE;
  }

  if (!this._getSDPCommonSupports(peerId).audio) {
    userInfo.settings.audio = false;
    userInfo.mediaStatus.audioMuted = this.MEDIA_STATUS.UNAVAILABLE;
  }

  delete userInfo.agent;
  delete userInfo.room;
  delete userInfo.config;
  delete userInfo.parentId;
  delete userInfo.settings.data;
  return userInfo;
};
