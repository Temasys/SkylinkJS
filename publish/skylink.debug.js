/*! skylinkjs - v0.6.15 - Thu Sep 29 2016 18:00:27 GMT+0800 (SGT) */

(function() {

'use strict';

/**
 * Polyfill for Object.keys() from Mozilla
 * From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
 */
if (!Object.keys) {
  Object.keys = (function() {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({
        toString: null
      }).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

      var result = [];

      for (var prop in obj) {
        if (hasOwnProperty.call(obj, prop)) result.push(prop);
      }

      if (hasDontEnumBug) {
        for (var i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
        }
      }
      return result;
    }
  })()
}

/**
 * Polyfill for Date.getISOString() from Mozilla
 * From https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
 */
(function() {
  function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }

  Date.prototype.toISOString = function() {
    return this.getUTCFullYear() +
      '-' + pad(this.getUTCMonth() + 1) +
      '-' + pad(this.getUTCDate()) +
      'T' + pad(this.getUTCHours()) +
      ':' + pad(this.getUTCMinutes()) +
      ':' + pad(this.getUTCSeconds()) +
      '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
      'Z';
  };
})();

/**
 * Polyfill for addEventListener() from Eirik Backer @eirikbacker (github.com).
 * From https://gist.github.com/eirikbacker/2864711
 * MIT Licensed
 */
(function(win, doc){
  if(win.addEventListener) return; //No need to polyfill

  function docHijack(p){var old = doc[p];doc[p] = function(v){ return addListen(old(v)) }}
  function addEvent(on, fn, self){
    return (self = this).attachEvent('on' + on, function(e){
      var e = e || win.event;
      e.preventDefault  = e.preventDefault  || function(){e.returnValue = false}
      e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true}
      fn.call(self, e);
    });
  }
  function addListen(obj, i){
    if(i = obj.length)while(i--)obj[i].addEventListener = addEvent;
    else obj.addEventListener = addEvent;
    return obj;
  }

  addListen([doc, win]);
  if('Element' in win)win.Element.prototype.addEventListener = addEvent; //IE8
  else{                                     //IE < 8
    doc.attachEvent('onreadystatechange', function(){addListen(doc.all)}); //Make sure we also init at domReady
    docHijack('getElementsByTagName');
    docHijack('getElementById');
    docHijack('createElement');
    addListen(doc.all);
  }
})(window, document);

/**
 * Global function that clones an object.
 */
var clone = function (obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  var copy = function (data) {
    var copy = data.constructor();
    for (var attr in data) {
      if (data.hasOwnProperty(attr)) {
        copy[attr] = data[attr];
      }
    }
    return copy;
  };

  if (typeof obj === 'object' && !Array.isArray(obj)) {
    try {
      return JSON.parse( JSON.stringify(obj) );
    } catch (err) {
      return copy(obj);
    }
  }
  
  return copy(obj);
};

/**
 * <h2>Prerequisites on using Skylink</h2>
 * Before using any Skylink functionalities, you will need to authenticate your App Key using
 *   the <a href="#method_init">`init()` method</a>.
 *
 * To manage or create App Keys, you may access the [Skylink Developer Portal here](https://console.temasys.io).
 *
 * To view the list of supported browsers, visit [the list here](
 * https://github.com/Temasys/SkylinkJS#supported-browsers).
 *
 * Here are some articles to help you get started:
 * - [How to setup a simple video call](https://temasys.com.sg/getting-started-with-webrtc-and-skylinkjs/)
 * - [How to setup screensharing](https://temasys.com.sg/screensharing-with-skylinkjs/)
 * - [How to create a chatroom like feature](https://temasys.com.sg/building-a-simple-peer-to-peer-webrtc-chat/)
 *
 * Here are some demos you may use to aid your development:
 * - Getaroom.io [[Demo](https://getaroom.io) / [Source code](https://github.com/Temasys/getaroom)]
 * - Creating a component [[Link](https://github.com/Temasys/skylink-call-button)]
 *
 * You may see the example below in the <a href="#">Constructor tab</a> to have a general idea how event subscription
 *   and the ordering of <a href="#method_init"><code>init()</code></a> and
 *   <a href="#method_joinRoom"><code>joinRoom()</code></a> methods should be called.
 *
 * If you have any issues, you may find answers to your questions in the FAQ section on [our support portal](
 * http://support.temasys.com.sg), asks questions, request features or raise bug tickets as well.
 *
 * If you would like to contribute to our SkylinkJS codebase, see [the contributing README](
 * https://github.com/Temasys/SkylinkJS/blob/master/CONTRIBUTING.md).
 *
 * [See License (Apache 2.0)](https://github.com/Temasys/SkylinkJS/blob/master/LICENSE)
 *
 * @class Skylink
 * @constructor
 * @example
 *   // Here's a simple example on how you can start using Skylink.
 *   var skylinkDemo = new Skylink();
 *
 *   // Subscribe all events first as a general guideline
 *   skylinkDemo.on("incomingStream", function (peerId, stream, peerInfo, isSelf) {
 *     if (isSelf) {
 *       attachMediaStream(document.getElementById("selfVideo"), stream);
 *     } else {
 *       var peerVideo = document.createElement("video");
 *       peerVideo.id = peerId;
 *       peerVideo.autoplay = "autoplay";
 *       document.getElementById("peersVideo").appendChild(peerVideo);
 *       attachMediaStream(peerVideo, stream);
 *     }
 *   });
 *
 *   skylinkDemo.on("peerLeft", function (peerId, peerInfo, isSelf) {
 *     if (!isSelf) {
 *       var peerVideo = document.getElementById(peerId);
 *       // do a check if peerVideo exists first
 *       if (peerVideo) {
 *         document.getElementById("peersVideo").removeChild(peerVideo);
 *       } else {
 *         console.error("Peer video for " + peerId + " is not found.");
 *       }
 *     }
 *   });
 *
 *  // init() should always be called first before other methods other than event methods like on() or off().
 *  skylinkDemo.init("YOUR_APP_KEY_HERE", function (error, success) {
 *    if (success) {
 *      skylinkDemo.joinRoom("my_room", {
 *        userData: "My Username",
 *        audio: true,
 *        video: true
 *      });
 *    }
 *  });
 * @for Skylink
 * @since 0.5.0
 */
function Skylink() {
  if (!(this instanceof Skylink)) {
    return new Skylink();
  }
}

/**
 * Contains the current version of Skylink Web SDK.
 * @attribute VERSION
 * @type String
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.VERSION = '0.6.15';

/**
 * Function that generates an <a href="https://en.wikipedia.org/wiki/Universally_unique_identifier">UUID</a> (Unique ID).
 * @method generateUUID
 * @return {String} Returns a generated UUID (Unique ID).
 * @for Skylink
 * @since 0.5.9
 */
Skylink.prototype.generateUUID = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
};

Skylink.prototype.DATA_CHANNEL_STATE = {
  CONNECTING: 'connecting',
  OPEN: 'open',
  CLOSING: 'closing',
  CLOSED: 'closed',
  ERROR: 'error',
  CREATE_ERROR: 'createError',
  BUFFERED_AMOUNT_LOW: 'bufferedAmountLow',
  SEND_MESSAGE_ERROR: 'sendMessageError'
};

/**
 * The list of Datachannel types.
 * @attribute DATA_CHANNEL_TYPE
 * @param {String} MESSAGING <small>Value <code>"messaging"</code></small>
 *   The value of the Datachannel type that is used only for messaging in
 *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.
 *   <small>However for Peers that do not support simultaneous data transfers, this Datachannel
 *   type will be used to do data transfers (1 at a time).</small>
 *   <small>Each Peer connections will only have one of this Datachannel type and the
 *   connection will only close when the Peer connection is closed (happens when <a href="#event_peerConnectionState">
 *   <code>peerConnectionState</code> event</a> triggers parameter payload <code>state</code> as
 *   <code>CLOSED</code> for Peer).</small>
 * @param {String} DATA <small>Value <code>"data"</code></small>
 *   The value of the Datachannel type that is used only for a data transfer in
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> and
 *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>.
 *   <small>The connection will close after the data transfer has been completed or terminated (happens when
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>DOWNLOAD_COMPLETED</code>, <code>UPLOAD_COMPLETED</code>,
 *   <code>REJECTED</code>, <code>CANCEL</code> or <code>ERROR</code> for Peer).</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.DATA_CHANNEL_TYPE = {
  MESSAGING: 'messaging',
  DATA: 'data'
};

/**
 * Stores the flag if Peers should have any Datachannel connections.
 * @attribute _enableDataChannel
 * @default true
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._enableDataChannel = true;

/**
 * Stores the list of Peer Datachannel connections.
 * @attribute _dataChannels
 * @param {JSON} #peerId The list of Datachannels associated with Peer ID.
 * @param {RTCDataChannel} #peerId.#channelLabel The Datachannel connection.
 *   The property name <code>"main"</code> is reserved for messaging Datachannel type.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._dataChannels = {};

/**
 * Function that starts a Datachannel connection with Peer.
 * @method _createDataChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._createDataChannel = function(peerId, dataChannel, createAsMessagingChannel) {
  var self = this;

  if (!self._user) {
    log.error([peerId, 'RTCDataChannel', null,
      'Aborting of creating or initializing Datachannel as User does not have Room session']);
    return;
  }

  if (!(self._peerConnections[peerId] &&
    self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    log.error([peerId, 'RTCDataChannel', null,
      'Aborting of creating or initializing Datachannel as Peer connection does not exists']);
    return;
  }

  var channelName = self._user.sid + '_' + peerId;
  var channelType = createAsMessagingChannel ? self.DATA_CHANNEL_TYPE.MESSAGING : self.DATA_CHANNEL_TYPE.DATA;

  if (dataChannel && typeof dataChannel === 'object') {
    channelName = dataChannel.label;
  
  } else if (typeof dataChannel === 'string') {
    channelName = dataChannel;
    dataChannel = null;
  }

  if (!dataChannel) {
    try {
      dataChannel = self._peerConnections[peerId].createDataChannel(channelName);

    } catch (error) {
      log.error([peerId, 'RTCDataChannel', channelName, 'Failed creating Datachannel ->'], error);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CREATE_ERROR, peerId, error, channelName, channelType);
      return;
    }
  }

  if (!self._dataChannels[peerId]) {
    log.debug([peerId, 'RTCDataChannel', channelName, 'initializing main DataChannel']);

    channelType = self.DATA_CHANNEL_TYPE.MESSAGING;

    self._dataChannels[peerId] = {};

  } else if (self._dataChannels[peerId].main && self._dataChannels[peerId].main.channel.label === channelName) {
    channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
  }

  /**
   * Subscribe to events
   */
  dataChannel.onerror = function (evt) {
    var channelError = evt.error || evt;

    log.error([peerId, 'RTCDataChannel', channelName, 'Datachannel has an exception ->'], channelError);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, channelError, channelName, channelType);
  };

  dataChannel.onbufferedamountlow = function () {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel buffering data transfer low']);

    // TODO: Should we add an event here
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.BUFFERED_AMOUNT_LOW, peerId, null, channelName, channelType);
  };

  dataChannel.onmessage = function(event) {
    self._processDataChannelData(event.data, peerId, channelName, channelType);
  };

  var onOpenHandlerFn = function () {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel has opened']);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.OPEN, peerId, null, channelName, channelType);
  };

  if (dataChannel.readyState === self.DATA_CHANNEL_STATE.OPEN) {
    setTimeout(onOpenHandlerFn, 500);

  } else {
    self._trigger('dataChannelState', dataChannel.readyState, peerId, null, channelName, channelType);

    dataChannel.onopen = onOpenHandlerFn;
  }

  var onCloseHandlerFn = function () {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel has closed']);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId, null, channelName, channelType);

    if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
      setTimeout(function () {
        if (self._peerConnections[peerId] &&
          self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED &&
          (self._peerConnections[peerId].localDescription &&
            self._peerConnections[peerId].localDescription.type === self.HANDSHAKE_PROGRESS.OFFER)) {
          log.debug([peerId, 'RTCDataChannel', channelName, 'Reviving Datachannel connection']);
          self._createDataChannel(peerId, channelName, true);
        }
      }, 100);
    }
  };

  // Fixes for Firefox bug (49 is working) -> https://bugzilla.mozilla.org/show_bug.cgi?id=1118398
  if (window.webrtcDetectedBrowser === 'firefox') {
    var hasTriggeredClose = false;
    var timeBlockAfterClosing = 0;

    dataChannel.onclose = function () {
      if (!hasTriggeredClose) {
        hasTriggeredClose = true;
        onCloseHandlerFn();
      }
    };

    var onFFClosed = setInterval(function () {
      if (dataChannel.readyState === self.DATA_CHANNEL_STATE.CLOSED ||
        hasTriggeredClose || timeBlockAfterClosing === 5) {
        clearInterval(onFFClosed);
        
        if (!hasTriggeredClose) {
          hasTriggeredClose = true;
          onCloseHandlerFn();
        }
      // After 5 seconds from CLOSING state and Firefox is not rendering to close, we have to assume to close it.
      // It is dead! This fixes the case where if it's Firefox who closes the Datachannel, the connection will
      // still assume as CLOSING..
      } else if (dataChannel.readyState === self.DATA_CHANNEL_STATE.CLOSING) {
        timeBlockAfterClosing++;
      }
    }, 1000);

  } else {
    dataChannel.onclose = onCloseHandlerFn;
  }

  if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
    self._dataChannels[peerId].main = {
      channelName: channelName,
      channelType: channelType,
      transferId: null,
      channel: dataChannel
    };
  } else {
    self._dataChannels[peerId][channelName] = {
      channelName: channelName,
      channelType: channelType,
      transferId: null,
      channel: dataChannel
    };
  }
};

/**
 * Function that sends data over the Datachannel connection.
 * @method _sendMessageToDataChannel
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._sendMessageToDataChannel = function(peerId, data, channelProp) {
  var self = this;

  // Set it as "main" (MESSAGING) Datachannel
  if (!channelProp || channelProp === peerId) {
    channelProp = 'main';
  }

  // TODO: What happens when we want to send binary data over or ArrayBuffers?
  if (!(typeof data === 'object' && data) && !(data && typeof data === 'string')) {
    log.warn([peerId, 'RTCDataChannel', 'prop:' + channelProp, 'Dropping invalid data ->'], data);
    return;
  }

  if (!(self._peerConnections[peerId] &&
    self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    log.warn([peerId, 'RTCDataChannel', 'prop:' + channelProp,
      'Dropping for sending message as Peer connection does not exists or is closed ->'], data);
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId][channelProp])) {
    log.warn([peerId, 'RTCDataChannel', 'prop:' + channelProp,
      'Dropping for sending message as Datachannel connection does not exists ->'], data);
    return;
  }

  if (self._dataChannels[peerId][channelProp].channel.readyState !== self.DATA_CHANNEL_STATE.OPEN) {
    log.error([peerId, 'RTCDataChannel', 'prop:' + channelProp,
      'Dropping of sending message as Datachannel connection is not opened ->'], data);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR, peerId,
      new Error('Datachannel is not ready.\nState is: ' + self._dataChannels[peerId][channelProp].readyState),
      self._dataChannels[peerId][channelProp].channelName,
      self._dataChannels[peerId][channelProp].channelType);
    return;
  }

  log.debug([peerId, 'RTCDataChannel', 'prop:' + channelProp, 'Sending message ->'], data);

  self._dataChannels[peerId][channelProp].channel.send(typeof data === 'object' ? JSON.stringify(data) : data);
};

/**
 * Function that stops the Datachannel connection and removes object references.
 * @method _closeDataChannel
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._closeDataChannel = function(peerId, channelName) {
  var self = this;

  if (!self._dataChannels[peerId]) {
    log.warn([peerId, 'RTCDataChannel', channelName || null,
      'Aborting closing Datachannels as Peer connection does not have Datachannel sessions']);
    return;
  }

  var closeFn = function (channelProp) {
    var channelName = self._dataChannels[peerId][channelProp].channelName;
    var channelType = self._dataChannels[peerId][channelProp].channelType;

    if (self._dataChannels[peerId][channelProp].readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
      log.debug([peerId, 'RTCDataChannel', channelName, 'Closing Datachannel']);

      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSING, peerId, null, channelName, channelType);

      self._dataChannels[peerId][channelProp].channel.close();

      delete self._dataChannels[peerId][channelProp];
    }
  };

  if (!channelName) {
    for (var channelNameProp in self._dataChannels) {
      if (self._dataChannels[peerId].hasOwnProperty(channelNameProp)) {
        if (self._dataChannels[peerId][channelNameProp]) {
          closeFn(channelNameProp);
        }
      }
    }
  } else {
    if (!self._dataChannels[peerId][channelName]) {
      log.warn([peerId, 'RTCDataChannel', channelName, 'Aborting closing Datachannel as it does not exists']);
      return;
    }

    closeFn(channelName);
  }
};
Skylink.prototype.DATA_TRANSFER_DATA_TYPE = {
  BINARY_STRING: 'binaryString',
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob'
};

/**
 * Stores the data chunk size for Blob transfers.
 * @attribute _CHUNK_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._CHUNK_FILE_SIZE = 49152;

/**
 * Stores the data chunk size for Blob transfers transferring from/to
 *   Firefox browsers due to limitation tested in the past in some PCs (linx predominatly).
 * @attribute _MOZ_CHUNK_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MOZ_CHUNK_FILE_SIZE = 12288;

/**
 * Stores the data chunk size for data URI string transfers.
 * @attribute _CHUNK_DATAURL_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._CHUNK_DATAURL_SIZE = 1212;

/**
 * Function that converts Base64 string into Blob object.
 * This is referenced from devnull69@stackoverflow.com #6850276.
 * @method _base64ToBlob
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._base64ToBlob = function(dataURL) {
  var byteString = atob(dataURL.replace(/\s\r\n/g, ''));
  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var j = 0; j < byteString.length; j++) {
    ia[j] = byteString.charCodeAt(j);
  }
  // write the ArrayBuffer to a blob, and you're done
  return new Blob([ab]);
};

/**
 * Function that converts a Blob object into Base64 string.
 * @method _blobToBase64
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._blobToBase64 = function(data, callback) {
  var fileReader = new FileReader();
  fileReader.onload = function() {
    // Load Blob as dataurl base64 string
    var base64BinaryString = fileReader.result.split(',')[1];
    callback(base64BinaryString);
  };
  fileReader.readAsDataURL(data);
};

/**
 * Function that chunks Blob object based on the data chunk size provided.
 * If provided Blob object size is lesser than or equals to the chunk size, it should return an array
 *   of length of <code>1</code>.
 * @method _chunkBlobData
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._chunkBlobData = function(blob, chunkSize) {
  var chunksArray = [];
  var startCount = 0;
  var endCount = 0;
  var blobByteSize = blob.size;

  if (blobByteSize > chunkSize) {
    // File Size greater than Chunk size
    while ((blobByteSize - 1) > endCount) {
      endCount = startCount + chunkSize;
      chunksArray.push(blob.slice(startCount, endCount));
      startCount += chunkSize;
    }
    if ((blobByteSize - (startCount + 1)) > 0) {
      chunksArray.push(blob.slice(startCount, blobByteSize - 1));
    }
  } else {
    // File Size below Chunk size
    chunksArray.push(blob);
  }
  return chunksArray;
};

/**
 * Function that chunks large string into string chunks based on the data chunk size provided.
 * If provided string length is lesser than or equals to the chunk size, it should return an array
 *   of length of <code>1</code>.
 * @method _chunkDataURL
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._chunkDataURL = function(dataURL, chunkSize) {
  var outputStr = dataURL; //encodeURIComponent(dataURL);
  var dataURLArray = [];
  var startCount = 0;
  var endCount = 0;
  var dataByteSize = dataURL.size || dataURL.length;

  if (dataByteSize > chunkSize) {
    // File Size greater than Chunk size
    while ((dataByteSize - 1) > endCount) {
      endCount = startCount + chunkSize;
      dataURLArray.push(outputStr.slice(startCount, endCount));
      startCount += chunkSize;
    }
    if ((dataByteSize - (startCount + 1)) > 0) {
      chunksArray.push(outputStr.slice(startCount, dataByteSize - 1));
    }
  } else {
    // File Size below Chunk size
    dataURLArray.push(outputStr);
  }

  return dataURLArray;
};

/**
 * Function that assembles the data string chunks into a large string.
 * @method _assembleDataURL
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._assembleDataURL = function(dataURLArray) {
  var outputStr = '';

  for (var i = 0; i < dataURLArray.length; i++) {
    try {
      outputStr += dataURLArray[i];
    } catch (error) {
      console.error('Malformed', i, dataURLArray[i]);
    }
  }

  return outputStr;
};
Skylink.prototype.DT_PROTOCOL_VERSION = '0.1.0';

/**
 * The list of data transfers directions.
 * @attribute DATA_TRANSFER_TYPE
 * @param {String} UPLOAD <small>Value <code>"upload"</code></small>
 *   The value of the data transfer direction when User is uploading data to Peer.
 * @param {String} DOWNLOAD <small>Value <code>"download"</code></small>
 *   The value of the data transfer direction when User is downloading data from Peer.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_TYPE = {
  UPLOAD: 'upload',
  DOWNLOAD: 'download'
};

/**
 * The list of data transfers session types.
 * @attribute DATA_TRANSFER_SESSION_TYPE
 * @param {String} BLOB     <small>Value <code>"blob"</code></small>
 *   The value of the session type for
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> data transfer.
 * @param {String} DATA_URL <small>Value <code>"dataURL"</code></small>
 *   The value of the session type for
 *   <a href="#method_sendBlobData"><code>method_sendBlobData()</code> method</a> data transfer.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_SESSION_TYPE = {
  BLOB: 'blob',
  DATA_URL: 'dataURL'
};

/**
 * The list of data transfer states.
 * @attribute DATA_TRANSFER_STATE
 * @param {String} UPLOAD_REQUEST     <small>Value <code>"request"</code></small>
 *   The value of the state when receiving an upload data transfer request from Peer to User.
 *   <small>At this stage, the upload data transfer request from Peer may be accepted or rejected with the
 *   <a href="#method_acceptDataTransfer"><code>acceptDataTransfer()</code> method</a>.</small>
 * @param {String} UPLOAD_STARTED     <small>Value <code>"uploadStarted"</code></small>
 *   The value of the state when the data transfer request has been accepted
 *   and data transfer will start uploading data to Peer.
 *   <small>At this stage, the data transfer may be terminated with the
 *   <a href="#method_cancelDataTransfer"><code>cancelDataTransfer()</code> method</a>.</small>
 * @param {String} DOWNLOAD_STARTED   <small>Value <code>"downloadStarted"</code></small>
 *   The value of the state when the data transfer request has been accepted
 *   and data transfer will start downloading data from Peer.
 *   <small>At this stage, the data transfer may be terminated with the
 *   <a href="#method_cancelDataTransfer"><code>cancelDataTransfer()</code> method</a>.</small>
 * @param {String} REJECTED           <small>Value <code>"rejected"</code></small>
 *   The value of the state when upload data transfer request to Peer has been rejected and terminated.
 * @param {String} UPLOADING          <small>Value <code>"uploading"</code></small>
 *   The value of the state when data transfer is uploading data to Peer.
 * @param {String} DOWNLOADING        <small>Value <code>"downloading"</code></small>
 *   The value of the state when data transfer is downloading data from Peer.
 * @param {String} UPLOAD_COMPLETED   <small>Value <code>"uploadCompleted"</code></small>
 *   The value of the state when data transfer has uploaded successfully to Peer.
 * @param {String} DOWNLOAD_COMPLETED <small>Value <code>"downloadCompleted"</code></small>
 *   The value of the state when data transfer has downloaded successfully from Peer.
 * @param {String} CANCEL             <small>Value <code>"cancel"</code></small>
 *   The value of the state when data transfer has been terminated from / to Peer.
 * @param {String} ERROR              <small>Value <code>"error"</code></small>
 *   The value of the state when data transfer has errors and has been terminated from / to Peer.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.DATA_TRANSFER_STATE = {
  UPLOAD_REQUEST: 'request',
  UPLOAD_STARTED: 'uploadStarted',
  DOWNLOAD_STARTED: 'downloadStarted',
  REJECTED: 'rejected',
  CANCEL: 'cancel',
  ERROR: 'error',
  UPLOADING: 'uploading',
  DOWNLOADING: 'downloading',
  UPLOAD_COMPLETED: 'uploadCompleted',
  DOWNLOAD_COMPLETED: 'downloadCompleted'
};

/**
 * Stores the fixed delimiter that concats the Datachannel label and actual transfer ID.
 * @attribute _TRANSFER_DELIMITER
 * @type String
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._TRANSFER_DELIMITER = '_skylink__';

/**
 * Stores the list of data transfer protocols.
 * @attribute _DC_PROTOCOL_TYPE
 * @param {String} WRQ The protocol to initiate data transfer.
 * @param {String} ACK The protocol to request for data transfer chunk.
 *   Give <code>-1</code> to reject the request at the beginning and <code>0</code> to accept
 *   the data transfer request.
 * @param {String} CANCEL The protocol to terminate data transfer.
 * @param {String} ERROR The protocol when data transfer has errors and has to be terminated.
 * @param {String} MESSAGE The protocol that is used to send P2P messages.
 * @type JSON
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._DC_PROTOCOL_TYPE = {
  WRQ: 'WRQ',
  ACK: 'ACK',
  ERROR: 'ERROR',
  CANCEL: 'CANCEL',
  MESSAGE: 'MESSAGE'
};

/**
 * Stores the list of types of SDKs that do not support simultaneous data transfers.
 * @attribute _INTEROP_MULTI_TRANSFERS
 * @type Array
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._INTEROP_MULTI_TRANSFERS = ['Android', 'iOS'];

/**
 * Stores the list of uploading data transfers chunks to Peers.
 * @attribute _uploadDataTransfers
 * @param {Array} <#transferId> The uploading data transfer chunks.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._uploadDataTransfers = {};

/**
 * Stores the list of uploading data transfer sessions to Peers.
 * @attribute _uploadDataSessions
 * @param {JSON} <#transferId> The uploading data transfer session.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._uploadDataSessions = {};

/**
 * Stores the list of downloading data transfers chunks to Peers.
 * @attribute _downloadDataTransfers
 * @param {Array} <#transferId> The downloading data transfer chunks.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._downloadDataTransfers = {};

/**
 * Stores the list of downloading data transfer sessions to Peers.
 * @attribute _downloadDataSessions
 * @param {JSON} <#transferId> The downloading data transfer session.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._downloadDataSessions = {};

/**
 * Stores the list of data transfers from / to Peers.
 * @attribute _dataTransfers
 * @param {JSON} #transferId The data transfer session.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._dataTransfers = {};

/**
 * Stores the list of data transfer "wait-for-response" timeouts.
 * @attribute _dataTransfersTimeout
 * @param {Object} <#transferId> The data transfer session "wait-for-response" timeout.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._dataTransfersTimeout = {};

/**
 * <blockquote class="info">
 *   Note that Android and iOS SDKs do not support simultaneous data transfers.
 * </blockquote>
 * Function that starts an uploading data transfer from User to Peers.
 * @method sendBlobData
 * @param {Blob} data The Blob object.
 * @param {Number} [timeout=60] The timeout to wait for response from Peer.
 * @param {String|Array} [targetPeerId] The target Peer ID to start data transfer with.
 * - When provided as an Array, it will start uploading data transfers with all connections
 *   with all the Peer IDs provided.
 * - When not provided, it will start uploading data transfers with all the currently connected Peers in the Room.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_dataTransferState">
 *   <code>dataTransferState</code> event</a> triggering <code>state</code> parameter payload
 *   as <code>UPLOAD_COMPLETED</code> for all Peers targeted for request success.</small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Array} callback.error.listOfPeers The list Peer IDs targeted for the data transfer.
 * @param {JSON} callback.error.transferErrors The list of data transfer errors.
 * @param {Error|String} callback.error.transferErrors.#peerId The data transfer error associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 *   <small>If <code>#peerId</code> value is <code>"self"</code>, it means that it is the error when there
 *   are no Peer connections to start data transfer with.</small>
 * @param {JSON} callback.error.transferInfo The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {Array} callback.success.listOfPeers The list Peer IDs targeted for the data transfer.
 * @param {JSON} callback.success.transferInfo The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>Checks if should open a new Datachannel <ol>
 *   <li>If Peer connection has closed: <small>This can be checked with <a href="#event_peerConnectionState">
 *   <code>peerConnectionState</code> event</a> triggering parameter payload <code>state</code> as <code>CLOSED</code>
 *   for Peer.</small> <ol><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If Peer supports simultaneous data transfer, open new Datachannel: <ol>
 *   <li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggers parameter
 *   payload <code>state</code> as <code>CONNECTING</code> and <code>channelType</code> as <code>DATA</code>.</li>
 *   <li>If Datachannel has opened successfully: <ol>
 *   <li> <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>OPEN</code> and <code>channelType</code> as <code>DATA</code>.</li></ol></li></ol></li>
 *   <li>Else: <ol><li>If Peer connection Datachannel has not been opened <small>This can be checked with
 *   <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggering parameter
 *   payload <code>state</code> as <code>OPEN</code> and <code>channelType</code> as
 *   <code>MESSAGING</code> for Peer.</small> <ol>
 *   <li><b>ABORT</b> step and return error.</li></ol></li></ol></li></ol></li>
 *   <li>Starts the data transfer to Peer <ol>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>UPLOAD_REQUEST</code>.</li>
 *   <li><a href="#event_incomingDataRequest"><code>incomingDataRequest</code> event</a> triggers.</li>
 *   <li>Peer invokes <a href="#method_acceptDataTransfer"><code>acceptDataTransfer()</code> method</a>. <ol>
 *   <li>If parameter <code>accept</code> value is <code>true</code>: <ol>
 *   <li>User starts upload data transfer to Peer <ol>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>UPLOAD_STARTED</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>DOWNLOAD_STARTED</code>.</li></ol></li>
 *   <li>If Peer / User invokes <a href="#method_cancelDataTransfer"><code>cancelDataTransfer()</code> method</a>: <ol>
 *   <li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter
 *   <code>state</code> as <code>CANCEL</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If data transfer has errors: <ol>
 *   <li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter
 *   <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If Datachannel has closed abruptly during data transfer:
 *   <small>This can be checked with <a href="#event_dataChannelState"><code>dataChannelState</code> event</a>
 *   triggering parameter payload <code>state</code> as <code>CLOSED</code> and <code>channelType</code>
 *   as <code>DATA</code> for Peer that supports simultaneous data transfer or <code>MESSAGING</code>
 *   for Peer that do not support it.</small> <ol>
 *   <li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter
 *   <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If data transfer is still progressing: <ol>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>UPLOADING</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>DOWNLOADING</code>.</li></ol></li>
 *   <li>If data transfer has completed <ol>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>UPLOAD_COMPLETED</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>DOWNLOAD_COMPLETED</code>.</li>
 *   <li><a href="#event_incomingData"><code>incomingData</code> event</a> triggers.</li></ol></li></ol></li>
 *   <li>If parameter <code>accept</code> value is <code>false</code>: <ol>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>REJECTED</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li></ol>
 * @example
 * &lt;body&gt;
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(0)"&gt; 1s timeout (Default)
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(120)"&gt; 2s timeout
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(300)"&gt; 5s timeout
 *  &lt;hr&gt;
 *  &lt;input type="file" onchange="uploadFile(this.Files[0], this.getAttribute('data'))" data="peerId"&gt;
 *  &lt;input type="file" onchange="uploadFileGroup(this.Files[0], this.getAttribute('data').split(',')))" data="peerIdA,peerIdB"&gt;
 *  &lt;input type="file" onchange="uploadFileAll(this.Files[0])" data=""&gt;
 *  &lt;script&gt;
 *    var transferTimeout = 0;
 *
 *    function setTransferTimeout (timeout) {
 *      transferTimeout = timeout;
 *    }
 *
 *    // Example 1: Upload data to a Peer
 *    function uploadFile (file, peerId) {
 *      var cb = function (error, success) {
 *        if (error) return;
 *        console.info("File has been transferred to '" + peerId + "' successfully");
 *      };
 *      if (transferTimeout > 0) {
 *        skylinkDemo.sendBlobData(file, peerId, transferTimeout, cb);
 *      } else {
 *        skylinkDemo.sendBlobData(file, peerId, cb);
 *      }
 *    }
 *
 *    // Example 2: Upload data to a list of Peers
 *    function uploadFileGroup (file, peerIds) {
 *      var cb = function (error, success) {
 *        var listOfPeers = error ? error.listOfPeers : success.listOfPeers;
 *        var listOfPeersErrors = error ? error.transferErrors : {};
 *        for (var i = 0; i < listOfPeers.length; i++) {
 *          if (listOfPeersErrors[listOfPeers[i]]) {
 *            console.error("Failed file transfer to '" + listOfPeers[i] + "'");
 *          } else {
 *            console.info("File has been transferred to '" + listOfPeers[i] + "' successfully");
 *          }
 *        }
 *      };
 *      if (transferTimeout > 0) {
 *        skylinkDemo.sendBlobData(file, peerIds, transferTimeout, cb);
 *      } else {
 *        skylinkDemo.sendBlobData(file, peerIds, cb);
 *      }
 *    }
 *
 *    // Example 2: Upload data to a list of Peers
 *    function uploadFileAll (file) {
 *      var cb = function (error, success) {
 *        var listOfPeers = error ? error.listOfPeers : success.listOfPeers;
 *        var listOfPeersErrors = error ? error.transferErrors : {};
 *        for (var i = 0; i < listOfPeers.length; i++) {
 *          if (listOfPeersErrors[listOfPeers[i]]) {
 *            console.error("Failed file transfer to '" + listOfPeers[i] + "'");
 *          } else {
 *            console.info("File has been transferred to '" + listOfPeers[i] + "' successfully");
 *          }
 *        }
 *      };
 *      if (transferTimeout > 0) {
 *        skylinkDemo.sendBlobData(file, transferTimeout, cb);
 *      } else {
 *        skylinkDemo.sendBlobData(file, cb);
 *      }
 *    }
 * &lt;/script&gt;
 * &lt;/body&gt;
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.sendBlobData = function(data, timeout, targetPeerId, callback) {
  var listOfPeers = Object.keys(this._peerConnections);
  var isPrivate = false;
  var dataInfo = {};
  var transferId = this._user.sid + this.DATA_TRANSFER_TYPE.UPLOAD +
    (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
  // for error case
  var errorMsg, errorPayload, i, peerId; // for jshint
  var singleError = null;
  var transferErrors = {};
  var stateError = null;
  var singlePeerId = null;

  //Shift parameters
  // timeout
  if (typeof timeout === 'function') {
    callback = timeout;

  } else if (typeof timeout === 'string') {
    listOfPeers = [timeout];
    isPrivate = true;

  } else if (Array.isArray(timeout)) {
    listOfPeers = timeout;
    isPrivate = true;
  }

  // targetPeerId
  if (typeof targetPeerId === 'function'){
    callback = targetPeerId;

  // data, timeout, target [array], callback
  } else if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;

  // data, timeout, target [string], callback
  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  //state: String, Deprecated. But for consistency purposes. Null if not a single peer
  //error: Object, Deprecated. But for consistency purposes. Null if not a single peer
  //transferId: String,
  //peerId: String, Deprecated. But for consistency purposes. Null if not a single peer
  //listOfPeers: Array, NEW!!
  //isPrivate: isPrivate, NEW!!
  //transferErrors: JSON, NEW!! - Array of errors
  //transferInfo: JSON The same payload as dataTransferState transferInfo payload

  // check if it's blob data
  if (!(typeof data === 'object' && data instanceof Blob)) {
    errorMsg = 'Provided data is not a Blob data';

    if (listOfPeers.length === 0) {
      transferErrors.self = errorMsg;

    } else {
      for (i = 0; i < listOfPeers.length; i++) {
        peerId = listOfPeers[i];
        transferErrors[peerId] = errorMsg;
      }

      // Deprecated but for consistency purposes. Null if not a single peer.
      if (listOfPeers.length === 1 && isPrivate) {
        stateError = self.DATA_TRANSFER_STATE.ERROR;
        singleError = errorMsg;
        singlePeerId = listOfPeers[0];
      }
    }

    errorPayload = {
      state: stateError,
      error: singleError,
      transferId: transferId,
      peerId: singlePeerId,
      listOfPeers: listOfPeers,
      transferErrors: transferErrors,
      transferInfo: dataInfo,
      isPrivate: isPrivate
    };

    log.error(errorMsg, errorPayload);

    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback ' +
        'with error -> '],errorPayload);
      callback(errorPayload, null);
    }
    return;
  }

  // populate data
  dataInfo.name = data.name || transferId;
  dataInfo.size = data.size;
  dataInfo.timeout = typeof timeout === 'number' ? timeout : 60;
  dataInfo.transferId = transferId;
  dataInfo.dataType = 'blob';
  dataInfo.isPrivate = isPrivate;

  // check if datachannel is enabled first or not
  if (!this._enableDataChannel) {
    errorMsg = 'Unable to send any blob data. Datachannel is disabled';

    if (listOfPeers.length === 0) {
      transferErrors.self = errorMsg;

    } else {
      for (i = 0; i < listOfPeers.length; i++) {
        peerId = listOfPeers[i];
        transferErrors[peerId] = errorMsg;
      }

      // Deprecated but for consistency purposes. Null if not a single peer.
      if (listOfPeers.length === 1 && isPrivate) {
        stateError = self.DATA_TRANSFER_STATE.ERROR;
        singleError = errorMsg;
        singlePeerId = listOfPeers[0];
      }
    }

    errorPayload = {
      state: stateError,
      error: singleError,
      transferId: transferId,
      peerId: singlePeerId,
      listOfPeers: listOfPeers,
      transferErrors: transferErrors,
      transferInfo: dataInfo,
      isPrivate: isPrivate
    };

    log.error(errorMsg, errorPayload);

    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback ' +
        'with error -> '], errorPayload);
      callback(errorPayload, null);
    }
    return;
  }

  this._startDataTransfer(data, dataInfo, listOfPeers, callback);
};

/**
 * Function that accepts or rejects an upload data transfer request from Peer to User.
 * @method acceptDataTransfer
 * @param {String} peerId The Peer ID.
 * @param {String} transferId The data transfer ID.
 * @param {Boolean} [accept=false] The flag if User accepts the upload data transfer request from Peer.
 * @example
 *   // Example 1: Accept Peer upload data transfer request
 *   skylinkDemo.on("incomingDataRequest", function (transferId, peerId, transferInfo, isSelf) {
 *      if (!isSelf) {
 *        skylinkDemo.acceptDataTransfer(peerId, transferId, true);
 *      }
 *   });
 *
 *   // Example 2: Reject Peer upload data transfer request
 *   skylinkDemo.on("incomingDataRequest", function (transferId, peerId, transferInfo, isSelf) {
 *      if (!isSelf) {
 *        skylinkDemo.acceptDataTransfer(peerId, transferId, false);
 *      }
 *   });
 * @trigger <small>Event sequence follows <a href="#method_sendBlobData">
 * <code>sendBlobData()</code> method</a> after <code>acceptDataTransfer()</code> method is invoked.</small>
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.respondBlobRequest =
Skylink.prototype.acceptDataTransfer = function (peerId, transferId, accept) {
  if (typeof transferId !== 'string' && typeof peerId !== 'string') {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'data transfer ID or peer ID is not provided']);
    return;
  }

  if (!this._dataChannels[peerId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'Peer does not have any Datachannel connections']);
    return;
  }

  if (!this._dataTransfers[transferId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'invalid transfer ID is provided']);
    return;
  }

  var channelProp = 'main';

  if (this._dataChannels[peerId][transferId]) {
    channelProp = transferId;
  }

  if (accept) {
    log.debug([peerId, 'RTCDataChannel', transferId, 'Accepted data transfer and starting ...']);

    this._sendMessageToDataChannel(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: 0
    }, channelProp);

    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOAD_STARTED, transferId, peerId,
      this._getTransferInfo(transferId, true));

  } else {
    log.warn([peerId, 'RTCDataChannel', transferId, 'Rejected data transfer and data transfer request has been aborted']);

    this._sendMessageToDataChannel(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: -1
    }, channelProp);

    //this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.REJECTED, transferId, peerId,
    //  this._getTransferInfo(transferId, true));
  }
};

/**
 * Function that terminates a currently uploading / downloading data transfer from / to Peer.
 * @method cancelDataTransfer
 * @param {String} peerId The Peer ID.
 * @param {String} transferId The data transfer ID.
 * @example
 *   // Example 1: Cancel Peer data transfer
 *   var transferSessions = {};
 *
 *   skylinkDemo.on("dataTransferState", function (state, transferId, peerId) {
 *     if ([skylinkDemo.DATA_TRANSFER_STATE.DOWNLOAD_STARTED,
 *       skylinkDemo.DATA_TRANSFER_STATE.UPLOAD_STARTED].indexOf(state) > -1) {
 *       if (!Array.isArray(transferSessions[transferId])) {
 *         transferSessions[transferId] = [];
 *       }
 *       transferSessions[transferId].push(peerId);
 *     } else {
 *       transferSessions[transferId].splice(transferSessions[transferId].indexOf(peerId), 1);
 *     }
 *   });
 *
 *   function cancelTransfer (peerId, transferId) {
 *     skylinkDemo.cancelDataTransfer(peerId, transferId);
 *   }
 * @trigger <small>Event sequence follows <a href="#method_sendBlobData">
 * <code>sendBlobData()</code> method</a> after <code>cancelDataTransfer()</code> method is invoked.</small>
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.cancelBlobTransfer =
Skylink.prototype.cancelDataTransfer = function (peerId, transferId) {
  var data;

  // targetPeerId + '-' + transferId
  var channelName = peerId + '-' + transferId;

  if (transferId.indexOf(this._TRANSFER_DELIMITER) > 0) {
    channelName = transferId.split(this._TRANSFER_DELIMITER)[0];
  } else {

    var peerAgent = (this._peerInformations[peerId] || {}).agent;

    if (!peerAgent && !peerAgent.name) {
      log.error([peerId, 'RTCDataChannel', null, 'Cancel transfer to peer ' +
        'failed as peer agent information for peer does not exists'], transferId);
      return;
    }

    if (self._INTEROP_MULTI_TRANSFERS.indexOf(peerAgent.name) > -1) {
      channelName = peerId;
    }
  }

  if (this._uploadDataSessions[channelName]) {
    data = this._uploadDataSessions[channelName];

    delete this._uploadDataSessions[channelName];
    delete this._uploadDataTransfers[channelName];

    // send message
    this._sendMessageToDataChannel(peerId, {
      type: this._DC_PROTOCOL_TYPE.CANCEL,
      sender: this._user.sid,
      name: data.name,
      content: 'Peer cancelled upload transfer'
    }, channelName);

    log.debug([peerId, 'RTCDataChannel', channelName,
      'Cancelling upload data transfers'], transferId);

  } else if (this._downloadDataSessions[channelName]) {
    data = this._downloadDataSessions[channelName];

    delete this._downloadDataSessions[channelName];
    delete this._downloadDataTransfers[channelName];

    // send message
    this._sendMessageToDataChannel(peerId, {
      type: this._DC_PROTOCOL_TYPE.CANCEL,
      sender: this._user.sid,
      name: data.name,
      content: 'Peer cancelled download transfer'
    }, channelName);

    log.debug([peerId, 'RTCDataChannel', channelName,
      'Cancelling download data transfers'], transferId);

  } else {
    log.error([peerId, 'RTCDataChannel', null, 'Cancel transfer to peer ' +
      'failed as transfer session with peer does not exists'], transferId);
    return;
  }

  this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.CANCEL,
    data.transferId, peerId, {
      name: data.name,
      size: data.size,
      percentage: data.percentage,
      data: null,
      dataType: data.dataType,
      senderPeerId: data.senderPeerId,
      timeout: data.timeout,
      isPrivate: data.isPrivate
  });
};

/**
 * Function that sends a message to Peers via the Datachannel connection.
 * <small>Consider using <a href="#method_sendURLData"><code>sendURLData()</code> method</a> if you are
 * sending large strings to Peers.</small>
 * @method sendP2PMessage
 * @param {String|JSON} message The message.
 * @param {String|Array} [targetPeerId] The target Peer ID to send message to.
 * - When provided as an Array, it will send the message to only Peers which IDs are in the list.
 * - When not provided, it will broadcast the message to all connected Peers in the Room.
 * @trigger <ol class="desc-seq">
 *  <li>Sends P2P message to all targeted Peers. <ol>
 *  <li>If Peer connection Datachannel has not been opened: <small>This can be checked with
 *  <a href="#event_dataChannelState"><code>dataChannelState</code> event</a>
 *  triggering parameter payload <code>state</code> as <code>OPEN</code> and
 *  <code>channelType</code> as <code>MESSAGING</code> for Peer.</small> <ol>
 *  <li><b>ABORT</b> step and return error.</li></ol></li>
 *  <li><a href="#event_incomingMessage"><code>incomingMessage</code> event</a> triggers
 *  parameter payload <code>message.isDataChannel</code> value as <code>true</code> and
 *  <code>isSelf</code> value as <code>true</code>.</li></ol></li></ol>
 * @example
 *   // Example 1: Broadcasting to all Peers
 *   skylinkDemo.on("dataChannelState", function (state, peerId, error, channelName, channelType) {
 *      if (state === skylinkDemo.DATA_CHANNEL_STATE.OPEN &&
 *        channelType === skylinkDemo.DATA_CHANNEL_TYPE.MESSAGING) {
 *        skylinkDemo.sendP2PMessage("Hi all!");
 *      }
 *   });
 *
 *   // Example 2: Sending to specific Peers
 *   var peersInExclusiveParty = [];
 *
 *   skylinkDemo.on("peerJoined", function (peerId, peerInfo, isSelf) {
 *     if (isSelf) return;
 *     if (peerInfo.userData.exclusive) {
 *       peersInExclusiveParty[peerId] = false;
 *     }
 *   });
 *
 *   skylinkDemo.on("dataChannelState", function (state, peerId, error, channelName, channelType) {
 *      if (state === skylinkDemo.DATA_CHANNEL_STATE.OPEN &&
 *        channelType === skylinkDemo.DATA_CHANNEL_TYPE.MESSAGING) {
 *        peersInExclusiveParty[peerId] = true;
 *      }
 *   });
 *
 *   function updateExclusivePartyStatus (message) {
 *     var readyToSend = [];
 *     for (var p in peersInExclusiveParty) {
 *       if (peersInExclusiveParty.hasOwnProperty(p)) {
 *         readyToSend.push(p);
 *       }
 *     }
 *     skylinkDemo.sendP2PMessage(message, readyToSend);
 *   }
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.sendP2PMessage = function(message, targetPeerId) {
  var self = this;

  // check if datachannel is enabled first or not
  if (!self._enableDataChannel) {
    log.warn('Unable to send any P2P message. Datachannel is disabled');
    return;
  }

  var listOfPeers = Object.keys(self._dataChannels);
  var isPrivate = false;

  //targetPeerId is defined -> private message
  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;

  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  // sending public message to MCU to relay. MCU case only
  if (self._hasMCU) {
    if (isPrivate) {
      log.log(['MCU', null, null, 'Relaying private P2P message to peers'], listOfPeers);
      self._sendMessageToDataChannel('MCU', {
        type: self._DC_PROTOCOL_TYPE.MESSAGE,
        isPrivate: isPrivate,
        sender: self._user.sid,
        target: listOfPeers,
        data: message
      });
    } else {
      log.log(['MCU', null, null, 'Relaying P2P message to peers']);

      self._sendMessageToDataChannel('MCU', {
        type: self._DC_PROTOCOL_TYPE.MESSAGE,
        isPrivate: isPrivate,
        sender: self._user.sid,
        target: 'MCU',
        data: message
      });
    }
  } else {
    for (var i = 0; i < listOfPeers.length; i++) {
      var peerId = listOfPeers[i];
      var useChannel = (self._hasMCU) ? 'MCU' : peerId;

      // Ignore MCU peer
      if (peerId === 'MCU') {
        continue;
      }

      log.log([peerId, null, useChannel, 'Sending P2P message to peer']);

      self._sendMessageToDataChannel(useChannel, {
        type: self._DC_PROTOCOL_TYPE.MESSAGE,
        isPrivate: isPrivate,
        sender: self._user.sid,
        target: peerId,
        data: message
      });
    }
  }

  self._trigger('incomingMessage', {
    content: message,
    isPrivate: isPrivate,
    targetPeerId: targetPeerId || null,
    isDataChannel: true,
    senderPeerId: self._user.sid
  }, self._user.sid, self.getPeerInfo(), true);
};

/**
 * <blockquote class="info">
 *   Currently, the Android and iOS SDKs do not support this type of data transfer.
 * </blockquote>
 * Function that starts an uploading string data transfer from User to Peers.
 * @method sendURLData
 * @param {String} data The data string to transfer to Peer.
 *   <small>Parameter signature follows <a href="#method_sendBlobData">
 *   <code>sendBlobData()</code> method</a> except <code>data</code> parameter.</small>
 * @trigger <small>Event sequence follows <a href="#method_sendBlobData">
 * <code>sendBlobData()</code> method</a>.</small>
 * @example
 * &lt;body&gt;
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(0)"&gt; 1s timeout (Default)
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(120)"&gt; 2s timeout
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(300)"&gt; 5s timeout
 *  &lt;hr&gt;
 *  &lt;input type="file" onchange="showImage(this.Files[0], this.getAttribute('data'))" data="peerId"&gt;
 *  &lt;input type="file" onchange="showImageGroup(this.Files[0], this.getAttribute('data').split(',')))" data="peerIdA,peerIdB"&gt;
 *  &lt;input type="file" onchange="showImageAll(this.Files[0])" data=""&gt;
 *  &lt;image id="target-1" src=""&gt;
 *  &lt;image id="target-2" src=""&gt;
 *  &lt;image id="target-3" src=""&gt;
 *  &lt;script&gt;
 *    var transferTimeout = 0;
 *
 *    function setTransferTimeout (timeout) {
 *      transferTimeout = timeout;
 *    }
 *
 *    function retrieveImageDataURL(file, cb) {
 *      var fr = new FileReader();
 *      fr.onload = function () {
 *        cb(fr.result);
 *      };
 *      fr.readAsDataURL(files[0]);
 *    }
 *
 *    // Example 1: Send image data URL to a Peer
 *    function showImage (file, peerId) {
 *      var cb = function (error, success) {
 *        if (error) return;
 *        console.info("Image has been transferred to '" + peerId + "' successfully");
 *      };
 *      retrieveImageDataURL(file, function (str) {
 *        if (transferTimeout > 0) {
 *          skylinkDemo.sendURLData(str, peerId, transferTimeout, cb);
 *        } else {
 *          skylinkDemo.sendURLData(str, peerId, cb);
 *        }
 *        document.getElementById("target-1").src = str;
 *      });
 *    }
 *
 *    // Example 2: Send image data URL to a list of Peers
 *    function showImageGroup (file, peerIds) {
 *      var cb = function (error, success) {
 *        var listOfPeers = error ? error.listOfPeers : success.listOfPeers;
 *        var listOfPeersErrors = error ? error.transferErrors : {};
 *        for (var i = 0; i < listOfPeers.length; i++) {
 *          if (listOfPeersErrors[listOfPeers[i]]) {
 *            console.error("Failed image transfer to '" + listOfPeers[i] + "'");
 *          } else {
 *            console.info("Image has been transferred to '" + listOfPeers[i] + "' successfully");
 *          }
 *        }
 *      };
 *      retrieveImageDataURL(file, function (str) {
 *        if (transferTimeout > 0) {
 *          skylinkDemo.sendURLData(str, peerIds, transferTimeout, cb);
 *        } else {
 *          skylinkDemo.sendURLData(str, peerIds, cb);
 *        }
 *        document.getElementById("target-2").src = str;
 *      });
 *    }
 *
 *    // Example 2: Send image data URL to a list of Peers
 *    function uploadFileAll (file) {
 *      var cb = function (error, success) {
 *        var listOfPeers = error ? error.listOfPeers : success.listOfPeers;
 *        var listOfPeersErrors = error ? error.transferErrors : {};
 *        for (var i = 0; i < listOfPeers.length; i++) {
 *          if (listOfPeersErrors[listOfPeers[i]]) {
 *            console.error("Failed image transfer to '" + listOfPeers[i] + "'");
 *          } else {
 *            console.info("Image has been transferred to '" + listOfPeers[i] + "' successfully");
 *          }
 *        }
 *      };
 *      retrieveImageDataURL(file, function (str) {
 *        if (transferTimeout > 0) {
 *          skylinkDemo.sendURLData(str, transferTimeout, cb);
 *        } else {
 *          skylinkDemo.sendURLData(str, cb);
 *        }
 *        document.getElementById("target-3").src = str;
 *      });
 *    }
 * &lt;/script&gt;
 * &lt;/body&gt;
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.sendURLData = function(data, timeout, targetPeerId, callback) {
  var listOfPeers = Object.keys(this._peerConnections);
  var isPrivate = false;
  var dataInfo = {};
  var transferId = this._user.sid + this.DATA_TRANSFER_TYPE.UPLOAD +
    (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
  // for error case
  var errorMsg, errorPayload, i, peerId; // for jshint
  var singleError = null;
  var transferErrors = {};
  var stateError = null;
  var singlePeerId = null;

  //Shift parameters
  // timeout
  if (typeof timeout === 'function') {
    callback = timeout;

  } else if (typeof timeout === 'string') {
    listOfPeers = [timeout];
    isPrivate = true;

  } else if (Array.isArray(timeout)) {
    listOfPeers = timeout;
    isPrivate = true;
  }

  // targetPeerId
  if (typeof targetPeerId === 'function'){
    callback = targetPeerId;

  // data, timeout, target [array], callback
  } else if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;

  // data, timeout, target [string], callback
  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  //state: String, Deprecated. But for consistency purposes. Null if not a single peer
  //error: Object, Deprecated. But for consistency purposes. Null if not a single peer
  //transferId: String,
  //peerId: String, Deprecated. But for consistency purposes. Null if not a single peer
  //listOfPeers: Array, NEW!!
  //isPrivate: isPrivate, NEW!!
  //transferErrors: JSON, NEW!! - Array of errors
  //transferInfo: JSON The same payload as dataTransferState transferInfo payload

  // check if it's blob data
  if (typeof data !== 'string') {
    errorMsg = 'Provided data is not a dataURL';

    if (listOfPeers.length === 0) {
      transferErrors.self = errorMsg;

    } else {
      for (i = 0; i < listOfPeers.length; i++) {
        peerId = listOfPeers[i];
        transferErrors[peerId] = errorMsg;
      }

      // Deprecated but for consistency purposes. Null if not a single peer.
      if (listOfPeers.length === 1 && isPrivate) {
        stateError = self.DATA_TRANSFER_STATE.ERROR;
        singleError = errorMsg;
        singlePeerId = listOfPeers[0];
      }
    }

    errorPayload = {
      state: stateError,
      error: singleError,
      transferId: transferId,
      peerId: singlePeerId,
      listOfPeers: listOfPeers,
      transferErrors: transferErrors,
      transferInfo: dataInfo,
      isPrivate: isPrivate
    };

    log.error(errorMsg, errorPayload);

    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback ' +
        'with error -> '],errorPayload);
      callback(errorPayload, null);
    }
    return;
  }

  // populate data
  dataInfo.name = data.name || transferId;
  dataInfo.size = data.size || data.length;
  dataInfo.timeout = typeof timeout === 'number' ? timeout : 60;
  dataInfo.transferId = transferId;
  dataInfo.dataType = 'dataURL';
  dataInfo.isPrivate = isPrivate;

  // check if datachannel is enabled first or not
  if (!this._enableDataChannel) {
    errorMsg = 'Unable to send any dataURL. Datachannel is disabled';

    if (listOfPeers.length === 0) {
      transferErrors.self = errorMsg;

    } else {
      for (i = 0; i < listOfPeers.length; i++) {
        peerId = listOfPeers[i];
        transferErrors[peerId] = errorMsg;
      }

      // Deprecated but for consistency purposes. Null if not a single peer.
      if (listOfPeers.length === 1 && isPrivate) {
        stateError = self.DATA_TRANSFER_STATE.ERROR;
        singleError = errorMsg;
        singlePeerId = listOfPeers[0];
      }
    }

    errorPayload = {
      state: stateError,
      error: singleError,
      transferId: transferId,
      peerId: singlePeerId,
      listOfPeers: listOfPeers,
      transferErrors: transferErrors,
      transferInfo: dataInfo,
      isPrivate: isPrivate
    };

    log.error(errorMsg, errorPayload);

    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback ' +
        'with error -> '], errorPayload);
      callback(errorPayload, null);
    }
    return;
  }

  this._startDataTransfer(data, dataInfo, listOfPeers, callback);
};

/**
 * Function that sets the data transfer "wait-for-response" timeout.
 * When there is not response after timeout, the data transfer will be terminated.
 * @method _setDataChannelTimeout
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._setDataChannelTimeout = function(peerId, timeout, isSender, channelName) {
  var self = this;
  if (!self._dataTransfersTimeout[channelName]) {
    self._dataTransfersTimeout[channelName] = null;
  }
  var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
    self.DATA_TRANSFER_TYPE.DOWNLOAD;

  self._dataTransfersTimeout[channelName] = setTimeout(function() {
    var name;
    if (self._dataTransfersTimeout[channelName][type]) {
      if (isSender) {
        name = self._uploadDataSessions[channelName].name;
        delete self._uploadDataTransfers[channelName];
        delete self._uploadDataSessions[channelName];
      } else {
        name = self._downloadDataSessions[channelName].name;
        delete self._downloadDataTransfers[channelName];
        delete self._downloadDataSessions[channelName];
      }

      self._sendMessageToDataChannel(peerId, {
        type: self._DC_PROTOCOL_TYPE.ERROR,
        sender: self._user.sid,
        name: name,
        content: 'Connection Timeout. Longer than ' + timeout +
          ' seconds. Connection is abolished.',
        isUploadError: isSender
      }, channelName);
      // TODO: Find a way to add channel name so it's more specific
      log.error([peerId, 'RTCDataChannel', channelName, 'Failed transfering data:'],
        'Transfer ' + ((isSender) ? 'for': 'from') + ' ' + peerId +
        ' failed. Connection timeout');
      self._clearDataChannelTimeout(peerId, isSender, channelName);
    }
  }, 1000 * timeout);
};

/**
 * Function that stops and clears the data transfer "wait-for-response" timeout.
 * @method _clearDataChannelTimeout
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._clearDataChannelTimeout = function(peerId, isSender, channelName) {
  if (this._dataTransfersTimeout[channelName]) {
    clearTimeout(this._dataTransfersTimeout[channelName]);
    delete this._dataTransfersTimeout[channelName];
    log.debug([peerId, 'RTCDataChannel', channelName, 'Clear datachannel timeout']);
  } else {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Unable to find timeouts. ' +
      'Not clearing the datachannel timeouts']);
  }
};

/**
 * Function that starts a data transfer to Peer.
 * This will open a new data type of Datachannel connection with Peer if
 *   simultaneous data transfers is supported by Peer.
 * @method _sendBlobDataToPeer
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._sendBlobDataToPeer = function(data, dataInfo, targetPeerId) {
  var self = this;
  //If there is MCU then directs all messages to MCU
  var targetChannel = targetPeerId;//(self._hasMCU) ? 'MCU' : targetPeerId;
  var targetPeerList = [];

  var binarySize = 4 * Math.ceil(dataInfo.size / 3); //parseInt((dataInfo.size * (4 / 3)).toFixed(), 10);
  var binaryChunkSize = 0;
  var chunkSize = 0;
  var i;
  var hasSend = false;

  // move list of peers to targetPeerList
  if (self._hasMCU) {
    if (Array.isArray(targetPeerList)) {
      targetPeerList = targetPeerId;
    } else {
      targetPeerList = [targetPeerId];
    }
    targetPeerId = 'MCU';
  }

  if (dataInfo.dataType !== 'blob') {
    // output: 1616
    binaryChunkSize = self._CHUNK_DATAURL_SIZE;
    chunkSize = self._CHUNK_DATAURL_SIZE;
    binarySize = dataInfo.size;
  } else if (window.webrtcDetectedBrowser === 'firefox') {
    // output: 16384
    binaryChunkSize = self._MOZ_CHUNK_FILE_SIZE; //self._MOZ_CHUNK_FILE_SIZE * (4 / 3);
    chunkSize = self._MOZ_CHUNK_FILE_SIZE;
  } else {
    // output: 65536
    binaryChunkSize = self._CHUNK_FILE_SIZE; //parseInt((self._CHUNK_FILE_SIZE * (4 / 3)).toFixed(), 10);
    chunkSize = self._CHUNK_FILE_SIZE;
  }

  var throwTransferErrorFn = function (message) {
    // MCU targetPeerId case - list of peers
    if (self._hasMCU) {
      for (i = 0; i < targetPeerList.length; i++) {
        var peerId = targetPeerList[i];
        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR,
          dataInfo.transferId, peerId, {
            name: dataInfo.name,
            size: dataInfo.size,
            percentage: 0,
            data: null,
            dataType: dataInfo.dataType,
            senderPeerId: self._user.sid,
            timeout: dataInfo.timeout,
            isPrivate: dataInfo.isPrivate
          },{
            message: message,
            transferType: self.DATA_TRANSFER_TYPE.UPLOAD
        });
      }
    } else {
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR,
        dataInfo.transferId, targetPeerId, {
          name: dataInfo.name,
          size: dataInfo.size,
          percentage: 0,
          data: null,
          dataType: dataInfo.dataType,
          senderPeerId: self._user.sid,
          timeout: dataInfo.timeout,
          isPrivate: dataInfo.isPrivate
        },{
          message: message,
          transferType: self.DATA_TRANSFER_TYPE.UPLOAD
      });
    }
  };

  var startTransferFn = function (targetId, channel) {
    if (!hasSend) {
      hasSend = true;
      var payload = {
        type: self._DC_PROTOCOL_TYPE.WRQ,
        sender: self._user.sid,
        agent: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        name: dataInfo.name,
        size: binarySize,
        dataType: dataInfo.dataType,
        chunkSize: binaryChunkSize,
        timeout: dataInfo.timeout,
        target: self._hasMCU ? targetPeerList : targetPeerId,
        isPrivate: dataInfo.isPrivate
      };

      if (self._hasMCU) {
        // if has MCU and is public, do not send individually
        self._sendMessageToDataChannel('MCU', payload, channel);
        try {
          var mainChannel = self._dataChannels.MCU.main.label;
          self._setDataChannelTimeout('MCU', dataInfo.timeout, true, mainChannel);
        } catch (error) {
          log.error(['MCU', 'RTCDataChannel', 'MCU', 'Failed setting datachannel ' +
            'timeout for MCU'], error);
        }
      } else {
        // if has MCU and is public, do not send individually
        self._sendMessageToDataChannel(targetId, payload, channel);
        self._setDataChannelTimeout(targetId, dataInfo.timeout, true, channel);
      }

    }
  };

  log.log([targetPeerId, 'RTCDataChannel', targetChannel, 'Chunk size of data:'], {
    chunkSize: chunkSize,
    binaryChunkSize: binaryChunkSize,
    transferId: dataInfo.transferId,
    dataType: dataInfo.dataType
  });


  var supportMulti = false;
  var peerAgent = (self._peerInformations[targetPeerId] || {}).agent || {};

  if (!peerAgent && !peerAgent.name) {
    log.error([targetPeerId, 'RTCDataChannel', targetChannel, 'Aborting transfer to peer ' +
      'as peer agent information for peer does not exists'], dataInfo);
    throwTransferErrorFn('Peer agent information for peer does not exists');
    return;
  }

  if (self._INTEROP_MULTI_TRANSFERS.indexOf(peerAgent.name) === -1) {

    targetChannel = targetPeerId + '-' + dataInfo.transferId;
    supportMulti = true;

    if (!(self._dataChannels[targetPeerId] || {}).main) {
      log.error([targetPeerId, 'RTCDataChannel', targetChannel,
        'Main datachannel does not exists'], dataInfo);
      throwTransferErrorFn('Main datachannel does not exists');
      return;

    } else if (self._dataChannels[targetPeerId].main.channel.readyState !==
      self.DATA_CHANNEL_STATE.OPEN) {
      log.error([targetPeerId, 'RTCDataChannel', targetChannel,
        'Main datachannel is not opened'], {
          transferId: dataInfo.transferId,
          readyState: self._dataChannels[targetPeerId].main.readyState
      });
      throwTransferErrorFn('Main datachannel is not opened');
      return;
    }

    self._createDataChannel(targetPeerId, targetChannel);

  } else {
    var ongoingTransfer = null;

    if (self._uploadDataSessions[targetChannel]) {
      ongoingTransfer = self.DATA_TRANSFER_TYPE.UPLOAD;
    } else if (self._downloadDataSessions[targetChannel]) {
      ongoingTransfer = self.DATA_TRANSFER_TYPE.DOWNLOAD;
    }

    if (ongoingTransfer) {
      log.error([targetPeerId, 'RTCDataChannel', targetChannel, 'User have ongoing ' +
        ongoingTransfer + ' transfer session with peer. Unable to send data'], dataInfo);
      throwTransferErrorFn('Another ' + ongoingTransfer +
        ' transfer is ongoing. Unable to send data.');
      return;
    }
  }

  if (dataInfo.dataType === 'blob') {
    self._uploadDataTransfers[targetChannel] = self._chunkBlobData(data, chunkSize);
  } else {
    self._uploadDataTransfers[targetChannel] = self._chunkDataURL(data, chunkSize);
  }

  self._uploadDataSessions[targetChannel] = {
    name: dataInfo.name,
    size: binarySize,
    isUpload: true,
    senderPeerId: self._user.sid,
    transferId: dataInfo.transferId,
    percentage: 0,
    timeout: dataInfo.timeout,
    chunkSize: chunkSize,
    dataType: dataInfo.dataType,
    isPrivate: dataInfo.isPrivate
  };

  if (supportMulti) {
    self._condition('dataChannelState', function () {
      startTransferFn(targetPeerId, targetChannel);
    }, function () {
      return self._dataChannels[targetPeerId][targetChannel].readyState ===
        self.DATA_CHANNEL_STATE.OPEN;
    }, function (state) {
      return state === self.DATA_CHANNEL_STATE.OPEN;
    });
  } else {
    startTransferFn(targetChannel, targetChannel);
  }

  return targetChannel;
};

/**
 * Function that handles the data received from Datachannel and
 * routes to the relevant data transfer protocol handler.
 * @method _processDataChannelData
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._processDataChannelData = function(rawData, peerId, channelName, channelType) {
  if (!this._peerConnections[peerId]) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Dropping data received from Peer ' +
      'as connection is not present ->'], rawData);
    return;
  }

  var data = rawData;
  var channelProp = channelType === this.DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;

  // Expect as string
  if (typeof rawData === 'string') {
    try {
      data = JSON.parse(rawData);

      log.debug([peerId, 'RTCDataChannel', channelName, 'Received protocol message ->'], data);

      switch (data.type) {
        case this._DC_PROTOCOL_TYPE.WRQ:
          this._WRQProtocolHandler(peerId, data, channelProp);
          break;
        case this._DC_PROTOCOL_TYPE.ACK:
          this._ACKProtocolHandler(peerId, data, channelName);
          break;
        case this._DC_PROTOCOL_TYPE.ERROR:
          this._ERRORProtocolHandler(peerId, data, channelName);
          break;
        case this._DC_PROTOCOL_TYPE.CANCEL:
          this._CANCELProtocolHandler(peerId, data, channelName);
          break;
        case this._DC_PROTOCOL_TYPE.MESSAGE:
          this._MESSAGEProtocolHandler(peerId, data, channelName);
          break;
        default:
          log.warn([peerId, 'RTCDataChannel', channelName, 'Discarded unknown protocol message ->'], data);
      }
    
    } catch (error) {
      log.debug([peerId, 'RTCDataChannel', channelName, 'Received binary string chunk']);

      this._DATAProtocolHandler(peerId, data, this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING, channelName);
    }

  } else {
    var chunkDataType = rawData instanceof Blob ? this.DATA_TRANSFER_DATA_TYPE.BLOB :
      this.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;

    if (rawData.constructor && rawData.constructor.name === 'Array') {
      // Need to re-parse on some browsers
      data = new Int8Array(dataString);
    }

    log.debug([peerId, 'RTCDataChannel', channelName, 'Received binary data chunk']);

    this._DATAProtocolHandler(peerId, data, chunkDataType, channelName);
  }
};

/**
 * Function that returns the data transfer session.
 * @method _getTransferInfo
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getTransferInfo = function (transferId, returnDataProp, peerId) {
  if (this._dataTransfers[transferId]) {
    var transferInfo = clone(this._dataTransfers[transferId].session);

    if (this._dataTransfers[transferId].session.direction === this.DATA_TRANSFER_TYPE.DOWNLOAD) {
      if (this._dataTransfers[transferId].data.receivedSize >= this._dataTransfers[transferId].session.size) {
        transferInfo.percentage = 100;

      } else {
        transferInfo.percentage = parseFloat(((this._dataTransfers[transferId].data.receivedSize /
          this._dataTransfers[transferId].session.size) * 100).toFixed(2), 10);
      }

    } else {
      if (this._dataTransfers[transferId].data.peers[peerId] >= this._dataTransfers[transferId].data.chunks.length) {
        transferInfo.percentage = 100;
      }
    }

    if (returnDataProp) {
      if (transferInfo.percentage === 100) {
        transferInfo.data = this._getTransferData(transferId);
      } else {
        transferInfo.data = null;
      }
    }

    return transferInfo;
  }

  return {};
};

/**
 * Function that returns the compiled data transfer data.
 * @method _getTransferData
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getTransferData = function (transferId) {
  if (this._dataTransfers[transferId]) {
    if (this._dataTransfers[transferId].session.dataType === this.DATA_TRANSFER_SESSION_TYPE.BLOB) {
      return new Blob(this._dataTransfers[transferId].data.chunks, {
        type: this._dataTransfers[transferId].session.mimeType || ''
      });
    }
    return this._assembleDataURL(this._dataTransfers[transferId].data.chunks);
  }
  return null;
};

/**
 * Function that handles the "WRQ" data transfer protocol.
 * @method _WRQProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._WRQProtocolHandler = function(peerId, data, channelProp) {
  var transferId = channelProp === 'main' ? data.transferId || peerId + '_' + (new Date()).getTime() : channelProp;

  this._dataTransfers[transferId] = {
    session: {
      name: data.name || transferId,
      size: data.size || 0,
      timeout: data.timeout || 60,
      isPrivate: !!data.isPrivate,
      senderPeerId: data.sender || peerId,
      dataType: data.dataType || this.DATA_TRANSFER_SESSION_TYPE.BLOB,
      mimeType: data.mimeType || null,
      chunkType: data.chunkType || this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
      direction: this.DATA_TRANSFER_TYPE.DOWNLOAD
    },
    data: {
      chunks: [],
      chunkSize: data.chunkSize,
      receivedSize: 0,
      ackN: 0
    },
    responseTimer: null
  };

  this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.UPLOAD_REQUEST, transferId, peerId,
    this._getTransferInfo(transferId, true), null);
  this._trigger('incomingDataRequest', transferId, peerId,
    this._getTransferInfo(transferId, false), false);
};

/**
 * Function that handles the "ACK" data transfer protocol.
 * @method _ACKProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ACKProtocolHandler = function(peerId, data, channelName) {
  var self = this;
  var ackN = data.ackN;
  var transferStatus = self._uploadDataSessions[channelName];

  if (!transferStatus) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Ignoring data received as ' +
      'upload data transfers is empty'], {
        status: transferStatus,
        data: data
    });
    return;
  }

  if (!this._uploadDataTransfers[channelName]) {
    log.error([peerId, 'RTCDataChannel', channelName,
      'Ignoring data received as upload data transfers array is missing'], {
        data: data
    });
    return;
  }

  //peerId = (peerId === 'MCU') ? data.sender : peerId;
  var chunksLength = self._uploadDataTransfers[channelName].length;
  var transferId = transferStatus.transferId;
  var timeout = transferStatus.timeout;

  self._clearDataChannelTimeout(peerId, true, channelName);
  log.log([peerId, 'RTCDataChannel', channelName, 'ACK stage (' +
    transferStatus.transferId + ') ->'], ackN + ' / ' + chunksLength);

  if (ackN > -1) {
    // Still uploading
    if (ackN < chunksLength) {
      var sendDataFn = function (base64BinaryString) {
        var percentage = parseFloat((((ackN + 1) / chunksLength) * 100).toFixed(2), 10);

        if (!self._uploadDataSessions[channelName]) {
          log.error([peerId, 'RTCDataChannel', channelName,
            'Failed uploading as data session is empty'], {
              status: transferStatus,
              data: data
          });
          return;
        }

        self._uploadDataSessions[channelName].percentage = percentage;

        self._sendMessageToDataChannel(peerId, base64BinaryString, channelName);
        self._setDataChannelTimeout(peerId, timeout, true, channelName);

        // to prevent from firing upload = 100;
        if (percentage !== 100) {
          self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOADING,
            transferId, peerId, {
              name: transferStatus.name,
              size: transferStatus.size,
              percentage: percentage,
              data: null,
              dataType: transferStatus.dataType,
              senderPeerId: transferStatus.senderPeerId,
              timeout: transferStatus.timeout,
              isPrivate: transferStatus.isPrivate
          });
        }
      };

      if (transferStatus.dataType === 'blob') {
        self._blobToBase64(self._uploadDataTransfers[channelName][ackN], sendDataFn);
      } else {
        sendDataFn(self._uploadDataTransfers[channelName][ackN]);
      }
    } else if (ackN === chunksLength) {
	    log.log([peerId, 'RTCDataChannel', channelName, 'Upload completed (' +
        transferStatus.transferId + ')'], transferStatus);

      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, transferId, peerId, {
          name: transferStatus.name,
          size: transferStatus.size,
          percentage: 100,
          data: null,
          dataType: transferStatus.dataType,
          senderPeerId: transferStatus.senderPeerId,
          timeout: transferStatus.timeout,
          isPrivate: transferStatus.isPrivate
      });

      var blob = null;

      if (transferStatus.dataType === 'blob') {
        blob = new Blob(self._uploadDataTransfers[channelName]);
      } else {
        blob = self._assembleDataURL(self._uploadDataTransfers[channelName]);
      }

      self._trigger('incomingData', blob, transferId, peerId, {
        name: transferStatus.name,
        size: transferStatus.size,
        percentage: 100,
        dataType: transferStatus.dataType,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout,
        isPrivate: transferStatus.isPrivate
      }, true);
      delete self._uploadDataTransfers[channelName];
      delete self._uploadDataSessions[channelName];

      // close datachannel after transfer
      if (self._dataChannels[peerId] && self._dataChannels[peerId][channelName]) {
        log.debug([peerId, 'RTCDataChannel', channelName, 'Closing datachannel for upload transfer']);
        self._closeDataChannel(peerId, channelName);
      }
    }
  } else {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Upload rejected (' +
      transferStatus.transferId + ')'], transferStatus);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.REJECTED,
      transferId, peerId, {
        name: transferStatus.name, //self._uploadDataSessions[channelName].name,
        size: transferStatus.size, //self._uploadDataSessions[channelName].size,
        percentage: 0,
        data: null,
        dataType: transferStatus.dataType,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout,
        isPrivate: transferStatus.isPrivate
    });
    delete self._uploadDataTransfers[channelName];
    delete self._uploadDataSessions[channelName];

    // close datachannel if rejected
    if (self._dataChannels[peerId] && self._dataChannels[peerId][channelName]) {
      log.debug([peerId, 'RTCDataChannel', channelName, 'Closing datachannel for upload transfer']);
      self._closeDataChannel(peerId, channelName);
    }
  }
};

/**
 * Function that handles the "MESSAGE" data transfer protocol.
 * @method _MESSAGEProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MESSAGEProtocolHandler = function(peerId, data, channelName) {
  var targetMid = data.sender;
  log.log([targetMid, 'RTCDataChannel', channelName,
    'Received P2P message from peer:'], data);
  this._trigger('incomingMessage', {
    content: data.data,
    isPrivate: data.isPrivate,
    isDataChannel: true,
    targetPeerId: this._user.sid,
    senderPeerId: targetMid
  }, targetMid, this.getPeerInfo(targetMid), false);
};

/**
 * Function that handles the "ERROR" data transfer protocol.
 * @method _ERRORProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ERRORProtocolHandler = function(peerId, data, channelName) {
  var isUploader = data.isUploadError;
  var transferStatus = (isUploader) ? this._uploadDataSessions[channelName] :
    this._downloadDataSessions[channelName];

  if (!transferStatus) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Ignoring data received as ' +
      (isUploader ? 'upload' : 'download') + ' data session is empty'], data);
    return;
  }

  var transferId = transferStatus.transferId;

  log.error([peerId, 'RTCDataChannel', channelName,
    'Received an error from peer:'], data);
  this._clearDataChannelTimeout(peerId, isUploader, channelName);
  this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR,
    transferId, peerId, {
      name: transferStatus.name,
      size: transferStatus.size,
      percentage: transferStatus.percentage,
      data: null,
      dataType: transferStatus.dataType,
      senderPeerId: transferStatus.senderPeerId,
      timeout: transferStatus.timeout,
      isPrivate: transferStatus.isPrivate
    }, {
      message: data.content,
      transferType: ((isUploader) ? this.DATA_TRANSFER_TYPE.UPLOAD :
        this.DATA_TRANSFER_TYPE.DOWNLOAD)
  });
};

/**
 * Function that handles the "CANCEL" data transfer protocol.
 * @method _CANCELProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._CANCELProtocolHandler = function(peerId, data, channelName) {
  var isUpload = !!this._uploadDataSessions[channelName];
  var isDownload = !!this._downloadDataSessions[channelName];
  var transferStatus = (isUpload) ? this._uploadDataSessions[channelName] :
    this._downloadDataSessions[channelName];

  if (!transferStatus) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Ignoring data received as ' +
      (isUpload ? 'upload' : 'download') + ' data session is empty'], data);
    return;
  }

  var transferId = transferStatus.transferId;

  log.log([peerId, 'RTCDataChannel', channelName,
    'Received file transfer cancel request:'], data);

  this._clearDataChannelTimeout(peerId, isUpload, channelName);

  try {
    if (isUpload) {
      delete this._uploadDataSessions[channelName];
      delete this._uploadDataTransfers[channelName];
    } else {
      delete this._downloadDataSessions[channelName];
      delete this._downloadDataTransfers[channelName];
    }

    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.CANCEL,
      transferId, peerId, {
        name: transferStatus.name,
        size: transferStatus.size,
        data: null,
        dataType: transferStatus.dataType,
        percentage: transferStatus.percentage,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout,
        isPrivate: transferStatus.isPrivate
      }, {
        message: data.content,
        transferType: ((isUpload) ? this.DATA_TRANSFER_TYPE.UPLOAD :
          this.DATA_TRANSFER_TYPE.DOWNLOAD)
    });

    log.log([peerId, 'RTCDataChannel', channelName,
      'Emptied file transfer session:'], data);

  } catch (error) {
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR,
      transferId, peerId, {
        name: transferStatus.name,
        size: transferStatus.size,
        data: null,
        dataType: transferStatus.dataType,
        percentage: transferStatus.percentage,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout,
        isPrivate: transferStatus.isPrivate
      }, {
        message: 'Failed cancelling data request from peer',
        transferType: ((isUpload) ? this.DATA_TRANSFER_TYPE.UPLOAD :
          this.DATA_TRANSFER_TYPE.DOWNLOAD)
    });

    log.error([peerId, 'RTCDataChannel', channelName,
      'Failed emptying file transfer session:'], {
        data: data,
        error: error
    });
  }
};

/**
 * Function that handles the data transfer chunk received.
 * @method _DATAProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._DATAProtocolHandler = function(peerId, data, chunkType, channelProp) {
  // Prevent conversion if no datachannel session
  if (!(this._dataChannels[peerId] && this._dataChannels[peerId][channelProp])) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Ignoring data transfer chunk received ' +
      'as Datachannel connection session is not present']);
    return;
  }

  // Prevent conversion if no transferId present
  if (channelProp === 'main' && !this._dataChannels[peerId][channelProp].transferId) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Ignoring data transfer chunk received ' +
      'as Datachannel data transfer session is at invalid state']);
    return;
  }

  var transferId   = channelProp === 'main' ? this._dataChannels[peerId][channelProp].transferId : channelProp;
  var chunk        = null;
  var chunkSize    = 0;

  // Prevent conversion if no data transfer session
  if (!this._dataTransfers[transferId]) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Ignoring data transfer chunk received ' +
      'as data transfer session does not exists']);
    return;
  }

  var senderPeerId = this._dataTransfers[transferId].session.senderPeerId;

  // Clear transfer timeout
  this._handleDataTransferTimer(transferId, null, true);

  // Convert the chunk to appropriate data type
  if (chunkType === this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Received binary string data chunk']);

    chunk     = this._base64ToBlob(data);
    chunkSize = 4 * Math.ceil(chunk.size / 3); // Follow DT 0.1.0 protocol

  } else if (chunkType === this.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Received ArrayBuffer data chunk']);

    chunk     = new Blob([data]);
    chunkSize = chunk.size; // * (4 / 3);

  } else if (chunkType === this.DATA_TRANSFER_DATA_TYPE.BLOB) {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Received Blob data chunk']);

    chunk     = data;
    chunkSize = chunk.size; // * (4 / 3);

  } else {
    log.error([peerId, 'RTCDataChannel', channelProp, 'Corrupted data transfer chunk received. ' +
      'Aborting data transfer session.']);
    // TODO: trigger
    return;
  }

  // Append to chunk size
  this._dataTransfers[transferId].data.chunks[ this._dataTransfers[transferId].data.ackN ] = chunk;
  this._dataTransfers[transferId].data.receivedSize += chunkSize;

  // Completed data transfer
  if (this._dataTransfers[transferId].data.receivedSize >= this._dataTransfers[transferId].session.size) {
    log.log([peerId, 'RTCDataChannel', channelProp, 'Data transfer has been completed']);

    this._sendMessageToDataChannel(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: this._dataTransfers[transferId].data.ackN + 1
    }, channelProp);

    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED, transferId, senderPeerId,
      this._getTransferInfo(transferId, true));
    this._trigger('incomingData', this._getTransferData(), transferId, senderPeerId, this._getTransferInfo(transferId));

    delete this._dataTransfers[transferId];
    return;
  
  } else {
    this._dataTransfers[transferId].data.ackN += 1;

    this._sendMessageToDataChannel(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: this._dataTransfers[transferId].data.ackN
    }, channelProp);

    this._handleDataTransferTimer(transferId);

    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOADING, transferId, senderPeerId,
      this._getTransferInfo(transferId, true));
  }
};

/**
 * Function that starts / stop data transfer timeout.
 * @method _handleDataTransferTimer
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._handleDataTransferTimer = function (transferId, peerId, clear) {
  var self = this;

  if (!self._dataTransfers[transferId]) {
    return;
  }

  if (clear) {
    if (peerId) {
      if (self._dataTransfers[transferId].peersResponseTimer[peerId]) {
        log.debug([peerId, 'RTCDataChannel', transferId, 'Clearing data transfer timeout']);
        clearTimeout(self._dataTransfers[transferId].peersResponseTimer[peerId]);
        self._dataTransfers[transferId].peersResponseTimer[peerId] = null;
      }

    } else if (self._dataTransfers[transferId].responseTimer) {
      log.debug([peerId, 'RTCDataChannel', transferId, 'Clearing data transfer timeout']);
      clearTimeout(self._dataTransfers[transferId].responseTimer);
      self._dataTransfers[transferId].responseTimer = null;
    }
  } else {
    var timeoutInMs = self._dataTransfers[transferId].session.timeout * 1000;
    var timeoutFn   = function () {
      log.error([peerId, 'RTCDataChannel', transferId, 'Data transfer timer has expired. ' +
        'Response timeout error. Aborting data transfer session.']);

      // TODO: Trigger it has ended
    };

    if (peerId) {
      self._dataTransfers[transferId].peersResponseTimer[peerId] = setTimeout(timeoutFn, timeoutInMs);
    } else {
      self._dataTransfers[transferId].responseTimer = setTimeout(timeoutFn, timeoutInMs);
    }
  }
};

/**
 * Function that start the data transfer with the list of targeted Peer IDs provided.
 * At this stage, it will open a new Datachannel connection if simultaneous data transfers is
 *   supported by Peer, or it will using the messaging type Datachannel connection.
 * Note that 1 data transfer can occur at a time in 1 Datachannel connection.
 * @method _startDataTransfer
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._startDataTransfer = function(data, dataInfo, listOfPeers, callback) {
  var self = this;
  var error = '';
  var noOfPeersSent = 0;
  var transferId = dataInfo.transferId;
  var dataType = dataInfo.dataType;
  var isPrivate = dataInfo.isPrivate;
  var i;
  var peerId;

  // for callback
  var listOfPeersTransferState = {};
  var transferSuccess = true;
  var listOfPeersTransferErrors = {};
  var listOfPeersChannels = {};
  var successfulPeerTransfers = [];

  var triggerCallbackFn = function () {
    for (i = 0; i < listOfPeers.length; i++) {
      var transferPeerId = listOfPeers[i];

      if (!listOfPeersTransferState[transferPeerId]) {
        // if error, make as false and break
        transferSuccess = false;
        break;
      }
    }

    if (transferSuccess) {
      log.log([null, 'RTCDataChannel', transferId, 'Firing success callback for data transfer'], dataInfo);
      // should we even support this? maybe keeping to not break older impl
      if (listOfPeers.length === 1 && isPrivate) {
        callback(null,{
          state: self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED,
          peerId: listOfPeers[0],
          listOfPeers: listOfPeers,
          transferId: transferId,
          isPrivate: isPrivate, // added new flag to indicate privacy
          transferInfo: dataInfo
        });
      } else {
        callback(null,{
          state: null,
          peerId: null,
          transferId: transferId,
          listOfPeers: listOfPeers,
          isPrivate: isPrivate, // added new flag to indicate privacy
          transferInfo: dataInfo
        });
      }
    } else {
      log.log([null, 'RTCDataChannel', transferId, 'Firing failure callback for data transfer'], dataInfo);

      // should we even support this? maybe keeping to not break older impl
      if (listOfPeers.length === 1 && isPrivate) {
        callback({
          state: self.DATA_TRANSFER_STATE.ERROR,
          error: listOfPeersTransferErrors[listOfPeers[0]],
          peerId: listOfPeers[0],
          transferId: transferId,
          transferErrors: listOfPeersTransferErrors,
          transferInfo: dataInfo,
          isPrivate: isPrivate, // added new flag to indicate privacy
          listOfPeers: listOfPeers
        }, null);
      } else {
        callback({
          state: null,
          peerId: null,
          error: null,
          transferId: transferId,
          listOfPeers: listOfPeers,
          isPrivate: isPrivate, // added new flag to indicate privacy
          transferInfo: dataInfo,
          transferErrors: listOfPeersTransferErrors
        }, null);
      }
    }
  };

  for (i = 0; i < listOfPeers.length; i++) {
    peerId = listOfPeers[i];

    if (peerId === 'MCU') {
      continue;
    }

    if (self._dataChannels[peerId] && self._dataChannels[peerId].main) {
      log.log([peerId, 'RTCDataChannel', null, 'Sending blob data ->'], dataInfo);

      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_STARTED,
        transferId, peerId, {
          name: dataInfo.name,
          size: dataInfo.size,
          percentage: 0,
          data: data,
          dataType: dataType,
          senderPeerId: self._user.sid,
          timeout: dataInfo.timeout,
          isPrivate: isPrivate
      });

      self._trigger('incomingDataRequest', transferId, peerId, {
        name: dataInfo.name,
        size: dataInfo.size,
        percentage: 0,
        dataType: dataType,
        senderPeerId: self._user.sid,
        timeout: dataInfo.timeout,
        isPrivate: isPrivate
      }, true);

      if (!self._hasMCU) {
        listOfPeersChannels[peerId] =
          self._sendBlobDataToPeer(data, dataInfo, peerId);
      } else {
        listOfPeersChannels[peerId] = self._dataChannels[peerId].main.label;
      }

      noOfPeersSent++;

    } else {
      error = 'Datachannel does not exist. Unable to start data transfer with peer';
      log.error([peerId, 'RTCDataChannel', null, error]);
      listOfPeersTransferErrors[peerId] = error;
    }
  }

  // if has MCU
  if (self._hasMCU) {
    self._sendBlobDataToPeer(data, dataInfo, listOfPeers, isPrivate, transferId);
  }

  if (noOfPeersSent === 0) {
    error = 'Failed sending data as there is no available datachannels to send data';

    for (i = 0; i < listOfPeers.length; i++) {
      peerId = listOfPeers[i];

      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR,
        transferId, peerId, {
          name: dataInfo.name,
          size: dataInfo.size,
          data: null,
          dataType: dataType,
          percentage: 0,
          senderPeerId: self._user.sid,
          timeout: dataInfo.timeout,
          isPrivate: isPrivate
        }, {
          message: error,
          transferType: self.DATA_TRANSFER_TYPE.UPLOAD
      });

      listOfPeersTransferErrors[peerId] = error;
    }

    log.error([null, 'RTCDataChannel', null, error]);
    self._uploadDataTransfers = [];
    self._uploadDataSessions = [];

    transferSuccess = false;

    if (typeof callback === 'function') {
      triggerCallbackFn();
    }
    return;
  }

  if (typeof callback === 'function') {
    var dataChannelStateFn = function(state, transferringPeerId, errorObj, channelName, channelType){
      // check if error or closed halfway, if so abort
      if (state === self.DATA_CHANNEL_STATE.ERROR &&
        state === self.DATA_CHANNEL_STATE.CLOSED &&
        listOfPeersChannels[peerId] === channelName) {
        // if peer has already been inside, ignore
        if (successfulPeerTransfers.indexOf(transferringPeerId) === -1) {
          listOfPeersTransferState[transferringPeerId] = false;
          listOfPeersTransferErrors[transferringPeerId] = errorObj;

          log.error([transferringPeerId, 'RTCDataChannel', null,
            'Data channel state has met a failure state for peer (datachannel) ->'], {
              state: state,
              error: errorObj
          });
        }
      }

      if (Object.keys(listOfPeersTransferState).length === listOfPeers.length) {
        self.off('dataTransferState', dataTransferStateFn);
        self.off('dataChannelState', dataChannelStateFn);

        log.log([null, 'RTCDataChannel', transferId,
          'Transfer states have been gathered completely in dataChannelState'], state);

        triggerCallbackFn();
      }
    };

    var dataTransferStateFn = function(state, stateTransferId, transferringPeerId, transferInfo, errorObj){
      // check if transfer is related to this transfer
      if (stateTransferId === transferId) {
        // check if state upload has completed
        if (state === self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED) {

          log.debug([transferringPeerId, 'RTCDataChannel', stateTransferId,
            'Data transfer state has met a success state for peer ->'], state);

          // if peer has already been inside, ignore
          if (successfulPeerTransfers.indexOf(transferringPeerId) === -1) {
            listOfPeersTransferState[transferringPeerId] = true;
          }
        } else if(state === self.DATA_TRANSFER_STATE.REJECTED ||
          state === self.DATA_TRANSFER_STATE.CANCEL ||
          state === self.DATA_TRANSFER_STATE.ERROR) {

          if (state === self.DATA_TRANSFER_STATE.REJECTED) {
            errorObj = new Error('Peer has rejected data transfer request');
          }

          log.error([transferringPeerId, 'RTCDataChannel', stateTransferId,
            'Data transfer state has met a failure state for peer ->'], {
              state: state,
              error: errorObj
          });

          // if peer has already been inside, ignore
          if (successfulPeerTransfers.indexOf(transferringPeerId) === -1) {
            listOfPeersTransferState[transferringPeerId] = false;
            listOfPeersTransferErrors[transferringPeerId] = errorObj;
          }
        }
      }

      if (Object.keys(listOfPeersTransferState).length === listOfPeers.length) {
        self.off('dataTransferState', dataTransferStateFn);
        self.off('dataChannelState', dataChannelStateFn);

        log.log([null, 'RTCDataChannel', stateTransferId,
          'Transfer states have been gathered completely in dataTransferState'], state);

        triggerCallbackFn();
      }
    };
    self.on('dataTransferState', dataTransferStateFn);
    self.on('dataChannelState', dataChannelStateFn);
  }
};

Skylink.prototype.CANDIDATE_GENERATION_STATE = {
  NEW: 'new',
  GATHERING: 'gathering',
  COMPLETED: 'completed'
};

/**
 * Stores the list of buffered ICE candidates that is received before
 *   remote session description is received and set.
 * @attribute _peerCandidatesQueue
 * @param {Array} <#peerId> The list of the Peer connection buffered ICE candidates received.
 * @param {Object} <#peerId>.<#index> The Peer connection buffered ICE candidate received.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._peerCandidatesQueue = {};

/**
 * Stores the list of Peer connection ICE candidates.
 * @attribute _gatheredCandidates
 * @param {JSON} <#peerId> The list of the Peer connection ICE candidates.
 * @param {JSON} <#peerId>.sending The list of the Peer connection ICE candidates sent.
 * @param {JSON} <#peerId>.receiving The list of the Peer connection ICE candidates received.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.14
 */
Skylink.prototype._gatheredCandidates = {};

/**
 * Function that handles the Peer connection gathered ICE candidate to be sent.
 * @method _onIceCandidate
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._onIceCandidate = function(targetMid, candidate) {
  var self = this;

  if (candidate.candidate) {
    var messageCan = candidate.candidate.split(' ');
    var candidateType = messageCan[7];
    log.debug([targetMid, 'RTCIceCandidate', null, 'Created and sending ' +
      candidateType + ' candidate:'], candidate);

    if (self._forceTURN && candidateType !== 'relay') {
      if (!self._hasMCU) {
        log.warn([targetMid, 'RTCICECandidate', null, 'Ignoring sending of "' + candidateType +
          '" candidate as TURN connections is forced'], candidate);
        return;
      }

      log.warn([targetMid, 'RTCICECandidate', null, 'Not ignoring sending of "' + candidateType +
        '" candidate although TURN connections is forced as MCU is present'], candidate);
    }

    if (!self._gatheredCandidates[targetMid]) {
      self._gatheredCandidates[targetMid] = {
        sending: { host: [], srflx: [], relay: [] },
        receiving: { host: [], srflx: [], relay: [] }
      };
    }

    self._gatheredCandidates[targetMid].sending[candidateType].push({
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
      candidate: candidate.candidate
    });

    if (!self._enableIceTrickle) {
      log.warn([targetMid, 'RTCICECandidate', null, 'Ignoring sending of "' + candidateType +
        '" candidate as trickle ICE is disabled'], candidate);
      return;
    }

    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.CANDIDATE,
      label: candidate.sdpMLineIndex,
      id: candidate.sdpMid,
      candidate: candidate.candidate,
      mid: self._user.sid,
      target: targetMid,
      rid: self._room.id
    });

  } else {
    log.debug([targetMid, 'RTCIceCandidate', null, 'End of gathering']);
    self._trigger('candidateGenerationState', self.CANDIDATE_GENERATION_STATE.COMPLETED,
      targetMid);
    // Disable Ice trickle option
    if (!self._enableIceTrickle) {
      var sessionDescription = self._peerConnections[targetMid].localDescription;

      // make checks for firefox session description
      if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER && window.webrtcDetectedBrowser === 'firefox') {
        sessionDescription.sdp = self._addSDPSsrcFirefoxAnswer(targetMid, sessionDescription.sdp);
      }

      self._sendChannelMessage({
        type: sessionDescription.type,
        sdp: sessionDescription.sdp,
        mid: self._user.sid,
        //agent: window.webrtcDetectedBrowser,
        userInfo: self._getUserInfo(),
        target: targetMid,
        rid: self._room.id
      });
    }

    // We should remove this.. this could be due to ICE failures
    // Adding this fix is bad
    // Does the restart in the case when the candidates are extremely a lot
    /*var doACandidateRestart = self._addedCandidates[targetMid].relay.length > 20 &&
      (window.webrtcDetectedBrowser === 'chrome' || window.webrtcDetectedBrowser === 'opera');

    log.debug([targetMid, 'RTCIceCandidate', null, 'Relay candidates generated length'], self._addedCandidates[targetMid].relay.length);

    if (doACandidateRestart) {
      setTimeout(function () {
        if (self._peerConnections[targetMid]) {
          if(self._peerConnections[targetMid].iceConnectionState !== self.ICE_CONNECTION_STATE.CONNECTED &&
            self._peerConnections[targetMid].iceConnectionState !== self.ICE_CONNECTION_STATE.COMPLETED) {
            // restart
            self._restartPeerConnection(targetMid, true, true, null, false);
          }
        }
      }, self._addedCandidates[targetMid].relay.length * 50);
    }*/
  }
};

/**
 * Function that buffers the Peer connection ICE candidate when received
 *   before remote session description is received and set.
 * @method _addIceCandidateToQueue
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addIceCandidateToQueue = function(targetMid, candidate) {
  log.debug([targetMid, null, null, 'Queued candidate to add after ' +
    'setRemoteDescription'], candidate);
  this._peerCandidatesQueue[targetMid] =
    this._peerCandidatesQueue[targetMid] || [];
  this._peerCandidatesQueue[targetMid].push(candidate);
};

/**
 * Function that handles when the Peer connection received ICE candidate
 *   has been added or processed successfully.
 * Separated in a function to prevent jshint errors.
 * @method _onAddIceCandidateSuccess
 * @private
 * @for Skylink
 * @since 0.5.9
 */
Skylink.prototype._onAddIceCandidateSuccess = function () {
  log.debug([null, 'RTCICECandidate', null, 'Successfully added ICE candidate']);
};

/**
 * Function that handles when the Peer connection received ICE candidate
 *   has failed adding or processing.
  * Separated in a function to prevent jshint errors.
 * @method _onAddIceCandidateFailure
 * @private
 * @for Skylink
 * @since 0.5.9
 */
Skylink.prototype._onAddIceCandidateFailure = function (error) {
  log.error([null, 'RTCICECandidate', null, 'Error'], error);
};

/**
 * Function that adds all the Peer connection buffered ICE candidates received.
 * This should be called only after the remote session description is received and set.
 * @method _addIceCandidateFromQueue
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addIceCandidateFromQueue = function(targetMid) {
  this._peerCandidatesQueue[targetMid] =
    this._peerCandidatesQueue[targetMid] || [];
  if(this._peerCandidatesQueue[targetMid].length > 0) {
    for (var i = 0; i < this._peerCandidatesQueue[targetMid].length; i++) {
      var candidate = this._peerCandidatesQueue[targetMid][i];
      log.debug([targetMid, null, null, 'Added queued candidate'], candidate);
      this._peerConnections[targetMid].addIceCandidate(candidate,
        this._onAddIceCandidateSuccess, this._onAddIceCandidateFailure);
    }
    delete this._peerCandidatesQueue[targetMid];
  } else {
    log.log([targetMid, null, null, 'No queued candidates to add']);
  }
};
Skylink.prototype.ICE_CONNECTION_STATE = {
  STARTING: 'starting',
  CHECKING: 'checking',
  CONNECTED: 'connected',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  FAILED: 'failed',
  TRICKLE_FAILED: 'trickleFailed',
  DISCONNECTED: 'disconnected'
};

/**
 * <blockquote class="info">
 *   Note that configuring the protocol may not necessarily result in the desired network transports protocol
 *   used in the actual TURN network traffic as it depends which protocol the browser selects and connects with.
 *   This simply configures the TURN ICE server urls <code?transport=(protocol)</code> query option when constructing
 *   the Peer connection. When all protocols are selected, the ICE servers urls are duplicated with all protocols.
 * </blockquote>
 * The list of TURN network transport protocols options when constructing Peer connections
 * configured in the <a href="#method_init"><code>init()</code> method</a>.
 * <small>Example <code>.urls</code> inital input: [<code>"turn:server.com?transport=tcp"</code>,
 * <code>"turn:server1.com:3478"</code>, <code>"turn:server.com?transport=udp"</code>]</small>
 * @attribute TURN_TRANSPORT
 * @param {String} TCP <small>Value  <code>"tcp"</code></small>
 *   The value of the option to configure using only TCP network transport protocol.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com?transport=tcp"</code>,
 *   <code>"turn:server1.com:3478?transport=tcp"</code>]</small>
 * @param {String} UDP <small>Value  <code>"udp"</code></small>
 *   The value of the option to configure using only UDP network transport protocol.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com?transport=udp"</code>,
 *   <code>"turn:server1.com:3478?transport=udp"</code>]</small>
 * @param {String} ANY <small>Value  <code>"any"</code></small>
 *   The value of the option to configure using any network transport protocols configured from the Signaling server.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com?transport=tcp"</code>,
 *   <code>"turn:server1.com:3478"</code>, <code>"turn:server.com?transport=udp"</code>]</small>
 * @param {String} NONE <small>Value <code>"none"</code></small>
 *   The value of the option to not configure using any network transport protocols.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com"</code>, <code>"turn:server1.com:3478"</code>]</small>
 *   <small>Configuring this does not mean that no protocols will be used, but
 *   rather removing <code>?transport=(protocol)</code> query option in
 *   the TURN ICE server <code>.urls</code> when constructing the Peer connection.</small>
 * @param {String} ALL <small>Value  <code>"all"</code></small>
 *   The value of the option to configure using both TCP and UDP network transport protocols.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com?transport=tcp"</code>,
 *   <code>"turn:server.com?transport=udp"</code>, <code>"turn:server1.com:3478?transport=tcp"</code>,
 *   <code>"turn:server1.com:3478?transport=udp"</code>]</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype.TURN_TRANSPORT = {
  UDP: 'udp',
  TCP: 'tcp',
  ANY: 'any',
  NONE: 'none',
  ALL: 'all'
};

/**
 * Stores the flag that indicates if Peer connections should trickle ICE.
 * @attribute _enableIceTrickle
 * @type Boolean
 * @default true
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._enableIceTrickle = true;

/**
 * Stores the flag that indicates if STUN ICE servers should be used when constructing Peer connection.
 * @attribute _enableSTUN
 * @type Boolean
 * @default true
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._enableSTUN = true;

/**
 * Stores the flag that indicates if TURN ICE servers should be used when constructing Peer connection.
 * @attribute _enableTURN
 * @type Boolean
 * @default true
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._enableTURN = true;

/**
 * Stores the flag that indicates if public STUN ICE servers should be used when constructing Peer connection.
 * @attribute _usePublicSTUN
 * @type Boolean
 * @default true
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._usePublicSTUN = true;

/**
 * Stores the option for the TURN protocols to use.
 * This should configure the TURN ICE servers urls <code>?transport=protocol</code> flag.
 * @attribute _TURNTransport
 * @type String
 * @default "any"
 * @private
 * @required
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._TURNTransport = 'any';

/**
 * Stores the list of Peer connections ICE failures counter.
 * @attribute _ICEConnectionFailures
 * @param {Number} <#peerId> The Peer connection ICE failures counter.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._ICEConnectionFailures = {};

/**
 * Function that filters and configures the ICE servers received from Signaling
 *   based on the <code>init()</code> configuration and returns the updated
 *   list of ICE servers to be used when constructing Peer connection.
 * @method _setIceServers
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._setIceServers = function(givenConfig) {
  var givenIceServers = clone(givenConfig.iceServers);
  var iceServersList = {};
  var newIceServers = [];
  // TURN SSL config
  var useTURNSSLProtocol = false;
  var useTURNSSLPort = false;



  if (window.location.protocol === 'https:' || this._forceTURNSSL) {
    if (window.webrtcDetectedBrowser === 'chrome' ||
      window.webrtcDetectedBrowser === 'safari' ||
      window.webrtcDetectedBrowser === 'IE') {
      useTURNSSLProtocol = true;
      useTURNSSLPort = false;
    } else {
      useTURNSSLPort = true;
    }
  }

  log.log('TURN server connections SSL configuration', {
    useTURNSSLProtocol: useTURNSSLProtocol,
    useTURNSSLPort: useTURNSSLPort
  });

  var pushIceServer = function (username, credential, url, index) {
    if (!iceServersList[username]) {
      iceServersList[username] = {};
    }

    if (!iceServersList[username][credential]) {
      iceServersList[username][credential] = [];
    }

    if (iceServersList[username][credential].indexOf(url) === -1) {
      if (typeof index === 'number') {
        iceServersList[username][credential].splice(index, 0, url);
      } else {
        iceServersList[username][credential].push(url);
      }
    }
  };

  var i, serverItem;

  for (i = 0; i < givenIceServers.length; i++) {
    var server = givenIceServers[i];

    if (typeof server.url !== 'string') {
      log.warn('Ignoring ICE server provided at index ' + i, clone(server));
      continue;
    }

    if (server.url.indexOf('stun') === 0) {
      if (!this._enableSTUN) {
        log.warn('Ignoring STUN server provided at index ' + i, clone(server));
        continue;
      }

      if (!this._usePublicSTUN && server.url.indexOf('temasys') === -1) {
        log.warn('Ignoring public STUN server provided at index ' + i, clone(server));
        continue;
      }

    } else if (server.url.indexOf('turn') === 0) {
      if (!this._enableTURN) {
        log.warn('Ignoring TURN server provided at index ' + i, clone(server));
        continue;
      }

      if (server.url.indexOf(':443') === -1 && useTURNSSLPort) {
        log.log('Ignoring TURN Server (non-SSL port) provided at index ' + i, clone(server));
        continue;
      }

      if (useTURNSSLProtocol) {
        var parts = server.url.split(':');
        parts[0] = 'turns';
        server.url = parts.join(':');
      }
    }

    // parse "@" settings
    if (server.url.indexOf('@') > 0) {
      var protocolParts = server.url.split(':');
      var urlParts = protocolParts[1].split('@');
      server.username = urlParts[0];
      server.url = protocolParts[0] + ':' + urlParts[1];

      // add the ICE server port
      if (protocolParts[2]) {
        server.url += ':' + protocolParts[2];
      }
    }

    var username = typeof server.username === 'string' ? server.username : 'none';
    var credential = typeof server.credential === 'string' ? server.credential : 'none';

    if (server.url.indexOf('turn') === 0) {
      if (this._TURNTransport === this.TURN_TRANSPORT.ANY) {
        pushIceServer(username, credential, server.url);

      } else {
        var rawUrl = server.url;

        if (rawUrl.indexOf('?transport=') > 0) {
          rawUrl = rawUrl.split('?transport=')[0];
        }

        if (this._TURNTransport === this.TURN_TRANSPORT.NONE) {
          pushIceServer(username, credential, rawUrl);
        } else if (this._TURNTransport === this.TURN_TRANSPORT.UDP) {
          pushIceServer(username, credential, rawUrl + '?transport=udp');
        } else if (this._TURNTransport === this.TURN_TRANSPORT.TCP) {
          pushIceServer(username, credential, rawUrl + '?transport=tcp');
        } else if (this._TURNTransport === this.TURN_TRANSPORT.ALL) {
          pushIceServer(username, credential, rawUrl + '?transport=tcp');
          pushIceServer(username, credential, rawUrl + '?transport=udp');
        } else {
          log.warn('Invalid TURN transport option "' + this._TURNTransport +
            '". Ignoring TURN server at index' + i, clone(server));
          continue;
        }
      }
    } else {
      pushIceServer(username, credential, server.url);
    }
  }

  // add mozilla STUN for firefox
  if (this._enableSTUN && this._usePublicSTUN && window.webrtcDetectedBrowser === 'firefox') {
    pushIceServer('none', 'none', 'stun:stun.services.mozilla.com', 0);
  }

  var hasUrlsSupport = false;

  if (window.webrtcDetectedBrowser === 'chrome' && window.webrtcDetectedVersion > 34) {
    hasUrlsSupport = true;
  }

  if (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion > 38) {
    hasUrlsSupport = true;
  }

  if (window.webrtcDetectedBrowser === 'opera' && window.webrtcDetectedVersion > 31) {
    hasUrlsSupport = true;
  }

  // plugin supports .urls
  if (window.webrtcDetectedBrowser === 'safari' || window.webrtcDetectedBrowser === 'IE') {
    hasUrlsSupport = true;
  }

  for (var serverUsername in iceServersList) {
    if (iceServersList.hasOwnProperty(serverUsername)) {
      for (var serverCred in iceServersList[serverUsername]) {
        if (iceServersList[serverUsername].hasOwnProperty(serverCred)) {
          if (hasUrlsSupport) {
            var urlsItem = {
              urls: iceServersList[serverUsername][serverCred]
            };
            if (serverUsername !== 'none') {
              urlsItem.username = serverUsername;
            }
            if (serverCred !== 'none') {
              urlsItem.credential = serverCred;
            }
            newIceServers.push(urlsItem);
          } else {
            for (var j = 0; j < iceServersList[serverUsername][serverCred].length; j++) {
              var urlItem = {
                url: iceServersList[serverUsername][serverCred][j]
              };
              if (serverUsername !== 'none') {
                urlItem.username = serverUsername;
              }
              if (serverCred !== 'none') {
                urlItem.credential = serverCred;
              }
              newIceServers.push(urlItem);
            }
          }
        }
      }
    }
  }

  log.log('Output iceServers configuration:', newIceServers);

  return {
    iceServers: newIceServers
  };
};
Skylink.prototype.PEER_CONNECTION_STATE = {
  STABLE: 'stable',
  HAVE_LOCAL_OFFER: 'have-local-offer',
  HAVE_REMOTE_OFFER: 'have-remote-offer',
  CLOSED: 'closed'
};

/**
 * The list of <a href="#method_getConnectionStatus"><code>getConnectionStatus()</code>
 * method</a> retrieval states.
 * @attribute GET_CONNECTION_STATUS_STATE
 * @param {Number} RETRIEVING <small>Value <code>0</code></small>
 *   The value of the state when <code>getConnectionStatus()</code> is retrieving the Peer connection stats.
 * @param {Number} RETRIEVE_SUCCESS <small>Value <code>1</code></small>
 *   The value of the state when <code>getConnectionStatus()</code> has retrieved the Peer connection stats successfully.
 * @param {Number} RETRIEVE_ERROR <small>Value <code>-1</code></small>
 *   The value of the state when <code>getConnectionStatus()</code> has failed retrieving the Peer connection stats.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.GET_CONNECTION_STATUS_STATE = {
  RETRIEVING: 0,
  RETRIEVE_SUCCESS: 1,
  RETRIEVE_ERROR: -1
};

/**
 * <blockquote class="info">
 *  As there are more features getting implemented, there will be eventually more different types of
 *  server Peers.
 * </blockquote>
 * The list of available types of server Peer connections.
 * @attribute SERVER_PEER_TYPE
 * @param {String} MCU <small>Value <code>"mcu"</code></small>
 *   The value of the server Peer type that is used for MCU connection.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.SERVER_PEER_TYPE = {
  MCU: 'mcu'
  //SIP: 'sip'
};

/**
 * Stores the restart initiated timestamp to throttle the <code>refreshConnection</code> functionality.
 * @attribute _lastRestart
 * @type Object
 * @private
 * @for Skylink
 * @since 0.5.9
 */
Skylink.prototype._lastRestart = null;

/**
 * Stores the global number of Peer connection retries that would increase the wait-for-response timeout
 *   for the Peer connection health timer.
 * @attribute _retryCount
 * @type Number
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._retryCount = 0;

/**
 * Stores the list of the Peer connections.
 * @attribute _peerConnections
 * @param {Object} <#peerId> The Peer connection.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._peerConnections = {};

/**
 * <blockquote class="info">
 *   For MCU enabled Peer connections, the restart functionality may differ, you may learn more about how to workaround
 *   it <a href="http://support.temasys.com.sg/support/discussions/topics/12000002853">in this article here</a>.<br>
 *   For restarts with Peers connecting from Android or iOS SDKs, restarts might not work as written in
 *   <a href="http://support.temasys.com.sg/support/discussions/topics/12000005188">in this article here</a>.<br>
 *   Note that this functionality should be used when Peer connection stream freezes during a connection,
 *   and is throttled when invoked many times in less than 3 seconds interval.
 * </blockquote>
 * Function that refreshes Peer connections to update with the current streaming.
 * @method refreshConnection
 * @param {String|Array} [targetPeerId] <blockquote class="info">
 *   Note that this is ignored if MCU is enabled for the App Key provided in
 *   <a href="#method_init"><code>init()</code> method</a>. <code>refreshConnection()</code> will "refresh"
 *   all Peer connections. See the <u>Event Sequence</u> for more information.</blockquote>
 *   The target Peer ID to refresh connection with.
 * - When provided as an Array, it will refresh all connections with all the Peer IDs provided.
 * - When not provided, it will refresh all the currently connected Peers in the Room.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_peerRestart">
 *   <code>peerRestart</code> event</a> triggering <code>isSelfInitiateRestart</code> parameter payload
 *   value as <code>true</code> for all Peers targeted for request success.</small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Array} callback.error.listOfPeers The list of Peer IDs targeted.
 * @param {JSON} callback.error.refreshErrors The list of Peer connection refresh errors.
 * @param {Error|String} callback.error.refreshErrors.#peerId The Peer connection refresh error associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 *   <small>If <code>#peerId</code> value is <code>"self"</code>, it means that it is the error when there
 *   is no Peer connections to refresh with.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {Array} callback.success.listOfPeers The list of Peer IDs targeted.
 * @trigger <ol class="desc-seq">
 *   <li>Checks if MCU is enabled for App Key provided in <a href="#method_init"><code>init()</code> method</a><ol>
 *   <li>If MCU is enabled: <ol><li>If there are connected Peers in the Room: <ol>
 *   <li><a href="#event_peerRestart"><code>peerRestart</code> event</a> triggers parameter payload
 *   <code>isSelfInitiateRestart</code> value as <code>true</code> for all connected Peer connections.</li>
 *   <li><a href="#event_serverPeerRestart"><code>serverPeerRestart</code> event</a> triggers for
 *   connected MCU server Peer connection.</li></ol></li>
 *   <li>Invokes <a href="#method_joinRoom"><code>joinRoom()</code> method</a> <small><code>refreshConnection()</code>
 *   will retain the User session information except the Peer ID will be a different assigned ID due to restarting the
 *   Room session.</small> <ol><li>If request has errors <ol><li><b>ABORT</b> and return error.
 *   </li></ol></li></ol></li></ol></li>
 *   <li>Else: <ol><li>If there are connected Peers in the Room: <ol>
 *   <li>Refresh connections for all targeted Peers. <ol>
 *   <li>If Peer connection exists: <ol>
 *   <li><a href="#event_peerRestart"><code>peerRestart</code> event</a> triggers parameter payload
 *   <code>isSelfInitiateRestart</code> value as <code>true</code> for all targeted Peer connections.</li></ol></li>
 *   <li>Else: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   </ol></li></ol></li></ol>
 * @example
 *   // Example 1: Refreshing a Peer connection
 *   function refreshFrozenVideoStream (peerId) {
 *     skylinkDemo.refreshConnection(peerId, function (error, success) {
 *       if (error) return;
 *       console.log("Refreshing connection for '" + peerId + "'");
 *     });
 *   }
 *
 *   // Example 2: Refreshing a list of Peer connections
 *   function refreshFrozenVideoStreamGroup (peerIdA, peerIdB) {
 *     skylinkDemo.refreshConnection([peerIdA, peerIdB], function (error, success) {
 *       if (error) {
 *         if (error.transferErrors[peerIdA]) {
 *           console.error("Failed refreshing connection for '" + peerIdA + "'");
 *         } else {
 *           console.log("Refreshing connection for '" + peerIdA + "'");
 *         }
 *         if (error.transferErrors[peerIdB]) {
 *           console.error("Failed refreshing connection for '" + peerIdB + "'");
 *         } else {
 *           console.log("Refreshing connection for '" + peerIdB + "'");
 *         }
 *       } else {
 *         console.log("Refreshing connection for '" + peerIdA + "' and '" + peerIdB + "'");
 *       }
 *     });
 *   }
 *
 *   // Example 3: Refreshing all Peer connections
 *   function refreshFrozenVideoStreamAll () {
 *     skylinkDemo.refreshConnection(function (error, success) {
 *       if (error) {
 *         for (var i = 0; i < error.listOfPeers.length; i++) {
 *           if (error.refreshErrors[error.listOfPeers[i]]) {
 *             console.error("Failed refreshing connection for '" + error.listOfPeers[i] + "'");
 *           } else {
 *             console.info("Refreshing connection for '" + error.listOfPeers[i] + "'");
 *           }
 *         }
 *       } else {
 *         console.log("Refreshing connection for all Peers", success.listOfPeers);
 *       }
 *     });
 *   }
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.refreshConnection = function(targetPeerId, callback) {
  var self = this;

  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerRestarts = [];
  var error = '';
  var listOfPeerRestartErrors = {};

  if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;

  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  if (listOfPeers.length === 0) {
    error = 'There is currently no peer connections to restart';
    log.warn([null, 'PeerConnection', null, error]);

    listOfPeerRestartErrors.self = new Error(error);

    if (typeof callback === 'function') {
      callback({
        refreshErrors: listOfPeerRestartErrors,
        listOfPeers: listOfPeers
      }, null);
    }
    return;
  }

  self._throttle(function () {
    self._refreshPeerConnection(listOfPeers, true, callback);
  },5000)();

};

/**
 * Function that refresh connections.
 * @method _refreshPeerConnection
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._refreshPeerConnection = function(listOfPeers, shouldThrottle, callback) {
  var self = this;
  var listOfPeerRestarts = [];
  var error = '';
  var listOfPeerRestartErrors = {};

  // To fix jshint dont put functions within a loop
  var refreshSinglePeerCallback = function (peerId) {
    return function (error, success) {
      if (listOfPeerRestarts.indexOf(peerId) === -1) {
        if (error) {
          log.error([peerId, 'RTCPeerConnection', null, 'Failed restarting for peer'], error);
          listOfPeerRestartErrors[peerId] = error;
        }
        listOfPeerRestarts.push(peerId);
      }

      if (listOfPeerRestarts.length === listOfPeers.length) {
        if (typeof callback === 'function') {
          log.log([null, 'PeerConnection', null, 'Invoked all peers to restart. Firing callback']);

          if (Object.keys(listOfPeerRestartErrors).length > 0) {
            callback({
              refreshErrors: listOfPeerRestartErrors,
              listOfPeers: listOfPeers
            }, null);
          } else {
            callback(null, {
              listOfPeers: listOfPeers
            });
          }
        }
      }
    };
  };

  var refreshSinglePeer = function(peerId, peerCallback){
    if (!self._peerConnections[peerId]) {
      error = 'There is currently no existing peer connection made ' +
        'with the peer. Unable to restart connection';
      log.error([peerId, null, null, error]);
      listOfPeerRestartErrors[peerId] = new Error(error);
      return;
    }

    if (shouldThrottle) {
      var now = Date.now() || function() { return +new Date(); };

      if (now - self.lastRestart < 3000) {
        error = 'Last restart was so tight. Aborting.';
        log.error([peerId, null, null, error]);
        listOfPeerRestartErrors[peerId] = new Error(error);
        return;
      }
    }

    log.log([peerId, 'PeerConnection', null, 'Restarting peer connection']);

    // do a hard reset on variable object
    self._restartPeerConnection(peerId, true, false, peerCallback, true);
  };

  if(!self._hasMCU) {
    var i;

    for (i = 0; i < listOfPeers.length; i++) {
      var peerId = listOfPeers[i];

      if (Object.keys(self._peerConnections).indexOf(peerId) > -1) {
        refreshSinglePeer(peerId, refreshSinglePeerCallback(peerId));
      } else {
        error = 'Peer connection with peer does not exists. Unable to restart';
        log.error([peerId, 'PeerConnection', null, error]);
        listOfPeerRestartErrors[peerId] = new Error(error);
      }

      // there's an error to trigger for
      if (i === listOfPeers.length - 1 && Object.keys(listOfPeerRestartErrors).length > 0) {
        if (typeof callback === 'function') {
          callback({
            refreshErrors: listOfPeerRestartErrors,
            listOfPeers: listOfPeers
          }, null);
        }
      }
    }
  } else {
    self._restartMCUConnection(callback);
  }
};

/**
 * Function that retrieves Peer connection bandwidth and ICE connection stats.
 * @method getConnectionStatus
 * @param {String|Array} [targetPeerId] The target Peer ID to retrieve connection stats from.
 * - When provided as an Array, it will retrieve all connection stats from all the Peer IDs provided.
 * - When not provided, it will retrieve all connection stats from the currently connected Peers in the Room.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_getConnectionStatusStateChange">
 *   <code>getConnectionStatusStateChange</code> event</a> triggering <code>state</code> parameter payload
 *   value as <code>RETRIEVE_SUCCESS</code> for all Peers targeted for request success.</small>
 *   [Rel: Skylink.GET_CONNECTION_STATUS_STATE]
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Array} callback.error.listOfPeers The list of Peer IDs targeted.
 * @param {JSON} callback.error.retrievalErrors The list of Peer connection stats retrieval errors.
 * @param {Error|String} callback.error.retrievalErrors.#peerId The Peer connection stats retrieval error associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 *   <small>If <code>#peerId</code> value is <code>"self"</code>, it means that it is the error when there
 *   are no Peer connections to refresh with.</small>
 * @param {JSON} callback.error.connectionStats The list of Peer connection stats.
 *   <small>These are the Peer connection stats that has been managed to be successfully retrieved.</small>
 * @param {JSON} callback.error.connectionStats.#peerId The Peer connection stats associated with
 *   the Peer ID defined in <code>#peerId</code> property.
 *   <small>Object signature matches the <code>stats</code> parameter payload received in the
 *   <a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {Array} callback.success.listOfPeers The list of Peer IDs targeted.
 * @param {JSON} callback.success.connectionStats The list of Peer connection stats.
 * @param {JSON} callback.success.connectionStats.#peerId The Peer connection stats associated with
 *   the Peer ID defined in <code>#peerId</code> property.
 *   <small>Object signature matches the <code>stats</code> parameter payload received in the
 *   <a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>Retrieves Peer connection stats for all targeted Peers. <ol>
 *   <li>If Peer connection has closed or does not exists: <small>This can be checked with
 *   <a href="#event_peerConnectionState"><code>peerConnectionState</code> event</a>
 *   triggering parameter payload <code>state</code> as <code>CLOSED</code> for Peer.</small> <ol>
 *   <li><a href="#event_getConnectionStatusStateChange"> <code>getConnectionStatusStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RETRIEVE_ERROR</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li><a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RETRIEVING</code>.</li>
 *   <li>Received response from retrieval. <ol>
 *   <li>If retrieval was successful: <ol>
 *   <li><a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RETRIEVE_SUCCESS</code>.</li></ol></li>
 *   <li>Else: <ol>
 *   <li><a href="#event_getConnectionStatusStateChange"> <code>getConnectionStatusStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RETRIEVE_ERROR</code>.</li>
 *   </ol></li></ol></li></ol></li></ol>
 * @example
 *   // Example 1: Retrieve a Peer connection stats
 *   function startBWStatsInterval (peerId) {
 *     setInterval(function () {
 *       skylinkDemo.getConnectionStatus(peerId, function (error, success) {
 *         if (error) return;
 *         var sendVideoBytes  = success.connectionStats[peerId].video.sending.bytes;
 *         var sendAudioBytes  = success.connectionStats[peerId].audio.sending.bytes;
 *         var recvVideoBytes  = success.connectionStats[peerId].video.receiving.bytes;
 *         var recvAudioBytes  = success.connectionStats[peerId].audio.receiving.bytes;
 *         var localCandidate  = success.connectionStats[peerId].selectedCandidate.local;
 *         var remoteCandidate = success.connectionStats[peerId].selectedCandidate.remote;
 *         console.log("Sending audio (" + sendAudioBytes + "bps) video (" + sendVideoBytes + ")");
 *         console.log("Receiving audio (" + recvAudioBytes + "bps) video (" + recvVideoBytes + ")");
 *         console.log("Local candidate: " + localCandidate.ipAddress + ":" + localCandidate.portNumber +
 *           "?transport=" + localCandidate.transport + " (type: " + localCandidate.candidateType + ")");
 *         console.log("Remote candidate: " + remoteCandidate.ipAddress + ":" + remoteCandidate.portNumber +
 *           "?transport=" + remoteCandidate.transport + " (type: " + remoteCandidate.candidateType + ")");
 *       });
 *     }, 1000);
 *   }
 *
 *   // Example 2: Retrieve a list of Peer connection stats
 *   function printConnStats (peerId, data) {
 *     if (!data.connectionStats[peerId]) return;
 *     var sendVideoBytes  = data.connectionStats[peerId].video.sending.bytes;
 *     var sendAudioBytes  = data.connectionStats[peerId].audio.sending.bytes;
 *     var recvVideoBytes  = data.connectionStats[peerId].video.receiving.bytes;
 *     var recvAudioBytes  = data.connectionStats[peerId].audio.receiving.bytes;
 *     var localCandidate  = data.connectionStats[peerId].selectedCandidate.local;
 *     var remoteCandidate = data.connectionStats[peerId].selectedCandidate.remote;
 *     console.log(peerId + " - Sending audio (" + sendAudioBytes + "bps) video (" + sendVideoBytes + ")");
 *     console.log(peerId + " - Receiving audio (" + recvAudioBytes + "bps) video (" + recvVideoBytes + ")");
 *     console.log(peerId + " - Local candidate: " + localCandidate.ipAddress + ":" + localCandidate.portNumber +
 *       "?transport=" + localCandidate.transport + " (type: " + localCandidate.candidateType + ")");
 *     console.log(peerId + " - Remote candidate: " + remoteCandidate.ipAddress + ":" + remoteCandidate.portNumber +
 *       "?transport=" + remoteCandidate.transport + " (type: " + remoteCandidate.candidateType + ")");
 *   }
 *
 *   function startBWStatsInterval (peerIdA, peerIdB) {
 *     setInterval(function () {
 *       skylinkDemo.getConnectionStatus([peerIdA, peerIdB], function (error, success) {
 *         if (error) {
 *           printConnStats(peerIdA, error.connectionStats);
 *           printConnStats(peerIdB, error.connectionStats);
 *         } else {
 *           printConnStats(peerIdA, success.connectionStats);
 *           printConnStats(peerIdB, success.connectionStats);
 *         }
 *       });
 *     }, 1000);
 *   }
 *
 *   // Example 3: Retrieve all Peer connection stats
 *   function printConnStats (listOfPeers, data) {
 *     listOfPeers.forEach(function (peerId) {
 *       if (!data.connectionStats[peerId]) return;
 *       var sendVideoBytes  = data.connectionStats[peerId].video.sending.bytes;
 *       var sendAudioBytes  = data.connectionStats[peerId].audio.sending.bytes;
 *       var recvVideoBytes  = data.connectionStats[peerId].video.receiving.bytes;
 *       var recvAudioBytes  = data.connectionStats[peerId].audio.receiving.bytes;
 *       var localCandidate  = data.connectionStats[peerId].selectedCandidate.local;
 *       var remoteCandidate = data.connectionStats[peerId].selectedCandidate.remote;
 *       console.log(peerId + " - Sending audio (" + sendAudioBytes + "bps) video (" + sendVideoBytes + ")");
 *       console.log(peerId + " - Receiving audio (" + recvAudioBytes + "bps) video (" + recvVideoBytes + ")");
 *       console.log(peerId + " - Local candidate: " + localCandidate.ipAddress + ":" + localCandidate.portNumber +
 *         "?transport=" + localCandidate.transport + " (type: " + localCandidate.candidateType + ")");
 *       console.log(peerId + " - Remote candidate: " + remoteCandidate.ipAddress + ":" + remoteCandidate.portNumber +
 *         "?transport=" + remoteCandidate.transport + " (type: " + remoteCandidate.candidateType + ")");
 *     });
 *   }
 *
 *   function startBWStatsInterval (peerIdA, peerIdB) {
 *     setInterval(function () {
 *       skylinkDemo.getConnectionStatus(function (error, success) {
 *         if (error) {
 *           printConnStats(error.listOfPeers, error.connectionStats);
 *         } else {
 *           printConnStats(success.listOfPeers, success.connectionStats);
 *         }
 *       });
 *     }, 1000);
 *   }
 * @for Skylink
 * @since 0.6.14
 */
Skylink.prototype.getConnectionStatus = function (targetPeerId, callback) {
  var self = this;
  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerStats = {};
  var listOfPeerErrors = {};

  // getConnectionStatus([])
  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;

  // getConnectionStatus('...')
  } else if (typeof targetPeerId === 'string' && !!targetPeerId) {
    listOfPeers = [targetPeerId];

  // getConnectionStatus(function () {})
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
    targetPeerId = undefined;
  }

  // Check if Peers list is empty, in which we throw an Error if there isn't any
  if (listOfPeers.length === 0) {
    listOfPeerErrors.self = new Error('There is currently no peer connections to retrieve connection status');

    log.error([null, 'RTCStatsReport', null, 'Retrieving request failure ->'], listOfPeerErrors.self);

    if (typeof callback === 'function') {
      callback({
        listOfPeers: listOfPeers,
        retrievalErrors: listOfPeerErrors,
        connectionStats: listOfPeerStats
      }, null);
    }
    return;
  }

  var completedTaskCounter = [];

  var checkCompletedFn = function (peerId) {
    if (completedTaskCounter.indexOf(peerId) === -1) {
      completedTaskCounter.push(peerId);
    }

    if (completedTaskCounter.length === listOfPeers.length) {
      if (typeof callback === 'function') {
        if (Object.keys(listOfPeerErrors).length > 0) {
          callback({
            listOfPeers: listOfPeers,
            retrievalErrors: listOfPeerErrors,
            connectionStats: listOfPeerStats
          }, null);

        } else {
          callback(null, {
            listOfPeers: listOfPeers,
            connectionStats: listOfPeerStats
          });
        }
      }
    }
  };

  var statsFn = function (peerId) {
    log.debug([peerId, 'RTCStatsReport', null, 'Retrieivng connection status']);

    var pc = self._peerConnections[peerId];
    var result = {
      raw: null,
      connection: {
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState,
        signalingState: pc.signalingState,
        remoteDescription: pc.remoteDescription,
        localDescription: pc.localDescription,
        candidates: clone(self._gatheredCandidates[peerId] || {
          sending: { host: [], srflx: [], relay: [] },
          receiving: { host: [], srflx: [], relay: [] }
        })
      },
      audio: {
        sending: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0,
          rtt: 0
        },
        receiving: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0
        }
      },
      video: {
        sending: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0,
          rtt: 0
        },
        receiving: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0
        }
      },
      selectedCandidate: {
        local: { ipAddress: null, candidateType: null, portNumber: null, transport: null },
        remote: { ipAddress: null, candidateType: null, portNumber: null, transport: null }
      }
    };
    var loopFn = function (obj, fn) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop) && obj[prop]) {
          fn(obj[prop], prop);
        }
      }
    };
    var formatCandidateFn = function (candidateDirType, candidate) {
      result.selectedCandidate[candidateDirType].ipAddress = candidate.ipAddress;
      result.selectedCandidate[candidateDirType].candidateType = candidate.candidateType;
      result.selectedCandidate[candidateDirType].portNumber = typeof candidate.portNumber !== 'number' ?
        parseInt(candidate.portNumber, 10) || null : candidate.portNumber;
      result.selectedCandidate[candidateDirType].transport = candidate.transport;
    };

    pc.getStats(null, function (stats) {
      log.debug([peerId, 'RTCStatsReport', null, 'Retrieval success ->'], stats);

      result.raw = stats;

      if (window.webrtcDetectedBrowser === 'firefox') {
        loopFn(stats, function (obj, prop) {
          var dirType = '';

          // Receiving/Sending RTP packets
          if (prop.indexOf('inbound_rtp') === 0 || prop.indexOf('outbound_rtp') === 0) {
            dirType = prop.indexOf('inbound_rtp') === 0 ? 'receiving' : 'sending';

            result[obj.mediaType][dirType].bytes = dirType === 'sending' ? obj.bytesSent : obj.bytesReceived;
            result[obj.mediaType][dirType].packets = dirType === 'sending' ? obj.packetsSent : obj.packetsReceived;
            result[obj.mediaType][dirType].ssrc = obj.ssrc;

            if (dirType === 'receiving') {
              result[obj.mediaType][dirType].packetsLost = obj.packetsLost || 0;
            }

          // Sending RTP packets lost
          } else if (prop.indexOf('outbound_rtcp') === 0) {
            dirType = prop.indexOf('inbound_rtp') === 0 ? 'receiving' : 'sending';

            result[obj.mediaType][dirType].packetsLost = obj.packetsLost || 0;

            if (dirType === 'sending') {
              result[obj.mediaType].sending.rtt = obj.mozRtt || 0;
            }

          // Candidates
          } else if (obj.nominated && obj.selected) {
            formatCandidateFn('remote', stats[obj.remoteCandidateId]);
            formatCandidateFn('local', stats[obj.localCandidateId]);
          }
        });

      } else if (window.webrtcDetectedBrowser === 'edge') {
        if (pc.getRemoteStreams().length > 0) {
          var tracks = pc.getRemoteStreams()[0].getTracks();

          loopFn(tracks, function (track) {
            loopFn(stats, function (obj, prop) {
              if (obj.type === 'track' && obj.trackIdentifier === track.id) {
                loopFn(stats, function (streamObj) {
                  if (streamObj.associateStatsId === obj.id &&
                    ['outboundrtp', 'inboundrtp'].indexOf(streamObj.type) > -1) {
                    var dirType = streamObj.type === 'outboundrtp' ? 'sending' : 'receiving';

                    result[track.kind][dirType].bytes = dirType === 'sending' ? streamObj.bytesSent : streamObj.bytesReceived;
                    result[track.kind][dirType].packets = dirType === 'sending' ? streamObj.packetsSent : streamObj.packetsReceived;
                    result[track.kind][dirType].packetsLost = streamObj.packetsLost || 0;
                    result[track.kind][dirType].ssrc = parseInt(streamObj.ssrc || '0', 10);

                    if (dirType === 'sending') {
                      result[track.kind].sending.rtt = obj.roundTripTime || 0;
                    }
                  }
                });
              }
            });
          });
        }

      } else {
        var reportedCandidate = false;

        loopFn(stats, function (obj, prop) {
          if (prop.indexOf('ssrc_') === 0) {
            var dirType = prop.indexOf('_recv') > 0 ? 'receiving' : 'sending';

            // Polyfill fix for plugin. Plugin should fix this though
            if (!obj.mediaType) {
              obj.mediaType = obj.hasOwnProperty('audioOutputLevel') ||
                obj.hasOwnProperty('audioInputLevel') ? 'audio' : 'video';
            }

            // Receiving/Sending RTP packets
            result[obj.mediaType][dirType].bytes = parseInt((dirType === 'receiving' ?
              obj.bytesReceived : obj.bytesSent) || '0', 10);
            result[obj.mediaType][dirType].packets = parseInt((dirType === 'receiving' ?
              obj.packetsReceived : obj.packetsSent) || '0', 10);
            result[obj.mediaType][dirType].ssrc = parseInt(obj.ssrc || '0', 10);
            result[obj.mediaType][dirType].packetsLost = parseInt(obj.packetsLost || '0', 10);

            if (dirType === 'sending') {
              // NOTE: Chrome sending audio does have it but plugin has..
              result[obj.mediaType].sending.rtt = parseInt(obj.googRtt || '0', 10);
            }

            if (!reportedCandidate) {
              loopFn(stats, function (canObj, canProp) {
                if (!reportedCandidate && canProp.indexOf('Conn-') === 0) {
                  if (obj.transportId === canObj.googChannelId) {
                    formatCandidateFn('local', stats[canObj.localCandidateId]);
                    formatCandidateFn('remote', stats[canObj.remoteCandidateId]);
                    reportedCandidate = true;
                  }
                }
              });
            }
          }
        });
      }

      listOfPeerStats[peerId] = result;

      self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_SUCCESS,
        peerId, listOfPeerStats[peerId], null);

      checkCompletedFn(peerId);

    }, function (error) {
      log.error([peerId, 'RTCStatsReport', null, 'Retrieval failure ->'], error);

      listOfPeerErrors[peerId] = error;

      self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_ERROR,
        peerId, null, error);

      checkCompletedFn(peerId);
    });
  };

  // Loop through all the list of Peers selected to retrieve connection status
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVING,
      peerId, null, null);

    // Check if the Peer connection exists first
    if (self._peerConnections.hasOwnProperty(peerId) && self._peerConnections[peerId]) {
      statsFn(peerId);

    } else {
      listOfPeerErrors[peerId] = new Error('The peer connection object does not exists');

      log.error([peerId, 'RTCStatsReport', null, 'Retrieval failure ->'], listOfPeerErrors[peerId]);

      self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_ERROR,
        peerId, null, listOfPeerErrors[peerId]);

      checkCompletedFn(peerId);
    }
  }
};

/**
 * Function that starts the Peer connection session.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _addPeer
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._addPeer = function(targetMid, peerBrowser, toOffer, restartConn, receiveOnly, isSS) {
  var self = this;
  if (self._peerConnections[targetMid] && !restartConn) {
    log.error([targetMid, null, null, 'Connection to peer has already been made']);
    return;
  }
  log.log([targetMid, null, null, 'Starting the connection to peer. Options provided:'], {
    peerBrowser: peerBrowser,
    toOffer: toOffer,
    receiveOnly: receiveOnly,
    enableDataChannel: self._enableDataChannel
  });

  log.info('Adding peer', isSS);

  if (!restartConn) {
    self._peerConnections[targetMid] = self._createPeerConnection(targetMid, !!isSS);
  }

  if (!self._peerConnections[targetMid]) {
    log.error([targetMid, null, null, 'Failed creating the connection to peer']);
    return;
  }

  self._peerConnections[targetMid].receiveOnly = !!receiveOnly;
  self._peerConnections[targetMid].hasScreen = !!isSS;
  if (!receiveOnly) {
    self._addLocalMediaStreams(targetMid);
  }
  // I'm the callee I need to make an offer
  /*if (toOffer) {
    self._doOffer(targetMid, peerBrowser);
  }*/

  // do a peer connection health check
  // let MCU handle this case
  if (!self._hasMCU) {
    this._startPeerConnectionHealthCheck(targetMid, toOffer);
  } else {
    log.warn([targetMid, 'PeerConnectionHealth', null, 'Not setting health timer for MCU connection']);
    return;
  }
};

/**
 * Function that re-negotiates a Peer connection.
 * We currently do not implement the ICE restart functionality.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _restartPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._restartPeerConnection = function (peerId, isSelfInitiatedRestart, isConnectionRestart, callback, explicit) {
  var self = this;

  if (!self._peerConnections[peerId]) {
    log.error([peerId, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  delete self._peerConnectionHealth[peerId];

  self._stopPeerConnectionHealthCheck(peerId);

  var pc = self._peerConnections[peerId];

  var agent = (self.getPeerInfo(peerId) || {}).agent || {};

  // prevent restarts for other SDK clients
  if (['Android', 'iOS', 'cpp'].indexOf(agent.name) > -1) {
    var notSupportedError = new Error('Failed restarting with other agents connecting from other SDKs as ' +
      're-negotiation is not supported by other SDKs');

    log.warn([peerId, 'RTCPeerConnection', null, 'Ignoring restart request as agent\'s SDK does not support it'],
        notSupportedError);

    if (typeof callback === 'function') {
      log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
      callback(null, notSupportedError);
    }
    return;
  }

  // This is when the state is stable and re-handshaking is possible
  // This could be due to previous connection handshaking that is already done
  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
    if (self._peerConnections[peerId] && !self._peerConnections[peerId].receiveOnly) {
      self._addLocalMediaStreams(peerId);
    }

    if (isSelfInitiatedRestart){
      log.log([peerId, null, null, 'Sending restart message to signaling server']);

      var lastRestart = Date.now() || function() { return +new Date(); };

      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.RESTART,
        mid: self._user.sid,
        rid: self._room.id,
        agent: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        os: window.navigator.platform,
        userInfo: self._getUserInfo(),
        target: peerId,
        isConnectionRestart: !!isConnectionRestart,
        lastRestart: lastRestart,
        // This will not be used based off the logic in _restartHandler
        weight: self._peerPriorityWeight,
        receiveOnly: self._peerConnections[peerId] && self._peerConnections[peerId].receiveOnly,
        enableIceTrickle: self._enableIceTrickle,
        enableDataChannel: self._enableDataChannel,
        sessionType: !!self._streams.screenshare ? 'screensharing' : 'stream',
        explicit: !!explicit,
        temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null
      });

      self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), false);

      if (typeof callback === 'function') {
        log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart callback']);
        callback(null, null);
      }
    } else {
      if (typeof callback === 'function') {
        log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart callback (receiving peer)']);
        callback(null, null);
      }
    }

    // following the previous logic to do checker always
    self._startPeerConnectionHealthCheck(peerId, false);

  } else {
    // Let's check if the signalingState is stable first.
    // In another galaxy or universe, where the local description gets dropped..
    // In the offerHandler or answerHandler, do the appropriate flags to ignore or drop "extra" descriptions
    if (pc.signalingState === self.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER) {
      // Checks if the local description is defined first
      var hasLocalDescription = pc.localDescription && pc.localDescription.sdp;
      // By then it should have at least the local description..
      if (hasLocalDescription) {
        self._sendChannelMessage({
          type: pc.localDescription.type,
          sdp: pc.localDescription.sdp,
          mid: self._user.sid,
          target: peerId,
          rid: self._room.id,
          restart: true
        });
      } else {
        var noLocalDescriptionError = 'Failed re-sending localDescription as there is ' +
          'no localDescription set to connection. There could be a handshaking step error';
        log.error([peerId, 'RTCPeerConnection', null, noLocalDescriptionError], {
            localDescription: pc.localDescription,
            remoteDescription: pc.remoteDescription
        });
        if (typeof callback === 'function') {
          log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
          callback(null, new Error(noLocalDescriptionError));
        }
      }
    // It could have connection state closed
    } else {
      var unableToRestartError = 'Failed restarting as peer connection state is ' + pc.signalingState;
      log.warn([peerId, 'RTCPeerConnection', null, unableToRestartError]);
      if (typeof callback === 'function') {
        log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
        callback(null, new Error(unableToRestartError));
      }
    }
  }
};

/**
 * Function that ends the Peer connection session.
 * @method _removePeer
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._removePeer = function(peerId) {
  var peerInfo = clone(this.getPeerInfo(peerId)) || {
    userData: '',
    settings: {},
    mediaStatus: {},
    agent: {},
    room: clone(this._selectedRoom)
  };

  if (peerId !== 'MCU') {
    this._trigger('peerLeft', peerId, peerInfo, false);
  } else {
    this._hasMCU = false;
    log.log([peerId, null, null, 'MCU has stopped listening and left']);
    this._trigger('serverPeerLeft', peerId, this.SERVER_PEER_TYPE.MCU);
  }
  // stop any existing peer health timer
  this._stopPeerConnectionHealthCheck(peerId);

  // check if health timer exists
  if (typeof this._peerConnections[peerId] !== 'undefined') {
    // new flag to check if datachannels are all closed
    this._peerConnections[peerId].dataChannelClosed = true;

    if (this._peerConnections[peerId].signalingState !== 'closed') {
      this._peerConnections[peerId].close();
    }

    if (this._peerConnections[peerId].hasStream) {
      this._trigger('streamEnded', peerId, this.getPeerInfo(peerId), false);
    }

    delete this._peerConnections[peerId];
  }
  // remove peer informations session
  if (typeof this._peerInformations[peerId] !== 'undefined') {
    delete this._peerInformations[peerId];
  }
  // remove peer messages stamps session
  if (typeof this._peerMessagesStamps[peerId] !== 'undefined') {
    delete this._peerMessagesStamps[peerId];
  }
  
  if (typeof this._peerConnectionHealth[peerId] !== 'undefined') {
    delete this._peerConnectionHealth[peerId];
  }
  // close datachannel connection
  if (this._enableDataChannel) {
    this._closeDataChannel(peerId);
  }

  log.log([peerId, null, null, 'Successfully removed peer']);
};

/**
 * Function that creates the Peer connection.
 * @method _createPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._createPeerConnection = function(targetMid, isScreenSharing) {
  var pc, self = this;
  // currently the AdapterJS 0.12.1-2 causes an issue to prevent firefox from
  // using .urls feature
  try {
    pc = new window.RTCPeerConnection(
      self._room.connection.peerConfig,
      self._room.connection.peerConstraints);
    log.info([targetMid, null, null, 'Created peer connection']);
    log.debug([targetMid, null, null, 'Peer connection config:'],
      self._room.connection.peerConfig);
    log.debug([targetMid, null, null, 'Peer connection constraints:'],
      self._room.connection.peerConstraints);
  } catch (error) {
    log.error([targetMid, null, null, 'Failed creating peer connection:'], error);
    return null;
  }
  // attributes (added on by Temasys)
  pc.setOffer = '';
  pc.setAnswer = '';
  pc.hasStream = false;
  pc.hasScreen = !!isScreenSharing;
  pc.hasMainChannel = false;
  pc.firefoxStreamId = '';
  pc.processingLocalSDP = false;
  pc.processingRemoteSDP = false;
  pc.gathered = false;

  // candidates
  self._gatheredCandidates[targetMid] = {
    sending: { host: [], srflx: [], relay: [] },
    receiving: { host: [], srflx: [], relay: [] }
  };

  // callbacks
  // standard not implemented: onnegotiationneeded,
  pc.ondatachannel = function(event) {
    var dc = event.channel || event;
    log.debug([targetMid, 'RTCDataChannel', dc.label, 'Received datachannel ->'], dc);
    if (self._enableDataChannel) {

      var channelType = self.DATA_CHANNEL_TYPE.DATA;
      var channelKey = dc.label;

      // if peer does not have main channel, the first item is main
      if (!pc.hasMainChannel) {
        channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
        channelKey = 'main';
        pc.hasMainChannel = true;
      }

      self._createDataChannel(targetMid, dc);

    } else {
      log.warn([targetMid, 'RTCDataChannel', dc.label, 'Not adding datachannel as enable datachannel ' +
        'is set to false']);
    }
  };
  pc.onaddstream = function(event) {
    var stream = event.stream || event;

    if (targetMid === 'MCU') {
      log.debug([targetMid, 'MediaStream', stream.id, 'Ignoring received remote stream from MCU ->'], stream);
      return;
    }

    pc.hasStream = true;

    var agent = (self.getPeerInfo(targetMid) || {}).agent || {};
    var timeout = 0;

    // NOTE: Add timeouts to the firefox stream received because it seems to have some sort of black stream rendering at first
    // This may not be advisable but that it seems to work after 1500s. (tried with ICE established but it does not work and getStats)
    if (agent.name === 'firefox' && window.webrtcDetectedBrowser !== 'firefox') {
      timeout = 1500;
    }
    setTimeout(function () {
      self._onRemoteStreamAdded(targetMid, stream, !!pc.hasScreen);
    }, timeout);
  };
  pc.onicecandidate = function(event) {
    var candidate = event.candidate || event;

    if (candidate.candidate) {
      pc.gathered = false;
    } else {
      pc.gathered = true;
    }

    log.debug([targetMid, 'RTCIceCandidate', null, 'Ice candidate generated ->'], candidate);
    self._onIceCandidate(targetMid, candidate);
  };
  pc.oniceconnectionstatechange = function(evt) {
    checkIceConnectionState(targetMid, pc.iceConnectionState,
      function(iceConnectionState) {
      log.debug([targetMid, 'RTCIceConnectionState', null,
        'Ice connection state changed ->'], iceConnectionState);
      self._trigger('iceConnectionState', iceConnectionState, targetMid);

      // clear all peer connection health check
      // peer connection is stable. now if there is a waiting check on it
      if (iceConnectionState === self.ICE_CONNECTION_STATE.COMPLETED &&
        pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
        log.debug([targetMid, 'PeerConnectionHealth', null,
          'Peer connection with user is stable']);
        self._peerConnectionHealth[targetMid] = true;
        self._stopPeerConnectionHealthCheck(targetMid);
        self._retryCount = 0;
      }

      if (typeof self._ICEConnectionFailures[targetMid] === 'undefined') {
        self._ICEConnectionFailures[targetMid] = 0;
      }

      if (iceConnectionState === self.ICE_CONNECTION_STATE.FAILED) {
        self._ICEConnectionFailures[targetMid] += 1;

        if (self._enableIceTrickle) {
          self._trigger('iceConnectionState',
            self.ICE_CONNECTION_STATE.TRICKLE_FAILED, targetMid);
        }

        // refresh when failed. ignore for MCU case since restart is handled by MCU in this case
        if (!self._hasMCU) {
          self._restartPeerConnection(targetMid, true, true, null, false);
        }
      }

      /**** SJS-53: Revert of commit ******
      // resend if failed
      if (iceConnectionState === self.ICE_CONNECTION_STATE.FAILED) {
        log.debug([targetMid, 'RTCIceConnectionState', null,
          'Ice connection state failed. Re-negotiating connection']);
        self._removePeer(targetMid);
        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.WELCOME,
          mid: self._user.sid,
          rid: self._room.id,
          agent: window.webrtcDetectedBrowser,
          version: window.webrtcDetectedVersion,
          userInfo: self._getUserInfo(),
          target: targetMid,
          restartNego: true,
          hsPriority: -1
        });
      } *****/
    });
  };
  // pc.onremovestream = function () {
  //   self._onRemoteStreamRemoved(targetMid);
  // };
  pc.onsignalingstatechange = function() {
    log.debug([targetMid, 'RTCSignalingState', null,
      'Peer connection state changed ->'], pc.signalingState);
    self._trigger('peerConnectionState', pc.signalingState, targetMid);

    // clear all peer connection health check
    // peer connection is stable. now if there is a waiting check on it
    if ((pc.iceConnectionState === self.ICE_CONNECTION_STATE.COMPLETED ||
      pc.iceConnectionState === self.ICE_CONNECTION_STATE.CONNECTED) &&
      pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
      log.debug([targetMid, 'PeerConnectionHealth', null,
        'Peer connection with user is stable']);
      self._peerConnectionHealth[targetMid] = true;
      self._stopPeerConnectionHealthCheck(targetMid);
      self._retryCount = 0;
    }
  };
  pc.onicegatheringstatechange = function() {
    log.log([targetMid, 'RTCIceGatheringState', null,
      'Ice gathering state changed ->'], pc.iceGatheringState);
    self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
  };

  if (window.webrtcDetectedBrowser === 'firefox') {
    pc.removeStream = function (stream) {
      var senders = pc.getSenders();
      for (var s = 0; s < senders.length; s++) {
        var tracks = stream.getTracks();
        for (var t = 0; t < tracks.length; t++) {
          if (tracks[t] === senders[s].track) {
            pc.removeTrack(senders[s]);
          }
        }
      }
    };
  }

  return pc;
};

/**
 * Function that handles the <code>_restartPeerConnection</code> scenario
 *   for MCU enabled Peer connections.
 * This is implemented currently by making the user leave and join the Room again.
 * The Peer ID will not stay the same though.
 * @method _restartMCUConnection
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._restartMCUConnection = function(callback) {
  var self = this;
  log.info([self._user.sid, null, null, 'Restarting with MCU enabled']);
  // Save room name
  /*var roomName = (self._room.id).substring((self._room.id)
                    .indexOf('_api_') + 5, (self._room.id).length);*/
  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerRestartErrors = {};
  var peerId; // j shint is whinning
  var receiveOnly = false;
  // for MCU case, these dont matter at all
  var lastRestart = Date.now() || function() { return +new Date(); };
  var weight = (new Date()).valueOf();

  self._trigger('serverPeerRestart', 'MCU', self.SERVER_PEER_TYPE.MCU);

  for (var i = 0; i < listOfPeers.length; i++) {
    peerId = listOfPeers[i];

    if (!self._peerConnections[peerId]) {
      var error = 'Peer connection with peer does not exists. Unable to restart';
      log.error([peerId, 'PeerConnection', null, error]);
      listOfPeerRestartErrors[peerId] = new Error(error);
      continue;
    }

    if (peerId === 'MCU') {
      receiveOnly = !!self._peerConnections[peerId].receiveOnly;
    }

    if (peerId !== 'MCU') {
      self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), true);

      log.log([peerId, null, null, 'Sending restart message to signaling server']);

      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.RESTART,
        mid: self._user.sid,
        rid: self._room.id,
        agent: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        os: window.navigator.platform,
        userInfo: self._getUserInfo(),
        target: peerId, //'MCU',
        isConnectionRestart: false,
        lastRestart: lastRestart,
        weight: self._peerPriorityWeight,
        receiveOnly: receiveOnly,
        enableIceTrickle: self._enableIceTrickle,
        enableDataChannel: self._enableDataChannel,
        sessionType: !!self._streams.screenshare ? 'screensharing' : 'stream',
        explicit: true,
        temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null
      });
    }
  }

  // Restart with MCU = peer leaves then rejoins room
  var peerJoinedFn = function (peerId, peerInfo, isSelf) {
    log.log([null, 'PeerConnection', null, 'Invoked all peers to restart with MCU. Firing callback']);

    if (typeof callback === 'function') {
      if (Object.keys(listOfPeerRestartErrors).length > 0) {
        callback({
          refreshErrors: listOfPeerRestartErrors,
          listOfPeers: listOfPeers
        }, null);
      } else {
        callback(null, {
          listOfPeers: listOfPeers
        });
      }
    }
  };

  self.once('peerJoined', peerJoinedFn, function (peerId, peerInfo, isSelf) {
    return isSelf;
  });

  self.leaveRoom(false, function (error, success) {
    if (error) {
      if (typeof callback === 'function') {
        for (var i = 0; i < listOfPeers.length; i++) {
          listOfPeerRestartErrors[listOfPeers[i]] = error;
        }
        callback({
          refreshErrors: listOfPeerRestartErrors,
          listOfPeers: listOfPeers
        }, null);
      }
    } else {
      //self._trigger('serverPeerLeft', 'MCU', self.SERVER_PEER_TYPE.MCU);
      self.joinRoom(self._selectedRoom);
    }
  });
};

Skylink.prototype._peerInformations = {};

/**
 * Stores the Signaling user credentials from the API response required for connecting to the Signaling server.
 * @attribute _user
 * @param {String} uid The API result "username".
 * @param {String} token The API result "userCred".
 * @param {String} timeStamp The API result "timeStamp".
 * @param {String} sid The Signaling server receive user Peer ID.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._user = null;

/**
 * Stores the User custom data.
 * By default, if no custom user data is set, it is an empty string <code>""</code>.
 * @attribute _userData
 * @type JSON|String
 * @default ""
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._userData = '';

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

  this._userData = userData || '';

  if (self._inRoom) {
    log.log('Updated userData -> ', userData);
    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.UPDATE_USER,
      mid: self._user.sid,
      rid: self._room.id,
      userData: self._userData,
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
  if (peerId && peerId !== this._user.sid) {
    // peer info
    var peerInfo = this._peerInformations[peerId];

    if (typeof peerInfo === 'object') {
      return peerInfo.userData;
    }

    return null;
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
  var peerInfo = null;

  if (typeof peerId === 'string' && typeof this._peerInformations[peerId] === 'object') {
    peerInfo = clone(this._peerInformations[peerId]);
    peerInfo.room = clone(this._selectedRoom);

    if (peerInfo.settings.video && typeof peerInfo.settings.video === 'object' &&
      peerInfo.settings.video.frameRate === -1) {
      delete peerInfo.settings.video.frameRate;
    }

  } else {
    peerInfo = {
      userData: clone(this._userData) || '',
      settings: {
        audio: false,
        video: false
      },
      mediaStatus: clone(this._streamsMutedSettings),
      agent: {
        name: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        os: window.navigator.platform,
        pluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null
      },
      room: clone(this._selectedRoom)
    };

    if (this._streams.screenshare) {
      peerInfo.settings = clone(this._streams.screenshare.settings);
    } else if (this._streams.userMedia) {
      peerInfo.settings = clone(this._streams.userMedia.settings);
    }
  }

  if (!peerInfo.settings.audio) {
    peerInfo.mediaStatus.audioMuted = true;
  }

  if (!peerInfo.settings.video) {
    peerInfo.mediaStatus.videoMuted = true;
  }

  return peerInfo;
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

  if (userInfo.settings.video && typeof userInfo.settings.video === 'object' &&
    typeof userInfo.settings.video.frameRate !== 'number') {
    userInfo.settings.video.frameRate = -1;
  }

  delete userInfo.agent;
  delete userInfo.room;

  return userInfo;
};
Skylink.prototype.HANDSHAKE_PROGRESS = {
  ENTER: 'enter',
  WELCOME: 'welcome',
  OFFER: 'offer',
  ANSWER: 'answer',
  ERROR: 'error'
};

/**
 * Stores the list of Peer connection health timers.
 * This timers sets a timeout which checks and waits if Peer connection is successfully established,
 *   or else it will attempt to re-negotiate with the Peer connection again.
 * @attribute _peerConnectionHealthTimers
 * @param {Object} <#peerId> The Peer connection health timer.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._peerConnectionHealthTimers = {};

/**
 * Stores the list of Peer connection "healthy" flags, which indicates if Peer connection is
 *   successfully established, and when the health timers expires, it will clear the timer
 *   and not attempt to re-negotiate with the Peer connection again.
 * @attribute _peerConnectionHealth
 * @param {Boolean} <#peerId> The flag that indicates if Peer connection has been successfully established.
 * @type JSON
 * @private
 * @since 0.5.5
 */
Skylink.prototype._peerConnectionHealth = {};

/**
 * Stores the User connection priority weight.
 * If Peer has a higher connection weight, it will do the offer from its Peer connection first.
 * @attribute _peerPriorityWeight
 * @type Number
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._peerPriorityWeight = 0;

/**
 * Function that creates the Peer connection offer session description.
 * @method _doOffer
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._doOffer = function(targetMid, peerBrowser) {
  var self = this;
  var pc = self._peerConnections[targetMid] || self._addPeer(targetMid, peerBrowser);

  log.log([targetMid, null, null, 'Checking caller status'], peerBrowser);

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    log.warn([targetMid, 'RTCSessionDescription', 'offer', 'Dropping of creating of offer ' +
      'as connection does not exists']);
    return;
  }

  // Added checks to ensure that state is "stable" if setting local "offer"
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    log.warn([targetMid, 'RTCSessionDescription', 'offer',
      'Dropping of creating of offer as signalingState is not "' +
      self.PEER_CONNECTION_STATE.STABLE + '" ->'], pc.signalingState);
    return;
  }

  var offerConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
  };

  // NOTE: Removing ICE restart functionality as of now since Firefox does not support it yet
  // Check if ICE connection failed or disconnected, and if so, do an ICE restart
  /*if ([self.ICE_CONNECTION_STATE.DISCONNECTED, self.ICE_CONNECTION_STATE.FAILED].indexOf(pc.iceConnectionState) > -1) {
    offerConstraints.iceRestart = true;
  }*/

  // Prevent undefined OS errors
  peerBrowser.os = peerBrowser.os || '';

  /*
    Ignoring these old codes as Firefox 39 and below is no longer supported
    if (window.webrtcDetectedType === 'moz' && peerBrowser.agent === 'MCU') {
      unifiedOfferConstraints.mandatory = unifiedOfferConstraints.mandatory || {};
      unifiedOfferConstraints.mandatory.MozDontOfferDataChannel = true;
      beOfferer = true;
    }

    if (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion >= 32) {
      unifiedOfferConstraints = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      };
    }
  */

  // Fallback to use mandatory constraints for plugin based browsers
  if (['IE', 'safari'].indexOf(window.webrtcDetectedBrowser) > -1) {
    offerConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
      }
    };
  }

  if (self._enableDataChannel) {
    // Edge doesn't support datachannels yet
    if (!(self._dataChannels[targetMid] && self._dataChannels[targetMid].main) &&
      window.webrtcDetectedBrowser !== 'edge') {
      self._createDataChannel(targetMid);
      self._peerConnections[targetMid].hasMainChannel = true;
    }
  }

  log.debug([targetMid, null, null, 'Creating offer with config:'], offerConstraints);

  pc.createOffer(function(offer) {
    log.debug([targetMid, null, null, 'Created offer'], offer);

    self._setLocalAndSendMessage(targetMid, offer);

  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    log.error([targetMid, null, null, 'Failed creating an offer:'], error);

  }, offerConstraints);
};

/**
 * Function that creates the Peer connection answer session description.
 * This comes after receiving and setting the offer session description.
 * @method _doAnswer
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._doAnswer = function(targetMid) {
  var self = this;
  log.log([targetMid, null, null, 'Creating answer with config:'],
    self._room.connection.sdpConstraints);
  var pc = self._peerConnections[targetMid];

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    log.warn([targetMid, 'RTCSessionDescription', 'answer', 'Dropping of creating of answer ' +
      'as connection does not exists']);
    return;
  }

  // Added checks to ensure that state is "have-remote-offer" if setting local "answer"
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER) {
    log.warn([targetMid, 'RTCSessionDescription', 'answer',
      'Dropping of creating of answer as signalingState is not "' +
      self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER + '" ->'], pc.signalingState);
    return;
  }

  // No ICE restart constraints for createAnswer as it fails in chrome 48
  // { iceRestart: true }
  pc.createAnswer(function(answer) {
    log.debug([targetMid, null, null, 'Created answer'], answer);
    self._setLocalAndSendMessage(targetMid, answer);
  }, function(error) {
    log.error([targetMid, null, null, 'Failed creating an answer:'], error);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  });//, self._room.connection.sdpConstraints);
};

/**
 * Function that starts the Peer connection health timer.
 * To count as a "healthy" successful established Peer connection, the
 *   ICE connection state has to be "connected" or "completed",
 *   messaging Datachannel type state has to be "opened" (if Datachannel is enabled)
 *   and Signaling state has to be "stable".
 * Should consider dropping of counting messaging Datachannel type being opened as
 *   it should not involve the actual Peer connection for media (audio/video) streaming.
 * @method _startPeerConnectionHealthCheck
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._startPeerConnectionHealthCheck = function (peerId, toOffer) {
  var self = this;
  var timer = self._enableIceTrickle ? (toOffer ? 12500 : 10000) : 50000;
  timer = (self._hasMCU) ? 105000 : timer;

  // increase timeout for android/ios
  /*var agent = self.getPeerInfo(peerId).agent;
  if (['Android', 'iOS'].indexOf(agent.name) > -1) {
    timer = 105000;
  }*/

  timer += self._retryCount*10000;

  log.log([peerId, 'PeerConnectionHealth', null,
    'Initializing check for peer\'s connection health']);

  if (self._peerConnectionHealthTimers[peerId]) {
    // might be a re-handshake again
    self._stopPeerConnectionHealthCheck(peerId);
  }

  self._peerConnectionHealthTimers[peerId] = setTimeout(function () {
    // re-handshaking should start here.
    var connectionStable = false;
    var pc = self._peerConnections[peerId];

    if (pc) {
      var dc = (self._dataChannels[peerId] || {}).main;

      var dcConnected = pc.hasMainChannel ? dc && dc.readyState === self.DATA_CHANNEL_STATE.OPEN : true;
      var iceConnected = pc.iceConnectionState === self.ICE_CONNECTION_STATE.CONNECTED ||
        pc.iceConnectionState === self.ICE_CONNECTION_STATE.COMPLETED;
      var signalingConnected = pc.signalingState === self.PEER_CONNECTION_STATE.STABLE;

      connectionStable = dcConnected && iceConnected && signalingConnected;

      log.debug([peerId, 'PeerConnectionHealth', null, 'Connection status'], {
        dcConnected: dcConnected,
        iceConnected: iceConnected,
        signalingConnected: signalingConnected
      });
    }

    log.debug([peerId, 'PeerConnectionHealth', null, 'Require reconnection?'], connectionStable);

    if (!connectionStable) {
      log.warn([peerId, 'PeerConnectionHealth', null, 'Peer\'s health timer ' +
      'has expired'], 10000);

      // clear the loop first
      self._stopPeerConnectionHealthCheck(peerId);

      log.debug([peerId, 'PeerConnectionHealth', null,
        'Ice connection state time out. Re-negotiating connection']);

      //Maximum increament is 5 minutes
      if (self._retryCount<30){
        //Increase after each consecutive connection failure
        self._retryCount++;
      }

      // do a complete clean
      if (!self._hasMCU) {
        self._restartPeerConnection(peerId, true, true, null, false);
      } else {
        self._restartMCUConnection();
      }
    } else {
      self._peerConnectionHealth[peerId] = true;
    }
  }, timer);
};

/**
 * Function that stops the Peer connection health timer.
 * This happens when Peer connection has been successfully established or when
 *   Peer leaves the Room.
 * @method _stopPeerConnectionHealthCheck
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._stopPeerConnectionHealthCheck = function (peerId) {
  var self = this;

  if (self._peerConnectionHealthTimers[peerId]) {
    log.debug([peerId, 'PeerConnectionHealth', null,
      'Stopping peer connection health timer check']);

    clearTimeout(self._peerConnectionHealthTimers[peerId]);
    delete self._peerConnectionHealthTimers[peerId];

  } else {
    log.debug([peerId, 'PeerConnectionHealth', null,
      'Peer connection health does not have a timer check']);
  }
};

/**
 * Function that sets the local session description and sends to Peer.
 * If trickle ICE is disabled, the local session description will be sent after
 *   ICE gathering has been completed.
 * @method _setLocalAndSendMessage
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setLocalAndSendMessage = function(targetMid, sessionDescription) {
  var self = this;
  var pc = self._peerConnections[targetMid];

  /*if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER && pc.setAnswer) {
    log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Ignoring session description. User has already set local answer'], sessionDescription);
    return;
  }
  if (sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER && pc.setOffer) {
    log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Ignoring session description. User has already set local offer'], sessionDescription);
    return;
  }*/

  // Added checks to ensure that sessionDescription is defined first
  if (!(!!sessionDescription && !!sessionDescription.sdp)) {
    log.warn([targetMid, 'RTCSessionDescription', null, 'Dropping of setting local unknown sessionDescription ' +
      'as received sessionDescription is empty ->'], sessionDescription);
    return;
  }

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Dropping of setting local "' +
      sessionDescription.type + '" as connection does not exists']);
    return;
  }

  // Added checks to ensure that state is "stable" if setting local "offer"
  if (sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER &&
    pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Dropping of setting local "offer" as signalingState is not "' +
      self.PEER_CONNECTION_STATE.STABLE + '" ->'], pc.signalingState);
    return;

  // Added checks to ensure that state is "have-remote-offer" if setting local "answer"
  } else if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER &&
    pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER) {
    log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Dropping of setting local "answer" as signalingState is not "' +
      self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER + '" ->'], pc.signalingState);
    return;
  }


  // NOTE ALEX: handle the pc = 0 case, just to be sure
  var sdpLines = sessionDescription.sdp.split('\r\n');

  // remove h264 invalid pref
  sdpLines = self._removeSDPFirefoxH264Pref(sdpLines);

  // Check if stereo was enabled
  if (self._streams.userMedia && self._streams.userMedia.settings.audio) {
    if (self._streams.userMedia.settings.stereo) {
      log.info([targetMid, null, null, 'Enabling OPUS stereo flag']);
      self._addSDPStereo(sdpLines);
    }
  }

  // Set SDP max bitrate
  if (self._streamsBandwidthSettings) {
    sdpLines = self._setSDPBitrate(sdpLines, self._streamsBandwidthSettings);
  }

  // set sdp resolution
  /*if (self._streamSettings.hasOwnProperty('video')) {
    sdpLines = self._setSDPVideoResolution(sdpLines, self._streamSettings.video);
  }*/

  /*log.info([targetMid, null, null, 'Custom bandwidth settings:'], {
    audio: (self._streamSettings.bandwidth.audio || 'Not set') + ' kB/s',
    video: (self._streamSettings.bandwidth.video || 'Not set') + ' kB/s',
    data: (self._streamSettings.bandwidth.data || 'Not set') + ' kB/s'
  });*/

  /*if (self._streamSettings.video.hasOwnProperty('frameRate') &&
    self._streamSettings.video.hasOwnProperty('resolution')){
    log.info([targetMid, null, null, 'Custom resolution settings:'], {
      frameRate: (self._streamSettings.video.frameRate || 'Not set') + ' fps',
      width: (self._streamSettings.video.resolution.width || 'Not set') + ' px',
      height: (self._streamSettings.video.resolution.height || 'Not set') + ' px'
    });
  }*/

  // set video codec
  if (self._selectedVideoCodec !== self.VIDEO_CODEC.AUTO) {
    sdpLines = self._setSDPVideoCodec(sdpLines);
  } else {
    log.log([targetMid, null, null, 'Not setting any video codec']);
  }

  // set audio codec
  if (self._selectedAudioCodec !== self.AUDIO_CODEC.AUTO) {
    sdpLines = self._setSDPAudioCodec(sdpLines);
  } else {
    log.log([targetMid, null, null, 'Not setting any audio codec']);
  }

  sessionDescription.sdp = sdpLines.join('\r\n');

  var removeVP9AptRtxPayload = false;
  var agent = (self._peerInformations[targetMid] || {}).agent || {};

  if (agent.pluginVersion) {
    // 0.8.870 supports
    var parts = agent.pluginVersion.split('.');
    removeVP9AptRtxPayload = parseInt(parts[0], 10) >= 0 && parseInt(parts[1], 10) >= 8 &&
      parseInt(parts[2], 10) >= 870;
  }

  // Remove rtx or apt= lines that prevent connections for browsers without VP8 or VP9 support
  // See: https://bugs.chromium.org/p/webrtc/issues/detail?id=3962
  if (['chrome', 'opera'].indexOf(window.webrtcDetectedBrowser) > -1 && removeVP9AptRtxPayload) {
    log.warn([targetMid, null, null, 'Removing apt= and rtx payload lines causing connectivity issues']);

    sessionDescription.sdp = sessionDescription.sdp.replace(/a=rtpmap:\d+ rtx\/\d+\r\na=fmtp:\d+ apt=101\r\n/g, '');
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=rtpmap:\d+ rtx\/\d+\r\na=fmtp:\d+ apt=107\r\n/g, '');
  }

  // NOTE ALEX: opus should not be used for mobile
  // Set Opus as the preferred codec in SDP if Opus is present.
  //sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  // limit bandwidth
  //sessionDescription.sdp = this._limitBandwidth(sessionDescription.sdp);
  log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
    'Updated session description:'], sessionDescription);

  // Added checks if there is a current local sessionDescription being processing before processing this one
  if (pc.processingLocalSDP) {
    log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Dropping of setting local ' + sessionDescription.type + ' as there is another ' +
      'sessionDescription being processed ->'], sessionDescription);
    return;
  }

  pc.processingLocalSDP = true;

  pc.setLocalDescription(sessionDescription, function() {
    log.debug([targetMid, sessionDescription.type, 'Local description set']);

    pc.processingLocalSDP = false;

    self._trigger('handshakeProgress', sessionDescription.type, targetMid);
    if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER) {
      pc.setAnswer = 'local';
    } else {
      pc.setOffer = 'local';
    }

    if (!self._enableIceTrickle && !pc.gathered) {
      log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
        'Waiting for Ice gathering to complete to prevent Ice trickle']);
      return;
    }

    // make checks for firefox session description
    if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER && window.webrtcDetectedBrowser === 'firefox') {
      sessionDescription.sdp = self._addSDPSsrcFirefoxAnswer(targetMid, sessionDescription.sdp);
    }

    self._sendChannelMessage({
      type: sessionDescription.type,
      sdp: sessionDescription.sdp,
      mid: self._user.sid,
      target: targetMid,
      rid: self._room.id,
      userInfo: self._getUserInfo()
    });

  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingLocalSDP = false;

    log.error([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Failed setting local description: '], error);
  });
};

Skylink.prototype.GET_PEERS_STATE = {
	ENQUIRED: 'enquired',
	RECEIVED: 'received'
};

/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled and
 *   <code>"autoIntroduce"</code> flag to be disabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>, as only Users connecting using
 *   the App Key with this flag enabled (which we call privileged Users / Peers) can retrieve the list of
 *   Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.com.sg/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about privileged App Key feature here</a>.
 * </blockquote>
 * The list of <a href="#method_introducePeer"><code>introducePeer</code> method</a> Peer introduction request states.
 * @attribute INTRODUCE_STATE
 * @param {String} INTRODUCING <small>Value <code>"enquired"</code></small>
 *   The value of the state when introduction request for the selected pair of Peers has been made to the Signaling server.
 * @param {String} ERROR       <small>Value <code>"error"</code></small>
 *   The value of the state when introduction request made to the Signaling server
 *   for the selected pair of Peers has failed.
 * @readOnly
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.INTRODUCE_STATE = {
	INTRODUCING: 'introducing',
	ERROR: 'error'
};

/**
 * Stores the flag that indicates if "autoIntroduce" is enabled.
 * If enabled, the Peers connecting the same Room will receive each others "enter" message ping.
 * @attribute _autoIntroduce
 * @type Boolean
 * @default true
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._autoIntroduce = true;

/**
 * Stores the flag that indicates if "isPrivileged" is enabled.
 * If enabled, the User has Privileged features which has the ability to retrieve the list of
 *   Peers in the same App space with <code>getPeers()</code> method
 *   and introduce Peers to each other with <code>introducePeer</code> method.
 * @attribute isPrivileged
 * @type Boolean
 * @default false
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._isPrivileged = false;

/**
 * Stores the list of Peers retrieved from the Signaling from <code>getPeers()</code> method.
 * @attribute _peerList
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._peerList = null;

/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled for the App Key
 *   provided in the <a href="#method_init"><code>init()</code> method</a>, as only Users connecting using
 *   the App Key with this flag enabled (which we call privileged Users / Peers) can retrieve the list of
 *   Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.com.sg/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about privileged App Key feature here</a>.
 * </blockquote>
 * Function that retrieves the list of Peer IDs from Rooms within the same App space.
 * @method getPeers
 * @param {Boolean} [showAll=false] The flag if Signaling server should also return the list of privileged Peer IDs.
 * <small>By default, the Signaling server does not include the list of privileged Peer IDs in the return result.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_getPeersStateChange">
 *   <code>getPeersStateChange</code> event</a> triggering <code>state</code> parameter payload value as
 *   <code>RECEIVED</code> for request success.</small>
 *   [Rel: Skylink.GET_PEERS_STATE]
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>getPeers()</code> error when retrieving list of Peer IDs from Rooms
 *   within the same App space.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature matches the <code>peerList</code> parameter payload received in the
 *   <a href="#event_getPeersStateChange"><code>getPeersStateChange</code> event</a>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>If App Key provided in the <a href="#method_init"><code>init()</code> method</a> is not
 *   a Privileged enabled Key: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Retrieves the list of Peer IDs from Rooms within the same App space. <ol>
 *   <li><a href="#event_getPeersStateChange"><code>getPeersStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> value as <code>ENQUIRED</code>.</li>
 *   <li>If received list from Signaling server successfully: <ol>
 *   <li><a href="#event_getPeersStateChange"><code>getPeersStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> value as <code>RECEIVED</code>.</li></ol></li></ol>
 * @example
 *   // Example 1: Retrieving the un-privileged Peers
 *   skylinkDemo.joinRoom(function (jRError, jRSuccess) {
 *     if (jRError) return;
 *     skylinkDemo.getPeers(function (error, success) {
 *        if (error) return;
 *        console.log("The list of only un-privileged Peers in the same App space ->", success);
 *     });
 *   });
 *
 *   // Example 2: Retrieving the all Peers (privileged or un-privileged)
 *   skylinkDemo.joinRoom(function (jRError, jRSuccess) {
 *     if (jRError) return;
 *     skylinkDemo.getPeers(true, function (error, success) {
 *        if (error) return;
 *        console.log("The list of all Peers in the same App space ->", success);
 *     });
 *   });
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.getPeers = function(showAll, callback){
	var self = this;
	if (!self._isPrivileged){
		log.warn('Please upgrade your key to privileged to use this function');
		return;
	}
	if (!self._appKey){
		log.warn('App key is not defined. Please authenticate again.');
		return;
	}

	// Only callback is provided
	if (typeof showAll === 'function'){
		callback = showAll;
		showAll = false;
	}

	self._sendChannelMessage({
		type: self._SIG_MESSAGE_TYPE.GET_PEERS,
		showAll: showAll || false
	});

	self._trigger('getPeersStateChange',self.GET_PEERS_STATE.ENQUIRED, self._user.sid, null);

	log.log('Enquired server for peers within the realm');

	if (typeof callback === 'function'){
		self.once('getPeersStateChange', function(state, privilegedPeerId, peerList){
			callback(null, peerList);
		}, function(state, privilegedPeerId, peerList){
			return state === self.GET_PEERS_STATE.RECEIVED;
		});
	}

};

/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled and
 *   <code>"autoIntroduce"</code> flag to be disabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>, as only Users connecting using
 *   the App Key with this flag enabled (which we call privileged Users / Peers) can retrieve the list of
 *   Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.com.sg/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about privileged App Key feature here</a>.
 * </blockquote>
 * Function that selects and introduces a pair of Peers to start connection with each other.
 * @method introducePeer
 * @param {String} sendingPeerId The Peer ID to be connected with <code>receivingPeerId</code>.
 * @param {String} receivingPeerId The Peer ID to be connected with <code>sendingPeerId</code>.
 * @trigger <ol class="desc-seq">
 *   <li>If App Key provided in the <a href="#method_init"><code>init()</code> method</a> is not
 *   a Privileged enabled Key: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Starts sending introduction request for the selected pair of Peers to the Signaling server. <ol>
 *   <li><a href="#event_introduceStateChange"><code>introduceStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> value as <code>INTRODUCING</code>.</li>
 *   <li>If received errors from Signaling server: <ol>
 *   <li><a href="#event_introduceStateChange"><code>introduceStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> value as <code>ERROR</code>.</li></ol></li></ol></li></ol>
 * @example
 *   // Example 1: Introduce a pair of Peers
 *   skylinkDemo.on("introduceStateChange", function (state, privilegedPeerId, sendingPeerId, receivingPeerId) {
 *	   if (state === skylinkDemo.INTRODUCE_STATE.INTRODUCING) {
 *       console.log("Peer '" + sendingPeerId + "' has been introduced to '" + receivingPeerId + "'");
 *     }
 *   });
 *
 *   skylinkDemo.joinRoom(function (jRError, jRSuccess) {
 *     if (jRError) return;
 *     skylinkDemo.getPeers(function (gPError, gPSuccess) {
 *        if (gPError) return;
 *        skylinkDemo.introducePeer(gPSuccess.roomName[0], gPSuccess.roomName[1]);
 *     });
 *   });
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.introducePeer = function(sendingPeerId, receivingPeerId){
	var self = this;
	if (!self._isPrivileged){
		log.warn('Please upgrade your key to privileged to use this function');
		self._trigger('introduceStateChange', self.INTRODUCE_STATE.ERROR, self._user.sid, sendingPeerId, receivingPeerId, 'notPrivileged');
		return;
	}
	self._sendChannelMessage({
		type: self._SIG_MESSAGE_TYPE.INTRODUCE,
		sendingPeerId: sendingPeerId,
		receivingPeerId: receivingPeerId
	});
	self._trigger('introduceStateChange', self.INTRODUCE_STATE.INTRODUCING, self._user.sid, sendingPeerId, receivingPeerId, null);
	log.log('Introducing',sendingPeerId,'to',receivingPeerId);
};


Skylink.prototype.SYSTEM_ACTION = {
  WARNING: 'warning',
  REJECT: 'reject'
};

/**
 * The list of Signaling server reaction states reason of action code during
 * <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.
 * @attribute SYSTEM_ACTION_REASON
 * @param {String} CREDENTIALS_EXPIRED <small>Value <code>"oldTimeStamp"</code></small>
 *   The value of the reason code when Room session token has expired.
 *   <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *   <small>Results with: <code>REJECT</code></small>
 * @param {String} CREDENTIALS_ERROR   <small>Value <code>"credentialError"</code></small>
 *   The value of the reason code when Room session token provided is invalid.
 *   <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 * @param {String} DUPLICATED_LOGIN    <small>Value <code>"duplicatedLogin"</code></small>
 *   The value of the reason code when Room session token has been used already.
 *   <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *   <small>Results with: <code>REJECT</code></small>
 * @param {String} ROOM_NOT_STARTED    <small>Value <code>"notStart"</code></small>
 *   The value of the reason code when Room session has not started.
 *   <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *   <small>Results with: <code>REJECT</code></small>
 * @param {String} EXPIRED             <small>Value <code>"expired"</code></small>
 *   The value of the reason code when Room session has ended already.
 *   <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *   <small>Results with: <code>REJECT</code></small>
 * @param {String} ROOM_LOCKED         <small>Value <code>"locked"</code></small>
 *   The value of the reason code when Room is locked.
 *   <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *   <small>Results with: <code>REJECT</code></small>
 * @param {String} FAST_MESSAGE        <small>Value <code>"fastmsg"</code></small>
 *    The value of the reason code when User is flooding socket messages to the Signaling server
 *    that is sent too quickly within less than a second interval.
 *    <small>Happens after Room session has started. This can be caused by various methods like
 *    <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *    <a href="#method_setUserData"><code>setUserData()</code> method</a>,
 *    <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *    <a href="#method_enableAudio"><code>enableAudio()</code> method</a>,
 *    <a href="#method_enableVideo"><code>enableVideo()</code> method</a>,
 *    <a href="#method_disableAudio"><code>disableAudio()</code> method</a> and
 *    <a href="#method_disableVideo"><code>disableVideo()</code> method</a></small>
 *    <small>Results with: <code>WARNING</code></small>
 * @param {String} ROOM_CLOSING        <small>Value <code>"toClose"</code></small>
 *    The value of the reason code when Room session is ending.
 *    <small>Happens after Room session has started. This serves as a prerequisite warning before
 *    <code>ROOM_CLOSED</code> occurs.</small>
 *    <small>Results with: <code>WARNING</code></small>
 * @param {String} ROOM_CLOSED         <small>Value <code>"roomclose"</code></small>
 *    The value of the reason code when Room session has just ended.
 *    <small>Happens after Room session has started.</small>
 *    <small>Results with: <code>REJECT</code></small>
 * @param {String} SERVER_ERROR        <small>Value <code>"serverError"</code></small>
 *    The value of the reason code when Room session fails to start due to some technical errors.
 *    <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *    <small>Results with: <code>REJECT</code></small>
 * @param {String} KEY_ERROR           <small>Value <code>"keyFailed"</code></small>
 *    The value of the reason code when Room session fails to start due to some technical error pertaining to
 *    App Key initialization.
 *    <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *    <small>Results with: <code>REJECT</code></small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.SYSTEM_ACTION_REASON = {
  CREDENTIALS_EXPIRED: 'oldTimeStamp',
  CREDENTIALS_ERROR: 'credentialError',
  DUPLICATED_LOGIN: 'duplicatedLogin',
  ROOM_NOT_STARTED: 'notStart',
  EXPIRED: 'expired',
  ROOM_LOCKED: 'locked',
  FAST_MESSAGE: 'fastmsg',
  ROOM_CLOSING: 'toclose',
  ROOM_CLOSED: 'roomclose',
  SERVER_ERROR: 'serverError',
  KEY_ERROR: 'keyFailed'
};

/**
 * Stores the current Room name that User is connected to.
 * @attribute _selectedRoom
 * @type String
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._selectedRoom = null;

/**
 * Stores the flag that indicates if Room is locked.
 * @attribute _roomLocked
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomLocked = false;

/**
 * Stores the flag that indicates if User is connected to the Room.
 * @attribute _inRoom
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._inRoom = false;

/**
 * Function that starts the Room session.
 * @method joinRoom
 * @param {String} [room] The Room name.
 * - When not provided, its value is the <code>options.defaultRoom</code> provided in the
 *   <a href="#method_init"><code>init()</code> method</a>.
 *   <small>Note that if you are using credentials based authentication, you cannot switch the Room
 *   that is not the same as the <code>options.defaultRoom</code> defined in the
 *   <a href="#method_init"><code>init()</code> method</a>.</small>
 * @param {JSON} [options] The Room session configuration options.
 * @param {JSON|String} [options.userData] The User custom data.
 *   <small>This can be set after Room session has started using the
 *   <a href="#method_setUserData"><code>setUserData()</code> method</a>.</small>
 * @param {Boolean} [options.useExactConstraints] The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options.useExactConstraints</code> parameter settings.
 *   <small>See the <code>options.useExactConstraints</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> for more information.</small>
 * @param {Boolean|JSON} [options.audio] The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options.audio</code> parameter settings.
 *   <small>When value is defined as <code>true</code> or an object, <a href="#method_getUserMedia">
 *   <code>getUserMedia()</code> method</a> to be invoked to retrieve new Stream. If
 *   <code>options.video</code> is not defined, it will be defined as <code>false</code>.</small>
 *   <small>Object signature matches the <code>options.audio</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</small>
 * @param {Boolean|JSON} [options.video] The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options.video</code> parameter settings.
 *   <small>When value is defined as <code>true</code> or an object, <a href="#method_getUserMedia">
 *   <code>getUserMedia()</code> method</a> to be invoked to retrieve new Stream. If
 *   <code>options.audio</code> is not defined, it will be defined as <code>false</code>.</small>
 *   <small>Object signature matches the <code>options.video</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</small>
 * @param {JSON} [options.bandwidth] <blockquote class="info">Note that this is currently not supported
 *   with Firefox browsers versions 48 and below as noted in an existing
 *   <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=976521#c21">bugzilla ticket here</a>.</blockquote>
 *   The configuration to set the maximum streaming bandwidth sent to Peers.
 * @param {Number} [options.bandwidth.audio] The maximum audio streaming bandwidth sent to Peers in kbps.
 *   <small>Recommended values are <code>50</code> to <code>200</code>. <code>50</code> is sufficient enough for
 *   an audio call. The higher you go if you want clearer audio and to be able to hear music streaming.</small>
 * @param {Number} [options.bandwidth.video] The maximum video streaming bandwidth sent to Peers.
 *   <small>Recommended values are <code>256</code>-<code>500</code> for 180p quality,
 *   <code>500</code>-<code>1024</code> for 360p quality, <code>1024</code>-<code>2048</code> for 720p quality
 *   and <code>2048</code>-<code>4096</code> for 1080p quality.</small>
 * @param {Number} [options.bandwidth.data] The maximum data streaming bandwidth sent to Peers.
 *   <small>This affects the P2P messaging in <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>,
 *   and data transfers in <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> and
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a>.</small>
 * @param {Boolean} [options.manualGetUserMedia] The flag if <code>joinRoom()</code> should trigger
 *   <a href="#event_mediaAccessRequired"><code>mediaAccessRequired</code> event</a> in which the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> or
 *   <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>
 *   must be retrieved as a requirement before Room session may begin.
 *   <small>This ignores the <code>options.audio</code> and <code>options.video</code> configuration.</small>
 *   <small>After 30 seconds without any Stream retrieved, this results in the `callback(error, ..)` result.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_peerJoined">
 *   <code>peerJoined</code> event</a> triggering <code>isSelf</code> parameter payload value as <code>true</code>
 *   for request success.</small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Error|String} callback.error.error The error received when starting Room session has failed.
 * @param {Number} callback.error.errorCode The current <a href="#method_init"><code>init()</code> method</a> ready state.
 *   [Rel: Skylink.READY_STATE_CHANGE]
 * @param {String} callback.error.room The Room name.
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.room The Room name.
 * @param {String} callback.success.peerId The User's Room session Peer ID.
 * @param {JSON} callback.success.peerInfo The User's current Room session information.
 *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
 * @example
 *   // Example 1: Connecting to the default Room without Stream
 *   skylinkDemo.joinRoom(function (error, success) {
 *     if (error) return;
 *     console.log("User connected.");
 *   });
 *
 *   // Example 2: Connecting to Room "testxx" with Stream
 *   skylinkDemo.joinRoom("testxx", {
 *     audio: true,
 *     video: true
 *   }, function (error, success) {
 *     if (error) return;
 *     console.log("User connected with getUserMedia() Stream.")
 *   });
 *
 *   // Example 3: Connecting to default Room with Stream retrieved earlier
 *   skylinkDemo.getUserMedia(function (gUMError, gUMSuccess) {
 *     if (gUMError) return;
 *     skylinkDemo.joinRoom(function (error, success) {
 *       if (error) return;
 *       console.log("User connected with getUserMedia() Stream.");
 *     });
 *   });
 *
 *   // Example 4: Connecting to "testxx" Room with shareScreen() Stream retrieved manually
 *   skylinkDemo.on("mediaAccessRequired", function () {
 *     skylinkDemo.shareScreen(function (sSError, sSSuccess) {
 *       if (sSError) return;
 *     });
 *   });
 *
 *   skylinkDemo.joinRoom("testxx", {
 *     manualGetUserMedia: true
 *   }, function (error, success) {
 *     if (error) return;
 *     console.log("User connected with shareScreen() Stream.");
 *   });
 *
 *   // Example 5: Connecting to "testxx" Room with User custom data
 *   var data = { username: "myusername" };
 *   skylinkDemo.joinRoom("testxx", {
 *     userData: data
 *   }, function (error, success) {
 *     if (error) return;
 *     console.log("User connected with correct user data?", success.peerInfo.userData.username === data.username);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If User is in a Room: <ol>
 *   <li>Invoke <a href="#method_leaveRoom"><code>leaveRoom()</code> method</a>
 *   to end current Room connection. <small>Invoked <a href="#method_leaveRoom"><code>leaveRoom()</code>
 *   method</a> <code>stopMediaOptions</code> parameter value will be <code>false</code>.</small>
 *   <small>Regardless of request errors, <code>joinRoom()</code> will still proceed.</small></li></ol></li>
 *   <li>Check if Room name provided matches the Room name of the currently retrieved Room session token. <ol>
 *   <li>If Room name does not matches: <ol>
 *   <li>Invoke <a href="#method_init"><code>init()</code> method</a> to retrieve new Room session token. <ol>
 *   <li>If request has errors: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li>
 *   <li>Open a new socket connection to Signaling server. <ol><li>If Socket connection fails: <ol>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers parameter payload
 *   <code>errorCode</code> as <code>CONNECTION_FAILED</code>. <ol>
 *   <li>Checks if there are fallback ports and transports to use. <ol>
 *   <li>If there are still fallback ports and transports: <ol>
 *   <li>Attempts to retry socket connection to Signaling server. <ol>
 *   <li><a href="#event_channelRetry"><code>channelRetry</code> event</a> triggers.</li>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers parameter
 *   payload <code>errorCode</code> as <code>RECONNECTION_ATTEMPT</code>.</li>
 *   <li>If attempt to retry socket connection to Signaling server has failed: <ol>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers parameter payload
 *   <code>errorCode</code> as <code>RECONNECTION_FAILED</code>.</li>
 *   <li>Checks if there are still any more fallback ports and transports to use. <ol>
 *   <li>If there are is no more fallback ports and transports to use: <ol>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers
 *   parameter payload <code>errorCode</code> as <code>RECONNECTION_ABORTED</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li><li>Else: <ol><li><b>REPEAT</b> attempt to retry socket connection
 *   to Signaling server step.</li></ol></li></ol></li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers
 *   parameter payload <code>errorCode</code> as <code>CONNECTION_ABORTED</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li>
 *   <li>If socket connection to Signaling server has opened: <ol>
 *   <li><a href="#event_channelOpen"><code>channelOpen</code> event</a> triggers.</li></ol></li></ol></li>
 *   <li>Checks if there is <code>options.manualGetUserMedia</code> requested <ol><li>If it is requested: <ol>
 *   <li><a href="#event_mediaAccessRequired"><code>mediaAccessRequired</code> event</a> triggers.</li>
 *   <li>If more than 30 seconds has passed and no <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>
 *   or <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>
 *   has been retrieved: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li><li>Else: <ol>
 *   <li>If there is <code>options.audio</code> or <code>options.video</code> requested: <ol>
 *   <li>Invoke <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>. <ol>
 *   <li>If request has errors: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li>
 *   </ol></li><li>Starts the Room session <ol><li>If Room session has started successfully: <ol>
 *   <li><a href="#event_peerJoined"><code>peerJoined</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   <li>If MCU is enabled for the App Key provided in <a href="#method_init"><code>init()</code>
 *   method</a> and connected: <ol><li><a href="#event_serverPeerJoined"><code>serverPeerJoined</code>
 *   event</a> triggers <code>serverPeerType</code> as <code>MCU</code>. <small>MCU has
 *   to be present in the Room in order for Peer connections to commence.</small></li>
 *   <li>Checks for any available Stream <ol>
 *   <li>If <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> is available: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a>
 *   triggers parameter payload <code>isSelf</code> value as <code>true</code> and <code>stream</code>
 *   as <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.
 *   <small>User will be sending <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>
 *   to Peers.</small></li></ol></li>
 *   <li>Else if <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> is available: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter
 *   payload <code>isSelf</code> value as <code>true</code> and <code>stream</code> as
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 *   <small>User will be sending <code>getUserMedia()</code> Stream to Peers.</small></li></ol></li><li>Else: <ol>
 *   <li>No Stream will be sent.</li></ol></li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_systemAction"><code>systemAction</code> event</a> triggers
 *   parameter payload <code>action</code> as <code>REJECT</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.5
 */

Skylink.prototype.joinRoom = function(room, mediaOptions, callback) {
  var self = this;
  var error;
  var stopStream = false;
  var previousRoom = self._selectedRoom;

  if (room === null) {
    error = 'Invalid room name is provided';
    log.error(error, room);

    if (typeof mediaOptions === 'function') {
      callback = mediaOptions;
      mediaOptions = undefined;
    }

    if (typeof callback === 'function') {
      callback({
        room: room,
        errorCode: self._readyState,
        error: new Error(error)
      }, null);
    }
    return;
  }
  else if (typeof room === 'string') {
    //joinRoom(room+); - skip

    //joinRoom(room+,mediaOptions+) - skip

    // joinRoom(room+,callback+)
    if (typeof mediaOptions === 'function') {
      callback = mediaOptions;
      mediaOptions = undefined;

    // joinRoom(room+, mediaOptions-)
    } else if (typeof mediaOptions !== 'undefined') {
      if (mediaOptions === null || typeof mediaOptions !== 'object') {
        error = 'Invalid mediaOptions is provided';
        log.error(error, mediaOptions);

        // joinRoom(room+,mediaOptions-,callback+)
        if (typeof callback === 'function') {
          callback({
            room: room,
            errorCode: self._readyState,
            error: new Error(error)
          }, null);
        }
        return;
      }
    }

  } else if (typeof room === 'object') {
    //joinRoom(mediaOptions+, callback);
    if (typeof mediaOptions === 'function') {
      callback = mediaOptions;
    }

    //joinRoom(mediaOptions);
    mediaOptions = room;
    room = undefined;

  } else if (typeof room === 'function') {
    //joinRoom(callback);
    callback = room;
    room = undefined;
    mediaOptions = undefined;

  } else if (typeof room !== 'undefined') {
    //joinRoom(mediaOptions-,callback?);
    error = 'Invalid mediaOptions is provided';
    log.error(error, mediaOptions);

    if (typeof mediaOptions === 'function') {
      callback = mediaOptions;
      mediaOptions = undefined;
    }

    if (typeof callback === 'function') {
      callback({
        room: self._defaultRoom,
        errorCode: self._readyState,
        error: new Error(error)
      }, null);
      return;
    }
  }

  // If no room provided, join the default room
  if (!room) {
    room = self._defaultRoom;
  }

  //if none of the above is true --> joinRoom()
  var channelCallback = function (error, success) {
    if (error) {
      if (typeof callback === 'function') {
        callback({
          error: error,
          errorCode: null,
          room: self._selectedRoom
        }, null);
      }
    } else {
      if (typeof callback === 'function') {
        self.once('peerJoined', function(peerId, peerInfo, isSelf) {
          // keep returning _inRoom false, so do a wait
          self._wait(function () {
            log.log([null, 'Socket', self._selectedRoom, 'Peer joined. Firing callback. ' +
              'PeerId ->'
            ], peerId);
            callback(null, {
              room: self._selectedRoom,
              peerId: peerId,
              peerInfo: peerInfo
            });
          }, function () {
            return self._inRoom;
          }, false);
        }, function(peerId, peerInfo, isSelf) {
          return isSelf;
        }, false);
      }

      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.JOIN_ROOM,
        uid: self._user.uid,
        cid: self._key,
        rid: self._room.id,
        userCred: self._user.token,
        timeStamp: self._user.timeStamp,
        apiOwner: self._appKeyOwner,
        roomCred: self._room.token,
        start: self._room.startDateTime,
        len: self._room.duration,
        isPrivileged: self._isPrivileged === true, // Default to false if undefined
        autoIntroduce: self._autoIntroduce !== false, // Default to true if undefined
        key: self._appKey
      });
    }
  };

  if (self._inRoom) {
    if (typeof mediaOptions === 'object') {
      if (mediaOptions.audio === false && mediaOptions.video === false) {
        stopStream = true;
        log.warn([null, 'MediaStream', self._selectedRoom, 'Stopping current MediaStream ' +
          'as provided settings for audio and video is false (' + stopStream + ')'], mediaOptions);
      }
    }

    log.log([null, 'Socket', previousRoom, 'Leaving room before joining new room'], self._selectedRoom);

    self.leaveRoom(stopStream, function(error, success) {
      log.log([null, 'Socket', previousRoom, 'Leave room callback result'], {
        error: error,
        success: success
      });
      log.log([null, 'Socket', self._selectedRoom, 'Joining room. Media options:'], mediaOptions);
      if (typeof room === 'string' ? room !== self._selectedRoom : false) {
        self._initSelectedRoom(room, function(errorObj) {
          if (errorObj) {
            if (typeof callback === 'function') {
              callback({
                room: self._selectedRoom,
                errorCode: self._readyState,
                error: new Error(errorObj)
              }, null);
            }
          } else {
            self._waitForOpenChannel(mediaOptions, channelCallback);
          }
        });
      } else {
        self._waitForOpenChannel(mediaOptions, channelCallback);
      }
    });

  } else {
    log.log([null, 'Socket', self._selectedRoom, 'Joining room. Media options:'],
      mediaOptions);

    var isNotSameRoom = typeof room === 'string' ? room !== self._selectedRoom : false;

    if (isNotSameRoom) {
      self._initSelectedRoom(room, function(errorObj) {
        if (errorObj) {
          if (typeof callback === 'function') {
            callback({
              room: self._selectedRoom,
              errorCode: self._readyState,
              error: new Error(errorObj)
            }, null);
          }
        } else {
          self._waitForOpenChannel(mediaOptions, channelCallback);
        }
      });
    } else {
      self._waitForOpenChannel(mediaOptions, channelCallback);
    }
  }
};

/**
 * Function that stops Room session.
 * @method leaveRoom
 * @param {Boolean|JSON} [stopMediaOptions=true] The flag if <code>leaveRoom()</code>
 *   should stop both <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>
 *   and <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 * - When provided as a boolean, this sets both <code>stopMediaOptions.userMedia</code>
 *   and <code>stopMediaOptions.screenshare</code> to its boolean value.
 * @param {Boolean} [stopMediaOptions.userMedia=true] The flag if <code>leaveRoom()</code>
 *   should stop <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 *   <small>This invokes <a href="#method_stopStream"><code>stopStream()</code> method</a>.</small>
 * @param {Boolean} [stopMediaOptions.screenshare=true] The flag if <code>leaveRoom()</code>
 *   should stop <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.
 *   <small>This invokes <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_peerLeft">
 *   <code>peerLeft</code> event</a> triggering <code>isSelf</code> parameter payload value as <code>true</code>
 *   for request success.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>leaveRoom()</code> error when stopping Room session.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.peerId The User's Room session Peer ID.
 * @param {String} callback.success.previousRoom The Room name.
 * @trigger <ol class="desc-seq">
 *   <li>Checks if User is in Room. <ol><li>If User is not in a Room: <ol><li><b>ABORT</b> and return error.</li>
 *   </ol></li><li>Else: <ol><li>If parameter <code>stopMediaOptions.userMedia</code> value is <code>true</code>: <ol>
 *   <li>Invoke <a href="#method_stopStream"><code>stopStream()</code> method</a>. 
 *   <small>Regardless of request errors, <code>leaveRoom()</code> will still proceed.</small></li></ol></li>
 *   <li>If parameter <code>stopMediaOptions.screenshare</code> value is <code>true</code>: <ol>
 *   <li>Invoke <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.
 *   <small>Regardless of request errors, <code>leaveRoom()</code> will still proceed.</small></li></ol></li>
 *   <li><a href="#event_peerLeft"><code>peerLeft</code> event</a> triggers for User and all connected Peers in Room.</li>
 *   <li>If MCU is enabled for the App Key provided in <a href="#method_init"><code>init()</code> method</a>
 *   and connected: <ol><li><a href="#event_serverPeerLeft"><code>serverPeerLeft</code> event</a>
 *   triggers parameter payload <code>serverPeerType</code> as <code>MCU</code>.</li></ol></li>
 *   <li><a href="#event_channelClose"><code>channelClose</code> event</a> triggers.</li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.leaveRoom = function(stopMediaOptions, callback) {
  var self = this;
  var error; // j-shint !!!
  var stopUserMedia = true;
  var stopScreenshare = true;

  // shift parameters
  if (typeof stopMediaOptions === 'function') {
    callback = stopMediaOptions;
    stopMediaOptions = true;
  } else if (typeof stopMediaOptions === 'undefined') {
    stopMediaOptions = true;
  }

  // stopMediaOptions === null or {} ?
  if (typeof stopMediaOptions === 'object' && stopMediaOptions !== null) {
    stopUserMedia = stopMediaOptions.userMedia !== false;
    stopScreenshare = stopMediaOptions.screenshare !== false;

  } else if (typeof stopMediaOptions !== 'boolean') {
    error = 'stopMediaOptions parameter provided is not a boolean or valid object';
    log.error(error, stopMediaOptions);
    if (typeof callback === 'function') {
      log.log([null, 'Socket', self._selectedRoom, 'Error occurred. ' +
        'Firing callback with error -> '
      ], error);
      callback(new Error(error), null);
    }
    return;

  } else if (stopMediaOptions === false) {
    stopUserMedia = false;
    stopScreenshare = false;
  }

  if (!self._inRoom) {
    error = 'Unable to leave room as user is not in any room';
    log.error(error);
    if (typeof callback === 'function') {
      log.log([null, 'Socket', self._selectedRoom, 'Error occurred. ' +
        'Firing callback with error -> '
      ], error);
      callback(new Error(error), null);
    }
    return;
  }

  // NOTE: ENTER/WELCOME made but no peerconnection...
  // which may result in peerLeft not triggered..
  // WHY? but to ensure clear all
  var peers = Object.keys(self._peerInformations);
  var conns = Object.keys(self._peerConnections);
  var i;
  for (i = 0; i < conns.length; i++) {
    if (peers.indexOf(conns[i]) === -1) {
      peers.push(conns[i]);
    }
  }
  for (i = 0; i < peers.length; i++) {
    self._removePeer(peers[i]);
  }
  self._inRoom = false;
  self._closeChannel();

  self._stopStreams({
    userMedia: stopUserMedia,
    screenshare: stopScreenshare
  });

  self._wait(function() {
    log.log([null, 'Socket', self._selectedRoom, 'User left the room. Callback fired.']);
    self._trigger('peerLeft', self._user.sid, self.getPeerInfo(), true);

    if (typeof callback === 'function') {
      callback(null, {
        peerId: self._user.sid,
        previousRoom: self._selectedRoom
      });
    }
  }, function() {
    return (Object.keys(self._peerConnections).length === 0 &&
      self._channelOpen === false); // &&
      //self._readyState === self.READY_STATE_CHANGE.COMPLETED);
  }, false);
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that locks the current Room when in session to prevent other Peers from joining the Room.
 * @method lockRoom
 * @trigger <ol class="desc-seq">
 *   <li>Requests to Signaling server to lock Room <ol>
 *   <li><a href="#event_roomLock"><code>roomLock</code> event</a> triggers parameter payload
 *   <code>isLocked</code> value as <code>true</code>.</li></ol></li></ol>
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.lockRoom = function() {
  log.log('Update to isRoomLocked status ->', true);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: true
  });
  this._roomLocked = true;
  this._trigger('roomLock', true, this._user.sid,
    this.getPeerInfo(), true);
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that unlocks the current Room when in session to allow other Peers to join the Room.
 * @method unlockRoom
 * @trigger <ol class="desc-seq">
 *   <li>Requests to Signaling server to unlock Room <ol>
 *   <li><a href="#event_roomLock"><code>roomLock</code> event</a> triggers parameter payload
 *   <code>isLocked</code> value as <code>false</code>.</li></ol></li></ol>
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.unlockRoom = function() {
  log.log('Update to isRoomLocked status ->', false);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: false
  });
  this._roomLocked = false;
  this._trigger('roomLock', false, this._user.sid,
    this.getPeerInfo(), true);
};

/**
 * Function that waits for Socket connection to Signaling to be opened.
 * @method _waitForOpenChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._waitForOpenChannel = function(mediaOptions, callback) {
  var self = this;
  // when reopening room, it should stay as 0
  self._socketCurrentReconnectionAttempt = 0;

  // wait for ready state before opening
  self._wait(function() {
    self._condition('channelOpen', function() {
      mediaOptions = mediaOptions || {};

      self._userData = mediaOptions.userData || self._userData || '';
      self._streamsBandwidthSettings = {};

      if (mediaOptions.bandwidth) {
        if (typeof mediaOptions.bandwidth.audio === 'number') {
          self._streamsBandwidthSettings.audio = mediaOptions.bandwidth.audio;
        }

        if (typeof mediaOptions.bandwidth.video === 'number') {
          self._streamsBandwidthSettings.video = mediaOptions.bandwidth.video;
        }

        if (typeof mediaOptions.bandwidth.data === 'number') {
          self._streamsBandwidthSettings.data = mediaOptions.bandwidth.data;
        }
      }

      // get the stream
      if (mediaOptions.manualGetUserMedia === true) {
        self._trigger('mediaAccessRequired');

        var current50Block = 0;
        var mediaAccessRequiredFailure = false;
        // wait for available audio or video stream
        self._wait(function () {
          if (mediaAccessRequiredFailure === true) {
            self._onUserMediaError(new Error('Waiting for stream timeout'), false, false);
          } else {
            callback(null, self._streams.userMedia.stream);
          }
        }, function () {
          current50Block += 1;
          if (current50Block === 600) {
            mediaAccessRequiredFailure = true;
            return true;
          }

          if (self._streams.userMedia && self._streams.userMedia.stream) {
            return true;
          }
        }, 50);
        return;
      }

      if (mediaOptions.audio || mediaOptions.video) {
        self.getUserMedia({
          useExactConstraints: !!mediaOptions.useExactConstraints,
          audio: mediaOptions.audio,
          video: mediaOptions.video

        }, function (error, success) {
          if (error) {
            callback(error, null);
          } else {
            callback(null, success);
          }
        });
        return;
      }

      callback(null, null);

    }, function() { // open channel first if it's not opened

      if (!self._channelOpen) {
        self._openChannel();
      }
      return self._channelOpen;
    }, function(state) {
      return true;
    });
  }, function() {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  });

};

Skylink.prototype.READY_STATE_CHANGE = {
  INIT: 0,
  LOADING: 1,
  COMPLETED: 2,
  ERROR: -1
};

/**
 * The list of <a href="#method_init"><code>init()</code> method</a> ready state failure codes.
 * @attribute READY_STATE_CHANGE_ERROR
 * @param {Number} API_INVALID                 <small>Value <code>4001</code></small>
 *   The value of the failure code when provided App Key in <code>init()</code> does not exists.
 *   <small>To resolve this, check that the provided App Key exists in
 *   <a href="https://console.temasys.io">the Temasys Console</a>.</small>
 * @param {Number} API_DOMAIN_NOT_MATCH        <small>Value <code>4002</code></small>
 *   The value of the failure code when <code>"domainName"</code> property in the App Key does not
 *   match the accessing server IP address.
 *   <small>To resolve this, contact our <a href="http://support.temasys.com.sg">support portal</a>.</small>
 * @param {Number} API_CORS_DOMAIN_NOT_MATCH   <small>Value <code>4003</code></small>
 *   The value of the failure code when <code>"corsurl"</code> property in the App Key does not match accessing CORS.
 *   <small>To resolve this, configure the App Key CORS in
 *   <a href="https://console.temasys.io">the Temasys Console</a>.</small>
 * @param {Number} API_CREDENTIALS_INVALID     <small>Value <code>4004</code></small>
 *   The value of the failure code when there is no [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
 *   present in the HTTP headers during the request to the Auth server present nor
 *   <code>options.credentials.credentials</code> configuration provided in the <code>init()</code>.
 *   <small>To resolve this, ensure that CORS are present in the HTTP headers during the request to the Auth server.</small>
 * @param {Number} API_CREDENTIALS_NOT_MATCH   <small>Value <code>4005</code></small>
 *   The value of the failure code when the <code>options.credentials.credentials</code> configuration provided in the
 *   <code>init()</code> does not match up with the <code>options.credentials.startDateTime</code>,
 *   <code>options.credentials.duration</code> or that the <code>"secret"</code> used to generate
 *   <code>options.credentials.credentials</code> does not match the App Key's <code>"secret</code> property provided.
 *   <small>To resolve this, check that the <code>options.credentials.credentials</code> is generated correctly and
 *   that the <code>"secret"</code> used to generate it is from the App Key provided in the <code>init()</code>.</small>
 * @param {Number} API_INVALID_PARENT_KEY      <small>Value <code>4006</code></small>
 *   The value of the failure code when the App Key provided does not belong to any existing App.
 *   <small>To resolve this, check that the provided App Key exists in
 *   <a href="https://console.temasys.io">the Developer Console</a>.</small>
 * @param {Number} API_NO_MEETING_RECORD_FOUND <small>Value <code>4010</code></small>
 *   The value of the failure code when provided <code>options.credentials</code>
 *   does not match any scheduled meetings available for the "Persistent Room" enabled App Key provided.
 *   <small>See the <a href="http://support.temasys.com.sg/support/solutions/articles/
 * 12000002811-using-the-persistent-room-feature-to-configure-meetings">Persistent Room article</a> to learn more.</small>
 * @param {Number} API_OVER_SEAT_LIMIT         <small>Value <code>4020</code></small>
 *   The value of the failure code when App Key has reached its current concurrent users limit.
 *   <small>To resolve this, use another App Key. To create App Keys dynamically, see the
 *   <a href="https://temasys.atlassian.net/wiki/display/TPD/SkylinkAPI+-+Application+Resources">Application REST API
 *   docs</a> for more information.</small>
 * @param {Number} API_RETRIEVAL_FAILED        <small>Value <code>4021</code></small>
 *   The value of the failure code when App Key retrieval of authentication token fails.
 *   <small>If this happens frequently, contact our <a href="http://support.temasys.com.sg">support portal</a>.</small>
 * @param {Number} API_WRONG_ACCESS_DOMAIN     <small>Value <code>5005</code></small>
 *   The value of the failure code when App Key makes request to the incorrect Auth server.
 *   <small>To resolve this, ensure that the <code>roomServer</code> is not configured. If this persists even without
 *   <code>roomServer</code> configuration, contact our <a href="http://support.temasys.com.sg">support portal</a>.</small>
 * @param {Number} XML_HTTP_REQUEST_ERROR      <small>Value <code>-1</code></small>
 *   The value of the failure code when requesting to Auth server has timed out.
 * @param {Number} NO_SOCKET_IO                <small>Value <code>1</code></small>
 *   The value of the failure code when dependency <a href="http://socket.io/download/">Socket.IO client</a> is not loaded.
 *   <small>To resolve this, ensure that the Socket.IO client dependency is loaded before the Skylink SDK.
 *   You may use the provided Socket.IO client <a href="http://socket.io/download/">CDN here</a>.</small>
 * @param {Number} NO_XMLHTTPREQUEST_SUPPORT   <small>Value <code>2</code></small>
 *   The value of the failure code when <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest">
 *   XMLHttpRequest API</a> required to make request to Auth server is not supported.
 *   <small>To resolve this, display in the Web UI to ask clients to switch to the list of supported browser
 *   as <a href="https://github.com/Temasys/SkylinkJS/tree/0.6.14#supported-browsers">listed in here</a>.</small>
 * @param {Number} NO_WEBRTC_SUPPORT           <small>Value <code>3</code></small>
 *   The value of the failure code when <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/">
 *   RTCPeerConnection API</a> required for Peer connections is not supported.
 *   <small>To resolve this, display in the Web UI to ask clients to switch to the list of supported browser
 *   as <a href="https://github.com/Temasys/SkylinkJS/tree/0.6.14#supported-browsers">listed in here</a>.
 *   For <a href="http://confluence.temasys.com.sg/display/TWPP">plugin supported browsers</a>, if the clients
 *   does not have the plugin installed, there will be an installation toolbar that will prompt for installation
 *   to support the RTCPeerConnection API.</small>
 * @param {Number} NO_PATH                     <small>Value <code>4</code></small>
 *   The value of the failure code when provided <code>init()</code> configuration has errors.
 * @param {Number} ADAPTER_NO_LOADED           <small>Value <code>7</code></small>
 *   The value of the failure code when dependency <a href="https://github.com/Temasys/AdapterJS/">AdapterJS</a>
 *   is not loaded.
 *   <small>To resolve this, ensure that the AdapterJS dependency is loaded before the Skylink dependency.
 *   You may use the provided AdapterJS <a href="https://github.com/Temasys/AdapterJS/">CDN here</a>.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.READY_STATE_CHANGE_ERROR = {
  API_INVALID: 4001,
  API_DOMAIN_NOT_MATCH: 4002,
  API_CORS_DOMAIN_NOT_MATCH: 4003,
  API_CREDENTIALS_INVALID: 4004,
  API_CREDENTIALS_NOT_MATCH: 4005,
  API_INVALID_PARENT_KEY: 4006,
  API_NO_MEETING_RECORD_FOUND: 4010,
  API_OVER_SEAT_LIMIT: 4020,
  API_RETRIEVAL_FAILED: 4021,
  API_WRONG_ACCESS_DOMAIN: 5005,
  XML_HTTP_REQUEST_ERROR: -1,
  NO_SOCKET_IO: 1,
  NO_XMLHTTPREQUEST_SUPPORT: 2,
  NO_WEBRTC_SUPPORT: 3,
  NO_PATH: 4,
  ADAPTER_NO_LOADED: 7
};

/**
 * Stores the flag if HTTPS connections should be enforced when connecting to
 *   the API or Signaling server if App is accessing from HTTP domain.
 * HTTPS connections are enforced if App is accessing from HTTPS domains.
 * @attribute _forceSSL
 * @type Boolean
 * @default false
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._forceSSL = false;

/**
 * Stores the flag if TURNS connections should be enforced when connecting to
 *   the TURN server if App is accessing from HTTP domain.
 * TURNS connections are enforced if App is accessing from HTTPS domains.
 * @attribute _forceTURNSSL
 * @type Boolean
 * @default false
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._forceTURNSSL = false;

/**
 * Stores the flag if TURN connections should be enforced when connecting to Peers.
 * This filters all non "relay" ICE candidates to enforce connections via the TURN server.
 * @attribute _forceTURN
 * @type Boolean
 * @default false
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._forceTURN = false;

/**
 * Stores the construct API REST path to obtain Room credentials.
 * @attribute _path
 * @type String
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._path = null;

/**
 * Spoofs the REGIONAL_SERVER to prevent errors on deployed apps except the fact this no longer works.
 * Automatic regional selection has already been implemented hence REGIONAL_SERVER is no longer useful.
 * @attribute REGIONAL_SERVER
 * @type JSON
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.REGIONAL_SERVER = {};

/**
 * Stores the API server url.
 * @attribute _roomServer
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomServer = '//api.temasys.com.sg';

/**
 * Stores the App Key configured in <code>init()</code>.
 * @attribute _appKey
 * @type String
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._appKey = null;

/**
 * Stores the default Room name to connect to when <code>joinRoom()</code> does not provide a Room name.
 * @attribute _defaultRoom
 * @type String
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._defaultRoom = null;

/**
 * Stores the <code>init()</code> credentials starting DateTime stamp in ISO 8601.
 * @attribute _roomStart
 * @type String
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomStart = null;

/**
 * Stores the <code>init()</code> credentials duration counted in hours.
 * @attribute _roomDuration
 * @type Number
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomDuration = null;

/**
 * Stores the <code>init()</code> generated credentials string.
 * @attribute _roomCredentials
 * @type String
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomCredentials = null;

/**
 * Stores the current <code>init()</code> readyState.
 * @attribute _readyState
 * @type Number
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._readyState = 0;

/**
 * Stores the "cid" used for <code>joinRoom()</code>.
 * @attribute _key
 * @type String
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._key = null;

/**
 * Stores the "apiOwner" used for <code>joinRoom()</code>.
 * @attribute _appKeyOwner
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._appKeyOwner = null;

/**
 * Stores the Room credentials information for <code>joinRoom()</code>.
 * @attribute _room
 * @param {String} id The "rid" for <code>joinRoom()</code>.
 * @param {String} token The "roomCred" for <code>joinRoom()</code>.
 * @param {String} startDateTime The "start" for <code>joinRoom()</code>.
 * @param {String} duration The "len" for <code>joinRoom()</code>.
 * @param {String} connection The RTCPeerConnection constraints and configuration. This is not used in the SDK
 *   except for the "mediaConstraints" property that sets the default <code>getUserMedia()</code> settings.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._room = null;

/**
 * Function that authenticates and initialises App Key used for Room connections.
 * @method init
 * @param {JSON|String} options The configuration options.
 * - When provided as a string, it's configured as <code>options.appKey</code>.
 * @param {String} options.appKey The App Key.
 *   <small>By default, <code>init()</code> uses [HTTP CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
 *   authentication. For credentials based authentication, see the <code>options.credentials</code> configuration
 *   below. You can know more about the <a href="http://support.temasys.com.sg/support/solutions/articles/
 * 12000002712-authenticating-your-application-key-to-start-a-connection">in the authentication methods article here</a>
 *   for more details on the various authentication methods.</small>
 *   <small>If you are using the Persistent Room feature for scheduled meetings, you will require to
 *   use the credential based authentication. See the <a href="http://support.temasys.com.sg/support
 * /solutions/articles/12000002811-using-the-persistent-room-feature-to-configure-meetings">Persistent Room article here
 *   </a> for more information.</small>
 * @param {String} [options.defaultRoom] The default Room to connect to when no <code>room</code> parameter
 *    is provided in  <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.
 * - When not provided, its value is <code>options.appKey</code>.
 *   <small>Note that switching Rooms is not available when using <code>options.credentials</code> based authentication.
 *   The Room that User will be connected to is the <code>defaultRoom</code> provided.</small>
 * @param {String} [options.roomServer] The Auth server.
 * <small>Note that this is a debugging feature and is only used when instructed for debugging purposes.</small>
 * @param {Boolean} [options.enableIceTrickle=true] The flag if Peer connections should
 *   trickle ICE for faster connectivity.
 * @param {Boolean} [options.enableDataChannel=true] The flag if Datachannel connections should be enabled.
 *   <small>This is required to be enabled for <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>,
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> and
 *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.</small>
 * @param {Boolean} [options.enableTURNServer=true] The flag if TURN ICE servers should
 *   be used when constructing Peer connections to allow TURN connections when required and enabled for the App Key.
 * @param {Boolean} [options.enableSTUNServer=true] The flag if STUN ICE servers should
 *   be used when constructing Peer connections to allow TURN connections when required.
 * @param {Boolean} [options.forceTURN=false] The flag if Peer connections should enforce
 *   connections over the TURN server.
 *   <small>This sets <code>options.enableTURNServer</code> value to <code>true</code> and
 *   <code>options.enableSTUNServer</code> value to <code>false</code>.</small>
 *   <small>During Peer connections, it filters out non <code>"relay"</code> ICE candidates to
 *   ensure that TURN connections is enforced.</small>
 * @param {Boolean} [options.usePublicSTUN=true] The flag if publicly available STUN ICE servers should
 *   be used if <code>options.enableSTUNServer</code> is enabled.
 * @param {Boolean} [options.TURNServerTransport] <blockquote class="info">
 *   Note that configuring the protocol may not necessarily result in the desired network transports protocol
 *   used in the actual TURN network traffic as it depends which protocol the browser selects and connects with.
 *   This simply configures the TURN ICE server urls <code?transport=(protocol)</code> query option when constructing
 *   the Peer connection. When all protocols are selected, the ICE servers urls are duplicated with all protocols.
 *   </blockquote> The option to configure the <code>?transport=</code>
 *   query parameter in TURN ICE servers when constructing a Peer connections.
 * - When not provided, its value is <code>ANY</code>.
 *   [Rel: Skylink.TURN_TRANSPORT]
 * @param {JSON} [options.credentials] The credentials used for authenticating App Key with
 *   credentials to retrieve the Room session token used for connection in <a href="#method_joinRoom">
 *   <code>joinRoom()</code> method</a>.
 *   <small>Note that switching of Rooms is not allowed when using credentials based authentication, unless
 *   <code>init()</code> is invoked again with a different set of credentials followed by invoking
 *   the <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.</small>
 * @param {String} options.credentials.startDateTime The credentials User session in Room starting DateTime
 *   in <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.
 * @param {Number} options.credentials.duration The credentials User session in Room duration in hours.
 * @param {String} options.credentials.credentials The generated credentials used to authenticate
 *   the provided App Key with its <code>"secret"</code> property.
 *   <blockquote class="details"><h5>To generate the credentials:</h5><ol>
 *   <li>Concatenate a string that consists of the Room name you provide in the <code>options.defaultRoom</code>,
 *   the <code>options.credentials.duration</code> and the <code>options.credentials.startDateTime</code>.
 *   <small>Example: <code>var concatStr = defaultRoom + "_" + duration + "_" + startDateTime;</code></small></li>
 *   <li>Hash the concatenated string with the App Key <code>"secret"</code> property using
 *   <a href="https://en.wikipedia.org/wiki/SHA-1">SHA-1</a>.
 *   <small>Example: <code>var hash = CryptoJS.HmacSHA1(concatStr, appKeySecret);</code></small>
 *   <small>See the <a href="https://code.google.com/p/crypto-js/#HMAC"><code>CryptoJS.HmacSHA1</code> library</a>.</small></li>
 *   <li>Encode the hashed string using <a href="https://en.wikipedia.org/wiki/Base64">base64</a>
 *   <small>Example: <code>var b64Str = hash.toString(CryptoJS.enc.Base64);</code></small>
 *   <small>See the <a href="https://code.google.com/p/crypto-js/#The_Cipher_Output">CryptoJS.enc.Base64</a> library</a>.</small></li>
 *   <li>Encode the base64 encoded string to replace special characters using UTF-8 encoding.
 *   <small>Example: <code>var credentials = encodeURIComponent(base64String);</code></small>
 *   <small>See <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
 * Global_Objects/encodeURIComponent">encodeURIComponent() API</a>.</small></li></ol></blockquote>
 * @param {Boolean} [options.audioFallback=false] The flag if <a href="#method_getUserMedia">
 *   <code>getUserMedia()</code> method</a> should fallback to retrieve only audio Stream when
 *   retrieving audio and video Stream fails.
 * @param {Boolean} [options.forceSSL=false] The flag if HTTPS connections should be enforced
 *   during request to Auth server and socket connections to Signaling server
 *   when accessing <code>window.location.protocol</code> value is <code>"http:"</code>.
 *   <small>By default, <code>"https:"</code> protocol connections uses HTTPS connections.</small>
 * @param {String} [options.audioCodec] <blockquote class="info">
 *   Note that if the audio codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.</blockquote>
 *   The option to configure the preferred audio codec
 *   to use to encode sending audio data when available for Peer connection.
 * - When not provided, its value is <code>AUTO</code>.
 *   [Rel: Skylink.AUDIO_CODEC]
 * @param {String} [options.videoCodec] <blockquote class="info">
 *    Note that if the video codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.</blockquote>
 *   The option to configure the preferred video codec
 *   to use to encode sending video data when available for Peer connection.
 * - When not provided, its value is <code>AUTO</code>.
 *   [Rel: Skylink.VIDEO_CODEC]
 * @param {Number} [options.socketTimeout=20000] The timeout for each attempts for socket connection
 *   with the Signaling server to indicate that connection has timed out and has failed to establish.
 *   <small>Note that the mininum timeout value is <code>5000</code>. If less, this value will be <code>5000</code>.</small>
 * @param {Boolean} [options.forceTURNSSL=false] <blockquote class="info">
 *   Note that currently Firefox does not support the TURNS protocol, and that if TURNS is required,
 *   TURN ICE servers using port <code>443</code> will be used instead.</blockquote>
 *   The flag if TURNS protocol should be used when <code>options.enableTURNServer</code> is enabled.
 *   <small>By default, <code>"https:"</code> protocol connections uses TURNS protocol.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_readyStateChange">
 *   <code>readyStateChange</code> event</a> <code>state</code> parameter payload value
 *   as <code>COMPLETED</code> for request success.</small>
 *   [Rel: Skylink.READY_STATE_CHANGE]
 * @param {JSON|String} callback.error The error result in request.
 * - When defined as string, it's the error when required App Key is not provided.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Number} callback.error.errorCode The <a href="#event_readyStateChange"><code>readyStateChange</code>
 *   event</a> <code>error.errorCode</code> parameter payload value.
 *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
 * @param {Object} callback.error.error The <a href="#event_readyStateChange"><code>readyStateChange</code>
 *   event</a> <code>error.content</code> parameter payload value.
 * @param {Number} callback.error.status The <a href="#event_readyStateChange"><code>readyStateChange</code>
 *   event</a> <code>error.status</code> parameter payload value.
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.serverUrl The constructed REST URL requested to Auth server.
 * @param {String} callback.success.readyState The current ready state.
 *   [Rel: Skylink.READY_STATE_CHANGE]
 * @param {String} callback.success.selectedRoom The Room based on the current Room session token retrieved for.
 * @param {String} callback.success.appKey The configured value of the <code>options.appKey</code>.
 * @param {String} callback.success.defaultRoom The configured value of the <code>options.defaultRoom</code>.
 * @param {String} callback.success.roomServer The configured value of the <code>options.roomServer</code>.
 * @param {Boolean} callback.success.enableIceTrickle The configured value of the <code>options.enableIceTrickle</code>.
 * @param {Boolean} callback.success.enableDataChannel The configured value of the <code>options.enableDataChannel</code>.
 * @param {Boolean} callback.success.enableTURNServer The configured value of the <code>options.enableTURNServer</code>.
 * @param {Boolean} callback.success.enableSTUNServer The configured value of the <code>options.enableSTUNServer</code>.
 * @param {Boolean} callback.success.TURNTransport The configured value of the <code>options.TURNServerTransport</code>.
 * @param {Boolean} callback.success.audioFallback The configured value of the <code>options.audioFallback</code>.
 * @param {Boolean} callback.success.forceSSL The configured value of the <code>options.forceSSL</code>.
 * @param {String} callback.success.audioCodec The configured value of the <code>options.audioCodec</code>.
 * @param {String} callback.success.videoCodec The configured value of the <code>options.videoCodec</code>.
 * @param {Number} callback.success.socketTimeout The configured value of the <code>options.socketTimeout</code>.
 * @param {Boolean} callback.success.forceTURNSSL The configured value of the <code>options.forceTURNSSL</code>.
 * @param {Boolean} callback.success.forceTURN The configured value of the <code>options.forceTURN</code>.
 * @param {Boolean} callback.success.usePublicSTUN The configured value of the <code>options.usePublicSTUN</code>.
 * @example
 *   // Example 1: Using CORS authentication and connection to default Room
 *   skylinkDemo(appKey, function (error, success) {
 *     if (error) return;
 *     skylinkDemo.joinRoom(); // Goes to default Room
 *   });
 *
 *   // Example 2: Using CORS authentication and connection to a different Room
 *   skylinkDemo(appKey, function (error, success) {
 *     skylinkDemo.joinRoom("testxx"); // Goes to "testxx" Room
 *   });
 *
 *   // Example 3: Using credentials authentication and connection to only default Room
 *   var defaultRoom   = "test",
 *       startDateTime = (new Date()).toISOString(),
 *       duration      = 1, // Allows only User session to stay for 1 hour
 *       appKeySecret  = "xxxxxxx",
 *       hash          = CryptoJS.HmacSHA1(defaultRoom + "_" + duration + "_" + startDateTime, appKeySecret);
 *       credentials   = encodeURIComponent(hash.toString(CryptoJS.enc.Base64));
 *
 *   skylinkDemo({
 *     defaultRoom: defaultRoom,
 *     appKey: appKey,
 *     credentials: {
 *       duration: duration,
 *       startDateTime: startDateTime,
 *       credentials: credentials
 *     }
 *   }, function (error, success) {
 *     if (error) return;
 *     skylinkDemo.joinRoom(); // Goes to default Room (switching to different Room is not allowed for credentials authentication)
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If parameter <code>options</code> is not provided: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Checks if dependecies and browser APIs are available. <ol><li>If AdapterJS is not loaded: <ol>
 *   <li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>ERROR</code> and <code>error.errorCode</code> as
 *   <code>ADAPTER_NO_LOADED</code>.</li><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If socket.io-client is not loaded: <ol><li><a href="#event_readyStateChange">
 *   <code>readyStateChange</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>ERROR</code> and <code>error.errorCode</code> as <code>NO_SOCKET_IO</code>.</li>
 *   <li><b>ABORT</b> and return error. </li></ol></li>
 *   <li>If XMLHttpRequest API is not available: <ol><li><a href="#event_readyStateChange">
 *   <code>readyStateChange</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>ERROR</code> and <code>error.errorCode</code> as <code>NO_XMLHTTPREQUEST_SUPPORT</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li><li>If WebRTC is not supported by device: <ol>
 *   <li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> as <code>ERROR</code> and <code>error.errorCode</code> as
 *   <code>NO_WEBRTC_SUPPORT</code>.</li><li><b>ABORT</b> and return error.</li></ol></li></ol></li>
 *   <li>Retrieves Room session token from Auth server. <ol>
 *   <li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>LOADING</code>.</li>
 *   <li>If retrieval was successful: <ol><li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>COMPLETED</code>.</li></ol></li><li>Else: <ol>
 *   <li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.init = function(options, callback) {
  var self = this;

  if (typeof options === 'function'){
    callback = options;
    options = undefined;
  }

  if (!options) {
    var error = 'No API key provided';
    log.error(error);
    if (typeof callback === 'function'){
      callback(error,null);
    }
    return;
  }

  var appKey, room, defaultRoom, region;
  var startDateTime, duration, credentials;
  var roomServer = self._roomServer;
  // NOTE: Should we get all the default values from the variables
  // rather than setting it?
  var enableIceTrickle = true;
  var enableDataChannel = true;
  var enableSTUNServer = true;
  var enableTURNServer = true;
  var TURNTransport = self.TURN_TRANSPORT.ANY;
  var audioFallback = false;
  var forceSSL = false;
  var socketTimeout = 0;
  var forceTURNSSL = false;
  var audioCodec = self.AUDIO_CODEC.AUTO;
  var videoCodec = self.VIDEO_CODEC.AUTO;
  var forceTURN = false;
  var usePublicSTUN = true;

  log.log('Provided init options:', options);

  if (typeof options === 'string') {
    // set all the default api key, default room and room
    appKey = options;
    defaultRoom = appKey;
    room = appKey;
  } else {
    // set the api key
    appKey = options.appKey || options.apiKey;
    // set the room server
    roomServer = (typeof options.roomServer === 'string') ?
      options.roomServer : roomServer;
    // check room server if it ends with /. Remove the extra /
    roomServer = (roomServer.lastIndexOf('/') ===
      (roomServer.length - 1)) ? roomServer.substring(0,
      roomServer.length - 1) : roomServer;
    // set the region
    region = (typeof options.region === 'string') ?
      options.region : region;
    // set the default room
    defaultRoom = (typeof options.defaultRoom === 'string') ?
      options.defaultRoom : appKey;
    // set the selected room
    room = defaultRoom;
    // set ice trickle option
    enableIceTrickle = (typeof options.enableIceTrickle === 'boolean') ?
      options.enableIceTrickle : enableIceTrickle;
    // set data channel option
    enableDataChannel = (typeof options.enableDataChannel === 'boolean') ?
      options.enableDataChannel : enableDataChannel;
    // set stun server option
    enableSTUNServer = (typeof options.enableSTUNServer === 'boolean') ?
      options.enableSTUNServer : enableSTUNServer;
    // set turn server option
    enableTURNServer = (typeof options.enableTURNServer === 'boolean') ?
      options.enableTURNServer : enableTURNServer;
    // set the force ssl always option
    forceSSL = (typeof options.forceSSL === 'boolean') ?
      options.forceSSL : forceSSL;
    // set the socket timeout option
    socketTimeout = (typeof options.socketTimeout === 'number') ?
      options.socketTimeout : socketTimeout;
    // set the socket timeout option to be above 5000
    socketTimeout = (socketTimeout < 5000) ? 5000 : socketTimeout;
    // set the force turn ssl always option
    forceTURNSSL = (typeof options.forceTURNSSL === 'boolean') ?
      options.forceTURNSSL : forceTURNSSL;
    // set the preferred audio codec
    audioCodec = typeof options.audioCodec === 'string' ?
      options.audioCodec : audioCodec;
    // set the preferred video codec
    videoCodec = typeof options.videoCodec === 'string' ?
      options.videoCodec : videoCodec;
    // set the force turn server option
    forceTURN = (typeof options.forceTURN === 'boolean') ?
      options.forceTURN : forceTURN;
    // set the use public stun option
    usePublicSTUN = (typeof options.usePublicSTUN === 'boolean') ?
      options.usePublicSTUN : usePublicSTUN;

    // set turn transport option
    if (typeof options.TURNServerTransport === 'string') {
      // loop out for every transport option
      for (var type in self.TURN_TRANSPORT) {
        if (self.TURN_TRANSPORT.hasOwnProperty(type)) {
          // do a check if the transport option is valid
          if (self.TURN_TRANSPORT[type] === options.TURNServerTransport) {
            TURNTransport = options.TURNServerTransport;
            break;
          }
        }
      }
    }
    // set audio fallback option
    audioFallback = options.audioFallback || audioFallback;
    // Custom default meeting timing and duration
    // Fallback to default if no duration or startDateTime provided
    if (options.credentials &&
      typeof options.credentials.credentials === 'string' &&
      typeof options.credentials.duration === 'number' &&
      typeof options.credentials.startDateTime === 'string') {
      // set start data time
      startDateTime = options.credentials.startDateTime;
      // set the duration
      duration = options.credentials.duration;
      // set the credentials
      credentials = options.credentials.credentials;
    }

    // if force turn option is set to on
    if (forceTURN === true) {
      enableTURNServer = true;
      enableSTUNServer = false;
    }
  }
  // api key path options
  self._appKey = appKey;
  self._roomServer = roomServer;
  self._defaultRoom = defaultRoom;
  self._selectedRoom = room;
  self._serverRegion = region || null;
  self._path = roomServer + '/api/' + appKey + '/' + room;
  // set credentials if there is
  if (credentials && startDateTime && duration) {
    self._roomStart = startDateTime;
    self._roomDuration = duration;
    self._roomCredentials = credentials;
    self._path += (credentials) ? ('/' + startDateTime + '/' +
      duration + '?&cred=' + credentials) : '';
  }

  self._path += ((credentials) ? '&' : '?') + 'rand=' + (new Date()).toISOString();

  // check if there is a other query parameters or not
  if (region) {
    self._path += '&rg=' + region;
  }
  // skylink functionality options
  self._enableIceTrickle = enableIceTrickle;
  self._enableDataChannel = enableDataChannel;
  self._enableSTUN = enableSTUNServer;
  self._enableTURN = enableTURNServer;
  self._TURNTransport = TURNTransport;
  self._audioFallback = audioFallback;
  self._forceSSL = forceSSL;
  self._socketTimeout = socketTimeout;
  self._forceTURNSSL = forceTURNSSL;
  self._selectedAudioCodec = audioCodec;
  self._selectedVideoCodec = videoCodec;
  self._forceTURN = forceTURN;
  self._usePublicSTUN = usePublicSTUN;

  log.log('Init configuration:', {
    serverUrl: self._path,
    readyState: self._readyState,
    appKey: self._appKey,
    roomServer: self._roomServer,
    defaultRoom: self._defaultRoom,
    selectedRoom: self._selectedRoom,
    serverRegion: self._serverRegion,
    enableDataChannel: self._enableDataChannel,
    enableIceTrickle: self._enableIceTrickle,
    enableTURNServer: self._enableTURN,
    enableSTUNServer: self._enableSTUN,
    TURNTransport: self._TURNTransport,
    audioFallback: self._audioFallback,
    forceSSL: self._forceSSL,
    socketTimeout: self._socketTimeout,
    forceTURNSSL: self._forceTURNSSL,
    audioCodec: self._selectedAudioCodec,
    videoCodec: self._selectedVideoCodec,
    forceTURN: self._forceTURN,
    usePublicSTUN: self._usePublicSTUN
  });
  // trigger the readystate
  self._readyState = 0;
  self._trigger('readyStateChange', self.READY_STATE_CHANGE.INIT, null, self._selectedRoom);

  if (typeof callback === 'function'){
    var hasTriggered = false;

    var readyStateChangeFn = function (readyState, error) {
      if (!hasTriggered) {
        if (readyState === self.READY_STATE_CHANGE.COMPLETED) {
          log.log([null, 'Socket', null, 'Firing callback. ' +
          'Ready state change has met provided state ->'], readyState);
          hasTriggered = true;
          self.off('readyStateChange', readyStateChangeFn);
          callback(null,{
            serverUrl: self._path,
            readyState: self._readyState,
            appKey: self._appKey,
            roomServer: self._roomServer,
            defaultRoom: self._defaultRoom,
            selectedRoom: self._selectedRoom,
            serverRegion: self._serverRegion,
            enableDataChannel: self._enableDataChannel,
            enableIceTrickle: self._enableIceTrickle,
            enableTURNServer: self._enableTURN,
            enableSTUNServer: self._enableSTUN,
            TURNTransport: self._TURNTransport,
            audioFallback: self._audioFallback,
            forceSSL: self._forceSSL,
            socketTimeout: self._socketTimeout,
            forceTURNSSL: self._forceTURNSSL,
            audioCodec: self._selectedAudioCodec,
            videoCodec: self._selectedVideoCodec,
            forceTURN: self._forceTURN,
            usePublicSTUN: self._usePublicSTUN
          });
        } else if (readyState === self.READY_STATE_CHANGE.ERROR) {
          log.log([null, 'Socket', null, 'Firing callback. ' +
            'Ready state change has met provided state ->'], readyState);
          log.debug([null, 'Socket', null, 'Ready state met failure'], error);
          hasTriggered = true;
          self.off('readyStateChange', readyStateChangeFn);
          callback({
            error: new Error(error),
            errorCode: error.errorCode,
            status: error.status
          },null);
        }
      }
    };

    self.on('readyStateChange', readyStateChangeFn);
  }

  self._loadInfo();
};

/**
 * Starts retrieving Room credentials information from API server.
 * @method _requestServerInfo
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._requestServerInfo = function(method, url, callback, params) {
  var self = this;
  // XDomainRequest is supported in IE8 - 9
  var useXDomainRequest = typeof window.XDomainRequest === 'function' ||
    typeof window.XDomainRequest === 'object';

  self._socketUseXDR = useXDomainRequest;
  var xhr;

  // set force SSL option
  url = (self._forceSSL) ? 'https:' + url : url;

  if (useXDomainRequest) {
    log.debug([null, 'XMLHttpRequest', method, 'Using XDomainRequest. ' +
      'XMLHttpRequest is now XDomainRequest'], {
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion
    });
    xhr = new XDomainRequest();
    xhr.setContentType = function (contentType) {
      xhr.contentType = contentType;
    };
  } else {
    log.debug([null, 'XMLHttpRequest', method, 'Using XMLHttpRequest'], {
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion
    });
    xhr = new window.XMLHttpRequest();
    xhr.setContentType = function (contentType) {
      xhr.setRequestHeader('Content-type', contentType);
    };
  }

  xhr.onload = function () {
    var response = xhr.responseText || xhr.response;
    var status = xhr.status || 200;
    log.debug([null, 'XMLHttpRequest', method, 'Received sessions parameters'],
      JSON.parse(response || '{}'));
    callback(status, JSON.parse(response || '{}'));
  };

  xhr.onerror = function (error) {
    log.error([null, 'XMLHttpRequest', method, 'Failed retrieving information:'],
      { status: xhr.status });
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: xhr.status || null,
      content: 'Network error occurred. (Status: ' + xhr.status + ')',
      errorCode: self.READY_STATE_CHANGE_ERROR.XML_HTTP_REQUEST_ERROR
    }, self._selectedRoom);
  };

  xhr.onprogress = function () {
    log.debug([null, 'XMLHttpRequest', method,
      'Retrieving information and config from webserver. Url:'], url);
    log.debug([null, 'XMLHttpRequest', method, 'Provided parameters:'], params);
  };

  xhr.open(method, url, true);
  if (params) {
    xhr.setContentType('application/json;charset=UTF-8');
    xhr.send(JSON.stringify(params));
  } else {
    xhr.send();
  }
};

/**
 * Parses the Room credentials information retrieved from API server.
 * @method _parseInfo
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._parseInfo = function(info) {
  log.log('Parsing parameter from server', info);
  if (!info.pc_constraints && !info.offer_constraints) {
    this._trigger('readyStateChange', this.READY_STATE_CHANGE.ERROR, {
      status: 200,
      content: info.info,
      errorCode: info.error
    }, self._selectedRoom);
    return;
  }

  log.debug('Peer connection constraints:', info.pc_constraints);
  log.debug('Offer constraints:', info.offer_constraints);

  this._key = info.cid;
  this._appKeyOwner = info.apiOwner;

  this._signalingServer = info.ipSigserver;
  this._signalingServerPort = null;

  this._isPrivileged = info.isPrivileged;
  this._autoIntroduce = info.autoIntroduce;

  this._user = {
    uid: info.username,
    token: info.userCred,
    timeStamp: info.timeStamp,
    streams: [],
    info: {}
  };
  this._room = {
    id: info.room_key,
    token: info.roomCred,
    startDateTime: info.start,
    duration: info.len,
    connection: {
      peerConstraints: JSON.parse(info.pc_constraints),
      peerConfig: null,
      offerConstraints: JSON.parse(info.offer_constraints),
      sdpConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      },
      mediaConstraints: JSON.parse(info.media_constraints)
    }
  };
  //this._parseDefaultMediaStreamSettings(this._room.connection.mediaConstraints);

  // set the socket ports
  this._socketPorts = {
    'http:': info.httpPortList,
    'https:': info.httpsPortList
  };

  // use default bandwidth and media resolution provided by server
  //this._streamSettings.bandwidth = info.bandwidth;
  //this._streamSettings.video = info.video;
  this._readyState = 2;
  this._trigger('readyStateChange', this.READY_STATE_CHANGE.COMPLETED, null, this._selectedRoom);
  log.info('Parsed parameters from webserver. ' +
    'Ready for web-realtime communication');

};

/**
 * Loads and checks the dependencies if they are loaded correctly.
 * @method _loadInfo
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._loadInfo = function() {
  var self = this;

  // check if adapterjs has been loaded already first or not
  var adapter = (function () {
    try {
      return window.AdapterJS || AdapterJS;
    } catch (error) {
      return false;
    }
  })();

  if (!(!!adapter ? typeof adapter.webRTCReady === 'function' : false)) {
    var noAdapterErrorMsg = 'AdapterJS dependency is not loaded or incorrect AdapterJS dependency is used';
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: noAdapterErrorMsg,
      errorCode: self.READY_STATE_CHANGE_ERROR.ADAPTER_NO_LOADED
    }, self._selectedRoom);
    return;
  }
  if (!window.io) {
    log.error('Socket.io not loaded. Please load socket.io');
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'Socket.io not found',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO
    }, self._selectedRoom);
    return;
  }
  if (!window.XMLHttpRequest) {
    log.error('XMLHttpRequest not supported. Please upgrade your browser');
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'XMLHttpRequest not available',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT
    }, self._selectedRoom);
    return;
  }
  if (!self._path) {
    log.error('Skylink is not initialised. Please call init() first');
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'No API Path is found',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_PATH
    }, self._selectedRoom);
    return;
  }
  adapter.webRTCReady(function () {
    if (!window.RTCPeerConnection) {
      log.error('WebRTC not supported. Please upgrade your browser');
      self._readyState = -1;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: null,
        content: 'WebRTC not available',
        errorCode: self.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT
      }, self._selectedRoom);
      return;
    }
    self._readyState = 1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.LOADING, null, self._selectedRoom);
    self._requestServerInfo('GET', self._path, function(status, response) {
      if (status !== 200) {
        // 403 - Room is locked
        // 401 - API Not authorized
        // 402 - run out of credits
        var errorMessage = 'XMLHttpRequest status not OK\nStatus was: ' + status;
        self._readyState = 0;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: status,
          content: (response) ? (response.info || errorMessage) : errorMessage,
          errorCode: response.error ||
            self.READY_STATE_CHANGE_ERROR.INVALID_XMLHTTPREQUEST_STATUS
        }, self._selectedRoom);
        return;
      }
      self._parseInfo(response);
    });
  });
};

/**
 * Starts initialising for Room credentials for room name provided in <code>joinRoom()</code> method.
 * @method _initSelectedRoom
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._initSelectedRoom = function(room, callback) {
  var self = this;
  if (typeof room === 'function' || typeof room === 'undefined') {
    log.error('Invalid room provided. Room:', room);
    return;
  }
  var defaultRoom = self._defaultRoom;
  var initOptions = {
    roomServer: self._roomServer,
    defaultRoom: room || defaultRoom,
    appKey: self._appKey,
    region: self._serverRegion,
    enableDataChannel: self._enableDataChannel,
    enableIceTrickle: self._enableIceTrickle
  };
  if (self._roomCredentials) {
    initOptions.credentials = {
      credentials: self._roomCredentials,
      duration: self._roomDuration,
      startDateTime: self._roomStart
    };
  }
  self.init(initOptions, function (error, success) {
    self._defaultRoom = defaultRoom;
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  });
};






Skylink.prototype.LOG_LEVEL = {
  DEBUG: 4,
  LOG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0
};

/**
 * Stores the log message starting header string.
 * E.g. "<header> - <the log message>".
 * @attribute _LOG_KEY
 * @type String
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.4
 */
var _LOG_KEY = 'SkylinkJS';


/**
 * Stores the list of available SDK log levels.
 * @attribute _LOG_LEVELS
 * @type Array
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _LOG_LEVELS = ['error', 'warn', 'info', 'log', 'debug'];

/**
 * Stores the current SDK log level.
 * Default is ERROR (<code>0</code>).
 * @attribute _logLevel
 * @type String
 * @default 0
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.4
 */
var _logLevel = 0;

/**
 * Stores the flag if debugging mode is enabled.
 * This manipulates the SkylinkLogs interface.
 * @attribute _enableDebugMode
 * @type Boolean
 * @default false
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.4
 */
var _enableDebugMode = false;

/**
 * Stores the flag if logs should be stored in SkylinkLogs interface.
 * @attribute _enableDebugStack
 * @type Boolean
 * @default false
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _enableDebugStack = false;

/**
 * Stores the flag if logs should trace if available.
 * This uses the <code>console.trace</code> API.
 * @attribute _enableDebugTrace
 * @type Boolean
 * @default false
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _enableDebugTrace = false;

/**
 * Stores the logs used for SkylinkLogs object.
 * @attribute _storedLogs
 * @type Array
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _storedLogs = [];

/**
 * Function that gets the stored logs.
 * @method _getStoredLogsFn
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _getStoredLogsFn = function (logLevel) {
  if (typeof logLevel === 'undefined') {
    return _storedLogs;
  }
  var returnLogs = [];
  for (var i = 0; i < _storedLogs.length; i++) {
    if (_storedLogs[i][1] === _LOG_LEVELS[logLevel]) {
      returnLogs.push(_storedLogs[i]);
    }
  }
  return returnLogs;
};

/**
 * Function that clears the stored logs.
 * @method _clearAllStoredLogsFn
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _clearAllStoredLogsFn = function () {
  _storedLogs = [];
};

/**
 * Function that prints in the Web Console interface the stored logs.
 * @method _printAllStoredLogsFn
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _printAllStoredLogsFn = function () {
  for (var i = 0; i < _storedLogs.length; i++) {
    var timestamp = _storedLogs[i][0];
    var log = (console[_storedLogs[i][1]] !== 'undefined') ?
      _storedLogs[i][1] : 'log';
    var message = _storedLogs[i][2];
    var debugObject = _storedLogs[i][3];

    if (typeof debugObject !== 'undefined') {
      console[log](message, debugObject, timestamp);
    } else {
      console[log](message, timestamp);
    }
  }
};

/**
 * <blockquote class="info">
 *   To utilise and enable the <code>SkylinkLogs</code> API functionalities, the
 *   <a href="#method_setDebugMode"><code>setDebugMode()</code> method</a>
 *   <code>options.storeLogs</code> parameter has to be enabled.
 * </blockquote>
 * The object interface to manage the SDK <a href="https://developer.mozilla.org/en/docs/Web/API/console">
 * Javascript Web Console</a> logs.
 * @property SkylinkLogs
 * @type JSON
 * @global true
 * @for Skylink
 * @since 0.5.5
 */
window.SkylinkLogs = {
  /**
   * Function that gets the current stored SDK <code>console</code> logs.
   * @property SkylinkLogs.getLogs
   * @param {Number} [logLevel] The specific log level of logs to return.
   * - When not provided or that the level does not exists, it will return all logs of all levels.
   *  [Rel: Skylink.LOG_LEVEL]
   * @return {Array} The array of stored logs.<ul>
   *   <li><code><#index></code><var><b>{</b>Array<b>}</b></var><p>The stored log item.</p><ul>
   *   <li><code>0</code><var><b>{</b>Date<b>}</b></var><p>The DateTime of when the log was stored.</p></li>
   *   <li><code>1</code><var><b>{</b>String<b>}</b></var><p>The log level. [Rel: Skylink.LOG_LEVEL]</p></li>
   *   <li><code>2</code><var><b>{</b>String<b>}</b></var><p>The log message.</p></li>
   *   <li><code>3</code><var><b>{</b>Any<b>}</b></var><span class="label">Optional</span><p>The log message object.
   *   </p></li></ul></li></ul>
   * @example
   *  // Example 1: Get logs of specific level
   *  var debugLogs = SkylinkLogs.getLogs(skylinkDemo.LOG_LEVEL.DEBUG);
   *
   *  // Example 2: Get all the logs
   *  var allLogs = SkylinkLogs.getLogs();
   * @type Function
   * @global true
   * @triggerForPropHackNone true
   * @for Skylink
   * @since 0.5.5
   */
  getLogs: _getStoredLogsFn,

  /**
   * Function that clears all the current stored SDK <code>console</code> logs.
   * @property SkylinkLogs.clearAllLogs
   * @type Function
   * @example
   *   // Example 1: Clear all the logs
   *   SkylinkLogs.clearAllLogs();
   * @global true
   * @triggerForPropHackNone true
   * @for Skylink
   * @since 0.5.5
   */
  clearAllLogs: _clearAllStoredLogsFn,

  /**
   * Function that prints all the current stored SDK <code>console</code> logs into the
   * <a href="https://developer.mozilla.org/en/docs/Web/API/console">Javascript Web Console</a>.
   * @property SkylinkLogs.printAllLogs
   * @type Function
   * @example
   *   // Example 1: Print all the logs
   *   SkylinkLogs.printAllLogs();
   * @global true
   * @triggerForPropHackNone true
   * @for Skylink
   * @since 0.5.5
   */
  printAllLogs: _printAllStoredLogsFn
};

/**
 * Function that handles the logs received and prints in the Web Console interface according to the log level set.
 * @method _logFn
 * @private
 * @required
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _logFn = function(logLevel, message, debugObject) {
  var outputLog = _LOG_KEY;

  if (typeof message === 'object') {
    outputLog += (message[0]) ? ' [' + message[0] + '] -' : ' -';
    outputLog += (message[1]) ? ' <<' + message[1] + '>>' : '';
    if (message[2]) {
      outputLog += ' ';
      if (typeof message[2] === 'object') {
        for (var i = 0; i < message[2].length; i++) {
          outputLog += '(' + message[2][i] + ')';
        }
      } else {
        outputLog += '(' + message[2] + ')';
      }
    }
    outputLog += ' ' + message[3];
  } else {
    outputLog += ' - ' + message;
  }

  if (_enableDebugMode && _enableDebugStack) {
    // store the logs
    var logItem = [(new Date()), _LOG_LEVELS[logLevel], outputLog];

    if (typeof debugObject !== 'undefined') {
      logItem.push(debugObject);
    }
    _storedLogs.push(logItem);
  }

  if (_logLevel >= logLevel) {
    // Fallback to log if failure
    logLevel = (typeof console[_LOG_LEVELS[logLevel]] === 'undefined') ? 3 : logLevel;

    if (_enableDebugMode && _enableDebugTrace) {
      var logConsole = (typeof console.trace === 'undefined') ? logLevel[3] : 'trace';
      if (typeof debugObject !== 'undefined') {
        console[_LOG_LEVELS[logLevel]](outputLog, debugObject);
        // output if supported
        if (typeof console.trace !== 'undefined') {
          console.trace('');
        }
      } else {
        console[_LOG_LEVELS[logLevel]](outputLog);
        // output if supported
        if (typeof console.trace !== 'undefined') {
          console.trace('');
        }
      }
    } else {
      if (typeof debugObject !== 'undefined') {
        console[_LOG_LEVELS[logLevel]](outputLog, debugObject);
      } else {
        console[_LOG_LEVELS[logLevel]](outputLog);
      }
    }
  }
};

/**
 * Stores the logging functions.
 * @attribute log
 * @param {Function} debug The function that handles the DEBUG level logs.
 * @param {Function} log The function that handles the LOG level logs.
 * @param {Function} info The function that handles the INFO level logs.
 * @param {Function} warn The function that handles the WARN level logs.
 * @param {Function} error The function that handles the ERROR level logs.
 * @type JSON
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.4
 */
var log = {
  debug: function (message, object) {
    _logFn(4, message, object);
  },

  log: function (message, object) {
    _logFn(3, message, object);
  },

  info: function (message, object) {
    _logFn(2, message, object);
  },

  warn: function (message, object) {
    _logFn(1, message, object);
  },

  error: function (message, object) {
    _logFn(0, message, object);
  }
};

/**
 * Function that configures the level of <code>console</code> API logs to be printed in the
 * <a href="https://developer.mozilla.org/en/docs/Web/API/console">Javascript Web Console</a>.
 * @method setLogLevel
 * @param {Number} [logLevel] The specific log level of logs to return.
 * - When not provided or that the level does not exists, it will not overwrite the current log level.
 *   <small>By default, the initial log level is <code>ERROR</code>.</small>
 *   [Rel: Skylink.LOG_LEVEL]
 * @example
 *   // Example 1: Print all of the console.debug, console.log, console.info, console.warn and console.error logs.
 *   skylinkDemo.setLogLevel(skylinkDemo.LOG_LEVEL.DEBUG);
 *
 *   // Example 2: Print only the console.log, console.info, console.warn and console.error logs.
 *   skylinkDemo.setLogLevel(skylinkDemo.LOG_LEVEL.LOG);
 *
 *   // Example 3: Print only the console.info, console.warn and console.error logs.
 *   skylinkDemo.setLogLevel(skylinkDemo.LOG_LEVEL.INFO);
 *
 *   // Example 4: Print only the console.warn and console.error logs.
 *   skylinkDemo.setLogLevel(skylinkDemo.LOG_LEVEL.WARN);
 *
 *   // Example 5: Print only the console.error logs. This is done by default.
 *   skylinkDemo.setLogLevel(skylinkDemo.LOG_LEVEL.ERROR);
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.setLogLevel = function(logLevel) {
  if(logLevel === undefined) {
    logLevel = Skylink.LOG_LEVEL.WARN;
  }
  for (var level in this.LOG_LEVEL) {
    if (this.LOG_LEVEL[level] === logLevel) {
      _logLevel = logLevel;
      log.log([null, 'Log', level, 'Log level exists. Level is set']);
      return;
    }
  }
  log.error([null, 'Log', level, 'Log level does not exist. Level is not set']);
};

/**
 * Function that configures the debugging mode of the SDK.
 * @method setDebugMode
 * @param {Boolean|JSON} [options=false] The debugging options.
 * - When provided as a boolean, this sets both <code>options.trace</code>
 *   and <code>options.storeLogs</code> to its boolean value.
 * @param {Boolean} [options.trace=false] The flag if SDK <code>console</code> logs
 *   should output as <code>console.trace()</code> logs for tracing the <code>Function</code> call stack.
 *   <small>Note that the <code>console.trace()</code> output logs is determined by the log level set
 *   <a href="#method_setLogLevel"><code>setLogLevel()</code> method</a>.</small>
 *   <small>If <code>console.trace()</code> API is not supported, <code>setDebugMode()</code>
 *   will fallback to use <code>console.log()</code> API.</small>
 * @param {Boolean} [options.storeLogs=false] The flag if SDK should store the <code>console</code> logs.
 *   <small>This is required to be enabled for <a href="#prop_SkylinkLogs"><code>SkylinkLogs</code> API</a>.</small>
 * @example
 *   // Example 1: Enable both options.storeLogs and options.trace
 *   skylinkDemo.setDebugMode(true);
 *
 *   // Example 2: Enable only options.storeLogs
 *   skylinkDemo.setDebugMode({ storeLogs: true });
 *
 *   // Example 3: Disable debugging mode
 *   skylinkDemo.setDebugMode();
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.setDebugMode = function(isDebugMode) {
  if (typeof isDebugMode === 'object') {
    if (Object.keys(isDebugMode).length > 0) {
      _enableDebugTrace = !!isDebugMode.trace;
      _enableDebugStack = !!isDebugMode.storeLogs;
    } else {
      _enableDebugMode = false;
      _enableDebugTrace = false;
      _enableDebugStack = false;
    }
  }
  if (isDebugMode === false) {
    _enableDebugMode = false;
    _enableDebugTrace = false;
    _enableDebugStack = false;

    return;
  }
  _enableDebugMode = true;
  _enableDebugTrace = true;
  _enableDebugStack = true;
};
Skylink.prototype._EVENTS = {
  /**
   * Event triggered when socket connection to Signaling server has opened.
   * @event channelOpen
   * @for Skylink
   * @since 0.1.0
   */
  channelOpen: [],

  /**
   * Event triggered when socket connection to Signaling server has closed.
   * @event channelClose
   * @for Skylink
   * @since 0.1.0
   */
  channelClose: [],

  /**
   * <blockquote class="info">
   *   Note that this is used only for SDK developer purposes.
   * </blockquote>
   * Event triggered when receiving socket message from the Signaling server.
   * @event channelMessage
   * @param {JSON} message The socket message object.
   * @for Skylink
   * @since 0.1.0
   */
  channelMessage: [],

  /**
   * <blockquote class="info">
   *   This may be caused by Javascript errors in the event listener when subscribing to events.<br>
   *   It may be resolved by checking for code errors in your Web App in the event subscribing listener.<br>
   *   <code>skylinkDemo.on("eventName", function () { // Errors here });</code>
   * </blockquote>
   * Event triggered when socket connection encountered exception.
   * @event channelError
   * @param {Error|String} error The error object.
   * @for Skylink
   * @since 0.1.0
   */
  channelError: [],

  /**
   * Event triggered when attempting to establish socket connection to Signaling server when failed.
   * @event channelRetry
   * @param {String} fallbackType The current fallback state.
   *   [Rel: Skylink.SOCKET_FALLBACK]
   * @param {Number} currentAttempt The current reconnection attempt.
   * @for Skylink
   * @since 0.5.6
   */
  channelRetry: [],

  /**
   * Event triggered when attempt to establish socket connection to Signaling server has failed.
   * @event socketError
   * @param {String} errorCode The socket connection error code.
   *   [Rel: Skylink.SOCKET_ERROR]
   * @param {Error|String|Number} error The error object.
   * @param {String} type The fallback state of the socket connection attempt.
   *   [Rel: Skylink.SOCKET_FALLBACK]
   * @for Skylink
   * @since 0.5.5
   */
  socketError: [],

  /**
   * Event triggered when <a href="#method_init"><code>init()</code> method</a> ready state changes.
   * @event readyStateChange
   * @param {String} readyState The current <code>init()</code> ready state.
   *   [Rel: Skylink.READY_STATE_CHANGE]
   * @param {JSON} [error] The error result.
   *   <small>Defined only when <code>state</code> is <code>ERROR</code>.</small>
   * @param {Number} error.status The HTTP status code when failed.
   * @param {Number} error.errorCode The ready state change failure code.
   *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
   * @param {Error} error.content The error object.
   * @param {String} room The Room to The Room to retrieve session token for.
   * @for Skylink
   * @since 0.4.0
   */
  readyStateChange: [],

  /**
   * Event triggered when a Peer connection establishment state has changed.
   * @event handshakeProgress
   * @param {String} state The current Peer connection establishment state.
   *   [Rel: Skylink.HANDSHAKE_PROGRESS]
   * @param {String} peerId The Peer ID.
   * @param {Error|String} [error] The error object.
   *   <small>Defined only when <code>state</code> is <code>ERROR</code>.</small>
   * @for Skylink
   * @since 0.3.0
   */
  handshakeProgress: [],

  /**
   * Event triggered when a Peer connection ICE gathering state has changed.
   * @event candidateGenerationState
   * @param {String} state The current Peer connection ICE gathering state.
   *   [Rel: Skylink.CANDIDATE_GENERATION_STATE]
   * @param {String} peerId The Peer ID.
   * @for Skylink
   * @since 0.1.0
   */
  candidateGenerationState: [],

  /**
   * Event triggered when a Peer connection session description exchanging state has changed.
   * @event peerConnectionState
   * @param {String} state The current Peer connection session description exchanging state.
   *   [Rel: Skylink.PEER_CONNECTION_STATE]
   * @param {String} peerId The Peer ID.
   * @for Skylink
   * @since 0.1.0
   */
  peerConnectionState: [],

  /**
   * Event triggered when a Peer connection ICE connection state has changed.
   * @event iceConnectionState
   * @param {String} state The current Peer connection ICE connection state.
   *   [Rel: Skylink.ICE_CONNECTION_STATE]
   * @param {String} peerId The Peer ID.
   * @for Skylink
   * @since 0.1.0
   */
  iceConnectionState: [],

  /**
   * Event triggered when retrieval of Stream failed.
   * @event mediaAccessError
   * @param {Error|String} error The error object.
   * @param {Boolean} isScreensharing The flag if event occurred during
   *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> and not
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
   * @param {Boolean} isAudioFallbackError The flag if event occurred during
   *   retrieval of audio tracks only when <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
   *   had failed to retrieve both audio and video tracks.
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessError: [],

  /**
   * Event triggered when Stream retrieval fallback state has changed.
   * @event mediaAccessFallback
   * @param {JSON} error The error result.
   * @param {Error|String} error.error The error object.
   * @param {JSON} [error.diff=null] The list of excepted but received audio and video tracks in Stream.
   *   <small>Defined only when <code>state</code> payload is <code>FALLBACKED</code>.</small>
   * @param {JSON} error.diff.video The expected and received video tracks.
   * @param {Number} error.diff.video.expected The expected video tracks.
   * @param {Number} error.diff.video.received The received video tracks.
   * @param {JSON} error.diff.audio The expected and received audio tracks.
   * @param {Number} error.diff.audio.expected The expected audio tracks.
   * @param {Number} error.diff.audio.received The received audio tracks.
   * @param {Number} state The fallback state.
   *   [Rel: Skylink.MEDIA_ACCESS_FALLBACK_STATE]
   * @param {Boolean} isScreensharing The flag if event occurred during
   *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> and not
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
   * @param {Boolean} isAudioFallback The flag if event occurred during
   *   retrieval of audio tracks only when <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
   *   had failed to retrieve both audio and video tracks.
   * @param {String} streamId The Stream ID.
   *   <small>Defined only when <code>state</code> payload is <code>FALLBACKED</code>.</small>
   * @for Skylink
   * @since 0.6.3
   */
  mediaAccessFallback: [],

  /**
   * Event triggered when retrieval of Stream is successful.
   * @event mediaAccessSuccess
   * @param {MediaStream} stream The Stream object.
   *   <small>To attach it to an element: <code>attachMediaStream(videoElement, stream);</code>.</small>
   * @param {Boolean} isScreensharing The flag if event occurred during
   *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> and not
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
   * @param {Boolean} isAudioFallback The flag if event occurred during
   *   retrieval of audio tracks only when <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
   *   had failed to retrieve both audio and video tracks.
   * @param {String} streamId The Stream ID.
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessSuccess: [],

  /**
   * Event triggered when retrieval of Stream is required to complete <a href="#method_joinRoom">
   * <code>joinRoom()</code> method</a> request.
   * @event mediaAccessRequired
   * @for Skylink
   * @since 0.5.5
   */
  mediaAccessRequired: [],

  /**
   * Event triggered when Stream has stopped streaming.
   * @event mediaAccessStopped
   * @param {Boolean} isScreensharing The flag if event occurred during
   *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> and not
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
   * @param {Boolean} isAudioFallback The flag if event occurred during
   *   retrieval of audio tracks only when <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
   *   had failed to retrieve both audio and video tracks.
   * @param {String} streamId The Stream ID.
   * @for Skylink
   * @since 0.5.6
   */
  mediaAccessStopped: [],

  /**
   * Event triggered when a Peer joins the room.
   * @event peerJoined
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   * @param {JSON|String} peerInfo.userData The Peer current custom data.
   * @param {JSON} peerInfo.settings The Peer sending Stream settings.
   * @param {Boolean|JSON} peerInfo.settings.audio The Peer Stream audio settings.
   *   <small>When defined as <code>false</code>, it means there is no audio being sent from Peer.</small>
   *   <small>When defined as <code>true</code>, the <code>peerInfo.settings.audio.stereo</code> value is
   *   considered as <code>false</code> and the <code>peerInfo.settings.audio.exactConstraints</code>
   *   value is considered as <code>false</code>.</small>
   * @param {Boolean} peerInfo.settings.audio.stereo The flag if stereo band is configured
   *   when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for receiving audio data.
   * @param {Array} [peerInfo.settings.audio.optional] The Peer Stream <code>navigator.getUserMedia()</code> API
   *   <code>audio: { optional [..] }</code> property.
   * @param {String} [peerInfo.settings.audio.deviceId] The Peer Stream audio track source ID of the device used.
   * @param {Boolean} peerInfo.settings.audio.exactConstraints The flag if Peer Stream audio track is sending exact
   *   requested values of <code>peerInfo.settings.audio.deviceId</code> when provided.
   * @param {Boolean|JSON} peerInfo.settings.video The Peer Stream video settings.
   *   <small>When defined as <code>false</code>, it means there is no video being sent from Peer.</small>
   *   <small>When defined as <code>true</code>, the <code>peerInfo.settings.video.screenshare</code> value is
   *   considered as <code>false</code>  and the <code>peerInfo.settings.video.exactConstraints</code>
   *   value is considered as <code>false</code>.</small>
   * @param {JSON} peerInfo.settings.video.resolution The Peer Stream video resolution.
   *   [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number} peerInfo.settings.video.resolution.width The Peer Stream video resolution width.
   * @param {Number} peerInfo.settings.video.resolution.height The Peer Stream video resolution height.
   * @param {Number} [peerInfo.settings.video.frameRate] The Peer Stream video
   *   <a href="https://en.wikipedia.org/wiki/Frame_rate">frameRate</a> per second (fps).
   * @param {Boolean} peerInfo.settings.video.screenshare The flag if Peer Stream is a screensharing Stream.
   * @param {Array} [peerInfo.settings.video.optional] The Peer Stream <code>navigator.getUserMedia()</code> API
   *   <code>video: { optional [..] }</code> property.
   * @param {String} [peerInfo.settings.video.deviceId] The Peer Stream video track source ID of the device used.
   * @param {Boolean} peerInfo.settings.video.exactConstraints The flag if Peer Stream video track is sending exact
   *   requested values of <code>peerInfo.settings.video.resolution</code>,
   *   <code>peerInfo.settings.video.frameRate</code> and <code>peerInfo.settings.video.deviceId</code>
   *   when provided.
   * @param {JSON} peerInfo.settings.bandwidth The maximum streaming bandwidth sent from Peer.
   * @param {Number} [peerInfo.settings.bandwidth.audio] The maximum audio streaming bandwidth sent from Peer.
   * @param {Number} [peerInfo.settings.bandwidth.video] The maximum video streaming bandwidth sent from Peer.
   * @param {Number} [peerInfo.settings.bandwidth.data] The maximum data streaming bandwidth sent from Peer.
   * @param {JSON} peerInfo.mediaStatus The Peer Stream muted settings.
   * @param {Boolean} peerInfo.mediaStatus.audioMuted The flag if Peer Stream audio tracks is muted or not.
   *   <small>If Peer <code>peerInfo.settings.audio</code> is false, this will be defined as <code>true</code>.</small>
   * @param {Boolean} peerInfo.mediaStatus.videoMuted The flag if Peer Stream video tracks is muted or not.
   *   <small>If Peer <code>peerInfo.settings.video</code> is false, this will be defined as <code>true</code>.</small>
   * @param {JSON} peerInfo.agent The Peer agent information.
   * @param {String} peerInfo.agent.name The Peer agent name.
   *   <small>Data may be accessing browser or non-Web SDK name.</small>
   * @param {Number} peerInfo.agent.version The Peer agent version.
   *   <small>Data may be accessing browser or non-Web SDK version.</small>
   * @param {String} [peerInfo.agent.os] The Peer platform name.
   *  <small>Data may be accessing OS platform version from Web SDK.</small>
   * @param {String} [peerInfo.agent.pluginVersion] The Peer Temasys Plugin version.
   *  <small>Defined only when Peer is using the Temasys Plugin (IE / Safari).</small>
   * @param {String} peerInfo.room The Room Peer is from.
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.5.2
   */
  peerJoined: [],

  /**
   * Event triggered when a Peer connection has been refreshed.
   * @event peerRestart
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelfInitiateRestart The flag if User is initiating the Peer connection refresh.
   * @for Skylink
   * @since 0.5.5
   */
  peerRestart: [],

  /**
   * Event triggered when a Peer session information has been updated.
   * @event peerUpdated
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.5.2
   */
  peerUpdated: [],

  /**
   * Event triggered when a Peer leaves the room.
   * @event peerLeft
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.5.2
   */
  peerLeft: [],

  /**
   * Event triggered when Room session has ended abruptly due to network disconnections.
   * @event sessionDisconnect
   * @param {String} peerId The User's Room session Peer ID.
   * @param {JSON} peerInfo The User's Room session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @for Skylink
   * @since 0.6.10
   */
  sessionDisconnect: [],

  /**
   * Event triggered when receiving Peer Stream.
   * @event incomingStream
   * @param {String} peerId The Peer ID.
   * @param {MediaStream} stream The Stream object.
   *   <small>To attach it to an element: <code>attachMediaStream(videoElement, stream);</code>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @for Skylink
   * @since 0.5.5
   */
  incomingStream: [],

  /**
   * Event triggered when receiving message from Peer.
   * @event incomingMessage
   * @param {JSON} message The message result.
   * @param {JSON|String} message.content The message object.
   * @param {String} message.senderPeerId The sender Peer ID.
   * @param {String|Array} [message.targetPeerId=null] The value of the <code>targetPeerId</code>
   *   defined in <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a> or
   *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>.
   * @param {Boolean} message.isPrivate The flag if message is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a> or
   *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>.
   * @param {Boolean} message.isDataChannel The flag if message is sent from
   *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.5.2
   */
  incomingMessage: [],

  /**
   * Event triggered when receiving completed data transfer from Peer.
   * @event incomingData
   * @param {Blob|String} data The data.
   * @param {String} transferId The data transfer ID.
   * @param {String} peerId The Peer ID.
   * @param {JSON} transferInfo The data transfer information.
   *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
   *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.6.1
   */
  incomingData: [],


  /**
   * Event triggered when receiving upload data transfer from Peer.
   * @event incomingDataRequest
   * @param {String} transferId The transfer ID.
   * @param {String} peerId The Peer ID.
   * @param {String} transferInfo The data transfer information.
   *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
   *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.6.1
   */
  incomingDataRequest: [],

  /**
   * Event triggered when Room locked status has changed.
   * @event roomLock
   * @param {Boolean} isLocked The flag if Room is locked.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if User changed the Room locked status.
   * @for Skylink
   * @since 0.5.2
   */
  roomLock: [],

  /**
   * Event triggered when a Datachannel connection state has changed.
   * @event dataChannelState
   * @param {String} state The current Datachannel connection state.
   *   [Rel: Skylink.DATA_CHANNEL_STATE]
   * @param {String} peerId The Peer ID.
   * @param {Error} [error] The error object.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code>.</small>
   * @param {String} channelName The DataChannel ID.
   * @param {String} channelType The DataChannel type.
   *   [Rel: Skylink.DATA_CHANNEL_TYPE]
   * @for Skylink
   * @since 0.1.0
   */
  dataChannelState: [],

  /**
   * Event triggered when a data transfer state has changed.
   * @event dataTransferState
   * @param {String} state The current data transfer state.
   *   [Rel: Skylink.DATA_TRANSFER_STATE]
   * @param {String} transferId The data transfer ID.
   * @param {String} peerId The Peer ID.
   * @param {JSON} transferInfo The data transfer information.
   * @param {Blob|String} [transferInfo.data] The data object.
   *   <small>Defined only when <code>state</code> payload is <code>UPLOAD_STARTED</code> or
   *   <code>DOWNLOAD_COMPLETED</code>.</small>
   * @param {String} transferInfo.name The data transfer name.
   * @param {Number} transferInfo.size The data transfer data object original size.
   * @param {String} transferInfo.dataType The data transfer session type.
   *   [Rel: Skylink.DATA_TRANSFER_SESSION_TYPE]
   * @param {Number} transferInfo.timeout The flag if message is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> or
   *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>.
   * @param {Boolean} transferInfo.isPrivate The flag if data transfer
   * @param {JSON} [error] The error result.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code> or <code>CANCEL</code>.</small>
   * @param {Error|String} error.message The error object.
   * @param {String} error.transferType The data transfer direction from where the error occurred.
   *   [Rel: Skylink.DATA_TRANSFER_TYPE]
   * @for Skylink
   * @since 0.4.1
   */
  dataTransferState: [],

  /**
   * Event triggered when Signaling server reaction state has changed.
   * @event systemAction
   * @param {String} action The current Signaling server reaction state.
   *   [Rel: Skylink.SYSTEM_ACTION]
   * @param {String} message The message.
   * @param {String} reason The Signaling server reaction state reason of action code.
   *   [Rel: Skylink.SYSTEM_ACTION_REASON]
   * @for Skylink
   * @since 0.5.1
   */
  systemAction: [],

  /**
   * Event triggered when a server Peer joins the room.
   * @event serverPeerJoined
   * @param {String} peerId The Peer ID.
   * @param {String} serverPeerType The server Peer type
   *   [Rel: Skylink.SERVER_PEER_TYPE]
   * @for Skylink
   * @since 0.6.1
   */
  serverPeerJoined: [],

  /**
   * Event triggered when a server Peer leaves the room.
   * @event serverPeerLeft
   * @param {String} peerId The Peer ID.
   * @param {String} serverPeerType The server Peer type
   *   [Rel: Skylink.SERVER_PEER_TYPE]
   * @for Skylink
   * @since 0.6.1
   */
  serverPeerLeft: [],

  /**
   * Event triggered when a server Peer connection has been refreshed.
   * @event serverPeerRestart
   * @param {String} peerId The Peer ID.
   * @param {String} serverPeerType The server Peer type
   *   [Rel: Skylink.SERVER_PEER_TYPE]
   * @for Skylink
   * @since 0.6.1
   */
  serverPeerRestart: [],

  /**
   * Event triggered when Peer Stream streaming has stopped.
   * @event streamEnded
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @param {Boolean} isScreensharing The flag if Peer Stream is a screensharing Stream.
   * @param {String} streamId The Stream ID.
   * @for Skylink
   * @since 0.5.10
   */
  streamEnded: [],

  /**
   * Event triggered when Peer Stream audio or video tracks has been muted / unmuted.
   * @event streamMuted
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @param {Boolean} isScreensharing The flag if Peer Stream is a screensharing Stream.
   * @for Skylink
   * @since 0.6.1
   */
  streamMuted: [],

  /**
   * Event triggered when <a href="#method_getPeers"><code>getPeers()</code> method</a> retrieval state changes.
   * @event getPeersStateChange
   * @param {String} state The current <code>getPeers()</code> retrieval state.
   *   [Rel: Skylink.GET_PEERS_STATE]
   * @param {String} privilegedPeerId The User's privileged Peer ID.
   * @param {JSON} peerList The list of Peer IDs Rooms within the same App space.
   * @param {Array} peerList.#room The list of Peer IDs associated with the Room defined in <code>#room</code> property.
   * @for Skylink
   * @since 0.6.1
   */
  getPeersStateChange: [],

  /**
   * Event triggered when <a href="#method_introducePeer"><code>introducePeer()</code> method</a>
   * introduction request state changes.
   * @event introduceStateChange
   * @param {String} state The current <code>introducePeer()</code> introduction request state.
   *   [Rel: Skylink.INTRODUCE_STATE]
   * @param {String} privilegedPeerId The User's privileged Peer ID.
   * @param {String} sendingPeerId The Peer ID to be connected with <code>receivingPeerId</code>.
   * @param {String} receivingPeerId The Peer ID to be connected with <code>sendingPeerId</code>.
   * @param {String} [reason] The error object.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code>.</small>
   * @for Skylink
   * @since 0.6.1
   */
  introduceStateChange: [],

  /**
   * Event triggered when <a href="#method_getConnectionStatus"><code>getConnectionStatus()</code> method</a>
   * retrieval state changes.
   * @event getConnectionStatusStateChange
   * @param {Number} state The current <code>getConnectionStatus()</code> retrieval state.
   *   [Rel: Skylink.GET_CONNECTION_STATUS_STATE]
   * @param {String} peerId The Peer ID.
   * @param {JSON} [stats] The Peer connection current stats.
   *   <small>Defined only when <code>state</code> payload is <code>RETRIEVE_SUCCESS</code>.</small>
   * @param {JSON} stats.raw The Peer connection raw stats before parsing.
   * @param {JSON} stats.audio The Peer connection audio streaming stats.
   * @param {JSON} stats.audio.sending The Peer connection sending audio streaming stats.
   * @param {Number} stats.audio.sending.bytes The Peer connection sending audio streaming bytes.
   * @param {Number} stats.audio.sending.packets The Peer connection sending audio streaming packets.
   * @param {Number} stats.audio.sending.packetsLost The Peer connection sending audio streaming packets lost.
   * @param {Number} stats.audio.sending.ssrc The Peer connection sending audio streaming RTP packets SSRC.
   * @param {Number} stats.audio.sending.rtt The Peer connection sending audio streaming RTT (Round-trip delay time).
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {JSON} stats.audio.receiving The Peer connection receiving audio streaming stats.
   * @param {Number} stats.audio.receiving.bytes The Peer connection sending audio streaming bytes.
   * @param {Number} stats.audio.receiving.packets The Peer connection receiving audio streaming packets.
   * @param {Number} stats.audio.receiving.packetsLost The Peer connection receiving audio streaming packets lost.
   * @param {Number} stats.audio.receiving.ssrc The Peer connection receiving audio streaming RTP packets SSRC.
   * @param {JSON} stats.video The Peer connection video streaming stats.
   * @param {JSON} stats.video.sending The Peer connection sending video streaming stats.
   * @param {Number} stats.video.sending.bytes The Peer connection sending video streaming bytes.
   * @param {Number} stats.video.sending.packets The Peer connection sending video streaming packets.
   * @param {Number} stats.video.sending.packetsLost The Peer connection sending video streaming packets lost.
   * @param {JSON} stats.video.sending.ssrc The Peer connection sending video streaming RTP packets SSRC.
   * @param {Number} stats.video.sending.rtt The Peer connection sending video streaming RTT (Round-trip delay time).
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {JSON} stats.video.receiving The Peer connection receiving video streaming stats.
   * @param {Number} stats.video.receiving.bytes The Peer connection receiving video streaming bytes.
   * @param {Number} stats.video.receiving.packets The Peer connection receiving video streaming packets.
   * @param {Number} stats.video.receiving.packetsLost The Peer connection receiving video streaming packets lost.
   * @param {Number} stats.video.receiving.ssrc The Peer connection receiving video streaming RTP packets SSRC.
   * @param {JSON} stats.selectedCandidate The Peer connection selected ICE candidate pair stats.
   * @param {JSON} stats.selectedCandidate.local The Peer connection selected local ICE candidate.
   * @param {String} stats.selectedCandidate.local.ipAddress The Peer connection selected
   *   local ICE candidate IP address.
   * @param {Number} stats.selectedCandidate.local.portNumber The Peer connection selected
   *   local ICE candidate port number.
   * @param {String} stats.selectedCandidate.local.transport The Peer connection selected
   *   local ICE candidate IP transport type.
   * @param {String} stats.selectedCandidate.local.candidateType The Peer connection selected
   *   local ICE candidate type.
   * @param {JSON} stats.selectedCandidate.remote The Peer connection selected remote ICE candidate.
   * @param {String} stats.selectedCandidate.remote.ipAddress The Peer connection selected
   *   remote ICE candidate IP address.
   * @param {Number} stats.selectedCandidate.remote.portNumber The Peer connection selected
   *   remote ICE candidate port number.
   * @param {String} stats.selectedCandidate.remote.transport The Peer connection selected
   *   remote ICE candidate IP transport type.
   * @param {String} stats.selectedCandidate.remote.candidateType The Peer connection selected
   *   remote ICE candidate type.
   * @param {JSON} stats.connection The Peer connection object stats.
   * @param {String} stats.connection.iceConnectionState The Peer connection ICE connection state.
   * @param {String} stats.connection.iceGatheringState The Peer connection ICE gathering state.
   * @param {String} stats.connection.signalingState The Peer connection signaling state.
   * @param {JSON} stats.connection.localDescription The Peer connection local session description.
   * @param {String} stats.connection.localDescription.type The Peer connection local session description type.
   * @param {String} stats.connection.localDescription.sdp The Peer connection local session description SDP.
   * @param {JSON} stats.connection.remoteDescription The Peer connection remote session description.
   * @param {String} stats.connection.remoteDescription.type The Peer connection remote session description type.
   * @param {String} stats.connection.remoteDescription.sdp The Peer connection remote session description sdp.
   * @param {JSON} stats.connection.candidates The Peer connection list of ICE candidates sent or received.
   * @param {JSON} stats.connection.candidates.sending The Peer connection list of local ICE candidates sent.
   * @param {Array} stats.connection.candidates.sending.host The Peer connection list of local
   *   <code>"host"</code> ICE candidates sent.
   * @param {Array} stats.connection.candidates.sending.srflx The Peer connection list of local
   *   <code>"srflx"</code> ICE candidates sent.
   * @param {Array} stats.connection.candidates.sending.relay The Peer connection list of local
   *   <code>"relay"</code> candidates sent.
   * @param {JSON} stats.connection.candidates.receiving The Peer connection list of remote ICE candidates received.
   * @param {Array} stats.connection.candidates.receiving.host The Peer connection list of remote
   *   <code>"host"</code> ICE candidates received.
   * @param {Array} stats.connection.candidates.receiving.srflx The Peer connection list of remote
   *   <code>"srflx"</code> ICE candidates received.
   * @param {Array} stats.connection.candidates.receiving.relay The Peer connection list of remote
   *   <code>"relay"</code> ICE candidates received.
   * @param {Error} error The error object received.
   *   <small>Defined only when <code>state</code> payload is <code>RETRIEVE_ERROR</code>.</small>
   * @for Skylink
   * @since 0.6.14
   */
  getConnectionStatusStateChange: [],

  /**
   * Event triggered when <a href="#method_muteStream"><code>muteStream()</code> method</a> changes
   * User Streams audio and video tracks muted status.
   * @event localMediaMuted
   * @param {JSON} mediaStatus The Streams muted settings.
   *   <small>This indicates the muted settings for both
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
   *   <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.</small>
   * @param {Boolean} mediaStatus.audioMuted The flag if all Streams audio tracks is muted or not.
   *   <small>If User's <code>peerInfo.settings.audio</code> is false, this will be defined as <code>true</code>.</small>
   * @param {Boolean} mediaStatus.videoMuted The flag if all Streams video tracks is muted or not.
   *   <small>If User's <code>peerInfo.settings.video</code> is false, this will be defined as <code>true</code>.</small>
   * @for Skylink
   * @since 0.6.15
   */
  localMediaMuted: []
};

/**
 * Stores the list of <code>once()</code> event handlers.
 * These events are only triggered once.
 * @attribute _onceEvents
 * @param {Array} <#event> The list of event handlers associated with the event.
 * @param {Array} <#event>.<#index> The array of event handler function and its condition function.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._onceEvents = {};

/**
 * Stores the timestamps data used for throttling.
 * @attribute _timestamp
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._timestamp = {
  now: Date.now() || function() { return +new Date(); },
  screen: false
};

/**
 * Function that subscribes a listener to an event.
 * @method on
 * @param {String} eventName The event.
 * @param {Function} callback The listener.
 *   <small>This will be invoked when event is triggered.</small>
 * @example
 *   // Example 1: Subscribing to "peerJoined" event
 *   skylinkDemo.on("peerJoined", function (peerId, peerInfo, isSelf) {
 *     console.info("peerJoined event has been triggered with:", peerId, peerInfo, isSelf);
 *   });
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
 * Function that subscribes a listener to an event once.
 * @method once
 * @param {String} eventName The event.
 * @param {Function} callback The listener.
 *   <small>This will be invoked once when event is triggered and conditional function is satisfied.</small>
 * @param {Function} [condition] The conditional function that will be invoked when event is triggered.
 *   <small>Return <code>true</code> when invoked to satisfy condition.</small>
 *   <small>When not provided, the conditional function will always return <code>true</code>.</small>
 * @param {Boolean} [fireAlways=false] The flag that indicates if <code>once()</code> should act like
 *   <code>on()</code> but only invoke listener only when conditional function is satisfied.
 * @example
 *   // Example 1: Subscribing to "peerJoined" event that triggers without condition
 *   skylinkDemo.once("peerJoined", function (peerId, peerInfo, isSelf) {
 *     console.info("peerJoined event has been triggered once with:", peerId, peerInfo, isSelf);
 *   });
 *
 *   // Example 2: Subscribing to "incomingStream" event that triggers with condition
 *   skylinkDemo.once("incomingStream", function (peerId, stream, isSelf, peerInfo) {
 *     console.info("incomingStream event has been triggered with User stream:", stream);
 *   }, function (peerId, peerInfo, isSelf) {
 *     return isSelf;
 *   });
 *
 *   // Example 3: Subscribing to "dataTransferState" event that triggers always only when condition is satisfied
 *   skylinkDemo.once("dataTransferState", function (state, transferId, peerId, transferInfo) {
 *     console.info("Received data transfer from Peer:", transferInfo.data);
 *   }, function (state, transferId, peerId) {
 *     if (state === skylinkDemo.DATA_TRANSFER_STATE.UPLOAD_REQUEST) {
 *       skylinkDemo.acceptDataTransfer(peerId, transferId);
 *     }
 *     return state === skylinkDemo.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED;
 *   }, true);
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
 * Function that unsubscribes listeners from an event.
 * @method off
 * @param {String} eventName The event.
 * @param {Function} [callback] The listener to unsubscribe.
 * - When not provided, all listeners associated to the event will be unsubscribed.
 * @example
 *   // Example 1: Unsubscribe all "peerJoined" event
 *   skylinkDemo.off("peerJoined");
 *
 *   // Example 2: Unsubscribe only one listener from "peerJoined event"
 *   var pJListener = function (peerId, peerInfo, isSelf) {
 *     console.info("peerJoined event has been triggered with:", peerId, peerInfo, isSelf);
 *   };
 *
 *   skylinkDemo.off("peerJoined", pJListener);
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
 * Function that triggers an event.
 * The rest of the parameters after the <code>eventName</code> parameter is considered as the event parameter payloads.
 * @method _trigger
 * @private
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
 * Function that checks if the current state condition is met before subscribing
 *   event handler to wait for condition to be fulfilled.
 * @method _condition
 * @private
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
 * Function that starts an interval check to wait for a condition to be resolved.
 * @method _wait
 * @private
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
 * Function that throttles a method function to prevent multiple invokes over a specified amount of time.
 * Returns a function to be invoked <code>._throttle(fn, 1000)()</code> to make throttling functionality work.
 * @method _throttle
 * @private
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
Skylink.prototype.SOCKET_ERROR = {
  CONNECTION_FAILED: 0,
  RECONNECTION_FAILED: -1,
  CONNECTION_ABORTED: -2,
  RECONNECTION_ABORTED: -3,
  RECONNECTION_ATTEMPT: -4
};

/**
 * The list of <a href="#method_joinRoom"><code>joinRoom()</code> method</a> socket connection reconnection states.
 * @attribute SOCKET_FALLBACK
 * @param {String} NON_FALLBACK      <small>Value <code>"nonfallback"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is at its initial state
 *   without transitioning to any new socket port or transports yet.
 * @param {String} FALLBACK_PORT     <small>Value <code>"fallbackPortNonSSL"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is reconnecting with
 *   another new HTTP port using WebSocket transports to attempt to establish connection with Signaling server.
 * @param {String} FALLBACK_PORT_SSL <small>Value <code>"fallbackPortSSL"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is reconnecting with
 *   another new HTTPS port using WebSocket transports to attempt to establish connection with Signaling server.
 * @param {String} LONG_POLLING      <small>Value <code>"fallbackLongPollingNonSSL"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is reconnecting with
 *   another new HTTP port using Polling transports to attempt to establish connection with Signaling server.
 * @param {String} LONG_POLLING      <small>Value <code>"fallbackLongPollingSSL"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is reconnecting with
 *   another new HTTPS port using Polling transports to attempt to establish connection with Signaling server.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.SOCKET_FALLBACK = {
  NON_FALLBACK: 'nonfallback',
  FALLBACK_PORT: 'fallbackPortNonSSL',
  FALLBACK_SSL_PORT: 'fallbackPortSSL',
  LONG_POLLING: 'fallbackLongPollingNonSSL',
  LONG_POLLING_SSL: 'fallbackLongPollingSSL'
};

/**
 * Stores the current socket connection information.
 * @attribute _socketSession
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.13
 */
Skylink.prototype._socketSession = {};

/**
 * Stores the queued socket messages.
 * This is to prevent too many sent over less than a second interval that might cause dropped messages
 *   or jams to the Signaling connection.
 * @attribute _socketMessageQueue
 * @type Array
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._socketMessageQueue = [];

/**
 * Stores the <code>setTimeout</code> to sent queued socket messages.
 * @attribute _socketMessageTimeout
 * @type Object
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._socketMessageTimeout = null;

/**
 * Stores the list of socket ports to use to connect to the Signaling.
 * These ports are defined by default which is commonly used currently by the Signaling.
 * Should re-evaluate this sometime.
 * @attribute _socketPorts
 * @param {Array} http: The list of HTTP socket ports.
 * @param {Array} https: The list of HTTPS socket ports.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._socketPorts = {
  'http:': [80, 3000],
  'https:': [443, 3443]
};

/**
 * Stores the flag that indicates if socket connection to the Signaling has opened.
 * @attribute _channelOpen
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._channelOpen = false;

/**
 * Stores the Signaling server url.
 * @attribute _signalingServer
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._signalingServer = null;

/**
 * Stores the Signaling server protocol.
 * @attribute _signalingServerProtocol
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._signalingServerProtocol = window.location.protocol;

/**
 * Stores the Signaling server port.
 * @attribute _signalingServerPort
 * @type Number
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._signalingServerPort = null;

/**
 * Stores the Signaling socket connection object.
 * @attribute _socket
 * @type io
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._socket = null;

/**
 * Stores the socket connection timeout when establishing connection to the Signaling.
 * @attribute _socketTimeout
 * @type Number
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._socketTimeout = 0;

/**
 * Stores the flag that indicates if XDomainRequest is used for IE 8/9.
 * @attribute _socketUseXDR
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._socketUseXDR = false;

/**
 * Function that sends a socket message over the socket connection to the Signaling.
 * @method _sendChannelMessage
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._sendChannelMessage = function(message) {
  var self = this;
  var interval = 1000;
  var throughput = 16;

  if (!self._channelOpen) {
    return;
  }

  var messageString = JSON.stringify(message);

  var sendLater = function(){
    if (self._socketMessageQueue.length > 0){

      if (self._socketMessageQueue.length<throughput){

        log.debug([(message.target ? message.target : 'server'), null, null,
          'Sending delayed message' + ((!message.target) ? 's' : '') + ' ->'], {
            type: self._SIG_MESSAGE_TYPE.GROUP,
            lists: self._socketMessageQueue.slice(0,self._socketMessageQueue.length),
            mid: self._user.sid,
            rid: self._room.id
          });

        // fix for self._socket undefined errors in firefox
        if (self._socket) {
          self._socket.send({
            type: self._SIG_MESSAGE_TYPE.GROUP,
            lists: self._socketMessageQueue.splice(0,self._socketMessageQueue.length),
            mid: self._user.sid,
            rid: self._room.id
          });
        } else {
          log.error([(message.target ? message.target : 'server'), null, null,
            'Dropping delayed message' + ((!message.target) ? 's' : '') +
            ' as socket object is no longer defined ->'], {
            type: self._SIG_MESSAGE_TYPE.GROUP,
            lists: self._socketMessageQueue.slice(0,self._socketMessageQueue.length),
            mid: self._user.sid,
            rid: self._room.id
          });
        }

        clearTimeout(self._socketMessageTimeout);
        self._socketMessageTimeout = null;

      }
      else{

        log.debug([(message.target ? message.target : 'server'), null, null,
          'Sending delayed message' + ((!message.target) ? 's' : '') + ' ->'], {
            type: self._SIG_MESSAGE_TYPE.GROUP,
            lists: self._socketMessageQueue.slice(0,throughput),
            mid: self._user.sid,
            rid: self._room.id
          });

        // fix for self._socket undefined errors in firefox
        if (self._socket) {
          self._socket.send({
            type: self._SIG_MESSAGE_TYPE.GROUP,
            lists: self._socketMessageQueue.splice(0,throughput),
            mid: self._user.sid,
            rid: self._room.id
          });
        } else {
          log.error([(message.target ? message.target : 'server'), null, null,
            'Dropping delayed message' + ((!message.target) ? 's' : '') +
            ' as socket object is no longer defined ->'], {
            type: self._SIG_MESSAGE_TYPE.GROUP,
            lists: self._socketMessageQueue.slice(0,throughput),
            mid: self._user.sid,
            rid: self._room.id
          });
        }

        clearTimeout(self._socketMessageTimeout);
        self._socketMessageTimeout = null;
        self._socketMessageTimeout = setTimeout(sendLater,interval);

      }
      self._timestamp.now = Date.now() || function() { return +new Date(); };
    }
  };

  //Delay when messages are sent too rapidly
  if ((Date.now() || function() { return +new Date(); }) - self._timestamp.now < interval &&
    self._groupMessageList.indexOf(message.type) > -1) {

      log.warn([(message.target ? message.target : 'server'), null, null,
      'Messages fired too rapidly. Delaying.'], {
        interval: 1000,
        throughput: 16,
        message: message
      });

      self._socketMessageQueue.push(messageString);

      if (!self._socketMessageTimeout){
        self._socketMessageTimeout = setTimeout(sendLater,
          interval - ((Date.now() || function() { return +new Date(); })-self._timestamp.now));
      }
      return;
  }

  log.debug([(message.target ? message.target : 'server'), null, null,
    'Sending to peer' + ((!message.target) ? 's' : '') + ' ->'], message);

  //Normal case when messages are sent not so rapidly
  self._socket.send(messageString);
  self._timestamp.now = Date.now() || function() { return +new Date(); };

};

/**
 * Function that creates and opens a socket connection to the Signaling.
 * @method _createSocket
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._createSocket = function (type) {
  var self = this;

  var options = {
    forceNew: true,
    //'sync disconnect on unload' : true,
    reconnection: false
  };

  var ports = self._socketPorts[self._signalingServerProtocol];

  var connectionType = null;

  // just beginning
  if (self._signalingServerPort === null) {
    self._signalingServerPort = ports[0];
    connectionType = self.SOCKET_FALLBACK.NON_FALLBACK;

  // reached the end of the last port for the protocol type
  } else if ( ports.indexOf(self._signalingServerPort) === ports.length - 1 ) {

    // re-refresh to long-polling port
    if (type === 'WebSocket') {
      type = 'Polling';
      self._signalingServerPort = ports[0];

    } else if (type === 'Polling') {
      options.reconnection = true;
      options.reconnectionAttempts = 4;
      options.reconectionDelayMax = 1000;
    }

  // move to the next port
  } else {
    self._signalingServerPort = ports[ ports.indexOf(self._signalingServerPort) + 1 ];
  }

  var url = self._signalingServerProtocol + '//' + self._signalingServer + ':' + self._signalingServerPort;
    //'http://ec2-52-8-93-170.us-west-1.compute.amazonaws.com:6001';

  if (type === 'WebSocket') {
    options.transports = ['websocket'];
  } else if (type === 'Polling') {
    options.transports = ['xhr-polling', 'jsonp-polling', 'polling'];
  }

  // if socket instance already exists, exit
  if (self._socket) {
    self._socket.removeAllListeners('connect_error');
    self._socket.removeAllListeners('reconnect_attempt');
    self._socket.removeAllListeners('reconnect_error');
    self._socket.removeAllListeners('reconnect_failed');
    self._socket.removeAllListeners('connect');
    self._socket.removeAllListeners('reconnect');
    self._socket.removeAllListeners('error');
    self._socket.removeAllListeners('disconnect');
    self._socket.removeAllListeners('message');
    self._socket.disconnect();
    self._socket = null;
  }

  self._channelOpen = false;

  log.log('Opening channel with signaling server url:', {
    url: url,
    useXDR: self._socketUseXDR,
    options: options
  });

  self._socketSession = {
    type: type,
    options: options,
    url: url
  };

  self._socket = io.connect(url, options);

  if (connectionType === null) {
    connectionType = self._signalingServerProtocol === 'http:' ?
      (type === 'Polling' ? self.SOCKET_FALLBACK.LONG_POLLING :
        self.SOCKET_FALLBACK.FALLBACK_PORT) :
      (type === 'Polling' ? self.SOCKET_FALLBACK.LONG_POLLING_SSL :
        self.SOCKET_FALLBACK.FALLBACK_SSL_PORT);
  }

  self._socket.on('connect_error', function (error) {
    self._channelOpen = false;

    self._trigger('socketError', self.SOCKET_ERROR.CONNECTION_FAILED,
      error, connectionType);

    self._trigger('channelRetry', connectionType, 1);

    if (options.reconnection === false) {
      self._createSocket(type);
    }
  });

  self._socket.on('reconnect_attempt', function (attempt) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ATTEMPT,
      attempt, connectionType);

    self._trigger('channelRetry', connectionType, attempt);
  });

  self._socket.on('reconnect_error', function (error) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_FAILED,
      error, connectionType);
  });

  self._socket.on('reconnect_failed', function (error) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED,
      error, connectionType);
  });

  self._socket.on('connect', function () {
    if (!self._channelOpen) {
      self._channelOpen = true;
      self._trigger('channelOpen');
      log.log([null, 'Socket', null, 'Channel opened']);
    }
  });

  self._socket.on('reconnect', function () {
    if (!self._channelOpen) {
      self._channelOpen = true;
      self._trigger('channelOpen');
      log.log([null, 'Socket', null, 'Channel opened']);
    }
  });

  self._socket.on('error', function(error) {
    self._channelOpen = false;
    self._trigger('channelError', error);
    log.error([null, 'Socket', null, 'Exception occurred:'], error);
  });

  self._socket.on('disconnect', function() {
    self._channelOpen = false;
    self._trigger('channelClose');
    log.log([null, 'Socket', null, 'Channel closed']);

    if (self._inRoom) {
      self.leaveRoom(false);
      self._trigger('sessionDisconnect', self._user.sid, self.getPeerInfo());
    }
  });

  self._socket.on('message', function(message) {
    log.log([null, 'Socket', null, 'Received message']);
    self._processSigMessage(message);
  });
};

/**
 * Function that starts the socket connection to the Signaling.
 * This starts creating the socket connection and called at first not when requiring to fallback.
 * @method _openChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._openChannel = function() {
  var self = this;
  if (self._channelOpen) {
    log.error([null, 'Socket', null, 'Unable to instantiate a new channel connection ' +
      'as there is already an ongoing channel connection']);
    return;
  }

  if (self._readyState !== self.READY_STATE_CHANGE.COMPLETED) {
    log.error([null, 'Socket', null, 'Unable to instantiate a new channel connection ' +
      'as readyState is not ready']);
    return;
  }

  // set if forceSSL
  if (self._forceSSL) {
    self._signalingServerProtocol = 'https:';
  } else {
    self._signalingServerProtocol = window.location.protocol;
  }

  var socketType = 'WebSocket';

  // For IE < 9 that doesn't support WebSocket
  if (!window.WebSocket) {
    socketType = 'Polling';
  }

  self._signalingServerPort = null;

  // Begin with a websocket connection
  self._createSocket(socketType);
};

/**
 * Function that stops the socket connection to the Signaling.
 * @method _closeChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._closeChannel = function() {
  if (!this._channelOpen) {
    return;
  }
  if (this._socket) {
    this._socket.removeAllListeners('connect_error');
    this._socket.removeAllListeners('reconnect_attempt');
    this._socket.removeAllListeners('reconnect_error');
    this._socket.removeAllListeners('reconnect_failed');
    this._socket.removeAllListeners('connect');
    this._socket.removeAllListeners('reconnect');
    this._socket.removeAllListeners('error');
    this._socket.removeAllListeners('disconnect');
    this._socket.removeAllListeners('message');
    this._socket.disconnect();
    this._socket = null;
  }
  this._channelOpen = false;
  this._trigger('channelClose');
};
Skylink.prototype.SM_PROTOCOL_VERSION = '0.1.1';

/**
 * Stores the list of socket messaging protocol types.
 * See confluence docs for the list based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @attribute _SIG_MESSAGE_TYPE
 * @type JSON
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._SIG_MESSAGE_TYPE = {
  JOIN_ROOM: 'joinRoom',
  IN_ROOM: 'inRoom',
  ENTER: 'enter',
  WELCOME: 'welcome',
  RESTART: 'restart',
  OFFER: 'offer',
  ANSWER: 'answer',
  CANDIDATE: 'candidate',
  BYE: 'bye',
  REDIRECT: 'redirect',
  UPDATE_USER: 'updateUserEvent',
  ROOM_LOCK: 'roomLockEvent',
  MUTE_VIDEO: 'muteVideoEvent',
  MUTE_AUDIO: 'muteAudioEvent',
  PUBLIC_MESSAGE: 'public',
  PRIVATE_MESSAGE: 'private',
  STREAM: 'stream',
  GROUP: 'group',
  GET_PEERS: 'getPeers',
  PEER_LIST: 'peerList',
  INTRODUCE: 'introduce',
  INTRODUCE_ERROR: 'introduceError',
  APPROACH: 'approach'
};

/**
 * Stores the flag if MCU environment is enabled.
 * @attribute _hasMCU
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._hasMCU = false;

/**
 * Stores the list of socket messaging protocol types to queue when sent less than a second interval.
 * @attribute _groupMessageList
 * @type Array
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._groupMessageList = [
  Skylink.prototype._SIG_MESSAGE_TYPE.STREAM,
  Skylink.prototype._SIG_MESSAGE_TYPE.UPDATE_USER,
  Skylink.prototype._SIG_MESSAGE_TYPE.ROOM_LOCK,
  Skylink.prototype._SIG_MESSAGE_TYPE.MUTE_AUDIO,
  Skylink.prototype._SIG_MESSAGE_TYPE.MUTE_VIDEO,
  Skylink.prototype._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
];

/**
 * Stores the flag that indicates if MCU is available in the Room.
 * If App Key enables MCU but this is false, this means likely there are problems connecting to the MCU server.
 * @attribute _hasMCU
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._hasMCU = false;


/**
 * Stores the flag that indicates if User should only receive Stream from Peer connections but
 *   do not send User's Stream to Peer connections.
 * @attribute _receiveOnly
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._receiveOnly = false;

/**
 * Stores the list of Peer messages timestamp.
 * @attribute _peerMessagesStamps
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._peerMessagesStamps = {};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that sends a message to Peers via the Signaling socket connection.
 * @method sendMessage
 * @param {String|JSON} message The message.
 * @param {String|Array} [targetPeerId] The target Peer ID to send message to.
 * - When provided as an Array, it will send the message to only Peers which IDs are in the list.
 * - When not provided, it will broadcast the message to all connected Peers in the Room.
 * @example
 *   // Example 1: Broadcasting to all Peers
 *   skylinkDemo.sendMessage("Hi all!");
 *
 *   // Example 2: Sending to specific Peers
 *   var peersInExclusiveParty = [];
 *
 *   skylinkDemo.on("peerJoined", function (peerId, peerInfo, isSelf) {
 *     if (isSelf) return;
 *     if (peerInfo.userData.exclusive) {
 *       peersInExclusiveParty.push(peerId);
 *     }
 *   });
 *
 *   function updateExclusivePartyStatus (message) {
 *     skylinkDemo.sendMessage(message, peersInExclusiveParty);
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Sends socket connection message to all targeted Peers via Signaling server. <ol>
 *   <li><a href="#event_incomingMessage"><code>incomingMessage</code> event</a> triggers parameter payload
 *   <code>message.isDataChannel</code> value as <code>false</code>.</li></ol></li></ol>
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.sendMessage = function(message, targetPeerId) {
  var params = {
    cid: this._key,
    data: message,
    mid: this._user.sid,
    rid: this._room.id,
    type: this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
  };

  var listOfPeers = Object.keys(this._peerConnections);
  var isPrivate = false;
  var i;

  if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;

  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (!isPrivate) {
    log.log([null, 'Socket', null, 'Broadcasting message to peers']);

    this._sendChannelMessage({
      cid: this._key,
      data: message,
      mid: this._user.sid,
      rid: this._room.id,
      type: this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
    });
  }

  for (i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    // Ignore MCU peer
    if (peerId === 'MCU') {
      continue;
    }

    if (isPrivate) {
      log.log([peerId, 'Socket', null, 'Sending message to peer']);

      this._sendChannelMessage({
        cid: this._key,
        data: message,
        mid: this._user.sid,
        rid: this._room.id,
        target: peerId,
        type: this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE
      });
    }
  }

  this._trigger('incomingMessage', {
    content: message,
    isPrivate: isPrivate,
    targetPeerId: targetPeerId,
    isDataChannel: false,
    senderPeerId: this._user.sid
  }, this._user.sid, this.getPeerInfo(), true);
};

/**
 * Function that process and parses the socket message string received from the Signaling.
 * @method _processSigMessage
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSigMessage = function(messageString) {
  var message = JSON.parse(messageString);
  if (message.type === this._SIG_MESSAGE_TYPE.GROUP) {
    log.debug('Bundle of ' + message.lists.length + ' messages');
    for (var i = 0; i < message.lists.length; i++) {
      this._processSingleMessage(JSON.parse(message.lists[i]));
    }
  } else {
    this._processSingleMessage(message);
  }
};

/**
 * Function that handles and processes the socket message received.
 * @method _processingSingleMessage
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSingleMessage = function(message) {
  this._trigger('channelMessage', message);
  var origin = message.mid;
  if (!origin || origin === this._user.sid) {
    origin = 'Server';
  }
  log.debug([origin, null, null, 'Received from peer ->'], message.type);
  if (message.mid === this._user.sid &&
    message.type !== this._SIG_MESSAGE_TYPE.REDIRECT &&
    message.type !== this._SIG_MESSAGE_TYPE.IN_ROOM) {
    log.debug([origin, null, null, 'Ignoring message ->'], message.type);
    return;
  }
  switch (message.type) {
  //--- BASIC API Messages ----
  case this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE:
    this._publicMessageHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE:
    this._privateMessageHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.IN_ROOM:
    this._inRoomHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ENTER:
    this._enterHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.WELCOME:
    this._welcomeHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.RESTART:
    this._restartHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.OFFER:
    this._offerHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ANSWER:
    this._answerHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.CANDIDATE:
    this._candidateHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.BYE:
    this._byeHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.REDIRECT:
    this._redirectHandler(message);
    break;
    //--- ADVANCED API Messages ----
  case this._SIG_MESSAGE_TYPE.UPDATE_USER:
    this._updateUserEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.MUTE_VIDEO:
    this._muteVideoEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.MUTE_AUDIO:
    this._muteAudioEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.STREAM:
    this._streamEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ROOM_LOCK:
    this._roomLockEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.PEER_LIST:
    this._peerListEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.INTRODUCE_ERROR:
    this._introduceErrorEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.APPROACH:
    this._approachEventHandler(message);
    break;
  default:
    log.error([message.mid, null, null, 'Unsupported message ->'], message.type);
    break;
  }
};

/**
 * Function that handles the "peerList" socket message received.
 * See confluence docs for the "peerList" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _peerListEventHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._peerListEventHandler = function(message){
  var self = this;
  self._peerList = message.result;
  log.log(['Server', null, message.type, 'Received list of peers'], self._peerList);
  self._trigger('getPeersStateChange',self.GET_PEERS_STATE.RECEIVED, self._user.sid, self._peerList);
};

/**
 * Function that handles the "introduceError" socket message received.
 * See confluence docs for the "introduceError" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _introduceErrorEventHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._introduceErrorEventHandler = function(message){
  var self = this;
  log.log(['Server', null, message.type, 'Introduce failed. Reason: '+message.reason]);
  self._trigger('introduceStateChange',self.INTRODUCE_STATE.ERROR, self._user.sid,
    message.sendingPeerId, message.receivingPeerId, message.reason);
};

/**
 * Function that handles the "approach" socket message received.
 * See confluence docs for the "approach" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _approachEventHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._approachEventHandler = function(message){
  var self = this;
  log.log(['Server', null, message.type, 'Approaching peer'], message.target);
  // self._room.connection.peerConfig = self._setIceServers(message.pc_config);
  // self._inRoom = true;
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);
  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    receiveOnly: self._receiveOnly,
    sessionType: !!self._streams.screenshare ? 'screensharing' : 'stream',
    target: message.target,
    weight: self._peerPriorityWeight,
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null
  });
};

/**
 * Function that handles the "redirect" socket message received.
 * See confluence docs for the "redirect" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _redirectHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._redirectHandler = function(message) {
  log.log(['Server', null, message.type, 'System action warning:'], {
    message: message.info,
    reason: message.reason,
    action: message.action
  });

  if (message.action === this.SYSTEM_ACTION.REJECT) {
  	for (var key in this._peerConnections) {
  		if (this._peerConnections.hasOwnProperty(key)) {
  			this._removePeer(key);
  		}
  	}
  }

  // Handle the differences provided in Signaling server
  if (message.reason === 'toClose') {
    message.reason = 'toclose';
  }

  this._trigger('systemAction', message.action, message.info, message.reason);
};

/**
 * Function that handles the "updateUserEvent" socket message received.
 * See confluence docs for the "updateUserEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _updateUserEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._updateUserEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer updated userData:'], message.userData);
  if (this._peerInformations[targetMid]) {
    if (this._peerMessagesStamps[targetMid] && typeof message.stamp === 'number') {
      if (message.stamp < this._peerMessagesStamps[targetMid].userData) {
        log.warn([targetMid, null, message.type, 'Dropping outdated status ->'], message);
        return;
      }
      this._peerMessagesStamps[targetMid].userData = message.stamp;
    }
    this._peerInformations[targetMid].userData = message.userData || {};
    this._trigger('peerUpdated', targetMid,
      this.getPeerInfo(targetMid), false);
  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "roomLockEvent" socket message received.
 * See confluence docs for the "roomLockEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _roomLockEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._roomLockEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, message.type, 'Room lock status:'], message.lock);
  this._trigger('roomLock', message.lock, targetMid,
    this.getPeerInfo(targetMid), false);
};

/**
 * Function that handles the "muteAudioEvent" socket message received.
 * See confluence docs for the "muteAudioEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _muteAudioEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._muteAudioEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s audio muted:'], message.muted);
  if (this._peerInformations[targetMid]) {
    if (this._peerMessagesStamps[targetMid] && typeof message.stamp === 'number') {
      if (message.stamp < this._peerMessagesStamps[targetMid].audioMuted) {
        log.warn([targetMid, null, message.type, 'Dropping outdated status ->'], message);
        return;
      }
      this._peerMessagesStamps[targetMid].audioMuted = message.stamp;
    }
    this._peerInformations[targetMid].mediaStatus.audioMuted = message.muted;
    this._trigger('streamMuted', targetMid, this.getPeerInfo(targetMid), false,
      this._peerInformations[targetMid].settings.video &&
      this._peerInformations[targetMid].settings.video.screenshare);
    this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);
  } else {
    log.log([targetMid, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "muteVideoEvent" socket message received.
 * See confluence docs for the "muteVideoEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _muteVideoEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._muteVideoEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s video muted:'], message.muted);
  if (this._peerInformations[targetMid]) {
    if (this._peerMessagesStamps[targetMid] && typeof message.stamp === 'number') {
      if (message.stamp < this._peerMessagesStamps[targetMid].videoMuted) {
        log.warn([targetMid, null, message.type, 'Dropping outdated status ->'], message);
        return;
      }
      this._peerMessagesStamps[targetMid].videoMuted = message.stamp;
    }
    this._peerInformations[targetMid].mediaStatus.videoMuted = message.muted;
    this._trigger('streamMuted', targetMid, this.getPeerInfo(targetMid), false,
      this._peerInformations[targetMid].settings.video &&
      this._peerInformations[targetMid].settings.video.screenshare);
    this._trigger('peerUpdated', targetMid,
      this.getPeerInfo(targetMid), false);
  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "stream" socket message received.
 * See confluence docs for the "stream" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _streamEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._streamEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s stream status:'], message.status);

  if (this._peerInformations[targetMid]) {

  	if (message.status === 'ended') {
  		this._trigger('streamEnded', targetMid, this.getPeerInfo(targetMid),
        false, message.sessionType === 'screensharing', message.streamId);
      this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);

      if (this._peerConnections[targetMid]) {
        this._peerConnections[targetMid].hasStream = false;
        if (message.sessionType === 'screensharing') {
          this._peerConnections[targetMid].hasScreen = false;
        }
      } else {
        log.log([targetMid, null, message.type, 'Peer connection not found']);
      }
  	} else if (message.status === 'check') {
      if (!message.streamId) {
        return;
      }

      // Prevent restarts unless its stable
      if (this._peerConnections[targetMid] && this._peerConnections[targetMid].signalingState ===
        this.PEER_CONNECTION_STATE.STABLE) {
        var streams = this._peerConnections[targetMid].getRemoteStreams();
        if (streams.length > 0 && message.streamId !== (streams[0].id || streams[0].label)) {
          this._sendChannelMessage({
            type: this._SIG_MESSAGE_TYPE.RESTART,
            mid: this._user.sid,
            rid: this._room.id,
            agent: window.webrtcDetectedBrowser,
            version: window.webrtcDetectedVersion,
            os: window.navigator.platform,
            userInfo: this._getUserInfo(),
            target: targetMid,
            weight: this._peerPriorityWeight,
            enableIceTrickle: this._enableIceTrickle,
            enableDataChannel: this._enableDataChannel,
            receiveOnly: this._peerConnections[targetMid] && this._peerConnections[targetMid].receiveOnly,
            sessionType: !!this._streams.screenshare ? 'screensharing' : 'stream',
            // SkylinkJS parameters (copy the parameters from received message parameters)
            isConnectionRestart: !!message.isConnectionRestart,
            lastRestart: message.lastRestart,
            explicit: !!message.explicit,
            temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null
          });
        }
      }
    }

  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "bye" socket message received.
 * See confluence docs for the "bye" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _byeHandler
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._byeHandler = function(message) {
  var targetMid = message.mid;
  var selfId = (this._user || {}).sid;

  if (selfId !== targetMid){
    log.log([targetMid, null, message.type, 'Peer has left the room']);
    this._removePeer(targetMid);
  } else {
    log.log([targetMid, null, message.type, 'Self has left the room']);
  }
};

/**
 * Function that handles the "private" socket message received.
 * See confluence docs for the "private" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _privateMessageHandler
 * @private
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._privateMessageHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type,
    'Received private message from peer:'], message.data);
  this._trigger('incomingMessage', {
    content: message.data,
    isPrivate: true,
    targetPeerId: message.target, // is not null if there's user
    isDataChannel: false,
    senderPeerId: targetMid
  }, targetMid, this.getPeerInfo(targetMid), false);
};

/**
 * Function that handles the "public" socket message received.
 * See confluence docs for the "public" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _publicMessageHandler
 * @private
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._publicMessageHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type,
    'Received public message from peer:'], message.data);
  this._trigger('incomingMessage', {
    content: message.data,
    isPrivate: false,
    targetPeerId: null, // is not null if there's user
    isDataChannel: false,
    senderPeerId: targetMid
  }, targetMid, this.getPeerInfo(targetMid), false);
};

/**
 * Function that handles the "inRoom" socket message received.
 * See confluence docs for the "inRoom" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _inRoomHandler
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._inRoomHandler = function(message) {
  var self = this;
  log.log(['Server', null, message.type, 'User is now in the room and ' +
    'functionalities are now available. Config received:'], message.pc_config);
  self._room.connection.peerConfig = self._setIceServers(message.pc_config);
  self._inRoom = true;
  self._user.sid = message.sid;
  self._peerPriorityWeight = (new Date()).getTime();

  self._trigger('peerJoined', self._user.sid, self.getPeerInfo(), true);
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);

  if (typeof message.tieBreaker === 'number') {
    self._peerPriorityWeight = message.tieBreaker;
  }

  // Make Firefox the answerer always when connecting with other browsers
  if (window.webrtcDetectedBrowser === 'firefox') {
    log.warn('Decreasing weight for Firefox browser connection');

    self._peerPriorityWeight -= 100000000000;
  }

  if (self._streams.screenshare && self._streams.screenshare.stream) {
    self._trigger('incomingStream', self._user.sid, self._streams.screenshare.stream, true, self.getPeerInfo());
  } else if (self._streams.userMedia && self._streams.userMedia.stream) {
    self._trigger('incomingStream', self._user.sid, self._streams.userMedia.stream, true, self.getPeerInfo());
  }
  // NOTE ALEX: should we wait for local streams?
  // or just go with what we have (if no stream, then one way?)
  // do we hardcode the logic here, or give the flexibility?
  // It would be better to separate, do we could choose with whom
  // we want to communicate, instead of connecting automatically to all.
  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    receiveOnly: self._receiveOnly,
    sessionType: !!self._streams.screenshare ? 'screensharing' : 'stream',
    weight: self._peerPriorityWeight,
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null
  });
};

/**
 * Function that handles the "enter" socket message received.
 * See confluence docs for the "enter" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _enterHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._enterHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  var isNewPeer = false;

  log.log([targetMid, null, message.type, 'Received Peer\'s presence ->'], message.userInfo);

  if (!self._peerInformations[targetMid]) {
    isNewPeer = true;
    self._addPeer(targetMid, {
      agent: message.agent,
      version: message.version,
      os: message.os
    }, false, false, message.receiveOnly, message.sessionType === 'screensharing');

    self._peerInformations[targetMid] = message.userInfo || {};
    self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
      userData: 0,
      audioMuted: 0,
      videoMuted: 0
    };
    self._peerInformations[targetMid].agent = {
      name: message.agent,
      version: message.version,
      os: message.os || '',
      pluginVersion: message.temasysPluginVersion
    };

    if (targetMid !== 'MCU') {
      self._trigger('peerJoined', targetMid, message.userInfo, false);

    } else {
      log.info([targetMid, 'RTCPeerConnection', 'MCU', 'MCU feature has been enabled'], message);
      log.log([targetMid, null, message.type, 'MCU has joined'], message.userInfo);
      this._hasMCU = true;
      this._trigger('serverPeerJoined', targetMid, this.SERVER_PEER_TYPE.MCU);
    }

    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.WELCOME,
    mid: self._user.sid,
    rid: self._room.id,
    receiveOnly: self._peerConnections[targetMid] ?
    	!!self._peerConnections[targetMid].receiveOnly : false,
    enableIceTrickle: self._enableIceTrickle,
    enableDataChannel: self._enableDataChannel,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    target: targetMid,
    weight: self._peerPriorityWeight,
    sessionType: !!self._streams.screenshare ? 'screensharing' : 'stream',
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null
  });

  if (isNewPeer) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
  }
};

/**
 * Function that handles the "restart" socket message received.
 * See confluence docs for the "restart" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _restartHandler
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._restartHandler = function(message){
  var self = this;
  var targetMid = message.mid;

  if (!self._peerInformations[targetMid]) {
    log.error([targetMid, null, null, 'Peer does not have an existing ' +
      'session. Ignoring restart process.']);
    return;
  }

  // NOTE: for now we ignore, but we should take-note to implement in the near future
  if (self._hasMCU) {
    self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false);
    return;
  }

  self.lastRestart = message.lastRestart || Date.now() || function() { return +new Date(); };

  if (!self._peerConnections[targetMid]) {
    log.error([targetMid, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  // mcu has re-joined
  // NOTE: logic trip since _hasMCU flags are ignored, this could result in failure perhaps?
  if (targetMid === 'MCU') {
    log.log([targetMid, null, message.type, 'MCU has restarted its connection']);
    self._hasMCU = true;
  }

  // Uncomment because we do not need this
  //self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);

  message.agent = (!message.agent) ? 'chrome' : message.agent;
  /*self._enableIceTrickle = (typeof message.enableIceTrickle === 'boolean') ?
    message.enableIceTrickle : self._enableIceTrickle;
  self._enableDataChannel = (typeof message.enableDataChannel === 'boolean') ?
    message.enableDataChannel : self._enableDataChannel;*/

  // re-add information
  self._peerInformations[targetMid] = message.userInfo || {};
  self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
    userData: 0,
    audioMuted: 0,
    videoMuted: 0
  };
  self._peerInformations[targetMid].agent = {
    name: message.agent,
    version: message.version,
    os: message.os || '',
    pluginVersion: message.temasysPluginVersion
  };

  var agent = (self.getPeerInfo(targetMid) || {}).agent || {};

  // This variable is not used
  //var peerConnectionStateStable = false;

  log.info([targetMid, 'RTCPeerConnection', null, 'Received restart request from peer'], message);
  // we are no longer adding any peer
  /*self._addPeer(targetMid, {
    agent: message.agent,
    version: message.version,
    os: message.os
  }, true, true, message.receiveOnly, message.sessionType === 'screensharing');*/

  // Make peer with highest weight do the offer
  if (self._peerPriorityWeight > message.weight) {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Restarting negotiation'], agent);
    self._doOffer(targetMid, {
      agent: agent.name,
      version: agent.version,
      os: agent.os
    }, true);

  } else {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Waiting for peer to start re-negotiation'], agent);
    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      os: window.navigator.platform,
      userInfo: self._getUserInfo(),
      target: targetMid,
      weight: self._peerPriorityWeight,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      receiveOnly: self._peerConnections[targetMid] && self._peerConnections[targetMid].receiveOnly,
      sessionType: !!self._streams.screenshare ? 'screensharing' : 'stream',
      // SkylinkJS parameters (copy the parameters from received message parameters)
      isConnectionRestart: !!message.isConnectionRestart,
      lastRestart: message.lastRestart,
      explicit: !!message.explicit,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null
    });
  }

  self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false);

  // following the previous logic to do checker always
  self._startPeerConnectionHealthCheck(targetMid, false);
};

/**
 * Function that handles the "welcome" socket message received.
 * See confluence docs for the "welcome" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _welcomeHandler
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._welcomeHandler = function(message) {
  var targetMid = message.mid;
  var restartConn = false;
  var beOfferer = this._peerPriorityWeight > message.weight;
  var isNewPeer = false;

  log.log([targetMid, null, message.type, 'Received Peer\'s presence ->'], message.userInfo);

  // We shouldn't assume as chrome
  message.agent = (!message.agent) ? 'unknown' : message.agent;

  var agent = {
    agent: message.agent,
    version: message.version,
    os: message.os
  };

  if (!this._peerInformations[targetMid]) {
    this._peerInformations[targetMid] = message.userInfo || {};
    this._peerMessagesStamps[targetMid] = this._peerMessagesStamps[targetMid] || {
      userData: 0,
      audioMuted: 0,
      videoMuted: 0
    };
    this._peerInformations[targetMid].agent = {
      name: message.agent,
      version: message.version,
      os: message.os || '',
      pluginVersion: message.temasysPluginVersion
    };
    // disable mcu for incoming peer sent by MCU
    /*if (message.agent === 'MCU') {
      this._enableDataChannel = false;

    }*/
    // user is not mcu
    if (targetMid !== 'MCU') {
      this._trigger('peerJoined', targetMid, message.userInfo, false);

    } else {
      log.info([targetMid, 'RTCPeerConnection', 'MCU', 'MCU feature is currently enabled'], message);
      log.log([targetMid, null, message.type, 'MCU has ' +
        ((message.weight > -1) ? 'joined and ' : '') + ' responded']);
      this._hasMCU = true;
      this._trigger('serverPeerJoined', targetMid, this.SERVER_PEER_TYPE.MCU);
      log.log([targetMid, null, message.type, 'Always setting as offerer because peer is MCU']);
      beOfferer = true;
    }

    if (!this._peerConnections[targetMid]) {
      this._addPeer(targetMid, agent, false, restartConn, message.receiveOnly, message.sessionType === 'screensharing');
    }

    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);
  }

  if (this._hasMCU) {
    log.log([targetMid, null, message.type, 'Always setting as offerer because MCU is present']);
    beOfferer = true;
  }

  /*this._enableIceTrickle = (typeof message.enableIceTrickle === 'boolean') ?
    message.enableIceTrickle : this._enableIceTrickle;
  this._enableDataChannel = (typeof message.enableDataChannel === 'boolean') ?
    message.enableDataChannel : this._enableDataChannel;*/

  log.debug([targetMid, 'RTCPeerConnection', null, 'Peer should start connection ->'], beOfferer);

  if (beOfferer) {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Starting negotiation'], agent);
    this._doOffer(targetMid, agent);

  } else {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Peer has to start the connection. Resending message'], beOfferer);

    this._sendChannelMessage({
      type: this._SIG_MESSAGE_TYPE.WELCOME,
      mid: this._user.sid,
      rid: this._room.id,
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      os: window.navigator.platform,
      userInfo: this._getUserInfo(),
      target: targetMid,
      weight: this._peerPriorityWeight,
      sessionType: !!this._streams.screenshare ? 'screensharing' : 'stream',
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null
    });
  }
};

/**
 * Function that handles the "offer" socket message received.
 * See confluence docs for the "offer" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _offerHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._offerHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for offer']);
    return;
  }

  /*if (pc.localDescription ? !!pc.localDescription.sdp : false) {
    log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
      pc.localDescription);
    return;
  }*/

  // Add-on by Web SDK fixes
  if (message.userInfo && typeof message.userInfo === 'object') {
    self._peerInformations[targetMid].settings = message.userInfo.settings;
    self._peerInformations[targetMid].mediaStatus = message.userInfo.mediaStatus;
    self._peerInformations[targetMid].userData = message.userInfo.userData;
  }

  log.log([targetMid, null, message.type, 'Received offer from peer. ' +
    'Session description:'], message.sdp);
  var offer = new window.RTCSessionDescription({
    type: message.type,
    sdp: message.sdp
  });
  log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], offer);

  // Configure it to force TURN connections by removing non-"relay" candidates
  if (self._forceTURN && !self._enableIceTrickle) {
    if (!self._hasMCU) {
      log.warn([targetMid, 'RTCICECandidate', null, 'Removing non-"relay" candidates from offer ' +
        ' as TURN connections is forced']);

      offer.sdp = offer.sdp.replace(/a=candidate:(?!.*relay.*).*\r\n/g, '');

    } else {
      log.warn([targetMid, 'RTCICECandidate', null, 'Not removing non-"relay"' +
        '" candidates although TURN connections is forced as MCU is present']);
    }
  }

  // This is always the initial state. or even after negotiation is successful
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    log.warn([targetMid, null, message.type, 'Peer connection state is not in ' +
      '"stable" state for re-negotiation. Dropping message.'], {
        signalingState: pc.signalingState,
        isRestart: !!message.resend
      });
    return;
  }

  // Added checks if there is a current remote sessionDescription being processing before processing this one
  if (pc.processingRemoteSDP) {
    log.warn([targetMid, 'RTCSessionDescription', 'offer',
      'Dropping of setting local offer as there is another ' +
      'sessionDescription being processed ->'], offer);
    return;
  }

  pc.processingRemoteSDP = true;

  pc.setRemoteDescription(offer, function() {
    log.debug([targetMid, 'RTCSessionDescription', message.type, 'Remote description set']);
    pc.setOffer = 'remote';
    pc.processingRemoteSDP = false;
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.OFFER, targetMid);
    self._addIceCandidateFromQueue(targetMid);
    self._doAnswer(targetMid);
  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingRemoteSDP = false;

    log.error([targetMid, null, message.type, 'Failed setting remote description:'], error);
  });
};


/**
 * Function that handles the "candidate" socket message received.
 * See confluence docs for the "candidate" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _candidateHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._candidateHandler = function(message) {
  var targetMid = message.mid;
  var pc = this._peerConnections[targetMid];
  log.log([targetMid, null, message.type, 'Received candidate from peer. Candidate config:'], {
    sdp: message.sdp,
    target: message.target,
    candidate: message.candidate,
    label: message.label
  });
  // create ice candidate object
  var messageCan = message.candidate.split(' ');
  var canType = messageCan[7];
  log.log([targetMid, null, message.type, 'Candidate type:'], canType);
  // if (canType !== 'relay' && canType !== 'srflx') {
  // trace('Skipping non relay and non srflx candidates.');
  var index = message.label;
  var candidate = new window.RTCIceCandidate({
    sdpMLineIndex: index,
    candidate: message.candidate,
    //id: message.id,
    sdpMid: message.id
    //label: index
  });

  if (this._forceTURN && canType !== 'relay') {
    if (!this._hasMCU) {
      log.warn([targetMid, 'RTCICECandidate', null, 'Ignoring adding of "' + canType +
        '" candidate as TURN connections is forced'], candidate);
      return;
    }

    log.warn([targetMid, 'RTCICECandidate', null, 'Not ignoring adding of "' + canType +
      '" candidate although TURN connections is forced as MCU is present'], candidate);
  }

  if (pc) {
  	if (pc.signalingState === this.PEER_CONNECTION_STATE.CLOSED) {
  		log.warn([targetMid, null, message.type, 'Peer connection state ' +
  			'is closed. Not adding candidate'], candidate);
	    return;
  	}
    /*if (pc.iceConnectionState === this.ICE_CONNECTION_STATE.CONNECTED) {
      log.debug([targetMid, null, null,
        'Received but not adding Candidate as we are already connected to this peer']);
      return;
    }*/
    // set queue before ice candidate cannot be added before setRemoteDescription.
    // this will cause a black screen of media stream
    if ((pc.setOffer === 'local' && pc.setAnswer === 'remote') ||
      (pc.setAnswer === 'local' && pc.setOffer === 'remote')) {
      pc.addIceCandidate(candidate, this._onAddIceCandidateSuccess, this._onAddIceCandidateFailure);
      // NOTE ALEX: not implemented in chrome yet, need to wait
      // function () { trace('ICE  -  addIceCandidate Succesfull. '); },
      // function (error) { trace('ICE  - AddIceCandidate Failed: ' + error); }
      //);
      log.debug([targetMid, 'RTCIceCandidate', message.type,
        'Added candidate'], candidate);
    } else {
      this._addIceCandidateToQueue(targetMid, candidate);
    }
  } else {
    // Added ice candidate to queue because it may be received before sending the offer
    log.debug([targetMid, 'RTCIceCandidate', message.type,
      'Not adding candidate as peer connection not present'], candidate);
    // NOTE ALEX: if the offer was slow, this can happen
    // we might keep a buffer of candidates to replay after receiving an offer.
    this._addIceCandidateToQueue(targetMid, candidate);
  }

  if (!this._gatheredCandidates[targetMid]) {
    this._gatheredCandidates[targetMid] = {
      sending: { host: [], srflx: [], relay: [] },
      receiving: { host: [], srflx: [], relay: [] }
    };
  }

  this._gatheredCandidates[targetMid].receiving[canType].push({
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex,
    candidate: candidate.candidate
  });
};

/**
 * Function that handles the "answer" socket message received.
 * See confluence docs for the "answer" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _answerHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._answerHandler = function(message) {
  var self = this;
  var targetMid = message.mid;

  log.log([targetMid, null, message.type,
    'Received answer from peer. Session description:'], message.sdp);

  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for answer']);
    return;
  }

  // Add-on by Web SDK fixes
  if (message.userInfo && typeof message.userInfo === 'object') {
    self._peerInformations[targetMid].settings = message.userInfo.settings;
    self._peerInformations[targetMid].mediaStatus = message.userInfo.mediaStatus;
    self._peerInformations[targetMid].userData = message.userInfo.userData;
  }

  var answer = new window.RTCSessionDescription({
    type: message.type,
    sdp: message.sdp
  });

  log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], answer);

  /*if (pc.remoteDescription ? !!pc.remoteDescription.sdp : false) {
    log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
      pc.remoteDescription);
    return;
  }

  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
    log.error([targetMid, null, message.type, 'Unable to set peer connection ' +
      'at signalingState "stable". Ignoring remote answer'], pc.signalingState);
    return;
  }*/

  // if firefox and peer is mcu, replace the sdp to suit mcu needs
  if (window.webrtcDetectedType === 'moz' && targetMid === 'MCU') {
    answer.sdp = answer.sdp.replace(/ generation 0/g, '');
    answer.sdp = answer.sdp.replace(/ udp /g, ' UDP ');
  }

  // Configure it to force TURN connections by removing non-"relay" candidates
  if (self._forceTURN && !self._enableIceTrickle) {
    if (!self._hasMCU) {
      log.warn([targetMid, 'RTCICECandidate', null, 'Removing non-"relay" candidates from answer ' +
        ' as TURN connections is forced']);

      answer.sdp = answer.sdp.replace(/a=candidate:(?!.*relay.*).*\r\n/g, '');

    } else {
      log.warn([targetMid, 'RTCICECandidate', null, 'Not removing non-"relay"' +
        '" candidates although TURN connections is forced as MCU is present']);
    }
  }

  // This should be the state after offer is received. or even after negotiation is successful
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER) {
    log.warn([targetMid, null, message.type, 'Peer connection state is not in ' +
      '"have-local-offer" state for re-negotiation. Dropping message.'], {
        signalingState: pc.signalingState,
        isRestart: !!message.restart
      });
    return;
  }

  // Added checks if there is a current remote sessionDescription being processing before processing this one
  if (pc.processingRemoteSDP) {
    log.warn([targetMid, 'RTCSessionDescription', 'answer',
      'Dropping of setting local answer as there is another ' +
      'sessionDescription being processed ->'], answer);
    return;
  }

  pc.processingRemoteSDP = true;

  pc.setRemoteDescription(answer, function() {
    log.debug([targetMid, null, message.type, 'Remote description set']);
    pc.setAnswer = 'remote';
    pc.processingRemoteSDP = false;
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ANSWER, targetMid);
    self._addIceCandidateFromQueue(targetMid);

  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingRemoteSDP = false;

    log.error([targetMid, null, message.type, 'Failed setting remote description:'], {
      error: error,
      state: pc.signalingState
    });
  });
};

Skylink.prototype.VIDEO_CODEC = {
  AUTO: 'auto',
  VP8: 'VP8',
  H264: 'H264'
  //H264UC: 'H264UC'
};

/**
 * <blockquote class="info">
 *   Note that if the audio codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.
 * </blockquote>
 * The list of available audio codecs to set as the preferred audio codec to use to encode
 * sending audio data when available encoded audio codec for Peer connections
 * configured in the <a href="#method_init"><code>init()</code> method</a>.
 * @attribute AUDIO_CODEC
 * @param {String} AUTO <small>Value <code>"auto"</code></small>
 *   The value of the option to not prefer any audio codec but rather use the created
 *   local <code>"offer"</code> / <code>"answer"</code> session description audio codec preference.
 * @param {String} OPUS <small>Value <code>"opus"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/Opus_(audio_format)">OPUS</a> audio codec.
 * @param {String} ISAC <small>Value <code>"ISAC"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/Internet_Speech_Audio_Codec">ISAC</a> audio codec.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.AUDIO_CODEC = {
  AUTO: 'auto',
  ISAC: 'ISAC',
  OPUS: 'opus',
  //ILBC: 'ILBC',
  //G711: 'G711',
  //G722: 'G722',
  //SILK: 'SILK'
};

/**
 * <blockquote class="info">
 *   Note that currently <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> only configures
 *   the maximum resolution of the Stream due to browser interopability and support.
 * </blockquote>
 * The list of <a href="https://en.wikipedia.org/wiki/Graphics_display_resolution#Video_Graphics_Array">
 * video resolutions</a> sets configured in the <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
 * @attribute VIDEO_RESOLUTION
 * @param {JSON} QQVGA <small>Value <code>{ width: 160, height: 120 }</code></small>
 *   The value of the option to configure QQVGA resolution.
 *   <small>Aspect ratio: <code>4:3</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} HQVGA <small>Value <code>{ width: 240, height: 160 }</code></small>
 *   The value of the option to configure HQVGA resolution.
 *   <small>Aspect ratio: <code>3:2</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} QVGA <small>Value <code>{ width: 320, height: 240 }</code></small>
 *   The value of the option to configure QVGA resolution.
 *   <small>Aspect ratio: <code>4:3</code></small>
 * @param {JSON} WQVGA <small>Value <code>{ width: 384, height: 240 }</code></small>
 *   The value of the option to configure WQVGA resolution.
 *   <small>Aspect ratio: <code>16:10</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} HVGA <small>Value <code>{ width: 480, height: 320 }</code></small>
 *   The value of the option to configure HVGA resolution.
 *   <small>Aspect ratio: <code>3:2</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} VGA <small>Value <code>{ width: 640, height: 480 }</code></small>
 *   The value of the option to configure VGA resolution.
 *   <small>Aspect ratio: <code>4:3</code></small>
 * @param {JSON} WVGA <small>Value <code>{ width: 768, height: 480 }</code></small>
 *   The value of the option to configure WVGA resolution.
 *   <small>Aspect ratio: <code>16:10</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} FWVGA <small>Value <code>{ width: 854, height: 480 }</code></small>
 *   The value of the option to configure FWVGA resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} SVGA <small>Value <code>{ width: 800, height: 600 }</code></small>
 *   The value of the option to configure SVGA resolution.
 *   <small>Aspect ratio: <code>4:3</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} DVGA <small>Value <code>{ width: 960, height: 640 }</code></small>
 *   The value of the option to configure DVGA resolution.
 *   <small>Aspect ratio: <code>3:2</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} WSVGA <small>Value <code>{ width: 1024, height: 576 }</code></small>
 *   The value of the option to configure WSVGA resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 * @param {JSON} HD <small>Value <code>{ width: 1280, height: 720 }</code></small>
 *   The value of the option to configure HD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on device supports.</small>
 * @param {JSON} HDPLUS <small>Value <code>{ width: 1600, height: 900 }</code></small>
 *   The value of the option to configure HDPLUS resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} FHD <small>Value <code>{ width: 1920, height: 1080 }</code></small>
 *   The value of the option to configure FHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on device supports.</small>
 * @param {JSON} QHD <small>Value <code>{ width: 2560, height: 1440 }</code></small>
 *   The value of the option to configure QHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} WQXGAPLUS <small>Value <code>{ width: 3200, height: 1800 }</code></small>
 *   The value of the option to configure WQXGAPLUS resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} UHD <small>Value <code>{ width: 3840, height: 2160 }</code></small>
 *   The value of the option to configure UHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} UHDPLUS <small>Value <code>{ width: 5120, height: 2880 }</code></small>
 *   The value of the option to configure UHDPLUS resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} FUHD <small>Value <code>{ width: 7680, height: 4320 }</code></small>
 *   The value of the option to configure FUHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} QUHD <small>Value <code>{ width: 15360, height: 8640 }</code></small>
 *   The value of the option to configure QUHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.VIDEO_RESOLUTION = {
  QQVGA: { width: 160, height: 120 /*, aspectRatio: '4:3'*/ },
  HQVGA: { width: 240, height: 160 /*, aspectRatio: '3:2'*/ },
  QVGA: { width: 320, height: 240 /*, aspectRatio: '4:3'*/ },
  WQVGA: { width: 384, height: 240 /*, aspectRatio: '16:10'*/ },
  HVGA: { width: 480, height: 320 /*, aspectRatio: '3:2'*/ },
  VGA: { width: 640, height: 480 /*, aspectRatio: '4:3'*/ },
  WVGA: { width: 768, height: 480 /*, aspectRatio: '16:10'*/ },
  FWVGA: { width: 854, height: 480 /*, aspectRatio: '16:9'*/ },
  SVGA: { width: 800, height: 600 /*, aspectRatio: '4:3'*/ },
  DVGA: { width: 960, height: 640 /*, aspectRatio: '3:2'*/ },
  WSVGA: { width: 1024, height: 576 /*, aspectRatio: '16:9'*/ },
  HD: { width: 1280, height: 720 /*, aspectRatio: '16:9'*/ },
  HDPLUS: { width: 1600, height: 900 /*, aspectRatio: '16:9'*/ },
  FHD: { width: 1920, height: 1080 /*, aspectRatio: '16:9'*/ },
  QHD: { width: 2560, height: 1440 /*, aspectRatio: '16:9'*/ },
  WQXGAPLUS: { width: 3200, height: 1800 /*, aspectRatio: '16:9'*/ },
  UHD: { width: 3840, height: 2160 /*, aspectRatio: '16:9'*/ },
  UHDPLUS: { width: 5120, height: 2880 /*, aspectRatio: '16:9'*/ },
  FUHD: { width: 7680, height: 4320 /*, aspectRatio: '16:9'*/ },
  QUHD: { width: 15360, height: 8640 /*, aspectRatio: '16:9'*/ }
};

/**
 * The list of <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> or
 * <a href="#method_shareScreen"><code>shareScreen()</code> method</a> Stream fallback states.
 * @attribute MEDIA_ACCESS_FALLBACK_STATE
 * @param {JSON} FALLBACKING <small>Value <code>0</code></small>
 *   The value of the state when <code>getUserMedia()</code> will retrieve audio track only
 *   when retrieving audio and video tracks failed.
 *   <small>This can be configured by <a href="#method_init"><code>init()</code> method</a>
 *   <code>audioFallback</code> option.</small>
 * @param {JSON} FALLBACKED  <small>Value <code>1</code></small>
 *   The value of the state when <code>getUserMedia()</code> or <code>shareScreen()</code>
 *   retrieves camera / screensharing Stream successfully but with missing originally required audio or video tracks.
 * @param {JSON} ERROR       <small>Value <code>-1</code></small>
 *   The value of the state when <code>getUserMedia()</code> failed to retrieve audio track only
 *   after retrieving audio and video tracks failed.
 * @readOnly
 * @for Skylink
 * @since 0.6.14
 */
Skylink.prototype.MEDIA_ACCESS_FALLBACK_STATE = {
  FALLBACKING: 0,
  FALLBACKED: 1,
  ERROR: -1
};

/**
 * Stores the flag that indicates if <code>getUserMedia()</code> should fallback to retrieve
 *   audio only Stream after retrieval of audio and video Stream had failed.
 * @attribute _audioFallback
 * @type Boolean
 * @default false
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._audioFallback = false;

/**
 * Stores the Streams.
 * @attribute _streams
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._streams = {
  userMedia: null,
  screenshare: null
};

/**
 * Stores the default camera Stream settings.
 * @attribute _streamsDefaultSettings
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._streamsDefaultSettings = {
  userMedia: {
    audio: {
      stereo: false
    },
    video: {
      resolution: {
        width: 640,
        height: 480
      },
      frameRate: 50
    }
  },
  screenshare: {
    video: true
  }
};

/**
 * Stores all the Stream required muted settings.
 * @attribute _streamsMutedSettings
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._streamsMutedSettings = {
  audioMuted: false,
  videoMuted: false
};

/**
 * Stores all the Stream sending maximum bandwidth settings.
 * @attribute _streamsBandwidthSettings
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._streamsBandwidthSettings = {};

/**
 * Stores all the Stream stopped callbacks.
 * @attribute _streamsStoppedCbs
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._streamsStoppedCbs = {};

/**
 * Function that retrieves camera Stream.
 * @method getUserMedia
 * @param {JSON} [options] The camera Stream configuration options.
 * - When not provided, the value is set to <code>{ audio: true, video: true }</code>.
 *   <small>To fallback to retrieve audio track only when retrieving of audio and video tracks failed,
 *   enable the <code>audioFallback</code> flag in the <a href="#method_init"><code>init()</code> method</a>.</small>
 * @param {Boolean} [options.useExactConstraints=false] <blockquote class="info">
 *   Note that by enabling this flag, exact values will be requested  when retrieving camera Stream,
 *   but it does not prevent constraints related errors. By default when not enabled,
 *   expected mandatory maximum values (or optional values for source ID) will requested to prevent constraints related
 *   errors, with an exception for <code>options.video.frameRate</code> option in Safari and IE (plugin-enabled) browsers,
 *   where the expected maximum value will not be requested due to the lack of support.</blockquote>
 *   The flag if <code>getUserMedia()</code> should request for camera Stream to match exact requested values of
 *   <code>options.audio.deviceId</code> and <code>options.video.deviceId</code>, <code>options.video.resolution</code>
 *   and <code>options.video.frameRate</code> when provided.
 * @param {Boolean|JSON} [options.audio=false] The audio configuration options.
 * @param {Boolean} [options.audio.stereo=false] The flag if stereo band should be configured
 *   when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
 * @param {Boolean} [options.audio.mute=false] The flag if audio tracks should be muted upon receiving them.
 *   <small>Providing the value as <code>false</code> does nothing to <code>peerInfo.mediaStatus.audioMuted</code>,
 *   but when provided as <code>true</code>, this sets the <code>peerInfo.mediaStatus.audioMuted</code> value to
 *   <code>true</code> and mutes any existing <a href="#method_shareScreen">
 *   <code>shareScreen()</code> Stream</a> audio tracks as well.</small>
 * @param {Array} [options.audio.optional] <blockquote class="info">
 *   Note that this may result in constraints related error when <code>options.useExactConstraints</code> value is
 *   <code>true</code>. If you are looking to set the requested source ID of the audio track,
 *   use <code>options.audio.deviceId</code> instead.</blockquote>
 *   The <code>navigator.getUserMedia()</code> API <code>audio: { optional [..] }</code> property.
 * @param {String} [options.audio.deviceId] <blockquote class="info">
 *   Note this is currently not supported in Firefox browsers.
 *   </blockquote> The audio track source ID of the device to use.
 *   <small>The list of available audio source ID can be retrieved by the <a href="https://developer.
 * mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"><code>navigator.mediaDevices.enumerateDevices</code>
 *   API</a>.</small>
 * @param {Boolean|JSON} [options.video=false] The video configuration options.
 * @param {Boolean} [options.video.mute=false] The flag if video tracks should be muted upon receiving them.
 *   <small>Providing the value as <code>false</code> does nothing to <code>peerInfo.mediaStatus.videoMuted</code>,
 *   but when provided as <code>true</code>, this sets the <code>peerInfo.mediaStatus.videoMuted</code> value to
 *   <code>true</code> and mutes any existing <a href="#method_shareScreen">
 *   <code>shareScreen()</code> Stream</a> video tracks as well.</small>
 * @param {JSON} [options.video.resolution] The video resolution.
 *   <small>By default, <a href="#attr_VIDEO_RESOLUTION"><code>VGA</code></a> resolution option
 *   is selected when not provided.</small>
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number} [options.video.resolution.width] The video resolution width.
 * @param {Number} [options.video.resolution.height] The video resolution height.
 * @param {Number} [options.video.frameRate] The video <a href="https://en.wikipedia.org/wiki/Frame_rate">
 *   frameRate</a> per second (fps).
 * @param {Array} [options.video.optional] <blockquote class="info">
 *   Note that this may result in constraints related error when <code>options.useExactConstraints</code> value is
 *   <code>true</code>. If you are looking to set the requested source ID of the video track,
 *   use <code>options.video.deviceId</code> instead.</blockquote>
 *   The <code>navigator.getUserMedia()</code> API <code>video: { optional [..] }</code> property.
 * @param {String} [options.video.deviceId] <blockquote class="info">
 *   Note this is currently not supported in Firefox browsers.
 *   </blockquote> The video track source ID of the device to use.
 *   <small>The list of available video source ID can be retrieved by the <a href="https://developer.
 * mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"><code>navigator.mediaDevices.enumerateDevices</code>
 *   API</a>.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggering <code>isScreensharing</code> parameter
 *   payload value as <code>false</code> for request success.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>getUserMedia()</code> error when retrieving camera Stream.</small>
 * @param {MediaStream} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the camera Stream object.</small>
 * @example
 *   // Example 1: Get both audio and video.
 *   skylinkDemo.getUserMedia(function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-video"), success);
 *   });
 *
 *   // Example 2: Get only audio.
 *   skylinkDemo.getUserMedia({
 *     audio: true
 *   }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-audio"), success);
 *   });
 *
 *   // Example 3: Configure resolution for video
 *   skylinkDemo.getUserMedia({
 *     audio: true,
 *     video: {
 *       resolution: skylinkDemo.VIDEO_RESOLUTION.HD
 *     }
 *   }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-video"), success);
 *   });
 *
 *   // Example 4: Configure stereo flag for OPUS codec audio (OPUS is always used by default)
 *   skylinkDemo.init({
 *     appKey: "xxxxxx",
 *     audioCodec: skylinkDemo.AUDIO_CODEC.OPUS
 *   }, function (initErr, initSuccess) {
 *     skylinkDemo.getUserMedia({
 *       audio: {
 *         stereo: true
 *       },
 *       video: true
 *     }, function (error, success) {
 *       if (error) return;
 *       attachMediaStream(document.getElementById("my-video"), success);
 *     });
 *   });
 *
 *   // Example 5: Configure frameRate for video
 *   skylinkDemo.getUserMedia({
 *     audio: true,
 *     video: {
 *       frameRate: 50
 *     }
 *   }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-video"), success);
 *   });
 *
 *   // Example 6: Configure video and audio based on selected sources. Does not work for Firefox currently.
 *   var sources = { audio: [], video: [] };
 *
 *   function selectStream (audioSourceId, videoSourceId) {
 *     if (window.webrtcDetectedBrowser === 'firefox') {
 *       console.warn("Currently this feature is not supported by Firefox browsers!");
 *       return;
 *     }
 *     skylinkDemo.getUserMedia({
 *       audio: {
 *         optional: [{ sourceId: audioSourceId }]
 *       },
 *       video: {
 *         optional: [{ sourceId: videoSourceId }]
 *       }
 *     }, function (error, success) {
 *       if (error) return;
 *       attachMediaStream(document.getElementById("my-video"), success);
 *     });
 *   }
 *
 *   navigator.mediaDevices.enumerateDevices().then(function(devices) {
 *     var selectedAudioSourceId = "";
 *     var selectedVideoSourceId = "";
 *     devices.forEach(function(device) {
 *       console.log(device.kind + ": " + device.label + " source ID = " + device.deviceId);
 *       if (device.kind === "audio") {
 *         selectedAudioSourceId = device.deviceId;
 *       } else {
 *         selectedVideoSourceId = device.deviceId;
 *       }
 *     });
 *     selectStream(selectedAudioSourceId, selectedVideoSourceId);
 *   }).catch(function (error) {
 *      console.error("Failed", error);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If <code>options.audio</code> value is <code>false</code> and <code>options.video</code>
 *   value is <code>false</code>: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Retrieve camera Stream. <ol><li>If retrieval was succesful: <ol>
 *   <li>If there is any previous <code>getUserMedia()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopStream"><code>stopStream()</code> method</a>.</li></ol></li>
 *   <li>If there are missing audio or video tracks requested: <ol>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code> value as <code>false</code> and
 *   <code>isAudioFallback</code> value as <code>false</code>.</li></ol></li>
 *   <li>Mutes / Unmutes audio and video tracks based on current muted settings in <code>peerInfo.mediaStatus</code>.
 *   <small>This can be retrieved with <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small></li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers parameter payload
 *   <code>isScreensharing</code> value as <code>false</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li><li>Else: <ol>
 *   <li>If <code>options.audioFallback</code> is enabled in the <a href="#method_init"><code>init()</code> method</a>,
 *   <code>options.audio</code> value is <code>true</code> and <code>options.video</code> value is <code>true</code>: <ol>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> event triggers
 *   parameter payload <code>state</code> as <code>FALLBACKING</code>, <code>isScreensharing</code>
 *   value as <code>false</code> and <code>isAudioFallback</code> value as <code>true</code>.</li>
 *   <li>Retrieve camera Stream with audio tracks only. <ol><li>If retrieval was successful: <ol>
 *   <li>If there is any previous <code>getUserMedia()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopStream"><code>stopStream()</code> method</a>.</li></ol></li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> event triggers
 *   parameter payload <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code>
 *   value as <code>false</code> and <code>isAudioFallback</code> value as <code>true</code>.</li>
 *   <li>Mutes / Unmutes audio and video tracks based on current muted settings in <code>peerInfo.mediaStatus</code>.
 *   <small>This can be retrieved with <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small></li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code> and
 *   <code>isAudioFallback</code> value as <code>true</code>.</li></ol></li><li>Else: <ol>
 *   <li><a href="#event_mediaAccessError"><code>mediaAccessError</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code> and
 *   <code>isAudioFallbackError</code> value as <code>true</code>.</li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> event triggers
 *   parameter payload <code>state</code> as <code>ERROR</code>, <code>isScreensharing</code> value as
 *   <code>false</code> and <code>isAudioFallback</code> value as <code>true</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_mediaAccessError"><code>mediaAccessError</code> event</a> triggers parameter payload
 *   <code>isScreensharing</code> value as <code>false</code> and <code>isAudioFallbackError</code> value as
 *   <code>false</code>.</li><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.getUserMedia = function(options,callback) {
  var self = this;

  if (typeof options === 'function'){
    callback = options;
    options = {
      audio: true,
      video: true
    };

  } else if (typeof options !== 'object' || options === null) {
    if (typeof options === 'undefined') {
      options = {
        audio: true,
        video: true
      };

    } else {
      var invalidOptionsError = 'Please provide a valid options';
      log.error(invalidOptionsError, options);
      if (typeof callback === 'function') {
        callback(new Error(invalidOptionsError), null);
      }
      return;
    }

  } else if (!options.audio && !options.video) {
    var noConstraintOptionsSelectedError = 'Please select audio or video';
    log.error(noConstraintOptionsSelectedError, options);
    if (typeof callback === 'function') {
      callback(new Error(noConstraintOptionsSelectedError), null);
    }
    return;
  }

  /*if (window.location.protocol !== 'https:' && window.webrtcDetectedBrowser === 'chrome' &&
    window.webrtcDetectedVersion > 46) {
    errorMsg = 'getUserMedia() has to be called in https:// application';
    log.error(errorMsg, options);
    if (typeof callback === 'function') {
      callback(new Error(errorMsg), null);
    }
    return;
  }*/

  if (typeof callback === 'function') {
    var mediaAccessSuccessFn = function (stream) {
      self.off('mediaAccessError', mediaAccessErrorFn);
      callback(null, stream);
    };
    var mediaAccessErrorFn = function (error) {
      self.off('mediaAccessSuccess', mediaAccessSuccessFn);
      callback(error, null);
    };

    self.once('mediaAccessSuccess', mediaAccessSuccessFn, function (stream, isScreensharing) {
      return !isScreensharing;
    });

    self.once('mediaAccessError', mediaAccessErrorFn, function (error, isScreensharing) {
      return !isScreensharing;
    });
  }

  // Parse stream settings
  var settings = self._parseStreamSettings(options);

  navigator.getUserMedia(settings.getUserMediaSettings, function (stream) {
    if (settings.mutedSettings.shouldAudioMuted) {
      self._streamsMutedSettings.audioMuted = true;
    }

    if (settings.mutedSettings.shouldVideoMuted) {
      self._streamsMutedSettings.videoMuted = true;
    }

    self._onStreamAccessSuccess(stream, settings, false, false);

  }, function (error) {
    self._onStreamAccessError(error, settings, false, false);
  });
};

/**
 * <blockquote class="info">
 *   Note that if <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> is available despite having
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> available, the
 *   <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> is sent instead of the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> to Peers.
 * </blockquote>
 * Function that sends a new <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>
 * to all connected Peers in the Room.
 * @method sendStream
 * @param {JSON|MediaStream} options The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options</code> parameter settings.
 * - When provided as a <code>MediaStream</code> object, this configures the <code>options.audio</code> and
 *   <code>options.video</code> based on the tracks available in the <code>MediaStream</code> object,
 *   and configures the <code>options.audio.mute</code> and <code>options.video.mute</code> based on the tracks
 *   <code>.enabled</code> flags in the tracks provided in the <code>MediaStream</code> object without
 *   invoking <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
 *   <small>Object signature matches the <code>options</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggering <code>isScreensharing</code> parameter payload value
 *   as <code>false</code> for request success when User is in Room without Peers,
 *   or by the <a href="#event_peerRestart"><code>peerRestart</code> event</a> triggering
 *   <code>isSelfInitiateRestart</code> parameter payload value as <code>true</code> for all connected Peers
 *   for request success when User is in Room with Peers.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> error or
 *   when invalid <code>options</code> is provided.</small>
 * @param {MediaStream} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
 *   Stream object.</small>
 * @example
 *   // Example 1: Send MediaStream object
 *   function retrieveStreamBySourceForFirefox (sourceId) {
 *     navigator.mediaDevices.getUserMedia({
 *       audio: true,
 *       video: {
 *         sourceId: { exact: sourceId }
 *       }
 *     }).then(function (stream) {
 *       skylinkDemo.sendStream(stream, function (error, success) {
 *         if (err) return;
 *         if (stream === success) {
 *           console.info("Same MediaStream has been sent");
 *         }
 *         console.log("Stream is now being sent to Peers");
 *         attachMediaStream(document.getElementById("my-video"), success);
 *       });
 *     });
 *   }
 *
 *   // Example 2: Send video later
 *   var inRoom = false;
 *
 *   function sendVideo () {
 *     if (!inRoom) return;
 *     skylinkDemo.sendStream({
 *       audio: true,
 *       video: true
 *     }, function (error, success) {
 *       if (error) return;
 *       console.log("getUserMedia() Stream with video is now being sent to Peers");
 *       attachMediaStream(document.getElementById("my-video"), success);
 *     });
 *   }
 *
 *   skylinkDemo.joinRoom({
 *     audio: true
 *   }, function (jRError, jRSuccess) {
 *     if (jRError) return;
 *     inRoom = true;
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If User is not in Room: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Checks <code>options</code> provided. <ol><li>If provided parameter <code>options</code> is not valid: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Else if provided parameter <code>options</code> is a Stream object: <ol>
 *   <li>Checks if there is any audio or video tracks. <ol><li>If there is no tracks: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li><li>Else: <ol>
 *   <li>Set <code>options.audio</code> value as <code>true</code> if Stream has audio tracks.</li>
 *   <li>Set <code>options.video</code> value as <code>false</code> if Stream has video tracks.</li>
 *   <li>Mutes / Unmutes audio and video tracks based on current muted settings in
 *   <code>peerInfo.mediaStatus</code>. <small>This can be retrieved with
 *   <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small></li>
 *   <li>If there is any previous <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>:
 *   <ol><li>Invokes <a href="#method_stopStream"><code>stopStream()</code> method</a> to stop previous Stream.</li></ol></li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li>Invoke <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> with
 *   <code>options</code> provided in <code>sendStream()</code>. <ol><li>If request has errors: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li>
 *   <li>If there is currently no <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>stream</code> as
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   <li>Checks if MCU is enabled for App Key provided in <a href="#method_init"><code>init()</code> method</a>. <ol>
 *   <li>If MCU is enabled: <ol><li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code>
 *   method</a>. <ol><li>If request has errors: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li>
 *   <li>Else: <ol><li>If there are connected Peers in the Room: <ol>
 *   <li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>. <ol>
 *   <li>If request has errors: <ol><li><b>ABORT</b> and return error.
 *   </li></ol></li></ol></li></ol></li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.6
 */

Skylink.prototype.sendStream = function(options, callback) {
  var self = this;

  var restartFn = function (stream) {
    if (self._inRoom) {
      if (!self._streams.screenshare) {
        self._trigger('incomingStream', self._user.sid, stream, true, self.getPeerInfo());
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      }

      if (Object.keys(self._peerConnections).length > 0 || self._hasMCU) {
        self._refreshPeerConnection(Object.keys(self._peerConnections), false, function (err, success) {
          if (err) {
            log.error('Failed refreshing connections for sendStream() ->', err);
            if (typeof callback === 'function') {
              callback(new Error('Failed refreshing connections.'), null);
            }
            return;
          }
          if (typeof callback === 'function') {
            callback(null, stream);
          }
        });
      } else if (typeof callback === 'function') {
        callback(null, stream);
      }
    } else {
      var notInRoomAgainError = 'Unable to send stream as user is not in the Room.';
      log.error(notInRoomAgainError, stream);
      if (typeof callback === 'function') {
        callback(new Error(notInRoomAgainError), null);
      }
    }
  };

  if (typeof options !== 'object' || options === null) {
    var invalidOptionsError = 'Provided stream settings is invalid';
    log.error(invalidOptionsError, options);
    if (typeof callback === 'function'){
      callback(new Error(invalidOptionsError),null);
    }
    return;
  }

  if (!self._inRoom) {
    var notInRoomError = 'Unable to send stream as user is not in the Room.';
    log.error(notInRoomError, options);
    if (typeof callback === 'function'){
      callback(new Error(notInRoomError),null);
    }
    return;
  }

  if (typeof options.getAudioTracks === 'function' || typeof options.getVideoTracks === 'function') {
    var checkActiveTracksFn = function (tracks) {
      for (var t = 0; t < tracks.length; t++) {
        if (!(tracks[t].ended || (typeof tracks[t].readyState === 'string' ?
          tracks[t].readyState !== 'live' : false))) {
          return true;
        }
      }
      return false;
    };

    if (!checkActiveTracksFn( options.getAudioTracks() ) && !checkActiveTracksFn( options.getVideoTracks() )) {
      var invalidStreamError = 'Provided stream object does not have audio or video tracks.';
      log.error(invalidStreamError, options);
      if (typeof callback === 'function'){
        callback(new Error(invalidStreamError),null);
      }
      return;
    }

    self._onStreamAccessSuccess(options, {
      settings: {
        audio: true,
        video: true
      },
      getUserMediaSettings: {
        audio: true,
        video: true
      }
    }, false, false);

    restartFn(options);

  } else {
    self.getUserMedia(options, function (err, stream) {
      if (err) {
        if (typeof callback === 'function') {
          callback(err, null);
        }
        return;
      }
      restartFn(stream);
    });
  }
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that stops <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 * @method stopStream
 * @example
 *   function stopStream () {
 *     skylinkDemo.stopStream();
 *   }
 *
 *   skylinkDemo.getUserMedia();
 * @trigger <ol class="desc-seq">
 *   <li>Checks if there is <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>. <ol>
 *   <li>If there is <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>: <ol>
 *   <li>Stop <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> Stream. <ol>
 *   <li><a href="#event_mediaAccessStopped"><code>mediaAccessStopped</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code>.</li><li>If User is in Room: <ol>
 *   <li><a href="#event_streamEnded"><code>streamEnded</code> event</a> triggers parameter
 *   payload <code>isSelf</code> value as <code>true</code> and <code>isScreensharing</code> value as<code>false</code>
 *   .</li><li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li></ol></li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.stopStream = function () {
  if (this._streams.userMedia) {
    this._stopStreams({
      userMedia: true
    });
  }
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that mutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> audio or video tracks.
 * @method muteStream
 * @param {JSON} options The Streams muting options.
 * @param {Boolean} [options.audioMuted=true] The flag if all Streams audio
 *   tracks should be muted or not.
 * @param {Boolean} [options.videoMuted=true] The flag if all Streams video
 *   tracks should be muted or not.
 * @example
 *   // Example 1: Mute both audio and video tracks in all Streams
 *   skylinkDemo.muteStream({
 *     audioMuted: true,
 *     videoMuted: true
 *   });
 *
 *   // Example 2: Mute only audio tracks in all Streams
 *   skylinkDemo.muteStream({
 *     audioMuted: true,
 *     videoMuted: false
 *   });
 *
 *   // Example 3: Mute only video tracks in all Streams
 *   skylinkDemo.muteStream({
 *     audioMuted: false,
 *     videoMuted: true
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If provided parameter <code>options</code> is invalid: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Checks if there is any available Streams: <ol><li>If there is no available Streams: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li><li>If User is in Room: <ol>
 *   <li>Checks if there is audio tracks to mute / unmute: <ol><li>If there is audio tracks to mute / unmute: <ol>
 *   <li>If <code>options.audioMuted</code> value is not the same as the current
 *   <code>peerInfo.mediaStatus.audioMuted</code>: <small>This can be retrieved with
 *   <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small> <ol>
 *   <li><em>For Peer only</em> <a href="#event_peerUpdated"><code>peerUpdated</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>false</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_streamMuted"><code>streamMuted</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>false</code>.</li></ol></li></ol></li></ol></li>
 *   <li>Checks if there is video tracks to mute / unmute: <ol><li>If there is video tracks to mute / unmute: <ol>
 *   <li>If <code>options.videoMuted</code> value is not the same as the current
 *   <code>peerInfo.mediaStatus.videoMuted</code>: <small>This can be retrieved with
 *   <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small> <ol>
 *   <li><em>For Peer only</em> <a href="#event_peerUpdated"><code>peerUpdated</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>false</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_streamMuted"><code>streamMuted</code> event</a> triggers with
 *   parameter payload <code>isSelf</code> value as <code>false</code>.</li></ol></li></ol></li></ol></li></ol></li>
 *   <li>If <code>options.audioMuted</code> value is not the same as the current
 *   <code>peerInfo.mediaStatus.audioMuted</code> or <code>options.videoMuted</code> value is not
 *   the same as the current <code>peerInfo.mediaStatus.videoMuted</code>: <ol>
 *   <li><a href="#event_localMediaMuted"><code>localMediaMuted</code> event</a> triggers.</li>
 *   <li>If User is in Room: <ol><li><a href="#event_streamMuted"><code>streamMuted</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>true</code>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers with
 *   parameter payload <code>isSelf</code> value as <code>true</code>.</li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.7
 */
Skylink.prototype.muteStream = function(options) {
  var self = this;

  if (typeof options !== 'object') {
    log.error('Provided settings is not an object');
    return;
  }

  if (!(self._streams.userMedia && self._streams.userMedia.stream) &&
    !(self._streams.screenshare && self._streams.screenshare.stream)) {
    log.warn('No streams are available to mute / unmute!');
    return;
  }

  var audioMuted = typeof options.audioMuted === 'boolean' ? options.audioMuted : true;
  var videoMuted = typeof options.videoMuted === 'boolean' ? options.videoMuted : true;
  var hasToggledAudio = false;
  var hasToggledVideo = false;

  if (self._streamsMutedSettings.audioMuted !== audioMuted) {
    self._streamsMutedSettings.audioMuted = audioMuted;
    hasToggledAudio = true;
  }

  if (self._streamsMutedSettings.videoMuted !== videoMuted) {
    self._streamsMutedSettings.videoMuted = videoMuted;
    hasToggledVideo = true;
  }

  if (hasToggledVideo || hasToggledAudio) {
    var streamTracksAvailability = self._muteStreams();

    if (hasToggledVideo && self._inRoom) {
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.MUTE_VIDEO,
        mid: self._user.sid,
        rid: self._room.id,
        muted: self._streamsMutedSettings.videoMuted,
        stamp: (new Date()).getTime()
      });
    }

    if (hasToggledAudio && self._inRoom) {
      setTimeout(function () {
        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.MUTE_AUDIO,
          mid: self._user.sid,
          rid: self._room.id,
          muted: self._streamsMutedSettings.audioMuted,
          stamp: (new Date()).getTime()
        });
      }, hasToggledVideo ? 1050 : 0);
    }

    if ((streamTracksAvailability.hasVideo && hasToggledVideo) ||
      (streamTracksAvailability.hasAudio && hasToggledAudio)) {

      self._trigger('localMediaMuted', {
        audioMuted: streamTracksAvailability.hasAudio ? self._streamsMutedSettings.audioMuted : true,
        videoMuted: streamTracksAvailability.hasVideo ? self._streamsMutedSettings.videoMuted : true
      });

      if (self._inRoom) {
        self._trigger('streamMuted', self._user.sid, self.getPeerInfo(), true,
          self._streams.screenshare && self._streams.screenshare.stream);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      }
    }
  }
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that unmutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> audio tracks.
 * @method enableAudio
 * @deprecated true
 * @example
 *   function unmuteAudio () {
 *     skylinkDemo.enableAudio();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.audioMuted</code> value as <code>false</code> and
 *   <code>options.videoMuted</code> value with current <code>peerInfo.mediaStatus.videoMuted</code> value.
 *   <small>See <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a> for more information.</small></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableAudio = function() {
  this.muteStream({
    audioMuted: false,
    videoMuted: this._streamsMutedSettings.videoMuted
  });
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that mutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> audio tracks.
 * @method disableAudio
 * @deprecated true
 * @example
 *   function muteAudio () {
 *     skylinkDemo.disableAudio();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.audioMuted</code> value as <code>true</code> and
 *   <code>options.videoMuted</code> value with current <code>peerInfo.mediaStatus.videoMuted</code> value.
 *   <small>See <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a> for more information.</small></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableAudio = function() {
  this.muteStream({
    audioMuted: true,
    videoMuted: this._streamsMutedSettings.videoMuted
  });
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that unmutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> video tracks.
 * @method enableVideo
 * @deprecated true
 * @example
 *   function unmuteVideo () {
 *     skylinkDemo.enableVideo();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.videoMuted</code> value as <code>false</code> and
 *   <code>options.audioMuted</code> value with current <code>peerInfo.mediaStatus.audioMuted</code> value.
 *   <small>See <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a> for more information.</small></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableVideo = function() {
  this.muteStream({
    videoMuted: false,
    audioMuted: this._streamsMutedSettings.audioMuted
  });
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that mutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> video tracks.
 * @method disableVideo
 * @deprecated true
 * @example
 *   function muteVideo () {
 *     skylinkDemo.disableVideo();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.videoMuted</code> value as <code>true</code> and
 *   <code>options.audioMuted</code> value with current <code>peerInfo.mediaStatus.audioMuted</code> value.
 *   <small>See <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a> for more information.</small></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableVideo = function() {
  this.muteStream({
    videoMuted: true,
    audioMuted: this._streamsMutedSettings.audioMuted
  });
};

/**
 * Function that retrieves screensharing Stream.
 * @method shareScreen
 * @param {JSON} [enableAudio=false] The flag if audio tracks should be retrieved.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggering <code>isScreensharing</code> parameter payload value
 *   as <code>true</code> for request success when User is not in the Room or is in Room without Peers,
 *   or by the <a href="#event_peerRestart"><code>peerRestart</code> event</a> triggering
 *   <code>isSelfInitiateRestart</code> parameter payload value as <code>true</code> for all connected Peers
 *   for request success when User is in Room with Peers.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>shareScreen()</code> error when retrieving screensharing Stream.</small>
 * @param {MediaStream} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the screensharing Stream object.</small>
 * @example
 *   // Example 1: Share screen with audio
 *   skylinkDemo.shareScreen(function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 *
 *   // Example 2: Share screen without audio
 *   skylinkDemo.shareScreen(false, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>Retrieves screensharing Stream. <ol><li>If retrieval was successful: <ol><li>If browser is Firefox: <ol>
 *   <li>If there are missing audio or video tracks requested: <ol>
 *   <li>If there is any previous <code>shareScreen()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.</li></ol></li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code>
 *   value as <code>true</code> and <code>isAudioFallback</code> value as <code>false</code>.</li></ol></li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li><li>Else: <ol>
 *   <li>If audio is requested: <small>Chrome, Safari and IE currently doesn't support retrieval of
 *   audio track together with screensharing video track.</small> <ol><li>Retrieves audio Stream: <ol>
 *   <li>If retrieval was successful: <ol><li>Attempts to attach screensharing Stream video track to audio Stream. <ol>
 *   <li>If attachment was successful: <ol><li><a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggers parameter payload <code>isScreensharing</code>
 *   value as <code>true</code> and <code>isAudioFallback</code> value as <code>false</code>.</li></ol></li><li>Else: <ol>
 *   <li>If there is any previous <code>shareScreen()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.</li></ol></li> 
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code> value as <code>true</code> and
 *   <code>isAudioFallback</code> value as <code>false</code>.</li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li>If there is any previous <code>shareScreen()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.</li></ol></li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code>
 *   value as <code>true</code> and <code>isAudioFallback</code> value as <code>false</code>.</li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a>
 *   triggers parameter payload <code>isScreensharing</code> value as <code>true</code>
 *   and <code>isAudioFallback</code> value as <code>false</code>.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_mediaAccessError"><code>mediaAccessError</code> event</a> triggers parameter payload
 *   <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code> value as
 *   <code>false</code>.</li><li><b>ABORT</b> and return error.</li></ol></li></ol></li><li>If User is in Room: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>stream</code> as <code>shareScreen()</code> Stream.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   <li>Checks if MCU is enabled for App Key provided in <a href="#method_init"><code>init()</code> method</a>. <ol>
 *   <li>If MCU is enabled: <ol><li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>.
 *   <ol><li>If request has errors: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li>If there are connected Peers in the Room: <ol><li>Invoke <a href="#method_refreshConnection">
 *   <code>refreshConnection()</code> method</a>. <ol><li>If request has errors: <ol><li><b>ABORT</b> and return error.</li>
 *   </ol></li></ol></li></ol></li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype.shareScreen = function (enableAudio, callback) {
  var self = this;

  if (typeof enableAudio === 'function') {
    callback = enableAudio;
    enableAudio = true;
  }

  if (typeof enableAudio !== 'boolean') {
    enableAudio = true;
  }

  var throttleFn = function (fn, wait) {
    if (!self._timestamp.func){
      //First time run, need to force timestamp to skip condition
      self._timestamp.func = self._timestamp.now - wait;
    }
    var now = Date.now();

    if (!self._timestamp.screen) {
      if (now - self._timestamp.func < wait) {
        return;
      }
    }
    fn();
    self._timestamp.screen = false;
    self._timestamp.func = now;
  };

  throttleFn(function () {
    var settings = {
      settings: {
        audio: enableAudio,
        video: {
          screenshare: true
        }
      },
      getUserMediaSettings: {
        video: {
          mediaSource: 'window'
        }
      }
    };

    var mediaAccessSuccessFn = function (stream) {
      self.off('mediaAccessError', mediaAccessErrorFn);

      if (self._inRoom) {
        self._trigger('incomingStream', self._user.sid, stream, true, self.getPeerInfo());
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);

        if (Object.keys(self._peerConnections).length > 0 || self._hasMCU) {
          self._refreshPeerConnection(Object.keys(self._peerConnections), false, function (err, success) {
            if (err) {
              log.error('Failed refreshing connections for shareScreen() ->', err);
              if (typeof callback === 'function') {
                callback(new Error('Failed refreshing connections.'), null);
              }
              return;
            }
            if (typeof callback === 'function') {
              callback(null, stream);
            }
          });
        } else if (typeof callback === 'function') {
          callback(null, stream);
        }
      } else if (typeof callback === 'function') {
        callback(null, stream);
      }
    };

    var mediaAccessErrorFn = function (error) {
      self.off('mediaAccessSuccess', mediaAccessSuccessFn);

      if (typeof callback === 'function') {
        callback(error, null);
      }
    };

    self.once('mediaAccessSuccess', mediaAccessSuccessFn, function (stream, isScreensharing) {
      return isScreensharing;
    });

    self.once('mediaAccessError', mediaAccessErrorFn, function (error, isScreensharing) {
      return isScreensharing;
    });

    try {
      if (enableAudio && window.webrtcDetectedBrowser === 'firefox') {
        settings.getUserMediaSettings.audio = true;
      }

      navigator.getUserMedia(settings.getUserMediaSettings, function (stream) {
        if (window.webrtcDetectedBrowser === 'firefox' || !enableAudio) {
          self._onStreamAccessSuccess(stream, settings, true, false);
          return;
        }

        navigator.getUserMedia({
          audio: true

        }, function (audioStream) {
          try {
            audioStream.addTrack(stream.getVideoTracks()[0]);

            self.once('mediaAccessSuccess', function () {
              self._streams.screenshare.streamClone = stream;
            }, function (stream, isScreensharing) {
              return isScreensharing;
            });

            self._onStreamAccessSuccess(audioStream, settings, true, false);

          } catch (error) {
            log.error('Failed retrieving audio stream for screensharing stream', error);
            self._onStreamAccessSuccess(stream, settings, true, false);
          }
        }, function (error) {
          log.error('Failed retrieving audio stream for screensharing stream', error);
          self._onStreamAccessSuccess(stream, settings, true, false);
        });

      }, function (error) {
        self._onStreamAccessError(error, settings, true, false);
      });

    } catch (error) {
      self._onStreamAccessError(error, settings, true, false);
    }

  }, 10000);
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that stops <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.
 * @method stopScreen
 * @example
 *   function stopScreen () {
 *     skylinkDemo.stopScreen();
 *   }
 *
 *   skylinkDemo.shareScreen();
 * @trigger <ol class="desc-seq">
 *   <li>Checks if there is <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>. <ol>
 *   <li>If there is <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>: <ol>
 *   <li>Stop <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> Stream. <ol>
 *   <li><a href="#event_mediaAccessStopped"><code>mediaAccessStopped</code> event</a>
 *   triggers parameter payload <code>isScreensharing</code> value as <code>true</code> and
 *   <code>isAudioFallback</code> value as <code>false</code>.</li><li>If User is in Room: <ol>
 *   <li><a href="#event_streamEnded"><code>streamEnded</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>isScreensharing</code> value as <code>true</code>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   </ol></li></ol></li><li>If User is in Room: <small><b>SKIP</b> this step if <code>stopScreen()</code>
 *   was invoked from <a href="#method_shareScreen"><code>shareScreen()</code> method</a>.</small> <ol>
 *   <li>If there is <a href="#method_getUserMedia"> <code>getUserMedia()</code>Stream</a> Stream: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>stream</code> as
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li></ol></li>
 *   <li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>.</li>
 *   </ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype.stopScreen = function () {
  if (this._streams.screenshare) {
    this._stopStreams({
      screenshare: true
    });

    if (this._inRoom) {
      if (this._streams.userMedia && this._streams.userMedia.stream) {
        this._trigger('incomingStream', this._user.sid, this._streams.userMedia.stream, true, this.getPeerInfo());
        this._trigger('peerUpdated', this._user.sid, this.getPeerInfo(), true);
      }
      this._refreshPeerConnection(Object.keys(this._peerConnections), false);
    }
  }
};

/**
 * Function that handles the muting of Stream audio and video tracks.
 * @method _muteStreams
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._muteStreams = function () {
  var self = this;
  var hasVideo = false;
  var hasAudio = false;

  var muteFn = function (stream) {
    var audioTracks = stream.getAudioTracks();
    var videoTracks = stream.getVideoTracks();

    for (var a = 0; a < audioTracks.length; a++) {
      audioTracks[a].enabled = !self._streamsMutedSettings.audioMuted;
      hasAudio = true;
    }

    for (var v = 0; v < videoTracks.length; v++) {
      videoTracks[v].enabled = !self._streamsMutedSettings.videoMuted;
      hasVideo = true;
    }
  };

  if (self._streams.userMedia && self._streams.userMedia.stream) {
    muteFn(self._streams.userMedia.stream);
  }

  if (self._streams.screenshare && self._streams.screenshare.stream) {
    muteFn(self._streams.screenshare.stream);
  }

  if (self._streams.screenshare && self._streams.screenshare.streamClone) {
    muteFn(self._streams.screenshare.streamClone);
  }

  log.debug('Updated Streams muted status ->', self._streamsMutedSettings);

  return {
    hasVideo: hasVideo,
    hasAudio: hasAudio
  };
};

/**
 * Function that handles stopping the Stream streaming.
 * @method _stopStreams
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._stopStreams = function (options) {
  var self = this;
  var stopFn = function (stream) {
    var streamId = stream.id || stream.label;
    log.debug([null, 'MediaStream', streamId, 'Stopping Stream ->'], stream);

    try {
      var audioTracks = stream.getAudioTracks();
      var videoTracks = stream.getVideoTracks();

      for (var a = 0; a < audioTracks.length; a++) {
        audioTracks[a].stop();
      }

      for (var v = 0; v < videoTracks.length; v++) {
        videoTracks[v].stop();
      }

    } catch (error) {
      stream.stop();
    }

    if (self._streamsStoppedCbs[streamId]) {
      self._streamsStoppedCbs[streamId]();
    }
  };

  var stopUserMedia = false;
  var stopScreenshare = false;
  var hasStoppedMedia = false;

  if (typeof options === 'object') {
    stopUserMedia = options.userMedia === true;
    stopScreenshare = options.screenshare === true;
  }

  if (stopUserMedia && self._streams.userMedia) {
    if (self._streams.userMedia.stream) {
      stopFn(self._streams.userMedia.stream);
    }

    self._streams.userMedia = null;
    hasStoppedMedia = true;
  }

  if (stopScreenshare && self._streams.screenshare) {
    if (self._streams.screenshare.streamClone) {
      stopFn(self._streams.screenshare.streamClone);
    }

    if (self._streams.screenshare.stream) {
      stopFn(self._streams.screenshare.stream);
    }

    self._streams.screenshare = null;
    hasStoppedMedia = true;
  }

  if (self._inRoom && hasStoppedMedia) {
    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
  }

  log.log('Stopping Streams with settings ->', options);
};

/**
 * Function that parses the <code>getUserMedia()</code> settings provided.
 * @method _parseStreamSettings
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._parseStreamSettings = function(options) {
  var settings = {
    settings: { audio: false, video: false },
    mutedSettings: { shouldAudioMuted: false, shouldVideoMuted: false },
    getUserMediaSettings: { audio: false, video: false }
  };

  if (options.audio) {
    settings.settings.audio = {
      stereo: false,
      exactConstraints: !!options.useExactConstraints
    };
    settings.getUserMediaSettings.audio = {};

    if (typeof options.audio.stereo === 'boolean') {
      settings.settings.audio.stereo = options.audio.stereo;
    }

    if (typeof options.audio.mute === 'boolean') {
      settings.mutedSettings.shouldAudioMuted = options.audio.mute;
    }

    if (Array.isArray(options.audio.optional)) {
      settings.settings.audio.optional = clone(options.audio.optional);
      settings.getUserMediaSettings.audio.optional = clone(options.audio.optional);
    }

    if (options.audio.deviceId && typeof options.audio.deviceId === 'string' &&
      window.webrtcDetectedBrowser !== 'firefox') {
      settings.settings.audio.deviceId = options.audio.deviceId;

      if (options.useExactConstraints) {
        settings.getUserMediaSettings.audio.deviceId = { exact: options.audio.deviceId };

      } else {
        if (!Array.isArray(settings.getUserMediaSettings.audio.optional)) {
          settings.getUserMediaSettings.audio.optional = [];
        }

        settings.getUserMediaSettings.audio.optional.push({
          sourceId: options.audio.deviceId
        });
      }
    }

    // For Edge to work since they do not support the advanced constraints yet
    if (window.webrtcDetectedBrowser === 'edge') {
      settings.getUserMediaSettings.audio = true;
    }
  }

  if (options.video) {
    settings.settings.video = {
      resolution: clone(this.VIDEO_RESOLUTION.VGA),
      screenshare: false,
      exactConstraints: !!options.useExactConstraints
    };
    settings.getUserMediaSettings.video = {};

    if (typeof options.video.mute === 'boolean') {
      settings.mutedSettings.shouldVideoMuted = options.video.mute;
    }

    if (Array.isArray(options.video.optional)) {
      settings.settings.video.optional = clone(options.video.optional);
      settings.getUserMediaSettings.video.optional = clone(options.video.optional);
    }

    if (options.video.deviceId && typeof options.video.deviceId === 'string' &&
      window.webrtcDetectedBrowser !== 'firefox') {
      settings.settings.video.deviceId = options.video.deviceId;

      if (options.useExactConstraints) {
        settings.getUserMediaSettings.video.deviceId = { exact: options.video.deviceId };

      } else {
        if (!Array.isArray(settings.getUserMediaSettings.video.optional)) {
          settings.getUserMediaSettings.video.optional = [];
        }

        settings.getUserMediaSettings.video.optional.push({
          sourceId: options.video.deviceId
        });
      }
    }

    if (options.video.resolution && typeof options.video.resolution === 'object') {
      if (typeof options.video.resolution.width === 'number') {
        settings.settings.video.resolution.width = options.video.resolution.width;
      }
      if (typeof options.video.resolution.height === 'number') {
        settings.settings.video.resolution.height = options.video.resolution.height;
      }
    }

    if (options.useExactConstraints) {
      settings.getUserMediaSettings.video.width = { exact: settings.settings.video.resolution.width };
      settings.getUserMediaSettings.video.height = { exact: settings.settings.video.resolution.height };

      if (typeof options.video.frameRate === 'number') {
        settings.settings.video.frameRate = options.video.frameRate;
        settings.getUserMediaSettings.video.frameRate = { exact: options.video.frameRate };
      }

    } else {
      settings.getUserMediaSettings.video.mandatory = {
        maxWidth: settings.settings.video.resolution.width,
        maxHeight: settings.settings.video.resolution.height
      };

      if (typeof options.video.frameRate === 'number' && ['IE', 'safari'].indexOf(window.webrtcDetectedBrowser) === -1) {
        settings.settings.video.frameRate = options.video.frameRate;
        settings.getUserMediaSettings.video.mandatory.maxFrameRate = options.video.frameRate;
      }
    }

    // For Edge to work since they do not support the advanced constraints yet
    if (window.webrtcDetectedBrowser === 'edge') {
      settings.getUserMediaSettings.video = true;
    }
  }

  return settings;
};

/**
 * Function that handles the native <code>navigator.getUserMedia()</code> API success callback result.
 * @method _onStreamAccessSuccess
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._onStreamAccessSuccess = function(stream, settings, isScreenSharing, isAudioFallback) {
  var self = this;
  var streamId = stream.id || stream.label;

  log.log([null, 'MediaStream', streamId, 'Has access to stream ->'], stream);

  // Stop previous stream
  if (!isScreenSharing && self._streams.userMedia) {
    self._stopStreams({
      userMedia: true,
      screenshare: false
    });

  } else if (isScreenSharing && self._streams.screenshare) {
    self._stopStreams({
      userMedia: false,
      screenshare: true
    });
  }

  self._streamsStoppedCbs[streamId] = function () {
    log.log([null, 'MediaStream', streamId, 'Stream has ended']);

    self._trigger('mediaAccessStopped', !!isScreenSharing, !!isAudioFallback, streamId);

    if (self._inRoom) {
      log.debug([null, 'MediaStream', streamId, 'Sending Stream ended status to Peers']);

      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.STREAM,
        mid: self._user.sid,
        rid: self._room.id,
        cid: self._key,
        sessionType: !!isScreenSharing ? 'screensharing' : 'stream',
        streamId: streamId,
        status: 'ended'
      });

      self._trigger('streamEnded', self._user.sid, self.getPeerInfo(), true, !!isScreenSharing, streamId);

      if (isScreenSharing && self._streams.screenshare && self._streams.screenshare.stream &&
        (self._streams.screenshare.stream.id || self._streams.screenshare.stream.label) === streamId) {
        self._streams.screenshare = null;

      } else if (!isScreenSharing && self._streams.userMedia && self._streams.userMedia.stream &&
        (self._streams.userMedia.stream.id || self._streams.userMedia.stream.label) === streamId) {
        self._streams.userMedia = null;
      }
    }
  };

  // Handle event for Chrome / Opera
  if (['chrome', 'opera'].indexOf(window.webrtcDetectedBrowser) > -1) {
    stream.oninactive = function () {
      if (self._streamsStoppedCbs[streamId]) {
        self._streamsStoppedCbs[streamId]();
      }
    };

  // Handle event for Firefox (use an interval)
  } else if (window.webrtcDetectedBrowser === 'firefox') {
    stream.endedInterval = setInterval(function () {
      if (typeof stream.recordedTime === 'undefined') {
        stream.recordedTime = 0;
      }
      if (stream.recordedTime === stream.currentTime) {
        clearInterval(stream.endedInterval);

        if (self._streamsStoppedCbs[streamId]) {
          self._streamsStoppedCbs[streamId]();
        }

      } else {
        stream.recordedTime = stream.currentTime;
      }
    }, 1000);

  } else {
    stream.onended = function () {
      if (self._streamsStoppedCbs[streamId]) {
        self._streamsStoppedCbs[streamId]();
      }
    };
  }

  if ((settings.settings.audio && stream.getAudioTracks().length === 0) ||
    (settings.settings.video && stream.getVideoTracks().length === 0)) {

    var tracksNotSameError = 'Expected audio tracks length with ' +
      (settings.settings.audio ? '1' : '0') + ' and video tracks length with ' +
      (settings.settings.video ? '1' : '0') + ' but received audio tracks length ' +
      'with ' + stream.getAudioTracks().length + ' and video ' +
      'tracks length with ' + stream.getVideoTracks().length;

    log.warn([null, 'MediaStream', streamId, tracksNotSameError]);

    var requireAudio = !!settings.settings.audio;
    var requireVideo = !!settings.settings.video;

    if (settings.settings.audio && stream.getAudioTracks().length === 0) {
      settings.settings.audio = false;
    }

    if (settings.settings.video && stream.getVideoTracks().length === 0) {
      settings.settings.video = false;
    }

    self._trigger('mediaAccessFallback', {
      error: new Error(tracksNotSameError),
      diff: {
        video: { expected: requireVideo ? 1 : 0, received: stream.getVideoTracks().length },
        audio: { expected: requireAudio ? 1 : 0, received: stream.getAudioTracks().length }
      }
    }, self.MEDIA_ACCESS_FALLBACK_STATE.FALLBACKED, !!isScreenSharing, !!isAudioFallback, streamId);
  }

  self._streams[ isScreenSharing ? 'screenshare' : 'userMedia' ] = {
    stream: stream,
    settings: settings.settings,
    constraints: settings.getUserMediaSettings
  };
  self._muteStreams();
  self._trigger('mediaAccessSuccess', stream, !!isScreenSharing, !!isAudioFallback, streamId);
};

/**
 * Function that handles the native <code>navigator.getUserMedia()</code> API failure callback result.
 * @method _onStreamAccessError
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._onStreamAccessError = function(error, settings, isScreenSharing) {
  var self = this;

  if (!isScreenSharing && settings.settings.audio && settings.settings.video && self._audioFallback) {
    log.debug('Fallbacking to retrieve audio only Stream');

    self._trigger('mediaAccessFallback', {
      error: error,
      diff: null
    }, self.MEDIA_ACCESS_FALLBACK_STATE.FALLBACKING, false, true);

    navigator.getUserMedia({
      audio: true
    }, function (stream) {
      self._onStreamAccessSuccess(stream, settings, false, true);

    }, function (error) {
      log.error('Failed fallbacking to retrieve audio only Stream ->', error);

      self._trigger('mediaAccessError', error, false, true);
      self._trigger('mediaAccessFallback', {
        error: error,
        diff: null
      }, self.MEDIA_ACCESS_FALLBACK_STATE.ERROR, false, true);
    });
    return;
  }

  log.error('Failed retrieving ' + (isScreenSharing ? 'screensharing' : 'camera') + ' Stream ->', error);

  self._trigger('mediaAccessError', error, !!isScreenSharing, false);
};

/**
 * Function that handles the <code>RTCPeerConnection.onaddstream</code> remote MediaStream received.
 * @method _onRemoteStreamAdded
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._onRemoteStreamAdded = function(targetMid, stream, isScreenSharing) {
  var self = this;

  if (!self._peerInformations[targetMid]) {
    log.warn([targetMid, 'MediaStream', stream.id,
      'Received remote stream when peer is not connected. ' +
      'Ignoring stream ->'], stream);
    return;
  }

  /*if (!self._peerInformations[targetMid].settings.audio &&
    !self._peerInformations[targetMid].settings.video && !isScreenSharing) {
    log.log([targetMid, 'MediaStream', stream.id,
      'Receive remote stream but ignoring stream as it is empty ->'
      ], stream);
    return;
  }*/
  log.log([targetMid, 'MediaStream', stream.id, 'Received remote stream ->'], stream);

  if (isScreenSharing) {
    log.log([targetMid, 'MediaStream', stream.id, 'Peer is having a screensharing session with user']);
  }

  self._trigger('incomingStream', targetMid, stream, false, self.getPeerInfo(targetMid));
  self._trigger('peerUpdated', targetMid, self.getPeerInfo(targetMid), false);
};

/**
 * Function that sets User's Stream to send to Peer connection.
 * Priority for <code>shareScreen()</code> Stream over <code>getUserMedia()</code> Stream.
 * @method _addLocalMediaStreams
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addLocalMediaStreams = function(peerId) {
  var self = this;

  // NOTE ALEX: here we could do something smarter
  // a mediastream is mainly a container, most of the info
  // are attached to the tracks. We should iterates over track and print
  try {
    log.log([peerId, null, null, 'Adding local stream']);

    var pc = self._peerConnections[peerId];

    if (pc) {
      if (pc.signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
        // Updates the streams accordingly
        var updateStreamFn = function (updatedStream) {
          var hasStream = false;

          // remove streams
          var streams = pc.getLocalStreams();
          for (var i = 0; i < streams.length; i++) {
            if (updatedStream !== null && streams[i].id === updatedStream.id) {
              hasStream = true;
              continue;
            }
            // try removeStream
            pc.removeStream(streams[i]);
          }

          if (updatedStream !== null && !hasStream) {
            pc.addStream(updatedStream);
          }
        };

        if (self._streams.screenshare && self._streams.screenshare.stream) {
          log.debug([peerId, 'MediaStream', null, 'Sending screen'], self._streams.screenshare.stream);

          updateStreamFn(self._streams.screenshare.stream);

        } else if (self._streams.userMedia && self._streams.userMedia.stream) {
          log.debug([peerId, 'MediaStream', null, 'Sending stream'], self._streams.userMedia.stream);

          updateStreamFn(self._streams.userMedia.stream);

        } else {
          log.warn([peerId, 'MediaStream', null, 'No media to send. Will be only receiving']);

          updateStreamFn(null);
        }

      } else {
        log.warn([peerId, 'MediaStream', null,
          'Not adding any stream as signalingState is closed']);
      }
    } else {
      log.warn([peerId, 'MediaStream', self._mediaStream,
        'Not adding stream as peerconnection object does not exists']);
    }
  } catch (error) {
    if ((error.message || '').indexOf('already added') > -1) {
      log.warn([peerId, null, null, 'Not re-adding stream as LocalMediaStream is already added'], error);
    } else {
      // Fix errors thrown like NS_ERROR_UNEXPECTED
      log.error([peerId, null, null, 'Failed adding local stream'], error);
    }
  }

  setTimeout(function () {
    var streamId = null;

    if (self._streams.screenshare && self._streams.screenshare.stream) {
      streamId = self._streams.screenshare.stream.id || self._streams.screenshare.stream.label;
    } else if (self._streams.userMedia && self._streams.userMedia.stream) {
      streamId = self._streams.userMedia.stream.id || self._streams.userMedia.stream.label;
    }

    if (self._inRoom) {
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.STREAM,
        mid: self._user.sid,
        rid: self._room.id,
        cid: self._key,
        sessionType: self._streams.screenshare && self._streams.screenshare.stream ? 'screensharing' : 'stream',
        streamId: streamId,
        status: 'check'
      });
    }
  }, 3500);
};
Skylink.prototype._selectedAudioCodec = 'auto';

/**
 * Stores the preferred sending Peer connection streaming video codec.
 * @attribute _selectedVideoCodec
 * @type String
 * @default "auto"
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._selectedVideoCodec = 'auto';

/**
 * Function that modifies the SessionDescription string to enable OPUS stereo.
 * @method _addSDPStereo
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._addSDPStereo = function(sdpLines) {
  var opusRtmpLineIndex = 0;
  var opusLineFound = false;
  var opusPayload = 0;
  var fmtpLineFound = false;

  var i, j;
  var line;

  for (i = 0; i < sdpLines.length; i += 1) {
    line = sdpLines[i];

    if (line.indexOf('a=rtpmap:') === 0) {
      var parts = line.split(' ');

      if (parts[1].indexOf('opus/48000/') === 0) {
        opusLineFound = true;
        opusPayload = parts[0].split(':')[1];
        opusRtmpLineIndex = i;
        break;
      }
    }
  }

  // if found
  if (opusLineFound) {
    log.debug([null, 'SDP', null, 'OPUS line is found. Enabling stereo']);

    // loop for fmtp payload
    for (j = 0; j < sdpLines.length; j += 1) {
      line = sdpLines[j];

      if (line.indexOf('a=fmtp:' + opusPayload) === 0) {
        fmtpLineFound = true;
        sdpLines[j] += '; stereo=1';
        break;
      }
    }

    // if line doesn't exists for an instance firefox
    if (!fmtpLineFound) {
      sdpLines.splice(opusRtmpLineIndex, 0, 'a=fmtp:' + opusPayload + ' stereo=1');
    }
  }

  return sdpLines;
};

/**
 * Function that modifies the SessionDescription string to set the video resolution.
 * This is not even supported in the specs, and we should re-evalute it to be removed.
 * @method _setSDPVideoResolution
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._setSDPVideoResolution = function(sdpLines){
  var video = this._streams.userMedia && this._streams.userMedia.settings.video;
  var frameRate = video.frameRate || 50;
  var resolution = {
    width: 320,
    height: 50
  }; //video.resolution || {};

  var videoLineFound = false;
  var videoLineIndex = 0;
  var fmtpPayloads = [];

  var i, j, k;
  var line;

  var sdpLineData = 'max-fr=' + frameRate +
    '; max-recv-width=320' + //(resolution.width ? resolution.width : 640) +
    '; max-recv-height=160'; //+ (resolution.height ? resolution.height : 480);

  for (i = 0; i < sdpLines.length; i += 1) {
    line = sdpLines[i];

    if (line.indexOf('a=video') === 0 || line.indexOf('m=video') === 0) {
      videoLineFound = true;
      videoLineIndex = i;
      fmtpPayloads = line.split(' ');
      fmtpPayloads.splice(0, 3);
      break;
    }
  }

  if (videoLineFound) {
    // loop for every video codec
    // ignore if not vp8 or h264
    for (j = 0; j < fmtpPayloads.length; j += 1) {
      var payload = fmtpPayloads[j];
      var rtpmapLineIndex = 0;
      var fmtpLineIndex = 0;
      var fmtpLineFound = false;
      var ignore = false;

      for (k = 0; k < sdpLines.length; k += 1) {
       line = sdpLines[k];

        if (line.indexOf('a=rtpmap:' + payload) === 0) {
          // for non h264 or vp8 codec, ignore. these are experimental codecs
          // that may not exists afterwards
          if (!(line.indexOf('VP8') > 0 || line.indexOf('H264') > 0)) {
            ignore = true;
            break;
          }
          rtpmapLineIndex = k;
        }

        if (line.indexOf('a=fmtp:' + payload) === 0) {
          fmtpLineFound = true;
          fmtpLineIndex = k;
        }
      }

      if (ignore) {
        continue;
      }

      if (fmtpLineFound) {
        sdpLines[fmtpLineIndex] += ';' + sdpLineData;

      } else {
        sdpLines.splice(rtpmapLineIndex + 1, 0, 'a=fmtp:' + payload + ' ' + sdpLineData);
      }
    }

    log.debug([null, 'SDP', null, 'Setting video resolution (broken)']);
  }
  return sdpLines;
};

/**
 * Function that modifies the SessionDescription string to set the sending bandwidth.
 * Setting this may not necessarily work in Firefox.
 * @method _setSDPBitrate
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._setSDPBitrate = function(sdpLines, settings) {
  // Find if user has audioStream
  var bandwidth = this._streamsBandwidthSettings;

  // Prevent setting of bandwidth audio if not configured
  if (typeof bandwidth.audio === 'number' && bandwidth.audio > 0) {
    var hasSetAudio = false;

    for (var i = 0; i < sdpLines.length; i += 1) {
      // set the audio bandwidth
      if (sdpLines[i].indexOf('m=audio') === 0) {
      //if (sdpLines[i].indexOf('a=audio') === 0 || sdpLines[i].indexOf('m=audio') === 0) {
        sdpLines.splice(i + 1, 0, window.webrtcDetectedBrowser === 'firefox' ?
          'b=TIAS:' + (bandwidth.audio * 1024) : 'b=AS:' + bandwidth.audio);

        log.info([null, 'SDP', null, 'Setting maximum sending audio bandwidth bitrate @(index:' + i + ') -> '], bandwidth.audio);
        hasSetAudio = true;
        break;
      }
    }

    if (!hasSetAudio) {
      log.warn([null, 'SDP', null, 'Not setting maximum sending audio bandwidth bitrate as m=audio line is not found']);
    }
  } else {
    log.warn([null, 'SDP', null, 'Not setting maximum sending audio bandwidth bitrate and leaving to browser\'s defaults']);
  }

  // Prevent setting of bandwidth video if not configured
  if (typeof bandwidth.video === 'number' && bandwidth.video > 0) {
    var hasSetVideo = false;

    for (var j = 0; j < sdpLines.length; j += 1) {
      // set the video bandwidth
      if (sdpLines[j].indexOf('m=video') === 0) {
      //if (sdpLines[j].indexOf('a=video') === 0 || sdpLines[j].indexOf('m=video') === 0) {
        sdpLines.splice(j + 1, 0, window.webrtcDetectedBrowser === 'firefox' ?
          'b=TIAS:' + (bandwidth.video * 1024) : 'b=AS:' + bandwidth.video);

        log.info([null, 'SDP', null, 'Setting maximum sending video bandwidth bitrate @(index:' + j + ') -> '], bandwidth.video);
        hasSetVideo = true;
        break;
      }
    }

    if (!hasSetVideo) {
      log.warn([null, 'SDP', null, 'Not setting maximum sending video bandwidth bitrate as m=video line is not found']);
    }
  } else {
    log.warn([null, 'SDP', null, 'Not setting maximum sending video bandwidth bitrate and leaving to browser\'s defaults']);
  }

  // Prevent setting of bandwidth data if not configured
  if (typeof bandwidth.data === 'number' && bandwidth.data > 0) {
    var hasSetData = false;

    for (var k = 0; k < sdpLines.length; k += 1) {
      // set the data bandwidth
      if (sdpLines[k].indexOf('m=application') === 0) {
      //if (sdpLines[k].indexOf('a=application') === 0 || sdpLines[k].indexOf('m=application') === 0) {
        sdpLines.splice(k + 1, 0, window.webrtcDetectedBrowser === 'firefox' ?
          'b=TIAS:' + (bandwidth.data * 1024) : 'b=AS:' + bandwidth.data);

        log.info([null, 'SDP', null, 'Setting maximum sending data bandwidth bitrate @(index:' + k + ') -> '], bandwidth.data);
        hasSetData = true;
        break;
      }
    }

    if (!hasSetData) {
      log.warn([null, 'SDP', null, 'Not setting maximum sending data bandwidth bitrate as m=application line is not found']);
    }
  } else {
    log.warn([null, 'SDP', null, 'Not setting maximum sending data bandwidth bitrate and leaving to browser\'s defaults']);
  }

  return sdpLines;
};

/**
 * Function that modifies the SessionDescription string to set the preferred sending video codec.
 * @method _setSDPVideoCodec
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setSDPVideoCodec = function(sdpLines) {
  log.log('Setting video codec', this._selectedVideoCodec);
  var codecFound = false;
  var payload = 0;

  var i, j;
  var line;

  for (i = 0; i < sdpLines.length; i += 1) {
    line = sdpLines[i];

    if (line.indexOf('a=rtpmap:') === 0) {
      if (line.indexOf(this._selectedVideoCodec) > 0) {
        codecFound = true;
        payload = line.split(':')[1].split(' ')[0];
        break;
      }
    }
  }

  if (codecFound) {
    for (j = 0; j < sdpLines.length; j += 1) {
      line = sdpLines[j];

      if (line.indexOf('m=video') === 0 || line.indexOf('a=video') === 0) {
        var parts = line.split(' ');
        var payloads = line.split(' ');
        payloads.splice(0, 3);

        var selectedPayloadIndex = payloads.indexOf(payload);

        if (selectedPayloadIndex === -1) {
          payloads.splice(0, 0, payload);
        } else {
          var first = payloads[0];
          payloads[0] = payload;
          payloads[selectedPayloadIndex] = first;
        }
        sdpLines[j] = parts[0] + ' ' + parts[1] + ' ' + parts[2] + ' ' + payloads.join(' ');
        break;
      }
    }
  }
  return sdpLines;
};

/**
 * Function that modifies the SessionDescription string to set the preferred sending audio codec.
 * @method _setSDPAudioCodec
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setSDPAudioCodec = function(sdpLines) {
  log.log('Setting audio codec', this._selectedAudioCodec);
  var codecFound = false;
  var payload = 0;

  var i, j;
  var line;

  for (i = 0; i < sdpLines.length; i += 1) {
    line = sdpLines[i];

    if (line.indexOf('a=rtpmap:') === 0) {
      if (line.indexOf(this._selectedAudioCodec) > 0) {
        codecFound = true;
        payload = line.split(':')[1].split(' ')[0];
      }
    }
  }

  if (codecFound) {
    for (j = 0; j < sdpLines.length; j += 1) {
      line = sdpLines[j];

      if (line.indexOf('m=audio') === 0 || line.indexOf('a=audio') === 0) {
        var parts = line.split(' ');
        var payloads = line.split(' ');
        payloads.splice(0, 3);

        var selectedPayloadIndex = payloads.indexOf(payload);

        if (selectedPayloadIndex === -1) {
          payloads.splice(0, 0, payload);
        } else {
          var first = payloads[0];
          payloads[0] = payload;
          payloads[selectedPayloadIndex] = first;
        }
        sdpLines[j] = parts[0] + ' ' + parts[1] + ' ' + parts[2] + ' ' + payloads.join(' ');
        break;
      }
    }
  }
  return sdpLines;
};

/**
 * Function that modifies the SessionDescription string to remove the experimental H264 Firefox flag
 *   that is breaking connections.
 * To evaluate removal of this change once we roll out H264 codec interop.
 * @method _removeSDPFirefoxH264Pref
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._removeSDPFirefoxH264Pref = function(sdpLines) {
  var invalidLineIndex = sdpLines.indexOf(
    'a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1');
  if (invalidLineIndex > -1) {
    log.debug([null, 'SDP', null, 'Firefox H264 invalid pref found:'], invalidLineIndex);
    sdpLines.splice(invalidLineIndex, 1);
  }
  return sdpLines;
};

/**
 * Function that modifies the SessionDescription string to set with the correct MediaStream ID and
 *   MediaStreamTrack IDs that is not provided from Firefox connection to Chromium connection.
 * @method _addSDPSsrcFirefoxAnswer
 * @private
 * @for Skylink
 * @since 0.6.6
 */
Skylink.prototype._addSDPSsrcFirefoxAnswer = function (targetMid, sdp) {
  var self = this;
  var agent = self.getPeerInfo(targetMid).agent;

  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.error([targetMid, 'RTCSessionDesription', 'answer', 'Peer connection object ' +
      'not found. Unable to parse answer session description for peer']);
    return;
  }

  var updatedSdp = sdp;

  // for this case, this is because firefox uses Unified Plan and Chrome uses
  // Plan B. we have to remodify this a bit to let the non-ff detect as new mediastream
  // as chrome/opera/safari detects it as default due to missing ssrc specified as used in plan B.
  if (window.webrtcDetectedBrowser === 'firefox' && agent.name !== 'firefox' &&
    //pc.remoteDescription.sdp.indexOf('a=msid-semantic: WMS *') === -1 &&
    updatedSdp.indexOf('a=msid-semantic:WMS *') > 0) {
    // start parsing
    var sdpLines = updatedSdp.split('\r\n');
    var streamId = '';
    var replaceSSRCSemantic = -1;
    var i;
    var trackId = '';

    var parseTracksSSRC = function (track) {
      for (i = 0, trackId = ''; i < sdpLines.length; i++) {
        if (!!trackId) {
          if (sdpLines[i].indexOf('a=ssrc:') === 0) {
            var ssrcId = sdpLines[i].split(':')[1].split(' ')[0];
            sdpLines.splice(i+1, 0, 'a=ssrc:' + ssrcId +  ' msid:' + streamId + ' ' + trackId,
              'a=ssrc:' + ssrcId + ' mslabel:default',
              'a=ssrc:' + ssrcId + ' label:' + trackId);
            break;
          } else if (sdpLines[i].indexOf('a=mid:') === 0) {
            break;
          }
        } else if (sdpLines[i].indexOf('a=msid:') === 0) {
          if (i > 0 && sdpLines[i-1].indexOf('a=mid:' + track) === 0) {
            var parts = sdpLines[i].split(':')[1].split(' ');

            streamId = parts[0];
            trackId = parts[1];
            replaceSSRCSemantic = true;
          }
        }
      }
    };

    parseTracksSSRC('video');
    parseTracksSSRC('audio');

    /*if (replaceSSRCSemantic) {
      for (i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].indexOf('a=msid-semantic:WMS ') === 0) {
          var parts = sdpLines[i].split(' ');
          parts[parts.length - 1] = streamId;
          sdpLines[i] = parts.join(' ');
          break;
        }
      }

    }*/
    updatedSdp = sdpLines.join('\r\n');

    log.debug([targetMid, 'RTCSessionDesription', 'answer', 'Parsed remote description from firefox'], sdpLines);
  }

  return updatedSdp;
};
this.Skylink = Skylink;
window.Skylink = Skylink;
}).call(this);
