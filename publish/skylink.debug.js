/*! skylinkjs - v0.6.31 - Wed Apr 18 2018 15:58:40 GMT+0800 (+08) */

(function(globals) {

'use strict';

/* jshint ignore:start */
// Object.keys() polyfill - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
!function(){Object.keys||(Object.keys=function(){var t=Object.prototype.hasOwnProperty,r=!{toString:null}.propertyIsEnumerable("toString"),e=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],o=e.length;return function(n){if("object"!=typeof n&&"function"!=typeof n||null===n)throw new TypeError("Object.keys called on non-object");var c=[];for(var l in n)t.call(n,l)&&c.push(l);if(r)for(var p=0;o>p;p++)t.call(n,e[p])&&c.push(e[p]);return c}}())}();
// Date.getISOString() polyfill - https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
!function(){function t(t){return 10>t?"0"+t:t}Date.prototype.toISOString=function(){return this.getUTCFullYear()+"-"+t(this.getUTCMonth()+1)+"-"+t(this.getUTCDate())+"T"+t(this.getUTCHours())+":"+t(this.getUTCMinutes())+":"+t(this.getUTCSeconds())+"."+(this.getUTCMilliseconds()/1e3).toFixed(3).slice(2,5)+"Z"}}();
// Date.now() polyfill
!function(){"function"!=typeof Date.now&&(Date.now=function(){return(new Date).getTime()})}();
// addEventListener() polyfill - https://gist.github.com/eirikbacker/2864711
!function(e,t){function n(e){var n=t[e];t[e]=function(e){return o(n(e))}}function a(t,n,a){return(a=this).attachEvent("on"+t,function(t){var t=t||e.event;t.preventDefault=t.preventDefault||function(){t.returnValue=!1},t.stopPropagation=t.stopPropagation||function(){t.cancelBubble=!0},n.call(a,t)})}function o(e,t){if(t=e.length)for(;t--;)e[t].addEventListener=a;else e.addEventListener=a;return e}e.addEventListener||(o([t,e]),"Element"in e?e.Element.prototype.addEventListener=a:(t.attachEvent("onreadystatechange",function(){o(t.all)}),n("getElementsByTagName"),n("getElementById"),n("createElement"),o(t.all)))}(window,document);
// performance.now() polyfill - https://gist.github.com/paulirish/5438650
!function(){if("performance"in window==0&&(window.performance={}),Date.now=Date.now||function(){return(new Date).getTime()},"now"in window.performance==0){var a=Date.now();performance.timing&&performance.timing.navigationStart&&(a=performance.timing.navigationStart),window.performance.now=function(){return Date.now()-a}}}();
// BlobBuilder polyfill
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
// Array.prototype.forEach polyfill - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
if(!Array.prototype.forEach){Array.prototype.forEach=function(callback){var T,k;if(this==null){throw new TypeError('this is null or not defined');} var O=Object(this);var len=O.length>>>0;if(typeof callback!=='function'){throw new TypeError(callback+' is not a function');} if(arguments.length>1){T=arguments[1];} k=0;while(k<len){var kValue;if(k in O){kValue=O[k];callback.call(T,kValue,k,O);} k++;}};}
/* jshint ignore:end */

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
 * To manage or create App Keys, you may access the [Temasys Console here](https://console.temasys.io).
 *
 * To view the list of supported browsers, visit [the list here](
 * https://github.com/Temasys/SkylinkJS#supported-browsers).
 *
 * Here are some articles to help you get started:
 * - [How to setup a simple video call](https://temasys.io/temasys-rtc-getting-started-web-sdk/)
 * - [How to setup screensharing](https://temasys.io/webrtc-screensharing-temasys-web-sdk/)
 * - [How to create a chatroom like feature](https://temasys.io/building-a-simple-peer-to-peer-webrtc-chat/)
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
 * http://support.temasys.io), asks questions, request features or raise bug tickets as well.
 *
 * If you would like to contribute to our Temasys Web SDK codebase, see [the contributing README](
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
  this._dataChannels = {};

  /**
   * Stores the list of data transfers from / to Peers.
   * @attribute _dataTransfers
   * @param {JSON} #transferId The data transfer session.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._dataTransfers = {};

  /**
   * Stores the list of sending data streaming sessions to Peers.
   * @attribute _dataStreams
   * @param {JSON} #streamId The data stream session.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._dataStreams = {};

  /**
   * Stores the list of buffered ICE candidates that is received before
   *   remote session description is received and set.
   * @attribute _peerCandidatesQueue
   * @param {Array} <#peerId> The list of the Peer connection buffered ICE candidates received.
   * @param {RTCIceCandidate} <#peerId>.<#index> The Peer connection buffered ICE candidate received.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.1
   */
  this._peerCandidatesQueue = {};

  /**
   * Stores the list of ICE candidates received before signaling end.
   * @attribute _peerEndOfCandidatesCounter
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._peerEndOfCandidatesCounter = {};

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
  this._gatheredCandidates = {};

  /**
   * Stores the global number of Peer connection retries that would increase the wait-for-response timeout
   *   for the Peer connection health timer.
   * @attribute _retryCounters
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.10
   */
  this._retryCounters = {};

  /**
   * Stores the list of the Peer connections.
   * @attribute _peerConnections
   * @param {RTCPeerConnection} <#peerId> The Peer connection.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._peerConnections = {};

  /**
   * Stores the list of the Peer connections stats.
   * @attribute _peerStats
   * @param {JSON} <#peerId> The Peer connection stats.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._peerStats = {};

  /**
   * Stores the list of the Peer connections stats.
   * @attribute _peerBandwidth
   * @param {JSON} <#peerId> The Peer connection stats.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._peerBandwidth = {};

  /**
   * Stores the list of the Peer custom configs.
   * @attribute _peerCustomConfigs
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._peerCustomConfigs = {};

  /**
   * Stores the list of Peers session information.
   * @attribute _peerInformations
   * @param {JSON} <#peerId> The Peer session information.
   * @param {JSON|String} <#peerId>.userData The Peer custom data.
   * @param {JSON} <#peerId>.settings The Peer streaming information.
   * @param {JSON} <#peerId>.mediaStatus The Peer streaming muted status.
   * @param {JSON} <#peerId>.agent The Peer agent information.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._peerInformations = {};

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
  this._user = null;

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
  this._userData = '';

  /**
   * Stores the User connection priority weight.
   * If Peer has a higher connection weight, it will do the offer from its Peer connection first.
   * @attribute _peerPriorityWeight
   * @type Number
   * @private
   * @for Skylink
   * @since 0.5.0
   */
  this._peerPriorityWeight = 0;

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
  this._autoIntroduce = true;

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
  this._isPrivileged = false;

  /**
   * Stores the list of Peers retrieved from the Signaling from <code>getPeers()</code> method.
   * @attribute _peerList
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.1
   */
  this._peerList = null;

  /**
   * Stores the current Room name that User is connected to.
   * @attribute _selectedRoom
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._selectedRoom = null;

  /**
   * Stores the flag that indicates if Room is locked.
   * @attribute _roomLocked
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._roomLocked = false;

  /**
   * Stores the flag that indicates if User is connected to the Room.
   * @attribute _inRoom
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.4.0
   */
  this._inRoom = false;

  /**
   * Stores the list of <code>on()</code> event handlers.
   * @attribute _EVENTS
   * @param {Array} <#event> The list of event handlers associated with the event.
   * @param {Function} <#event>.<#index> The event handler function.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._EVENTS = {};

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
  this._onceEvents = {};

  /**
   * Stores the timestamps data used for throttling.
   * @attribute _timestamp
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.8
   */
  this._timestamp = {
    socketMessage: null,
    shareScreen: null,
    refreshConnection: null,
    getUserMedia: null,
    lastRestart: null
  };

  /**
   * Stores the current socket connection information.
   * @attribute _socketSession
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.13
   */
  this._socketSession = {};

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
  this._socketMessageQueue = [];

  /**
   * Stores the <code>setTimeout</code> to sent queued socket messages.
   * @attribute _socketMessageTimeout
   * @type Object
   * @private
   * @for Skylink
   * @since 0.5.8
   */
  this._socketMessageTimeout = null;

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
  this._socketPorts = {
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
  this._channelOpen = false;

  /**
   * Stores the Signaling server url.
   * @attribute _signalingServer
   * @type String
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._signalingServer = null;

  /**
   * Stores the Signaling server protocol.
   * @attribute _signalingServerProtocol
   * @type String
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._signalingServerProtocol = window.location.protocol;

  /**
   * Stores the Signaling server port.
   * @attribute _signalingServerPort
   * @type Number
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._signalingServerPort = null;

  /**
   * Stores the Signaling socket connection object.
   * @attribute _socket
   * @type io
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._socket = null;

  /**
   * Stores the flag that indicates if XDomainRequest is used for IE 8/9.
   * @attribute _socketUseXDR
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._socketUseXDR = false;

  /**
   * Stores the value if ICE restart is supported.
   * @attribute _enableIceRestart
   * @type String
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._enableIceRestart = false;

  /**
   * Stores the flag if MCU environment is enabled.
   * @attribute _hasMCU
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._hasMCU = false;

  /**
   * Stores the construct API REST path to obtain Room credentials.
   * @attribute _path
   * @type String
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._path = null;

  /**
   * Stores the current <code>init()</code> readyState.
   * @attribute _readyState
   * @type Number
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._readyState = null;

  /**
   * Stores the "cid" used for <code>joinRoom()</code>.
   * @attribute _key
   * @type String
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._key = null;

  /**
   * Stores the "apiOwner" used for <code>joinRoom()</code>.
   * @attribute _appKeyOwner
   * @type String
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._appKeyOwner = null;

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
  this._room = null;

  /**
   * Stores the list of Peer messages timestamp.
   * @attribute _peerMessagesStamps
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._peerMessagesStamps = {};

  /**
   * Stores the Streams.
   * @attribute _streams
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streams = {
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
  this._streamsDefaultSettings = {
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
  this._streamsMutedSettings = {
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
  this._streamsBandwidthSettings = {
    googleX: {},
    bAS: {}
  };

  /**
   * Stores all the Stream stopped callbacks.
   * @attribute _streamsStoppedCbs
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streamsStoppedCbs = {};

  /**
   * Stores all the Stream sessions.
   * Defined as <code>false</code> when Stream has already ended.
   * @attribute _streamsSession
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streamsSession = {};

  /**
   * Stores the session description settings.
   * @attribute _sdpSettings
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._sdpSettings = {
    connection: {
      audio: true,
      video: true,
      data: true
    },
    direction: {
      audio: { send: true, receive: true },
      video: { send: true, receive: true }
    }
  };

  /**
   * Stores the publish only settings.
   * @attribute _publishOnly
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._publishOnly = false;

  /**
   * Stores the parent ID.
   * @attribute _parentId
   * @type String
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._parentId = null;

  /**
   * Stores the list of recordings.
   * @attribute _recordings
   * @type JSON
   * @private
   * @beta
   * @for Skylink
   * @since 0.6.16
   */
  this._recordings = {};

  /**
   * Stores the current active recording session ID.
   * There can only be 1 recording session at a time in a Room
   * @attribute _currentRecordingId
   * @type JSON
   * @private
   * @beta
   * @for Skylink
   * @since 0.6.16
   */
  this._currentRecordingId = false;

  /**
   * Stores the recording session timeout to ensure 4 seconds has been recorded.
   * @attribute _recordingStartInterval
   * @type JSON
   * @private
   * @beta
   * @for Skylink
   * @since 0.6.16
   */
  this._recordingStartInterval = null;

  /**
   * Stores the currently supported codecs.
   * @attribute _currentCodecSupport
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._currentCodecSupport = null;

  /**
   * Stores the session description orders and info.
   * @attribute _sdpSessions
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._sdpSessions = {};

  /**
   * Stores the flag if voice activity detection should be enabled.
   * @attribute _voiceActivityDetection
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._voiceActivityDetection = true;

  /**
   * Stores the datachannel binary data chunk type.
   * @attribute _binaryChunkType
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._binaryChunkType = this.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;

  /**
   * Stores the RTCPeerConnection configuration.
   * @attribute _peerConnectionConfig
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._peerConnectionConfig = {};

  /**
   * Stores the auto bandwidth settings.
   * @attribute _bandwidthAdjuster
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._bandwidthAdjuster = null;

  /**
   * Stores the Peer connection status.
   * @attribute _peerConnStatus
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.19
   */
  this._peerConnStatus = {};

  /**
   * Stores the flag to temporarily halt joinRoom() from processing.
   * @attribute _joinRoomManager
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.6.19
   */
  this._joinRoomManager = {
    timestamp: 0,
    socketsFn: []
  };

  /**
   * Stores the `init()` configuration.
   * @attribute _initOptions
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.27
   */
  this._initOptions = {};
  
}
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
 * The list of Datachannel sending message error types.
 * @attribute DATA_CHANNEL_MESSAGE_ERROR
 * @param {String} MESSAGE  <small>Value <code>"message"</code></small>
 *   The value of the Datachannel sending message error type when encountered during
 *   sending P2P message from <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.
 * @param {String} TRANSFER <small>Value <code>"transfer"</code></small>
 *   The value of the Datachannel sending message error type when encountered during
 *   data transfers from <a href="#method_sendURLData"><code>sendURLData()</code> method</a> or
 *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.DATA_CHANNEL_MESSAGE_ERROR = {
  MESSAGE: 'message',
  TRANSFER: 'transfer'
};

/**
 * The list of supported data transfer data types.
 * @attribute DATA_TRANSFER_DATA_TYPE
 * @param {String} BINARY_STRING <small>Value <code>"binaryString"</code></small>
 *   The value of data transfer data type when Blob binary data chunks encoded to Base64 encoded string are
 *   sent or received over the Datachannel connection for the data transfer session.
 *   <small>Used only in <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> when
 *   parameter <code>sendChunksAsBinary</code> value is <code>false</code>.</small>
 * @param {String} ARRAY_BUFFER  <small>Value <code>"arrayBuffer"</code></small>
 *   The value of data transfer data type when ArrayBuffer binary data chunks are
 *   sent or received over the Datachannel connection for the data transfer session.
 *   <small>Used only in <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> when
 *   parameter <code>sendChunksAsBinary</code> value is <code>true</code>.</small>
 * @param {String} BLOB          <small>Value <code>"blob"</code></small>
 *   The value of data transfer data type when Blob binary data chunks are
 *   sent or received over the Datachannel connection for the data transfer session.
 *   <small>Used only in <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> when
 *   parameter <code>sendChunksAsBinary</code> value is <code>true</code>.</small>
 * @param {String} STRING        <small>Value <code>"string"</code></small>
 *   The value of data transfer data type when only string data chunks are
 *   sent or received over the Datachannel connection for the data transfer session.
 *   <small>Used only in <a href="#method_sendURLData"><code>sendURLData()</code> method</a>.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_DATA_TYPE = {
  BINARY_STRING: 'binaryString',
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob',
  STRING: 'string'
};

/**
 * <blockquote class="info">
 *   Note that this is used only for SDK developer purposes.<br>
 *   Current version: <code>0.1.0</code>
 * </blockquote>
 * The value of the current version of the data transfer protocol.
 * @attribute DT_PROTOCOL_VERSION
 * @type String
 * @readOnly
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.DT_PROTOCOL_VERSION = '0.1.3';

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
 *   <a href="#method_acceptDataTransfer"><code>acceptDataTransfer()</code> method</a> invoked by User.</small>
 * @parma {String} USER_UPLOAD_REQUEST <small>Value <code>"userRequest"</code></small>
 *   The value of the state when User sent an upload data transfer request to Peer.
 *   <small>At this stage, the upload data transfer request to Peer may be accepted or rejected with the
 *   <a href="#method_acceptDataTransfer"><code>acceptDataTransfer()</code> method</a> invoked by Peer.</small>
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
 * @param {String} USER_REJECTED      <small>Value <code>"userRejected"</code></small>
 *   The value of the state when User rejected and terminated upload data transfer request from Peer.
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
  DOWNLOAD_COMPLETED: 'downloadCompleted',
  USER_REJECTED: 'userRejected',
  USER_UPLOAD_REQUEST: 'userRequest',
  START_ERROR: 'startError'
};

/**
 * The list of data streaming states.
 * @attribute DATA_STREAM_STATE
 * @param {String} SENDING_STARTED   <small>Value <code>"sendStart"</code></small>
 *   The value of the state when data streaming session has started from User to Peer.
 * @param {String} RECEIVING_STARTED <small>Value <code>"receiveStart"</code></small>
 *   The value of the state when data streaming session has started from Peer to Peer.
 * @param {String} RECEIVED          <small>Value <code>"received"</code></small>
 *   The value of the state when data streaming session data chunk has been received from Peer to User.
 * @param {String} SENT              <small>Value <code>"sent"</code></small>
 *   The value of the state when data streaming session data chunk has been sent from User to Peer.
 * @param {String} SENDING_STOPPED   <small>Value <code>"sendStop"</code></small>
 *   The value of the state when data streaming session has stopped from User to Peer.
 * @param {String} RECEIVING_STOPPED <small>Value <code>"receivingStop"</code></small>
 *   The value of the state when data streaming session has stopped from Peer to User.
 * @param {String} ERROR             <small>Value <code>"error"</code></small>
 *   The value of the state when data streaming session has errors.
 *   <small>At this stage, the data streaming state is considered <code>SENDING_STOPPED</code> or
 *   <code>RECEIVING_STOPPED</code>.</small>
 * @param {String} START_ERROR       <small>Value <code>"startError"</code></small>
 *   The value of the state when data streaming session failed to start from User to Peer.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.DATA_STREAM_STATE = {
  SENDING_STARTED: 'sendStart',
  SENDING_STOPPED: 'sendStop',
  RECEIVING_STARTED: 'receiveStart',
  RECEIVING_STOPPED: 'receiveStop',
  RECEIVED: 'received',
  SENT: 'sent',
  ERROR: 'error',
  START_ERROR: 'startError'
};

/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection ICE gathering states.
 * @attribute CANDIDATE_GENERATION_STATE
 * @param {String} GATHERING <small>Value <code>"gathering"</code></small>
 *   The value of the state when Peer connection is gathering ICE candidates.
 *   <small>These ICE candidates are sent to Peer for its connection to check for a suitable matching
 *   pair of ICE candidates to establish an ICE connection for stream audio, video and data.
 *   See <a href="#event_iceConnectionState"><code>iceConnectionState</code> event</a> for ICE connection status.</small>
 *   <small>This state cannot happen until Peer connection remote <code>"offer"</code> / <code>"answer"</code>
 *   session description is set. See <a href="#event_peerConnectionState">
 *   <code>peerConnectionState</code> event</a> for session description exchanging status.</small>
 * @param {String} COMPLETED <small>Value <code>"completed"</code></small>
 *   The value of the state when Peer connection gathering of ICE candidates has completed.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype.CANDIDATE_GENERATION_STATE = {
  NEW: 'new',
  GATHERING: 'gathering',
  COMPLETED: 'completed'
};

/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection remote ICE candidate processing states for trickle ICE connections.
 * @attribute CANDIDATE_PROCESSING_STATE
 * @param {String} RECEIVED <small>Value <code>"received"</code></small>
 *   The value of the state when the remote ICE candidate was received.
 * @param {String} DROPPED  <small>Value <code>"received"</code></small>
 *   The value of the state when the remote ICE candidate is dropped.
 * @param {String} BUFFERED  <small>Value <code>"buffered"</code></small>
 *   The value of the state when the remote ICE candidate is buffered.
 * @param {String} PROCESSING  <small>Value <code>"processing"</code></small>
 *   The value of the state when the remote ICE candidate is being processed.
 * @param {String} PROCESS_SUCCESS  <small>Value <code>"processSuccess"</code></small>
 *   The value of the state when the remote ICE candidate has been processed successfully.
 *   <small>The ICE candidate that is processed will be used to check against the list of
 *   locally generated ICE candidate to start matching for the suitable pair for the best ICE connection.</small>
 * @param {String} PROCESS_ERROR  <small>Value <code>"processError"</code></small>
 *   The value of the state when the remote ICE candidate has failed to be processed.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.CANDIDATE_PROCESSING_STATE = {
  RECEIVED: 'received',
  DROPPED: 'dropped',
  BUFFERED: 'buffered',
  PROCESSING: 'processing',
  PROCESS_SUCCESS: 'processSuccess',
  PROCESS_ERROR: 'processError'
};

/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection ICE connection states.
 * @attribute ICE_CONNECTION_STATE
 * @param {String} CHECKING       <small>Value <code>"checking"</code></small>
 *   The value of the state when Peer connection is checking for a suitable matching pair of
 *   ICE candidates to establish ICE connection.
 *   <small>Exchanging of ICE candidates happens during <a href="#event_candidateGenerationState">
 *   <code>candidateGenerationState</code> event</a>.</small>
 * @param {String} CONNECTED      <small>Value <code>"connected"</code></small>
 *   The value of the state when Peer connection has found a suitable matching pair of
 *   ICE candidates to establish ICE connection but is still checking for a better
 *   suitable matching pair of ICE candidates for the best ICE connectivity.
 *   <small>At this state, ICE connection is already established and audio, video and
 *   data streaming has already started.</small>
 * @param {String} COMPLETED      <small>Value <code>"completed"</code></small>
 *   The value of the state when Peer connection has found the best suitable matching pair
 *   of ICE candidates to establish ICE connection and checking has stopped.
 *   <small>At this state, ICE connection is already established and audio, video and
 *   data streaming has already started. This may happpen after <code>CONNECTED</code>.</small>
 * @param {String} FAILED         <small>Value <code>"failed"</code></small>
 *   The value of the state when Peer connection ICE connection has failed.
 * @param {String} DISCONNECTED   <small>Value <code>"disconnected"</code></small>
 *   The value of the state when Peer connection ICE connection is disconnected.
 *   <small>At this state, the Peer connection may attempt to revive the ICE connection.
 *   This may happen due to flaky network conditions.</small>
 * @param {String} CLOSED         <small>Value <code>"closed"</code></small>
 *   The value of the state when Peer connection ICE connection has closed.
 *   <small>This happens when Peer connection is closed and no streaming can occur at this stage.</small>
 * @param {String} TRICKLE_FAILED <small>Value <code>"trickeFailed"</code></small>
 *   The value of the state when Peer connection ICE connection has failed during trickle ICE.
 *   <small>Trickle ICE is enabled in <a href="#method_init"><code>init()</code> method</a>
 *   <code>enableIceTrickle</code> option.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
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
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection session description exchanging states.
 * @attribute PEER_CONNECTION_STATE
 * @param {String} STABLE            <small>Value <code>"stable"</code></small>
 *   The value of the state when there is no session description being exchanged between Peer connection.
 * @param {String} HAVE_LOCAL_OFFER  <small>Value <code>"have-local-offer"</code></small>
 *   The value of the state when local <code>"offer"</code> session description is set.
 *   <small>This should transition to <code>STABLE</code> state after remote <code>"answer"</code>
 *   session description is set.</small>
 *   <small>See <a href="#event_handshakeProgress"><code>handshakeProgress</code> event</a> for a more
 *   detailed exchanging of session description states.</small>
 * @param {String} HAVE_REMOTE_OFFER <small>Value <code>"have-remote-offer"</code></small>
 *   The value of the state when remote <code>"offer"</code> session description is set.
 *   <small>This should transition to <code>STABLE</code> state after local <code>"answer"</code>
 *   session description is set.</small>
 *   <small>See <a href="#event_handshakeProgress"><code>handshakeProgress</code> event</a> for a more
 *   detailed exchanging of session description states.</small>
 * @param {String} CLOSED            <small>Value <code>"closed"</code></small>
 *   The value of the state when Peer connection is closed and no session description can be exchanged and set.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.0
 */
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
 * <blockquote class="info">
 *  Learn more about how ICE works in this
 *  <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of available Peer connection bundle policies.
 * @attribute BUNDLE_POLICY
 * @param {String} MAX_COMPAT <small>Value <code>"max-compat"</code></small>
 *   The value of the bundle policy to generate ICE candidates for each media type
 *   so each media type flows through different transports.
 * @param {String} MAX_BUNDLE <small>Value <code>"max-bundle"</code></small>
 *   The value of the bundle policy to generate ICE candidates for one media type
 *   so all media type flows through a single transport.
 * @param {String} BALANCED   <small>Value <code>"balanced"</code></small>
 *   The value of the bundle policy to use <code>MAX_BUNDLE</code> if Peer supports it,
 *   else fallback to <code>MAX_COMPAT</code>.
 * @param {String} NONE       <small>Value <code>"none"</code></small>
 *   The value of the bundle policy to not use any media bundle.
 *   <small>This removes the <code>a=group:BUNDLE</code> line from session descriptions.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.BUNDLE_POLICY = {
  MAX_COMPAT: 'max-compat',
  BALANCED: 'balanced',
  MAX_BUNDLE: 'max-bundle',
  NONE: 'none'
};

/**
 * <blockquote class="info">
 *  Learn more about how ICE works in this
 *  <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of available Peer connection RTCP mux policies.
 * @attribute RTCP_MUX_POLICY
 * @param {String} REQUIRE   <small>Value <code>"require"</code></small>
 *   The value of the RTCP mux policy to generate ICE candidates for RTP only and RTCP shares the same ICE candidates.
 * @param {String} NEGOTIATE <small>Value <code>"negotiate"</code></small>
 *   The value of the RTCP mux policy to generate ICE candidates for both RTP and RTCP each.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.RTCP_MUX_POLICY = {
  REQUIRE: 'require',
  NEGOTIATE: 'negotiate'
};

/**
 * <blockquote class="info">
 *  Learn more about how ICE works in this
 *  <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of available Peer connection certificates cryptographic algorithm to use.
 * @attribute PEER_CERTIFICATE
 * @param {String} RSA   <small>Value <code>"RSA"</code></small>
 *   The value of the Peer connection certificate algorithm to use RSA-1024.
 * @param {String} ECDSA <small>Value <code>"ECDSA"</code></small>
 *   The value of the Peer connection certificate algorithm to use ECDSA.
 * @param {String} AUTO  <small>Value <code>"AUTO"</code></small>
 *   The value of the Peer connection to use the default certificate generated.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.PEER_CERTIFICATE = {
  RSA: 'RSA',
  ECDSA: 'ECDSA',
  AUTO: 'AUTO'
};

/**
 * The list of Peer connection states.
 * @attribute HANDSHAKE_PROGRESS
 * @param {String} ENTER   <small>Value <code>"enter"</code></small>
 *   The value of the connection state when Peer has just entered the Room.
 *   <small>At this stage, <a href="#event_peerJoined"><code>peerJoined</code> event</a>
 *   is triggered.</small>
 * @param {String} WELCOME <small>Value <code>"welcome"</code></small>
 *   The value of the connection state when Peer is aware that User has entered the Room.
 *   <small>At this stage, <a href="#event_peerJoined"><code>peerJoined</code> event</a>
 *   is triggered and Peer connection may commence.</small>
 * @param {String} OFFER   <small>Value <code>"offer"</code></small>
 *   The value of the connection state when Peer connection has set the local / remote <code>"offer"</code>
 *   session description to start streaming connection.
 * @param {String} ANSWER  <small>Value <code>"answer"</code></small>
 *   The value of the connection state when Peer connection has set the local / remote <code>"answer"</code>
 *   session description to establish streaming connection.
 * @param {String} ERROR   <small>Value <code>"error"</code></small>
 *   The value of the connection state when Peer connection has failed to establish streaming connection.
 *   <small>This happens when there are errors that occurs in creating local <code>"offer"</code> /
 *   <code>"answer"</code>, or when setting remote / local <code>"offer"</code> / <code>"answer"</code>.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.HANDSHAKE_PROGRESS = {
  ENTER: 'enter',
  WELCOME: 'welcome',
  OFFER: 'offer',
  ANSWER: 'answer',
  ERROR: 'error'
};

/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled for the App Key
 *   provided in the <a href="#method_init"><code>init()</code> method</a>, as only Users connecting using
 *   the App Key with this flag enabled (which we call privileged Users / Peers) can retrieve the list of
 *   Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.io/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about privileged App Key feature here</a>.
 * </blockquote>
 * The list of <a href="#method_getPeers"><code>getPeers()</code> method</a> retrieval states.
 * @attribute GET_PEERS_STATE
 * @param {String} ENQUIRED <small>Value <code>"enquired"</code></small>
 *   The value of the state when <code>getPeers()</code> is retrieving the list of Peer IDs
 *   from Rooms within the same App space from the Signaling server.
 * @param {String} RECEIVED <small>Value <code>"received"</code></small>
 *   The value of the state when <code>getPeers()</code> has retrieved the list of Peer IDs
 *   from Rooms within the same App space from the Signaling server successfully.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.1
 */
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
 *   <a href="http://support.temasys.io/support/solutions/articles/12000012342-what-is-a-privileged-key-">
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
 * The list of Signaling server reaction states during <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.
 * @attribute SYSTEM_ACTION
 * @param {String} WARNING <small>Value <code>"warning"</code></small>
 *   The value of the state when Room session is about to end.
 * @param {String} REJECT  <small>Value <code>"reject"</code></small>
 *   The value of the state when Room session has failed to start or has ended.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.1
 */
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
 * Contains the current version of Skylink Web SDK.
 * @attribute VERSION
 * @type String
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.VERSION = '0.6.31';

/**
 * The list of <a href="#method_init"><code>init()</code> method</a> ready states.
 * @attribute READY_STATE_CHANGE
 * @param {Number} INIT      <small>Value <code>0</code></small>
 *   The value of the state when <code>init()</code> has just started.
 * @param {Number} LOADING   <small>Value <code>1</code></small>
 *   The value of the state when <code>init()</code> is authenticating App Key provided
 *   (and with credentials if provided as well) with the Auth server.
 * @param {Number} COMPLETED <small>Value <code>2</code></small>
 *   The value of the state when <code>init()</code> has successfully authenticated with the Auth server.
 *   Room session token is generated for joining the <code>defaultRoom</code> provided in <code>init()</code>.
 *   <small>Room session token has to be generated each time User switches to a different Room
 *   in <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.</small>
 * @param {Number} ERROR     <small>Value <code>-1</code></small>
 *   The value of the state when <code>init()</code> has failed authenticating with the Auth server.
 *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
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
 *   <small>To resolve this, contact our <a href="http://support.temasys.io">support portal</a>.</small>
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
 *   <small>See the <a href="http://support.temasys.io/support/solutions/articles/
 * 12000002811-using-the-persistent-room-feature-to-configure-meetings">Persistent Room article</a> to learn more.</small>
 * @param {Number} API_OVER_SEAT_LIMIT         <small>Value <code>4020</code></small>
 *   The value of the failure code when App Key has reached its current concurrent users limit.
 *   <small>To resolve this, use another App Key. To create App Keys dynamically, see the
 *   <a href="https://temasys.atlassian.net/wiki/display/TPD/SkylinkAPI+-+Application+Resources">Application REST API
 *   docs</a> for more information.</small>
 * @param {Number} API_RETRIEVAL_FAILED        <small>Value <code>4021</code></small>
 *   The value of the failure code when App Key retrieval of authentication token fails.
 *   <small>If this happens frequently, contact our <a href="http://support.temasys.io">support portal</a>.</small>
 * @param {Number} API_WRONG_ACCESS_DOMAIN     <small>Value <code>5005</code></small>
 *   The value of the failure code when App Key makes request to the incorrect Auth server.
 *   <small>To resolve this, ensure that the <code>roomServer</code> is not configured. If this persists even without
 *   <code>roomServer</code> configuration, contact our <a href="http://support.temasys.io">support portal</a>.</small>
 * @param {Number} XML_HTTP_REQUEST_ERROR      <small>Value <code>-1</code></small>
 *   The value of the failure code when requesting to Auth server has timed out.
 * @param {Number} XML_HTTP_NO_REPONSE_ERROR      <small>Value <code>-2</code></small>
 *   The value of the failure code when response from Auth server is empty or timed out.   
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
 * @param {Number} PARSE_CODECS                <small>Value <code>8</code></small>
 *   The value of the failure code when codecs support cannot be parsed and retrieved.
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
  XML_HTTP_NO_REPONSE_ERROR: -2,
  NO_SOCKET_IO: 1,
  NO_XMLHTTPREQUEST_SUPPORT: 2,
  NO_WEBRTC_SUPPORT: 3,
  NO_PATH: 4,
  ADAPTER_NO_LOADED: 7,
  PARSE_CODECS: 8
};

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
Skylink.prototype.REGIONAL_SERVER = {
  APAC1: '',
  US1: ''
};

/**
 * The list of User's priority weight schemes for <a href="#method_joinRoom">
 * <code>joinRoom()</code> method</a> connections.
 * @attribute PRIORITY_WEIGHT_SCHEME
 * @param {String} ENFORCE_OFFERER  <small>Value <code>"enforceOfferer"</code></small>
 *   The value of the priority weight scheme to enforce User as the offerer.
 * @param {String} ENFORCE_ANSWERER <small>Value <code>"enforceAnswerer"</code></small>
 *   The value of the priority weight scheme to enforce User as the answerer.
 * @param {String} AUTO             <small>Value <code>"auto"</code></small>
 *   The value of the priority weight scheme to let User be offerer or answerer based on Signaling server selection.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.PRIORITY_WEIGHT_SCHEME = {
  ENFORCE_OFFERER: 'enforceOfferer',
  ENFORCE_ANSWERER: 'enforceAnswerer',
  AUTO: 'auto'
};

/**
 * The list of the SDK <code>console</code> API log levels.
 * @attribute LOG_LEVEL
 * @param {Number} DEBUG <small>Value <code>4</code></small>
 *   The value of the log level that displays <code>console</code> <code>debug</code>,
 *   <code>log</code>, <code>info</code>, <code>warn</code> and <code>error</code> logs.
 * @param {Number} LOG   <small>Value <code>3</code></small>
 *   The value of the log level that displays only <code>console</code> <code>log</code>,
 *   <code>info</code>, <code>warn</code> and <code>error</code> logs.
 * @param {Number} INFO  <small>Value <code>2</code></small>
 *   The value of the log level that displays only <code>console</code> <code>info</code>,
 *   <code>warn</code> and <code>error</code> logs.
 * @param {Number} WARN  <small>Value <code>1</code></small>
 *   The value of the log level that displays only <code>console</code> <code>warn</code>
 *   and <code>error</code> logs.
 * @param {Number} ERROR <small>Value <code>0</code></small>
 *   The value of the log level that displays only <code>console</code> <code>error</code> logs.
 * @param {Number} NONE <small>Value <code>-1</code></small>
 *   The value of the log level that displays no logs.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype.LOG_LEVEL = {
  DEBUG: 4,
  LOG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0,
  NONE: -1
};

/**
 * The list of <a href="#method_joinRoom"><code>joinRoom()</code> method</a> socket connection failure states.
 * @attribute SOCKET_ERROR
 * @param {Number} CONNECTION_FAILED    <small>Value <code>0</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection failed to establish with
 *   the Signaling server at the first attempt.
 * @param {Number} RECONNECTION_FAILED  <small>Value <code>-1</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection failed to establish
 *   the Signaling server after the first attempt.
 * @param {Number} CONNECTION_ABORTED   <small>Value <code>-2</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection will not attempt
 *   to reconnect after the failure of the first attempt in <code>CONNECTION_FAILED</code> as there
 *   are no more ports or transports to attempt for reconnection.
 * @param {Number} RECONNECTION_ABORTED <small>Value <code>-3</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection will not attempt
 *   to reconnect after the failure of several attempts in <code>RECONNECTION_FAILED</code> as there
 *   are no more ports or transports to attempt for reconnection.
 * @param {Number} RECONNECTION_ATTEMPT <small>Value <code>-4</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection is attempting
 *   to reconnect with a new port or transport after the failure of attempts in
 *   <code>CONNECTION_FAILED</code> or <code>RECONNECTED_FAILED</code>.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.6
 */
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
 * @param {String} LONG_POLLING_SSL  <small>Value <code>"fallbackLongPollingSSL"</code></small>
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
 * <blockquote class="info">
 *   Note that this is used only for SDK developer purposes.<br>
 *   Current version: <code>0.1.4</code>
 * </blockquote>
 * The value of the current version of the Signaling socket message protocol.
 * @attribute SM_PROTOCOL_VERSION
 * @type String
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype.SM_PROTOCOL_VERSION = '0.1.2.4';

/**
 * <blockquote class="info">
 *   Note that if the video codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.
 * </blockquote>
 * The list of available video codecs to set as the preferred video codec to use to encode
 * sending video data when available encoded video codec for Peer connections
 * configured in the <a href="#method_init"><code>init()</code> method</a>.
 * @attribute VIDEO_CODEC
 * @param {String} AUTO <small>Value <code>"auto"</code></small>
 *   The value of the option to not prefer any video codec but rather use the created
 *   local <code>"offer"</code> / <code>"answer"</code> session description video codec preference.
 * @param {String} VP8  <small>Value <code>"VP8"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/VP8">VP8</a> video codec.
 * @param {String} VP9  <small>Value <code>"VP9"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/VP9">VP9</a> video codec.
 * @param {String} H264 <small>Value <code>"H264"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/H.264/MPEG-4_AVC">H264</a> video codec.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.VIDEO_CODEC = {
  AUTO: 'auto',
  VP8: 'VP8',
  H264: 'H264',
  VP9: 'VP9'
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
 * @param {String} ILBC <small>Value <code>"ILBC"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/Internet_Low_Bitrate_Codec">iLBC</a> audio codec.
 * @param {String} G722 <small>Value <code>"G722"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/G.722">G722</a> audio codec.
 * @param {String} PCMA <small>Value <code>"PCMA"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/G.711">G711u</a> audio codec.
 * @param {String} PCMU <small>Value <code>"PCMU"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/G.711">G711a</a> audio codec.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.AUDIO_CODEC = {
  AUTO: 'auto',
  ISAC: 'ISAC',
  OPUS: 'opus',
  ILBC: 'ILBC',
  G722: 'G722',
  PCMU: 'PCMU',
  PCMA: 'PCMA',
  //SILK: 'SILK'
};

/**
 * The list of available screensharing media sources configured in the
 * <a href="#method_shareScreen"><code>shareScreen()</code> method</a>.
 * @attribute MEDIA_SOURCE
 * @param {String} SCREEN <small>Value <code>"screen"</code></small>
 *   The value of the option to share entire screen.
 * @param {String} WINDOW <small>Value <code>"window"</code></small>
 *   The value of the option to share application windows.
 * @param {String} TAB <small>Value <code>"tab"</code></small>
 *   The value of the option to share browser tab.
 *   <small>Note that this is only supported by from Chrome 52+ and Opera 39+.</small>
 * @param {String} TAB_AUDIO <small>Value <code>"audio"</code></small>
 *   The value of the option to share browser tab audio.
 *   <small>Note that this is only supported by Chrome 52+ and Opera 39+.</small>
 *   <small><code>options.audio</code> has to be enabled with <code>TAB</code> also requested to enable sharing of tab audio.</small>
 * @param {String} APPLICATION <small>Value <code>"application"</code></small>
 *   The value of the option to share applications.
 *   <small>Note that this is only supported by Firefox currently.</small>
 * @param {String} BROWSER <small>Value <code>"browser"</code></small>
 *   The value of the option to share browser.
 *   <small>Note that this is only supported by Firefox currently, and requires toggling the <code>media.getUserMedia.browser.enabled</code>
 *   in <code>about:config</code>.</small>
 * @param {String} CAMERA <small>Value <code>"camera"</code></small>
 *   The value of the option to share camera.
 *   <small>Note that this is only supported by Firefox currently.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.MEDIA_SOURCE = {
  SCREEN: 'screen',
  WINDOW: 'window',
  TAB: 'tab',
  TAB_AUDIO: 'audio',
  APPLICATION: 'application',
  BROWSER: 'browser',
  CAMERA: 'camera'
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
 * The list of recording states.
 * @attribute RECORDING_STATE
 * @param {Number} START <small>Value <code>0</code></small>
 *   The value of the state when recording session has started.
 * @param {Number} STOP <small>Value <code>1</code></small>
 *   The value of the state when recording session has stopped.<br>
 *   <small>At this stage, the recorded videos will go through the mixin server to compile the videos.</small>
 * @param {Number} LINK <small>Value <code>2</code></small>
 *   The value of the state when recording session mixin request has been completed.
 * @param {Number} ERROR <small>Value <code>-1</code></small>
 *   The value of the state state when recording session has errors.
 *   <small>This can happen during recording session or during mixin of recording videos,
 *   and at this stage, any current recording session or mixin is aborted.</small>
 * @type JSON
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.RECORDING_STATE = {
  START: 0,
  STOP: 1,
  LINK: 2,
  ERROR: -1
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
 * Stores the data chunk size for binary Blob transfers.
 * @attribute _BINARY_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._BINARY_FILE_SIZE = 65456;

/**
 * Stores the data chunk size for binary Blob transfers.
 * @attribute _MOZ_BINARY_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._MOZ_BINARY_FILE_SIZE = 16384;

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
  APPROACH: 'approach',
  START_RECORDING: 'startRecordingRoom',
  STOP_RECORDING: 'stopRecordingRoom',
  RECORDING: 'recordingEvent',
  END_OF_CANDIDATES: 'endOfCandidates'
};

/**
 * Stores the list of socket messaging protocol types to queue when sent less than a second interval.
 * @attribute _GROUP_MESSAGE_LIST
 * @type Array
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._GROUP_MESSAGE_LIST = [
  Skylink.prototype._SIG_MESSAGE_TYPE.STREAM,
  Skylink.prototype._SIG_MESSAGE_TYPE.UPDATE_USER,
  Skylink.prototype._SIG_MESSAGE_TYPE.MUTE_AUDIO,
  Skylink.prototype._SIG_MESSAGE_TYPE.MUTE_VIDEO,
  Skylink.prototype._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
];


Skylink.prototype._createDataChannel = function(peerId, dataChannel, bufferThreshold, createAsMessagingChannel) {
  var self = this;
  var channelName = (self._user && self._user.sid ? self._user.sid : '-') + '_' + peerId;
  var channelType = createAsMessagingChannel ? self.DATA_CHANNEL_TYPE.MESSAGING : self.DATA_CHANNEL_TYPE.DATA;
  var channelProp = channelType === self.DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;

  if (!self._user) {
    log.error([peerId, 'RTCDataChannel', channelProp,
      'Aborting of creating or initializing Datachannel as User does not have Room session']);
    return;
  }

  if (!(self._peerConnections[peerId] &&
    self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    log.error([peerId, 'RTCDataChannel', channelProp,
      'Aborting of creating or initializing Datachannel as Peer connection does not exists']);
    return;
  }


  if (dataChannel && typeof dataChannel === 'object') {
    channelName = dataChannel.label;

  } else if (typeof dataChannel === 'string') {
    channelName = dataChannel;
    dataChannel = null;
  }

  if (!dataChannel) {
    try {
      dataChannel = self._peerConnections[peerId].createDataChannel(channelName, {
        reliable: true,
        ordered: true
      });

    } catch (error) {
      log.error([peerId, 'RTCDataChannel', channelProp, 'Failed creating Datachannel ->'], error);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CREATE_ERROR, peerId, error, channelName,
        channelType, null, self._getDataChannelBuffer(dataChannel));
      return;
    }
  }

  if (!self._dataChannels[peerId]) {
    channelProp = 'main';
    channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
    self._dataChannels[peerId] = {};
    log.debug([peerId, 'RTCDataChannel', channelProp, 'initializing main DataChannel']);
  } else if (self._dataChannels[peerId].main && self._dataChannels[peerId].main.channel.label === channelName) {
    channelProp = 'main';
    channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
  }

  /**
   * Subscribe to events
   */
  dataChannel.onerror = function (evt) {
    var channelError = evt.error || evt;

    log.error([peerId, 'RTCDataChannel', channelProp, 'Datachannel has an exception ->'], channelError);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, channelError, channelName,
      channelType, null, self._getDataChannelBuffer(dataChannel));
  };

  // State where we can start calling .send() to queue more buffered data to be sent
  // RTCDataChannel has an internal mechanism to queue data to be sent over
  // This event might not be even triggered at all
  dataChannel.onbufferedamountlow = function () {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Datachannel buffering data transfer low']);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.BUFFERED_AMOUNT_LOW, peerId, null, channelName,
      channelType, null, self._getDataChannelBuffer(dataChannel));
  };

  dataChannel.onmessage = function(event) {
    self._processDataChannelData(event.data, peerId, channelName, channelType);
  };

  var onOpenHandlerFn = function () {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Datachannel has opened']);

    dataChannel.bufferedAmountLowThreshold = bufferThreshold || 0;

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.OPEN, peerId, null, channelName,
      channelType, null, self._getDataChannelBuffer(dataChannel));
  };

  if (dataChannel.readyState === self.DATA_CHANNEL_STATE.OPEN) {
    setTimeout(onOpenHandlerFn, 1); // 500);

  } else {
    self._trigger('dataChannelState', dataChannel.readyState, peerId, null, channelName,
      channelType, null, self._getDataChannelBuffer(dataChannel));

    dataChannel.onopen = onOpenHandlerFn;
  }

  var onCloseHandlerFn = function () {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Datachannel has closed']);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId, null, channelName,
      channelType, null, self._getDataChannelBuffer(dataChannel));

    if (self._peerConnections[peerId] && self._peerConnections[peerId].remoteDescription &&
      self._peerConnections[peerId].remoteDescription.sdp && (self._peerConnections[peerId].remoteDescription.sdp.indexOf(
      'm=application') === -1 || self._peerConnections[peerId].remoteDescription.sdp.indexOf('m=application 0') > 0)) {
      return;
    }

    if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
      setTimeout(function () {
        if (self._peerConnections[peerId] &&
          self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED &&
          (self._peerConnections[peerId].localDescription &&
          self._peerConnections[peerId].localDescription.type === self.HANDSHAKE_PROGRESS.OFFER)) {
          log.debug([peerId, 'RTCDataChannel', channelProp, 'Reviving Datachannel connection']);
          self._createDataChannel(peerId, channelName, bufferThreshold, true);
        }
      }, 100);
    }
  };

  // Fixes for Firefox bug (49 is working) -> https://bugzilla.mozilla.org/show_bug.cgi?id=1118398
  if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
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
      streamId: null,
      channel: dataChannel
    };
  } else {
    self._dataChannels[peerId][channelName] = {
      channelName: channelName,
      channelType: channelType,
      transferId: null,
      streamId: null,
      channel: dataChannel
    };
  }
};

/**
 * Function that refreshes the main messaging Datachannel.
 * @method refreshDatachannel
 * @param {String} [peerId] The target Peer ID to retrieve connection stats from.
 * @example
 *   // Example 1: Retrieve offerer and refresh datachannel:
 *   skylink.on("dataChannelState", function (state, peerId, error, channelName, channelType) {
 *   if (channelType === skylink.DATA_CHANNEL_TYPE.MESSAGING &&
 *    state === skylink.DATA_CHANNEL_STATE.CLOSED) {
 *    var userWeight = skylink.getPeerInfo().config.priorityWeight;
 *    var peerWeight = skylink.getPeerInfo(peerId).config.priorityWeight;
 *    // Determine who is offerer because as per SM protocol, higher weight is offerer
 *    if (userWeight > peerWeight) {
 *      skylink.refreshDatachannel(peerId);
 *    }
 *  }
 *  });
 * @for Skylink
 * @since 0.6.30
 */

Skylink.prototype.refreshDatachannel = function (peerId) {

  var self = this;
  if(self._dataChannels[peerId] && self._dataChannels[peerId]["main"] && self._dataChannels[peerId].main.channel) {
    var channelName = self._dataChannels[peerId].main.channelName;
    var channelType = self._dataChannels[peerId].main.channelType;
    var channelProp = 'main';
    var bufferThreshold= self._dataChannels[peerId].main.channel.bufferedAmountLowThreshold || 0;

    if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
      setTimeout(function () {
        if (self._peerConnections[peerId] &&
          self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED &&
          (self._peerConnections[peerId].localDescription &&
            self._peerConnections[peerId].localDescription.type === self.HANDSHAKE_PROGRESS.OFFER)) {
          self._closeDataChannel(peerId, 'main', true);
          log.debug([peerId, 'RTCDataChannel', channelProp, 'Reviving Datachannel connection']);
          self._createDataChannel(peerId, channelName, bufferThreshold, true);
        }
      }, 100);
    }
  }
  else {
    log.debug([peerId, 'RTCDataChannel', 'Not a valid Datachannel connection']);
  }
};

/**
 * Function that returns the Datachannel buffer threshold and amount.
 * @method _getDataChannelBuffer
 * @return {JSON} The buffered amount information.
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._getDataChannelBuffer = function (peerId, channelProp) {
  if (typeof peerId === 'object') {
    return {
      bufferedAmountLow: typeof peerId.bufferedAmountLow === 'number' ?
        peerId.bufferedAmountLow : parseInt(peerId.bufferedAmountLow, 10) || 0,
      bufferedAmountLowThreshold: typeof peerId.bufferedAmountLowThreshold === 'number' ?
        peerId.bufferedAmountLowThreshold : parseInt(peerId.bufferedAmountLowThreshold, 10) || 0
    };
  } else if (!(this._dataChannels[peerId] && this._dataChannels[peerId][channelProp] &&
    this._dataChannels[peerId][channelProp].channel)) {
    return {
      bufferedAmountLow: 0,
      bufferedAmountLowThreshold: 0
    };
  }

  var channel = this._dataChannels[peerId][channelProp].channel;

  return {
    bufferedAmountLow: typeof channel.bufferedAmountLow === 'number' ?
      channel.bufferedAmountLow : parseInt(channel.bufferedAmountLow, 10) || 0,
    bufferedAmountLowThreshold: typeof channel.bufferedAmountLowThreshold === 'number' ?
      channel.bufferedAmountLowThreshold : parseInt(channel.bufferedAmountLowThreshold, 10) || 0
  };
};

/**
 * Function that sends data over the Datachannel connection.
 * @method _sendMessageToDataChannel
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._sendMessageToDataChannel = function(peerId, data, channelProp, doNotConvert) {
  var self = this;

  // Set it as "main" (MESSAGING) Datachannel
  if (!channelProp || channelProp === peerId) {
    channelProp = 'main';
  }

  // TODO: What happens when we want to send binary data over or ArrayBuffers?
  if (!(typeof data === 'object' && data) && !(data && typeof data === 'string')) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping invalid data ->'], data);
    return;
  }

  if (!(self._peerConnections[peerId] &&
    self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    log.warn([peerId, 'RTCDataChannel', channelProp,
      'Dropping for sending message as Peer connection does not exists or is closed ->'], data);
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId][channelProp])) {
    log.warn([peerId, 'RTCDataChannel', channelProp,
      'Dropping for sending message as Datachannel connection does not exists ->'], data);
    return;
  }

  var channelName = self._dataChannels[peerId][channelProp].channelName;
  var channelType = self._dataChannels[peerId][channelProp].channelType;
  var readyState  = self._dataChannels[peerId][channelProp].channel.readyState;
  var messageType = typeof data === 'object' && data.type === self._DC_PROTOCOL_TYPE.MESSAGE ?
    self.DATA_CHANNEL_MESSAGE_ERROR.MESSAGE : self.DATA_CHANNEL_MESSAGE_ERROR.TRANSFER;

  if (readyState !== self.DATA_CHANNEL_STATE.OPEN) {
    var notOpenError = 'Failed sending message as Datachannel connection state is not opened. Current ' +
      'readyState is "' + readyState + '"';

    log.error([peerId, 'RTCDataChannel', channelProp, notOpenError + ' ->'], data);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR, peerId, new Error(notOpenError),
      channelName, channelType, messageType, self._getDataChannelBuffer(peerId, channelProp));

    throw new Error(notOpenError);
  }

  try {
    if (!doNotConvert && typeof data === 'object') {
      log.debug([peerId, 'RTCDataChannel', channelProp, 'Sending "' + data.type + '" protocol message ->'], data);

      self._dataChannels[peerId][channelProp].channel.send(JSON.stringify(data));

    } else {
      log.debug([peerId, 'RTCDataChannel', channelProp, 'Sending data with size ->'],
        data.size || data.length || data.byteLength);

      self._dataChannels[peerId][channelProp].channel.send(data);
    }
  } catch (error) {
    log.error([peerId, 'RTCDataChannel', channelProp, 'Failed sending ' + (!doNotConvert && typeof data === 'object' ?
      '"' + data.type + '" protocol message' : 'data') + ' ->'], error);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR, peerId,
      error, channelName, channelType, messageType, self._getDataChannelBuffer(peerId, channelProp));

    throw error;
  }
};

/**
 * Function that stops the Datachannel connection and removes object references.
 * @method _closeDataChannel
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._closeDataChannel = function(peerId, channelProp, isCloseMainChannel) {
  var self = this;

  if (!self._dataChannels[peerId]) {
    log.warn([peerId, 'RTCDataChannel', channelProp || null,
      'Aborting closing Datachannels as Peer connection does not have Datachannel sessions']);
    return;
  }

  var closeFn = function (rChannelProp) {
    var channelName = self._dataChannels[peerId][rChannelProp].channelName;
    var channelType = self._dataChannels[peerId][rChannelProp].channelType;

    if (self._dataChannels[peerId][rChannelProp].readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
      log.debug([peerId, 'RTCDataChannel', channelProp, 'Closing Datachannel']);

      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSING, peerId, null, channelName, channelType,
        null, self._getDataChannelBuffer(peerId, rChannelProp));

      self._dataChannels[peerId][rChannelProp].channel.close();

      delete self._dataChannels[peerId][rChannelProp];
    }
  };

  if(isCloseMainChannel)
  {
    closeFn(channelProp);
  }
  else if (!channelProp || channelProp === 'main') {
    for (var channelNameProp in self._dataChannels) {
      if (self._dataChannels[peerId].hasOwnProperty(channelNameProp)) {
        if (self._dataChannels[peerId][channelNameProp]) {
          closeFn(channelNameProp);
        }
      }
    }

    delete self._dataChannels[peerId];

  } else {
    if (!self._dataChannels[peerId][channelProp]) {
      log.warn([peerId, 'RTCDataChannel', channelProp, 'Aborting closing Datachannel as it does not exists']);
      return;
    }

    closeFn(channelProp);
  }
};
Skylink.prototype._base64ToBlob = function(dataURL) {
  var byteString = atob(dataURL);
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
 * Function that converts a Blob object into ArrayBuffer object.
 * @method _blobToArrayBuffer
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._blobToArrayBuffer = function(data, callback) {
  var self = this;
  var fileReader = new FileReader();
  fileReader.onload = function() {
    // Load Blob as dataurl base64 string
    if (AdapterJS.webrtcDetectedType === 'plugin') {
      callback(new Int8Array(fileReader.result));
    } else {
      callback(fileReader.result);
    }
  };
  fileReader.readAsArrayBuffer(data);
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
Skylink.prototype.sendBlobData = function(data, timeout, targetPeerId, sendChunksAsBinary, callback) {
  this._startDataTransfer(data, timeout, targetPeerId, sendChunksAsBinary, callback, 'blob');
};

/**
 * Function that starts an uploading string data transfer from User to Peers.
 * @method sendURLData
 * @param {String} data The data string to transfer to Peer.
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
 * @param {String} callback.error.transferId The data transfer ID.
 *   <small>Defined as <code>null</code> when <code>sendURLData()</code> fails to start data transfer.</small>
 * @param {Array} callback.error.listOfPeers The list Peer IDs targeted for the data transfer.
 * @param {JSON} callback.error.transferErrors The list of data transfer errors.
 * @param {Error|String} callback.error.transferErrors.#peerId The data transfer error associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 *   <small>If <code>#peerId</code> value is <code>"self"</code>, it means that it is the error when there
 *   are no Peer connections to start data transfer with.</small>
 * @param {JSON} callback.error.transferInfo The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a> except without the
 *   <code>percentage</code> property and <code>data</code>.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.transferId The data transfer ID.
 * @param {Array} callback.success.listOfPeers The list Peer IDs targeted for the data transfer.
 * @param {JSON} callback.success.transferInfo The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a> except without the
 *   <code>percentage</code> property and <code>data</code>.</small>
 * @trigger <small>Event sequence follows <a href="#method_sendBlobData">
 * <code>sendBlobData()</code> method</a>.</small>
 * @example
 * &lt;body&gt;
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(0)"&gt; 1s timeout (Default)
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(120)"&gt; 2s timeout
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(300)"&gt; 5s timeout
 *  &lt;hr&gt;
 *  &lt;input type="file" onchange="showImage(this.files[0], this.getAttribute('data'))" data="peerId"&gt;
 *  &lt;input type="file" onchange="showImageGroup(this.files[0], this.getAttribute('data').split(',')))" data="peerIdA,peerIdB"&gt;
 *  &lt;input type="file" onchange="showImageAll(this.files[0])" data=""&gt;
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
  this._startDataTransfer(data, timeout, targetPeerId, callback, null, 'data');
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
  var self = this;

  if (typeof transferId !== 'string' && typeof peerId !== 'string') {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'data transfer ID or peer ID is not provided']);
    return;
  }

  if (!self._dataChannels[peerId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'Peer does not have any Datachannel connections']);
    return;
  }

  if (!self._dataTransfers[transferId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'invalid transfer ID is provided']);
    return;
  }

  // Check Datachannel property in _dataChannels[peerId] list
  var channelProp = 'main';
  var dataChannelStateCbFn = null;

  if (self._dataChannels[peerId][transferId]) {
    channelProp = transferId;
  }

  // From here we start detecting as completion for data transfer downloads
  self.once('dataTransferState', function () {
    if (dataChannelStateCbFn) {
      self.off('dataChannelState', dataChannelStateCbFn);
    }

    delete self._dataTransfers[transferId];

    if (self._dataChannels[peerId]) {
      if (channelProp === 'main' && self._dataChannels[peerId].main) {
        self._dataChannels[peerId].main.transferId = null;
      }

      if (channelProp === transferId) {
        self._closeDataChannel(peerId, transferId);
      }
    }
  }, function (state, evtTransferId, evtPeerId) {
    return evtTransferId === transferId && evtPeerId === peerId && [
      self.DATA_TRANSFER_STATE.ERROR,
      self.DATA_TRANSFER_STATE.CANCEL,
      self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED,
      self.DATA_TRANSFER_STATE.USER_REJECTED].indexOf(state) > -1;
  });

  if (accept) {
    log.debug([peerId, 'RTCDataChannel', transferId, 'Accepted data transfer and starting ...']);

    dataChannelStateCbFn = function (state, evtPeerId, error, cN, cT) {
      log.error([peerId, 'RTCDataChannel', channelProp, 'Data transfer "' + transferId + '" has been terminated due to connection.']);
      
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, peerId,
        self._getTransferInfo(transferId, peerId, true, false, false), {
        transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD,
        message: new Error('Data transfer terminated as Peer Datachannel connection closed abruptly.')
      });
    };
  
    self.once('dataChannelState', dataChannelStateCbFn, function (state, evtPeerId, error, channelName, channelType) {
      if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
        self.off('dataChannelState', dataChannelStateCbFn);
        return;
      }

      return evtPeerId === peerId && (channelProp === 'main' ?
        channelType === self.DATA_CHANNEL_STATE.MESSAGING : channelName === transferId) && [
        self.DATA_CHANNEL_STATE.CLOSING,
        self.DATA_CHANNEL_STATE.CLOSED,
        self.DATA_CHANNEL_STATE.ERROR].indexOf(state) > -1;
    });

    // Send ACK protocol to start data transfer
    // MCU sends the data transfer from the "P2P" Datachannel
    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.ACK,
      sender: self._user.sid,
      ackN: 0
    }, channelProp);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.DOWNLOAD_STARTED, transferId, peerId,
      self._getTransferInfo(transferId, peerId, true, false, false), null);

  } else {
    log.warn([peerId, 'RTCDataChannel', transferId, 'Rejected data transfer and data transfer request has been aborted']);

    // Send ACK protocol to terminate data transfer request
    // MCU sends the data transfer from the "P2P" Datachannel
    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.ACK,
      sender: self._user.sid,
      ackN: -1
    }, channelProp);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.USER_REJECTED, transferId, peerId,
      self._getTransferInfo(transferId, peerId, true, false, false), {
      message: new Error('Data transfer terminated as User has rejected data transfer request.'),
      transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD
    });
  }
};

/**
 * <blockquote class="info">
 *   For MCU enabled Peer connections, the cancel data transfer functionality may differ, as it
 *   will result in all Peers related to the data transfer ID to be terminated.
 * </blockquote>
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
  var self = this;

  if (!(transferId && typeof transferId === 'string')) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as data transfer ID is not provided']);
    return;
  }

  if (!(peerId && typeof peerId === 'string')) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as peer ID is not provided']);
    return;
  }

  if (!self._dataTransfers[transferId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as ' +
      'data transfer session does not exists.']);
    return;
  }

  log.debug([peerId, 'RTCDataChannel', transferId, 'Canceling data transfer ...']);

  /**
   * Emit data state event function.
   */
  var emitEventFn = function (peers, transferInfoPeerId) {
    for (var i = 0; i < peers.length; i++) {
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.CANCEL, transferId, peers[i],
        self._getTransferInfo(transferId, transferInfoPeerId, false, false, false), {
        transferType: self._dataTransfers[transferId].direction,
        message: new Error('User cancelled download transfer')
      });
    }
  };

  // For uploading from Peer to MCU case of broadcast
  if (self._hasMCU && self._dataTransfers[transferId].direction === self.DATA_TRANSFER_TYPE.UPLOAD) {
    if (!self._dataChannels.MCU) {
      log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as ' +
        'Peer does not have any Datachannel connections']);
      return;
    }

    // We abort all data transfers to all Peers if uploading via MCU since it broadcasts to MCU
    log.warn([peerId, 'RTCDataChannel', transferId, 'Aborting all data transfers to Peers']);

    // If data transfer to MCU broadcast has interop Peers, send to MCU via the "main" Datachannel
    if (Object.keys(self._dataTransfers[transferId].peers.main).length > 0) {
      self._sendMessageToDataChannel('MCU', {
        type: self._DC_PROTOCOL_TYPE.CANCEL,
        sender: self._user.sid,
        content: 'Peer cancelled download transfer',
        name: self._dataTransfers[transferId].name,
        ackN: 0
      }, 'main');
    }

    // If data transfer to MCU broadcast has non-interop Peers, send to MCU via the new Datachanel
    if (Object.keys(self._dataTransfers[transferId].peers[transferId]).length > 0) {
      self._sendMessageToDataChannel('MCU', {
        type: self._DC_PROTOCOL_TYPE.CANCEL,
        sender: self._user.sid,
        content: 'Peer cancelled download transfer',
        name: self._dataTransfers[transferId].name,
        ackN: 0
      }, transferId);
    }

    emitEventFn(Object.keys(self._dataTransfers[transferId].peers.main).concat(
      Object.keys(self._dataTransfers[transferId].peers[transferId])));
  } else {
    var channelProp = 'main';

    if (!self._dataChannels[peerId]) {
      log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as ' +
        'Peer does not have any Datachannel connections']);
      return;
    }

    if (self._dataChannels[peerId][transferId]) {
      channelProp = transferId;
    }

    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.CANCEL,
      sender: self._user.sid,
      content: 'Peer cancelled download transfer',
      name: self._dataTransfers[transferId].name,
      ackN: 0
    }, channelProp);

    emitEventFn([peerId], peerId);
  }
};

/**
 * Function that sends a message to Peers via the Datachannel connection.
 * <small>Consider using <a href="#method_sendURLData"><code>sendURLData()</code> method</a> if you are
 * sending large strings to Peers.</small>
 * @method sendP2PMessage
 * @param {String|JSON} message The message.
 * @param {String|Array} [targetPeerId] The target Peer ID to send message to.
 * - When provided as an Array, it will send the message to only Peers which IDs are in the list.
 * - When not provided, it will broadcast the message to all connected Peers with Datachannel connection in the Room.
 * @trigger <ol class="desc-seq">
 *  <li>Sends P2P message to all targeted Peers. <ol>
 *  <li>If Peer connection Datachannel has not been opened: <small>This can be checked with
 *  <a href="#event_dataChannelState"><code>dataChannelState</code> event</a>
 *  triggering parameter payload <code>state</code> as <code>OPEN</code> and
 *  <code>channelType</code> as <code>MESSAGING</code> for Peer.</small> <ol>
 *  <li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggers
 *  parameter payload <code>state</code> as <code>SEND_MESSAGE_ERROR</code>.</li>
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
  var listOfPeers = Object.keys(this._dataChannels);
  var isPrivate = false;

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (!this._inRoom || !(this._user && this._user.sid)) {
    log.error('Unable to send message as User is not in Room. ->', message);
    return;
  }

  if (!this._initOptions.enableDataChannel) {
    log.error('Unable to send message as User does not have Datachannel enabled. ->', message);
    return;
  }

  // Loop out unwanted Peers
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    if (!this._dataChannels[peerId]) {
      log.error([peerId, 'RTCDataChannel', null, 'Dropping of sending message to Peer as ' +
        'Datachannel connection does not exists']);
      listOfPeers.splice(i, 1);
      i--;
    } else if (peerId === 'MCU') {
      listOfPeers.splice(i, 1);
      i--;
    } else if (!this._hasMCU) {
      log.debug([peerId, 'RTCDataChannel', null, 'Sending ' + (isPrivate ? 'private' : '') +
        ' P2P message to Peer']);

      this._sendMessageToDataChannel(peerId, {
        type: this._DC_PROTOCOL_TYPE.MESSAGE,
        isPrivate: isPrivate,
        sender: this._user.sid,
        target: peerId,
        data: message
      }, 'main');
    }
  }

  if (listOfPeers.length === 0) {
    log.warn('Currently there are no Peers to send P2P message to (unless the message is queued ' +
      'and there are Peer connected by then).');
  }

  if (this._hasMCU) {
    log.debug(['MCU', 'RTCDataChannel', null, 'Broadcasting ' + (isPrivate ? 'private' : '') +
      ' P2P message to Peers']);

    this._sendMessageToDataChannel('MCU', {
      type: this._DC_PROTOCOL_TYPE.MESSAGE,
      isPrivate: isPrivate,
      sender: this._user.sid,
      target: listOfPeers,
      data: message
    }, 'main');
  }

  this._trigger('incomingMessage', {
    content: message,
    isPrivate: isPrivate,
    targetPeerId: targetPeerId || null,
    listOfPeers: listOfPeers,
    isDataChannel: true,
    senderPeerId: this._user.sid
  }, this._user.sid, this.getPeerInfo(), true);
};

/**
 * <blockquote class="info">
 *   Note that this feature is not supported by MCU enabled Peer connections and the
 *   <code>enableSimultaneousTransfers</code> flag has to be enabled in the <a href="#method_init">
 *   <code>init()</code> method</a> in order for this functionality to work.<br>
 *   To start streaming data, see the <a href="#method_streamData"><code>streamData()</code>
 *   method</a>. To stop data streaming session, see the <a href="#method_stopStreamingData"><code>
 *   stopStreamingData()</code> method</a>.
 * </blockquote>
 * Function that starts a data chunks streaming session from User to Peers.
 * @method startStreamingData
 * @param {Boolean} [isStringStream=false] The flag if data streaming session sending data chunks
 *   should be expected as string data chunks sent.
 *   <small>By default, data chunks are expected to be sent in Blob or ArrayBuffer, and ArrayBuffer
 *   data chunks will be converted to Blob.</small>
 * @param {String|Array} [targetPeerId] The target Peer ID to send message to.
 * - When provided as an Array, it will start streaming session to only Peers which IDs are in the list.
 * - When not provided, it will start the streaming session to all connected Peers with Datachannel connection in the Room.
 * @trigger <ol class="desc-seq">
 * @trigger <ol class="desc-seq">
 *   <li>Checks if User is in Room. <ol>
 *   <li>If User is not in Room: <ol><li><a href="#event_dataStreamState">
 *   <code>dataStreamState</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>START_ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>Checks if there is any available Datachannel connections. <ol>
 *   <li>If User is not in Room: <ol><li><a href="#event_dataStreamState">
 *   <code>dataStreamState</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>START_ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>Checks if Peer connection and Datachannel connection are in correct states. <ol>
 *   <li>If Peer connection or session does not exists: <ol><li><a href="#event_dataStreamState">
 *   <code>dataStreamState</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>START_ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If Peer connection messaging Datachannel has not been opened: <small>This can be checked with
 *   <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggering parameter
 *   payload <code>state</code> as <code>OPEN</code> and <code>channelType</code> as
 *   <code>MESSAGING</code> for Peer.</small> <ol><li><a href="#event_dataStreamState">
 *   <code>dataStreamState</code> event</a> triggers parameter payload <code>state</code> as <code>START_ERROR</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If MCU is enabled for the App Key provided in <a href="#method_init"><code>init()</code>method</a> and connected: <ol>
 *   <li>If MCU Peer connection messaging Datachannel has not been opened: <small>This can be checked with
 *   <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggering parameter
 *   payload <code>state</code> as <code>OPEN</code>, <code>peerId</code> value as <code>"MCU"</code>
 *   and <code>channelType</code> as <code>MESSAGING</code> for MCU Peer.</small>
 *   <ol><li><a href="#event_dataStreamState"><code>dataStreamState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>START_ERROR</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>Checks if should open a new data Datachannel.<ol>
 *   <li>If Peer supports simultaneous data streaming, open new data Datachannel: <small>If MCU is connected,
 *   this opens a new data Datachannel with MCU Peer with all the Peers IDs information that supports
 *   simultaneous data transfers targeted for the data streaming session instead of opening new data Datachannel
 *   with all Peers targeted for the data streaming session.</small> <ol>
 *   <li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggers parameter
 *   payload <code>state</code> as <code>CONNECTING</code> and <code>channelType</code> as <code>DATA</code>.
 *   <small>Note that there is no timeout to wait for parameter payload <code>state</code> to be
 *   <code>OPEN</code>.</small></li>
 *   <li>If Datachannel has been created and opened successfully: <ol>
 *   <li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>OPEN</code> and <code>channelType</code> as <code>DATA</code>.</li></ol></li>
 *   <li>Else: <ol><li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>CREATE_ERROR</code> and <code>channelType</code> as
 *   <code>DATA</code>.</li><li><a href="#event_dataStreamState"><code>dataStreamState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>START_ERROR</code>.</li><li><b>ABORT</b> step and
 *   return error.</li></ol></li></ol></li><li>Else: <small>If MCU is connected,
 *   this uses the messaging Datachannel with MCU Peer with all the Peers IDs information that supports
 *   simultaneous data transfers targeted for the data streaming session instead of using the messaging Datachannels
 *   with all Peers targeted for the data streaming session.</small> <ol><li>If messaging Datachannel connection has a
 *   data streaming in-progress: <ol><li><a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>START_ERROR</code>.</li><li><b>ABORT</b> step and
 *   return error.</li></ol></li><li>If there is any conflicting <a href="#method_streamData"><code>streamData()</code>
 *   method</a> data streaming session: <small>If <code>isStringStream</code> is provided as <code>true</code> and
 *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> or <a href="#method_sendURLData">
 *   <code>sendURLData()</code> method</a> has an existing binary string transfer, it cannot start string data
 *   streaming session. Else if <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>
 *   has an existing binary data transfer, it cannot start binary data streaming session.</small><ol>
 *   <li><a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>START_ERROR</code>.</li><li><b>ABORT</b> step and
 *   return error.</li></ol></li></li></ol></ol></li></ol></li>
 *   <li>Starts the data streaming session with Peer. <ol>
 *   <li><a href="#event_incomingDataStreamStarted"><code>incomingDataStreamStarted</code> event</a> triggers.</li>
 *   <li><em>For User only</em> <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>SENDING_STARTED</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RECEIVING_STARTED</code>.</li></ol></li></ol>
 * @example
 *   // Example 1: Start streaming to all Peers
 *   skylinkDemo.on("dataChannelState", function (state, peerId, error, channelName, channelType) {
 *      if (state === skylinkDemo.DATA_CHANNEL_STATE.OPEN &&
 *        channelType === skylinkDemo.DATA_CHANNEL_TYPE.MESSAGING) {
 *        skylinkDemo.startStreamingData(false);
 *      }
 *   });
 *
 *   // Example 2: Start streaming to specific Peers
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
 *     skylinkDemo.startStreamingData(message, readyToSend);
 *   }
 * @beta
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.startStreamingData = function(isStringStream, targetPeerId) {
  var self = this;
  var listOfPeers = Object.keys(self._dataChannels);
  var isPrivate = false;
  var sessionChunkType = 'binary';

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (Array.isArray(isStringStream)) {
    listOfPeers = isStringStream;
    targetPeerId = isStringStream;
    isPrivate = true;
  } else if (isStringStream && typeof isStringStream === 'string') {
    listOfPeers = [isStringStream];
    targetPeerId = isStringStream;
    isPrivate = true;
  } else if (isStringStream && typeof isStringStream === 'boolean') {
    sessionChunkType = 'string';
  }

  var sessionInfo = {
    chunk: null,
    chunkSize: 0,
    chunkType: sessionChunkType === 'string' ? self.DATA_TRANSFER_DATA_TYPE.STRING : self._binaryChunkType,
    isPrivate: isPrivate,
    isStringStream: sessionChunkType === 'string',
    senderPeerId: self._user && self._user.sid ? self._user.sid : null
  };

  // Remove MCU from list
  if (listOfPeers.indexOf('MCU') > -1) {
    listOfPeers.splice(listOfPeers.indexOf('MCU'), 1);
  }

  var emitErrorBeforeStreamingFn = function (error) {
    log.error(error);

    /*if (listOfPeers.length > 0) {
      for (var i = 0; i < listOfPeers.length; i++) {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, null,
          listOfPeers[i], sessionInfo, new Error(error));
      }
    } else {
      self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, null,
        null, sessionInfo, new Error(error));
    }*/
  };

  if (!this._inRoom || !(this._user && this._user.sid)) {
    return emitErrorBeforeStreamingFn('Unable to start data streaming as User is not in Room.');
  }

  if (!this._initOptions.enableDataChannel) {
    return emitErrorBeforeStreamingFn('Unable to start data streaming as User does not have Datachannel enabled.');
  }

  if (listOfPeers.length === 0) {
    return emitErrorBeforeStreamingFn('Unable to start data streaming as there are no Peers to start session with.');
  }

  if (self._hasMCU) {
    return emitErrorBeforeStreamingFn('Unable to start data streaming as this feature is current not supported by MCU yet.');
  }

  if (!self._initOptions.enableSimultaneousTransfers) {
    return emitErrorBeforeStreamingFn('Unable to start data streaming as this feature requires simultaneous data transfers to be enabled');
  }

  var transferId = 'stream_' + (self._user && self._user.sid ? self._user.sid : '-') + '_' + (new Date()).getTime();
  var peersInterop = [];
  var peersNonInterop = [];
  var sessions = {};
  var listenToPeerFn = function (peerId, channelProp) {
    var hasStarted = false;
    sessions[peerId] = channelProp;

    self.once('dataStreamState', function () {}, function (state, evtTransferId, evtPeerId, evtSessionInfo) {
      if (!(evtTransferId === transferId && evtPeerId === peerId)) {
        return;
      }

      var dataChunk = evtSessionInfo.chunk;
      var updatedSessionInfo = clone(evtSessionInfo);
      delete updatedSessionInfo.chunk;

      if (state === self.DATA_STREAM_STATE.SENDING_STARTED) {
        hasStarted = true;
        return;
      }

      if (hasStarted && [self.DATA_STREAM_STATE.ERROR, self.DATA_STREAM_STATE.SENDING_STOPPED].indexOf(state) > -1) {
        if (channelProp === transferId) {
          self._closeDataChannel(peerId, transferId);
        }

        if (self._dataStreams[transferId] && self._dataStreams[transferId].sessions[peerId]) {
          delete self._dataStreams[transferId].sessions[peerId];

          if (Object.keys(self._dataStreams[transferId].sessions).length === 0) {
            delete self._dataStreams[transferId];
          }
        }
        return true;
      }
    });
  };

  // Loop out unwanted Peers
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];
    var error = null;
    var dtProtocolVersion = ((self._peerInformations[peerId] || {}).agent || {}).DTProtocolVersion || '';
    var channelProp = self._isLowerThanVersion(dtProtocolVersion, '0.1.2') || !self._initOptions.enableSimultaneousTransfers ? 'main' : transferId;

    if (!(self._dataChannels[peerId] && self._dataChannels[peerId].main)) {
      error = 'Datachannel connection does not exists';
    } else if (self._hasMCU && !(self._dataChannels.MCU && self._dataChannels.MCU.main)) {
      error = 'MCU Datachannel connection does not exists';
    } else if (self._isLowerThanVersion(dtProtocolVersion, '0.1.3')) {
      error = 'Peer DTProtocolVersion does not support data streaming. (received: "' + dtProtocolVersion + '", expected: "0.1.3")';
    } else {
      if (channelProp === 'main') {
        var dataTransferId = self._hasMCU ? self._dataChannels.MCU.main.transferId : self._dataChannels[peerId].main.transferId;

        if (self._dataChannels[peerId].main.streamId) {
          error = 'Peer Datachannel currently has an active data transfer session.';
        } else if (self._hasMCU && self._dataChannels.MCU.main.streamId) {
          error = 'MCU Peer Datachannel currently has an active data transfer session.';
        } else if (self._dataTransfers[dataTransferId] && self._dataTransfers[dataTransferId].sessionChunkType === sessionChunkType) {
          error = (self._hasMCU ? 'MCU ' : '') + 'Peer Datachannel currently has an active ' + sessionChunkType + ' data transfer.';
        } else {
          peersInterop.push(peerId);
        }
      } else {
        peersNonInterop.push(peerId);
      }
    }

    if (error) {
      self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, peerId, sessionInfo, new Error(error));
      listOfPeers.splice(i, 1);
      i--;
    } else {
      listenToPeerFn(peerId, channelProp);
    }
  }

  if (listOfPeers.length === 0) {
    log.warn('There are no Peers to start data session with.');
    return;
  }

  self._dataStreams[transferId] = {
    sessions: sessions,
    chunkType: sessionChunkType === 'string' ? self.DATA_TRANSFER_DATA_TYPE.STRING : self._binaryChunkType,
    sessionChunkType: sessionChunkType,
    isPrivate: isPrivate,
    isStringStream: sessionChunkType === 'string',
    senderPeerId: self._user && self._user.sid ? self._user.sid : null,
    isUpload: true
  };

  var startDataSessionFn = function (peerId, channelProp, targetPeers) {
    self.once('dataChannelState', function () {}, function (state, evtPeerId, channelName, channelType, error) {
      if (!self._dataStreams[transferId]) {
        return true;
      }

      if (!(evtPeerId === peerId && (channelProp === 'main' ? channelType === self.DATA_CHANNEL_TYPE.MESSAGING :
        channelName === transferId && channelType === self.DATA_CHANNEL_TYPE.DATA))) {
        return;
      }

      if ([self.DATA_CHANNEL_STATE.ERROR, self.DATA_CHANNEL_STATE.CLOSED].indexOf(state) > -1) {
        var updatedError = new Error(error && error.message ? error.message :
          'Failed data transfer as datachannel state is "' + state + '".');

        if (peerId === 'MCU') {
          for (var mp = 0; mp < targetPeers.length; mp++) {
            self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, targetPeers[mp], sessionInfo, updatedError);
          }
        } else {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, peerId, sessionInfo, updatedError);
        }
        return true;
      }
    });

    if (!(self._dataChannels[peerId][channelProp] &&
      self._dataChannels[peerId][channelProp].channel.readyState === self.DATA_CHANNEL_STATE.OPEN)) {
      var notOpenError = new Error('Failed starting data streaming session as channel is not opened.');
      if (peerId === 'MCU') {
        for (i = 0; i < targetPeers.length; i++) {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, targetPeers[i], sessionInfo, notOpenError);
        }
      } else {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, peerId, sessionInfo, notOpenError);
      }
    }

    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.WRQ,
      transferId: transferId,
      name: transferId,
      size: 0,
      originalSize: 0,
      dataType: 'fastBinaryStart',
      mimeType: null,
      chunkType: sessionChunkType,
      chunkSize: 0,
      timeout: 0,
      isPrivate: isPrivate,
      sender: self._user.sid,
      agent: AdapterJS.webrtcDetectedBrowser,
      version: AdapterJS.webrtcDetectedVersion,
      target: peerId === 'MCU' ? targetPeers : peerId
    }, channelProp);
    self._dataChannels[peerId][channelProp].streamId = transferId;

    var updatedSessionInfo = clone(sessionInfo);
    delete updatedSessionInfo.chunk;

    if (peerId === 'MCU') {
      for (var tp = 0; tp < targetPeers.length; tp++) {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENDING_STARTED, transferId, targetPeers[tp], sessionInfo, null);
        self._trigger('incomingDataStreamStarted', transferId, targetPeers[tp], updatedSessionInfo, true);
      }
    } else {
      self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENDING_STARTED, transferId, peerId, sessionInfo, null);
      self._trigger('incomingDataStreamStarted', transferId, peerId, updatedSessionInfo, true);
    }
  };

  var waitForChannelOpenFn = function (peerId, targetPeers) {
    self.once('dataChannelState', function (state, evtPeerId, error) {
      if (state === self.DATA_CHANNEL_STATE.CREATE_ERROR) {
        if (peerId === 'MCU') {
          for (var mp = 0; mp < targetPeers.length; mp++) {
            self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, targetPeers[mp], sessionInfo, error);
          }
        } else {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, peerId, sessionInfo, error);
        }
        return;
      }
      startDataSessionFn(peerId, transferId, targetPeers);
    }, function (state, evtPeerId, error, channelName, channelType) {
      if (evtPeerId === peerId && channelName === transferId && channelType === self.DATA_CHANNEL_TYPE.DATA) {
        return [self.DATA_CHANNEL_STATE.CREATE_ERROR, self.DATA_CHANNEL_STATE.OPEN].indexOf(state) > -1;
      }
    });
    self._createDataChannel(peerId, transferId, sessionChunkType === 'string' ? self._CHUNK_DATAURL_SIZE :
      (AdapterJS.webrtcDetectedBrowser === 'firefox' ? self._MOZ_BINARY_FILE_SIZE : self._BINARY_FILE_SIZE));
  };

  if (peersNonInterop.length > 0) {
    if (self._hasMCU) {
      waitForChannelOpenFn('MCU', peersNonInterop);
    } else {
      for (var pni = 0; pni < peersNonInterop.length; pni++) {
        waitForChannelOpenFn(peersNonInterop[pni], null);
      }
    }
  }

  if (peersInterop.length > 0) {
    if (self._hasMCU) {
      startDataSessionFn('MCU', 'main', peersInterop);
    } else {
      for (var pi = 0; pi < peersInterop.length; pi++) {
        startDataSessionFn(peersInterop[pi], 'main', null);
      }
    }
  }
};

/**
 * <blockquote class="info">
 *   Note that this feature is not supported by MCU enabled Peer connections.<br>
 *   To start data streaming session, see the <a href="#method_startStreamingData"><code>startStreamingData()</code>
 *   method</a>. To stop data streaming session, see the <a href="#method_stopStreamingData"><code>stopStreamingData()</code> method</a>
 * </blockquote>
 * Function that sends a data chunk from User to Peers for an existing active data streaming session.
 * @method streamData
 * @param {String} streamId The data streaming session ID.
 * @param {String|Blob|ArrayBuffer} chunk The data chunk.
 *   <small>By default when it is not string data streaming, data chunks when is are expected to be
 *   sent in Blob or ArrayBuffer, and ArrayBuffer data chunks will be converted to Blob.</small>
 *   <small>For binary data chunks, the limit is <code>65456</code>.</small>
 *   <small>For string data chunks, the limit is <code>1212</code>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>Checks if Peer connection and Datachannel connection are in correct states. <ol>
 *   <li>If Peer connection (or MCU Peer connection if enabled)
 *   data streaming Datachannel has not been opened: <small>This can be checked with
 *   <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggering parameter
 *   payload <code>state</code> as <code>OPEN</code> and <code>channelType</code> as
 *   <code>MESSAGING</code> for Peer.</small> <ol><li><a href="#event_dataStreamState">
 *   <code>dataStreamState</code> event</a> triggers parameter payload <code>state</code> as <code>ERROR</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>Starts sending the data chunk to Peer. <ol>
 *   <li><a href="#event_incomingDataStream"><code>incomingDataStream</code> event</a> triggers.</li>
 *   <li><em>For User only</em> <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>SENT</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RECEIVED</code>.</li></ol></li></ol>
 * @example
 *   // Example 1: Start streaming
 *   var currentStreamId = null
 *   if (file.size > chunkLimit) {
 *     while ((file.size - 1) > endCount) {
 *       endCount = startCount + chunkLimit;
 *       chunks.push(file.slice(startCount, endCount));
 *       startCount += chunkLimit;
 *     }
 *     if ((file.size - (startCount + 1)) > 0) {
 *       chunks.push(file.slice(startCount, file.size - 1));
 *     }
 *   } else {
 *     chunks.push(file);
 *   }
 *   var processNextFn = function () {
 *     if (chunks.length > 0) {
 *       skylinkDemo.once("incomingDataStream", function () {
 *         setTimeout(processNextFn, 1);
 *       }, function (data, evtStreamId, evtPeerId, streamInfo, isSelf) {
 *         return isSelf && evtStreamId === currentStreamId;
 *       });
 *       var chunk = chunks[0];
 *       chunks.splice(0, 1);
 *       skylinkDemo.streamData(currentStreamId, chunk);
 *     } else {
 *       skylinkDemo.stopStreamingData(currentStreamId);
 *     }
 *   };
 *   skylinkDemo.once("incomingDataStreamStarted", processNextFn, function (streamId, peerId, streamInfo, isSelf) {
 *     currentStreamId = streamId;
 *     return isSelf;
 *   });
 *   skylinkDemo.once("incomingDataStreamStopped", function () {
 *     // Render file
 *   }, function (streamId, peerId, streamInfo, isSelf) {
 *     return currentStreamId === streamId && isSelf;
 *   });
 *   skylinkDemo.startStreamingData(false);
 * @beta
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.streamData = function(transferId, dataChunk) {
  var self = this;

  if (!(transferId && typeof transferId === 'string')) {
    log.error('Failed streaming data chunk as stream session ID is not provided.');
    return;
  }

  if (!(dataChunk && typeof dataChunk === 'object' && (dataChunk instanceof Blob || dataChunk instanceof ArrayBuffer))) {
    log.error('Failed streaming data chunk as it is not provided.');
    return;
  }

  if (!(self._inRoom && self._user && self._user.sid)) {
    log.error('Failed streaming data chunk as User is not in the Room.');
    return;
  }

  if (!self._dataStreams[transferId]) {
    log.error('Failed streaming data chunk as session does not exists.');
    return;
  }

  if (!self._dataStreams[transferId].isUpload) {
    log.error('Failed streaming data chunk as session is not sending.');
    return;
  }

  if (self._dataStreams[transferId].sessionChunkType === 'string' ? typeof dataChunk !== 'string' :
    typeof dataChunk !== 'object') {
    log.error('Failed streaming data chunk as data chunk does not match expected data type.');
    return;
  }

  if (self._hasMCU) {
    log.error('Failed streaming data chunk as MCU does not support this feature yet.');
    return;
  }

  var updatedDataChunk = dataChunk instanceof ArrayBuffer ? new Blob(dataChunk) : dataChunk;

  if (self._dataStreams[transferId].sessionChunkType === 'string' ? updatedDataChunk.length > self._CHUNK_DATAURL_SIZE :
    updatedDataChunk.length > self._BINARY_FILE_SIZE) {
    log.error('Failed streaming data chunk as data chunk exceeds maximum chunk limit.');
    return;
  }

  var sessionInfo = {
    chunk: updatedDataChunk,
    chunkSize: updatedDataChunk.size || updatedDataChunk.length || updatedDataChunk.byteLength,
    chunkType: self._dataStreams[transferId].sessionChunkType === 'string' ?
      self.DATA_TRANSFER_DATA_TYPE.STRING : self._binaryChunkType,
    isPrivate: self._dataStreams[transferId].sessionChunkType.isPrivate,
    isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
    senderPeerId: self._user && self._user.sid ? self._user.sid : null
  };

  var peersInterop = [];
  var peersNonInterop = [];
  var sendDataFn = function (peerId, channelProp, targetPeers) {
    // When ready to be sent
    var onSendDataFn = function (buffer) {
      self._sendMessageToDataChannel(peerId, buffer, channelProp, true);

      var updatedSessionInfo = clone(sessionInfo);
      delete updatedSessionInfo.chunk;

      if (targetPeers) {
        for (var i = 0; i < targetPeers.length; i++) {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENT, transferId, targetPeers[i], sessionInfo, null);
          self._trigger('incomingDataStream', dataChunk, transferId, targetPeers[i], updatedSessionInfo, true);
        }
      } else {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENT, transferId, peerId, sessionInfo, null);
        self._trigger('incomingDataStream', dataChunk, transferId, peerId, updatedSessionInfo, true);
      }
    };

    if (dataChunk instanceof Blob && sessionInfo.chunkType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
      self._blobToArrayBuffer(dataChunk, onSendDataFn);
    } else if (!(dataChunk instanceof Blob) && sessionInfo.chunkType === self.DATA_TRANSFER_DATA_TYPE.BLOB) {
      onSendDataFn(new Blob([dataChunk]));
    } else if (AdapterJS.webrtcDetectedType === 'plugin' && typeof dataChunk !== 'string') {
      onSendDataFn(new Int8Array(dataChunk));
    } else {
      onSendDataFn(dataChunk);
    }
  };

  for (var peerId in self._dataStreams[transferId].sessions) {
    if (self._dataStreams[transferId].sessions.hasOwnProperty(peerId) && self._dataStreams[transferId].sessions[peerId]) {
      var channelProp = self._dataStreams[transferId].sessions[peerId];

      if (!(self._dataChannels[self._hasMCU ? 'MCU' : peerId] && self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp] &&
        self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp].channel.readyState === self.DATA_CHANNEL_STATE.OPEN &&
        self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp].streamId === transferId)) {
        log.error([peerId, 'RTCDataChannel', transferId, 'Failed streaming data as it has not started or is ready.']);
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, peerId, sessionInfo,
          new Error('Streaming as it has not started or Datachannel connection is not open.'));
        return;
      }

      if (self._hasMCU) {
        if (channelProp === 'main') {
          peersInterop.push(peerId);
        } else {
          peersNonInterop.push(peerId);
        }
      } else {
        sendDataFn(peerId, channelProp);
      }
    }
  }

  if (self._hasMCU) {
    if (peersInterop.length > 0) {
      sendDataFn(peerId, 'main', peersInterop);
    }
    if (peersNonInterop.length > 0) {
      sendDataFn(peerId, transferId, peersNonInterop);
    }
  }
};

/**
 * <blockquote class="info">
 *   To start data streaming session, see the <a href="#method_startStreamingData"><code>startStreamingData()</code>
 *   method</a> To start streaming data, see the <a href="#method_streamData"><code>streamData()</code>
 *   method</a>.
 * </blockquote>
 * Function that stops a data chunks streaming session from User to Peers.
 * @method stopStreamingData
 * @param {String} streamId The data streaming session ID.
 * @trigger <ol class="desc-seq">
 *   <li>Checks if Peer connection and Datachannel connection are in correct states. <ol>
 *   <li>If Peer connection (or MCU Peer connection if enabled)
 *   data streaming Datachannel has not been opened: <small>This can be checked with
 *   <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggering parameter
 *   payload <code>state</code> as <code>OPEN</code> and <code>channelType</code> as
 *   <code>MESSAGING</code> for Peer.</small> <ol><li><a href="#event_dataStreamState">
 *   <code>dataStreamState</code> event</a> triggers parameter payload <code>state</code> as <code>ERROR</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>Stops the data streaming session to Peer. <ol>
 *   <li><a href="#event_incomingDataStreamStopped"><code>incomingDataStreamStopped</code> event</a> triggers.</li>
 *   <li><em>For User only</em> <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>SENDING_STOPPED</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RECEIVING_STOPPED</code>.</li></ol></li></ol>
 * @example
 *   skylinkDemo.stopStreamData(streamId);
 * @beta
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.stopStreamingData = function(transferId) {
  var self = this;

  if (!(transferId && typeof transferId === 'string')) {
    log.error('Failed streaming data chunk as stream session ID is not provided.');
    return;
  }

  if (!(self._inRoom && self._user && self._user.sid)) {
    log.error('Failed streaming data chunk as User is not in the Room.');
    return;
  }

  if (!self._dataStreams[transferId]) {
    log.error('Failed stopping data streaming session as it does not exists.');
    return;
  }

  if (!self._dataStreams[transferId].isUpload) {
    log.error('Failed stopping data streaming session as it is not sending.');
    return;
  }

  if (self._hasMCU) {
    log.error('Failed stopping data streaming session as MCU does not support this feature yet.');
    return;
  }

  var sessionInfo = {
    chunk: null,
    chunkSize: 0,
    chunkType: self._dataStreams[transferId].sessionChunkType === 'string' ?
      self.DATA_TRANSFER_DATA_TYPE.STRING : self._binaryChunkType,
    isPrivate: self._dataStreams[transferId].sessionChunkType.isPrivate,
    isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
    senderPeerId: self._user && self._user.sid ? self._user.sid : null
  };

  var peersInterop = [];
  var peersNonInterop = [];
  var sendDataFn = function (peerId, channelProp, targetPeers) {
    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.WRQ,
      transferId: transferId,
      name: transferId,
      size: 0,
      originalSize: 0,
      dataType: 'fastBinaryStop',
      mimeType: null,
      chunkType: self._dataStreams[transferId].sessionChunkType,
      chunkSize: 0,
      timeout: 0,
      isPrivate: self._dataStreams[transferId].isPrivate,
      sender: self._user.sid,
      agent: AdapterJS.webrtcDetectedBrowser,
      version: AdapterJS.webrtcDetectedVersion,
      target: targetPeers ? targetPeers : peerId
    }, channelProp);

    var updatedSessionInfo = clone(sessionInfo);
    delete updatedSessionInfo.chunk;

    if (targetPeers) {
      for (var i = 0; i < targetPeers.length; i++) {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENDING_STOPPED, transferId, targetPeers[i], sessionInfo, null);
        self._trigger('incomingDataStreamStopped', transferId, targetPeers[i], updatedSessionInfo, true);
      }
    } else {
      self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENDING_STOPPED, transferId, peerId, sessionInfo, null);
      self._trigger('incomingDataStreamStopped', transferId, peerId, updatedSessionInfo, true);
    }
  };

  for (var peerId in self._dataStreams[transferId].sessions) {
    if (self._dataStreams[transferId].sessions.hasOwnProperty(peerId) && self._dataStreams[transferId].sessions[peerId]) {
      var channelProp = self._dataStreams[transferId].sessions[peerId];

      if (!(self._dataChannels[self._hasMCU ? 'MCU' : peerId] && self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp] &&
        self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp].channel.readyState === self.DATA_CHANNEL_STATE.OPEN &&
        self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp].streamId === transferId)) {
        log.error([peerId, 'RTCDataChannel', transferId, 'Failed stopping data streaming session as channel is closed.']);
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, peerId, sessionInfo,
          new Error('Failed stopping data streaming session as Datachannel connection is not open or is active.'));
        return;
      }

      if (self._hasMCU) {
        if (self._dataStreams[transferId].sessions[peerId] === 'main') {
          peersInterop.push(peerId);
        } else {
          peersNonInterop.push(peerId);
        }
      } else {
        sendDataFn(peerId, channelProp);
      }
    }
  }

  if (self._hasMCU) {
    if (peersInterop.length > 0) {
      sendDataFn(peerId, 'main', peersInterop);
    }
    if (peersNonInterop.length > 0) {
      sendDataFn(peerId, transferId, peersNonInterop);
    }
  }
};


/**
 * Function that starts the data transfer to Peers.
 * @method _startDataTransfer
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._startDataTransfer = function(data, timeout, targetPeerId, sendChunksAsBinary, callback, sessionType) {
  var self = this;
  var transferId = (self._user ? self._user.sid : '') + '_' + (new Date()).getTime();
  var transferErrors = {};
  var transferCompleted = [];
  var chunks = [];
  var listOfPeers = Object.keys(self._peerConnections);
  var sessionChunkType = 'string';
  var transferInfo = {
    name: null,
    size: null,
    chunkSize: null,
    chunkType: null,
    dataType: null,
    mimeType: null,
    direction: self.DATA_TRANSFER_TYPE.UPLOAD,
    timeout: 60,
    isPrivate: false,
    percentage: 0
  };

  // sendBlobData(.., timeout)
  if (typeof timeout === 'number') {
    transferInfo.timeout = timeout;
  } else if (Array.isArray(timeout)) {
    listOfPeers = timeout;
  } else if (timeout && typeof timeout === 'string') {
    listOfPeers = [timeout];
  } else if (timeout && typeof timeout === 'boolean') {
    sessionChunkType = 'binary';
  } else if (typeof timeout === 'function') {
    callback = timeout;
  }

  // sendBlobData(.., .., targetPeerId)
  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (targetPeerId && typeof targetPeerId === 'boolean') {
    sessionChunkType = 'binary';
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  // sendBlobData(.., .., .., sendChunksAsBinary)
  if (sendChunksAsBinary && typeof sendChunksAsBinary === 'boolean') {
    sessionChunkType = 'binary';
  } else if (typeof sendChunksAsBinary === 'function') {
    callback = sendChunksAsBinary;
  }

  // Remove MCU Peer as list of Peers
  if (listOfPeers.indexOf('MCU') > -1) {
    listOfPeers.splice(listOfPeers.indexOf('MCU'), 1);
  }

  // Function that returns the error emitted before data transfer has started
  var emitErrorBeforeDataTransferFn = function (error) {
    log.error(error);

    if (typeof callback === 'function') {
      var transferErrors = {};

      if (listOfPeers.length === 0) {
        transferErrors.self = new Error(error);
        /*self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.START_ERROR, null, null, transferInfo, {
          transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD,
          message: new Error(error)
        });*/
      } else {
        for (var i = 0; i < listOfPeers.length; i++) {
          transferErrors[listOfPeers[i]] = new Error(error);
          /*self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.START_ERROR, null, listOfPeers[i], transferInfo, {
            transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD,
            message: new Error(error)
          });*/
        }
      }

      callback({
        transferId: null,
        transferInfo: transferInfo,
        listOfPeers: listOfPeers,
        transferErrors: transferErrors
      }, null);
    }
  };

  if (sessionType === 'blob') {
    if (self._hasMCU && sessionChunkType === 'binary') {
      log.warn('Binary data chunks transfer is not yet supported with MCU environment. ' +
        'Fallbacking to binary string data chunks transfer.');
      sessionChunkType = 'string';
    }

    var chunkSize = sessionChunkType === 'string' ? (AdapterJS.webrtcDetectedBrowser === 'firefox' ?
      self._MOZ_CHUNK_FILE_SIZE : self._CHUNK_FILE_SIZE) : (AdapterJS.webrtcDetectedBrowser === 'firefox' ?
      self._MOZ_BINARY_FILE_SIZE : self._BINARY_FILE_SIZE);

    transferInfo.dataType = self.DATA_TRANSFER_SESSION_TYPE.BLOB;
    transferInfo.chunkSize = sessionChunkType === 'string' ? 4 * Math.ceil(chunkSize / 3) : chunkSize;
    transferInfo.chunkType = sessionChunkType === 'binary' ? self._binaryChunkType : self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING;

    // Start checking if data transfer can start
    if (!(data && typeof data === 'object' && data instanceof Blob)) {
      emitErrorBeforeDataTransferFn('Provided data is not a Blob data');
      return;
    }

    transferInfo.name = data.name || transferId;
    transferInfo.mimeType = data.type || null;

    if (data.size < 1) {
      emitErrorBeforeDataTransferFn('Provided data is not a valid Blob data.');
      return;
    }

    transferInfo.originalSize = data.size;
    transferInfo.size = sessionChunkType === 'string' ? 4 * Math.ceil(data.size / 3) : data.size;
    chunks = self._chunkBlobData(data, chunkSize);
  } else {
    transferInfo.dataType = self.DATA_TRANSFER_SESSION_TYPE.DATA_URL;
    transferInfo.chunkSize = self._CHUNK_DATAURL_SIZE;
    transferInfo.chunkType = self.DATA_TRANSFER_DATA_TYPE.STRING;

    // Start checking if data transfer can start
    if (!(data && typeof data === 'string')) {
      emitErrorBeforeDataTransferFn('Provided data is not a dataURL');
      return;
    }

    transferInfo.originalSize = transferInfo.size = data.length || data.size;
    chunks = self._chunkDataURL(data, transferInfo.chunkSize);
  }

  if (!(self._user && self._user.sid)) {
    emitErrorBeforeDataTransferFn('Unable to send any ' +
      sessionType.replace('data', 'dataURL') + ' data. User is not in Room.');
    return;
  }

  if (!self._initOptions.enableDataChannel) {
    emitErrorBeforeDataTransferFn('Unable to send any ' +
      sessionType.replace('data', 'dataURL') + ' data. Datachannel is disabled');
    return;
  }

  if (listOfPeers.length === 0) {
    emitErrorBeforeDataTransferFn('Unable to send any ' +
      sessionType.replace('data', 'dataURL') + ' data. There are no Peers to start data transfer with');
    return;
  }

  self._dataTransfers[transferId] = clone(transferInfo);
  self._dataTransfers[transferId].peers = {};
  self._dataTransfers[transferId].peers.main = {};
  self._dataTransfers[transferId].peers[transferId] = {};
  self._dataTransfers[transferId].sessions = {};
  self._dataTransfers[transferId].chunks = chunks;
  self._dataTransfers[transferId].enforceBSPeers = [];
  self._dataTransfers[transferId].enforcedBSInfo = {};
  self._dataTransfers[transferId].sessionType = sessionType;
  self._dataTransfers[transferId].sessionChunkType = sessionChunkType;
  self._dataTransfers[transferId].senderPeerId = self._user.sid;

  // Check if fallback chunks is required
  if (sessionType === 'blob' && sessionChunkType === 'binary') {
    for (var p = 0; p < listOfPeers.length; p++) {
      var protocolVer = (((self._peerInformations[listOfPeers[p]]) || {}).agent || {}).DTProtocolVersion || '0.1.0';

      // C++ SDK does not support binary file transfer for now
      if (self._isLowerThanVersion(protocolVer, '0.1.3')) {
        self._dataTransfers[transferId].enforceBSPeers.push(listOfPeers[p]);
      }
    }

    if (self._dataTransfers[transferId].enforceBSPeers.length > 0) {
      var bsChunkSize = AdapterJS.webrtcDetectedBrowser === 'firefox' ? self._MOZ_CHUNK_FILE_SIZE : self._CHUNK_FILE_SIZE;
      var bsChunks = self._chunkBlobData(new Blob(chunks), bsChunkSize);

      self._dataTransfers[transferId].enforceBSInfo = {
        chunkSize: 4 * Math.ceil(bsChunkSize / 3),
        chunkType: self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
        size: 4 * Math.ceil(transferInfo.originalSize / 3),
        chunks: bsChunks
      };
    }
  }

  /**
   * Complete Peer function.
   */
  var completeFn = function (peerId, error) {
    // Ignore if already added.
    if (transferCompleted.indexOf(peerId) > -1) {
      return;
    }

    log.debug([peerId, 'RTCDataChannel', transferId, 'Data transfer result. Is errors present? ->'], error);

    transferCompleted.push(peerId);

    if (error) {
      transferErrors[peerId] = new Error(error);
    }

    if (listOfPeers.length === transferCompleted.length) {
      log.log([null, 'RTCDataChannel', transferId, 'Data transfer request completed']);

      if (typeof callback === 'function') {
        if (Object.keys(transferErrors).length > 0) {
          callback({
            transferId: transferId,
            transferInfo: self._getTransferInfo(transferId, peerId, false, true, false),
            transferErrors: transferErrors,
            listOfPeers: listOfPeers
          }, null);
        } else {
          callback(null, {
            transferId: transferId,
            transferInfo: self._getTransferInfo(transferId, peerId, false, true, false),
            listOfPeers: listOfPeers
          });
        }
      }
    }
  };

  for (var i = 0; i < listOfPeers.length; i++) {
    var MCUInteropStatus = self._startDataTransferToPeer(transferId, listOfPeers[i], completeFn, null, null);

    if (typeof MCUInteropStatus === 'boolean') {
      if (MCUInteropStatus === true) {
        self._dataTransfers[transferId].peers.main[listOfPeers[i]] = true;
      } else {
        self._dataTransfers[transferId].peers[transferId][listOfPeers[i]] = true;
      }
    }
  }

  if (self._hasMCU) {
    if (Object.keys(self._dataTransfers[transferId].peers.main).length > 0) {
      self._startDataTransferToPeer(transferId, 'MCU', completeFn, 'main',
        Object.keys(self._dataTransfers[transferId].peers.main));
    }

    if (Object.keys(self._dataTransfers[transferId].peers[transferId]).length > 0) {
      self._startDataTransferToPeer(transferId, 'MCU', completeFn, transferId,
        Object.keys(self._dataTransfers[transferId].peers[transferId]));
    }
  }
};

/**
 * Function that starts or listens the data transfer status to Peer.
 * This reacts differently during MCU environment.
 * @method _startDataTransferToPeer
 * @return {Boolean} Returns a Boolean only during MCU environment which flag indicates if Peer requires interop
 *   (Use messaging Datachannel connection instead).
 * @private
 * @since 0.6.16
 */
Skylink.prototype._startDataTransferToPeer = function (transferId, peerId, callback, channelProp, targetPeers) {
  var self = this;
  var peerConnectionStateCbFn = null;
  var dataChannelStateCbFn = null;

  /**
   * Emit event for Peers function.
   */
  var emitEventFn = function (cb) {
    var peers = targetPeers || [peerId];
    for (var i = 0; i < peers.length; i++) {
      cb(peers[i]);
    }
  };

  /**
   * Return error and trigger them if failed before or during data transfers function.
   */
  var returnErrorBeforeTransferFn = function (error) {
    // Replace if it is a MCU Peer errors for clear indication in error message
    var updatedError = peerId === 'MCU' ? error.replace(/Peer/g, 'MCU Peer') : error;

    emitEventFn(function (evtPeerId) {
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, evtPeerId,
        self._getTransferInfo(transferId, peerId, true, true, false), {
        message: new Error(updatedError),
        transferType: self.DATA_TRANSFER_TYPE.UPLOAD
      });
    });
  };

  /**
   * Send WRQ protocol to start data transfers.
   */
  var sendWRQFn = function () {
    var size = self._dataTransfers[transferId].size;
    var chunkSize = self._dataTransfers[transferId].chunkSize;
    var chunkType = self._dataTransfers[transferId].sessionChunkType;

    if (self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1) {
      log.warn([peerId, 'RTCDataChannel', transferId,
        'Binary data chunks transfer is not yet supported with Peer connecting from ' +
        'Android, iOS and C++ SDK. Fallbacking to binary string data chunks transfer.']);

      size = self._dataTransfers[transferId].enforceBSInfo.size;
      chunkSize = self._dataTransfers[transferId].enforceBSInfo.chunkSize;
      chunkType = 'string';
    }

    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.WRQ,
      transferId: transferId,
      name: self._dataTransfers[transferId].name,
      size: size,
      originalSize: self._dataTransfers[transferId].originalSize,
      dataType: self._dataTransfers[transferId].sessionType,
      mimeType: self._dataTransfers[transferId].mimeType,
      chunkType: chunkType,
      chunkSize: chunkSize,
      timeout: self._dataTransfers[transferId].timeout,
      isPrivate: self._dataTransfers[transferId].isPrivate,
      sender: self._user.sid,
      agent: AdapterJS.webrtcDetectedBrowser,
      version: AdapterJS.webrtcDetectedVersion,
      target: targetPeers ? targetPeers : peerId
    }, channelProp);

    emitEventFn(function (evtPeerId) {
      self._trigger('incomingDataRequest', transferId, evtPeerId,
        self._getTransferInfo(transferId, peerId, false, false, false), true);

      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.USER_UPLOAD_REQUEST, transferId, evtPeerId,
        self._getTransferInfo(transferId, peerId, true, false, false), null);
    });
  };

  // Listen to data transfer state
  if (peerId !== 'MCU') {
    var dataTransferStateCbFn = function (state, evtTransferId, evtPeerId, transferInfo, error) {
      if (peerConnectionStateCbFn) {
        self.off('peerConnectionState', peerConnectionStateCbFn);
      }

      if (dataChannelStateCbFn) {
        self.off('dataChannelState', dataChannelStateCbFn);
      }

      if (channelProp) {
        delete self._dataTransfers[transferId].peers[channelProp][peerId];
      }

      callback(peerId, state === self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED ? null :
        error.message.message || error.message.toString());

      delete self._dataTransfers[transferId].sessions[peerId];

      if (self._hasMCU && Object.keys(self._dataTransfers[transferId].peers.main).length === 0 &&
        self._dataChannels.MCU && self._dataChannels.MCU.main) {
        self._dataChannels.MCU.main.transferId = null;

      } else if (channelProp === 'main' && self._dataChannels[peerId] && self._dataChannels[peerId].main) {
        self._dataChannels[peerId].main.transferId = null;
      }

      if (Object.keys(self._dataTransfers[transferId].sessions).length === 0) {
        delete self._dataTransfers[transferId];
      }
    };

    self.once('dataTransferState', dataTransferStateCbFn, function (state, evtTransferId, evtPeerId) {
      if (!(self._dataTransfers[transferId] && (self._hasMCU ?
        (self._dataTransfers[transferId].peers.main[peerId] || self._dataTransfers[transferId].peers[transferId][peerId]) :
        self._dataTransfers[transferId].sessions[peerId]))) {

        if (dataTransferStateCbFn) {
          self.off('dataTransferState', dataTransferStateCbFn);
        }

        if (peerConnectionStateCbFn) {
          self.off('peerConnectionState', peerConnectionStateCbFn);
        }

        if (dataChannelStateCbFn) {
          self.off('dataChannelState', dataChannelStateCbFn);
        }
        return;
      }

      return evtTransferId === transferId && evtPeerId === peerId && [
        self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED,
        self.DATA_TRANSFER_STATE.ERROR,
        self.DATA_TRANSFER_STATE.CANCEL,
        self.DATA_TRANSFER_STATE.REJECTED].indexOf(state) > -1;
    });
  }

  // When Peer connection does not exists
  if (!self._peerConnections[peerId]) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer connection does not exists.');
    return;
  }

  // When Peer session does not exists
  if (!self._peerInformations[peerId]) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer connection does not exists.');
    return;
  }

  // When Peer connection is not STABLE
  if (self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer connection is not stable.');
    return;
  }

  if (!self._dataTransfers[transferId]) {
    returnErrorBeforeTransferFn('Unable to start data transfer as data transfer session is not in order.');
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId].main)) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel connection does not exists.');
    return;
  }

  if (self._dataChannels[peerId].main.channel.readyState !== self.DATA_CHANNEL_STATE.OPEN) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel connection is not opened.');
    return;
  }

  var streamId = self._dataChannels[peerId].main.streamId;

  if (streamId && channelProp === 'main' && self._dataStreams[streamId] &&
  // Check if session chunk streaming is string and sending is string for Peer
    ((self._dataStreams[streamId].sessionChunkType === 'string' &&
    (self._dataTransfers[transferId].sessionChunkType === 'string' ||
    self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1)) ||
  // Check if session chunk streaming is binary and sending is binary for Peer
    (self._dataStreams[streamId].sessionChunkType === 'binary' &&
    self._dataStreams[streamId].sessionChunkType === 'binary' &&
    self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) === -1))) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel currently has an active ' +
      self._dataStreams[streamId].sessionChunkType + ' data streaming session.');
    return;
  }

  var protocolVer = (self._peerInformations[peerId].agent || {}).DTProtocolVersion || '0.1.0';
  var requireInterop = self._isLowerThanVersion(protocolVer, '0.1.2') || !self._initOptions.enableSimultaneousTransfers;

  // Prevent DATA_URL (or "string" dataType transfers) with Android / iOS / C++ SDKs
  if (self._isLowerThanVersion(protocolVer, '0.1.2') && self._dataTransfers[transferId].sessionType === 'data' &&
    self._dataTransfers[transferId].sessionChunkType === 'string') {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer do not support DATA_URL type of data transfers');
    return;
  }

  // Listen to Peer connection state for MCU Peer
  if (peerId !== 'MCU' && self._hasMCU) {
    channelProp = requireInterop ? 'main' : transferId;

    peerConnectionStateCbFn = function () {
      returnErrorBeforeTransferFn('Data transfer terminated as Peer connection is not stable.');
    };

    self.once('peerConnectionState', peerConnectionStateCbFn, function (state, evtPeerId) {
      if (!self._dataTransfers[transferId]) {
        self.off('peerConnectionState', peerConnectionStateCbFn);
        return;
      }
      return state !== self.PEER_CONNECTION_STATE.STABLE && evtPeerId === peerId;
    });
    return requireInterop;
  }

  if (requireInterop || channelProp === 'main') {
    // When MCU Datachannel connection has a transfer in-progress
    if (self._dataChannels[peerId].main.transferId) {
      returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel has a data transfer in-progress.');
      return;
    }
  }

  self._dataTransfers[transferId].sessions[peerId] = {
    timer: null,
    ackN: 0
  };

  dataChannelStateCbFn = function (state, evtPeerId, error) {
    // Prevent from triggering in instances where the ackN === chunks.length
    if (self._dataTransfers[transferId].sessions[peerId].ackN >= (self._dataTransfers[transferId].chunks.length - 1)) {
      return;
    }

    if (error) {
      returnErrorBeforeTransferFn(error.message || error.toString());
    } else {
      returnErrorBeforeTransferFn('Data transfer terminated as Peer Datachannel connection closed abruptly.');
    }
  };

  self.once('dataChannelState', dataChannelStateCbFn, function (state, evtPeerId, error, channelName, channelType) {
    if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
      self.off('dataChannelState', dataChannelStateCbFn);
      return;
    }

    if (!(evtPeerId === peerId && (channelProp === 'main' ? 
      channelType === self.DATA_CHANNEL_TYPE.MESSAGING : channelName === transferId))) {
      return;
    }

    if (state === self.DATA_CHANNEL_STATE.OPEN && channelProp !== 'main' && channelName === transferId) {
      self._dataChannels[peerId][channelProp].transferId = transferId;
      sendWRQFn();
      return false;
    }

    return [
      self.DATA_CHANNEL_STATE.CREATE_ERROR,
      self.DATA_CHANNEL_STATE.ERROR,
      self.DATA_CHANNEL_STATE.CLOSING,
      self.DATA_CHANNEL_STATE.CLOSED].indexOf(state) > -1;
  });

  // Create new Datachannel for Peer to start data transfer
  if (!((requireInterop && peerId !== 'MCU') || channelProp === 'main')) {
    channelProp = transferId;
    self._createDataChannel(peerId, transferId, self._dataTransfers[transferId].sessionType === 'data' ?
      self._CHUNK_DATAURL_SIZE : (self._dataTransfers[transferId].sessionChunkType === 'string' ?
      (AdapterJS.webrtcDetectedBrowser === 'firefox' ? 16384 : 65546) : // After conversion to base64 string computed size
      (AdapterJS.webrtcDetectedBrowser === 'firefox' ? self._MOZ_BINARY_FILE_SIZE : self._BINARY_FILE_SIZE)));
  } else {
    channelProp = 'main';
    self._dataChannels[peerId].main.transferId = transferId;
    sendWRQFn();
  }
};

/**
 * Function that returns the data transfer session.
 * @method _getTransferInfo
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getTransferInfo = function (transferId, peerId, returnDataProp, hidePercentage, returnDataAtStart) {
  if (!this._dataTransfers[transferId]) {
    return {};
  }

  var transferInfo = {
    name: this._dataTransfers[transferId].name,
    size: this._dataTransfers[transferId].size,
    dataType: this._dataTransfers[transferId].dataType || this.DATA_TRANSFER_SESSION_TYPE.BLOB,
    mimeType: this._dataTransfers[transferId].mimeType || null,
    chunkSize: this._dataTransfers[transferId].chunkSize,
    chunkType: this._dataTransfers[transferId].chunkType,
    timeout: this._dataTransfers[transferId].timeout,
    isPrivate: this._dataTransfers[transferId].isPrivate,
    direction: this._dataTransfers[transferId].direction
  };

  if (this._dataTransfers[transferId].originalSize) {
    transferInfo.size = this._dataTransfers[transferId].originalSize;

  } else if (this._dataTransfers[transferId].chunkType === this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    transferInfo.size = Math.ceil(transferInfo.size * 3 / 4);
  }

  if (!hidePercentage) {
    transferInfo.percentage = 0;

    if (!this._dataTransfers[transferId].sessions[peerId]) {
      if (returnDataProp) {
        transferInfo.data = null;
      }
      return transferInfo;
    }

    if (this._dataTransfers[transferId].direction === this.DATA_TRANSFER_TYPE.DOWNLOAD) {
      if (this._dataTransfers[transferId].sessions[peerId].receivedSize === this._dataTransfers[transferId].sessions[peerId].size) {
        transferInfo.percentage = 100;

      } else {
        transferInfo.percentage = parseFloat(((this._dataTransfers[transferId].sessions[peerId].receivedSize /
          this._dataTransfers[transferId].size) * 100).toFixed(2), 10);
      }
    } else {
      var chunksLength = (this._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1 ?
        this._dataTransfers[transferId].enforceBSInfo.chunks.length : this._dataTransfers[transferId].chunks.length);

      if (this._dataTransfers[transferId].sessions[peerId].ackN === chunksLength) {
        transferInfo.percentage = 100;

      } else {
        transferInfo.percentage = parseFloat(((this._dataTransfers[transferId].sessions[peerId].ackN /
          chunksLength) * 100).toFixed(2), 10);
      }
    }

    if (returnDataProp) {
      if (typeof returnDataAtStart !== 'number') {
        if (transferInfo.percentage === 100) {
          transferInfo.data = this._getTransferData(transferId);
        } else {
          transferInfo.data = null;
        }
      } else {
        transferInfo.percentage = returnDataAtStart;

        if (returnDataAtStart === 0) {
          transferInfo.data = this._getTransferData(transferId);
        }
      }
    }
  }

  return transferInfo;
};

/**
 * Function that returns the compiled data transfer data.
 * @method _getTransferData
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getTransferData = function (transferId) {
  if (!this._dataTransfers[transferId]) {
    return null;
  }

  if (this._dataTransfers[transferId].dataType === this.DATA_TRANSFER_SESSION_TYPE.BLOB) {
    var mimeType = {
      name: this._dataTransfers[transferId].name
    };

    if (this._dataTransfers[transferId].mimeType) {
      mimeType.type = this._dataTransfers[transferId].mimeType;
    }

    return new Blob(this._dataTransfers[transferId].chunks, mimeType);
  }

  return this._dataTransfers[transferId].chunks.join('');
};

/**
 * Function that handles the data transfers sessions timeouts.
 * @method _handleDataTransferTimeoutForPeer
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._handleDataTransferTimeoutForPeer = function (transferId, peerId, setPeerTO) {
  var self = this;

  if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
    log.debug([peerId, 'RTCDataChannel', transferId, 'Data transfer does not exists for Peer. Ignoring timeout.']);
    return;
  }

  log.debug([peerId, 'RTCDataChannel', transferId, 'Clearing data transfer timer for Peer.']);

  if (self._dataTransfers[transferId].sessions[peerId].timer) {
    clearTimeout(self._dataTransfers[transferId].sessions[peerId].timer);
  }

  self._dataTransfers[transferId].sessions[peerId].timer = null;

  if (setPeerTO) {
    log.debug([peerId, 'RTCDataChannel', transferId, 'Setting data transfer timer for Peer.']);

    self._dataTransfers[transferId].sessions[peerId].timer = setTimeout(function () {
      if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
        log.debug([peerId, 'RTCDataChannel', transferId, 'Data transfer already ended for Peer. Ignoring expired timeout.']);
        return;
      }

      if (!(self._user && self._user.sid)) {
        log.debug([peerId, 'RTCDataChannel', transferId, 'User is not in Room. Ignoring expired timeout.']);
        return;
      }

      if (!self._dataChannels[peerId]) {
        log.debug([peerId, 'RTCDataChannel', transferId, 'Datachannel connection does not exists. Ignoring expired timeout.']);
        return;
      }

      log.error([peerId, 'RTCDataChannel', transferId, 'Data transfer response has timed out.']);

      /**
       * Emit event for Peers function.
       */
      var emitEventFn = function (cb) {
        if (peerId === 'MCU') {
          var broadcastedPeers = [self._dataTransfers[transferId].peers.main,
            self._dataTransfers[transferId].peers[transferId]];

          for (var i = 0; i < broadcastedPeers.length; i++) {
            // Should not happen but insanity check
            if (!broadcastedPeers[i]) {
              continue;
            }

            for (var bcPeerId in broadcastedPeers[i]) {
              if (broadcastedPeers[i].hasOwnProperty(bcPeerId) && broadcastedPeers[i][bcPeerId]) {
                cb(bcPeerId);
              }
            }
          }
        } else {
          cb(peerId);
        }
      };

      var errorMsg = 'Connection Timeout. Longer than ' + self._dataTransfers[transferId].timeout +
        ' seconds. Connection is abolished.';

      self._sendMessageToDataChannel(peerId, {
        type: self._DC_PROTOCOL_TYPE.ERROR,
        content: errorMsg,
        isUploadError: self._dataTransfers[transferId].direction === self.DATA_TRANSFER_TYPE.UPLOAD,
        sender: self._user.sid,
        name: self._dataTransfers[transferId].name
      }, self._dataChannels[peerId][transferId] ? transferId : 'main');

      emitEventFn(function (evtPeerId) {
        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, peerId,
          self._getTransferInfo(transferId, peerId, true, false, false), {
          transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD,
          message: new Error(errorMsg)
        });
      });
    }, self._dataTransfers[transferId].timeout * 1000);
  }
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
  var self = this;

  var channelProp = channelType === self.DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;
  var transferId = self._dataChannels[peerId][channelProp].transferId || null;
  var streamId = self._dataChannels[peerId][channelProp].streamId || null;
  var isStreamChunk = false;

  if (streamId && self._dataStreams[streamId]) {
    isStreamChunk = self._dataStreams[streamId].sessionChunkType === 'string' ? typeof rawData === 'string' :
      typeof rawData === 'object';
  }

  if (!self._peerConnections[peerId]) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping data received from Peer ' +
      'as connection is not present ->'], rawData);
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId][channelProp])) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping data received from Peer ' +
      'as Datachannel connection is not present ->'], rawData);
    return;
  }

  // Expect as string
  if (typeof rawData === 'string') {
    try {
      var protocolData = JSON.parse(rawData);
      isStreamChunk = false;

      log.debug([peerId, 'RTCDataChannel', channelProp, 'Received protocol "' + protocolData.type + '" message ->'], protocolData);

      // Ignore ACK, ERROR and CANCEL if there is no data transfer session in-progress
      if ([self._DC_PROTOCOL_TYPE.ACK, self._DC_PROTOCOL_TYPE.ERROR, self._DC_PROTOCOL_TYPE.CANCEL].indexOf(protocolData.type) > -1 &&
        !(transferId && self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
          log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded protocol message as data transfer session ' +
            'is not present ->'], protocolData);
          return;
      }

      switch (protocolData.type) {
        case self._DC_PROTOCOL_TYPE.WRQ:
          // Discard iOS bidirectional upload when Datachannel is in-progress for data transfers
          if (transferId && self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId]) {
            log.warn([peerId, 'RTCDataChannel', channelProp, 'Rejecting bidirectional data transfer request as ' +
              'it is currently not supported in the SDK ->'], protocolData);

            self._sendMessageToDataChannel(peerId, {
              type: self._DC_PROTOCOL_TYPE.ACK,
              ackN: -1,
              sender: self._user.sid
            }, channelProp);
            return;
          }
          self._WRQProtocolHandler(peerId, protocolData, channelProp);
          break;
        case self._DC_PROTOCOL_TYPE.ACK:
          self._ACKProtocolHandler(peerId, protocolData, channelProp);
          break;
        case self._DC_PROTOCOL_TYPE.ERROR:
          self._ERRORProtocolHandler(peerId, protocolData, channelProp);
          break;
        case self._DC_PROTOCOL_TYPE.CANCEL:
          self._CANCELProtocolHandler(peerId, protocolData, channelProp);
          break;
        case self._DC_PROTOCOL_TYPE.MESSAGE:
          self._MESSAGEProtocolHandler(peerId, protocolData, channelProp);
          break;
        default:
          log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded unknown "' + protocolData.type + '" message ->'], protocolData);
      }

    } catch (error) {
      if (rawData.indexOf('{') > -1 && rawData.indexOf('}') > 0) {
        log.error([peerId, 'RTCDataChannel', channelProp, 'Failed parsing protocol step data error ->'], {
          data: rawData,
          error: error
        });

        self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error, channelName,
          channelType, null, self._getDataChannelBuffer(peerId, channelProp));
        throw error;
      }

      if (!isStreamChunk && !(transferId && self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
        log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded data chunk without session ->'], rawData);
        return;
      }

      if (!isStreamChunk && transferId) {
        if (self._dataTransfers[transferId].chunks[self._dataTransfers[transferId].sessions[peerId].ackN]) {
          log.warn([peerId, 'RTCDataChannel', transferId, 'Dropping data chunk ' + (!isStreamChunk ? '@' +
            self._dataTransfers[transferId].sessions[peerId].ackN : '') + ' as it has already been added ->'], rawData);
          return;
        }
      }

      var chunkType = self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING;

      if (!isStreamChunk ? self._dataTransfers[transferId].dataType === self.DATA_TRANSFER_SESSION_TYPE.DATA_URL : true) {
        log.debug([peerId, 'RTCDataChannel', channelProp, 'Received string data chunk ' + (!isStreamChunk ? '@' +
          self._dataTransfers[transferId].sessions[peerId].ackN : '') + ' with size ->'], rawData.length || rawData.size);

        self._DATAProtocolHandler(peerId, rawData, self.DATA_TRANSFER_DATA_TYPE.STRING,
          rawData.length || rawData.size || 0, channelProp);

      } else {
        var removeSpaceData = rawData.replace(/\s|\r|\n/g, '');

        log.debug([peerId, 'RTCDataChannel', channelProp, 'Received binary string data chunk @' +
          self._dataTransfers[transferId].sessions[peerId].ackN + ' with size ->'],
          removeSpaceData.length || removeSpaceData.size);

        self._DATAProtocolHandler(peerId, self._base64ToBlob(removeSpaceData), self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
          removeSpaceData.length || removeSpaceData.size || 0, channelProp);
      }
    }
  } else {
    if (!isStreamChunk && !(transferId && self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
      log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded data chunk without session ->'], rawData);
      return;
    }

    if (!isStreamChunk && transferId) {
      if (self._dataTransfers[transferId].chunks[self._dataTransfers[transferId].sessions[peerId].ackN]) {
        log.warn([peerId, 'RTCDataChannel', transferId, 'Dropping data chunk ' + (!isStreamChunk ? '@' +
          self._dataTransfers[transferId].sessions[peerId].ackN : '') + ' as it has already been added ->'], rawData);
        return;
      }
    }

    if (rawData instanceof Blob) {
      log.debug([peerId, 'RTCDataChannel', channelProp, 'Received blob data chunk ' + (isStreamChunk ? '' :
        '@' + self._dataTransfers[transferId].sessions[peerId].ackN) + ' with size ->'], rawData.size);

      self._DATAProtocolHandler(peerId, rawData, self.DATA_TRANSFER_DATA_TYPE.BLOB, rawData.size, channelProp);

    } else {
      var byteArray = rawData;
      var blob = null;

      // Plugin binary handling
      if (rawData.constructor && rawData.constructor.name === 'Array') {
        // Need to re-parse on some browsers
        byteArray = new Int8Array(rawData);
      }

      // Fallback for older IE versions
      if (AdapterJS.webrtcDetectedBrowser === 'IE') {
        if (window.BlobBuilder) {
          var bb = new BlobBuilder();
          bb.append(rawData.constructor && rawData.constructor.name === 'ArrayBuffer' ?
            byteArray : (new Uint8Array(byteArray)).buffer);
          blob = bb.getBlob();
        }
      } else {
        blob = new Blob([byteArray]);
      }

      log.debug([peerId, 'RTCDataChannel', channelProp, 'Received arraybuffer data chunk ' + (isStreamChunk ? '' :
        '@' + self._dataTransfers[transferId].sessions[peerId].ackN) + ' with size ->'], blob.size);

      self._DATAProtocolHandler(peerId, blob, self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER, blob.size, channelProp);
    }
  }
};

/**
 * Function that handles the "WRQ" data transfer protocol.
 * @method _WRQProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._WRQProtocolHandler = function(peerId, data, channelProp) {
  var self = this;
  var transferId = channelProp === 'main' ? data.transferId || null : channelProp;
  var senderPeerId = data.sender || peerId;

  if (['fastBinaryStart', 'fastBinaryStop'].indexOf(data.dataType) > -1) {
    if (data.dataType === 'fastBinaryStart') {
      if (!transferId) {
        transferId = 'stream_' + peerId + '_' + (new Date()).getTime();
      }
      self._dataStreams[transferId] = {
        chunkSize: 0,
        chunkType: data.chunkType === 'string' ? self.DATA_TRANSFER_DATA_TYPE.STRING : self._binaryChunkType,
        sessionChunkType: data.chunkType,
        isPrivate: !!data.isPrivate,
        isStringStream: data.chunkType === 'string',
        senderPeerId: senderPeerId,
        isUpload: false
      };
      self._dataChannels[peerId][channelProp].streamId = transferId;
      var hasStarted = false;
      self.once('dataChannelState', function () {}, function (state, evtPeerId, channelName, channelType, error) {
        if (!self._dataStreams[transferId]) {
          return true;
        }

        if (!(evtPeerId === peerId && (channelProp === 'main' ? channelType === self.DATA_CHANNEL_TYPE.MESSAGING :
          channelName === transferId && channelType === self.DATA_CHANNEL_TYPE.DATA))) {
          return;
        }

        if ([self.DATA_CHANNEL_STATE.ERROR, self.DATA_CHANNEL_STATE.CLOSED].indexOf(state) > -1) {
          var updatedError = new Error(error && error.message ? error.message :
            'Failed data transfer as datachannel state is "' + state + '".');

          self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, senderPeerId, {
            chunk: null,
            chunkSize: 0,
            chunkType: self._dataStreams[transferId].chunkType,
            isPrivate: self._dataStreams[transferId].isPrivate,
            isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
            senderPeerId: senderPeerId
          }, updatedError);
          return true;
        }
      });

      self._trigger('dataStreamState', self.DATA_STREAM_STATE.RECEIVING_STARTED, transferId, senderPeerId, {
        chunk: null,
        chunkSize: 0,
        chunkType: self._dataStreams[transferId].chunkType,
        isPrivate: self._dataStreams[transferId].isPrivate,
        isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
        senderPeerId: senderPeerId
      }, null);
      self._trigger('incomingDataStreamStarted', transferId, senderPeerId, {
        chunkSize: 0,
        chunkType: self._dataStreams[transferId].chunkType,
        isPrivate: self._dataStreams[transferId].isPrivate,
        isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
        senderPeerId: senderPeerId
      }, false);

    } else {
      transferId = self._dataChannels[peerId][channelProp].streamId;
      if (self._dataStreams[transferId] && !self._dataStreams[transferId].isUpload) {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.RECEIVING_STOPPED, transferId, senderPeerId, {
          chunk: null,
          chunkSize: 0,
          chunkType: self._dataStreams[transferId].chunkType,
          isPrivate: self._dataStreams[transferId].isPrivate,
          isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
          senderPeerId: senderPeerId
        }, null);
        self._trigger('incomingDataStreamStopped', transferId, senderPeerId, {
          chunkSize: 0,
          chunkType: self._dataStreams[transferId].chunkType,
          isPrivate: self._dataStreams[transferId].isPrivate,
          isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
          senderPeerId: senderPeerId
        }, false);
        self._dataChannels[peerId][channelProp].streamId = null;
        if (channelProp !== 'main') {
          self._closeDataChannel(peerId, channelProp);
        }

        delete self._dataStreams[transferId];
      }
    }
  } else {
    if (!transferId) {
      transferId = 'transfer_' + peerId + '_' + (new Date()).getTime();
    }

    self._dataTransfers[transferId] = {
      name: data.name || transferId,
      size: data.size || 0,
      chunkSize: data.chunkSize,
      originalSize: data.originalSize || 0,
      timeout: data.timeout || 60,
      isPrivate: !!data.isPrivate,
      senderPeerId: data.sender || peerId,
      dataType: self.DATA_TRANSFER_SESSION_TYPE.BLOB,
      mimeType: data.mimeType || null,
      chunkType: self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
      direction: self.DATA_TRANSFER_TYPE.DOWNLOAD,
      chunks: [],
      sessions: {},
      sessionType: data.dataType || 'blob',
      sessionChunkType: data.chunkType || 'string'
    };

    if (self._dataTransfers[transferId].sessionType === 'data' &&
      self._dataTransfers[transferId].sessionChunkType === 'string') {
      self._dataTransfers[transferId].dataType = self.DATA_TRANSFER_SESSION_TYPE.DATA_URL;
      self._dataTransfers[transferId].chunkType = self.DATA_TRANSFER_DATA_TYPE.STRING;
    } else if (self._dataTransfers[transferId].sessionType === 'blob' &&
      self._dataTransfers[transferId].sessionChunkType === 'binary') {
      self._dataTransfers[transferId].chunkType = self._binaryChunkType;
    }

    self._dataChannels[peerId][channelProp].transferId = transferId;
    self._dataTransfers[transferId].sessions[peerId] = {
      timer: null,
      ackN: 0,
      receivedSize: 0
    };

    self._trigger('incomingDataRequest', transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, false, false, false), false);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_REQUEST, transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), null);
  }
};

/**
 * Function that handles the "ACK" data transfer protocol.
 * @method _ACKProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ACKProtocolHandler = function(peerId, data, channelProp) {
  var self = this;

  var transferId = channelProp;
  var senderPeerId = data.sender || peerId;

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  self._handleDataTransferTimeoutForPeer(transferId, peerId, false);

  /**
   * Emit event for Peers function.
   */
  var emitEventFn = function (cb) {
    if (peerId === 'MCU') {
      if (!self._dataTransfers[transferId].peers[channelProp]) {
        log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping triggering of ACK event as ' +
          'Peers list does not exists']);
        return;
      }
      for (var evtPeerId in self._dataTransfers[transferId].peers[channelProp]) {
        if (self._dataTransfers[transferId].peers[channelProp].hasOwnProperty(evtPeerId) &&
          self._dataTransfers[transferId].peers[channelProp][evtPeerId]) {
          cb(evtPeerId);
        }
      }
    } else {
      cb(senderPeerId);
    }
  };

  if (data.ackN > -1) {
    if (data.ackN === 0) {
      emitEventFn(function (evtPeerId) {
        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_STARTED, transferId, evtPeerId,
          self._getTransferInfo(transferId, peerId, true, false, 0), null);
      });
    } else if (self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1 ?
      data.ackN === self._dataTransfers[transferId].enforceBSInfo.chunks.length :
      data.ackN === self._dataTransfers[transferId].chunks.length) {
      self._dataTransfers[transferId].sessions[peerId].ackN = data.ackN;

      emitEventFn(function (evtPeerId) {
        self._trigger('incomingData', self._getTransferData(transferId), transferId, evtPeerId,
          self._getTransferInfo(transferId, peerId, false, false, false), true);

        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, transferId, evtPeerId,
          self._getTransferInfo(transferId, peerId, true, false, 100), null);
      });

      if (self._dataChannels[peerId][channelProp]) {
        self._dataChannels[peerId][channelProp].transferId = null;

        if (channelProp !== 'main') {
          self._closeDataChannel(peerId, channelProp);
        }
      }
      return;
    }

    var uploadFn = function (chunk) {
      self._sendMessageToDataChannel(peerId, chunk, channelProp, true);

      if (data.ackN < self._dataTransfers[transferId].chunks.length) {
        emitEventFn(function (evtPeerId) {
          self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOADING, transferId, evtPeerId,
            self._getTransferInfo(transferId, peerId, true, false, false), null);
        });
      }

      self._handleDataTransferTimeoutForPeer(transferId, peerId, true);
    };

    self._dataTransfers[transferId].sessions[peerId].ackN = data.ackN;

    if (self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1) {
      self._blobToBase64(self._dataTransfers[transferId].enforceBSInfo.chunks[data.ackN], uploadFn);
    } else if (self._dataTransfers[transferId].chunkType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
      self._blobToBase64(self._dataTransfers[transferId].chunks[data.ackN], uploadFn);
    } else if (self._dataTransfers[transferId].chunkType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
      self._blobToArrayBuffer(self._dataTransfers[transferId].chunks[data.ackN], uploadFn);
    } else {
      uploadFn(self._dataTransfers[transferId].chunks[data.ackN]);
    }
  } else {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.REJECTED, transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), {
      message: new Error('Data transfer terminated as Peer has rejected data transfer request'),
      transferType: self.DATA_TRANSFER_TYPE.UPLOAD
    });
  }
};

/**
 * Function that handles the "MESSAGE" data transfer protocol.
 * @method _MESSAGEProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MESSAGEProtocolHandler = function(peerId, data, channelProp) {
  var senderPeerId = data.sender || peerId;

  log.log([senderPeerId, 'RTCDataChannel', channelProp, 'Received P2P message from peer:'], data);

  this._trigger('incomingMessage', {
    content: data.data,
    isPrivate: data.isPrivate,
    isDataChannel: true,
    targetPeerId: this._user.sid,
    senderPeerId: senderPeerId
  }, senderPeerId, this.getPeerInfo(senderPeerId), false);
};

/**
 * Function that handles the "ERROR" data transfer protocol.
 * @method _ERRORProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ERRORProtocolHandler = function(peerId, data, channelProp) {
  var self = this;

  var transferId = channelProp;
  var senderPeerId = data.sender || peerId;

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  self._handleDataTransferTimeoutForPeer(transferId, peerId, false);

  /**
   * Emit event for Peers function.
   */
  var emitEventFn = function (cb) {
    if (peerId === 'MCU') {
      if (!self._dataTransfers[transferId].peers[channelProp]) {
        log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping triggering of ERROR event as ' +
          'Peers list does not exists']);
        return;
      }
      for (var evtPeerId in self._dataTransfers[transferId].peers[channelProp]) {
        if (self._dataTransfers[transferId].peers[channelProp].hasOwnProperty(evtPeerId) &&
          self._dataTransfers[transferId].peers[channelProp][evtPeerId]) {
          cb(evtPeerId);
        }
      }
    } else {
      cb(senderPeerId);
    }
  };

  log.error([peerId, 'RTCDataChannel', channelProp, 'Received an error from peer ->'], data);

  emitEventFn(function (evtPeerId) {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, evtPeerId,
      self._getTransferInfo(transferId, peerID, true, false, false), {
      message: new Error(data.content),
      transferType: self._dataTransfers[transferId].direction
    });
  });
};

/**
 * Function that handles the "CANCEL" data transfer protocol.
 * @method _CANCELProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._CANCELProtocolHandler = function(peerId, data, channelProp) {
  var self = this;
  var transferId = channelProp;

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  self._handleDataTransferTimeoutForPeer(transferId, peerId, false);

  /**
   * Emit event for Peers function.
   */
  var emitEventFn = function (cb) {
    if (peerId === 'MCU') {
      if (!self._dataTransfers[transferId].peers[channelProp]) {
        log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping triggering of CANCEL event as ' +
          'Peers list does not exists']);
        return;
      }
      for (var evtPeerId in self._dataTransfers[transferId].peers[channelProp]) {
        if (self._dataTransfers[transferId].peers[channelProp].hasOwnProperty(evtPeerId) &&
          self._dataTransfers[transferId].peers[channelProp][evtPeerId]) {
          cb(evtPeerId);
        }
      }
    } else {
      cb(peerId);
    }
  };

  log.error([peerId, 'RTCDataChannel', channelProp, 'Received data transfer termination from peer ->'], data);

  emitEventFn(function (evtPeerId) {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.CANCEL, transferId, evtPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), {
      message: new Error(data.content || 'Peer has terminated data transfer.'),
      transferType: self._dataTransfers[transferId].direction
    });
  });
};

/**
 * Function that handles the data transfer chunk received.
 * @method _DATAProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._DATAProtocolHandler = function(peerId, chunk, chunkType, chunkSize, channelProp) {
  var self = this;
  var transferId = channelProp;
  var senderPeerId = peerId;

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId][channelProp])) {
    return;
  }

  var streamId = self._dataChannels[peerId][channelProp].streamId;

  if (streamId && self._dataStreams[streamId] && ((typeof chunk === 'string' &&
    self._dataStreams[streamId].sessionChunkType === 'string') || (chunk instanceof Blob &&
    self._dataStreams[streamId].sessionChunkType === 'binary'))) {
    senderPeerId = self._dataStreams[streamId].senderPeerId || peerId;
    self._trigger('dataStreamState', self.DATA_STREAM_STATE.RECEIVED, streamId, senderPeerId, {
      chunk: chunk,
      chunkSize: chunkSize,
      chunkType: chunkType,
      isPrivate: self._dataStreams[streamId].sessionChunkType.isPrivate,
      isStringStream: self._dataStreams[streamId].sessionChunkType === 'string',
      senderPeerId: senderPeerId
    }, null);
    self._trigger('incomingDataStream', chunk, transferId, senderPeerId, {
      chunkSize: chunkSize,
      chunkType: chunkType,
      isPrivate: self._dataStreams[streamId].sessionChunkType.isPrivate,
      isStringStream: self._dataStreams[streamId].sessionChunkType === 'string',
      senderPeerId: senderPeerId
    }, false);
    return;
  }

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  if (self._dataTransfers[transferId].senderPeerId) {
    senderPeerId = self._dataTransfers[transferId].senderPeerId;
  }

  self._handleDataTransferTimeoutForPeer(transferId, peerId, false);

  self._dataTransfers[transferId].chunkType = chunkType;
  self._dataTransfers[transferId].sessions[peerId].receivedSize += chunkSize;
  self._dataTransfers[transferId].chunks[self._dataTransfers[transferId].sessions[peerId].ackN] = chunk;

  if (self._dataTransfers[transferId].sessions[peerId].receivedSize >= self._dataTransfers[transferId].size) {
    log.log([peerId, 'RTCDataChannel', channelProp, 'Data transfer has been completed. Computed size ->'],
      self._dataTransfers[transferId].sessions[peerId].receivedSize);

    // Send last ACK to Peer to indicate completion of data transfers
    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.ACK,
      sender: self._user.sid,
      ackN: self._dataTransfers[transferId].sessions[peerId].ackN + 1
    }, channelProp);

    self._trigger('incomingData', self._getTransferData(transferId), transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, false, false, false), null);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED, transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), null);
    return;
  }

  self._dataTransfers[transferId].sessions[peerId].ackN += 1;

  self._sendMessageToDataChannel(peerId, {
    type: self._DC_PROTOCOL_TYPE.ACK,
    sender: self._user.sid,
    ackN: self._dataTransfers[transferId].sessions[peerId].ackN
  }, channelProp);

  self._handleDataTransferTimeoutForPeer(transferId, peerId, true);

  self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.DOWNLOADING, transferId, senderPeerId,
    self._getTransferInfo(transferId, peerId, true, false, false), null);
};
Skylink.prototype._onIceCandidate = function(targetMid, candidate) {
  var self = this;
  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.warn([targetMid, 'RTCIceCandidate', null, 'Ignoring of ICE candidate event as ' +
      'Peer connection does not exists ->'], candidate);
    return;
  }

  if (candidate.candidate) {
    if (!pc.gathering) {
      log.log([targetMid, 'RTCIceCandidate', null, 'ICE gathering has started.']);

      pc.gathering = true;
      pc.gathered = false;

      self._trigger('candidateGenerationState', self.CANDIDATE_GENERATION_STATE.GATHERING, targetMid);
    }

    var candidateType = candidate.candidate.split(' ')[7];

    log.debug([targetMid, 'RTCIceCandidate', candidateType, 'Generated ICE candidate ->'], candidate);

    if (candidateType === 'endOfCandidates' || !(self._peerConnections[targetMid] &&
      self._peerConnections[targetMid].localDescription && self._peerConnections[targetMid].localDescription.sdp &&
      self._peerConnections[targetMid].localDescription.sdp.indexOf('\r\na=mid:' + candidate.sdpMid + '\r\n') > -1)) {
      log.warn([targetMid, 'RTCIceCandidate', candidateType, 'Dropping of sending ICE candidate ' +
        'end-of-candidates signal or unused ICE candidates to prevent errors ->'], candidate);
      return;
    }

    if (self._initOptions.filterCandidatesType[candidateType]) {
      if (!(self._hasMCU && self._initOptions.forceTURN)) {
        log.warn([targetMid, 'RTCIceCandidate', candidateType, 'Dropping of sending ICE candidate as ' +
          'it matches ICE candidate filtering flag ->'], candidate);
        return;
      }

      log.warn([targetMid, 'RTCIceCandidate', candidateType, 'Not dropping of sending ICE candidate as ' +
        'TURN connections are enforced as MCU is present (and act as a TURN itself) so filtering of ICE candidate ' +
        'flags are not honoured ->'], candidate);
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

    if (!self._initOptions.enableIceTrickle) {
      log.warn([targetMid, 'RTCIceCandidate', candidateType, 'Dropping of sending ICE candidate as ' +
        'trickle ICE is disabled ->'], candidate);
      return;
    }

    log.debug([targetMid, 'RTCIceCandidate', candidateType, 'Sending ICE candidate ->'], candidate);

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
    log.log([targetMid, 'RTCIceCandidate', null, 'ICE gathering has completed.']);

    if (pc.gathered) {
      return;
    }

    pc.gathering = false;
    pc.gathered = true;

    self._trigger('candidateGenerationState', self.CANDIDATE_GENERATION_STATE.COMPLETED, targetMid);

    // Disable Ice trickle option
    if (!self._initOptions.enableIceTrickle) {
      var sessionDescription = self._peerConnections[targetMid].localDescription;

      if (!(sessionDescription && sessionDescription.type && sessionDescription.sdp)) {
        log.warn([targetMid, 'RTCSessionDescription', null, 'Not sending any session description after ' +
          'ICE gathering completed as it is not present.']);
        return;
      }

      // a=end-of-candidates should present in non-trickle ICE connections so no need to send endOfCandidates message
      self._sendChannelMessage({
        type: sessionDescription.type,
        sdp: self._renderSDPOutput(targetMid, sessionDescription),
        mid: self._user.sid,
        userInfo: self._getUserInfo(targetMid),
        target: targetMid,
        rid: self._room.id
      });
    } else if (self._gatheredCandidates[targetMid]) {
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.END_OF_CANDIDATES,
        noOfExpectedCandidates: self._gatheredCandidates[targetMid].sending.srflx.length +
          self._gatheredCandidates[targetMid].sending.host.length +
          self._gatheredCandidates[targetMid].sending.relay.length,
        mid: self._user.sid,
        target: targetMid,
        rid: self._room.id
      });
    }
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
Skylink.prototype._addIceCandidateToQueue = function(targetMid, canId, candidate) {
  var candidateType = candidate.candidate.split(' ')[7];

  log.debug([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Buffering ICE candidate.']);

  this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.BUFFERED,
    targetMid, canId, candidateType, {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex
  }, null);

  this._peerCandidatesQueue[targetMid] = this._peerCandidatesQueue[targetMid] || [];
  this._peerCandidatesQueue[targetMid].push([canId, candidate]);
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
  this._peerCandidatesQueue[targetMid] = this._peerCandidatesQueue[targetMid] || [];

  for (var i = 0; i < this._peerCandidatesQueue[targetMid].length; i++) {
    var canArray = this._peerCandidatesQueue[targetMid][i];

    if (canArray) {
      var candidateType = canArray[1].candidate.split(' ')[7];

      log.debug([targetMid, 'RTCIceCandidate', canArray[0] + ':' + candidateType, 'Adding buffered ICE candidate.']);

      this._addIceCandidate(targetMid, canArray[0], canArray[1]);
    } else if (this._peerConnections[targetMid] &&
      this._peerConnections[targetMid].signalingState !== this.PEER_CONNECTION_STATE.CLOSED &&
      AdapterJS && !this._isLowerThanVersion(AdapterJS.VERSION, '0.14.0')) {
      try {
        this._peerConnections[targetMid].addIceCandidate(null);
        log.debug([targetMid, 'RTCPeerConnection', null, 'Signaling of end-of-candidates remote ICE gathering.']);
      } catch (error) {
        log.error([targetMid, 'RTCPeerConnection', null, 'Failed signaling of end-of-candidates remote ICE gathering.']);
      }
    }
  }

  delete this._peerCandidatesQueue[targetMid];

  this._signalingEndOfCandidates(targetMid);
};

/**
 * Function that adds the ICE candidate to Peer connection.
 * @method _addIceCandidate
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._addIceCandidate = function (targetMid, canId, candidate) {
  var self = this;
  var candidateType = candidate.candidate.split(' ')[7];

  var onSuccessCbFn = function () {
    log.log([targetMid, 'RTCIceCandidate', canId + ':' + candidateType,
      'Added ICE candidate successfully.']);
    self._trigger('candidateProcessingState', self.CANDIDATE_PROCESSING_STATE.PROCESS_SUCCESS,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, null);
  };

  var onErrorCbFn = function (error) {
    log.error([targetMid, 'RTCIceCandidate', canId + ':' + candidateType,
      'Failed adding ICE candidate ->'], error);
    self._trigger('candidateProcessingState', self.CANDIDATE_PROCESSING_STATE.PROCESS_ERROR,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, error);
  };

  log.debug([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Adding ICE candidate.']);

  self._trigger('candidateProcessingState', self.CANDIDATE_PROCESSING_STATE.PROCESSING,
    targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, null);

  if (!(self._peerConnections[targetMid] &&
    self._peerConnections[targetMid].signalingState !== self.PEER_CONNECTION_STATE.CLOSED &&
    self._peerConnections[targetMid].remoteDescription &&
    self._peerConnections[targetMid].remoteDescription.sdp &&
    self._peerConnections[targetMid].remoteDescription.sdp.indexOf('\r\na=mid:' + candidate.sdpMid + '\r\n') > -1)) {
    log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Dropping ICE candidate ' +
      'as Peer connection does not exists or is closed']);
    self._trigger('candidateProcessingState', self.CANDIDATE_PROCESSING_STATE.DROPPED,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, new Error('Failed processing ICE candidate as Peer connection does not exists or is closed.'));
    return;
  }

  try {
    self._peerConnections[targetMid].addIceCandidate(candidate, onSuccessCbFn, onErrorCbFn);
  } catch (error) {
    onErrorCbFn(error);
  }
};
Skylink.prototype._setIceServers = function(passedIceServers) {
  var self = this;
  var iceServerName = null;
  var iceServerProtocol = 'stun';
  var iceServerPorts = {
    udp: [3478, 19302, 19303, 19304],
    tcp: [80, 443],
    both: [19305, 19306, 19307, 19308]
  };
  var iceServers = [
    // Public
    { urls: [] },
    // Private
    { urls: [] }
  ];

  // Note: Provide only 1 single TURN! turn:xxxx.io for custom TURN servers. Ignores custom ports.
  passedIceServers.forEach(function (server) {
    if (server.url.indexOf('stun:') === 0) {
      if (server.url.indexOf('temasys') > 0) {
        // server[?transport=xxx]
        iceServerName = (server.url.split(':')[1] || '').split('?')[0] || null;
      } else {
        iceServers[0].urls.push(server.url);
      }

    } else if (server.url.indexOf('turn:') === 0 && server.url.indexOf('@') > 0 && server.credential &&
      !(iceServers[1].username || iceServers[1].credential)) {
      var parts = server.url.split(':');
      var urlParts = (parts[1] || '').split('@');

      // server[?transport=xxx]
      iceServerName = (urlParts[1] || '').split('?')[0];
      iceServers[1].username = urlParts[0];
      iceServers[1].credential = server.credential;
      iceServerProtocol = 'turn';
    }
  });

  if (self._initOptions.iceServer) {
    iceServers = [{
      urls: self._initOptions.iceServer.urls,
      username: iceServers[1].username || null,
      credential: iceServers[1].credential || null
    }];

  } else {
    iceServerName = iceServerName || 'turn.temasys.io';

    if (iceServerProtocol === 'turn' && !self._initOptions.enableTURNServer && !self._initOptions.forceTURNSSL) {
      iceServerProtocol = 'stun';

    } else if (AdapterJS.webrtcDetectedBrowser === 'edge') {
      iceServerPorts.udp = [3478];
      iceServerPorts.tcp = [];
      iceServerPorts.both = [];
      iceServerProtocol = 'turn';

    } else if (self._initOptions.forceTURNSSL) {
      if (AdapterJS.webrtcDetectedBrowser === 'firefox' && AdapterJS.webrtcDetectedVersion < 53) {
        iceServerPorts.udp = [];
        iceServerPorts.tcp = [443];
        iceServerPorts.both = [];
        iceServerProtocol = 'turn';

      } else {
        iceServerPorts.udp = [];
        iceServerProtocol = 'turns';
      }

    // Limit the number of ports..
    } else if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
      iceServerPorts.udp = [3478];
      iceServerPorts.tcp = [443, 80];
    }

    if (self._initOptions.TURNServerTransport === self.TURN_TRANSPORT.UDP && !self._initOptions.forceTURNSSL) {
      iceServerPorts.udp = iceServerPorts.udp.concat(iceServerPorts.both);
      iceServerPorts.tcp = [];
      iceServerPorts.both = [];

    } else if (self._initOptions.TURNServerTransport === self.TURN_TRANSPORT.TCP) {
      iceServerPorts.tcp = iceServerPorts.tcp.concat(iceServerPorts.both);
      iceServerPorts.udp = [];
      iceServerPorts.both = [];

    } else if (self._initOptions.TURNServerTransport === self.TURN_TRANSPORT.NONE) {
      iceServerPorts.tcp = [];
      iceServerPorts.udp = [];
    }

    if (iceServerProtocol === 'stun') {
      iceServerPorts.tcp = [];
    }

    if (iceServerProtocol === 'stun' && !self._initOptions.enableSTUNServer) {
      iceServers = [];

    } else {
      iceServerPorts.tcp.forEach(function (tcpPort) {
        iceServers[1].urls.push(iceServerProtocol + ':' + iceServerName + ':' + tcpPort + '?transport=tcp');
      });

      iceServerPorts.udp.forEach(function (udpPort) {
        iceServers[1].urls.push(iceServerProtocol + ':' + iceServerName + ':' + udpPort + '?transport=udp');
      });

      iceServerPorts.both.forEach(function (bothPort) {
        iceServers[1].urls.push(iceServerProtocol + ':' + iceServerName + ':' + bothPort);
      });

      if (!self._initOptions.usePublicSTUN) {
        iceServers.splice(0, 1);
      }
    }
  }

  log.log('Output iceServers configuration:', iceServers);  

  return {
    iceServers: iceServers
  };
};
Skylink.prototype.refreshConnection = function(targetPeerId, iceRestart, options, callback) {
  var self = this;

  var listOfPeers = Object.keys(self._peerConnections);
  var doIceRestart = false;
  var bwOptions = {};

  if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (typeof targetPeerId === 'boolean') {
    doIceRestart = targetPeerId;
  } else if (targetPeerId && typeof targetPeerId === 'object') {
    bwOptions = targetPeerId;
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  if (typeof iceRestart === 'boolean') {
    doIceRestart = iceRestart;
  } else if (iceRestart && typeof iceRestart === 'object') {
    bwOptions = iceRestart;
  } else if (typeof iceRestart === 'function') {
    callback = iceRestart;
  }

  if (options && typeof options === 'object') {
    bwOptions = options;
  } else if (typeof options === 'function') {
    callback = options;
  }

  var emitErrorForPeersFn = function (error) {
    log.error(error);

    if (typeof callback === 'function') {
      var listOfPeerErrors = {};

      if (listOfPeers.length === 0) {
        listOfPeerErrors.self = new Error(error);
      } else {
        for (var i = 0; i < listOfPeers.length; i++) {
          listOfPeerErrors[listOfPeers[i]] = new Error(error);
        }
      }

      callback({
        refreshErrors: listOfPeerRestartErrors,
        listOfPeers: listOfPeers
      }, null);
    }
  };

  if (listOfPeers.length === 0 && !(self._hasMCU && !self._initOptions.mcuUseRenegoRestart)) {
    emitErrorForPeersFn('There is currently no peer connections to restart');
    return;
  }

  if (AdapterJS.webrtcDetectedBrowser === 'edge') {
    emitErrorForPeersFn('Edge browser currently does not support renegotiation.');
    return;
  }

  self._throttle(function (runFn) {
    if (!runFn && self._hasMCU && !self._initOptions.mcuUseRenegoRestart) {
      if (self._initOptions.throttlingShouldThrowError) {
        emitErrorForPeersFn('Unable to run as throttle interval has not reached (' + self._initOptions.throttleIntervals.refreshConnection + 'ms).');
      }
      return;
    }
    self._refreshPeerConnection(listOfPeers, doIceRestart, bwOptions, callback);
  }, 'refreshConnection', self._initOptions.throttleIntervals.refreshConnection);

};

/**
 * Function that refresh connections.
 * @method _refreshPeerConnection
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._refreshPeerConnection = function(listOfPeers, doIceRestart, bwOptions, callback) {
  var self = this;
  var listOfPeerRestarts = [];
  var error = '';
  var listOfPeerRestartErrors = {};
  var listOfPeersSettings = {};

  // To fix jshint dont put functions within a loop
  var refreshSinglePeerCallback = function (peerId) {
    return function (error) {
      if (listOfPeerRestarts.indexOf(peerId) === -1) {
        if (error) {
          log.error([peerId, 'RTCPeerConnection', null, 'Failed restarting for peer'], error);
          listOfPeerRestartErrors[peerId] = error;
        } else {
          listOfPeersSettings[peerId] = {
            iceRestart: !self._hasMCU && self._peerInformations[peerId] && self._peerInformations[peerId].config &&
              self._peerInformations[peerId].config.enableIceRestart && self._enableIceRestart && doIceRestart,
            customSettings: self.getPeersCustomSettings()[peerId] || {}
          };
        }
        listOfPeerRestarts.push(peerId);
      }

      if (listOfPeerRestarts.length === listOfPeers.length) {
        if (typeof callback === 'function') {
          log.log([null, 'PeerConnection', null, 'Invoked all peers to restart. Firing callback']);

          if (Object.keys(listOfPeerRestartErrors).length > 0) {
            callback({
              refreshErrors: listOfPeerRestartErrors,
              listOfPeers: listOfPeers,
              refreshSettings: listOfPeersSettings
            }, null);
          } else {
            callback(null, {
              listOfPeers: listOfPeers,
              refreshSettings: listOfPeersSettings
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
      peerCallback(error);
      return;
    }

    log.log([peerId, 'PeerConnection', null, 'Restarting peer connection']);

    // do a hard reset on variable object
    self._restartPeerConnection(peerId, doIceRestart, bwOptions, peerCallback);
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
        refreshSinglePeerCallback(peerId)(error);
      }
    }
  } else {
    self._restartMCUConnection(callback, doIceRestart, bwOptions);
  }
};

/**
 * <blockquote class="info">
 * Note that this is not well supported in the Edge browser.
 * </blockquote>
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

  if (AdapterJS.webrtcDetectedBrowser === 'edge') {
    log.warn('Edge browser does not have well support for stats.');
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
    var retrieveFn = function (firstRetrieval, nextCb) {
      return function (err, result) {
        if (err) {
          log.error([peerId, 'RTCStatsReport', null, 'Retrieval failure ->'], error);
          listOfPeerErrors[peerId] = error;
          self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_ERROR,
            peerId, null, error);
          checkCompletedFn(peerId);
          if (firstRetrieval) {
            delete self._peerStats[peerId];
          }
          return;
        }

        if (firstRetrieval) {
          nextCb();
        } else {
          listOfPeerStats[peerId] = result;
          self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_SUCCESS,
            peerId, listOfPeerStats[peerId], null);
          checkCompletedFn(peerId);
        }
      };
    };

    if (!self._peerStats[peerId]) {
      self._peerStats[peerId] = {};

      log.debug([peerId, 'RTCStatsReport', null, 'Retrieving first report to tabulate results']);

      self._retrieveStats(peerId, retrieveFn(true, function () {
        self._retrieveStats(peerId, retrieveFn());
      }), true);
      return;
    }

    self._retrieveStats(peerId, retrieveFn());
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
 * Function that retrieves Peer connection stats.
 * @method _retrieveStats
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._retrieveStats = function (peerId, callback, beSilentOnLogs, isAutoBwStats) {
  var self = this;
  var pc = self._peerConnections[peerId];
  var output = {
    raw: {},
    connection: {},
    audio: {
      sending: {},
      receiving: {} },
    video: {
      sending: {},
      receiving: {}
    },
    selectedCandidate: {
      local: {},
      remote: {},
      consentResponses: {},
      consentRequests: {},
      responses: {},
      requests: {}
    },
    certificate: {}
  };

  // Peer stats has to be retrieved once first before the second time.
  if (!self._peerStats[peerId] && !isAutoBwStats) {
    return callback(new Error('No stats initiated yet.'));
  } else if (!pc) {
    return callback(new Error('Peer connection is not initialised'));
  }

  // Warn due to Edge not giving complete stats and returning as 0 sometimes..
  if (AdapterJS.webrtcDetectedBrowser === 'edge' || AdapterJS.webrtcDetectedType === 'AppleWebKit') {
    log.warn('Current connection stats may not be complete as it is in beta');
  }

  // Parse RTCPeerConnection details
  output.connection.iceConnectionState = pc.iceConnectionState;
  output.connection.iceGatheringState = pc.iceGatheringState;
  output.connection.signalingState = pc.signalingState;
  output.connection.remoteDescription = {
    type: (pc.remoteDescription && pc.remoteDescription.type) || '',
    sdp : (pc.remoteDescription && pc.remoteDescription.sdp) || ''
  };
  output.connection.localDescription = {
    type: (pc.localDescription && pc.localDescription.type) || '',
    sdp : (pc.localDescription && pc.localDescription.sdp) || ''
  };
  output.connection.candidates = {
    sending: self._getSDPICECandidates(peerId, pc.localDescription, beSilentOnLogs),
    receiving: self._getSDPICECandidates(peerId, pc.remoteDescription, beSilentOnLogs)
  };
  output.connection.dataChannels = {};
  output.connection.constraints = self._peerConnStatus[peerId] ? self._peerConnStatus[peerId].constraints : null;
  output.connection.optional = self._peerConnStatus[peerId] ? self._peerConnStatus[peerId].optional : null;
  output.connection.sdpConstraints = self._peerConnStatus[peerId] ? self._peerConnStatus[peerId].sdpConstraints : null;

  // Parse workaround possible codecs details
  output.audio.sending.codec = self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'audio', beSilentOnLogs);
  output.video.sending.codec = self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'video', beSilentOnLogs);
  output.audio.receiving.codec = self._getSDPSelectedCodec(peerId, pc.localDescription, 'audio', beSilentOnLogs);
  output.video.receiving.codec = self._getSDPSelectedCodec(peerId, pc.localDescription, 'video', beSilentOnLogs);
  
  // Parse workaround possible certificate details
  output.certificate.local = self._getSDPFingerprint(peerId, pc.localDescription, beSilentOnLogs);
  output.certificate.remote = self._getSDPFingerprint(peerId, pc.remoteDescription, beSilentOnLogs);

  // Parse workaround possible SSRC details to prevent receiving 0 from Safari 11
  var inboundSSRCs = self._getSDPMediaSSRC(peerId, pc.remoteDescription, beSilentOnLogs);
  output.audio.receiving.ssrc = inboundSSRCs.audio;
  output.video.receiving.ssrc = inboundSSRCs.video;
  var outboundSSRCs = self._getSDPMediaSSRC(peerId, pc.localDescription, beSilentOnLogs);
  output.audio.sending.ssrc = outboundSSRCs.audio;
  output.video.sending.ssrc = outboundSSRCs.video;

  // Parse RTCDataChannel details (not stats)
  Object.keys(self._dataChannels[peerId] || {}).forEach(function (prop) {
    var channel = self._dataChannels[peerId][prop];
    output.connection.dataChannels[channel.channel.label] = {
      label: channel.channel.label,
      readyState: channel.channel.readyState,
      channelType: self.DATA_CHANNEL_TYPE[prop === 'main' ? 'MESSAGING' : 'DATA'],
      currentTransferId: channel.transferId || null,
      currentStreamId: channel.streamId || null
    };
  });

  // Format DTLS certificates and ciphers used
  var certificateFn = function (item, prop) {
    // Safari 11
    if (prop.indexOf('RTCCertificate_') === 0) {
      // Map the certificate data basing off the fingerprint algorithm
      if (item.fingerprint === output.certificate.local.fingerprint) {
        output.certificate.local.derBase64 = item.base64Certificate;
        output.certificate.local.fingerprintAlgorithm = item.fingerprintAlgorithm;

      } else if (item.fingerprint  === output.certificate.remote.fingerprint) {
        output.certificate.remote.derBase64 = item.base64Certificate;
        output.certificate.remote.fingerprintAlgorithm = item.fingerprintAlgorithm;
      }

    // Chrome / Plugin
    } else if (prop.indexOf('ssrc_') === 0 && item.transportId) {
      var pairItem = output.raw[item.transportId] || {};
      output.certificate.srtpCipher = pairItem.srtpCipher;
      output.certificate.dtlsCipher = pairItem.dtlsCipher;

      var localCertItem = output.raw[pairItem.localCertificateId || ''] || {};
      output.certificate.local.fingerprint = localCertItem.googFingerprint;
      output.certificate.local.fingerprintAlgorithm = localCertItem.googFingerprintAlgorithm;
      output.certificate.local.derBase64 = localCertItem.googDerBase64;
      
      var remoteCertItem = output.raw[pairItem.remoteCertificateId || ''] || {};
      output.certificate.remote.fingerprint = remoteCertItem.googFingerprint;
      output.certificate.remote.fingerprintAlgorithm = remoteCertItem.googFingerprintAlgorithm;
      output.certificate.remote.derBase64 = remoteCertItem.googDerBase64;
    }
  };

  // Format selected candidate pair
  var candidatePairFn = function (item, prop) {
    // Safari 11
    if (prop.indexOf('RTCIceCandidatePair_') === 0) {
      // Use the nominated pair, else use the one that has succeeded but not yet nominated.
      // This is to handle the case where none of the ICE candidates appear nominated.
      if (item.state !== 'succeeded' || (output.selectedCandidate.nominated ? true :
        (item.prioirty < (output.selectedCandidate.priority || 0)))) {
        return;
      }

      var prevStats = isAutoBwStats ? self._peerBandwidth[peerId][prop] : self._peerStats[peerId][prop];

      // Map the selected ICE candidate pair based on computed prioirty
      var sending = (pc.localDescription && pc.localDescription.sdp && pc.localDescription.sdp.match(/a=candidate:.*\r\n/gi)) || [];
      var receiving = (pc.remoteDescription && pc.remoteDescription && pc.remoteDescription.sdp.match(/a=candidate:.*\r\n/gi)) || [];

      // Compute the priority
      var computePrioirtyFn = function (controller, controlled) {
        return (Math.pow(2, 32) * Math.min(controller, controlled)) + (2 * Math.max(controller, controlled)) + (controller > controlled ? 1 : 0);
      };

      // Format the candidate type
      var computeCanTypeFn = function (type) {
        if (type === 'relay') {
          return 'relayed';
        } else if (type === 'host') {
          return 'local';
        } else if (type === 'srflx') {
          return 'serverreflexive';
        }
        return type;
      };

      for (var s = 0; s < sending.length; s++) {
        var sendCanParts = sending[s].split(' ');

        for (var r = 0; r < receiving.length; r++) {
          var recvCanParts = receiving[r].split(' ');
          var priority = null;

          if (item.writable) {
            // Compute the priority since we are the controller
            priority = computePrioirtyFn(parseInt(sendCanParts[3], 10), parseInt(recvCanParts[3], 10));
          } else {
            // Compute the priority since we are the controlled
            priority = computePrioirtyFn(parseInt(recvCanParts[3], 10), parseInt(sendCanParts[3], 10));
          }

          if (priority === item.priority) {
            output.selectedCandidate.local.ipAddress = sendCanParts[4];
            output.selectedCandidate.local.candidateType = sendCanParts[7];
            output.selectedCandidate.local.portNumber = parseInt(sendCanParts[5], 10);
            output.selectedCandidate.local.transport = sendCanParts[2];
            output.selectedCandidate.local.priority = parseInt(sendCanParts[3], 10);
            output.selectedCandidate.local.candidateType = computeCanTypeFn(sendCanParts[7]);

            output.selectedCandidate.remote.ipAddress = recvCanParts[4];
            output.selectedCandidate.remote.candidateType = recvCanParts[7];
            output.selectedCandidate.remote.portNumber = parseInt(recvCanParts[5], 10);
            output.selectedCandidate.remote.transport = recvCanParts[2];
            output.selectedCandidate.remote.priority = parseInt(recvCanParts[3], 10);
            output.selectedCandidate.remote.candidateType = computeCanTypeFn(recvCanParts[7]);
            break;
          }
        }
      }

      output.selectedCandidate.writable = item.writable;
      output.selectedCandidate.readable = item.readable;
      output.selectedCandidate.priority = item.priority;
      output.selectedCandidate.nominated = item.nominated;

      var rtt = parseInt(item.rtt || '0', 10);
      output.selectedCandidate.totalRtt = rtt;
      output.selectedCandidate.rtt = self._parseConnectionStats(prevStats, item, 'rtt');

      var consentResponsesReceived = parseInt(item.consentResponsesReceived || '0', 10);
      output.selectedCandidate.consentResponses.totalReceived = consentResponsesReceived;
      output.selectedCandidate.consentResponses.received = self._parseConnectionStats(prevStats, item, 'consentResponsesReceived');
       
      var consentResponsesSent = parseInt(item.consentResponsesSent || '0', 10);
      output.selectedCandidate.consentResponses.totalSent = consentResponsesSent;
      output.selectedCandidate.consentResponses.sent = self._parseConnectionStats(prevStats, item, 'consentResponsesSent');
      
      var responsesReceived = parseInt(item.responsesReceived || '0', 10);
      output.selectedCandidate.responses.totalReceived = responsesReceived;
      output.selectedCandidate.responses.received = self._parseConnectionStats(prevStats, item, 'responsesReceived');
      
      var responsesSent = parseInt(item.responsesSent || '0', 10);
      output.selectedCandidate.responses.totalSent = responsesSent;
      output.selectedCandidate.responses.sent = self._parseConnectionStats(prevStats, item, 'responsesSent');

    // Chrome / Plugin
    } else if (item.type === 'googCandidatePair') {
      var prevStats = isAutoBwStats ? self._peerBandwidth[peerId][prop] : self._peerStats[peerId][prop];

      output.selectedCandidate.writable = item.googWritable === 'true';
      output.selectedCandidate.readable = item.googReadable === 'true';

      var rtt = parseInt(item.googRtt || '0', 10);
      output.selectedCandidate.totalRtt = rtt;
      output.selectedCandidate.rtt = self._parseConnectionStats(prevStats, item, 'rtt');

      if (item.consentResponsesReceived) {
        var consentResponsesReceived = parseInt(item.consentResponsesReceived || '0', 10);
        output.selectedCandidate.consentResponses.totalReceived = consentResponsesReceived;
        output.selectedCandidate.consentResponses.received = self._parseConnectionStats(prevStats, item, 'consentResponsesReceived');
      }

      if (item.consentResponsesSent) {
        var consentResponsesSent = parseInt(item.consentResponsesSent || '0', 10);
        output.selectedCandidate.consentResponses.totalSent = consentResponsesSent;
        output.selectedCandidate.consentResponses.sent = self._parseConnectionStats(prevStats, item, 'consentResponsesSent');
      }

      if (item.responsesReceived) {
        var responsesReceived = parseInt(item.responsesReceived || '0', 10);
        output.selectedCandidate.responses.totalReceived = responsesReceived;
        output.selectedCandidate.responses.received = self._parseConnectionStats(prevStats, item, 'responsesReceived');
      }

      if (item.responsesSent) {
        var responsesSent = parseInt(item.responsesSent || '0', 10);
        output.selectedCandidate.responses.totalSent = responsesSent;
        output.selectedCandidate.responses.sent = self._parseConnectionStats(prevStats, item, 'responsesSent');
      }

      var localCanItem = output.raw[item.localCandidateId || ''] || {};
      output.selectedCandidate.local.ipAddress = localCanItem.ipAddress;
      output.selectedCandidate.local.portNumber = parseInt(localCanItem.portNumber, 10);
      output.selectedCandidate.local.priority = parseInt(localCanItem.priority, 10);
      output.selectedCandidate.local.networkType = localCanItem.networkType;
      output.selectedCandidate.local.transport = localCanItem.transport;
      output.selectedCandidate.local.candidateType = localCanItem.candidateType;

      var remoteCanItem = output.raw[item.remoteCandidateId || ''] || {};
      output.selectedCandidate.remote.ipAddress = remoteCanItem.ipAddress;
      output.selectedCandidate.remote.portNumber = parseInt(remoteCanItem.portNumber, 10);
      output.selectedCandidate.remote.priority = parseInt(remoteCanItem.priority, 10);
      output.selectedCandidate.remote.transport = remoteCanItem.transport;
      output.selectedCandidate.remote.candidateType = remoteCanItem.candidateType;

    // Firefox
    } else if (item.type === 'candidatepair' && item.state === 'succeeded' && item.nominated) {
      output.selectedCandidate.writable = item.writable;
      output.selectedCandidate.readable = item.readable;

      var localCanItem = output.raw[item.localCandidateId || ''];
      output.selectedCandidate.local.ipAddress = localCanItem.ipAddress;
      output.selectedCandidate.local.portNumber = localCanItem.portNumber;
      output.selectedCandidate.local.transport = localCanItem.transport;
      output.selectedCandidate.local.candidateType = localCanItem.candidateType;
      output.selectedCandidate.local.turnMediaTransport = localCanItem.mozLocalTransport;

      var remoteCanItem = output.raw[item.remoteCandidateId || ''];
      output.selectedCandidate.remote.ipAddress = remoteCanItem.ipAddress;
      output.selectedCandidate.remote.portNumber = remoteCanItem.portNumber;
      output.selectedCandidate.remote.transport = remoteCanItem.transport;
      output.selectedCandidate.remote.candidateType = remoteCanItem.candidateType;
    }
  };

  // Format selected codecs
  var codecsFn = function (item, prop) {
    // Chrome / Plugin
    if (prop.indexOf('ssrc_') === 0) {
      var direction = prop.indexOf('_send') > 0 ? 'sending' : 'receiving';

      item.codecImplementationName = item.codecImplementationName === 'unknown' ? null : item.codecImplementationName;
      output[item.mediaType][direction].codec.implementation = item.codecImplementationName || null;

      item.googCodecName = item.googCodecName === 'unknown' ? null : item.googCodecName;
      output[item.mediaType][direction].codec.name = item.googCodecName || output[item.mediaType][direction].codec.name;
    }
  };

  // Format audio stats
  var audioStatsFn = function (item, prop) {
    var prevStats = isAutoBwStats ? self._peerBandwidth[peerId][prop] : self._peerStats[peerId][prop];
    
    // Safari 11 (Inbound stats)
    if (prop.indexOf('RTCInboundRTPAudioStream') === 0) {
      output.audio.receiving.fractionLost = item.fractionLost;
      output.audio.receiving.jitter = item.jitter;

      output.audio.receiving.totalBytes = item.bytesReceived;
      output.audio.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

      output.audio.receiving.totalPackets = item.packetsReceived;
      output.audio.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

      output.audio.receiving.totalPacketsDiscarded = item.packetsDiscarded;
      output.audio.receiving.packetsDiscarded = self._parseConnectionStats(prevStats, item, 'packetsDiscarded');

      output.audio.receiving.totalPacketsLost = item.packetsLost;
      output.audio.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      output.audio.receiving.totalNacks = item.nackCount;
      output.audio.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      if (typeof pc.getReceivers !== 'function') {
        return;
      }

    // Safari 11 (Inbound track stats)
    } else if (prop.indexOf('RTCMediaStreamTrack_remote_audio_') === 0) {
      output.audio.receiving.audioOutputLevel = item.audioLevel;

    // Safari 11 (Outbound stats)
    } else if (prop.indexOf('RTCOutboundRTPAudioStream') === 0) {
      output.audio.sending.targetBitrate = item.targetBitrate || 0;

      output.audio.sending.totalBytes = item.bytesSent;
      output.audio.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

      output.audio.sending.totalPackets = item.packetsSent;
      output.audio.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

      output.audio.sending.totalNacks = item.nackCount;
      output.audio.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

    // Edge (WebRTC not ORTC shim) (Inbound stats) - Stats may not be accurate as it returns 0.
    } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && item.type === 'inboundrtp' && item.mediaType === 'audio' && item.isRemote) {
      output.audio.receiving.fractionLost = item.fractionLost;
      output.audio.receiving.jitter = item.jitter;

      output.audio.receiving.totalBytes = item.bytesReceived;
      output.audio.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

      output.audio.receiving.totalPackets = item.packetsReceived;
      output.audio.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

      output.audio.receiving.totalPacketsLost = item.packetsLost;
      output.audio.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      output.audio.receiving.totalNacks = item.nackCount;
      output.audio.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

    // Edge (WebRTC not ORTC shim) (Outbound stats) - Stats may not be accurate as it returns 0.
    } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && item.type === 'outboundrtp' && item.mediaType === 'audio' && !item.isRemote) {
      output.audio.sending.targetBitrate = item.targetBitrate;
      output.audio.sending.rtt = item.roundTripTime;

      output.audio.sending.totalBytes = item.bytesSent;
      output.audio.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

      output.audio.sending.totalPackets = item.packetsSent;
      output.audio.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

      output.audio.sending.totalNacks = item.nackCount;
      output.audio.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      var trackItem = output.raw[item.mediaTrackId || ''] || {};
      output.audio.sending.audioInputLevel = trackItem.audioLevel;
      output.audio.sending.echoReturnLoss = trackItem.echoReturnLoss;
      output.audio.sending.echoReturnLossEnhancement = trackItem.echoReturnLossEnhancement;

    // Chrome / Plugin
    } else if (prop.indexOf('ssrc_') === 0 && item.mediaType === 'audio') {
      // Chrome / Plugin (Inbound stats)
      if (prop.indexOf('_recv') > 0) {
        output.audio.receiving.jitter = parseInt(item.googJitterReceived || '0', 10);
        output.audio.receiving.jitterBufferMs = parseInt(item.googJitterBufferMs || '0', 10);
        output.audio.receiving.currentDelayMs = parseInt(item.googCurrentDelayMs || '0', 10);
        //output.audio.receiving.audioOutputLevel = parseInt(item.audioOutputLevel || '0', 10);

        var bytesReceived = parseInt(item.bytesReceived || '0', 10);
        output.audio.receiving.totalBytes = bytesReceived;
        output.audio.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');
  
        var packetsReceived = parseInt(item.packetsReceived || '0', 10);
        output.audio.receiving.totalPackets = packetsReceived;
        output.audio.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

        var packetsLost = parseInt(item.packetsLost || '0', 10);
        output.audio.receiving.totalPacketsLost = packetsLost;
        output.audio.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      // Chrome / Plugin (Outbound stats)
      } else {
        output.audio.sending.rtt = parseInt(item.googRtt || '0', 10);
        output.audio.sending.audioInputLevel = parseInt(item.audioInputLevel || '0', 10);
        output.audio.sending.echoReturnLoss = parseInt(item.googEchoCancellationReturnLoss || '0', 10);
        output.audio.sending.echoReturnLossEnhancement = parseInt(item.googEchoCancellationReturnLossEnhancement || '0', 10);

        var bytesSent = parseInt(item.bytesSent || '0', 10);
        output.audio.sending.totalBytes = bytesSent;
        output.audio.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');
  
        var packetsSent = parseInt(item.packetsSent || '0', 10);
        output.audio.sending.totalPackets = packetsSent;
        output.audio.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');
      }
    
    // Firefox (Inbound stats)
    } else if (prop.indexOf('inbound_rtp_audio') === 0) {
      output.audio.receiving.jitter = item.jitter || 0;

      output.audio.receiving.totalBytes = item.bytesReceived;
      output.audio.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

      output.audio.receiving.totalPackets = item.packetsReceived;
      output.audio.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

      output.audio.receiving.totalPacketsLost = item.packetsLost;
      output.audio.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      output.audio.receiving.totalNacks = item.nackCount;
      output.audio.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

    // Firefox (Outbound stats)
    } else if (prop.indexOf('outbound_rtp_audio') === 0) {
      output.audio.sending.totalBytes = item.bytesSent;
      output.audio.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

      output.audio.sending.totalPackets = item.packetsSent;
      output.audio.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

      output.audio.sending.totalNacks = item.nackCount;
      output.audio.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      var rtcpItem = output.raw[prop.replace(/_rtp_/g, '_rtcp_')] || {};
      output.audio.sending.rtt = rtcpItem.roundTripTime || 0;
    }
  };

  // Format video stats
  var videoStatsFn = function (item, prop) {
    var prevStats = isAutoBwStats ? self._peerBandwidth[peerId][prop] : self._peerStats[peerId][prop];
    
    // Safari 11 (Inbound stats)
    if (prop.indexOf('RTCInboundRTPVideoStream') === 0) {
      output.video.receiving.fractionLost = item.fractionLost;
      output.video.receiving.jitter = item.jitter;
      output.video.receiving.framesDecoded = item.framesDecoded;
      output.video.receiving.qpSum = item.qpSum;

      output.video.receiving.totalBytes = item.bytesReceived;
      output.video.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

      output.video.receiving.totalPackets = item.packetsReceived;
      output.video.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

      output.video.receiving.totalPacketsDiscarded = item.packetsDiscarded;
      output.video.receiving.packetsDiscarded = self._parseConnectionStats(prevStats, item, 'packetsDiscarded');

      output.video.receiving.totalPacketsLost = item.packetsLost;
      output.video.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      output.video.receiving.totalNacks = item.nackCount;
      output.video.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      output.video.receiving.totalFirs = item.firCount;
      output.video.receiving.firs = self._parseConnectionStats(prevStats, item, 'firCount');

      output.video.receiving.totalSlis = item.sliCount;
      output.video.receiving.slis = self._parseConnectionStats(prevStats, item, 'sliCount');
    
    // Safari 11 (Inbound track stats)
    } else if (prop.indexOf('RTCMediaStreamTrack_remote_video_') === 0) {
      output.video.receiving.frameHeight = item.frameHeight;
      output.video.receiving.frameWidth = item.frameWidth;
      output.video.receiving.framesCorrupted = item.framesCorrupted;
      output.video.receiving.framesPerSecond = item.framesPerSecond;
      output.video.receiving.framesDropped = item.framesDropped;

      output.video.receiving.totalFrames = item.framesReceived;
      output.video.receiving.frames = self._parseConnectionStats(prevStats, item, 'framesReceived');

    // Safari 11 (Outbound stats)
    } else if (prop.indexOf('RTCOutboundRTPVideoStream') === 0) {
      output.video.sending.qpSum = item.qpSum;
      output.video.sending.targetBitrate = item.targetBitrate || 0;
      output.video.sending.framesEncoded = item.framesEncoded || 0;

      output.video.sending.totalBytes = item.bytesSent;
      output.video.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

      output.video.sending.totalPackets = item.packetsSent;
      output.video.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

      output.video.sending.totalNacks = item.nackCount;
      output.video.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      output.video.receiving.totalFirs = item.firCount;
      output.video.receiving.firs = self._parseConnectionStats(prevStats, item, 'firCount');

      output.video.sending.totalSlis = item.sliCount;
      output.video.sending.slis = self._parseConnectionStats(prevStats, item, 'sliCount');

    // Edge (WebRTC not ORTC shim) (Inbound stats) - Stats may not be accurate as it returns 0.
    } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && item.type === 'inboundrtp' && item.mediaType === 'video' && item.isRemote) {
      output.video.receiving.fractionLost = item.fractionLost;
      output.video.receiving.jitter = item.jitter;

      output.video.receiving.totalBytes = item.bytesReceived;
      output.video.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

      output.video.receiving.totalPackets = item.packetsReceived;
      output.video.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

      output.video.receiving.totalPacketsLost = item.packetsLost;
      output.video.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      output.video.receiving.totalNacks = item.nackCount;
      output.video.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      output.video.receiving.totalPlis = item.pliCount;
      output.video.receiving.plis = self._parseConnectionStats(prevStats, item, 'pliCount');

      output.video.receiving.totalFirs = item.firCount;
      output.video.receiving.firs = self._parseConnectionStats(prevStats, item, 'firCount');

      output.video.receiving.totalSlis = item.sliCount;
      output.video.receiving.slis = self._parseConnectionStats(prevStats, item, 'sliCount');

      var trackItem = output.raw[item.mediaTrackId || ''] || {};
      output.video.receiving.framesCorrupted = trackItem.framesCorrupted;
      output.video.receiving.framesDropped = trackItem.framesDropped;
      output.video.receiving.framesDecoded = trackItem.framesDecoded;

      output.video.receiving.totalFrames = trackItem.framesReceived;
      output.video.receiving.frames = self._parseConnectionStats(prevStats, trackItem, 'framesReceived');

    // Edge (WebRTC not ORTC shim) (Outbound stats) - Stats may not be accurate as it returns 0.
    } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && item.type === 'outboundrtp' && item.mediaType === 'video' && !item.isRemote) {
      output.video.sending.targetBitrate = item.targetBitrate || 0;
      output.video.sending.roundTripTime = item.roundTripTime || 0;

      output.video.sending.totalBytes = item.bytesSent;
      output.video.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

      output.video.sending.totalPackets = item.packetsSent;
      output.video.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

      output.video.sending.totalNacks = item.nackCount;
      output.video.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      output.video.sending.totalFirs = item.firCount;
      output.video.sending.firs = self._parseConnectionStats(prevStats, item, 'firCount');

      output.video.sending.totalPlis = item.pliCount;
      output.video.sending.plis = self._parseConnectionStats(prevStats, item, 'pliCount');

      output.video.sending.totalSlis = item.sliCount;
      output.video.sending.slis = self._parseConnectionStats(prevStats, item, 'sliCount');

      var trackItem = output.raw[item.mediaTrackId || ''] || {};
      output.video.sending.frameHeight = trackItem.frameHeight;
      output.video.sending.frameWidth = trackItem.frameWidth;
      output.video.sending.framesPerSecond = trackItem.framesPerSecond;

      output.video.sending.totalFrames = trackItem.framesSent;
      output.video.sending.frames = self._parseConnectionStats(prevStats, trackItem, 'framesSent');

    // Chrome / Plugin
    } else if (prop.indexOf('ssrc_') === 0 && item.mediaType === 'video') {
      // Chrome / Plugin (Inbound stats)
      if (prop.indexOf('_recv') > 0) {
        output.video.receiving.jitter = parseInt(item.googJitterReceived || '0', 10);
        output.video.receiving.jitterBufferMs = parseInt(item.googJitterBufferMs || '0', 10);
        output.video.receiving.currentDelayMs = parseInt(item.googCurrentDelayMs || '0', 10);
        output.video.receiving.renderDelayMs = parseInt(item.googRenderDelayMs || '0', 10);
        output.video.receiving.frameWidth = parseInt(item.googFrameWidthReceived || '0', 10);
        output.video.receiving.frameHeight = parseInt(item.googFrameHeightReceived || '0', 10);
        output.video.receiving.framesDecoded = parseInt(item.framesDecoded || '0', 10);
        output.video.receiving.frameRateOutput = parseInt(item.googFrameRateOutput || '0', 10);
        output.video.receiving.frameRateDecoded = parseInt(item.googFrameRateDecoded || '0', 10);
        output.video.receiving.frameRateReceived = parseInt(item.googFrameRateReceived || '0', 10);
        output.video.receiving.qpSum = parseInt(item.qpSum || '0', 10);

        var bytesReceived = parseInt(item.bytesReceived || '0', 10);
        output.video.receiving.totalBytes = bytesReceived;
        output.video.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');
  
        var packetsReceived = parseInt(item.packetsReceived || '0', 10);
        output.video.receiving.totalPackets = packetsReceived;
        output.video.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

        var packetsLost = parseInt(item.packetsLost || '0', 10);
        output.video.receiving.totalPacketsLost = packetsLost;
        output.video.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

        var nacksSent = parseInt(item.googNacksSent || '0', 10);
        output.video.receiving.totalNacks = nacksSent;
        output.video.receiving.nacks = self._parseConnectionStats(prevStats, item, 'googNacksSent');

        var plisSent = parseInt(item.googPlisSent || '0', 10);
        output.video.receiving.totalPlis = plisSent;
        output.video.receiving.plis = self._parseConnectionStats(prevStats, item, 'googPlisSent');

        var firsSent = parseInt(item.googFirsSent || '0', 10);
        output.video.receiving.totalFirs = firsSent;
        output.video.receiving.firs = self._parseConnectionStats(prevStats, item, 'googFirsSent');

      // Chrome / Plugin (Outbound stats)
      } else {
        output.video.sending.rtt = parseInt(item.googRtt || '0', 10);
        output.video.sending.frameWidth = parseInt(item.googFrameWidthSent || '0', 10);
        output.video.sending.frameHeight = parseInt(item.googFrameHeightSent || '0', 10);
        output.video.sending.framesEncoded = parseInt(item.framesEncoded || '0', 10);
        output.video.sending.frameRateInput = parseInt(item.googFrameRateInput || '0', 10);
        output.video.sending.frameRateEncoded = parseInt(item.googFrameRateEncoded || '0', 10);
        output.video.sending.frameRateSent = parseInt(item.googFrameRateSent || '0', 10);
        output.video.sending.cpuLimitedResolution = item.googCpuLimitedResolution === 'true';
        output.video.sending.bandwidthLimitedResolution = item.googBandwidthLimitedResolution === 'true';

        var bytesSent = parseInt(item.bytesSent || '0', 10);
        output.video.sending.totalBytes = bytesSent;
        output.video.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');
  
        var packetsSent = parseInt(item.packetsSent || '0', 10);
        output.video.sending.totalPackets = packetsSent;
        output.video.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

        var nacksReceived = parseInt(item.googNacksReceived || '0', 10);
        output.video.sending.totalNacks = nacksReceived;
        output.video.sending.nacks = self._parseConnectionStats(prevStats, item, 'googNacksReceived');

        var plisReceived = parseInt(item.googPlisReceived || '0', 10);
        output.video.sending.totalPlis = plisReceived;
        output.video.sending.plis = self._parseConnectionStats(prevStats, item, 'googPlisReceived');

        var firsReceived = parseInt(item.googFirsReceived || '0', 10);
        output.video.sending.totalFirs = firsReceived;
        output.video.sending.firs = self._parseConnectionStats(prevStats, item, 'googFirsReceived');
      }
    
    // Firefox (Inbound stats)
    } else if (prop.indexOf('inbound_rtp_video') === 0) {
      output.video.receiving.jitter = item.jitter || 0;
      output.video.receiving.framesDecoded = item.framesDecoded || 0;
      output.video.receiving.frameRateMean = item.framerateMean || 0;
      output.video.receiving.frameRateStdDev = item.framerateStdDev || 0;

      output.video.receiving.totalBytes = item.bytesReceived;
      output.video.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

      output.video.receiving.totalPackets = item.packetsReceived;
      output.video.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

      output.video.receiving.totalPacketsLost = item.packetsLost;
      output.video.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      output.video.receiving.totalNacks = item.nackCount;
      output.video.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      output.video.receiving.totalPlis = item.pliCount;
      output.video.receiving.plis = self._parseConnectionStats(prevStats, item, 'pliCount');

      output.video.receiving.totalFirs = item.firCount;
      output.video.receiving.firs = self._parseConnectionStats(prevStats, item, 'firCount');

    // Firefox (Outbound stats)
    } else if (prop.indexOf('outbound_rtp_video') === 0) {
      output.video.sending.framesEncoded = item.framesEncoded || 0;
      output.video.sending.frameRateMean = item.framerateMean || 0;
      output.video.sending.frameRateStdDev = item.framerateStdDev || 0;
      output.video.sending.framesDropped = item.droppedFrames || 0;

      output.video.sending.totalBytes = item.bytesSent;
      output.video.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

      output.video.sending.totalPackets = item.packetsSent;
      output.video.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

      output.video.sending.totalNacks = item.nackCount;
      output.video.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      output.video.sending.totalPlis = item.pliCount;
      output.video.sending.plis = self._parseConnectionStats(prevStats, item, 'pliCount');

      output.video.sending.totalFirs = item.firCount;
      output.video.sending.firs = self._parseConnectionStats(prevStats, item, 'firCount');

      var rtcpItem = output.raw[prop.replace(/_rtp_/g, '_rtcp_')] || {};
      output.video.sending.rtt = rtcpItem.roundTripTime || 0;
    }
  };

  // Format video e2e delay stats
  var videoE2EStatsFn = function (item, prop) {
    // Chrome / Plugin (Inbound e2e stats)
    if (prop.indexOf('ssrc_') === 0 && item.mediaType === 'video') {
      var captureStartNtpTimeMs = parseInt(item.googCaptureStartNtpTimeMs || '0', 10);
      var remoteStream = pc.getRemoteStreams()[0];

      if (!(captureStartNtpTimeMs > 0 && prop.indexOf('_recv') > 0 && remoteStream &&
        document && typeof document.getElementsByTagName === 'function')) {
        return;
      }

      try {
        var elements = document.getElementsByTagName(AdapterJS.webrtcDetectedType === 'plugin' ? 'object' : 'video');

        if (AdapterJS.webrtcDetectedType !== 'plugin' && elements.length === 0) {
          elements = document.getElementsByTagName('audio');
        }

        for (var e = 0; e < elements.length; e++) {
          var videoStreamId = null;

          // For Plugin case where they use the <object> element
          if (AdapterJS.webrtcDetectedType === 'plugin') {
            // Precautionary check to return if there is no children like <param>, which means something is wrong..
            if (!(elements[e].children && typeof elements[e].children === 'object' &&
              typeof elements[e].children.length === 'number' && elements[e].children.length > 0)) {
              break;
            }

            // Retrieve the "streamId" parameter 
            for (var ec = 0; ec < elements[e].children.length; ec++) {
              if (elements[e].children[ec].name === 'streamId') {
                videoStreamId = elements[e].children[ec].value || null;
                break;
              }
            }
          
          // For Chrome case where the srcObject can be obtained and determine the streamId
          } else {
            videoStreamId = (elements[e].srcObject && (elements[e].srcObject.id || elements[e].srcObject.label)) || null;
          }

          if (videoStreamId && videoStreamId === (remoteStream.id || remoteStream.label)) {
            output.video.receiving.e2eDelay = ((new Date()).getTime() + 2208988800000) - captureStartNtpTimeMs - elements[e].currentTime * 1000;
            break;
          }
        }

      } catch (error) {
        if (!beSilentOnLogs) {
          log.warn([peerId, 'RTCStatsReport', null, 'Failed retrieving e2e delay ->'], error);
        }
      }
    }
  };

  var successCbFn =  function (stats) {
    if (typeof stats.forEach === 'function') {
      stats.forEach(function (item, prop) {
        output.raw[prop] = item;
      });
    } else {
      output.raw = stats;
    }

    var edgeTracksKind = {
      remote: {},
      local: {}
    };

    if (AdapterJS.webrtcDetectedBrowser === 'edge') {
      if (pc.remoteStream) {
        pc.remoteStream.getTracks().forEach(function (track) {
          edgeTracksKind.remote[track.id] = track.kind;
        });
      }

      if (pc.localStream) {
        pc.localStream.getTracks().forEach(function (track) {
          edgeTracksKind.local[track.id] = track.kind;
        });
      }
    }

    Object.keys(output.raw).forEach(function (prop) {
      // Polyfill for Plugin missing "mediaType" stats item
      if (prop.indexOf('ssrc_') === 0 && !output.raw[prop].mediaType) {
        output.raw[prop].mediaType = output.raw[prop].audioInputLevel || output.raw[prop].audioOutputLevel ? 'audio' : 'video';

      // Polyfill for Edge 15.x missing "mediaType" stats item
      } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && !output.raw[prop].mediaType &&
        ['inboundrtp', 'outboundrtp'].indexOf(output.raw[prop].type) > -1) {
        var trackItem = output.raw[ output.raw[prop].mediaTrackId ] || {};
        output.raw[prop].mediaType = edgeTracksKind[ output.raw[prop].isRemote ? 'remote' : 'local' ][ trackItem.trackIdentifier ] || ''; 
      }

      certificateFn(output.raw[prop], prop);
      candidatePairFn(output.raw[prop], prop);
      codecsFn(output.raw[prop], prop);
      audioStatsFn(output.raw[prop], prop);
      videoStatsFn(output.raw[prop], prop);
      videoE2EStatsFn(output.raw[prop], prop);

      // Parse for bandwidth statistics if not yet defined to not mix with the getConnectionStatus()
      if (isAutoBwStats && !self._peerBandwidth[peerId][prop]) {
        self._peerBandwidth[peerId][prop] = output.raw[prop];
      } else if (!isAutoBwStats && !self._peerStats[peerId][prop]) {
        self._peerStats[peerId][prop] = output.raw[prop];
      }
    });

    // Prevent "0" in Edge 15.x and Safari 11 when SSRC stats is not available
    output.audio.sending.bytes = output.audio.sending.bytes || 0;
    output.audio.sending.packets = output.audio.sending.packets || 0;
    output.audio.sending.totalBytes = output.audio.sending.totalBytes || 0;
    output.audio.sending.totalPackets = output.audio.sending.totalPackets || 0;

    output.video.sending.bytes = output.video.sending.bytes || 0;
    output.video.sending.packets = output.video.sending.packets || 0;
    output.video.sending.totalBytes = output.video.sending.totalBytes || 0;
    output.video.sending.totalPackets = output.video.sending.totalPackets || 0;

    output.audio.receiving.bytes = output.audio.receiving.bytes || 0;
    output.audio.receiving.packets = output.audio.receiving.packets || 0;
    output.audio.receiving.totalBytes = output.audio.receiving.totalBytes || 0;
    output.audio.receiving.totalPackets = output.audio.receiving.totalPackets || 0;

    output.video.receiving.bytes = output.video.receiving.bytes || 0;
    output.video.receiving.packets = output.video.receiving.packets || 0;
    output.video.receiving.totalBytes = output.video.receiving.totalBytes || 0;
    output.video.receiving.totalPackets = output.video.receiving.totalPackets || 0;

    callback(null, output);
  };

  var errorCbFn = function (error) {
    if (!beSilentOnLogs) {
      log.error([peerId, 'RTCStatsReport', null, 'Failed retrieving stats ->'], error);
    }
    callback(error, null);
  };

  if (typeof pc.getStats !== 'function') {
    return errorCbFn(new Error('getStats() API is not available.'));
  }

  if (AdapterJS.webrtcDetectedType === 'plugin') {
    pc.getStats(null, successCbFn, errorCbFn);
  } else {
    pc.getStats(null).then(successCbFn).catch(errorCbFn);
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
Skylink.prototype._addPeer = function(targetMid, cert, peerBrowser, receiveOnly, isSS) {
  var self = this;
  if (self._peerConnections[targetMid]) {
    log.error([targetMid, null, null, 'Connection to peer has already been made']);
    return;
  }

  self._peerConnStatus[targetMid] = {
    connected: false,
    init: false
  };

  log.log([targetMid, null, null, 'Starting the connection to peer. Options provided:'], {
    peerBrowser: peerBrowser,
    receiveOnly: receiveOnly,
    enableDataChannel: self._initOptions.enableDataChannel
  });

  log.info('Adding peer', isSS);

  self._peerConnections[targetMid] = self._createPeerConnection(targetMid, !!isSS, cert);

  if (!self._peerConnections[targetMid]) {
    log.error([targetMid, null, null, 'Failed creating the connection to peer.']);
    return;
  }

  self._peerConnStatus[targetMid].init = true;
  self._peerConnections[targetMid].hasScreen = !!isSS;
};

/**
 * Function that re-negotiates a Peer connection.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _restartPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._restartPeerConnection = function (peerId, doIceRestart, bwOptions, callback) {
  var self = this;

  if (!self._peerConnections[peerId]) {
    log.error([peerId, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  var pc = self._peerConnections[peerId];
  var agent = (self.getPeerInfo(peerId) || {}).agent || {};

  // prevent restarts for other SDK clients
  if (self._isLowerThanVersion(agent.SMProtocolVersion || '', '0.1.2')) {
    var notSupportedError = new Error('Failed restarting with other agents connecting from other SDKs as ' +
      're-negotiation is not supported by other SDKs');

    log.warn([peerId, 'RTCPeerConnection', null, 'Ignoring restart request as agent\'s SDK does not support it'],
        notSupportedError);

    if (typeof callback === 'function') {
      log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
      callback(notSupportedError);
    }
    return;
  }

  // This is when the state is stable and re-handshaking is possible
  // This could be due to previous connection handshaking that is already done
  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE && self._peerConnections[peerId]) {
    log.log([peerId, null, null, 'Sending restart message to signaling server ->'], {
      iceRestart: doIceRestart,
      options: bwOptions
    });

    self._peerCustomConfigs[peerId] = self._peerCustomConfigs[peerId] || {};
    self._peerCustomConfigs[peerId].bandwidth = self._peerCustomConfigs[peerId].bandwidth || {};
    self._peerCustomConfigs[peerId].googleXBandwidth = self._peerCustomConfigs[peerId].googleXBandwidth || {};

    if (bwOptions.bandwidth && typeof bwOptions.bandwidth === 'object') {
      if (typeof bwOptions.bandwidth.audio === 'number') {
        self._peerCustomConfigs[peerId].bandwidth.audio = bwOptions.bandwidth.audio;
      }
      if (typeof bwOptions.bandwidth.video === 'number') {
        self._peerCustomConfigs[peerId].bandwidth.video = bwOptions.bandwidth.video;
      }
      if (typeof bwOptions.bandwidth.data === 'number') {
        self._peerCustomConfigs[peerId].bandwidth.data = bwOptions.bandwidth.data;
      }
    }

    if (bwOptions.googleXBandwidth && typeof bwOptions.googleXBandwidth === 'object') {
      if (typeof bwOptions.googleXBandwidth.min === 'number') {
        self._peerCustomConfigs[peerId].googleXBandwidth.min = bwOptions.googleXBandwidth.min;
      }
      if (typeof bwOptions.googleXBandwidth.max === 'number') {
        self._peerCustomConfigs[peerId].googleXBandwidth.max = bwOptions.googleXBandwidth.max;
      }
    }

    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: AdapterJS.webrtcDetectedBrowser,
      version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(peerId),
      target: peerId,
      weight: self._peerPriorityWeight,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      enableIceTrickle: self._initOptions.enableIceTrickle,
      enableDataChannel: self._initOptions.enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: doIceRestart === true && self._enableIceRestart && self._peerInformations[peerId] &&
        self._peerInformations[peerId].config.enableIceRestart,
      isRestartResend: false,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      restartMsg.parentId = self._parentId;
    }

    self._peerEndOfCandidatesCounter[peerId] = self._peerEndOfCandidatesCounter[peerId] || {};
    self._peerEndOfCandidatesCounter[peerId].len = 0;
    self._sendChannelMessage(restartMsg);
    self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), true, doIceRestart === true);

    if (typeof callback === 'function') {
      log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart callback']);
      callback(null);
    }

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
          callback(new Error(noLocalDescriptionError));
        }
      }
    // It could have connection state closed
    } else {
      var unableToRestartError = 'Failed restarting as peer connection state is ' + pc.signalingState;
      log.warn([peerId, 'RTCPeerConnection', null, unableToRestartError]);
      if (typeof callback === 'function') {
        log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
        callback(new Error(unableToRestartError));
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
  if (!this._peerConnections[peerId] && !this._peerInformations[peerId]) {
    log.debug([peerId, 'RTCPeerConnection', null, 'Dropping the hangup from Peer as not connected to Peer at all.']);
    return;
  }

  var peerInfo = clone(this.getPeerInfo(peerId)) || {
    userData: '',
    settings: { audio: false, video: false, data: false },
    mediaStatus: { audioMuted: true, videoMuted: true },
    agent: {
      name: 'unknown',
      version: 0,
      os: '',
      pluginVersion: null
    },
    config: {
      enableDataChannel: true,
      enableIceRestart: false,
      enableIceTrickle: true,
      priorityWeight: 0,
      publishOnly: false,
      receiveOnly: true
    },
    parentId: null,
    room: clone(this._selectedRoom)
  };

  if (peerId !== 'MCU') {
    this._trigger('peerLeft', peerId, peerInfo, false);
  } else {
    this._hasMCU = false;
    log.log([peerId, null, null, 'MCU has stopped listening and left']);
    this._trigger('serverPeerLeft', peerId, this.SERVER_PEER_TYPE.MCU);
  }

  // check if health timer exists
  if (this._peerConnections[peerId]) {
    if (this._peerConnections[peerId].signalingState !== this.PEER_CONNECTION_STATE.CLOSED) {
      this._peerConnections[peerId].close();
      // Polyfill for safari 11 "closed" event not triggered for "iceConnectionState" and "signalingState".
      if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
        if (!this._peerConnections[peerId].signalingStateClosed) {
          this._peerConnections[peerId].signalingStateClosed = true;
          this._trigger('peerConnectionState', this.PEER_CONNECTION_STATE.CLOSED, peerId);
        }
        if (!this._peerConnections[peerId].iceConnectionStateClosed) {
          this._peerConnections[peerId].iceConnectionStateClosed = true;
          this._trigger('iceConnectionState', this.ICE_CONNECTION_STATE.CLOSED, peerId);
        }
      }
    }
    if (peerId !== 'MCU') {
      this._handleEndedStreams(peerId);
    }
    delete this._peerConnections[peerId];
  }
  // remove peer informations session
  if (this._peerInformations[peerId]) {
    delete this._peerInformations[peerId];
  }
  // remove peer messages stamps session
  if (this._peerMessagesStamps[peerId]) {
    delete this._peerMessagesStamps[peerId];
  }
  // remove peer streams session
  if (this._streamsSession[peerId]) {
    delete this._streamsSession[peerId];
  }
  // remove peer streams session
  if (this._peerEndOfCandidatesCounter[peerId]) {
    delete this._peerEndOfCandidatesCounter[peerId];
  }
  // remove peer queued ICE candidates
  if (this._peerCandidatesQueue[peerId]) {
    delete this._peerCandidatesQueue[peerId];
  }
  // remove peer sdp session
  if (this._sdpSessions[peerId]) {
    delete this._sdpSessions[peerId];
  }
  // remove peer stats session
  if (this._peerStats[peerId]) {
    delete this._peerStats[peerId];
  }
  // remove peer bandwidth stats
  if (this._peerBandwidth[peerId]) {
    delete this._peerBandwidth[peerId];
  }
  // remove peer ICE candidates
  if (this._gatheredCandidates[peerId]) {
    delete this._gatheredCandidates[peerId];
  }
  // remove peer ICE candidates
  if (this._peerCustomConfigs[peerId]) {
    delete this._peerCustomConfigs[peerId];
  }
  // remove peer connection config
  if (this._peerConnStatus[peerId]) {
    delete this._peerConnStatus[peerId];
  }
  // close datachannel connection
  if (this._dataChannels[peerId]) {
    this._closeDataChannel(peerId);
  }
  log.log([peerId, 'RTCPeerConnection', null, 'Successfully removed peer']);
};

/**
 * Function that creates the Peer connection.
 * @method _createPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._createPeerConnection = function(targetMid, isScreenSharing, cert) {
  var pc, self = this;
  if (!self._inRoom || !(self._room && self._room.connection &&
    self._room.connection.peerConfig && Array.isArray(self._room.connection.peerConfig.iceServers))) {
    return;
  }

  var constraints = {
    iceServers: self._room.connection.peerConfig.iceServers,
    iceTransportPolicy: self._initOptions.filterCandidatesType.host && self._initOptions.filterCandidatesType.srflx &&
      !self._initOptions.filterCandidatesType.relay ? 'relay' : 'all',
    bundlePolicy: self._peerConnectionConfig.bundlePolicy === self.BUNDLE_POLICY.NONE ?
      self.BUNDLE_POLICY.BALANCED : self._peerConnectionConfig.bundlePolicy,
    rtcpMuxPolicy: self._peerConnectionConfig.rtcpMuxPolicy,
    iceCandidatePoolSize: self._peerConnectionConfig.iceCandidatePoolSize
  };
  var optional = {
    optional: [
      { DtlsSrtpKeyAgreement: true },
      { googIPv6: true }
    ]
  };

  if (cert) {
    constraints.certificates = [cert];
  }

  if (self._peerConnStatus[targetMid]) {
    self._peerConnStatus[targetMid].constraints = constraints;
    self._peerConnStatus[targetMid].optional = optional;
  }

  // currently the AdapterJS 0.12.1-2 causes an issue to prevent firefox from
  // using .urls feature
  try {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Creating peer connection ->'], {
      constraints: constraints,
      optional: optional
    });
    pc = new (self._initOptions.useEdgeWebRTC && window.msRTCPeerConnection ? window.msRTCPeerConnection : RTCPeerConnection)(constraints, optional);
  } catch (error) {
    log.error([targetMid, null, null, 'Failed creating peer connection:'], error);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
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
  pc.gathering = false;
  pc.localStream = null;
  pc.localStreamId = null;
  pc.remoteStream = null;
  pc.remoteStreamId = null;
  // Used for safari 11
  pc.iceConnectionStateClosed = false;
  pc.signalingStateClosed = false;

  // candidates
  self._gatheredCandidates[targetMid] = {
    sending: { host: [], srflx: [], relay: [] },
    receiving: { host: [], srflx: [], relay: [] }
  };

  self._streamsSession[targetMid] = self._streamsSession[targetMid] || {};
  self._peerEndOfCandidatesCounter[targetMid] = self._peerEndOfCandidatesCounter[targetMid] || {};
  self._sdpSessions[targetMid] = { local: {}, remote: {} };
  self._peerBandwidth[targetMid] = {};
  var bandwidth = null;

  // callbacks
  // standard not implemented: onnegotiationneeded,
  pc.ondatachannel = function(event) {
    var dc = event.channel || event;
    log.debug([targetMid, 'RTCDataChannel', dc.label, 'Received datachannel ->'], dc);
    if (self._initOptions.enableDataChannel && self._peerInformations[targetMid] &&
      self._peerInformations[targetMid].config.enableDataChannel) {
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

  pc.onaddstream = function (evt) {
    if (!self._peerConnections[targetMid]) {
      return;
    }

    var stream = evt.stream || evt;

    if (targetMid === 'MCU') {
      log.warn([targetMid, 'MediaStream', pc.remoteStreamId, 'Ignoring received remote stream from MCU ->'], stream);
      return;
    } else if (!self._sdpSettings.direction.audio.receive && !self._sdpSettings.direction.video.receive) {
      log.warn([targetMid, 'MediaStream', pc.remoteStreamId, 'Ignoring received empty remote stream ->'], stream);
      return;
    }

    pc.remoteStream = stream;
    pc.remoteStreamId = pc.remoteStreamId || stream.id || stream.label;

    var peerSettings = clone(self.getPeerInfo(targetMid).settings);
    
    self._streamsSession[targetMid][pc.remoteStreamId] = peerSettings;
    
    if (stream.getAudioTracks().length === 0) {
      self._streamsSession[targetMid][pc.remoteStreamId].audio = false;
    }

    if (stream.getVideoTracks().length === 0) {
      self._streamsSession[targetMid][pc.remoteStreamId].video = false;
    }

    pc.hasStream = true;
    pc.hasScreen = peerSettings.video && typeof peerSettings.video === 'object' && peerSettings.video.screenshare;

    self._onRemoteStreamAdded(targetMid, stream, !!pc.hasScreen);
  };

  pc.onicecandidate = function(event) {
    self._onIceCandidate(targetMid, event.candidate || event);
  };

  pc.oniceconnectionstatechange = function(evt) {
    var iceConnectionState = pc.iceConnectionState;

    log.debug([targetMid, 'RTCIceConnectionState', null, 'Ice connection state changed ->'], iceConnectionState);

    if (AdapterJS.webrtcDetectedBrowser === 'edge') {
      if (iceConnectionState === 'connecting') {
        iceConnectionState = self.ICE_CONNECTION_STATE.CHECKING;
      } else if (iceConnectionState === 'new') {
        iceConnectionState = self.ICE_CONNECTION_STATE.FAILED;
      }
    }

    if (AdapterJS.webrtcDetectedType === 'AppleWebKit' && iceConnectionState === self.ICE_CONNECTION_STATE.CLOSED) {
      setTimeout(function () {
        if (!pc.iceConnectionStateClosed) {
          self._trigger('iceConnectionState', self.ICE_CONNECTION_STATE.CLOSED, targetMid);
        }
      }, 10);
      return;
    }

    self._trigger('iceConnectionState', iceConnectionState, targetMid);

    if (iceConnectionState === self.ICE_CONNECTION_STATE.FAILED && self._initOptions.enableIceTrickle) {
      self._trigger('iceConnectionState', self.ICE_CONNECTION_STATE.TRICKLE_FAILED, targetMid);
    }

    if (self._peerConnStatus[targetMid]) {
      self._peerConnStatus[targetMid].connected = [self.ICE_CONNECTION_STATE.COMPLETED,
        self.ICE_CONNECTION_STATE.CONNECTED].indexOf(iceConnectionState) > -1;
    }

    if (!self._hasMCU && [self.ICE_CONNECTION_STATE.CONNECTED, self.ICE_CONNECTION_STATE.COMPLETED].indexOf(
      iceConnectionState) > -1 && !!self._bandwidthAdjuster && !bandwidth && AdapterJS.webrtcDetectedBrowser !== 'edge' &&
      (((self._peerInformations[targetMid] || {}).agent || {}).name || 'edge') !== 'edge') {
      var currentBlock = 0;
      var formatTotalFn = function (arr) {
        var total = 0;
        for (var i = 0; i < arr.length; i++) {
          total += arr[i];
        }
        return total / arr.length;
      };
      bandwidth = {
        audio: { send: [], recv: [] },
        video: { send: [], recv: [] }
      };
      var pullInterval = setInterval(function () {
        if (!(self._peerConnections[targetMid] && self._peerConnections[targetMid].signalingState !==
          self.PEER_CONNECTION_STATE.CLOSED) || !self._bandwidthAdjuster || !self._peerBandwidth[targetMid]) {
          clearInterval(pullInterval);
          return;
        }
        self._retrieveStats(targetMid, function (err, stats) {
          if (!(self._peerConnections[targetMid] && self._peerConnections[targetMid].signalingState !==
            self.PEER_CONNECTION_STATE.CLOSED) || !self._bandwidthAdjuster) {
            clearInterval(pullInterval);
            return;
          }
          if (err) {
            bandwidth.audio.send.push(0);
            bandwidth.audio.recv.push(0);
            bandwidth.video.send.push(0);
            bandwidth.video.recv.push(0);
          } else {
            bandwidth.audio.send.push(stats.audio.sending.bytes * 8);
            bandwidth.audio.recv.push(stats.audio.receiving.bytes * 8);
            bandwidth.video.send.push(stats.video.sending.bytes * 8);
            bandwidth.video.recv.push(stats.video.receiving.bytes * 8);
          }
          currentBlock++;
          if (currentBlock === self._bandwidthAdjuster.interval) {
            currentBlock = 0;
            var totalAudioBw = formatTotalFn(bandwidth.audio.send);
            var totalVideoBw = formatTotalFn(bandwidth.video.send);
            if (!self._bandwidthAdjuster.useUploadBwOnly) {
              totalAudioBw += formatTotalFn(bandwidth.audio.recv);
              totalVideoBw += formatTotalFn(bandwidth.video.recv);
              totalAudioBw = totalAudioBw / 2;
              totalVideoBw = totalVideoBw / 2;
            }
            totalAudioBw = parseInt((totalAudioBw * (self._bandwidthAdjuster.limitAtPercentage / 100)) / 1000, 10);
            totalVideoBw = parseInt((totalVideoBw * (self._bandwidthAdjuster.limitAtPercentage / 100)) / 1000, 10);
            bandwidth = {
              audio: { send: [], recv: [] },
              video: { send: [], recv: [] }
            };
            self.refreshConnection(targetMid, {
              bandwidth: { audio: totalAudioBw, video: totalVideoBw }
            });
          }
        }, true, true);
      }, 1000);
    }
  };

  pc.onsignalingstatechange = function() {
    log.debug([targetMid, 'RTCSignalingState', null, 'Peer connection state changed ->'], pc.signalingState);
    
    if (AdapterJS.webrtcDetectedType === 'AppleWebKit' && pc.signalingState === self.PEER_CONNECTION_STATE.CLOSED) {
      setTimeout(function () {
        if (!pc.signalingStateClosed) {
          self._trigger('peerConnectionState', self.PEER_CONNECTION_STATE.CLOSED, targetMid);
        }
      }, 10);
      return;
    }

    self._trigger('peerConnectionState', pc.signalingState, targetMid);
  };
  pc.onicegatheringstatechange = function() {
    log.log([targetMid, 'RTCIceGatheringState', null, 'Ice gathering state changed ->'], pc.iceGatheringState);
    self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
  };

  if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
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
Skylink.prototype._restartMCUConnection = function(callback, doIceRestart, bwOptions) {
  var self = this;
  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerRestartErrors = {};
  var sendRestartMsgFn = function (peerId) {
    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: AdapterJS.webrtcDetectedBrowser,
      version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(peerId),
      target: peerId,
      weight: self._peerPriorityWeight,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      enableIceTrickle: self._initOptions.enableIceTrickle,
      enableDataChannel: self._initOptions.enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: self._initOptions.mcuUseRenegoRestart && doIceRestart === true &&
        self._enableIceRestart && self._peerInformations[peerId] &&
        self._peerInformations[peerId].config.enableIceRestart,
      isRestartResend: false,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      restartMsg.parentId = self._parentId;
    }

    log.log([peerId, 'RTCPeerConnection', null, 'Sending restart message to signaling server ->'], restartMsg);

    self._sendChannelMessage(restartMsg);
  };

  // Toggle the main bandwidth options.
  if (bwOptions.bandwidth && typeof bwOptions.bandwidth === 'object') {
    if (typeof bwOptions.bandwidth.audio === 'number') {
      self._streamsBandwidthSettings.bAS.audio = bwOptions.bandwidth.audio;
    }
    if (typeof bwOptions.bandwidth.video === 'number') {
      self._streamsBandwidthSettings.bAS.video = bwOptions.bandwidth.video;
    }
    if (typeof bwOptions.bandwidth.data === 'number') {
      self._streamsBandwidthSettings.bAS.data = bwOptions.bandwidth.data;
    }
  }

  if (bwOptions.googleXBandwidth && typeof bwOptions.googleXBandwidth === 'object') {
    if (typeof bwOptions.googleXBandwidth.min === 'number') {
      self._streamsBandwidthSettings.googleX.min = bwOptions.googleXBandwidth.min;
    }
    if (typeof bwOptions.googleXBandwidth.max === 'number') {
      self._streamsBandwidthSettings.googleX.max = bwOptions.googleXBandwidth.max;
    }
  }

  for (var i = 0; i < listOfPeers.length; i++) {
    if (!self._peerConnections[listOfPeers[i]]) {
      var error = 'Peer connection with peer does not exists. Unable to restart';
      log.error([listOfPeers[i], 'PeerConnection', null, error]);
      listOfPeerRestartErrors[listOfPeers[i]] = new Error(error);
      continue;
    }

    if (listOfPeers[i] !== 'MCU') {
      self._trigger('peerRestart', listOfPeers[i], self.getPeerInfo(listOfPeers[i]), true, false);

      if (!self._initOptions.mcuUseRenegoRestart) {
        sendRestartMsgFn(listOfPeers[i]);
      }
    }
  }

  self._trigger('serverPeerRestart', 'MCU', self.SERVER_PEER_TYPE.MCU);

  if (self._initOptions.mcuUseRenegoRestart) {
    self._peerEndOfCandidatesCounter.MCU = self._peerEndOfCandidatesCounter.MCU || {};
    self._peerEndOfCandidatesCounter.MCU.len = 0;
    sendRestartMsgFn('MCU');
  } else {
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
        self.joinRoom(self._selectedRoom, {
          bandwidth: bwOptions.bandwidth || {},
          googleXBandwidth: bwOptions.googleXBandwidth || {},
          sdpSettings: clone(self._sdpSettings),
          voiceActivityDetection: self._voiceActivityDetection,
          publishOnly: !!self._publishOnly,
          parentId: self._parentId || null,
          autoBandwidthAdjustment: self._bandwidthAdjuster
        });
      }
    });
  }
};

/**
 * Function that handles the stats tabulation.
 * @method _parseConnectionStats
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._parseConnectionStats = function(prevStats, stats, prop) {
  var nTime = stats.timestamp;
  var oTime = prevStats ? prevStats.timestamp || 0 : 0;
  var nVal = parseFloat(stats[prop] || '0', 10);
  var oVal = parseFloat(prevStats ? prevStats[prop] || '0' : '0', 10);

  if ((new Date(nTime).getTime()) === (new Date(oTime).getTime())) {
    return nVal;
  }

  return parseFloat(((nVal - oVal) / (nTime - oTime) * 1000).toFixed(3) || '0', 10);
};

/**
 * Function that signals the end-of-candidates flag.
 * @method _signalingEndOfCandidates
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._signalingEndOfCandidates = function(targetMid) {
  var self = this;

  if (!self._peerEndOfCandidatesCounter[targetMid]) {
    return;
  }

  if (
  // If peer connection exists first and state is not closed.
    self._peerConnections[targetMid] && self._peerConnections[targetMid].signalingState !== self.PEER_CONNECTION_STATE.CLOSED &&
  // If remote description is set
    self._peerConnections[targetMid].remoteDescription && self._peerConnections[targetMid].remoteDescription.sdp &&
  // If end-of-candidates signal is received
    typeof self._peerEndOfCandidatesCounter[targetMid].expectedLen === 'number' &&
  // If all ICE candidates are received
    self._peerEndOfCandidatesCounter[targetMid].len >= self._peerEndOfCandidatesCounter[targetMid].expectedLen &&
  // If there is no ICE candidates queue
    (self._peerCandidatesQueue[targetMid] ? self._peerCandidatesQueue[targetMid].length === 0 : true) &&
  // If it has not been set yet
    !self._peerEndOfCandidatesCounter[targetMid].hasSet) {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Signaling of end-of-candidates remote ICE gathering.']);
    self._peerEndOfCandidatesCounter[targetMid].hasSet = true;
    try {
      if (AdapterJS.webrtcDetectedBrowser === 'edge') {
        var mLineCounter = -1;
        var addedMids = [];
        var sdpLines = self._peerConnections[targetMid].remoteDescription.sdp.split('\r\n');
        var rejected = false;

        for (var i = 0; i < sdpLines.length; i++) {
          if (sdpLines[i].indexOf('m=') === 0) {
            rejected = sdpLines[i].split(' ')[1] === '0';
            mLineCounter++;
          } else if (sdpLines[i].indexOf('a=mid:') === 0 && !rejected) {
            var mid = sdpLines[i].split('a=mid:')[1] || '';
            if (mid && addedMids.indexOf(mid) === -1) {
              addedMids.push(mid);
              self._addIceCandidate(targetMid, 'endofcan-' + (new Date()).getTime(), new RTCIceCandidate({
                sdpMid: mid,
                sdpMLineIndex: mLineCounter,
                candidate: 'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates'
              }));
              // Start breaking after the first add because of max-bundle option
              if (self._peerConnectionConfig.bundlePolicy === self.BUNDLE_POLICY.MAX_BUNDLE) {
                break;
              }
            }
          }
        }

      } else if (AdapterJS && !self._isLowerThanVersion(AdapterJS.VERSION, '0.14.0')) {
        self._peerConnections[targetMid].addIceCandidate(null);
      }

      if (self._gatheredCandidates[targetMid]) {
        self._trigger('candidatesGathered', targetMid, {
          expected: self._peerEndOfCandidatesCounter[targetMid].expectedLen || 0,
          received: self._peerEndOfCandidatesCounter[targetMid].len || 0,
          processed: self._gatheredCandidates[targetMid].receiving.srflx.length +
            self._gatheredCandidates[targetMid].receiving.relay.length +
            self._gatheredCandidates[targetMid].receiving.host.length
        });
      }

    } catch (error) {
      log.error([targetMid, 'RTCPeerConnection', null, 'Failed signaling end-of-candidates ->'], error);
    }
  }
};



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
    if (!(userData !== null && typeof userData === 'undefined')) {
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
  var peerInfo = null;

  if (typeof peerId === 'string' && typeof this._peerInformations[peerId] === 'object') {
    peerInfo = clone(this._peerInformations[peerId]);
    peerInfo.room = clone(this._selectedRoom);
    peerInfo.settings.bandwidth = peerInfo.settings.bandwidth || {};
    peerInfo.settings.googleXBandwidth = peerInfo.settings.googleXBandwidth || {};

    if (!(typeof peerInfo.settings.video === 'boolean' || (peerInfo.settings.video &&
      typeof peerInfo.settings.video === 'object'))) {
      peerInfo.settings.video = false;
      peerInfo.mediaStatus.audioMuted = true;
    }

    if (!(typeof peerInfo.settings.audio === 'boolean' || (peerInfo.settings.audio &&
      typeof peerInfo.settings.audio === 'object'))) {
      peerInfo.settings.audio = false;
      peerInfo.mediaStatus.audioMuted = true;
    }

    if (typeof peerInfo.mediaStatus.audioMuted !== 'boolean') {
      peerInfo.mediaStatus.audioMuted = true;
    }

    if (typeof peerInfo.mediaStatus.videoMuted !== 'boolean') {
      peerInfo.mediaStatus.videoMuted = true;
    }

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
      peerInfo.mediaStatus.audioMuted = true;
    }

    if (!this._sdpSettings.direction.video.receive) {
      peerInfo.settings.video = false;
      peerInfo.mediaStatus.videoMuted = true;
    }

    if (!this._sdpSettings.connection.audio) {
      peerInfo.settings.audio = false;
      peerInfo.mediaStatus.audioMuted = true;
    }

    if (!this._sdpSettings.connection.video) {
      peerInfo.settings.video = false;
      peerInfo.mediaStatus.videoMuted = true;
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
        peerInfo.mediaStatus.audioMuted = true;
      }
      if (!(this._sdpSessions[peerId].remote.connection.video &&
        this._sdpSessions[peerId].remote.connection.video.indexOf('send') > -1)) {
        peerInfo.settings.video = false;
        peerInfo.mediaStatus.videoMuted = true;
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
      mediaStatus: clone(this._streamsMutedSettings),
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

  if (!peerInfo.settings.audio) {
    peerInfo.mediaStatus.audioMuted = true;
  }

  if (!peerInfo.settings.video) {
    peerInfo.mediaStatus.videoMuted = true;
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
      audioMuted: true,
      videoMuted: true
    }
  };

  var usePeerId = self._hasMCU ? 'MCU' : peerId;

  if (!self._peerInformations[usePeerId]) {
    return customSettings;
  }
  

  if (self._peerConnections[usePeerId] && self._peerConnections[usePeerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
    var stream = self._peerConnections[peerId].localStream;
    var streamId = self._peerConnections[peerId].localStreamId || (stream && (stream.id || stream.label));

    customSettings.settings.data = self._initOptions.enableDataChannel && self._peerInformations[peerId].config.enableDataChannel;

    if (stream) {
      if (self._streams.screenshare && self._streams.screenshare.stream &&
        streamId === (self._streams.screenshare.stream.id || self._streams.screenshare.stream.label)) {
        customSettings.settings.audio = clone(self._streams.screenshare.settings.audio);
        customSettings.settings.video = clone(self._streams.screenshare.settings.video);
        customSettings.mediaStatus = clone(self._streamsMutedSettings);

      } else if (self._streams.userMedia && self._streams.userMedia.stream &&
        streamId === (self._streams.userMedia.stream.id || self._streams.userMedia.stream.label)) {
        customSettings.settings.audio = clone(self._streams.userMedia.settings.audio);
        customSettings.settings.video = clone(self._streams.userMedia.settings.video);
        customSettings.mediaStatus = clone(self._streamsMutedSettings);
      }

      if (typeof self._peerConnections[peerId].getSenders === 'function' &&
        !(self._initOptions.useEdgeWebRTC && window.msRTCPeerConnection)) {
        var senders = self._peerConnections[peerId].getSenders();
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
          customSettings.mediaStatus.audioMuted = true;
        }

        if (!hasSendVideo) {
          customSettings.settings.video = false;
          customSettings.mediaStatus.videoMuted = true;
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
      customSettings.mediaStatus.audioMuted = true;
    }
    if (!(self._sdpSessions[usePeerId].local.connection.video &&
      self._sdpSessions[usePeerId].local.connection.video.indexOf('send') > -1)) {
      customSettings.settings.video = false;
      customSettings.mediaStatus.videoMuted = true;
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
    userInfo.mediaStatus.videoMuted = true;
  }

  if (!this._getSDPCommonSupports(peerId).audio) {
    userInfo.settings.audio = false;
    userInfo.mediaStatus.audioMuted = true;
  }

  delete userInfo.agent;
  delete userInfo.room;
  delete userInfo.config;
  delete userInfo.parentId;
  delete userInfo.settings.data;
  return userInfo;
};

Skylink.prototype._doOffer = function(targetMid, iceRestart) {
  var self = this;
  var pc = self._peerConnections[targetMid];

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
    offerToReceiveAudio: !(!self._sdpSettings.connection.audio && targetMid !== 'MCU') && self._getSDPCommonSupports(targetMid).video,
    offerToReceiveVideo: !(!self._sdpSettings.connection.video && targetMid !== 'MCU') && self._getSDPCommonSupports(targetMid).audio,
    iceRestart: !!((self._peerInformations[targetMid] || {}).config || {}).enableIceRestart &&
      iceRestart && self._enableIceRestart,
    voiceActivityDetection: self._voiceActivityDetection
  };

  // Add stream only at offer/answer end
  if (!self._hasMCU || targetMid === 'MCU') {
    self._addLocalMediaStreams(targetMid);
  }

  if (self._initOptions.enableDataChannel && self._peerInformations[targetMid] &&
    self._peerInformations[targetMid].config.enableDataChannel/* &&
    !(!self._sdpSettings.connection.data && targetMid !== 'MCU')*/) {
    // Edge doesn't support datachannels yet
    if (!(self._dataChannels[targetMid] && self._dataChannels[targetMid].main)) {
      self._createDataChannel(targetMid);
      self._peerConnections[targetMid].hasMainChannel = true;
    }
  }

  log.debug([targetMid, null, null, 'Creating offer with config:'], offerConstraints);

  pc.endOfCandidates = false;

  if (self._peerConnStatus[targetMid]) {
    self._peerConnStatus[targetMid].sdpConstraints = offerConstraints;
  }

  var onSuccessCbFn = function(offer) {
    log.debug([targetMid, null, null, 'Created offer'], offer);
    self._setLocalAndSendMessage(targetMid, offer);
  };

  var onErrorCbFn = function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
    log.error([targetMid, null, null, 'Failed creating an offer:'], error);
  };

  pc.createOffer(onSuccessCbFn, onErrorCbFn, AdapterJS.webrtcDetectedType === 'plugin' ? {
    mandatory: {
      OfferToReceiveAudio: offerConstraints.offerToReceiveAudio,
      OfferToReceiveVideo: offerConstraints.offerToReceiveVideo,
      iceRestart: offerConstraints.iceRestart,
      voiceActivityDetection: offerConstraints.voiceActivityDetection
    }
  } : offerConstraints);
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

  var answerConstraints = AdapterJS.webrtcDetectedBrowser === 'edge' ? {
    offerToReceiveVideo: !(!self._sdpSettings.connection.audio && targetMid !== 'MCU') &&
      self._getSDPCommonSupports(targetMid, pc.remoteDescription).video,
    offerToReceiveAudio: !(!self._sdpSettings.connection.video && targetMid !== 'MCU') &&
      self._getSDPCommonSupports(targetMid, pc.remoteDescription).audio,
    voiceActivityDetection: self._voiceActivityDetection
  } : undefined;

  // Add stream only at offer/answer end
  if (!self._hasMCU || targetMid === 'MCU') {
    self._addLocalMediaStreams(targetMid);
  }

  if (self._peerConnStatus[targetMid]) {
    self._peerConnStatus[targetMid].sdpConstraints = answerConstraints;
  }

  var onSuccessCbFn = function(answer) {
    log.debug([targetMid, null, null, 'Created answer'], answer);
    self._setLocalAndSendMessage(targetMid, answer);
  };

  var onErrorCbFn = function(error) {
    log.error([targetMid, null, null, 'Failed creating an answer:'], error);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  };

  // No ICE restart constraints for createAnswer as it fails in chrome 48
  // { iceRestart: true }
  pc.createAnswer(onSuccessCbFn, onErrorCbFn, answerConstraints);
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
Skylink.prototype._setLocalAndSendMessage = function(targetMid, _sessionDescription) {
  var self = this;
  var pc = self._peerConnections[targetMid];

  // Added checks to ensure that sessionDescription is defined first
  if (!(!!_sessionDescription && !!_sessionDescription.sdp)) {
    log.warn([targetMid, 'RTCSessionDescription', null, 'Local session description is undefined ->'], _sessionDescription);
    return;
  }

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    log.warn([targetMid, 'RTCSessionDescription', _sessionDescription.type,
      'Local session description will not be set as connection does not exists ->'], _sessionDescription);
    return;

  } else if (_sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER &&
    pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    log.warn([targetMid, 'RTCSessionDescription', _sessionDescription.type, 'Local session description ' +
      'will not be set as signaling state is "' + pc.signalingState + '" ->'], _sessionDescription);
    return;

  // Added checks to ensure that state is "have-remote-offer" if setting local "answer"
  } else if (_sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER &&
    pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER) {
    log.warn([targetMid, 'RTCSessionDescription', _sessionDescription.type, 'Local session description ' +
      'will not be set as signaling state is "' + pc.signalingState + '" ->'], _sessionDescription);
    return;

  // Added checks if there is a current local sessionDescription being processing before processing this one
  } else if (pc.processingLocalSDP) {
    log.warn([targetMid, 'RTCSessionDescription', _sessionDescription.type,
      'Local session description will not be set as another is being processed ->'], _sessionDescription);
    return;
  }

  pc.processingLocalSDP = true;

  // Sets and expected receiving codecs etc.
  var sessionDescription = {
    type: _sessionDescription.type,
    sdp: _sessionDescription.sdp
  };

  sessionDescription.sdp = self._removeSDPFirefoxH264Pref(targetMid, sessionDescription);
  sessionDescription.sdp = self._setSDPCodecParams(targetMid, sessionDescription);
  sessionDescription.sdp = self._removeSDPUnknownAptRtx(targetMid, sessionDescription);
  sessionDescription.sdp = self._removeSDPCodecs(targetMid, sessionDescription);
  sessionDescription.sdp = self._handleSDPConnectionSettings(targetMid, sessionDescription, 'local');
  sessionDescription.sdp = self._removeSDPREMBPackets(targetMid, sessionDescription);

  if (self._peerConnectionConfig.disableBundle) {
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=group:BUNDLE.*\r\n/gi, '');
  }

  log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
    'Local session description updated ->'], sessionDescription.sdp);

  var onSuccessCbFn = function() {
    log.debug([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Local session description has been set ->'], sessionDescription);

    pc.processingLocalSDP = false;

    self._trigger('handshakeProgress', sessionDescription.type, targetMid);

    if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER) {
      pc.setAnswer = 'local';
    } else {
      pc.setOffer = 'local';
    }

    if (!self._initOptions.enableIceTrickle && !pc.gathered) {
      log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
        'Local session description sending is halted to complete ICE gathering.']);
      return;
    }

    self._sendChannelMessage({
      type: sessionDescription.type,
      sdp: self._renderSDPOutput(targetMid, sessionDescription),
      mid: self._user.sid,
      target: targetMid,
      rid: self._room.id,
      userInfo: self._getUserInfo(targetMid)
    });
  };

  var onErrorCbFn = function(error) {
    log.error([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local description failed setting ->'], error);

    pc.processingLocalSDP = false;

    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  };

  pc.setLocalDescription(new RTCSessionDescription(sessionDescription), onSuccessCbFn, onErrorCbFn);
};

Skylink.prototype.getPeers = function(showAll, callback){
	var self = this;
	if (!self._isPrivileged){
		log.warn('Please upgrade your key to privileged to use this function');
		return;
	}
	if (!self._initOptions.appKey){
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
 *   <a href="http://support.temasys.io/support/solutions/articles/12000012342-what-is-a-privileged-key-">
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


Skylink.prototype.joinRoom = function(room, options, callback) {
  var self = this;
  var selectedRoom = self._initOptions.defaultRoom;
  var previousRoom = self._selectedRoom;
  var mediaOptions = {};
  var timestamp = (new Date()).getTime() + Math.floor(Math.random() * 10000);
  self._joinRoomManager.timestamp = timestamp;

  if (room && typeof room === 'string') {
    selectedRoom = room;
  } else if (room && typeof room === 'object') {
    mediaOptions = room;
  } else if (typeof room === 'function') {
    callback = room;
  }

  if (options && typeof options === 'object') {
    mediaOptions = options;
  } else if (typeof options === 'function') {
    callback = options;
  }

  var resolveAsErrorFn = function (error, tryRoom, readyState) {
    log.error(error);

    if (typeof callback === 'function') {
      callback({
        room: tryRoom,
        errorCode: readyState || null,
        error: error instanceof Error ? error : new Error(JSON.stringify(error))
      });
    }
  };

  var joinRoomFn = function () {
    // If room has been stopped but does not matches timestamp skip.
    if (self._joinRoomManager.timestamp !== timestamp) {
      resolveAsErrorFn('joinRoom() process did not complete', selectedRoom);
      return;
    }

    self._initSelectedRoom(selectedRoom, function(initError, initSuccess) {
      if (initError) {
        resolveAsErrorFn(initError.error, self._selectedRoom, self._readyState);
        return;
      // If details has been initialised but does not matches timestamp skip.
      } else if (self._joinRoomManager.timestamp !== timestamp) {
        resolveAsErrorFn('joinRoom() process did not complete', selectedRoom);
        return;
      }

      self._waitForOpenChannel(mediaOptions || {}, timestamp, function (error, success) {
        if (error) {
          resolveAsErrorFn(error, self._selectedRoom, self._readyState);
          return;
        // If socket and stream has been retrieved but socket connection does not matches timestamp skip.
        } else if (self._joinRoomManager.timestamp !== timestamp) {
          resolveAsErrorFn('joinRoom() process did not complete', selectedRoom);
          return;
        }

        if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
          var checkStream = self._streams.screenshare && self._streams.screenshare.stream ?
            self._streams.screenshare.stream : (self._streams.userMedia && self._streams.userMedia.stream ?
              self._streams.userMedia.stream : null);

          if (checkStream ? checkStream.getTracks().length === 0 : true) {
            log.warn('Note that receiving audio and video streams may fail as safari 11 needs stream with audio and video tracks');
          } else if (checkStream.getAudioTracks().length === 0) {
            log.warn('Note that receiving audio streams may fail as safari 11 needs stream ' +
              'with audio and video tracks and not just with video tracks');
          } else if (checkStream.getVideoTracks().length === 0) {
            log.warn('Note that receiving video streams may fail as safari 11 needs stream ' +
              'with audio and video tracks and not just with audio tracks');
          }
        }

        if (typeof callback === 'function') {
          var peerOnJoin = function(peerId, peerInfo, isSelf) {
            self.off('systemAction', peerFailedJoin);
            self.off('channelClose', peerSocketFailedJoin);
            log.info([null, 'Room', selectedRoom, 'Connected to Room ->'], peerInfo);
            callback(null, {
              room: self._selectedRoom,
              peerId: peerId,
              peerInfo: peerInfo
            });
          };

          var peerFailedJoin = function (action, message) {
            self.off('peerJoined', peerOnJoin);
            self.off('channelClose', peerSocketFailedJoin);
            log.error([null, 'Room', selectedRoom, 'Failed connecting to Room ->'], message);
            resolveAsErrorFn(new Error(message), self._selectedRoom, self._readyState);
          };

          var peerSocketFailedJoin = function () {
            self.off('systemAction', peerFailedJoin);
            self.off('peerJoined', peerOnJoin);
            log.error([null, 'Room', selectedRoom, 'Failed connecting to Room due to abrupt disconnection.']);
            resolveAsErrorFn(new Error('Channel closed abruptly before session was established'), self._selectedRoom, self._readyState);
          };

          self.once('peerJoined', peerOnJoin, function(peerId, peerInfo, isSelf) {
            return peerInfo.room === selectedRoom && isSelf;
          });

          self.once('systemAction', peerFailedJoin, function (action) {
            return action === self.SYSTEM_ACTION.REJECT;
          });

          self.once('channelClose', peerSocketFailedJoin);
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
          key: self._initOptions.appKey
        });
      });
    });
  };

  if (room === null || ['number', 'boolean'].indexOf(typeof room) > -1) {
    resolveAsErrorFn('Invalid room name is provided', room);
    return;
  }

  if (options === null || ['number', 'boolean'].indexOf(typeof options) > -1) {
    resolveAsErrorFn('Invalid mediaOptions is provided', selectedRoom);
    return;
  }

  self._joinRoomManager.socketsFn.forEach(function (fnItem) {
    fnItem(timestamp);
  });

  self._joinRoomManager.socketsFn = [];

  var stopStream = mediaOptions.audio === false && mediaOptions.video === false;  

  if (self._inRoom) {
    self.leaveRoom({
      userMedia: stopStream
    }, function (lRError, lRSuccess) {
      log.debug([null, 'Room', previousRoom, 'Leave Room callback result ->'], [lRError, lRSuccess]);
      joinRoomFn();
    });
  } else {
    if (stopStream) {
      self.stopStream();
    }

    joinRoomFn();
  }
};

/**
 * <blockquote class="info">
 *   Note that this method will close any existing socket channel connection despite not being in the Room.
 * </blockquote>
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
 *   <li>If Socket connection is opened: <ol><li><a href="#event_channelClose"><code>channelClose</code> event</a> triggers.</li></ol></li>
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
 *   triggers parameter payload <code>serverPeerType</code> as <code>MCU</code>.</li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.leaveRoom = function(stopMediaOptions, callback) {
  var self = this;
  var stopUserMedia = true;
  var stopScreenshare = true;
  var previousRoom = self._selectedRoom;
  var previousUserPeerId = self._user ? self._user.sid : null;
  var peersThatLeft = [];
  var isNotInRoom = !self._inRoom;

  if (typeof stopMediaOptions === 'boolean') {
    if (stopMediaOptions === false) {
      stopUserMedia = false;
      stopScreenshare = false;
    }
  } else if (stopMediaOptions && typeof stopMediaOptions === 'object') {
    stopUserMedia = stopMediaOptions.userMedia !== false;
    stopScreenshare = stopMediaOptions.screenshare !== false;
  } else if (typeof stopMediaOptions === 'function') {
    callback = stopMediaOptions;
  }

  for (var infoPeerId in self._peerInformations) {
    if (self._peerInformations.hasOwnProperty(infoPeerId) && self._peerInformations[infoPeerId]) {
      peersThatLeft.push(infoPeerId);
      self._removePeer(infoPeerId);
    }
  }

  for (var connPeerId in self._peerConnections) {
    if (self._peerConnections.hasOwnProperty(connPeerId) && self._peerConnections[connPeerId]) {
      if (peersThatLeft.indexOf(connPeerId) === -1) {
        peersThatLeft.push(connPeerId);
        self._removePeer(connPeerId);
      }
    }
  }

  self._inRoom = false;
  self._closeChannel();

  if (isNotInRoom) {
    var notInRoomError = 'Unable to leave room as user is not in any room';
    log.error([null, 'Room', previousRoom, notInRoomError]);

    if (typeof callback === 'function') {
      callback(new Error(notInRoomError), null);
    }
    return;
  }

  self._stopStreams({
    userMedia: stopUserMedia,
    screenshare: stopScreenshare
  });

  self._wait(function () {
    log.log([null, 'Room', previousRoom, 'User left the room']);

    self._trigger('peerLeft', previousUserPeerId, self.getPeerInfo(), true);

    if (typeof callback === 'function') {
      callback(null, {
        peerId: previousUserPeerId,
        previousRoom: previousRoom
      });
    }
  }, function () {
    return !self._channelOpen;
  });
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
  if (!(this._user && this._user.sid)) {
    return;
  }
  log.log('Update to isRoomLocked status ->', true);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: true
  });
  this._roomLocked = true;
  this._trigger('roomLock', true, this._user.sid, this.getPeerInfo(), true);
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
  if (!(this._user && this._user.sid)) {
    return;
  }
  log.log('Update to isRoomLocked status ->', false);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: false
  });
  this._roomLocked = false;
  this._trigger('roomLock', false, this._user.sid, this.getPeerInfo(), true);
};

/**
 * Function that waits for Socket connection to Signaling to be opened.
 * @method _waitForOpenChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._waitForOpenChannel = function(mediaOptions, joinRoomTimestamp, callback) {
  var self = this;
  // when reopening room, it should stay as 0
  self._socketCurrentReconnectionAttempt = 0;

  // wait for ready state before opening
  self._wait(function() {
    var onChannelOpen = function () {
      self.off('socketError', onChannelError);

      // Wait for self._channelOpen flag to be defined first
      setTimeout(function () {
        mediaOptions = mediaOptions || {};

        self._userData = mediaOptions.userData || self._userData || '';
        self._streamsBandwidthSettings = {
          googleX: {},
          bAS: {}
        };
        self._publishOnly = false;
        self._sdpSettings = {
          connection: {
            audio: true,
            video: true,
            data: true
          },
          direction: {
            audio: { send: true, receive: true },
            video: { send: true, receive: true }
          }
        };
        self._voiceActivityDetection = typeof mediaOptions.voiceActivityDetection === 'boolean' ?
          mediaOptions.voiceActivityDetection : true;
        self._peerConnectionConfig = {
          bundlePolicy: self.BUNDLE_POLICY.BALANCED,
          rtcpMuxPolicy: self.RTCP_MUX_POLICY.REQUIRE,
          iceCandidatePoolSize: 0,
          certificate: self.PEER_CERTIFICATE.AUTO,
          disableBundle: false
        };
        self._bandwidthAdjuster = null;

        if (mediaOptions.bandwidth) {
          if (typeof mediaOptions.bandwidth.audio === 'number') {
            self._streamsBandwidthSettings.bAS.audio = mediaOptions.bandwidth.audio;
          }

          if (typeof mediaOptions.bandwidth.video === 'number') {
            self._streamsBandwidthSettings.bAS.video = mediaOptions.bandwidth.video;
          }

          if (typeof mediaOptions.bandwidth.data === 'number') {
            self._streamsBandwidthSettings.bAS.data = mediaOptions.bandwidth.data;
          }
        }

        if (mediaOptions.googleXBandwidth) {
          if (typeof mediaOptions.googleXBandwidth.min === 'number') {
            self._streamsBandwidthSettings.googleX.min = mediaOptions.googleXBandwidth.min;
          }

          if (typeof mediaOptions.googleXBandwidth.max === 'number') {
            self._streamsBandwidthSettings.googleX.max = mediaOptions.googleXBandwidth.max;
          }
        }

        if (mediaOptions.sdpSettings) {
          if (mediaOptions.sdpSettings.direction) {
            if (mediaOptions.sdpSettings.direction.audio) {
              self._sdpSettings.direction.audio.receive = typeof mediaOptions.sdpSettings.direction.audio.receive === 'boolean' ?
                mediaOptions.sdpSettings.direction.audio.receive : true;
              self._sdpSettings.direction.audio.send = typeof mediaOptions.sdpSettings.direction.audio.send === 'boolean' ?
                mediaOptions.sdpSettings.direction.audio.send : true;
            }

            if (mediaOptions.sdpSettings.direction.video) {
              self._sdpSettings.direction.video.receive = typeof mediaOptions.sdpSettings.direction.video.receive === 'boolean' ?
                mediaOptions.sdpSettings.direction.video.receive : true;
              self._sdpSettings.direction.video.send = typeof mediaOptions.sdpSettings.direction.video.send === 'boolean' ?
                mediaOptions.sdpSettings.direction.video.send : true;
            }
          }
          if (mediaOptions.sdpSettings.connection) {
            self._sdpSettings.connection.audio = typeof mediaOptions.sdpSettings.connection.audio === 'boolean' ?
              mediaOptions.sdpSettings.connection.audio : true;
            self._sdpSettings.connection.video = typeof mediaOptions.sdpSettings.connection.video === 'boolean' ?
              mediaOptions.sdpSettings.connection.video : true;
            self._sdpSettings.connection.data = typeof mediaOptions.sdpSettings.connection.data === 'boolean' ?
              mediaOptions.sdpSettings.connection.data : true;
          }
        }

        if (mediaOptions.publishOnly) {
          self._sdpSettings.direction.audio.send = true;
          self._sdpSettings.direction.audio.receive = false;
          self._sdpSettings.direction.video.send = true;
          self._sdpSettings.direction.video.receive = false;
          self._publishOnly = true;

          if (typeof mediaOptions.publishOnly === 'object' && mediaOptions.publishOnly.parentId &&
            typeof mediaOptions.publishOnly.parentId === 'string') {
            self._parentId = mediaOptions.publishOnly.parentId;
          }
        }

        if (mediaOptions.parentId) {
          self._parentId = mediaOptions.parentId;
        }

        if (mediaOptions.peerConnection && typeof mediaOptions.peerConnection === 'object') {
          if (typeof mediaOptions.peerConnection.bundlePolicy === 'string') {
            for (var bpProp in self.BUNDLE_POLICY) {
              if (self.BUNDLE_POLICY.hasOwnProperty(bpProp) &&
                self.BUNDLE_POLICY[bpProp] === mediaOptions.peerConnection.bundlePolicy) {
                self._peerConnectionConfig.bundlePolicy = mediaOptions.peerConnection.bundlePolicy;
              }
            }
          }
          if (typeof mediaOptions.peerConnection.rtcpMuxPolicy === 'string') {
            for (var rmpProp in self.RTCP_MUX_POLICY) {
              if (self.RTCP_MUX_POLICY.hasOwnProperty(rmpProp) &&
                self.RTCP_MUX_POLICY[rmpProp] === mediaOptions.peerConnection.rtcpMuxPolicy) {
                self._peerConnectionConfig.rtcpMuxPolicy = mediaOptions.peerConnection.rtcpMuxPolicy;
              }
            }
          }
          if (typeof mediaOptions.peerConnection.iceCandidatePoolSize === 'number' &&
            mediaOptions.peerConnection.iceCandidatePoolSize > 0) {
            self._peerConnectionConfig.iceCandidatePoolSize = mediaOptions.peerConnection.iceCandidatePoolSize;
          }
          if (typeof mediaOptions.peerConnection.certificate === 'string') {
            for (var pcProp in self.PEER_CERTIFICATE) {
              if (self.PEER_CERTIFICATE.hasOwnProperty(pcProp) &&
                self.PEER_CERTIFICATE[pcProp] === mediaOptions.peerConnection.certificate) {
                self._peerConnectionConfig.certificate = mediaOptions.peerConnection.certificate;
              }
            }
          }
          self._peerConnectionConfig.disableBundle = mediaOptions.peerConnection.disableBundle === true;
        }

        if (mediaOptions.autoBandwidthAdjustment) {
          self._bandwidthAdjuster = {
            interval: 10,
            limitAtPercentage: 100,
            useUploadBwOnly: false
          };

          if (typeof mediaOptions.autoBandwidthAdjustment === 'object') {
            if (typeof mediaOptions.autoBandwidthAdjustment.interval === 'number' &&
              mediaOptions.autoBandwidthAdjustment.interval >= 10) {
              self._bandwidthAdjuster.interval = mediaOptions.autoBandwidthAdjustment.interval;
            }
            if (typeof mediaOptions.autoBandwidthAdjustment.limitAtPercentage === 'number' &&
              (mediaOptions.autoBandwidthAdjustment.limitAtPercentage >= 0 &&
              mediaOptions.autoBandwidthAdjustment.limitAtPercentage <= 100)) {
              self._bandwidthAdjuster.limitAtPercentage = mediaOptions.autoBandwidthAdjustment.limitAtPercentage;
            }
            if (typeof mediaOptions.autoBandwidthAdjustment.useUploadBwOnly === 'boolean') {
              self._bandwidthAdjuster.useUploadBwOnly = mediaOptions.autoBandwidthAdjustment.useUploadBwOnly;
            }
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
      }, 1);
    };
    var onChannelError = function (errorState, error) {
      self.off('channelOpen', onChannelOpen);
      callback(error);
    };

    if (!self._channelOpen) {
      self.once('channelOpen', onChannelOpen);
      self.once('socketError', onChannelError, function (errorState) {
        return errorState === self.SOCKET_ERROR.RECONNECTION_ABORTED;
      });
      self._openChannel(joinRoomTimestamp);
    } else {
      onChannelOpen();
    }
  }, function() {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  });
};

/* jshint ignore:start */
Skylink.prototype.generateUUID = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r && 0x7 | 0x8)).toString(16);
  });
  return uuid;
};
/* jshint ignore:end */

/**
 * Function that authenticates and initialises App Key used for Room connections.
 * @method init
 * @param {JSON|String} options The configuration options.
 * - When provided as a string, it's configured as <code>options.appKey</code>.
 * @param {String} options.appKey The App Key.
 *   <small>By default, <code>init()</code> uses [HTTP CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
 *   authentication. For credentials based authentication, see the <code>options.credentials</code> configuration
 *   below. You can know more about the <a href="http://support.temasys.io/support/solutions/articles/
 * 12000002712-authenticating-your-application-key-to-start-a-connection">in the authentication methods article here</a>
 *   for more details on the various authentication methods.</small>
 *   <small>If you are using the Persistent Room feature for scheduled meetings, you will require to
 *   use the credential based authentication. See the <a href="http://support.temasys.io/support
 * /solutions/articles/12000002811-using-the-persistent-room-feature-to-configure-meetings">Persistent Room article here
 *   </a> for more information.</small>
 * @param {String} [options.defaultRoom] The default Room to connect to when no <code>room</code> parameter
 *    is provided in  <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.
 * - When not provided or is provided as an empty string, its value is <code>options.appKey</code>.
 *   <small>Note that switching Rooms is not available when using <code>options.credentials</code> based authentication.
 *   The Room that User will be connected to is the <code>defaultRoom</code> provided.</small>
 * @param {String} [options.roomServer] The Auth server for debugging purposes to use.
 *   <small>Note that this is a debugging feature and is only used when instructed for debugging purposes.</small>
 * @param {Boolean} [options.enableIceTrickle=true] The flag if Peer connections should
 *   trickle ICE for faster connectivity.
 * @param {Boolean} [options.enableDataChannel=true] <blockquote class="info">
 *   Note that for Edge browsers, this value is overriden as <code>false</code> due to its supports.
 *   </blockquote> The flag if Datachannel connections should be enabled.
 *   <small>This is required to be enabled for <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>,
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> and
 *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.</small>
 * @param {Boolean} [options.enableTURNServer=true] The flag if TURN ICE servers should
 *   be used when constructing Peer connections to allow TURN connections when required and enabled for the App Key.
 * @param {Boolean} [options.enableSTUNServer=true] The flag if STUN ICE servers should
 *   be used when constructing Peer connections to allow TURN connections when required.
 * @param {Boolean} [options.forceTURN=false] The flag if Peer connections should enforce
 *   connections over the TURN server.
 *   <small>This overrides <code>options.enableTURNServer</code> value to <code>true</code> and
 *   <code>options.enableSTUNServer</code> value to <code>false</code>, <code>options.filterCandidatesType.host</code>
 *   value to <code>true</code>, <code>options.filterCandidatesType.srflx</code> value to <code>true</code> and
 *   <code>options.filterCandidatesType.relay</code> value to <code>false</code>.</small>
 *   <small>Note that currently for MCU enabled Peer connections, the <code>options.filterCandidatesType</code>
 *   configuration is not honoured as Peers connected with MCU is similar as a forced TURN connection. The flags
 *   will act as if the value is <code>false</code> and ICE candidates will never be filtered regardless of the
 *   <code>options.filterCandidatesType</code> configuration.</small>
 * @param {Boolean} [options.usePublicSTUN=false] The flag if publicly available STUN ICE servers should
 *   be used if <code>options.enableSTUNServer</code> is enabled.
 * @param {Boolean} [options.TURNServerTransport] <blockquote class="info">
 *   Note that configuring the protocol may not necessarily result in the desired network transports protocol
 *   used in the actual TURN network traffic as it depends which protocol the browser selects and connects with.
 *   This simply configures the TURN ICE server urls <code?transport=(protocol)</code> query option when constructing
 *   the Peer connection. When all protocols are selected, the ICE servers urls are duplicated with all protocols.<br>
 *   Note that for Edge browsers, this value is overriden as <code>UDP</code> due to its supports.
 *   </blockquote> The option to configure the <code>?transport=</code>
 *   query parameter in TURN ICE servers when constructing a Peer connections.
 * - When not provided, its value is <code>ANY</code>.
 *   [Rel: Skylink.TURN_TRANSPORT]
 * @param {Boolean} [options.disableVideoFecCodecs=false] <blockquote class="info">
 *   Note that this is an experimental flag and may cause disruptions in connections or connectivity issues when toggled,
 *   and to prevent connectivity issues, these codecs will not be removed for MCU enabled Peer connections.
 *   </blockquote> The flag if video FEC (Forward Error Correction)
 *   codecs like ulpfec and red should be removed in sending session descriptions.
 *   <small>This can be useful for debugging purposes to prevent redundancy and overheads in RTP encoding.</small>
 * @param {Boolean} [options.disableComfortNoiseCodec=false] <blockquote class="info">
 *   Note that this is an experimental flag and may cause disruptions in connections or connectivity issues when toggled.
 *   </blockquote> The flag if audio
 *   <a href="https://en.wikipedia.org/wiki/Comfort_noise">Comfort Noise (CN)</a> codec should be removed
 *   in sending session descriptions.
 *   <small>This can be useful for debugging purposes to test preferred audio quality and feedback.</small>
 * @param {Boolean} [options.disableREMB=false] <blockquote class="info">
 *   Note that this is mainly used for debugging purposes and that it is an experimental flag, so
 *   it may cause disruptions in connections or connectivity issues when toggled. </blockquote>
 *   The flag if video REMB feedback packets should be disabled in sending session descriptions.
 * @param {JSON} [options.credentials] <blockquote class="info">
 *   Note that we strongly recommend developers to return the <code>options.credentials.duration</code>,
 *   <code>options.credentials.startDateTime</code> and <code>options.defaultRoom</code> and generate the
 *   <code>options.credentials.credentials</code> from a web server as secret shouldn't be exposed on client web app as
 *   it poses a security risk itself.</blockquote>
 *   The credentials used for authenticating App Key with
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
 * @param {Boolean} [options.forceSSL=true] The flag if HTTPS connections should be enforced
 *   during request to Auth server and socket connections to Signaling server
 *   when accessing <code>window.location.protocol</code> value is <code>"http:"</code>.
 *   <small>By default, <code>"https:"</code> protocol connections uses HTTPS connections.</small>
 * @param {String|JSON} [options.audioCodec] <blockquote class="info">
 *   Note that if the audio codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.<br>
 *   Note that for Edge browsers, this value is set as <code>OPUS</code> due to its supports.</blockquote>
 *   The option to configure the preferred audio codec to use to encode sending audio data when available for Peer connection.
 * - When not provided, its value is <code>AUTO</code>.
 *   [Rel: Skylink.AUDIO_CODEC]
 * @param {String} options.audioCodec.codec The audio codec to prefer to encode sending audio data when available.
 *   <small>The value must not be <code>AUTO</code>.</small>
 *   [Rel: Skylink.AUDIO_CODEC]
 * @param {Number} [options.audioCodec.samplingRate] The audio codec sampling to prefer to encode sending audio data when available.
 * @param {Number} [options.audioCodec.channels] The audio codec channels to prefer to encode sending audio data when available.
 * @param {String|JSON} [options.videoCodec] <blockquote class="info">
 *   Note that if the video codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.<br>
 *   Note that for Edge browsers, this value is set as <code>H264</code> due to its supports.</blockquote>
 *   The option to configure the preferred video codec to use to encode sending video data when available for Peer connection.
 * - When not provided, its value is <code>AUTO</code>.
 *   [Rel: Skylink.VIDEO_CODEC]
 * @param {String} options.videoCodec.codec The video codec to prefer to encode sending audio data when available.
 *   <small>The value must not be <code>AUTO</code>.</small>
 *   [Rel: Skylink.VIDEO_CODEC]
 * @param {Number} [options.videoCodec.samplingRate] The video codec sampling to prefer to encode sending video data when available.
 * @param {Number} [options.socketTimeout=7000] The timeout for each attempts for socket connection
 *   with the Signaling server to indicate that connection has timed out and has failed to establish.
 *   <small>Note that the mininum timeout value is <code>5000</code>. If less, this value will be <code>5000</code>.</small>
 *   <small>Note that it is recommended to use <code>7000</code> as the lowest timeout value if Peers are connecting
 *   using Polling transports to prevent connection errors.</small>
 * @param {Number} [options.apiTimeout=4000] The timeout to wait for response from Auth server.
 * @param {Boolean} [options.forceTURNSSL=false] <blockquote class="info">
 *   Note that currently Firefox does not support the TURNS protocol, and that if TURNS is required,
 *   TURN ICE servers using port <code>443</code> will be used instead.<br>
 *   Note that for Edge browsers, this value is overriden as <code>false</code> due to its supports and
 *   only port <code>3478</code> is used.</blockquote>
 *   The flag if TURNS protocol should be used when <code>options.enableTURNServer</code> is enabled.
 * @param {JSON} [options.filterCandidatesType] <blockquote class="info">
 *   Note that this a debugging feature and there might be connectivity issues when toggling these flags.
 *   </blockquote> The configuration options to filter the type of ICE candidates sent and received.
 * @param {Boolean} [options.filterCandidatesType.host=false] The flag if local network ICE candidates should be filtered out.
 * @param {Boolean} [options.filterCandidatesType.srflx=false] The flag if STUN ICE candidates should be filtered out.
 * @param {Boolean} [options.filterCandidatesType.relay=false] The flag if TURN ICE candidates should be filtered out.
 * @param {JSON} [options.throttleIntervals] The configuration options to configure the throttling method timeouts.
 * @param {Number} [options.throttleIntervals.shareScreen=10000] The interval timeout for
 *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> throttling in milliseconds.
 * @param {Number} [options.throttleIntervals.getUserMedia=0] The interval timeout for
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> throttling in milliseconds.
 * @param {Number} [options.throttleIntervals.refreshConnection=5000] <blockquote class="info">
 *   Note that this throttling is only done for MCU enabled Peer connections with the
 *   <code>options.mcuUseRenegoRestart</code> being set to <code>false</code>.
 *   </blockquote> The interval timeout for <a href="#method_refreshConnection">
 *   <code>refreshConnection()</code> method</a> throttling in milliseconds.
 *   <small>Note that there will be no throttling when <a href="#method_refreshConnection">
 *   <code>refreshConnection()</code> method</a> is called internally.</small>
 * @param {Boolean} [options.throttleShouldThrowError=false] The flag if throttled methods should throw errors when
 *   method is invoked less than the interval timeout value configured in <code>options.throttleIntervals</code>.
 * @param {Boolean} [options.mcuUseRenegoRestart=false] <blockquote class="info">
 *   Note that this feature is currently is beta and for any enquiries on enabling and its support, please
 *   contact <a href="http://support.temasys.io">our support portal</a>.</blockquote>
 *   The flag if <a href="#method_refreshConnection"><code>
 *   refreshConnection()</code> method</a> should renegotiate like non-MCU enabled Peer connection for MCU
 *   enabled Peer connections instead of invoking <a href="#method_joinRoom"><code>joinRoom()</code> method</a> again.
 * @param {String|Array} [options.iceServer] The ICE servers for debugging purposes to use.
 *   - When defined as string, the value is considered as <code>[options.iceServer]</code>.
 *   <small>Note that this is a debugging feature and is only used when instructed for debugging purposes.</small>
 * @param {String} [options.iceServer.#index] The ICE server url for debugging purposes to use.
 * @param {String|JSON} [options.socketServer] The Signaling server for debugging purposes to use.
 *   - When defined as string, the value is considered as <code>{ url: options.socketServer }</code>.
 *   <small>Note that this is a debugging feature and is only used when instructed for debugging purposes.</small>
 * @param {String} options.socketServer.url The Signaling server URL for debugging purposes to use.
 * @param {Array} [options.socketServer.ports] The list of Signaling server ports for debugging purposes to use.
 *   <small>If not defined, it will use the default list of ports specified.</small>
 * @param {Number} options.socketServer.ports.#index The Signaling server port to fallback and use for debugging purposes.
 * @param {String} [options.socketServer.protocol] The Signaling server protocol for debugging purposes to use.
 *   <small>If not defined, it will use the default protocol specified.</small>
 * @param {JSON} [options.codecParams] <blockquote class="info">
 *   Note that some of these parameters are mainly used for experimental or debugging purposes. Toggling any of
 *   these feature may result in disruptions in connectivity.</blockquote>
 *   The audio and video codecs parameters to configure.
 * @param {JSON} [options.codecParams.video] The video codecs parameters to configure.
 * @param {JSON} [options.codecParams.video.h264] The H264 video codec parameters to configure.
 * @param {String} [options.codecParams.video.h264.profileLevelId] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The H264 video codec base16 encoded string which indicates the H264 baseline, main, or the extended profiles.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [options.codecParams.video.h264.levelAsymmetryAllowed] <blockquote class="info">
 *   Note that this is an experimental parameter which may result in connectivity issues when toggled.</blockquote>
 *   The flag if streaming H264 sending video data should be encoded at a different level
 *   from receiving video data from Peer encoding to User when Peer is the offerer.
 *   <small>If Peer is the offerer instead of the User, the Peer's <code>peerInfo.config.priorityWeight</code> will be
 *   higher than User's <code>peerInfo.config.priorityWeight</code>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [options.codecParams.video.h264.packetizationMode] <blockquote class="info">
 *   Note that this is an experimental parameter which may result in connectivity issues when enabled. It is
 *   advisable to turn off this feature off when receiving H264 decoders do not support the packetization mode,
 *   which may result in a blank receiving video stream.</blockquote>
 *   The flag to enable H264 video codec packetization mode, which splits video frames that are larger
 *   for a RTP packet into RTP packet chunks.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {JSON} [options.codecParams.video.vp8] The VP8 video codec parameters to configure.
 * @param {Number} [options.codecParams.video.vp8.maxFr] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only. Do not toggle this otherwise.</blockquote>
 *   The maximum number of fps (frames per second) that the VP8 video codec decoder is capable of
 *   decoding when receiving encoded video data packets.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [options.codecParams.video.vp8.maxFs] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only. Do not toggle this otherwise.</blockquote>
 *   The maximum number of frame size macroblocks that the VP8 video codec decoder is capable of
 *   decoding when receiving encoded video data packets.
 *   <small>The value has to have the width and height of the frame in macroblocks less than the value of
 *   <code>parseInt(Math.sqrt(maxFs * 8))</code>. E.g. If the value is <code>1200</code>, it is capable of
 *   support <code>640x480</code> frame width and height, which heights up to <code>1552px</code>
 *   (<code>97</code> macroblocks value.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {JSON} [options.codecParams.video.vp9] The VP9 video codec parameters to configure.
 * @param {Number} [options.codecParams.video.vp9.maxFr] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only. Do not toggle this otherwise.</blockquote>
 *   The maximum number of fps (frames per second) that the VP9 video codec decoder is capable of
 *   decoding when receiving encoded video data packets.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [options.codecParams.video.vp9.maxFs] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only. Do not toggle this otherwise.</blockquote>
 *   The maximum number of frame size macroblocks that the VP9 video codec decoder is capable of
 *   decoding when receiving encoded video data packets.
 *   <small>The value has to have the width and height of the frame in macroblocks less than the value of
 *   <code>parseInt(Math.sqrt(maxFs * 8))</code>. E.g. If the value is <code>1200</code>, it is capable of
 *   support <code>640x480</code> frame width and height, which heights up to <code>1552px</code>
 *   (<code>97</code> macroblocks value.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {JSON} [options.codecParams.audio] The audio codecs parameters to configure.
 * @param {JSON} [options.codecParams.audio.opus] <blockquote class="info">
 *   Note that this is only applicable to OPUS audio codecs with a sampling rate of <code>48000</code> Hz (hertz).
 *   </blockquote> The OPUS audio codec parameters to configure.
 * @param {Boolean} [options.codecParams.audio.opus.stereo] The flag if OPUS audio codec is able to decode or receive stereo packets.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [options.codecParams.audio.opus.sprop-stereo] The flag if OPUS audio codec is sending stereo packets.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [options.codecParams.audio.opus.usedtx] <blockquote class="info">
 *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
 *   The flag if OPUS audio codec should enable DTX (Discontinuous Transmission) for sending encoded audio data.
 *   <small>This might help to reduce bandwidth as it reduces the bitrate during silence or background noise, and
 *   goes hand-in-hand with the <code>options.voiceActivityDetection</code> flag in <a href="#method_joinRoom">
 *   <code>joinRoom()</code> method</a>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [options.codecParams.audio.opus.useinbandfec] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The flag if OPUS audio codec has the capability to take advantage of the in-band FEC
 *   (Forward Error Correction) when sending encoded audio data.
 *   <small>This helps to reduce the harm of packet loss by encoding information about the previous packet loss.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [options.codecParams.audio.opus.maxplaybackrate] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The OPUS audio codec maximum output sampling rate in Hz (hertz) that is is capable of receiving
 *   decoded audio data, to adjust to the hardware limitations and ensure that any sending audio data
 *   would not encode at a higher sampling rate specified by this.
 *   <small>This value must be between <code>8000</code> to <code>48000</code>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [options.codecParams.minptime] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The OPUS audio codec receiving audio data decoder minimum length of time in milleseconds should be
 *   encapsulated in a single received encoded audio data packet.
 *   <small>This value must be between <code>3</code> to <code>120</code></small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {String} [options.priorityWeightScheme] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only and may not work when
 *   internals change.</blockquote> The User's priority weight to enforce User as offerer or answerer.
 * - When not provided, its value is <code>AUTO</code>.
 *   [Rel: Skylink.PRIORITY_WEIGHT_SCHEME]
 * @param {Boolean} [options.useEdgeWebRTC=false] The flag to use Edge 15.x pre-1.0 WebRTC support.
 * @param {Boolean} [options.enableSimultaneousTransfers=true] The flag to enable simultaneous data transfers.
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
 * @param {Error|String} callback.error.error The <a href="#event_readyStateChange"><code>readyStateChange</code>
 *   event</a> <code>error.content</code> parameter payload value.
 * @param {Number} callback.error.status The <a href="#event_readyStateChange"><code>readyStateChange</code>
 *   event</a> <code>error.status</code> parameter payload value.
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.serverUrl The constructed REST URL requested to Auth server.
 * @param {Number} callback.success.readyState The current ready state.
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
 * @param {String|JSON} callback.success.audioCodec The configured value of the <code>options.audioCodec</code>.
 * @param {String|JSON} callback.success.videoCodec The configured value of the <code>options.videoCodec</code>.
 * @param {Number} callback.success.socketTimeout The configured value of the <code>options.socketTimeout</code>.
 * @param {Number} callback.success.apiTimeout The configured value of the <code>options.apiTimeout</code>.
 * @param {Boolean} callback.success.forceTURNSSL The configured value of the <code>options.forceTURNSSL</code>.
 * @param {Boolean} callback.success.forceTURN The configured value of the <code>options.forceTURN</code>.
 * @param {Boolean} callback.success.usePublicSTUN The configured value of the <code>options.usePublicSTUN</code>.
 * @param {Boolean} callback.success.disableVideoFecCodecs The configured value of the <code>options.disableVideoFecCodecs</code>.
 * @param {Boolean} callback.success.disableComfortNoiseCodec The configured value of the <code>options.disableComfortNoiseCodec</code>.
 * @param {Boolean} callback.success.disableREMB The configured value of the <code>options.disableREMB</code>.
 * @param {JSON} callback.success.filterCandidatesType The configured value of the <code>options.filterCandidatesType</code>.
 * @param {JSON} callback.success.throttleIntervals The configured value of the <code>options.throttleIntervals</code>.
 * @param {Boolean} callback.success.throttleShouldThrowError The configured value of the <code>options.throttleShouldThrowError</code>.
 * @param {JSON} callback.success.mcuUseRenegoRestart The configured value of the <code>options.mcuUseRenegoRestart</code>.
 * @param {JSON} callback.success.iceServer The configured value of the <code>options.iceServer</code>.
 *   <small>See the <code>.urls</code> property in this object for configured value if defined.</small>
 * @param {JSON|String} callback.success.socketServer The configured value of the <code>options.socketServer</code>.
 * @param {Boolean} callback.success.useEdgeWebRTC The configured value of the <code>options.useEdgeWebRTC</code>.
 * @param {Boolean} callback.success.enableSimultaneousTransfers The configured value of the <code>options.enableSimultaneousTransfers</code>.
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
 *       hash          = CryptoJS.HmacSHA1(defaultRoom + "\_" + duration + "\_" + startDateTime, appKeySecret);
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
Skylink.prototype.init = function(_options, _callback) {
  var self = this;
  var options = {};
  var callback = function () {};

  // `init(function () {})`
  if (typeof _options === 'function'){
    callback = _options;

  // `init({})`
  } else if (_options && typeof _options === 'object') {
    options = clone(_options);

    // `init({ apiKey: "xxxxx" })` (fallback for older documentation)
    if (!(options.appKey && typeof options.appKey === 'string') &&
      (options.apiKey && typeof options.apiKey === 'string')) {
      options.appKey = options.apiKey;
    }

  // `init("xxxxx")` (for just the options.appKey being provided)
  } else if (_options && typeof _options === 'string') {
    options.appKey = _options;
  }

  // `init(.., function () {})`
  if (typeof _callback === 'function') {
    callback = _callback;
  }

  // `init({ defaultRoom: "xxxxx" })`
  options.defaultRoom = options.defaultRoom && typeof options.defaultRoom === 'string' ? options.defaultRoom : options.appKey;
  
  // `init({ roomServer: "//server.temasys.io" })`
  options.roomServer = options.roomServer && typeof options.roomServer === 'string' ? options.roomServer : '//api.temasys.io';

  // `init({ enableIceTrickle: true })`
  options.enableIceTrickle = options.enableIceTrickle !== false;

  // `init({ enableIceTrickle: true })`
  options.enableDataChannel = options.enableDataChannel !== false;

  // `init({ enableSTUNServer: true })`
  options.enableSTUNServer = options.enableSTUNServer !== false;

  // `init({ enableTURNServer: true })`
  options.enableTURNServer = options.enableTURNServer !== false;

  // `init({ audioFallback: true })`
  options.audioFallback = options.audioFallback === true;

  // `init({ forceSSL: true })`
  options.forceSSL = options.forceSSL !== false;

  // `init({ socketTimeout: 20000 })`
  options.socketTimeout = typeof options.socketTimeout === 'number' && options.socketTimeout >= 5000 ? options.socketTimeout : 7000;

  // `init({ socketTimeout: 4000 })`
  options.apiTimeout = typeof options.apiTimeout === 'number' ? options.apiTimeout : 4000;

  // `init({ forceTURNSSL: false })`
  options.forceTURNSSL = options.forceTURNSSL === true;

  // `init({ forceTURN: false })`
  options.forceTURN = options.forceTURN === true;

  // `init({ usePublicSTUN: false })`
  options.usePublicSTUN = options.usePublicSTUN === true;

  // `init({ disableVideoFecCodecs: false })`
  options.disableVideoFecCodecs = options.disableVideoFecCodecs === true;

  // `init({ disableComfortNoiseCodec: false })`
  options.disableComfortNoiseCodec = options.disableComfortNoiseCodec === true;

  // `init({ disableREMB: false })`
  options.disableREMB = options.disableREMB === true;

  // `init({ throttleShouldThrowError: false })`
  options.throttleShouldThrowError = options.throttleShouldThrowError === true;

  // `init({ mcuUseRenegoRestart: false })`
  options.mcuUseRenegoRestart = options.mcuUseRenegoRestart === true;

  // `init({ useEdgeWebRTC: false })`
  options.useEdgeWebRTC = options.useEdgeWebRTC === true;

  // `init({ enableSimultaneousTransfers: true })`
  options.enableSimultaneousTransfers = options.enableSimultaneousTransfers !== false;

  // `init({ priorityWeightScheme: "auto" })`
  options.priorityWeightScheme = self._containsInList('PRIORITY_WEIGHT_SCHEME', options.priorityWeightScheme, 'AUTO');

  // `init({ TURNServerTransport: "any" })`
  options.TURNServerTransport = self._containsInList('TURN_TRANSPORT', options.TURNServerTransport, 'ANY');

  // `init({ credentials: { credentials: "xxxxx", startDateTime: "xxxxx", duration: 24 } })`
  options.credentials = options.credentials && typeof options.credentials === 'object' &&
    options.credentials.startDateTime && typeof options.credentials.startDateTime === 'string' &&
    options.credentials.credentials && typeof options.credentials.credentials === 'string' &&
    typeof options.credentials.duration === 'number' ? options.credentials : null;

  // `init({ filterCandidatesType: { .. } })`
  options.filterCandidatesType = options.filterCandidatesType &&
    typeof options.filterCandidatesType === 'object' ? options.filterCandidatesType : {};

  // `init({ filterCandidatesType: { host: false } })`
  options.filterCandidatesType.host = options.filterCandidatesType.host === true;

  // `init({ filterCandidatesType: { srflx: false } })`
  options.filterCandidatesType.srflx = options.filterCandidatesType.srflx === true;

  // `init({ filterCandidatesType: { relay: false } })`
  options.filterCandidatesType.relay = options.filterCandidatesType.relay === true;

  // `init({ throttleIntervals: { .. } })`
  options.throttleIntervals = options.throttleIntervals &&
    typeof options.throttleIntervals === 'object' ? options.throttleIntervals : {};

  // `init({ throttleIntervals: { shareScreen: 10000 } })`
  options.throttleIntervals.shareScreen = typeof options.throttleIntervals.shareScreen === 'number' ?
    options.throttleIntervals.shareScreen : 10000;

  // `init({ throttleIntervals: { refreshConnection: 5000 } })`
  options.throttleIntervals.refreshConnection = typeof options.throttleIntervals.refreshConnection === 'number' ?
    options.throttleIntervals.refreshConnection : 5000;

  // `init({ throttleIntervals: { getUserMedia: 0 } })`
  options.throttleIntervals.getUserMedia = typeof options.throttleIntervals.getUserMedia === 'number' ?
    options.throttleIntervals.getUserMedia : 0;

  // `init({ iceServer: "turn:xxxx.io" })`
  if (options.iceServer && typeof options.iceServer === 'string') {
    options.iceServer = { urls: [options.iceServer] };

  // `init({ iceServer: ["turn:xxxx.io", "turn:xxx2.io"] })`
  } else if (Array.isArray(options.iceServer) && options.iceServer.length > 0) {
    options.iceServer = { urls: options.iceServer };

  } else {
    options.iceServer = null;
  }

  // `init({ socketServer: "server.io" })`
  if (options.socketServer && typeof options.socketServer === 'string') {
    options.socketServer = options.socketServer;

  // `init({ socketServer: { url: "server.io", ... } })`
  } else if (options.socketServer && typeof options.socketServer === 'object' &&
    options.socketServer.url && typeof options.socketServer.url === 'string') {
    options.socketServer = {
      url: options.socketServer.url,
      // `init({ socketServer: { ports: [80, 3000], ... } })`
      ports: Array.isArray(options.socketServer.ports) ? options.socketServer.ports : [],
      // `init({ socketServer: { protocol: "https:", ... } })`
      protocol: options.socketServer.protocol ? options.socketServer.protocol : null
    };

  } else {
    options.socketServer = null;
  }

  // `init({ audioCodec: { codec: "xxxx", ... } })`
  if (options.audioCodec && typeof options.audioCodec === 'object' &&
    self._containsInList('AUDIO_CODEC', options.audioCodec.codec, '-')) {
    options.audioCodec = {
      codec: options.audioCodec.codec,
      // `init({ audioCodec: { samplingRate: 48000, ... } })`
      samplingRate: typeof options.audioCodec.samplingRate === 'number' ? options.audioCodec.samplingRate : null,
      // `init({ audioCodec: { channels: 2, ... } })`
      channels: typeof options.audioCodec.channels === 'number' ? options.audioCodec.channels : null
    };

  // `init({ audioCodec: "xxxx" })`
  } else {
    options.audioCodec = self._containsInList('AUDIO_CODEC', options.audioCodec, 'AUTO');
  }

  // `init({ videoCodec: { codec: "xxxx", ... } })`
  if (options.videoCodec && typeof options.videoCodec === 'object' &&
    self._containsInList('VIDEO_CODEC', options.videoCodec.codec, '-')) {
    options.videoCodec = {
      codec: options.videoCodec.codec,
      // `init({ videoCodec: { samplingRate: 48000, ... } })`
      samplingRate: typeof options.videoCodec.samplingRate === 'number' ? options.videoCodec.samplingRate : null
    };
    
  // `init({ videoCodec: "xxxx" })`
  } else {
    options.videoCodec = self._containsInList('VIDEO_CODEC', options.videoCodec, 'AUTO');
  }

  // `init({ codecParams: { ... } })`
  options.codecParams = options.codecParams && typeof options.codecParams === 'object' ? options.codecParams : {};

  // `init({ codecParams: { audio: { ... } } })`
  options.codecParams.audio = options.codecParams.audio && typeof options.codecParams.audio === 'object' ? options.codecParams.audio : {};

  // `init({ codecParams: { video: { ... } } })`
  options.codecParams.video = options.codecParams.video && typeof options.codecParams.video === 'object' ? options.codecParams.video : {};

  // `init({ codecParams: { audio: { opus: { ... } } } })`
  options.codecParams.audio.opus = options.codecParams.audio.opus &&
    typeof options.codecParams.audio.opus === 'object' ? options.codecParams.audio.opus : {};

  // `init({ codecParams: { audio: { opus: { stereo: true } } } })`
  options.codecParams.audio.opus.stereo = typeof options.codecParams.audio.opus.stereo === 'boolean' ?
    options.codecParams.audio.opus.stereo : null;

  // `init({ codecParams: { audio: { opus: { "sprop-stereo": true } } } })`
  options.codecParams.audio.opus['sprop-stereo'] = typeof options.codecParams.audio.opus['sprop-stereo'] === 'boolean' ?
    options.codecParams.audio.opus['sprop-stereo'] : null;

  // `init({ codecParams: { audio: { opus: { usedtx: true } } } })`
  options.codecParams.audio.opus.usedtx = typeof options.codecParams.audio.opus.usedtx === 'boolean' ?
    options.codecParams.audio.opus.usedtx : null;

  // `init({ codecParams: { audio: { opus: { useinbandfec: true } } } })`
  options.codecParams.audio.opus.useinbandfec = typeof options.codecParams.audio.opus.useinbandfec === 'boolean' ?
    options.codecParams.audio.opus.useinbandfec : null;

  // `init({ codecParams: { audio: { opus: { maxplaybackrate: 48000 } } } })`
  options.codecParams.audio.opus.maxplaybackrate = typeof options.codecParams.audio.opus.maxplaybackrate === 'number' &&
    options.codecParams.audio.opus.maxplaybackrate >= 8000 && options.codecParams.audio.opus.maxplaybackrate <= 48000 ?
    options.codecParams.audio.opus.maxplaybackrate : null;

  // `init({ codecParams: { audio: { opus: { minptime: 60 } } } })`
  options.codecParams.audio.opus.minptime = typeof options.codecParams.audio.opus.minptime === 'number' &&
    options.codecParams.audio.opus.minptime >= 3 ? options.codecParams.audio.opus.minptime : null;

  // `init({ codecParams: { video: { h264: { ... } } } })`
  options.codecParams.video.h264 = options.codecParams.video.h264 &&
    typeof options.codecParams.video.h264 === 'object' ? options.codecParams.video.h264 : {};
  
  // `init({ codecParams: { video: { h264: { profileLevelId: "xxxxxx" } } } })`
  options.codecParams.video.h264.profileLevelId = options.codecParams.video.h264.profileLevelId &&
    typeof options.codecParams.video.h264.profileLevelId === 'string' ?
    options.codecParams.video.h264.profileLevelId : null;
  
  // `init({ codecParams: { video: { h264: { levelAsymmetryAllowed: 1 } } } })`
  options.codecParams.video.h264.levelAsymmetryAllowed = typeof options.codecParams.video.h264.levelAsymmetryAllowed === 'boolean' ?
    options.codecParams.video.h264.levelAsymmetryAllowed : null;
  
  // `init({ codecParams: { video: { h264: { packetizationMode: 1 } } } })` (fallback for number)
  options.codecParams.video.h264.packetizationMode = typeof options.codecParams.video.h264.packetizationMode === 'boolean' ?
    (options.codecParams.video.h264.packetizationMode === true ? 1 : 0) :
    (typeof options.codecParams.video.h264.packetizationMode === 'number' ?
    options.codecParams.video.h264.packetizationMode : null);

  // `init({ codecParams: { video: { vp8: { ... } } } })`
  options.codecParams.video.vp8 = options.codecParams.video.vp8 &&
    typeof options.codecParams.video.vp8 === 'object' ? options.codecParams.video.vp8 : {};

  // `init({ codecParams: { video: { vp8: { maxFs: 100 } } } })`
  options.codecParams.video.vp8.maxFs = typeof options.codecParams.video.vp8.maxFs === 'number' ?
    options.codecParams.video.vp8.maxFs : null;

  // `init({ codecParams: { video: { vp8: { maxFr: 100 } } } })`
  options.codecParams.video.vp8.maxFr = typeof options.codecParams.video.vp8.maxFr === 'number' ?
    options.codecParams.video.vp8.maxFr : null;

  // `init({ codecParams: { video: { vp9: { ... } } } })`
  options.codecParams.video.vp9 = options.codecParams.video.vp9 &&
    typeof options.codecParams.video.vp9 === 'object' ? options.codecParams.video.vp9 : {};

  // `init({ codecParams: { video: { vp9: { maxFs: 100 } } } })`
  options.codecParams.video.vp9.maxFs = typeof options.codecParams.video.vp9.maxFs === 'number' ?
    options.codecParams.video.vp9.maxFs : null;

  // `init({ codecParams: { video: { vp9: { maxFr: 100 } } } })`
  options.codecParams.video.vp9.maxFr = typeof options.codecParams.video.vp9.maxFr === 'number' ?
    options.codecParams.video.vp9.maxFr : null;

  // Force TURN connections should enforce settings.
  if (options.forceTURN) {
    options.enableTURNServer = true;
    options.enableSTUNServer = false;
    options.filterCandidatesType.host = true;
    options.filterCandidatesType.srflx = true;
    options.filterCandidatesType.relay = false;
  }

  self.once('readyStateChange', function () { }, function (state, error) {
    if (state === self.READY_STATE_CHANGE.ERROR) {
      log.error('Failed init() process ->', error);
      callback({
        error: error.content,
        errorCode: error.errorCode,
        status: error.status
      }, null);
      return true;

    } else if (state === self.READY_STATE_CHANGE.COMPLETED) {
      log.info('Completed init() successfully ->', options);
    
      var success = clone(self._initOptions);
      success.serverUrl = self._path;
      success.readyState = self._readyState;
      success.selectedRoom = self._selectedRoom;
      success.TURNTransport = success.TURNServerTransport;
  
      callback(null, success);
      return true;
    }
  });

  self._initOptions = options;
  self._readyState = self.READY_STATE_CHANGE.INIT;
  self._selectedRoom = self._initOptions.defaultRoom;
  self._trigger('readyStateChange', self.READY_STATE_CHANGE.INIT, null, self._selectedRoom);

  if (!(options && options.appKey && typeof options.appKey === 'string')) {
    self._readyState = self.READY_STATE_CHANGE.ERROR;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      content: new Error('Please provide an app key'),
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_PATH,
      status: -2
    }, self._selectedRoom);
    return;
  }

  // Format: https://api.temasys.io/api/<appKey>/<room>[/<creds.start>][/<creds.duration>][?cred=<creds.hash>]&rand=<rand>
  self._path = self._initOptions.roomServer + '/api/' + self._initOptions.appKey + '/' + self._selectedRoom +
    (self._initOptions.credentials ? '/' + self._initOptions.credentials.startDateTime + '/' +
    self._initOptions.credentials.duration + '?cred=' + self._initOptions.credentials.credentials : '') +
    (self._initOptions.credentials ? '&' : '?') + 'rand=' + Date.now();

  self._loadInfo();
};

/**
 * Function that checks if value is contained in a SDK constant.
 * @method _containsInList
 * @for Skylink
 * @since 0.6.27
 * @private
 */
Skylink.prototype._containsInList = function (listName, value, defaultProperty) {
  var self = this;

  for (var property in self[listName]) {
    if (self[listName].hasOwnProperty(property) && self[listName][property] === value) {
      return value;
    }
  }

  return self[listName][defaultProperty];
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
  var retries = 0;

  // XDomainRequest is supported in IE8 - 9 for CORS connection.
  self._socketUseXDR = typeof window.XDomainRequest === 'function' || typeof window.XDomainRequest === 'object';
  url = (self._initOptions.forceSSL) ? 'https:' + url : url;

  (function requestFn () {
    var xhr = new XMLHttpRequest();
    var completed = false;

    if (self._socketUseXDR) {
      log.debug([null, 'XMLHttpRequest', method, 'Using XDomainRequest for CORS authentication.']);
      xhr = new XDomainRequest();
      xhr.setContentType = function (contentType) {
        xhr.contentType = contentType;
      };
    }

    xhr.onload = function () {
      if (completed) {
        return;
      }
      completed = true;
      var response = JSON.parse(xhr.responseText || xhr.response || '{}');
      var status = xhr.status || (response.success ? 200 : 400);

      if (response.success) {
      	log.debug([null, 'XMLHttpRequest', method, 'Received sessions parameters ->'], response);
      	callback(response);
      	return;
      }

      log.error([null, 'XMLHttpRequest', method, 'Failed retrieving sessions parameters ->'], response);

      // 400 - Bad request
      // 403 - Room is locked
      // 401 - API Not authorized
      // 402 - run out of credits
      self._readyState = self.READY_STATE_CHANGE.ERROR;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: status,
        content: new Error(response.info || 'XMLHttpRequest status not OK\nStatus was: ' + status),
        errorCode: response.error || status
      }, self._selectedRoom);
    };
  
    xhr.onerror = function (error) {
      if (completed) {
        return;
      }
      completed = true;
      log.error([null, 'XMLHttpRequest', method, 'Failed retrieving information with status ->'], xhr.status);

      self._readyState = self.READY_STATE_CHANGE.ERROR;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: xhr.status || -1,
        content: new Error('Network error occurred. (Status: ' + xhr.status + ')'),
        errorCode: self.READY_STATE_CHANGE_ERROR.XML_HTTP_REQUEST_ERROR
      }, self._selectedRoom);
    };

    xhr.onprogress = function () {
      log.debug([null, 'XMLHttpRequest', method, 'Retrieving information and config from webserver ->'], {
        url: url,
        params: params
      });
    };

    try {
      xhr.open(method, url, true);
      if (params) {
        xhr.setContentType('application/json;charset=UTF-8');
        xhr.send(JSON.stringify(params));
      } else {
        xhr.send();
      }
    } catch (error) {
      completed = true;
      self._readyState = self.READY_STATE_CHANGE.ERROR;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: xhr.status || -1,
        content: new Error('Failed starting XHR process.'),
        errorCode: self.READY_STATE_CHANGE_ERROR.XML_HTTP_REQUEST_ERROR
      }, self._selectedRoom);
      return;
    }

    setTimeout(function () {
      if (completed) {
        return;
      }
      completed = true;
      xhr.onload = null;
      xhr.onerror = null;
      xhr.onprogress = null;

      if (retries < 2) {
        retries++;
        requestFn();

      } else {
        self._readyState = self.READY_STATE_CHANGE.ERROR;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: xhr.status || -1,
          content: new Error('Response timed out from API server'),
          errorCode: self.READY_STATE_CHANGE_ERROR.XML_HTTP_NO_REPONSE_ERROR
        }, self._selectedRoom);
      }
    }, self._initOptions.apiTimeout);
  })();
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
    'http:': Array.isArray(info.httpPortList) && info.httpPortList.length > 0 ? info.httpPortList : [80, 3000],
    'https:': Array.isArray(info.httpsPortList) && info.httpsPortList.length > 0 ? info.httpsPortList : [443, 3443]
  };

  // use default bandwidth and media resolution provided by server
  //this._streamSettings.bandwidth = info.bandwidth;
  //this._streamSettings.video = info.video;
  this._readyState = this.READY_STATE_CHANGE.COMPLETED;
  this._trigger('readyStateChange', this.READY_STATE_CHANGE.COMPLETED, null, this._selectedRoom);
  log.info('Parsed parameters from webserver. Ready for web-realtime communication');
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

  if (typeof (globals.AdapterJS || window.AdapterJS || {}).webRTCReady !== 'function') {
    var noAdapterErrorMsg = 'AdapterJS dependency is not loaded or incorrect AdapterJS dependency is used';
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: -2,
      content: new Error(noAdapterErrorMsg),
      errorCode: self.READY_STATE_CHANGE_ERROR.ADAPTER_NO_LOADED
    }, self._selectedRoom);
    return;

  } else if (!(globals.io || window.io)) {
    log.error('Socket.io not loaded. Please load socket.io');
    self._readyState = self.READY_STATE_CHANGE.ERROR;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: -2,
      content: new Error('Socket.io not found'),
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO
    }, self._selectedRoom);
    return;

  } else if (!window.XMLHttpRequest) {
    log.error('XMLHttpRequest not supported. Please upgrade your browser');
    self._readyState = self.READY_STATE_CHANGE.ERROR;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: -2,
      content: new Error('XMLHttpRequest not available'),
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT
    }, self._selectedRoom);
    return;

  } else if (!self._path) {
    log.error('Skylink is not initialised. Please call init() first');
    self._readyState = self.READY_STATE_CHANGE.ERROR;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: -2,
      content: new Error('No API Path is found'),
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_PATH
    }, self._selectedRoom);
    return;
  }

  AdapterJS.webRTCReady(function () {
    self._enableIceRestart = AdapterJS.webrtcDetectedBrowser === 'firefox' ?
      AdapterJS.webrtcDetectedVersion >= 48 : true;
    self._binaryChunkType = AdapterJS.webrtcDetectedBrowser === 'firefox' ?
      self.DATA_TRANSFER_DATA_TYPE.BLOB : self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;

      // Prevent empty object returned when constructing the RTCPeerConnection object
    if (!(function () {
      try {
        var p = new window.RTCPeerConnection(null);
        // IE returns as typeof object
        return ['object', 'function'].indexOf(typeof p.createOffer) > -1 && p.createOffer !== null;
      } catch (e) {
        return false;
      }
    })()) {
      if (window.RTCPeerConnection && AdapterJS.webrtcDetectedType === 'plugin') {
        log.error('Plugin is not available. Please check plugin status.');
      } else {
        log.error('WebRTC not supported. Please upgrade your browser');
      }
      self._readyState = self.READY_STATE_CHANGE.ERROR;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: -2,
        content: new Error(AdapterJS.webrtcDetectedType === 'plugin' && window.RTCPeerConnection ? 'Plugin is not available' : 'WebRTC not available'),
        errorCode: self.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT
      }, self._selectedRoom);
      return;
    }

    self._getCodecsSupport(function (error) {
      if (error) {
        log.error(error);
        self._readyState = self.READY_STATE_CHANGE.ERROR;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: -2,
          content: new Error(error.message || error.toString()),
          errorCode: self.READY_STATE_CHANGE_ERROR.PARSE_CODECS
        }, self._selectedRoom);
        return;
      }

      if (Object.keys(self._currentCodecSupport.audio).length === 0 && Object.keys(self._currentCodecSupport.video).length === 0) {
        log.error('No audio/video codecs available to start connection.');
        self._readyState = self.READY_STATE_CHANGE.ERROR;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: -2,
          content: new Error('No audio/video codecs available to start connection'),
          errorCode: self.READY_STATE_CHANGE_ERROR.PARSE_CODECS
        }, self._selectedRoom);
        return;
      }

      self._readyState = self.READY_STATE_CHANGE.LOADING;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.LOADING, null, self._selectedRoom);
      self._requestServerInfo('GET', self._path, function(response) {
        self._parseInfo(response);
      });
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
    callback(new Error('Invalid room provided'), null);
    return;
  }
  var defaultRoom = self._initOptions.defaultRoom;
  var options = clone(self._initOptions);
  options.iceServer = options.iceServer ? options.iceServer.urls : null;

  if(options.defaultRoom!==room){
    options.defaultRoom = room;
  }

  self.init(options, function (error, success) {
    self._initOptions.defaultRoom = defaultRoom;
    if (error) {
      callback(error, null);
    } else {
      callback(null, success);
    }
  });
};


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
 * Stores the flag if logs should print timestamp.
 * @attribute _printTimestamp
 * @type Boolean
 * @default false
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.6.26
 */
var _printTimestamp = false;

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
var SkylinkLogs = {
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
  var outputLog = '';
  var datetime = (new Date());

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
    var logItem = [datetime, _LOG_LEVELS[logLevel], outputLog];

    if (typeof debugObject !== 'undefined') {
      logItem.push(debugObject);
    }
    _storedLogs.push(logItem);
  }

  outputLog = _LOG_KEY + (_printTimestamp ? ' :: ' + datetime.toISOString() : '') + outputLog;

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
 * @param {Boolean} [options.printTimestamp=false] The flag if SDK should print the timestamp of the <code>console</code> logs.
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
  // setDebugMode({})
  if (isDebugMode && typeof isDebugMode === 'object') {
    _enableDebugMode = true;
    _enableDebugTrace = isDebugMode.trace === true;
    _enableDebugStack = isDebugMode.storeLogs === true;
    _printTimestamp = isDebugMode.printTimestamp === true;
  // setDebugMode(true)
  } else if (isDebugMode === true) {
    _enableDebugMode = true;
    _enableDebugTrace = true;
    _enableDebugStack = true;
    _printTimestamp = false;
  // setDebugMode()
  } else {
    _enableDebugMode = false;
    _enableDebugTrace = false;
    _enableDebugStack = false;
    _printTimestamp = false;
  }
};
var _eventsDocs = {
  /**
   * Event triggered when socket connection to Signaling server has opened.
   * @event channelOpen
   * @param {JSON} session The socket connection session information.
   * @param {String} session.serverUrl The socket connection Signaling url used.
   * @param {String} session.transportType The socket connection transport type used.
   * @param {JSON} session.socketOptions The socket connection options.
   * @param {Number} session.attempts The socket connection current reconnection attempts.
   * @param {Number} session.finalAttempts The socket connection current last attempts
   *   for the last available transports and port.
   * @for Skylink
   * @since 0.1.0
   */
  channelOpen: [],

  /**
   * Event triggered when socket connection to Signaling server has closed.
   * @event channelClose
   * @param {JSON} session The socket connection session information.
   *   <small>Object signature matches the <code>session</code> parameter payload received in the
   *   <a href="#event_channelOpen"><code>channelOpen</code> event</a>.</small>
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
   * @param {JSON} session The socket connection session information.
   *   <small>Object signature matches the <code>session</code> parameter payload received in the
   *   <a href="#event_channelOpen"><code>channelOpen</code> event</a>.</small>
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
   * @param {JSON} session The socket connection session information.
   *   <small>Object signature matches the <code>session</code> parameter payload received in the
   *   <a href="#event_channelOpen"><code>channelOpen</code> event</a>.</small>
   * @for Skylink
   * @since 0.1.0
   */
  channelError: [],

  /**
   * Event triggered when attempting to establish socket connection to Signaling server when failed.
   * @event channelRetry
   * @param {String} fallbackType The current fallback state.
   *   [Rel: Skylink.SOCKET_FALLBACK]
   * @param {Number} currentAttempt The current socket reconnection attempt.
   * @param {JSON} session The socket connection session information.
   *   <small>Object signature matches the <code>session</code> parameter payload received in the
   *   <a href="#event_channelOpen"><code>channelOpen</code> event</a>.</small>
   * @for Skylink
   * @since 0.5.6
   */
  channelRetry: [],

  /**
   * Event triggered when attempt to establish socket connection to Signaling server has failed.
   * @event socketError
   * @param {Number} errorCode The socket connection error code.
   *   [Rel: Skylink.SOCKET_ERROR]
   * @param {Error|String|Number} error The error object.
   * @param {String} type The fallback state of the socket connection attempt.
   *   [Rel: Skylink.SOCKET_FALLBACK]
   * @param {JSON} session The socket connection session information.
   *   <small>Object signature matches the <code>session</code> parameter payload received in the
   *   <a href="#event_channelOpen"><code>channelOpen</code> event</a>.</small>
   * @for Skylink
   * @since 0.5.5
   */
  socketError: [],

  /**
   * Event triggered when <a href="#method_init"><code>init()</code> method</a> ready state changes.
   * @event readyStateChange
   * @param {Number} readyState The current <code>init()</code> ready state.
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
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
   * </blockquote>
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
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
   * </blockquote>
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
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
   * </blockquote>
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
   * @param {Boolean|JSON} peerInfo.settings.data The flag if Peer has any Datachannel connections enabled.
   *   <small>If <code>isSelf</code> value is <code>true</code>, this determines if User allows
   *   Datachannel connections, else if value is <code>false</code>, this determines if Peer has any active
   *   Datachannel connections (where <a href="#event_dataChannelState"><code>dataChannelState</code> event</a>
   *   triggers <code>state</code> as <code>OPEN</code> and <code>channelType</code> as
   *   <code>MESSAGING</code> for Peer) with Peer.</small>
   * @param {Boolean|JSON} peerInfo.settings.audio The Peer Stream audio settings.
   *   <small>When defined as <code>false</code>, it means there is no audio being sent from Peer.</small>
   *   <small>When defined as <code>true</code>, the <code>peerInfo.settings.audio.stereo</code> value is
   *   considered as <code>false</code> and the <code>peerInfo.settings.audio.exactConstraints</code>
   *   value is considered as <code>false</code>.</small>
   * @param {Boolean} peerInfo.settings.audio.stereo The flag if stereo band is configured
   *   when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for receiving audio data.
   * @param {Boolean} [peerInfo.settings.audio.usedtx] <blockquote class="info">
   *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
   *   The flag if DTX (Discontinuous Transmission) is configured when encoding audio codec
   *   is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
   *   <small>This might help to reduce bandwidth it reduces the bitrate during silence or background noise.</small>
   *   <small>When not defined, the default browser configuration is used.</small>
   * @param {Boolean} [peerInfo.settings.audio.useinbandfec] <blockquote class="info">
   *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
   *   The flag if capability to take advantage of in-band FEC (Forward Error Correction) is
   *   configured when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
   *   <small>This might help to reduce the harm of packet loss by encoding information about the previous packet.</small>
   *   <small>When not defined, the default browser configuration is used.</small>
   * @param {Number} [peerInfo.settings.audio.maxplaybackrate] <blockquote class="info">
   *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
   *   The maximum output sampling rate rendered in Hertz (Hz) when encoding audio codec is
   *   <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
   *   <small>This value must be between <code>8000</code> to <code>48000</code>.</small>
   *   <small>When not defined, the default browser configuration is used.</small>
   * @param {Boolean} peerInfo.settings.audio.echoCancellation The flag if echo cancellation is enabled for audio tracks.
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
   * @param {JSON} [peerInfo.settings.video.resolution] The Peer Stream video resolution.
   *   [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number|JSON} peerInfo.settings.video.resolution.width The Peer Stream video resolution width or
   *   video resolution width settings.
   *   <small>When defined as a JSON object, it is the user set resolution width settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).</small>
   * @param {Number|JSON} peerInfo.settings.video.resolution.height The Peer Stream video resolution height or
   *   video resolution height settings.
   *   <small>When defined as a JSON object, it is the user set resolution height settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).</small>
   * @param {Number|JSON} [peerInfo.settings.video.frameRate] The Peer Stream video
   *   <a href="https://en.wikipedia.org/wiki/Frame_rate">frameRate</a> per second (fps) or video frameRate settings.
   *   <small>When defined as a JSON object, it is the user set frameRate settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).</small>
   * @param {Boolean} peerInfo.settings.video.screenshare The flag if Peer Stream is a screensharing Stream.
   * @param {Array} [peerInfo.settings.video.optional] The Peer Stream <code>navigator.getUserMedia()</code> API
   *   <code>video: { optional [..] }</code> property.
   * @param {String} [peerInfo.settings.video.deviceId] The Peer Stream video track source ID of the device used.
   * @param {Boolean} peerInfo.settings.video.exactConstraints The flag if Peer Stream video track is sending exact
   *   requested values of <code>peerInfo.settings.video.resolution</code>,
   *   <code>peerInfo.settings.video.frameRate</code> and <code>peerInfo.settings.video.deviceId</code>
   *   when provided.
   * @param {String|JSON} [peerInfo.settings.video.facingMode] The Peer Stream video camera facing mode.
   *   <small>When defined as a JSON object, it is the user set facingMode settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).</small>
   * @param {JSON} peerInfo.settings.bandwidth The maximum streaming bandwidth sent from Peer.
   * @param {Number} [peerInfo.settings.bandwidth.audio] The maximum audio streaming bandwidth sent from Peer.
   * @param {Number} [peerInfo.settings.bandwidth.video] The maximum video streaming bandwidth sent from Peer.
   * @param {Number} [peerInfo.settings.bandwidth.data] The maximum data streaming bandwidth sent from Peer.
   * @param {JSON} peerInfo.settings.googleXBandwidth <blockquote class="info">
   *   Note that this feature might not work depending on the browser support and implementation,
   *   and its properties and values are only defined for User's end and cannot be viewed
   *   from Peer's end (when <code>isSelf</code> value is <code>false</code>).</blockquote>
   *   The experimental google video streaming bandwidth sent to Peers.
   * @param {Number} [peerInfo.settings.googleXBandwidth.min] The minimum experimental google video streaming bandwidth sent to Peers.
   * @param {Number} [peerInfo.settings.googleXBandwidth.max] The maximum experimental google video streaming bandwidth sent to Peers.
   * @param {JSON} peerInfo.mediaStatus The Peer Stream muted settings.
   * @param {Boolean} peerInfo.mediaStatus.audioMuted The flag if Peer Stream audio tracks is muted or not.
   *   <small>If Peer <code>peerInfo.settings.audio</code> is false, this will be defined as <code>true</code>.</small>
   * @param {Boolean} peerInfo.mediaStatus.videoMuted The flag if Peer Stream video tracks is muted or not.
   *   <small>If Peer <code>peerInfo.settings.video</code> is false, this will be defined as <code>true</code>.</small>
   * @param {JSON} peerInfo.agent The Peer agent information.
   * @param {String} peerInfo.agent.name The Peer agent name.
   *   <small>Data may be accessing browser or non-Web SDK name.</small>
   * @param {Number} peerInfo.agent.version The Peer agent version.
   *   <small>Data may be accessing browser or non-Web SDK version. If the original value is <code>"0.9.6.1"</code>,
   *   it will be interpreted as <code>0.90601</code> where <code>0</code> helps to seperate the minor dots.</small>
   * @param {String} [peerInfo.agent.os] The Peer platform name.
   *  <small>Data may be accessing OS platform version from Web SDK.</small>
   * @param {String} [peerInfo.agent.pluginVersion] The Peer Temasys Plugin version.
   *  <small>Defined only when Peer is using the Temasys Plugin (IE / Safari).</small>
   * @param {String} peerInfo.agent.DTProtocolVersion The Peer data transfer (DT) protocol version.
   * @param {String} peerInfo.agent.SMProtocolVersion The Peer signaling message (SM) protocol version.
   * @param {String} peerInfo.room The Room Peer is from.
   * @param {JSON} peerInfo.config The Peer connection configuration.
   * @param {Boolean} peerInfo.config.enableIceTrickle The flag if Peer connection has
   *   trickle ICE enabled or faster connectivity.
   * @param {Boolean} peerInfo.config.enableDataChannel The flag if Datachannel connections would be enabled for Peer.
   * @param {Boolean} peerInfo.config.enableIceRestart The flag if Peer connection has ICE connection restart support.
   *   <small>Note that ICE connection restart support is not honoured for MCU enabled Peer connection.</small>
   * @param {Number} peerInfo.config.priorityWeight The flag if Peer or User should be the offerer.
   *   <small>If User's <code>priorityWeight</code> is higher than Peer's, User is the offerer, else Peer is.
   *   However for the case where the MCU is connected, User will always be the offerer.</small>
   * @param {Boolean} peerInfo.config.publishOnly The flag if Peer is publishing only stream but not receiving streams.
   * @param {Boolean} peerInfo.config.receiveOnly The flag if Peer is receiving only streams but not publishing stream.
   * @param {String} [peerInfo.parentId] The parent Peer ID that it is matched to for multi-streaming connections.
   * @param {Boolean} [peerInfo.connected] The flag if Peer ICE connection has been established successfully.
   *  <small>Defined only when <code>isSelf</code> payload value is <code>false</code>.</small>
   * @param {Boolean} [peerInfo.init] The flag if Peer connection has been created successfully.
   *  <small>Defined only when <code>isSelf</code> payload value is <code>false</code>.</small>
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
   * @param {Boolean} isIceRestart The flag if Peer connection ICE connection will restart.
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
   * @param {Boolean} isScreensharing The flag if Peer Stream is a screensharing Stream.
   * @param {String} streamId The Stream ID.
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
   * @param {String|Array} [message.targetPeerId] The value of the <code>targetPeerId</code>
   *   defined in <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a> or
   *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>.
   *   <small>Defined as User's Peer ID when <code>isSelf</code> payload value is <code>false</code>.</small>
   *   <small>Defined as <code>null</code> when provided <code>targetPeerId</code> in
   *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a> or
   *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a> is not defined.</small>
   * @param {Array} [message.listOfPeers] The list of Peers that the message has been sent to.
   *  <small>Defined only when <code>isSelf</code> payload value is <code>true</code>.</small>
   * @param {Boolean} message.isPrivate The flag if message is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a> or
   *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>.
   * @param {Boolean} message.isDataChannel The flag if message is sent from
   *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.
   * @param {String} peerId The Peer ID.
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
   *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
   *   except without the <code>data</code> property.</small>
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
   *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
   *   except without the <code>data</code> property.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.6.1
   */
  incomingDataRequest: [],

  /**
   * Event triggered when data streaming session has been started from Peer to User.
   * @event incomingDataStreamStarted
   * @param {String} streamId The data streaming session ID.
   * @param {String} peerId The Peer ID.
   * @param {JSON} streamInfo The data streaming session information.
   *   <small>Object signature matches the <code>streamInfo</code> parameter payload received in the
   *   <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
   *   except without the <code>chunk</code> property.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @beta
   * @for Skylink
   * @since 0.6.18
   */
  incomingDataStreamStarted: [],

  /**
   * Event triggered when data streaming session has been stopped from Peer to User.
   * @event incomingDataStreamStopped
   * @param {String} streamId The data streaming session ID.
   * @param {String} peerId The Peer ID.
   * @param {JSON} streamInfo The data streaming session information.
   *   <small>Object signature matches the <code>streamInfo</code> parameter payload received in the
   *   <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
   *   except without the <code>chunk</code> property.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @beta
   * @for Skylink
   * @since 0.6.18
   */
  incomingDataStreamStopped: [],

  /**
   * Event triggered when data streaming session has been stopped from Peer to User.
   * @event incomingDataStream
   * @param {Blob|String} chunk The data chunk received.
   * @param {String} streamId The data streaming session ID.
   * @param {String} peerId The Peer ID.
   * @param {JSON} streamInfo The data streaming session information.
   *   <small>Object signature matches the <code>streamInfo</code> parameter payload received in the
   *   <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
   *   except without the <code>chunk</code> property.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @beta
   * @for Skylink
   * @since 0.6.18
   */
  incomingDataStream: [],

  /**
   * Event triggered when Room locked status has changed.
   * @event roomLock
   * @param {Boolean} isLocked The flag if Room is locked.
   * @param {String} peerId The Peer ID.
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
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code> or <code>SEND_MESSAGE_ERROR</code>.</small>
   * @param {String} channelName The Datachannel ID.
   * @param {String} channelType The Datachannel type.
   *   [Rel: Skylink.DATA_CHANNEL_TYPE]
   * @param {String} messageType The Datachannel sending Datachannel message error type.
   *   <small>Defined only when <cod>state</code> payload is <code>SEND_MESSAGE_ERROR</code>.</small>
   *   [Rel: Skylink.DATA_CHANNEL_MESSAGE_ERROR]
   * @param {JSON} bufferAmount The Datachannel buffered amount information.
   * @param {Number} bufferAmount.bufferedAmountLow The size of currently queued data to send on the Datachannel connection.
   * @param {Number} bufferAmount.bufferedAmountLowThreshold The current buffered amount low threshold configured.
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
   *   <small>Note that this is defined as <code>null</code> when <code>state</code> payload is <code>START_ERROR</code>.</small>
   * @param {String} peerId The Peer ID.
   *   <small>Note that this could be defined as <code>null</code> when <code>state</code> payload is
   *   <code>START_ERROR</code> and there is no Peers to start data transfer with.</small>
   * @param {JSON} transferInfo The data transfer information.
   * @param {Blob|String} [transferInfo.data] The data object.
   *   <small>Defined only when <code>state</code> payload is <code>UPLOAD_STARTED</code> or
   *   <code>DOWNLOAD_COMPLETED</code>.</small>
   * @param {String} transferInfo.name The data transfer name.
   * @param {Number} transferInfo.size The data transfer data object size.
   * @param {String} transferInfo.dataType The data transfer session type.
   *   [Rel: Skylink.DATA_TRANSFER_SESSION_TYPE]
   * @param {String} transferInfo.chunkType The data transfer type of data chunk being used to send to Peer for transfers.
   *   <small>For <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> data transfers, the
   *   initial data chunks value may change depending on the currently received data chunk type or the
   *   agent supported sending type of data chunks.</small>
   *   <small>For <a href="#method_sendURLData"><code>sendURLData()</code> method</a> data transfers, it is
   *   <code>STRING</code> always.</small>
   *   [Rel: Skylink.DATA_TRANSFER_DATA_TYPE]
   * @param {String} [transferInfo.mimeType] The data transfer data object MIME type.
   *   <small>Defined only when <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>
   *   data object sent MIME type information is defined.</small>
   * @param {Number} transferInfo.chunkSize The data transfer data chunk size.
   * @param {Number} transferInfo.percentage The data transfer percentage of completion progress.
   * @param {Number} transferInfo.timeout The flag if data transfer is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> or
   *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>.
   * @param {Boolean} transferInfo.isPrivate The flag if message is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> or
   *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a>.
   * @param {String} transferInfo.direction The data transfer direction.
   *   [Rel: Skylink.DATA_TRANSFER_TYPE]
   * @param {JSON} [error] The error result.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code>, <code>CANCEL</code>,
   *   <code>REJECTED</code>, <code>START_ERROR</code> or <code>USER_REJECTED</code>.</small>
   * @param {Error|String} error.message The error object.
   * @param {String} error.transferType The data transfer direction from where the error occurred.
   *   [Rel: Skylink.DATA_TRANSFER_TYPE]
   * @for Skylink
   * @since 0.4.1
   */
  dataTransferState: [],

  /**
   * Event triggered when a data streaming state has changed.
   * @event dataStreamState
   * @param {String} state The current data streaming state.
   *   [Rel: Skylink.DATA_STREAM_STATE]
   * @param {String} streamId The data streaming session ID.
   *   <small>Note that this is defined as <code>null</code> when <code>state</code> payload is <code>START_ERROR</code>.</small>
   * @param {String} peerId The Peer ID.
   *   <small>Note that this could be defined as <code>null</code> when <code>state</code> payload is
   *   <code>START_ERROR</code> and there is no Peers to start data streaming with.</small>
   * @param {JSON} streamInfo The data streaming information.
   * @param {Blob|String} [streamInfo.chunk] The data chunk received.
   *   <small>Defined only when <code>state</code> payload is <code>RECEIVED</code> or <code>SENT</code>.</small>
   * @param {Number} streamInfo.chunkSize The data streaming data chunk size received.
   * @param {String} streamInfo.chunkType The data streaming data chunk type received.
   *   <small>The initial data chunks value may change depending on the currently received data chunk type or the
   *   agent supported sending type of data chunks.</small>
   *   [Rel: Skylink.DATA_TRANSFER_DATA_TYPE]
   * @param {String} streamInfo.isStringStream The flag if data streaming data chunks are strings.
   * @param {Boolean} streamInfo.isPrivate The flag if data streaming is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_startStreamingData"><code>startStreamingData()</code> method</a>.
   * @param {String} streamInfo.senderPeerId The sender Peer ID.
   * @param {Error} [error] The error object.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code> or <code>START_ERROR</code>,.</small>
   * @beta
   * @for Skylink
   * @since 0.6.18
   */
  dataStreamState: [],

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
   * Event triggered when a Peer Stream streaming has stopped.
   * <small>Note that it may not be the currently sent Stream to User, and it also triggers
   * when User leaves the Room for any currently sent Stream to User from Peer.</small>
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
   * Event triggered when recording session state has changed.
   * @event recordingState
   * @param {Number} state The current recording session state.
   *   [Rel: Skylink.RECORDING_STATE]
   * @param {String} recordingId The recording session ID.
   * @param {JSON} link The recording session mixin videos link in
   *   <a href="https://en.wikipedia.org/wiki/MPEG-4_Part_14">MP4</a> format.
   *   <small>Defined only when <code>state</code> payload is <code>LINK</code>.</small>
   * @param {String} link.#peerId The recording session recorded Peer only video associated
   *   with the Peer ID defined in <code>#peerId</code> property.
   *   <small>If <code>#peerId</code> value is <code>"mixin"</code>, it means that is the mixin
   *   video of all Peers in the Room.</small>
   * @param {Error|String} error The error object.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code>.</small>
   * @beta
   * @for Skylink
   * @since 0.6.16
   */
  recordingState: [],

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
   * @param {Number} stats.audio.sending.bytes The Peer connection current sending audio streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.audio.sending.totalBytes The Peer connection total sending audio streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.audio.sending.packets The Peer connection current sending audio streaming packets.
   * @param {Number} stats.audio.sending.totalPackets The Peer connection total sending audio streaming packets.
   * @param {Number} stats.audio.sending.packetsLost <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection current sending audio streaming packets lost.
   * @param {Number} stats.audio.sending.totalPacketsLost <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection total sending audio streaming packets lost.
   * @param {Number} stats.audio.sending.ssrc The Peer connection sending audio streaming RTP packets SSRC.
   * @param {Number} stats.audio.sending.rtt The Peer connection sending audio streaming RTT (Round-trip delay time).
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} stats.audio.sending.jitter <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection sending audio streaming RTP packets jitter in seconds.
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.jitterBufferMs] <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection sending audio streaming
   *   RTP packets jitter buffer in miliseconds.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} [stats.audio.sending.codec] The Peer connection sending audio streaming selected codec information.
   *   <small>Defined as <code>null</code> if local session description is not available before parsing.</small>
   * @param {String} stats.audio.sending.codec.name The Peer connection sending audio streaming selected codec name.
   * @param {Number} stats.audio.sending.codec.payloadType The Peer connection sending audio streaming selected codec payload type.
   * @param {String} [stats.audio.sending.codec.implementation] The Peer connection sending audio streaming selected codec implementation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.codec.channels] The Peer connection sending audio streaming selected codec channels (2 for stereo).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing,
   *   and this is usually present in <code>stats.audio</code> property.</small>
   * @param {Number} [stats.audio.sending.codec.clockRate] The Peer connection sending audio streaming selected codec media sampling rate.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.audio.sending.codec.params] The Peer connection sending audio streaming selected codec parameters.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.inputLevel] The Peer connection sending audio streaming input level.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.echoReturnLoss] The Peer connection sending audio streaming echo return loss in db (decibels).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.echoReturnLossEnhancement] The Peer connection sending audio streaming
   *   echo return loss enhancement db (decibels).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.audio.receiving The Peer connection receiving audio streaming stats.
   * @param {Number} stats.audio.receiving.bytes The Peer connection current sending audio streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.audio.receiving.totalBytes The Peer connection total sending audio streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.audio.receiving.packets The Peer connection current receiving audio streaming packets.
   * @param {Number} stats.audio.receiving.totalPackets The Peer connection total receiving audio streaming packets.
   * @param {Number} stats.audio.receiving.packetsLost The Peer connection current receiving audio streaming packets lost.
   * @param {Number} stats.audio.receiving.fractionLost The Peer connection current receiving audio streaming fraction packets lost.
   * @param {Number} stats.audio.receiving.packetsDiscarded The Peer connection current receiving audio streaming packets discarded.
   * @param {Number} stats.audio.receiving.totalPacketsLost The Peer connection total receiving audio streaming packets lost.
   * @param {Number} stats.audio.receiving.totalPacketsDiscarded The Peer connection total receiving audio streaming packets discarded.
   * @param {Number} stats.audio.receiving.ssrc The Peer connection receiving audio streaming RTP packets SSRC.
   * @param {Number} stats.audio.receiving.jitter The Peer connection receiving audio streaming RTP packets jitter in seconds.
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.receiving.jitterBufferMs] The Peer connection receiving audio streaming
   *   RTP packets jitter buffer in miliseconds.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} [stats.audio.receiving.codec] The Peer connection receiving audio streaming selected codec information.
   *   <small>Defined as <code>null</code> if remote session description is not available before parsing.</small>
   *   <small>Note that if the value is polyfilled, the value may not be accurate since the remote Peer can override the selected codec.
   *   The value is derived from the remote session description.</small>
   * @param {String} stats.audio.receiving.codec.name The Peer connection receiving audio streaming selected codec name.
   * @param {Number} stats.audio.receiving.codec.payloadType The Peer connection receiving audio streaming selected codec payload type.
   * @param {String} [stats.audio.receiving.codec.implementation] The Peer connection receiving audio streaming selected codec implementation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.receiving.codec.channels] The Peer connection receiving audio streaming selected codec channels (2 for stereo).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing,
   *   and this is usually present in <code>stats.audio</code> property.</small>
   * @param {Number} [stats.audio.receiving.codec.clockRate] The Peer connection receiving audio streaming selected codec media sampling rate.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.audio.receiving.codec.params] The Peer connection receiving audio streaming selected codec parameters.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.receiving.outputLevel] The Peer connection receiving audio streaming output level.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.video The Peer connection video streaming stats.
   * @param {JSON} stats.video.sending The Peer connection sending video streaming stats.
   * @param {Number} stats.video.sending.bytes The Peer connection current sending video streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.video.sending.totalBytes The Peer connection total sending video streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.video.sending.packets The Peer connection current sending video streaming packets.
   * @param {Number} stats.video.sending.totalPackets The Peer connection total sending video streaming packets.
   * @param {Number} stats.video.sending.packetsLost <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection current sending video streaming packets lost.
   * @param {Number} stats.video.sending.totalPacketsLost <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection total sending video streaming packets lost.
   * @param {Number} stats.video.sending.ssrc The Peer connection sending video streaming RTP packets SSRC.
   * @param {Number} stats.video.sending.rtt The Peer connection sending video streaming RTT (Round-trip delay time).
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} stats.video.sending.jitter <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection sending video streaming RTP packets jitter in seconds.
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.jitterBufferMs] <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection sending video streaming RTP packets jitter buffer in miliseconds.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.qpSum] The Peer connection sending video streaming sum of the QP values of frames passed.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} [stats.video.sending.codec] The Peer connection sending video streaming selected codec information.
   *   <small>Defined as <code>null</code> if local session description is not available before parsing.</small>
   * @param {String} stats.video.sending.codec.name The Peer connection sending video streaming selected codec name.
   * @param {Number} stats.video.sending.codec.payloadType The Peer connection sending video streaming selected codec payload type.
   * @param {String} [stats.video.sending.codec.implementation] The Peer connection sending video streaming selected codec implementation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.codec.channels] The Peer connection sending video streaming selected codec channels (2 for stereo).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing,
   *   and this is usually present in <code>stats.audio</code> property.</small>
   * @param {Number} [stats.video.sending.codec.clockRate] The Peer connection sending video streaming selected codec media sampling rate.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.video.sending.codec.params] The Peer connection sending video streaming selected codec parameters.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frames] The Peer connection sending video streaming frames.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frameRateInput] The Peer connection sending video streaming fps input.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frameRateInput] The Peer connection sending video streaming fps input.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.framesDropped] The Peer connection sending video streaming frames dropped.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frameRateMean] The Peer connection sending video streaming fps mean.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frameRateStdDev] The Peer connection sending video streaming fps standard deviation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.framesPerSecond] The Peer connection sending video streaming fps.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.framesDecoded] The Peer connection sending video streaming frames decoded.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.framesCorrupted] The Peer connection sending video streaming frames corrupted.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalFrames] The Peer connection total sending video streaming frames.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.nacks] The Peer connection current sending video streaming nacks.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalNacks] The Peer connection total sending video streaming nacks.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.plis] The Peer connection current sending video streaming plis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalPlis] The Peer connection total sending video streaming plis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.firs] The Peer connection current sending video streaming firs.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalFirs] The Peer connection total sending video streaming firs.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.slis] The Peer connection current sending video streaming slis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalSlis] The Peer connection total sending video streaming slis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.video.receiving The Peer connection receiving video streaming stats.
   * @param {Number} stats.video.receiving.bytes The Peer connection current receiving video streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.video.receiving.totalBytes The Peer connection total receiving video streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.video.receiving.packets The Peer connection current receiving video streaming packets.
   * @param {Number} stats.video.receiving.totalPackets The Peer connection total receiving video streaming packets.
   * @param {Number} stats.video.receiving.packetsLost The Peer connection current receiving video streaming packets lost.
   * @param {Number} stats.video.receiving.fractionLost The Peer connection current receiving video streaming fraction packets lost.
   * @param {Number} stats.video.receiving.packetsDiscarded The Peer connection current receiving video streaming packets discarded.
   * @param {Number} stats.video.receiving.totalPacketsLost The Peer connection total receiving video streaming packets lost.
   * @param {Number} stats.video.receiving.totalPacketsDiscarded The Peer connection total receiving video streaming packets discarded.
   * @param {Number} stats.video.receiving.ssrc The Peer connection receiving video streaming RTP packets SSRC.
   * @param {Number} [stats.video.receiving.e2eDelay] The Peer connection receiving video streaming e2e delay.
   *   <small>Defined as <code>null</code> if it's not present in original raw stats before parsing, and that
   *   it finds any existing audio, video or object (plugin) DOM elements that has set with the
   *   Peer remote stream object to parse current time. Note that <code>document.getElementsByTagName</code> function
   *   and DOM <code>.currentTime</code> has to be supported inorder for data to be parsed correctly.</small>
   * @param {Number} stats.video.receiving.jitter The Peer connection receiving video streaming RTP packets jitter in seconds.
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.jitterBufferMs] The Peer connection receiving video streaming
   *   RTP packets jitter buffer in miliseconds.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} [stats.video.receiving.codec] The Peer connection receiving video streaming selected codec information.
   *   <small>Defined as <code>null</code> if remote session description is not available before parsing.</small>
   *   <small>Note that if the value is polyfilled, the value may not be accurate since the remote Peer can override the selected codec.
   *   The value is derived from the remote session description.</small>
   * @param {String} stats.video.receiving.codec.name The Peer connection receiving video streaming selected codec name.
   * @param {Number} stats.video.receiving.codec.payloadType The Peer connection receiving video streaming selected codec payload type.
   * @param {String} [stats.video.receiving.codec.implementation] The Peer connection receiving video streaming selected codec implementation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.codec.channels] The Peer connection receiving video streaming selected codec channels (2 for stereo).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing,
   *   and this is usually present in <code>stats.audio</code> property.</small>
   * @param {Number} [stats.video.receiving.codec.clockRate] The Peer connection receiving video streaming selected codec media sampling rate.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.video.receiving.codec.params] The Peer connection receiving video streaming selected codec parameters.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.frames] The Peer connection receiving video streaming frames.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.framesOutput] The Peer connection receiving video streaming fps output.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.framesDecoded] The Peer connection receiving video streaming frames decoded.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.frameRateMean] The Peer connection receiving video streaming fps mean.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.frameRateStdDev] The Peer connection receiving video streaming fps standard deviation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.framesPerSecond] The Peer connection receiving video streaming fps.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.framesDecoded] The Peer connection receiving video streaming frames decoded.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.framesCorrupted] The Peer connection receiving video streaming frames corrupted.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalFrames] The Peer connection total receiving video streaming frames.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.nacks] The Peer connection current receiving video streaming nacks.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalNacks] The Peer connection total receiving video streaming nacks.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.plis] The Peer connection current receiving video streaming plis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalPlis] The Peer connection total receiving video streaming plis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.firs] The Peer connection current receiving video streaming firs.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalFirs] The Peer connection total receiving video streaming firs.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.slis] The Peer connection current receiving video streaming slis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalPlis] The Peer connection total receiving video streaming slis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
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
   * @param {String} [stats.selectedCandidate.local.turnMediaTransport] The Peer connection possible
   *   transport used when relaying local media to TURN server.
   *   <small>Types are <code>"UDP"</code> (UDP connections), <code>"TCP"</code> (TCP connections) and
   *   <code>"TCP/TLS"</code> (TCP over TLS connections).</small>
   * @param {JSON} stats.selectedCandidate.remote The Peer connection selected remote ICE candidate.
   * @param {String} stats.selectedCandidate.remote.ipAddress The Peer connection selected
   *   remote ICE candidate IP address.
   * @param {Number} stats.selectedCandidate.remote.portNumber The Peer connection selected
   *   remote ICE candidate port number.
   * @param {String} stats.selectedCandidate.remote.transport The Peer connection selected
   *   remote ICE candidate IP transport type.
   * @param {String} stats.selectedCandidate.remote.candidateType The Peer connection selected
   *   remote ICE candidate type.
   * @param {Boolean} [stats.selectedCandidate.writable] The flag if Peer has gotten ACK to an ICE request.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Boolean} [stats.selectedCandidate.readable] The flag if Peer has gotten a valid incoming ICE request.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.rtt] The current STUN connectivity checks RTT (Round-trip delay time).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.totalRtt] The total STUN connectivity checks RTT (Round-trip delay time).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.selectedCandidate.requests The ICE connectivity check requests.
   * @param {String} [stats.selectedCandidate.requests.received] The current ICE connectivity check requests received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.requests.sent] The current ICE connectivity check requests sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.requests.totalReceived] The total ICE connectivity check requests received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.requests.totalSent] The total ICE connectivity check requests sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.selectedCandidate.responses The ICE connectivity check responses.
   * @param {String} [stats.selectedCandidate.responses.received] The current ICE connectivity check responses received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.responses.sent] The current ICE connectivity check responses sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.responses.totalReceived] The total ICE connectivity check responses received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.responses.totalSent] The total ICE connectivity check responses sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.selectedCandidate.consentRequests The current ICE consent requests.
   * @param {String} [stats.selectedCandidate.consentRequests.received] The current ICE consent requests received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.consentRequests.sent] The current ICE consent requests sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.consentRequests.totalReceived] The total ICE consent requests received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.consentRequests.totalSent] The total ICE consent requests sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.selectedCandidate.consentResponses The current ICE consent responses.
   * @param {String} [stats.selectedCandidate.consentResponses.received] The current ICE consent responses received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.consentResponses.sent] The current ICE consent responses sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.consentResponses.totalReceived] The total ICE consent responses received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.consentResponses.totalSent] The total ICE consent responses sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.certificate The Peer connection DTLS/SRTP exchanged certificates information.
   * @param {JSON} stats.certificate.local The Peer connection local certificate information.
   * @param {String} [stats.certificate.local.fingerprint] The Peer connection local certificate fingerprint.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.certificate.local.fingerprintAlgorithm] The Peer connection local
   *   certificate fingerprint algorithm.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.certificate.local.derBase64] The Peer connection local
   *   base64 certificate in binary DER format encoded in base64.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.certificate.remote The Peer connection remote certificate information.
   * @param {String} [stats.certificate.remote.fingerprint] The Peer connection remote certificate fingerprint.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.certificate.remote.fingerprintAlgorithm] The Peer connection remote
   *   certificate fingerprint algorithm.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.certificate.remote.derBase64] The Peer connection remote
   *   base64 certificate in binary DER format encoded in base64.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.certificate.srtpCipher] The certificates SRTP cipher.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.certificate.dtlsCipher] The certificates DTLS cipher.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.connection The Peer connection object stats.
   * @param {String} stats.connection.iceConnectionState The Peer connection ICE connection state.
   * @param {String} stats.connection.iceGatheringState The Peer connection ICE gathering state.
   * @param {String} stats.connection.signalingState The Peer connection signaling state.
   * @param {JSON} stats.connection.localDescription The Peer connection local session description.
   * @param {String} stats.connection.localDescription.type The Peer connection local session description type.
   *   <small>Defined as <code>null</code> when local session description is not available.</small>
   * @param {String} stats.connection.localDescription.sdp The Peer connection local session description SDP.
   *   <small>Defined as <code>null</code> when local session description is not available.</small>
   * @param {JSON} stats.connection.remoteDescription The Peer connection remote session description.
   * @param {String} stats.connection.remoteDescription.type The Peer connection remote session description type.
   *   <small>Defined as <code>null</code> when remote session description is not available.</small>
   * @param {String} stats.connection.remoteDescription.sdp The Peer connection remote session description sdp.
   *   <small>Defined as <code>null</code> when remote session description is not available.</small>
   * @param {JSON} stats.connection.candidates The Peer connection list of ICE candidates sent or received.
   * @param {JSON} stats.connection.candidates.sending The Peer connection list of local ICE candidates sent.
   * @param {Array} stats.connection.candidates.sending.host The Peer connection list of local
   *   <code>"host"</code> (local network) ICE candidates sent.
   * @param {JSON} stats.connection.candidates.sending.host.#index The Peer connection local
   *   <code>"host"</code> (local network) ICE candidate.
   * @param {String} stats.connection.candidates.sending.host.#index.candidate The Peer connection local
   *   <code>"host"</code> (local network) ICE candidate connection description.
   * @param {String} stats.connection.candidates.sending.host.#index.sdpMid The Peer connection local
   *   <code>"host"</code> (local network) ICE candidate identifier based on the local session description.
   * @param {Number} stats.connection.candidates.sending.host.#index.sdpMLineIndex The Peer connection local
   *   <code>"host"</code> (local network) ICE candidate media description index (starting from <code>0</code>)
   *   based on the local session description.
   * @param {Array} stats.connection.candidates.sending.srflx The Peer connection list of local
   *   <code>"srflx"</code> (STUN) ICE candidates sent.
   * @param {JSON} stats.connection.candidates.sending.srflx.#index The Peer connection local
   *   <code>"srflx"</code> (STUN) ICE candidate.
   * @param {String} stats.connection.candidates.sending.srflx.#index.candidate The Peer connection local
   *   <code>"srflx"</code> (STUN) ICE candidate connection description.
   * @param {String} stats.connection.candidates.sending.srflx.#index.sdpMid The Peer connection local
   *   <code>"srflx"</code> (STUN) ICE candidate identifier based on the local session description.
   * @param {Number} stats.connection.candidates.sending.srflx.#index.sdpMLineIndex The Peer connection local
   *   <code>"srflx"</code> (STUN) ICE candidate media description index (starting from <code>0</code>)
   *   based on the local session description.
   * @param {Array} stats.connection.candidates.sending.relay The Peer connection list of local
   *   <code>"relay"</code> (TURN) candidates sent.
   * @param {JSON} stats.connection.candidates.sending.relay.#index The Peer connection local
   *   <code>"relay"</code> (TURN) ICE candidate.
   * @param {String} stats.connection.candidates.sending.relay.#index.candidate The Peer connection local
   *   <code>"relay"</code> (TURN) ICE candidate connection description.
   * @param {String} stats.connection.candidates.sending.relay.#index.sdpMid The Peer connection local
   *   <code>"relay"</code> (TURN) ICE candidate identifier based on the local session description.
   * @param {Number} stats.connection.candidates.sending.relay.#index.sdpMLineIndex The Peer connection local
   *   <code>"relay"</code> (TURN) ICE candidate media description index (starting from <code>0</code>)
   *   based on the local session description.
   * @param {JSON} stats.connection.candidates.receiving The Peer connection list of remote ICE candidates received.
   * @param {Array} stats.connection.candidates.receiving.host The Peer connection list of remote
   *   <code>"host"</code> (local network) ICE candidates received.
   * @param {JSON} stats.connection.candidates.receiving.host.#index The Peer connection remote
   *   <code>"host"</code> (local network) ICE candidate.
   * @param {String} stats.connection.candidates.receiving.host.#index.candidate The Peer connection remote
   *   <code>"host"</code> (local network) ICE candidate connection description.
   * @param {String} stats.connection.candidates.receiving.host.#index.sdpMid The Peer connection remote
   *   <code>"host"</code> (local network) ICE candidate identifier based on the remote session description.
   * @param {Number} stats.connection.candidates.receiving.host.#index.sdpMLineIndex The Peer connection remote
   *   <code>"host"</code> (local network) ICE candidate media description index (starting from <code>0</code>)
   *   based on the remote session description.
   * @param {Array} stats.connection.candidates.receiving.srflx The Peer connection list of remote
   *   <code>"srflx"</code> (STUN) ICE candidates received.
   * @param {JSON} stats.connection.candidates.receiving.srflx.#index The Peer connection remote
   *   <code>"srflx"</code> (STUN) ICE candidate.
   * @param {String} stats.connection.candidates.receiving.srflx.#index.candidate The Peer connection remote
   *   <code>"srflx"</code> (STUN) ICE candidate connection description.
   * @param {String} stats.connection.candidates.receiving.srflx.#index.sdpMid The Peer connection remote
   *   <code>"srflx"</code> (STUN) ICE candidate identifier based on the remote session description.
   * @param {Number} stats.connection.candidates.receiving.srflx.#index.sdpMLineIndex The Peer connection remote
   *   <code>"srflx"</code> (STUN) ICE candidate media description index (starting from <code>0</code>)
   *   based on the remote session description.
   * @param {Array} stats.connection.candidates.receiving.relay The Peer connection list of remote
   *   <code>"relay"</code> (TURN) ICE candidates received.
   * @param {JSON} stats.connection.candidates.receiving.relay.#index The Peer connection remote
   *   <code>"relay"</code> (TURN) ICE candidate.
   * @param {String} stats.connection.candidates.receiving.relay.#index.candidate The Peer connection remote
   *   <code>"relay"</code> (TURN) ICE candidate connection description.
   * @param {String} stats.connection.candidates.receiving.relay.#index.sdpMid The Peer connection remote
   *   <code>"relay"</code> (TURN) ICE candidate identifier based on the remote session description.
   * @param {Number} stats.connection.candidates.receiving.relay.#index.sdpMLineIndex The Peer connection remote
   *   <code>"relay"</code> (TURN) ICE candidate media description index (starting from <code>0</code>)
   *   based on the remote session description.
   * @param {JSON} stats.connection.dataChannels The Peer connection list of Datachannel connections.
   * @param {JSON} stats.connection.dataChannels.#channelName The Peer connection Datachannel connection stats.
   * @param {String} stats.connection.dataChannels.#channelName.label The Peer connection Datachannel connection ID.
   * @param {String} stats.connection.dataChannels.#channelName.readyState The Peer connection Datachannel connection readyState.
   *   [Rel: Skylink.DATA_CHANNEL_STATE]
   * @param {String} stats.connection.dataChannels.#channelName.type The Peer connection Datachannel connection type.
   *   [Rel: Skylink.DATA_CHANNEL_TYPE]
   * @param {String} stats.connection.dataChannels.#channelName.currentTransferId The Peer connection
   *   Datachannel connection current progressing transfer session ID.
   *   <small>Defined as <code>null</code> when there is currently no transfer session progressing on the Datachannel connection.</small>
   * @param {String} stats.connection.dataChannels.#channelName.currentStreamId The Peer connection
   *   Datachannel connection current data streaming session ID.
   *   <small>Defined as <code>null</code> when there is currently no data streaming session on the Datachannel connection.</small>
   * @param {JSON} stats.connection.constraints The constraints passed in when constructing the Peer connection object.
   * @param {JSON} stats.connection.optional The optional constraints passed in when constructing the Peer connection object.
   * @param {JSON} [stats.connection.sdpConstraints] The constraints passed in when creating Peer connection offer or answer.
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
  localMediaMuted: [],

  /**
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.<br>
   *   Note that this event may not be triggered for MCU enabled Peer connections as ICE candidates
   *   may be received in the session description instead.
   * </blockquote>
   * Event triggered when remote ICE candidate processing state has changed when Peer is using trickle ICE.
   * @event candidateProcessingState
   * @param {String} state The ICE candidate processing state.
   *   [Rel: Skylink.CANDIDATE_PROCESSING_STATE]
   * @param {String} peerId The Peer ID.
   * @param {String} candidateId The remote ICE candidate session ID.
   *   <small>Note that this value is not related to WebRTC API but for identification of remote ICE candidate received.</small>
   * @param {String} candidateType The remote ICE candidate type.
   *   <small>Expected values are <code>"host"</code> (local network), <code>"srflx"</code> (STUN) and <code>"relay"</code> (TURN).</small>
   * @param {JSON} candidate The remote ICE candidate.
   * @param {String} candidate.candidate The remote ICE candidate connection description.
   * @param {String} candidate.sdpMid The remote ICE candidate identifier based on the remote session description.
   * @param {Number} candidate.sdpMLineIndex The remote ICE candidate media description index
   *   (starting from <code>0</code>) based on the remote session description.
   * @param {Error} [error] The error object.
   *   <small>Defined only when <code>state</code> is <code>DROPPED</code> or <code>PROCESS_ERROR</code>.</small>
   * @for Skylink
   * @since 0.6.16
   */
  candidateProcessingState: [],

  /**
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.<br>
   *   Note that this event may not be triggered for MCU enabled Peer connections as ICE candidates
   *   may be received in the session description instead.
   * </blockquote>
   * Event triggered when all remote ICE candidates gathering has completed and been processed.
   * @event candidatesGathered
   * @param {String} peerId The Peer ID.
   * @param {JSON} length The remote ICE candidates length.
   * @param {Number} length.expected The expected total number of remote ICE candidates to be received.
   * @param {Number} length.received The actual total number of remote ICE candidates received.
   * @param {Number} length.processed The total number of remote ICE candidates processed.
   * @for Skylink
   * @since 0.6.18
   */
  candidatesGathered: []
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
 * @param {String} [eventName] The event.
 * - When not provided, all listeners to all events will be unsubscribed.
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
  if (!(eventName && typeof eventName === 'string')) {
    this._EVENTS = {};
    this._onceEvents = {};
  } else {
    if (callback === undefined) {
      this._EVENTS[eventName] = [];
      this._onceEvents[eventName] = [];
      log.log([null, 'Event', eventName, 'All events are unsubscribed']);
      return;
    }
    var arr = this._EVENTS[eventName] || [];
    var once = this._onceEvents[eventName] || [];

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
        if (once[j] && !once[j][2]) {
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
Skylink.prototype._throttle = function(func, prop, wait){
  var self = this;
  var now = (new Date()).getTime();

  if (!(self._timestamp[prop] && ((now - self._timestamp[prop]) < wait))) {
    func(true);
    self._timestamp[prop] = now;
  } else {
    func(false);
  }
};
Skylink.prototype._sendChannelMessage = function(message) {
  var self = this;
  var interval = 1000;
  var throughput = 16;

  if (!self._channelOpen || !self._user || !self._socket) {
    log.warn([message.target || 'Server', 'Socket', message.type, 'Dropping of message as Socket connection is not opened or is at ' +
      'incorrect step ->'], message);
    return;
  }

  if (self._user.sid && !self._peerMessagesStamps[self._user.sid]) {
    self._peerMessagesStamps[self._user.sid] = {
      userData: 0,
      audioMuted: 0,
      videoMuted: 0
    };
  }

  var checkStampFn = function (statusMessage) {
    if (statusMessage.type === self._SIG_MESSAGE_TYPE.UPDATE_USER) {
      if (!self._user.sid) {
        return false;
      }
      return statusMessage.stamp > self._peerMessagesStamps[self._user.sid].userData;
    } else if (statusMessage.type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO) {
      if (!self._user.sid) {
        return false;
      }
      return statusMessage.stamp > self._peerMessagesStamps[self._user.sid].videoMuted;
    } else if (statusMessage.type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO) {
      if (!self._user.sid) {
        return false;
      }
      return statusMessage.stamp > self._peerMessagesStamps[self._user.sid].audioMuted;
    }
    return true;
  };

  var setStampFn = function (statusMessage) {
    if (statusMessage.type === self._SIG_MESSAGE_TYPE.UPDATE_USER) {
      self._peerMessagesStamps[self._user.sid].userData = statusMessage.stamp;
    } else if (statusMessage.type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO) {
      self._peerMessagesStamps[self._user.sid].videoMuted = statusMessage.stamp;
    } else if (statusMessage.type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO) {
      self._peerMessagesStamps[self._user.sid].audioMuted = statusMessage.stamp;
    }
  };

  var setQueueFn = function () {
    log.debug([null, 'Socket', null, 'Starting queue timeout']);

    self._socketMessageTimeout = setTimeout(function () {
      if (((new Date ()).getTime() - self._timestamp.socketMessage) <= interval) {
        log.debug([null, 'Socket', null, 'Restarting queue timeout']);
        setQueueFn();
        return;
      }
      startSendingQueuedMessageFn();
    }, interval - ((new Date ()).getTime() - self._timestamp.socketMessage));
  };

  var triggerEventFn = function (eventMessage) {
    if (eventMessage.type === self._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE) {
      self._trigger('incomingMessage', {
        content: eventMessage.data,
        isPrivate: false,
        targetPeerId: null,
        listOfPeers: Object.keys(self._peerInformations),
        isDataChannel: false,
        senderPeerId: self._user.sid
      }, self._user.sid, self.getPeerInfo(), true);
    }
  };

  var sendGroupMessageFn = function (groupMessageList) {
    self._socketMessageTimeout = null;

    if (!self._channelOpen || !(self._user && self._user.sid) || !self._socket) {
      log.warn([message.target || 'Server', 'Socket', null, 'Dropping of group messages as Socket connection is not opened or is at ' +
        'incorrect step ->'], groupMessageList);
      return;
    }

    var strGroupMessageList = [];
    var stamps = {
      userData: 0,
      audioMuted: 0,
      videoMuted: 0
    };

    for (var k = 0; k < groupMessageList.length; k++) {
      if (checkStampFn(groupMessageList[k])) {
        if (groupMessageList[k].type === self._SIG_MESSAGE_TYPE.UPDATE_USER &&
          groupMessageList[k].stamp > self._peerMessagesStamps[self._user.sid].userData &&
          groupMessageList[k].stamp > stamps.userData) {
          stamps.userData = groupMessageList[k].stamp;
        } else if (groupMessageList[k].type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO &&
          groupMessageList[k].stamp > self._peerMessagesStamps[self._user.sid].audioMuted &&
          groupMessageList[k].stamp > stamps.audioMuted) {
          stamps.audioMuted = groupMessageList[k].stamp;
        } else if (groupMessageList[k].type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO &&
          groupMessageList[k].stamp > self._peerMessagesStamps[self._user.sid].videoMuted &&
          groupMessageList[k].stamp > stamps.videoMuted) {
          stamps.videoMuted = groupMessageList[k].stamp;
        }
      }
    }

    for (var i = 0; i < groupMessageList.length; i++) {
      if ((groupMessageList[i].type === self._SIG_MESSAGE_TYPE.UPDATE_USER &&
          groupMessageList[i].stamp < stamps.userData) ||
          (groupMessageList[i].type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO &&
          groupMessageList[i].stamp < stamps.audioMuted) ||
          (groupMessageList[i].type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO &&
          groupMessageList[i].stamp < stamps.videoMuted)) {
        log.warn([message.target || 'Server', 'Socket', groupMessageList[i], 'Dropping of outdated status message ->'],
          clone(groupMessageList[i]));
        groupMessageList.splice(i, 1);
        i--;
        continue;
      }
      strGroupMessageList.push(JSON.stringify(groupMessageList[i]));
    }

    if (strGroupMessageList.length > 0) {
      var groupMessage = {
        type: self._SIG_MESSAGE_TYPE.GROUP,
        lists: strGroupMessageList,
        mid: self._user.sid,
        rid: self._room.id
      };

      log.log([message.target || 'Server', 'Socket', groupMessage.type,
        'Sending queued grouped message (max: 16 per group) ->'], clone(groupMessage));

      self._socket.send(JSON.stringify(groupMessage));
      self._timestamp.socketMessage = (new Date()).getTime();

      for (var j = 0; j < groupMessageList.length; j++) {
        setStampFn(groupMessageList[j]);
        triggerEventFn(groupMessageList[j]);
      }
    }
  };

  var startSendingQueuedMessageFn = function(){
    if (self._socketMessageQueue.length > 0){
      if (self._socketMessageQueue.length < throughput){
        sendGroupMessageFn(self._socketMessageQueue.splice(0, self._socketMessageQueue.length));
      } else {
        sendGroupMessageFn(self._socketMessageQueue.splice(0, throughput));
        setQueueFn();
      }
    }
  };

  if (self._GROUP_MESSAGE_LIST.indexOf(message.type) > -1) {
    if (!(self._timestamp.socketMessage && ((new Date ()).getTime() - self._timestamp.socketMessage) <= interval)) {
      if (!checkStampFn(message)) {
        log.warn([message.target || 'Server', 'Socket', message.type, 'Dropping of outdated status message ->'], clone(message));
        return;
      }
      if (self._socketMessageTimeout) {
        clearTimeout(self._socketMessageTimeout);
      }
      log.log([message.target || 'Server', 'Socket', message.type, 'Sending message ->'], clone(message));
      self._socket.send(JSON.stringify(message));
      setStampFn(message);
      triggerEventFn(message);

      self._timestamp.socketMessage = (new Date()).getTime();

    } else {
      log.debug([message.target || 'Server', 'Socket', message.type,
        'Queueing socket message to prevent message drop ->'], clone(message));

      self._socketMessageQueue.push(message);

      if (!self._socketMessageTimeout) {
        setQueueFn();
      }
    }
  } else {
    log.log([message.target || 'Server', 'Socket', message.type, 'Sending message ->'], clone(message));
    self._socket.send(JSON.stringify(message));

    // If Peer sends "bye" on its own, we trigger it as session disconnected abruptly
    if (message.type === self._SIG_MESSAGE_TYPE.BYE && self._inRoom &&
      self._user && self._user.sid && message.mid === self._user.sid) {
      self.leaveRoom(false);
      self._trigger('sessionDisconnect', self._user.sid, self.getPeerInfo());
    }
  }
};

/**
 * Function that creates and opens a socket connection to the Signaling.
 * @method _createSocket
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._createSocket = function (type, joinRoomTimestamp) {
  var self = this;
  var options = {
    forceNew: true,
    reconnection: true,
    timeout: self._initOptions.socketTimeout,
    reconnectionAttempts: 2,
    reconnectionDelayMax: 5000,
    reconnectionDelay: 1000,
    transports: ['websocket']
  };
  var ports = self._initOptions.socketServer && typeof self._initOptions.socketServer === 'object' && Array.isArray(self._initOptions.socketServer.ports) &&
    self._initOptions.socketServer.ports.length > 0 ? self._initOptions.socketServer.ports : self._socketPorts[self._signalingServerProtocol];
  var fallbackType = null;

  // just beginning
  if (self._signalingServerPort === null) {
    self._signalingServerPort = ports[0];
    fallbackType = self.SOCKET_FALLBACK.NON_FALLBACK;

  // reached the end of the last port for the protocol type
  } else if (ports.indexOf(self._signalingServerPort) === ports.length - 1 || typeof self._initOptions.socketServer === 'string') {
    // re-refresh to long-polling port
    if (type === 'WebSocket') {
      type = 'Polling';
      self._signalingServerPort = ports[0];
    } else {
      self._socketSession.finalAttempts++;
    }
  // move to the next port
  } else {
    self._signalingServerPort = ports[ ports.indexOf(self._signalingServerPort) + 1 ];
  }

  if (type === 'Polling') {
    options.reconnectionDelayMax = 1000;
    options.reconnectionAttempts = 4;
    options.transports = ['xhr-polling', 'jsonp-polling', 'polling'];
  }

  var url = self._signalingServerProtocol + '//' + self._signalingServer + ':' + self._signalingServerPort + '?rand=' + Date.now();
  var retries = 0;

  if (self._initOptions.socketServer) {
    // Provided as string, make it as just the fixed server
    url = typeof self._initOptions.socketServer === 'string' ? self._initOptions.socketServer :
      (self._initOptions.socketServer.protocol ? self._initOptions.socketServer.protocol : self._signalingServerProtocol) + '//' +
      self._initOptions.socketServer.url + ':' + self._signalingServerPort;
  }

  self._socketSession.transportType = type;
  self._socketSession.socketOptions = options;
  self._socketSession.socketServer = url;

  if (fallbackType === null) {
    fallbackType = self._signalingServerProtocol === 'http:' ?
      (type === 'Polling' ? self.SOCKET_FALLBACK.LONG_POLLING : self.SOCKET_FALLBACK.FALLBACK_PORT) :
      (type === 'Polling' ? self.SOCKET_FALLBACK.LONG_POLLING_SSL : self.SOCKET_FALLBACK.FALLBACK_SSL_PORT);

    self._socketSession.attempts++;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ATTEMPT, null, fallbackType, clone(self._socketSession));
    self._trigger('channelRetry', fallbackType, self._socketSession.attempts, clone(self._socketSession));
  }

  // if socket instance already exists, exit
  if (self._socket) {
    self._closeChannel();
  }

  self._channelOpen = false;

  log.log('Opening channel with signaling server url:', clone(self._socketSession));

  var socket = null;

  try {
    socket = io.connect(url, options);
  } catch (error){
    log.error('Failed creating socket connection object ->', error);
    if (fallbackType === self.SOCKET_FALLBACK.NON_FALLBACK) {
      self._trigger('socketError', self.SOCKET_ERROR.CONNECTION_FAILED, error, fallbackType, clone(self._socketSession));
    } else {
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_FAILED, error, fallbackType, clone(self._socketSession));
    }
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED, new Error('Reconnection aborted as ' +
      'there no more available ports, transports and final attempts left.'), fallbackType, clone(self._socketSession));
    return;
  }

  socket.on('reconnect_attempt', function (attempt) {
    retries++;
    self._socketSession.attempts++;
    self._trigger('channelRetry', fallbackType, self._socketSession.attempts, clone(self._socketSession));
  });

  socket.on('reconnect_failed', function () {
    if (fallbackType === self.SOCKET_FALLBACK.NON_FALLBACK) {
      self._trigger('socketError', self.SOCKET_ERROR.CONNECTION_FAILED, new Error('Failed connection with transport "' +
        type + '" and port ' + self._signalingServerPort + '.'), fallbackType, clone(self._socketSession));
    } else {
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_FAILED, new Error('Failed reconnection with transport "' +
        type + '" and port ' + self._signalingServerPort + '.'), fallbackType, clone(self._socketSession));
    }

    if (self._socketSession.finalAttempts < 2) {
      self._createSocket(type, joinRoomTimestamp);
    } else {
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED, new Error('Reconnection aborted as ' +
        'there no more available ports, transports and final attempts left.'), fallbackType, clone(self._socketSession));
    }
  });

  socket.on('connect', function () {
    if (!self._channelOpen) {
      log.log([null, 'Socket', null, 'Channel opened']);
      self._channelOpen = true;
      self._trigger('channelOpen', clone(self._socketSession));
    }
  });

  socket.on('reconnect', function () {
    if (!self._channelOpen) {
      log.log([null, 'Socket', null, 'Channel opened']);
      self._channelOpen = true;
      self._trigger('channelOpen', clone(self._socketSession));
    }
  });

  socket.on('error', function(error) {
    if (error ? error.message.indexOf('xhr poll error') > -1 : false) {
      log.error([null, 'Socket', null, 'XHR poll connection unstable. Disconnecting.. ->'], error);
      self._closeChannel();
      return;
    }
    log.error([null, 'Socket', null, 'Exception occurred ->'], error);
    self._trigger('channelError', error, clone(self._socketSession));
  });

  socket.on('disconnect', function() {
    if (self._channelOpen) {
      self._channelOpen = false;
      self._trigger('channelClose', clone(self._socketSession));
      log.log([null, 'Socket', null, 'Channel closed']);

      if (self._inRoom && self._user && self._user.sid) {
        self.leaveRoom(false);
        self._trigger('sessionDisconnect', self._user.sid, self.getPeerInfo());
      }
    }
  });

  socket.on('message', function(messageStr) {
    var message = JSON.parse(messageStr);

    log.log([null, 'Socket', null, 'Received message ->'], message);

    if (message.type === self._SIG_MESSAGE_TYPE.GROUP) {
      log.debug('Bundle of ' + message.lists.length + ' messages');
      for (var i = 0; i < message.lists.length; i++) {
        var indiMessage = JSON.parse(message.lists[i]);
        self._processSigMessage(indiMessage);
        self._trigger('channelMessage', indiMessage, clone(self._socketSession));
      }
    } else {
      self._processSigMessage(message);
      self._trigger('channelMessage', message, clone(self._socketSession));
    }
  });

  self._joinRoomManager.socketsFn.push(function (currentJoinRoomTimestamp) {
    if (currentJoinRoomTimestamp !== joinRoomTimestamp) {
      socket.disconnect();
    }
  });
  self._socket = socket;
};

/**
 * Function that starts the socket connection to the Signaling.
 * This starts creating the socket connection and called at first not when requiring to fallback.
 * @method _openChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._openChannel = function(joinRoomTimestamp) {
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
  if (self._initOptions.forceSSL) {
    self._signalingServerProtocol = 'https:';
  } else {
    self._signalingServerProtocol = window.location.protocol;
  }

  var socketType = 'WebSocket';

  // For IE < 9 that doesn't support WebSocket
  if (!window.WebSocket) {
    socketType = 'Polling';
  }

  self._socketSession.finalAttempts = 0;
  self._socketSession.attempts = 0;
  self._signalingServerPort = null;

  // Begin with a websocket connection
  self._createSocket(socketType, joinRoomTimestamp);
};

/**
 * Function that stops the socket connection to the Signaling.
 * @method _closeChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._closeChannel = function() {
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
  }

  if (this._channelOpen) {
    if (this._socket) {
      this._socket.disconnect();
    }

    log.log([null, 'Socket', null, 'Channel closed']);

    this._channelOpen = false;
    this._trigger('channelClose', clone(this._socketSession));

    if (this._inRoom && this._user && this._user.sid) {
      this.leaveRoom(false);
      this._trigger('sessionDisconnect', this._user.sid, this.getPeerInfo());
    }
  }

  this._socket = null;
};
Skylink.prototype.sendMessage = function(message, targetPeerId) {
  var listOfPeers = Object.keys(this._peerInformations);
  var isPrivate = false;

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (!this._inRoom || !this._socket || !this._user) {
    log.error('Unable to send message as User is not in Room. ->', message);
    return;
  }

  // Loop out unwanted Peers
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    if (!this._peerInformations[peerId]) {
      log.error([peerId, 'Socket', null, 'Dropping of sending message to Peer as ' +
        'Peer session does not exists']);
      listOfPeers.splice(i, 1);
      i--;
    } else if (peerId === 'MCU') {
      listOfPeers.splice(i, 1);
      i--;
    } else if (isPrivate) {
      log.debug([peerId, 'Socket', null, 'Sending private message to Peer']);

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

  if (listOfPeers.length === 0) {
    log.warn('Currently there are no Peers to send message to (unless the message is queued and ' +
      'there are Peer connected by then).');
  }

  if (!isPrivate) {
    log.debug([null, 'Socket', null, 'Broadcasting message to Peers']);

    this._sendChannelMessage({
      cid: this._key,
      data: message,
      mid: this._user.sid,
      rid: this._room.id,
      type: this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
    });
  } else {
    this._trigger('incomingMessage', {
      content: message,
      isPrivate: isPrivate,
      targetPeerId: targetPeerId || null,
      listOfPeers: listOfPeers,
      isDataChannel: false,
      senderPeerId: this._user.sid
    }, this._user.sid, this.getPeerInfo(), true);
  }
};

/**
 * <blockquote class="info">
 *   Note that this feature requires MCU and recording to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>. If recording feature is not available to
 *   be enabled in the <a href="https://console.temasys.io">Developer Console</a>, please
 *   <a href="http://support.temasys.io">contact us on our support portal</a>.
 * </blockquote>
 * Starts a recording session.
 * @method startRecording
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_recordingState">
 *   <code>recordingState</code> event</a> triggering <code>state</code> parameter payload as <code>START</code>.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>startRecording()</code> error when starting a new recording session.</small>
 * @param {String|JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the <a href="#event_recordingState">
 *   <code>recordingState</code> event</a> triggered <code>recordingId</code> parameter payload.</small>
 * @example
 *   // Example 1: Start recording session
 *   skylinkDemo.startRecording(function (error, success) {
 *     if (error) return;
 *     console.info("Recording session has started. ID ->", success);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If MCU is not connected: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If there is an existing recording session currently going on: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Sends to MCU via Signaling server to start recording session. <ol>
 *   <li>If recording session has been started successfully: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>START</code>.</li></ol></li></ol></li></ol>
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.startRecording = function (callback) {
  var self = this;

  if (!self._hasMCU) {
    var noMCUError = 'Unable to start recording as MCU is not connected';
    log.error(noMCUError);
    if (typeof callback === 'function') {
      callback(new Error(noMCUError), null);
    }
    return;
  }

  if (self._currentRecordingId) {
    var hasRecordingSessionError = 'Unable to start recording as there is an existing recording in-progress';
    log.error(hasRecordingSessionError);
    if (typeof callback === 'function') {
      callback(new Error(hasRecordingSessionError), null);
    }
    return;
  }

  if (typeof callback === 'function') {
    self.once('recordingState', function (state, recordingId) {
      callback(null, recordingId);
    }, function (state) {
      return state === self.RECORDING_STATE.START;
    });
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.START_RECORDING,
    rid: self._room.id,
    target: 'MCU'
  });

  log.debug(['MCU', 'Recording', null, 'Starting recording']);
};

/**
 * <blockquote class="info">
 *   Note that this feature requires MCU and recording to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>. If recording feature is not available to
 *   be enabled in the <a href="https://console.temasys.io">Developer Console</a>, please
 *   <a href="http://support.temasys.io">contact us on our support portal</a>.
 * </blockquote>
 * Stops a recording session.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_recordingState">
 *   <code>recordingState</code> event</a> triggering <code>state</code> parameter payload as <code>STOP</code>
 *   or as <code>LINK</code> when the value of <code>callbackSuccessWhenLink</code> is <code>true</code>.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>stopRecording()</code> error when stopping current recording session.</small>
 * @param {String|JSON} callback.success The success result in request.
 * - When <code>callbackSuccessWhenLink</code> value is <code>false</code>, it is defined as string as
 *   the recording session ID.
 * - when <code>callbackSuccessWhenLink</code> value is <code>true</code>, it is defined as an object as
 *   the recording session information.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {JSON} callback.success.recordingId The recording session ID.
 * @param {JSON} callback.success.link The recording session mixin videos link in
 *   <a href="https://en.wikipedia.org/wiki/MPEG-4_Part_14">MP4</a> format.
 *   <small>Object signature matches the <code>link</code> parameter payload received in the
 *   <a href="#event_recordingState"><code>recordingState</code> event</a>.</small>
 * @param {Boolean} [callbackSuccessWhenLink=false] The flag if <code>callback</code> function provided
 *   should result in success only when <a href="#event_recordingState"><code>recordingState</code> event</a>
 *   triggering <code>state</code> parameter payload as <code>LINK</code>.
 * @method stopRecording
 * @example
 *   // Example 1: Stop recording session
 *   skylinkDemo.stopRecording(function (error, success) {
 *     if (error) return;
 *     console.info("Recording session has stopped. ID ->", success);
 *   });
 *
 *   // Example 2: Stop recording session with mixin videos link
 *   skylinkDemo.stopRecording(function (error, success) {
 *     if (error) return;
 *     console.info("Recording session has compiled with links ->", success.link);
 *   }, true);
 * @trigger <ol class="desc-seq">
 *   <li>If MCU is not connected: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If there is no existing recording session currently going on: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If existing recording session recording time has not elapsed more than 4 seconds:
 *   <small>4 seconds is mandatory for recording session to ensure better recording
 *   experience and stability.</small> <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Sends to MCU via Signaling server to stop recording session: <ol>
 *   <li>If recording session has been stopped successfully: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>START</code>.
 *   <li>MCU starts mixin recorded session videos: <ol>
 *   <li>If recording session has been mixin successfully with links: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>LINK</code>.<li>Else: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>ERROR</code>.<li><b>ABORT</b> and return error.</ol></li>
 *   </ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> and return error.</li>
 *   </ol></li></ol></li></ol>
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.stopRecording = function (callback, callbackSuccessWhenLink) {
  var self = this;

  if (!self._hasMCU) {
    var noMCUError = 'Unable to stop recording as MCU is not connected';
    log.error(noMCUError);
    if (typeof callback === 'function') {
      callback(new Error(noMCUError), null);
    }
    return;
  }

  if (!self._currentRecordingId) {
    var noRecordingSessionError = 'Unable to stop recording as there is no recording in-progress';
    log.error(noRecordingSessionError);
    if (typeof callback === 'function') {
      callback(new Error(noRecordingSessionError), null);
    }
    return;
  }

  if (self._recordingStartInterval) {
    var recordingSecsRequiredError = 'Unable to stop recording as 4 seconds has not been recorded yet';
    log.error(recordingSecsRequiredError);
    if (typeof callback === 'function') {
      callback(new Error(recordingSecsRequiredError), null);
    }
    return;
  }

  if (typeof callback === 'function') {
    var expectedRecordingId = self._currentRecordingId;

    self.once('recordingState', function (state, recordingId, link, error) {
      if (callbackSuccessWhenLink) {
        if (error) {
          callback(error, null);
          return;
        }

        callback(null, {
          link: link,
          recordingId: recordingId
        });
        return;
      }

      callback(null, recordingId);

    }, function (state, recordingId) {
      if (expectedRecordingId === recordingId) {
        if (callbackSuccessWhenLink) {
          return [self.RECORDING_STATE.LINK, self.RECORDING_STATE.ERROR].indexOf(state) > -1;
        }
        return state === self.RECORDING_STATE.STOP;
      }
    });
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.STOP_RECORDING,
    rid: self._room.id,
    target: 'MCU'
  });

  log.debug(['MCU', 'Recording', null, 'Stopping recording']);
};

/**
 * <blockquote class="info">
 *   Note that this feature requires MCU and recording to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>. If recording feature is not available to
 *   be enabled in the <a href="https://console.temasys.io">Developer Console</a>, please
 *   <a href="http://support.temasys.io">contact us on our support portal</a>.
 * </blockquote>
 * Gets the list of current recording sessions since User has connected to the Room.
 * @method getRecordings
 * @return {JSON} The list of recording sessions.<ul>
 *   <li><code>#recordingId</code><var><b>{</b>JSON<b>}</b></var><p>The recording session.</p><ul>
 *   <li><code>active</code><var><b>{</b>Boolean<b>}</b></var><p>The flag that indicates if the recording session is currently active.</p></li>
 *   <li><code>state</code><var><b>{</b>Number<b>}</b></var><p>The current recording state. [Rel: Skylink.RECORDING_STATE]</p></li>
 *   <li><code>startedDateTime</code><var><b>{</b>String<b>}</b></var><p>The recording session started DateTime in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.<small>Note that this value may not be
 *   very accurate as this value is recorded when the start event is received.</small></p></li>
 *   <li><code>endedDateTime</code><var><b>{</b>String<b>}</b></var><p>The recording session ended DateTime in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.<small>Note that this value may not be
 *   very accurate as this value is recorded when the stop event is received.</small>
 *   <small>Defined only after <code>state</code> has triggered <code>STOP</code>.</small></p></li>
 *   <li><code>mixingDateTime</code><var><b>{</b>String<b>}</b></var><p>The recording session mixing completed DateTime in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.<small>Note that this value may not be
 *   very accurate as this value is recorded when the mixing completed event is received.</small>
 *   <small>Defined only when <code>state</code> is <code>LINK</code>.</small></p></li>
 *   <li><code>links</code><var><b>{</b>JSON<b>}</b></var><p>The recording session links.
 *   <small>Object signature matches the <code>link</code> parameter payload received in the
 *   <a href="#event_recordingState"><code>recordingState</code> event</a>.</small>
 *   <small>Defined only when <code>state</code> is <code>LINK</code>.</small></p></li>
 *   <li><code>error</code><var><b>{</b>Error<b>}</b></var><p>The recording session error.
 *   <small>Defined only when <code>state</code> is <code>ERROR</code>.</small></p></li></ul></li></ul>
 * @example
 *   // Example 1: Get recording sessions
 *   skylinkDemo.getRecordings();
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.getRecordings = function () {
  return clone(this._recordings);
};

/**
 * Function that handles and processes the socket message received.
 * @method _processSigMessage
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSigMessage = function(message, session) {
  var origin = message.mid;
  if (!origin || origin === this._user.sid) {
    origin = 'Server';
  }
  log.debug([origin, 'Socket', message.type, 'Received from peer ->'], clone(message));
  if (message.mid === this._user.sid &&
    message.type !== this._SIG_MESSAGE_TYPE.REDIRECT &&
    message.type !== this._SIG_MESSAGE_TYPE.IN_ROOM) {
    log.debug([origin, 'Socket', message.type, 'Ignoring message ->'], clone(message));
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
  case this._SIG_MESSAGE_TYPE.RECORDING:
    this._recordingEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.END_OF_CANDIDATES:
    this._endOfCandidatesHandler(message);
    break;
  default:
    log.error([message.mid, 'Socket', message.type, 'Unsupported message ->'], clone(message));
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
 * Function that handles the "endOfCandidates" socket message received.
 * See confluence docs for the "endOfCandidates" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _endOfCandidatesHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._endOfCandidatesHandler = function(message){
  var self = this;
  var targetMid = message.mid;

  if (!(self._peerConnections[targetMid] &&
    self._peerConnections[targetMid].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    return;
  }

  self._peerEndOfCandidatesCounter[targetMid].expectedLen = message.noOfExpectedCandidates || 0;
  self._signalingEndOfCandidates(targetMid);
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

  var enterMsg = {
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: AdapterJS.webrtcDetectedBrowser,
    version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    receiveOnly: self.getPeerInfo().config.receiveOnly,
    target: message.target,
    weight: self._peerPriorityWeight,
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
    enableIceTrickle: self._initOptions.enableIceTrickle,
    enableDataChannel: self._initOptions.enableDataChannel,
    enableIceRestart: self._enableIceRestart,
    SMProtocolVersion: self.SM_PROTOCOL_VERSION,
    DTProtocolVersion: self.DT_PROTOCOL_VERSION
  };

  if (self._publishOnly) {
    enterMsg.publishOnly = {
      type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
    };
  }

  if (self._parentId) {
    enterMsg.parentId = self._parentId;
  }

  self._sendChannelMessage(enterMsg);
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
    this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);
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
  this._trigger('roomLock', message.lock, targetMid, this.getPeerInfo(targetMid), false);
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
    this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);
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

  if (this._peerInformations[targetMid] && message.streamId) {
    this._streamsSession[targetMid] = this._streamsSession[targetMid] || {};
    if (message.status === 'ended') {
      if (message.settings && typeof message.settings === 'object' &&
        typeof this._streamsSession[targetMid][message.streamId] === 'undefined') {
        this._streamsSession[targetMid][message.streamId] = {
          audio: message.settings.audio,
          video: message.settings.video
        };
      }

      this._handleEndedStreams(targetMid, message.streamId);
  	}
  } else {
    // Probably left the room already
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
 * Handles the RECORDING Protocol message event received from the platform signaling.
 * @method _recordingEventHandler
 * @param {JSON} message The message object received from platform signaling.
 *    This should contain the <code>RECORDING</code> payload.
 * @param {String} message.url The recording URL if mixing has completed.
 * @param {String} message.action The recording action received.
 * @param {String} message.error The recording error exception received.
 * @private
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._recordingEventHandler = function (message) {
  var self = this;

  log.debug(['MCU', 'Recording', null, 'Received recording message ->'], message);

  if (message.action === 'on') {
    if (!self._recordings[message.recordingId]) {
      log.debug(['MCU', 'Recording', message.recordingId, 'Started recording']);

      self._currentRecordingId = message.recordingId;
      self._recordings[message.recordingId] = {
        active: true,
        state: self.RECORDING_STATE.START,
        startedDateTime: (new Date()).toISOString(),
        endedDateTime: null,
        mixingDateTime: null,
        links: null,
        error: null
      };
      self._recordingStartInterval = setTimeout(function () {
        log.log(['MCU', 'Recording', message.recordingId, '4 seconds has been recorded. Recording can be stopped now']);
        self._recordingStartInterval = null;
      }, 4000);
      self._trigger('recordingState', self.RECORDING_STATE.START, message.recordingId, null, null);
    }

  } else if (message.action === 'off') {
    if (!self._recordings[message.recordingId]) {
      log.error(['MCU', 'Recording', message.recordingId, 'Received request of "off" but the session is empty']);
      return;
    }

    self._currentRecordingId = null;

    if (self._recordingStartInterval) {
      clearTimeout(self._recordingStartInterval);
      log.warn(['MCU', 'Recording', message.recordingId, 'Recording stopped abruptly before 4 seconds']);
      self._recordingStartInterval = null;
    }

    log.debug(['MCU', 'Recording', message.recordingId, 'Stopped recording']);

    self._recordings[message.recordingId].active = false;
    self._recordings[message.recordingId].state = self.RECORDING_STATE.STOP;
    self._recordings[message.recordingId].endedDateTime = (new Date()).toISOString();
    self._trigger('recordingState', self.RECORDING_STATE.STOP, message.recordingId, null, null);

  } else if (message.action === 'url') {
    if (!self._recordings[message.recordingId]) {
      log.error(['MCU', 'Recording', message.recordingId, 'Received URL but the session is empty']);
      return;
    }

    var links = {};

    if (Array.isArray(message.urls)) {
      for (var i = 0; i < message.urls.length; i++) {
        links[messages.urls[i].id || ''] = messages.urls[i].url || '';
      }
    } else if (typeof message.url === 'string') {
      links.mixin = message.url;
    }

    self._recordings[message.recordingId].links = links;
    self._recordings[message.recordingId].state = self.RECORDING_STATE.LINK;
    self._recordings[message.recordingId].mixingDateTime = (new Date()).toISOString();
    self._trigger('recordingState', self.RECORDING_STATE.LINK, message.recordingId, links, null);

  } else {
    var recordingError = new Error(message.error || 'Unknown error');
    if (!self._recordings[message.recordingId]) {
      log.error(['MCU', 'Recording', message.recordingId, 'Received error but the session is empty ->'], recordingError);
      return;
    }

    log.error(['MCU', 'Recording', message.recordingId, 'Recording failure ->'], recordingError);

    self._recordings[message.recordingId].state = self.RECORDING_STATE.ERROR;
    self._recordings[message.recordingId].error = recordingError;

    if (self._recordings[message.recordingId].active) {
      log.debug(['MCU', 'Recording', message.recordingId, 'Stopped recording abruptly']);
      self._recordings[message.recordingId].active = false;
      //self._trigger('recordingState', self.RECORDING_STATE.STOP, message.recordingId, null, recordingError);
    }

    self._trigger('recordingState', self.RECORDING_STATE.ERROR, message.recordingId, null, recordingError);
  }
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
  self._room.connection.peerConfig = self._setIceServers((message.pc_config || {}).iceServers || []);
  self._inRoom = true;
  self._user.sid = message.sid;
  self._peerPriorityWeight = message.tieBreaker + (self._initOptions.priorityWeightScheme === self.PRIORITY_WEIGHT_SCHEME.AUTO ?
    0 : (self._initOptions.priorityWeightScheme === self.PRIORITY_WEIGHT_SCHEME.ENFORCE_OFFERER ? 2e+15 : -(2e+15)));

  self._trigger('peerJoined', self._user.sid, self.getPeerInfo(), true);
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);

  var streamId = null;

  if (self._streams.screenshare && self._streams.screenshare.stream) {
    streamId = self._streams.screenshare.stream.id || self._streams.screenshare.stream.label;
    self._trigger('incomingStream', self._user.sid, self._streams.screenshare.stream, true, self.getPeerInfo(), true, streamId);
  } else if (self._streams.userMedia && self._streams.userMedia.stream) {
    streamId = self._streams.userMedia.stream.id || self._streams.userMedia.stream.label;
    self._trigger('incomingStream', self._user.sid, self._streams.userMedia.stream, true, self.getPeerInfo(), false, streamId);
  }
  // NOTE ALEX: should we wait for local streams?
  // or just go with what we have (if no stream, then one way?)
  // do we hardcode the logic here, or give the flexibility?
  // It would be better to separate, do we could choose with whom
  // we want to communicate, instead of connecting automatically to all.
  var enterMsg = {
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: AdapterJS.webrtcDetectedBrowser,
    version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    receiveOnly: self.getPeerInfo().config.receiveOnly,
    weight: self._peerPriorityWeight,
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
    enableIceTrickle: self._initOptions.enableIceTrickle,
    enableDataChannel: self._initOptions.enableDataChannel,
    enableIceRestart: self._enableIceRestart,
    SMProtocolVersion: self.SM_PROTOCOL_VERSION,
    DTProtocolVersion: self.DT_PROTOCOL_VERSION
  };

  if (self._publishOnly) {
    enterMsg.publishOnly = {
      type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
    };
  }

  if (self._parentId) {
    enterMsg.parentId = self._parentId;
  }

  self._sendChannelMessage(enterMsg);
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
  var userInfo = message.userInfo || {};
  userInfo.settings = userInfo.settings || {};
  userInfo.mediaStatus = userInfo.mediaStatus || {};
  userInfo.config = {
    enableIceTrickle: typeof message.enableIceTrickle === 'boolean' ? message.enableIceTrickle : true,
    enableIceRestart: typeof message.enableIceRestart === 'boolean' ? message.enableIceRestart : false,
    enableDataChannel: typeof message.enableDataChannel === 'boolean' ? message.enableDataChannel : true,
    priorityWeight: typeof message.weight === 'number' ? message.weight : 0,
    receiveOnly: message.receiveOnly === true,
    publishOnly: !!message.publishOnly
  };
  userInfo.parentId = message.parentId || null;
  userInfo.agent = {
    name: typeof message.agent === 'string' && message.agent ? message.agent : 'other',
    version: (function () {
      if (!(message.version && typeof message.version === 'string')) {
        return 0;
      }
      // E.g. 0.9.6, replace minor "." with 0
      if (message.version.indexOf('.') > -1) {
        var parts = message.version.split('.');
        if (parts.length > 2) {
          var majorVer = parts[0] || '0';
          parts.splice(0, 1);
          return parseFloat(majorVer + '.' + parts.join('0'), 10);
        }
        return parseFloat(message.version || '0', 10);
      }
      return parseInt(message.version || '0', 10);
    })(),
    os: typeof message.os === 'string' && message.os ? message.os : '',
    pluginVersion: typeof message.temasysPluginVersion === 'string' && message.temasysPluginVersion ?
      message.temasysPluginVersion : null,
    SMProtocolVersion: message.SMProtocolVersion && typeof message.SMProtocolVersion === 'string' ?
      message.SMProtocolVersion : '0.1.1',
    DTProtocolVersion: message.DTProtocolVersion && typeof message.DTProtocolVersion === 'string' ?
      message.DTProtocolVersion : (self._hasMCU || targetMid === 'MCU' ? '0.1.2' : '0.1.0')
  };

  log.log([targetMid, 'RTCPeerConnection', null, 'Peer "enter" received ->'], message);

  // Ignore if: User is publishOnly and MCU is enabled
  //          : User is parent and parentId is defined and matches
  //          : User is child and parent matches
  // Don't if : Is MCU
  if (targetMid !== 'MCU' && ((self._parentId && self._parentId === targetMid) ||
    (self._hasMCU && self._publishOnly) || (message.parentId && self._user && self._user.sid &&
    message.parentId === self._user.sid))) {
    log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding "enter" for parentId or publishOnly case ->'], message);
    return;
  }

  var processPeerFn = function (cert) {
    if (!self._peerInformations[targetMid]) {
      isNewPeer = true;

      self._peerInformations[targetMid] = userInfo;

      var hasScreenshare = userInfo.settings.video && typeof userInfo.settings.video === 'object' &&
        !!userInfo.settings.video.screenshare;

      self._addPeer(targetMid, cert || null, {
        agent: userInfo.agent.name,
        version: userInfo.agent.version,
        os: userInfo.agent.os
      }, message.receiveOnly, hasScreenshare);

      if (targetMid === 'MCU') {
        log.info([targetMid, 'RTCPeerConnection', null, 'MCU feature has been enabled']);

        self._hasMCU = true;
        self._trigger('serverPeerJoined', targetMid, self.SERVER_PEER_TYPE.MCU);

      } else {
        self._trigger('peerJoined', targetMid, self.getPeerInfo(targetMid), false);
      }

      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
    }

    self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
      userData: 0,
      audioMuted: 0,
      videoMuted: 0
    };

    var welcomeMsg = {
      type: self._SIG_MESSAGE_TYPE.WELCOME,
      mid: self._user.sid,
      rid: self._room.id,
      enableIceTrickle: self._initOptions.enableIceTrickle,
      enableDataChannel: self._initOptions.enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      agent: AdapterJS.webrtcDetectedBrowser,
      version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      os: window.navigator.platform,
      userInfo: self._getUserInfo(targetMid),
      target: targetMid,
      weight: self._peerPriorityWeight,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      welcomeMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      welcomeMsg.parentId = self._parentId;
    }

    self._sendChannelMessage(welcomeMsg);

    if (isNewPeer) {
      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    }
  };

  if (self._peerConnectionConfig.certificate !== self.PEER_CERTIFICATE.AUTO &&
    typeof RTCPeerConnection.generateCertificate === 'function') {
    var certOptions = {};
    if (self._peerConnectionConfig.certificate === self.PEER_CERTIFICATE.ECDSA) {
      certOptions = {
        name: 'ECDSA',
        namedCurve: 'P-256'
      };
    } else {
      certOptions = {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      };
    }
    RTCPeerConnection.generateCertificate(certOptions).then(function (cert) {
      processPeerFn(cert);
    }, function () {
      processPeerFn();
    });
  } else {
    processPeerFn();
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
  var userInfo = message.userInfo || {};
  userInfo.settings = userInfo.settings || {};
  userInfo.mediaStatus = userInfo.mediaStatus || {};
  userInfo.config = {
    enableIceTrickle: typeof message.enableIceTrickle === 'boolean' ? message.enableIceTrickle : true,
    enableIceRestart: typeof message.enableIceRestart === 'boolean' ? message.enableIceRestart : false,
    enableDataChannel: typeof message.enableDataChannel === 'boolean' ? message.enableDataChannel : true,
    priorityWeight: typeof message.weight === 'number' ? message.weight : 0,
    receiveOnly: message.receiveOnly === true,
    publishOnly: !!message.publishOnly
  };
  userInfo.parentId = message.parentId || null;
  userInfo.agent = {
    name: typeof message.agent === 'string' && message.agent ? message.agent : 'other',
    version: (function () {
      if (!(message.version && typeof message.version === 'string')) {
        return 0;
      }
      // E.g. 0.9.6, replace minor "." with 0
      if (message.version.indexOf('.') > -1) {
        var parts = message.version.split('.');
        if (parts.length > 2) {
          var majorVer = parts[0] || '0';
          parts.splice(0, 1);
          return parseFloat(majorVer + '.' + parts.join('0'), 10);
        }
        return parseFloat(message.version || '0', 10);
      }
      return parseInt(message.version || '0', 10);
    })(),
    os: typeof message.os === 'string' && message.os ? message.os : '',
    pluginVersion: typeof message.temasysPluginVersion === 'string' && message.temasysPluginVersion ?
      message.temasysPluginVersion : null,
    SMProtocolVersion: message.SMProtocolVersion && typeof message.SMProtocolVersion === 'string' ?
      message.SMProtocolVersion : '0.1.1',
    DTProtocolVersion: message.DTProtocolVersion && typeof message.DTProtocolVersion === 'string' ?
      message.DTProtocolVersion : (self._hasMCU || targetMid === 'MCU' ? '0.1.2' : '0.1.0')
  };

  log.log([targetMid, 'RTCPeerConnection', null, 'Peer "restart" received ->'], message);

  if (!self._peerInformations[targetMid]) {
    log.error([targetMid, 'RTCPeerConnection', null, 'Peer does not have an existing session. Ignoring restart process.']);
    return;
  }

  // Ignore if: User is publishOnly and MCU is enabled
  //          : User is parent and parentId is defined and matches
  //          : User is child and parent matches
  // Don't if : Is MCU
  if (targetMid !== 'MCU' && ((self._parentId && self._parentId === targetMid) ||
    (self._hasMCU && self._publishOnly) || (message.parentId && self._user && self._user.sid &&
    message.parentId === self._user.sid))) {
    log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding "restart" for parentId or publishOnly case ->'], message);
    return;
  }

  if (self._hasMCU && !self._initOptions.mcuUseRenegoRestart) {
    log.warn([targetMid, 'RTCPeerConnection', null, 'Dropping restart request as MCU does not support re-negotiation. ' +
      'Restart workaround is to re-join Room for Peer.']);
    self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false, false);
    return;
  }

  self._peerInformations[targetMid] = userInfo;
  self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
    userData: 0,
    audioMuted: 0,
    videoMuted: 0
  };
  self._peerEndOfCandidatesCounter[targetMid] = self._peerEndOfCandidatesCounter[targetMid] || {};
  self._peerEndOfCandidatesCounter[targetMid].len = 0;

  // Make peer with highest weight do the offer
  if (self._peerPriorityWeight > message.weight) {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Re-negotiating new offer/answer.']);

    if (self._peerMessagesStamps[targetMid].hasRestart) {
      log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding extra "restart" received.']);
      return;
    }

    self._peerMessagesStamps[targetMid].hasRestart = true;
    self._doOffer(targetMid, message.doIceRestart === true, {
      agent: userInfo.agent.name,
      version: userInfo.agent.version,
      os: userInfo.agent.os
    }, true);

  } else {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Waiting for peer to start re-negotiation.']);

    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: AdapterJS.webrtcDetectedBrowser,
      version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(targetMid),
      target: targetMid,
      weight: self._peerPriorityWeight,
      enableIceTrickle: self._initOptions.enableIceTrickle,
      enableDataChannel: self._initOptions.enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: message.doIceRestart === true,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      isRestartResend: true,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION,
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      restartMsg.parentId = self._parentId;
    }

    self._sendChannelMessage(restartMsg);
  }

  self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false, message.doIceRestart === true);
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
  var self = this;
  var targetMid = message.mid;
  var isNewPeer = false;
  var userInfo = message.userInfo || {};
  userInfo.settings = userInfo.settings || {};
  userInfo.mediaStatus = userInfo.mediaStatus || {};
  userInfo.config = {
    enableIceTrickle: typeof message.enableIceTrickle === 'boolean' ? message.enableIceTrickle : true,
    enableIceRestart: typeof message.enableIceRestart === 'boolean' ? message.enableIceRestart : false,
    enableDataChannel: typeof message.enableDataChannel === 'boolean' ? message.enableDataChannel : true,
    priorityWeight: typeof message.weight === 'number' ? message.weight : 0,
    receiveOnly: message.receiveOnly === true,
    publishOnly: !!message.publishOnly
  };
  userInfo.parentId = message.parentId || null;
  userInfo.agent = {
    name: typeof message.agent === 'string' && message.agent ? message.agent : 'other',
    version: (function () {
      if (!(message.version && typeof message.version === 'string')) {
        return 0;
      }
      // E.g. 0.9.6, replace minor "." with 0
      if (message.version.indexOf('.') > -1) {
        var parts = message.version.split('.');
        if (parts.length > 2) {
          var majorVer = parts[0] || '0';
          parts.splice(0, 1);
          return parseFloat(majorVer + '.' + parts.join('0'), 10);
        }
        return parseFloat(message.version || '0', 10);
      }
      return parseInt(message.version || '0', 10);
    })(),
    os: typeof message.os === 'string' && message.os ? message.os : '',
    pluginVersion: typeof message.temasysPluginVersion === 'string' && message.temasysPluginVersion ?
      message.temasysPluginVersion : null,
    SMProtocolVersion: message.SMProtocolVersion && typeof message.SMProtocolVersion === 'string' ?
      message.SMProtocolVersion : '0.1.1',
    DTProtocolVersion: message.DTProtocolVersion && typeof message.DTProtocolVersion === 'string' ?
      message.DTProtocolVersion : (self._hasMCU || targetMid === 'MCU' ? '0.1.2' : '0.1.0')
  };

  log.log([targetMid, 'RTCPeerConnection', null, 'Peer "welcome" received ->'], message);

  // Ignore if: User is publishOnly and MCU is enabled
  //          : User is parent and parentId is defined and matches
  //          : User is child and parent matches
  // Don't if : Is MCU
  if (targetMid !== 'MCU' && ((self._parentId && self._parentId === targetMid) ||
    (self._hasMCU && self._publishOnly) || (message.parentId && self._user && self._user.sid &&
    message.parentId === self._user.sid))) {
    log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding "welcome" for parentId or publishOnly case ->'], message);
    return;
  }

  var processPeerFn = function (cert) {
    if (!self._peerInformations[targetMid]) {
      isNewPeer = true;

      self._peerInformations[targetMid] = userInfo;

      var hasScreenshare = userInfo.settings.video && typeof userInfo.settings.video === 'object' &&
        !!userInfo.settings.video.screenshare;

      self._addPeer(targetMid, cert || null, {
        agent: userInfo.agent.name,
        version: userInfo.agent.version,
        os: userInfo.agent.os
      }, message.receiveOnly, hasScreenshare);

      if (targetMid === 'MCU') {
        log.info([targetMid, 'RTCPeerConnection', null, 'MCU feature has been enabled']);

        self._hasMCU = true;
        self._trigger('serverPeerJoined', targetMid, self.SERVER_PEER_TYPE.MCU);

      } else {
        self._trigger('peerJoined', targetMid, self.getPeerInfo(targetMid), false);
      }

      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    }

    self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
      userData: 0,
      audioMuted: 0,
      videoMuted: 0,
      hasWelcome: false
    };

    if (self._hasMCU || self._peerPriorityWeight > message.weight) {
      if (self._peerMessagesStamps[targetMid].hasWelcome) {
        log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding extra "welcome" received.']);
        return;
      }

      log.debug([targetMid, 'RTCPeerConnection', null, 'Starting negotiation']);

      self._peerMessagesStamps[targetMid].hasWelcome = true;
      self._doOffer(targetMid, false, {
        agent: userInfo.agent.name,
        version: userInfo.agent.version,
        os: userInfo.agent.os
      }, true);

    } else {
      log.debug([targetMid, 'RTCPeerConnection', null, 'Waiting for peer to start negotiation.']);

      var welcomeMsg = {
        type: self._SIG_MESSAGE_TYPE.WELCOME,
        mid: self._user.sid,
        rid: self._room.id,
        enableIceTrickle: self._initOptions.enableIceTrickle,
        enableDataChannel: self._initOptions.enableDataChannel,
        enableIceRestart: self._enableIceRestart,
        receiveOnly: self.getPeerInfo().config.receiveOnly,
        agent: AdapterJS.webrtcDetectedBrowser,
        version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
        os: window.navigator.platform,
        userInfo: self._getUserInfo(targetMid),
        target: targetMid,
        weight: self._peerPriorityWeight,
        temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
        SMProtocolVersion: self.SM_PROTOCOL_VERSION,
        DTProtocolVersion: self.DT_PROTOCOL_VERSION
      };

      if (self._publishOnly) {
        welcomeMsg.publishOnly = {
          type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
        };
      }

      if (self._parentId) {
        welcomeMsg.parentId = self._parentId;
      }

      self._sendChannelMessage(welcomeMsg);
    }
  };

  if (self._peerConnectionConfig.certificate !== self.PEER_CERTIFICATE.AUTO &&
    typeof RTCPeerConnection.generateCertificate === 'function') {
    var certOptions = {};
    if (self._peerConnectionConfig.certificate === self.PEER_CERTIFICATE.ECDSA) {
      certOptions = {
        name: 'ECDSA',
        namedCurve: 'P-256'
      };
    } else {
      certOptions = {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      };
    }
    RTCPeerConnection.generateCertificate(certOptions).then(function (cert) {
      processPeerFn(cert);
    }, function () {
      processPeerFn();
    });
  } else {
    processPeerFn();
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
    var userInfo = message.userInfo || {};

    self._peerInformations[targetMid].settings = userInfo.settings || {};
    self._peerInformations[targetMid].mediaStatus = userInfo.mediaStatus || {};
    self._peerInformations[targetMid].userData = userInfo.userData;
  }

  log.log([targetMid, null, message.type, 'Received offer from peer. ' +
    'Session description:'], clone(message));

  var offer = {
    type: 'offer',
    sdp: self._hasMCU ? message.sdp.replace(/\r\n/g, '\n').split('\n').join('\r\n') : message.sdp
  };
  log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], offer);

  offer.sdp = self._removeSDPFilteredCandidates(targetMid, offer);
  offer.sdp = self._setSDPCodec(targetMid, offer);
  offer.sdp = self._setSDPBitrate(targetMid, offer);
  offer.sdp = self._setSDPCodecParams(targetMid, offer);
  offer.sdp = self._removeSDPCodecs(targetMid, offer);
  offer.sdp = self._removeSDPREMBPackets(targetMid, offer);
  offer.sdp = self._handleSDPConnectionSettings(targetMid, offer, 'remote');
  offer.sdp = self._removeSDPUnknownAptRtx(targetMid, offer);

  log.log([targetMid, 'RTCSessionDescription', message.type, 'Updated remote offer ->'], offer.sdp);

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

  if (message.userInfo) {
    self._trigger('peerUpdated', targetMid, self.getPeerInfo(targetMid), false);
  }

  self._parseSDPMediaStreamIDs(targetMid, offer);

  var onSuccessCbFn = function() {
    log.debug([targetMid, 'RTCSessionDescription', message.type, 'Remote description set']);
    pc.setOffer = 'remote';
    pc.processingRemoteSDP = false;

    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.OFFER, targetMid);
    self._addIceCandidateFromQueue(targetMid);
    self._doAnswer(targetMid);
  };

  var onErrorCbFn = function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingRemoteSDP = false;

    log.error([targetMid, null, message.type, 'Failed setting remote description:'], {
      error: error,
      state: pc.signalingState,
      offer: offer
    });
  };

  pc.setRemoteDescription(new RTCSessionDescription(offer), onSuccessCbFn, onErrorCbFn);
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

  if (!message.candidate && !message.id) {
    log.warn([targetMid, 'RTCIceCandidate', null, 'Received invalid ICE candidate message ->'], message);
    return;
  }

  var canId = 'can-' + (new Date()).getTime();
  var candidateType = message.candidate.split(' ')[7] || '';
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: message.label,
    candidate: message.candidate,
    sdpMid: message.id
  });

  log.debug([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Received ICE candidate ->'], candidate);

  this._peerEndOfCandidatesCounter[targetMid] = this._peerEndOfCandidatesCounter[targetMid] || {};
  this._peerEndOfCandidatesCounter[targetMid].len = this._peerEndOfCandidatesCounter[targetMid].len || 0;
  this._peerEndOfCandidatesCounter[targetMid].hasSet = false;
  this._peerEndOfCandidatesCounter[targetMid].len++;

  this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.RECEIVED,
    targetMid, canId, candidateType, {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex
  }, null);

  if (!(this._peerConnections[targetMid] &&
    this._peerConnections[targetMid].signalingState !== this.PEER_CONNECTION_STATE.CLOSED)) {
    log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Dropping ICE candidate ' +
      'as Peer connection does not exists or is closed']);
    this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.DROPPED,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, new Error('Failed processing ICE candidate as Peer connection does not exists or is closed.'));
    this._signalingEndOfCandidates(targetMid);
    return;
  }

  if (this._initOptions.filterCandidatesType[candidateType]) {
    if (!(this._hasMCU && this._initOptions.forceTURN)) {
      log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Dropping received ICE candidate as ' +
        'it matches ICE candidate filtering flag ->'], candidate);
      this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.DROPPED,
        targetMid, canId, candidateType, {
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex
      }, new Error('Dropping of processing ICE candidate as it matches ICE candidate filtering flag.'));
      this._signalingEndOfCandidates(targetMid);
      return;
    }

    log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Not dropping received ICE candidate as ' +
      'TURN connections are enforced as MCU is present (and act as a TURN itself) so filtering of ICE candidate ' +
      'flags are not honoured ->'], candidate);
  }

  if (this._peerConnections[targetMid].remoteDescription && this._peerConnections[targetMid].remoteDescription.sdp &&
    this._peerConnections[targetMid].localDescription && this._peerConnections[targetMid].localDescription.sdp) {
    this._addIceCandidate(targetMid, canId, candidate);
  } else {
    this._addIceCandidateToQueue(targetMid, canId, candidate);
  }

  this._signalingEndOfCandidates(targetMid);

  if (!this._gatheredCandidates[targetMid]) {
    this._gatheredCandidates[targetMid] = {
      sending: { host: [], srflx: [], relay: [] },
      receiving: { host: [], srflx: [], relay: [] }
    };
  }

  this._gatheredCandidates[targetMid].receiving[candidateType].push({
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
    'Received answer from peer. Session description:'], clone(message));

  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for answer']);
    return;
  }

  // Add-on by Web SDK fixes
  if (message.userInfo && typeof message.userInfo === 'object') {
    var userInfo = message.userInfo || {};

    self._peerInformations[targetMid].settings = userInfo.settings || {};
    self._peerInformations[targetMid].mediaStatus = userInfo.mediaStatus || {};
    self._peerInformations[targetMid].userData = userInfo.userData;
  }

  var answer = {
    type: 'answer',
    sdp: self._hasMCU ? message.sdp.replace(/\r\n/g, '\n').split('\n').join('\r\n') : message.sdp
  };

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

  answer.sdp = self._removeSDPFilteredCandidates(targetMid, answer);
  answer.sdp = self._setSDPCodec(targetMid, answer);
  answer.sdp = self._setSDPBitrate(targetMid, answer);
  answer.sdp = self._setSDPCodecParams(targetMid, answer);
  answer.sdp = self._removeSDPCodecs(targetMid, answer);
  answer.sdp = self._removeSDPREMBPackets(targetMid, answer);
  answer.sdp = self._handleSDPConnectionSettings(targetMid, answer, 'remote');
  answer.sdp = self._removeSDPUnknownAptRtx(targetMid, answer);

  log.log([targetMid, 'RTCSessionDescription', message.type, 'Updated remote answer ->'], answer.sdp);


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

  if (message.userInfo) {
    self._trigger('peerUpdated', targetMid, self.getPeerInfo(targetMid), false);
  }

  self._parseSDPMediaStreamIDs(targetMid, answer);

  function changeSDPFormat(sdp){
    if(sdp.indexOf("m=video")>sdp.indexOf("m=audio")){
      var sIndex = sdp.indexOf("m=video");
      var eIndex = sdp.lastIndexOf("m=");
      var mVideoLineStr = sdp.substring(sIndex,eIndex)+"m=audio";
      sdp = sdp.replace(sdp.substring(sIndex, eIndex), "");
      sdp = sdp.replace("m=audio", mVideoLineStr);
    }
    return sdp;
  }

  if (self._hasMCU && targetMid !== 'MCU'
    && AdapterJS.webrtcDetectedBrowser === 'firefox'
    && AdapterJS.webrtcDetectedVersion >= 59) {
    answer.sdp = changeSDPFormat(answer.sdp);
  }

  var onSuccessCbFn = function() {
    log.debug([targetMid, null, message.type, 'Remote description set']);
    pc.setAnswer = 'remote';
    pc.processingRemoteSDP = false;

    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ANSWER, targetMid);
    self._addIceCandidateFromQueue(targetMid);

    if (self._peerMessagesStamps[targetMid]) {
      self._peerMessagesStamps[targetMid].hasRestart = false;
    }

    if (self._dataChannels[targetMid] && (pc.remoteDescription.sdp.indexOf('m=application') === -1 ||
      pc.remoteDescription.sdp.indexOf('m=application 0') > 0)) {
      log.warn([targetMid, 'RTCPeerConnection', null, 'Closing all datachannels as they were rejected.']);
      self._closeDataChannel(targetMid);
    }
  };

  var onErrorCbFn = function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingRemoteSDP = false;

    log.error([targetMid, null, message.type, 'Failed setting remote description:'], {
      error: error,
      state: pc.signalingState,
      answer: answer
    });
  };

  pc.setRemoteDescription(new RTCSessionDescription(answer), onSuccessCbFn, onErrorCbFn);
};

/**
 * Function that compares the SM / DT protocol versions to see if it in the version.
 * @method _isLowerThanVersion
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._isLowerThanVersion = function (agentVer, requiredVer) {
  var partsA = (agentVer || '').split('.');
  var partsB = (requiredVer || '').split('.');

  for (var i = 0; i < partsB.length; i++) {
    if ((partsA[i] || '0') < (partsB[i] || '0')) {
      return true;
    }
  }

  return false;
};

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

  /*if (window.location.protocol !== 'https:' && AdapterJS.webrtcDetectedBrowser === 'chrome' &&
    AdapterJS.webrtcDetectedVersion > 46) {
    errorMsg = 'getUserMedia() has to be called in https:// application';
    log.error(errorMsg, options);
    if (typeof callback === 'function') {
      callback(new Error(errorMsg), null);
    }
    return;
  }*/

  self._throttle(function (runFn) {
    if (!runFn) {
      if (self._initOptions.throttlingShouldThrowError) {
        var throttleLimitError = 'Unable to run as throttle interval has not reached (' + self._initOptions.throttleIntervals.getUserMedia + 'ms).';
        log.error(throttleLimitError);

        if (typeof callback === 'function') {
          callback(new Error(throttleLimitError), null);
        }
      }
      return;
    }

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

    var onSuccessCbFn = function (stream) {
      if (settings.mutedSettings.shouldAudioMuted) {
        self._streamsMutedSettings.audioMuted = true;
      }

      if (settings.mutedSettings.shouldVideoMuted) {
        self._streamsMutedSettings.videoMuted = true;
      }

      self._onStreamAccessSuccess(stream, settings, false, false);
    };

    var onErrorCbFn = function (error) {
      self._onStreamAccessError(error, settings, false, false);
    };

    try {
      if (typeof (AdapterJS || {}).webRTCReady !== 'function') {
        return onErrorCbFn(new Error('Failed to call getUserMedia() as AdapterJS is not yet loaded!'));
      }

      AdapterJS.webRTCReady(function () {
        navigator.getUserMedia(settings.getUserMediaSettings, onSuccessCbFn, onErrorCbFn);
      });
    } catch (error) {
      onErrorCbFn(error);
    }

  }, 'getUserMedia', self._initOptions.throttleIntervals.getUserMedia);
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
 *   // Example 1: Send MediaStream object before being connected to Room
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
 *   // Example 2: Send video after being connected to Room
 *   function sendVideo () {
 *     skylinkDemo.joinRoom(function (jRError, jRSuccess) {
 *       if (jRError) return;
 *       skylinkDemo.sendStream({
 *         audio: true,
 *         video: true
 *       }, function (error, success) {
 *         if (error) return;
 *         console.log("getUserMedia() Stream with video is now being sent to Peers");
 *         attachMediaStream(document.getElementById("my-video"), success);
 *       });
 *     });
 *   }
 * @trigger <ol class="desc-seq">
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
 *   <li>If there is currently no <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> and User is in Room: <ol>
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
        self._trigger('incomingStream', self._user.sid, stream, true, self.getPeerInfo(), false, stream.id || stream.label);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      }

      if (Object.keys(self._peerConnections).length > 0 || self._hasMCU) {
        self._refreshPeerConnection(Object.keys(self._peerConnections), false, {}, function (err, success) {
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
    } else if (typeof callback === 'function') {
      callback(null, stream);
    }
  };

  // Note: Sometimes it may be "function" or "object" but then "function" might be mistaken for callback function, so for now fixing it that way
  if ((typeof options !== 'object' || options === null) && !(AdapterJS && AdapterJS.WebRTCPlugin &&
    AdapterJS.WebRTCPlugin.plugin && ['function', 'object'].indexOf(typeof options) > -1)) {
    var invalidOptionsError = 'Provided stream settings is invalid';
    log.error(invalidOptionsError, options);
    if (typeof callback === 'function'){
      callback(new Error(invalidOptionsError),null);
    }
    return;
  }

  if (!self._inRoom) {
    log.warn('There are no peers to send stream to as not in room!');
  }

  if (AdapterJS.webrtcDetectedBrowser === 'edge') {
    var edgeNotSupportError = 'Edge browser currently does not support renegotiation.';
    log.error(edgeNotSupportError, options);
    if (typeof callback === 'function'){
      callback(new Error(edgeNotSupportError),null);
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
 * @param {Boolean} [options.videoMuted=true] The flag if all Strea.ms video
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
 * <blockquote class="info">
 *   For a better user experience, the functionality is throttled when invoked many times in less
 *   than the milliseconds interval configured in the <a href="#method_init"><code>init()</code> method</a>.
 *   Note that the Opera and Edge browser does not support screensharing, and as for IE / Safari browsers using
 *   the Temasys Plugin screensharing support, check out the <a href="https://temasys.com.sg/plugin/#commercial-licensing">
 *   commercial licensing</a> for more options.
 * </blockquote>
 * Function that retrieves screensharing Stream.
 * @method shareScreen
 * @param {JSON|Boolean} [enableAudio=false] The flag if audio tracks should be retrieved.
 * @param {Boolean} [enableAudio.stereo=false] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Configure this with the <code>options.codecParams.audio.opus.stereo</code> and
 *   the <code>options.codecParams.audio.opus["sprop-stereo"]</code>
 *   parameter in the <a href="#method_init"><code>init()</code> method</a> instead. If the
 *   <code>options.codecParams.audio.opus.stereo</code> or <code>options.codecParams.audio.opus["sprop-stereo"]</code>
 *   is configured, this overrides the <code>options.audio.stereo</code> setting.</blockquote>
 *   The flag if OPUS audio codec stereo band should be configured for sending encoded audio data.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [enableAudio.usedtx] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Configure this with the <code>options.codecParams.audio.opus.stereo</code>
 *   parameter in the <a href="#method_init"><code>init()</code> method</a> instead. If the
 *   <code>options.codecParams.audio.opus.stereo</code> is configured, this overrides the
 *   <code>options.audio.stereo</code> setting.  Note that this feature might
 *   not work depending on the browser support and implementation.</blockquote>
 *   The flag if OPUS audio codec should enable DTX (Discontinuous Transmission) for sending encoded audio data.
 *   <small>This might help to reduce bandwidth as it reduces the bitrate during silence or background noise, and
 *   goes hand-in-hand with the <code>options.voiceActivityDetection</code> flag in <a href="#method_joinRoom">
 *   <code>joinRoom()</code> method</a>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [enableAudio.useinbandfec] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Configure this with the <code>options.codecParams.audio.opus.useinbandfec</code>
 *   parameter in the <a href="#method_init"><code>init()</code> method</a> instead. If the
 *   <code>options.codecParams.audio.opus.useinbandfec</code> is configured, this overrides the
 *   <code>options.audio.useinbandfec</code> setting. Note that this parameter should only be used
 *   for debugging purposes only.</blockquote>
 *   The flag if OPUS audio codec has the capability to take advantage of the in-band FEC
 *   (Forward Error Correction) when sending encoded audio data.
 *   <small>This helps to reduce the harm of packet loss by encoding information about the previous packet loss.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [enableAudio.maxplaybackrate] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Configure this with the <code>options.codecParams.audio.opus.maxplaybackrate</code>
 *   parameter in the <a href="#method_init"><code>init()</code> method</a> instead. If the
 *   <code>options.codecParams.audio.opus.maxplaybackrate</code> is configured, this overrides the
 *   <code>options.audio.maxplaybackrate</code> setting.  Note that this feature might
 *   not work depending on the browser support and implementation.
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The OPUS audio codec maximum output sampling rate in Hz (hertz) that is is capable of receiving
 *   decoded audio data, to adjust to the hardware limitations and ensure that any sending audio data
 *   would not encode at a higher sampling rate specified by this.
 *   <small>This value must be between <code>8000</code> to <code>48000</code>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [enableAudio.echoCancellation=true] <blockquote class="info">
 *   For Chrome/Opera/IE/Safari/Bowser, the echo cancellation functionality may not work and may produce a terrible
 *   feedback. It is recommended to use headphones or other microphone devices rather than the device
 *   in-built microphones.</blockquote> The flag to enable echo cancellation for audio track.
 *   <small>Note that this will not be toggled for Chrome/Opera case when `mediaSource` value is `["tab","audio"]`.</small>
 * @param {String|Array|JSON} [mediaSource=screen] The screensharing media source to select.
 *   <small>Note that multiple sources are not supported by Firefox as of the time of this release.
 *   Firefox will use the first item specified in the Array in the event that multiple sources are defined.</small>
 *   <small>E.g. <code>["screen", "window"]</code>, <code>["tab", "audio"]</code>, <code>"screen"</code> or <code>"tab"</code>
 *   or <code>{ sourceId: "xxxxx", mediaSource: "screen" }</code>.</small>
 *   [Rel: Skylink.MEDIA_SOURCE]
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
 * 
 *   // Example 3: Share "window" media source
 *   skylinkDemo.shareScreen("window", function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 * 
 *   // Example 4: Share tab and its audio media source
 *   skylinkDemo.shareScreen(true, ["tab", "audio"], function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 * 
 *   // Example 5: Share "window" and "screen" media source
 *   skylinkDemo.shareScreen(["window", "screen"], function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 * 
 *   // Example 6: Share "window" with specific media source for specific plugin build users.
 *   skylinkDemo.shareScreen({ mediaSource: "window", sourceId: "xxxxx" }, function (error, success) {
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
Skylink.prototype.shareScreen = function (enableAudio, mediaSource, callback) {
  var self = this;
  var enableAudioSettings = false;
  var useMediaSource = [self.MEDIA_SOURCE.SCREEN];
  var useMediaSourceId = null;
  var checkIfSourceExistsFn = function (val) {
    for (var prop in self.MEDIA_SOURCE) {
      if (self.MEDIA_SOURCE.hasOwnProperty(prop) && self.MEDIA_SOURCE[prop] === val) {
        return true;
      }
    }
    return false;
  };

  // shareScreen("screen") or shareScreen({ sourceId: "xxxx", mediaSource: "xxxxx" })
  if (enableAudio && typeof enableAudio === 'string' ||
    (enableAudio && typeof enableAudio === 'object' && enableAudio.sourceId && enableAudio.mediaSource)) {
    if (checkIfSourceExistsFn(typeof enableAudio === 'object' ? enableAudio.mediaSource : enableAudio)) {
      useMediaSource = [typeof enableAudio === 'object' ? enableAudio.mediaSource : enableAudio];
    }
    useMediaSourceId = typeof enableAudio === 'object' ? enableAudio.sourceId : null;
  // shareScreen(["screen", "window"])
  } else if (Array.isArray(enableAudio)) {
    var enableAudioArr = [];

    for (var i = 0; i < enableAudio.length; i++) {
      if (checkIfSourceExistsFn(enableAudio[i])) {
        enableAudioArr.push(enableAudio[i]);
      }
    }

    if (enableAudioArr.length > 0) {
      useMediaSource = enableAudioArr;
    }
  // shareScreen({ stereo: true })
  } else if (enableAudio && typeof enableAudio === 'object') {
    if (enableAudio.sourceId && enableAudio.mediaSource) {

    } else {
      enableAudioSettings = {
        usedtx: typeof enableAudio.usedtx === 'boolean' ? enableAudio.usedtx : null,
        useinbandfec: typeof enableAudio.useinbandfec === 'boolean' ? enableAudio.useinbandfec : null,
        stereo: enableAudio.stereo === true,
        echoCancellation: enableAudio.echoCancellation !== false,
        deviceId: enableAudio.deviceId
      };
    }
  // shareScreen(true)
  } else if (enableAudio === true) {
    enableAudioSettings = enableAudio === true ? {
      usedtx: null,
      useinbandfec: null,
      stereo: false,
      echoCancellation: true,
      deviceId: null
    } : false;
  // shareScreen(function () {})
  } else if (typeof enableAudio === 'function') {
    callback = enableAudio;
    enableAudio = false;
  }

  // shareScreen(.., "screen") or shareScreen({ sourceId: "xxxx", mediaSource: "xxxxx" })
  if (mediaSource && typeof mediaSource === 'string' ||
    (mediaSource && typeof mediaSource === 'object' && mediaSource.sourceId && mediaSource.mediaSource)) {
    if (checkIfSourceExistsFn(typeof mediaSource === 'object' ? mediaSource.mediaSource : mediaSource)) {
      useMediaSource = [typeof mediaSource === 'object' ? mediaSource.mediaSource : mediaSource];
    }
    useMediaSourceId = typeof mediaSource === 'object' ? mediaSource.sourceId : null;
  // shareScreen(.., ["screen", "window"])
  } else if (Array.isArray(mediaSource)) {
    var mediaSourceArr = [];
    for (var i = 0; i < mediaSource.length; i++) {
      if (checkIfSourceExistsFn(mediaSource[i])) {
        mediaSourceArr.push(mediaSource[i]);
      }
    }
    if (mediaSourceArr.length > 0) {
      useMediaSource = mediaSourceArr;
    }
  // shareScreen(.., function () {})
  } else if (typeof mediaSource === 'function') {
    callback = mediaSource;
  }

  if (useMediaSource.indexOf('audio') > -1 && useMediaSource.indexOf('tab') === -1) {
    useMediaSource.splice(useMediaSource.indexOf('audio'), 1);
    if (useMediaSource.length === 0) {
      useMediaSource = [self.MEDIA_SOURCE.SCREEN];
    }
  }

  self._throttle(function (runFn) {
    if (!runFn) {
      if (self._initOptions.throttlingShouldThrowError) {
        var throttleLimitError = 'Unable to run as throttle interval has not reached (' + self._initOptions.throttleIntervals.shareScreen + 'ms).';
        log.error(throttleLimitError);

        if (typeof callback === 'function') {
          callback(new Error(throttleLimitError), null);
        }
      }
      return;
    }

    var settings = {
      settings: {
        audio: enableAudioSettings,
        video: {
          screenshare: true,
          exactConstraints: false
        }
      },
      getUserMediaSettings: {
        audio: false,
        video: {
          mediaSource: useMediaSource
        }
      }
    };

    if (AdapterJS.webrtcDetectedType === 'plugin' && useMediaSourceId) {
      settings.getUserMediaSettings.video.optional = [{
        screenId: useMediaSourceId
      }];
    }

    var mediaAccessSuccessFn = function (stream) {
      self.off('mediaAccessError', mediaAccessErrorFn);

      if (self._inRoom) {
        self._trigger('incomingStream', self._user.sid, stream, true, self.getPeerInfo(), true, stream.id || stream.label);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);

        if (Object.keys(self._peerConnections).length > 0 || self._hasMCU) {
          self._refreshPeerConnection(Object.keys(self._peerConnections), false, {}, function (err, success) {
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

    var getUserMediaAudioSettings = enableAudioSettings ? {
      echoCancellation: enableAudioSettings.echoCancellation
    } : false;

    try {
      var hasDefaultAudioTrack = false;
      if (enableAudioSettings) {
        if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
          hasDefaultAudioTrack = true;
          settings.getUserMediaSettings.audio = getUserMediaAudioSettings;
        } else if (useMediaSource.indexOf('audio') > -1 && useMediaSource.indexOf('tab') > -1) {
          hasDefaultAudioTrack = true;
          settings.getUserMediaSettings.audio = {};
        }
      }

      var onSuccessCbFn = function (stream) {
        if (hasDefaultAudioTrack || !enableAudioSettings) {
          self._onStreamAccessSuccess(stream, settings, true, false);
          return;
        }

        settings.getUserMediaSettings.audio = getUserMediaAudioSettings;

        var onAudioSuccessCbFn = function (audioStream) {
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
        };

        var onAudioErrorCbFn = function (error) {
          log.error('Failed retrieving audio stream for screensharing stream', error);
          self._onStreamAccessSuccess(stream, settings, true, false);
        };

        navigator.getUserMedia({ audio: getUserMediaAudioSettings }, onAudioSuccessCbFn, onAudioErrorCbFn);
      };

      var onErrorCbFn = function (error) {
        self._onStreamAccessError(error, settings, true, false);
      };

      if (typeof (AdapterJS || {}).webRTCReady !== 'function') {
        return onErrorCbFn(new Error('Failed to call getUserMedia() as AdapterJS is not yet loaded!'));
      }

      AdapterJS.webRTCReady(function () {
        navigator.getUserMedia(settings.getUserMediaSettings, onSuccessCbFn, onErrorCbFn);
      });
    } catch (error) {
      self._onStreamAccessError(error, settings, true, false);
    }
  }, 'shareScreen', self._initOptions.throttleIntervals.shareScreen);
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
        this._trigger('incomingStream', this._user.sid, this._streams.userMedia.stream, true, this.getPeerInfo(),
          false, this._streams.userMedia.stream.id || this._streams.userMedia.stream.label);
        this._trigger('peerUpdated', this._user.sid, this.getPeerInfo(), true);
      }
      this._refreshPeerConnection(Object.keys(this._peerConnections), {}, false);
    }
  }
};

/**
 * Function that returns the camera and microphone sources.
 * @method getStreamSources
 * @param {Function} callback The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (success)</code></small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Object signature is the list of sources.</small>
 * @param {JSON} callback.success.audio The list of audio input (microphone) and output (speakers) sources.
 * @param {Array} callback.success.audio.input The list of audio input (microphone) sources.
 * @param {JSON} callback.success.audio.input.#index The audio input source item.
 * @param {String} callback.success.audio.input.#index.deviceId The audio input source item device ID.
 * @param {String} callback.success.audio.input.#index.label The audio input source item device label name.
 * @param {String} [callback.success.audio.input.#index.groupId] The audio input source item device physical device ID.
 * <small>Note that there can be different <code>deviceId</code> due to differing sources but can share a
 * <code>groupId</code> because it's the same device.</small>
 * @param {Array} callback.success.audio.output The list of audio output (speakers) sources.
 * @param {JSON} callback.success.audio.output.#index The audio output source item.
 * <small>Object signature matches <code>callback.success.audio.input.#index</code> format.</small>
 * @param {JSON} callback.success.video The list of video input (camera) sources.
 * @param {Array} callback.success.video.input The list of video input (camera) sources.
 * @param {JSON} callback.success.video.input.#index The video input source item.
 * <small>Object signature matches <code>callback.success.audio.input.#index</code> format.</small>
 * @example
 *   // Example 1: Retrieve the getUserMedia() stream with selected source ID.
 *   skylinkDemo.getStreamSources(function (sources) {
 *     skylinkDemo.getUserMedia({
 *       audio: sources.audio.input[0].deviceId,
 *       video: sources.video.input[0].deviceId
 *     });
 *   });
 *   
 *   // Example 2: Set the output audio speaker (Chrome 49+ supported only)
 *   skylinkDemo.getStreamSources(function (sources) {
 *     var videoElement = document.getElementById('video');
 *     if (videoElement && typeof videoElement.setSinkId === 'function') {
 *       videoElement.setSinkId(sources.audio.output[0].deviceId)
 *     }
 *   });
 * @for Skylink
 * @since 0.6.27
 */
Skylink.prototype.getStreamSources = function(callback) {
  var outputSources = {
    audio: {
      input: [],
      output: []
    },
    video: {
      input: []
    }
  };

  if (typeof callback !== 'function') {
    return log.error('Please provide the callback.');
  }

  var sourcesListFn = function (sources) {
    sources.forEach(function (sourceItem) {
      var item = {
        deviceId: sourceItem.deviceId || sourceItem.sourceId || 'default',
        label: sourceItem.label,
        groupId: sourceItem.groupId || null
      };

      item.label = item.label || 'Source for ' + item.deviceId;

      if (['audio', 'audioinput'].indexOf(sourceItem.kind) > -1) {
        outputSources.audio.input.push(item);
      } else if (['video', 'videoinput'].indexOf(sourceItem.kind) > -1) {
        outputSources.video.input.push(item);
      } else if (sourceItem.kind === 'audiooutput') {
        outputSources.audio.output.push(item);
      }
    });

    callback(outputSources);
  };

  if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
    navigator.mediaDevices.enumerateDevices().then(sourcesListFn);
  } else if (window.MediaStreamTrack && typeof MediaStreamTrack.getSources === 'function') {
    MediaStreamTrack.getSources(sourcesListFn);
  } else if (typeof navigator.getUserMedia === 'function') {
    sourcesListFn([
      { deviceId: 'default', kind: 'audioinput', label: 'Default Audio Track' },
      { deviceId: 'default', kind: 'videoinput', label: 'Default Video Track' }
    ]);
  } else {
    sourcesListFn([]);
  }
};

/**
 * Function that returns the screensharing sources.
 * @method getScreenSources
 * @param {Function} callback The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (success)</code></small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Object signature is the list of sources.</small>
 * @param {JSON} callback.success The list of screensharing media sources and screen sources.
 * @param {Array} callback.success.mediaSource The array of screensharing media sources.
 * @param {String} callback.success.mediaSource.#index The screensharing media source item.
 * [Rel: Skylink.MEDIA_SOURCE]
 * @param {Array} callback.success.mediaSourceInput The list of specific media source screen inputs.
 * @param {JSON} callback.success.mediaSourceInput.#index The media source screen input item.
 * @param {String} callback.success.mediaSourceInput.#index.sourceId The screen input item ID.
 * @param {String} callback.success.mediaSourceInput.#index.label The screen input item label name.
 * @param {String} callback.success.mediaSourceInput.#index.mediaSource The screen input item media source it belongs to.
 * [Rel: Skylink.MEDIA_SOURCE]
 * @example
 *   // Example 1: Retrieve the list of available shareScreen() sources.
 *   skylinkDemo.getScreenSources(function (sources) {
 *     skylinkDemo.shareScreen(sources.mediaSource[0] || null);
 *   });
 *   
 *   // Example 2: Retrieve the list of available shareScreen() sources with a specific item.
 *   skylinkDemo.getScreenSources(function (sources) {
 *     if (sources.mediaSourceInput[0]) {
 *       skylinkDemo.shareScreen({
 *         mediaSource: mediaSourceInput[0].mediaSource,
 *         sourceId: mediaSourceInput[0].sourceId
 *       });
 *     } else {
 *       skylinkDemo.shareScreen();
 *     }
 *   });
 * @for Skylink
 * @since 0.6.27
 */
Skylink.prototype.getScreenSources = function(callback) {
  var outputSources = {
    mediaSource: [],
    mediaSourceInput: []
  };

  if (typeof callback !== 'function') {
    return log.error('Please provide the callback.');
  }

  // For chrome android 59+ has screensharing support behind chrome://flags (needs to be enabled by user)
  // Reference: https://bugs.chromium.org/p/chromium/issues/detail?id=487935
  if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
    if (AdapterJS.webrtcDetectedBrowser === 'chrome' && AdapterJS.webrtcDetectedVersion >= 59) {
      outputSources.mediaSource = ['screen']; 
    }
    callback(outputSources);
    return;
  }

  // IE / Safari (plugin) needs commerical screensharing enabled
  if (AdapterJS.webrtcDetectedType === 'plugin') {
    AdapterJS.webRTCReady(function () {
      // IE / Safari (plugin) is not available or do not support screensharing
      if (AdapterJS.WebRTCPlugin.plugin && AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable &&
        AdapterJS.WebRTCPlugin.plugin.HasScreensharingFeature) {
        outputSources.mediaSource = ['window', 'screen'];

        // Do not provide the error callback as well or it will throw NPError.
        if (typeof AdapterJS.WebRTCPlugin.plugin.getScreensharingSources === 'function') {
          AdapterJS.WebRTCPlugin.plugin.getScreensharingSources(function (sources) {
            sources.forEach(sources, function (sourceItem) {
              var item = {
                sourceId: sourceItem.id || sourceItem.sourceId || 'default',
                label: sourceItem.label,
                mediaSource: sourceItem.kind || 'screen'
              };

              item.label = item.label || 'Source for ' + item.sourceId;
              outputSources.mediaSourceInput.push(item);
            });

            callback(outputSources);
          });
          return;
        }
      }
      
      callback(outputSources);
    });
    return;

  // Chrome 34+ and Opera 21(?)+ supports screensharing
  // Firefox 38(?)+ supports screensharing
  } else if ((AdapterJS.webrtcDetectedBrowser === 'chrome' && AdapterJS.webrtcDetectedVersion >= 34) ||
    (AdapterJS.webrtcDetectedBrowser === 'firefox' && AdapterJS.webrtcDetectedVersion >= 38) ||
    (AdapterJS.webrtcDetectedBrowser === 'opera' && AdapterJS.webrtcDetectedVersion >= 21)) {
    // Just warn users for those who did not configure the Opera screensharing extension settings, it will not work!
    if (AdapterJS.webrtcDetectedBrowser === 'opera' && !(AdapterJS.extensionInfo &&
      AdapterJS.extensionInfo.opera && AdapterJS.extensionInfo.opera.extensionId)) {
      log.warn('Please ensure that your application allows Opera screensharing!');
    }

    outputSources.mediaSource = ['window', 'screen'];

    // Chrome 52+ and Opera 39+ supports tab and audio
    // Reference: https://developer.chrome.com/extensions/desktopCapture
    if ((AdapterJS.webrtcDetectedBrowser === 'chrome' && AdapterJS.webrtcDetectedVersion >= 52) ||
      (AdapterJS.webrtcDetectedBrowser === 'opera' && AdapterJS.webrtcDetectedVersion >= 39)) {
      outputSources.mediaSource.push('tab', 'audio');

    // Firefox supports some other sources
    // Reference: http://fluffy.github.io/w3c-screen-share/#screen-based-video-constraints
    //            https://bugzilla.mozilla.org/show_bug.cgi?id=1313758
    //            https://bugzilla.mozilla.org/show_bug.cgi?id=1037405
    //            https://bugzilla.mozilla.org/show_bug.cgi?id=1313758
    } else if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
      outputSources.mediaSource.push('browser', 'camera', 'application');
    }
  }

  callback(outputSources);
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

  if (AdapterJS.webrtcDetectedBrowser === 'edge') {
    for (var peerId in self._peerConnections) {
      if (self._peerConnections.hasOwnProperty(peerId) && self._peerConnections[peerId]) {
        var localStreams = self._peerConnections[peerId].getLocalStreams();
        for (var s = 0; s < localStreams.length; s++) {
          muteFn(localStreams[s]);
        }
      }
    }
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
      delete self._streamsStoppedCbs[streamId];
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
    // For Edge to work since they do not support the advanced constraints yet
    settings.settings.audio = {
      stereo: false,
      exactConstraints: !!options.useExactConstraints,
      echoCancellation: true
    };
    settings.getUserMediaSettings.audio = {
      echoCancellation: true
    };

    if (typeof options.audio === 'object') {
      if (typeof options.audio.stereo === 'boolean') {
        settings.settings.audio.stereo = options.audio.stereo;
      }

      if (typeof options.audio.useinbandfec === 'boolean') {
        settings.settings.audio.useinbandfec = options.audio.useinbandfec;
      }

      if (typeof options.audio.usedtx === 'boolean') {
        settings.settings.audio.usedtx = options.audio.usedtx;
      }

      if (typeof options.audio.maxplaybackrate === 'number' &&
        options.audio.maxplaybackrate >= 8000 && options.audio.maxplaybackrate <= 48000) {
        settings.settings.audio.maxplaybackrate = options.audio.maxplaybackrate;
      }

      if (typeof options.audio.mute === 'boolean') {
        settings.mutedSettings.shouldAudioMuted = options.audio.mute;
      }

      // Not supported in Edge browser features
      if (AdapterJS.webrtcDetectedBrowser !== 'edge') {
        if (typeof options.audio.echoCancellation === 'boolean') {
          settings.settings.audio.echoCancellation = options.audio.echoCancellation;
          settings.getUserMediaSettings.audio.echoCancellation = options.audio.echoCancellation;
        }

        if (Array.isArray(options.audio.optional)) {
          settings.settings.audio.optional = clone(options.audio.optional);
          settings.getUserMediaSettings.audio.optional = clone(options.audio.optional);
        }

        if (options.audio.deviceId && typeof options.audio.deviceId === 'string' &&
          AdapterJS.webrtcDetectedBrowser !== 'firefox') {
          settings.settings.audio.deviceId = options.audio.deviceId;
          settings.getUserMediaSettings.audio.deviceId = options.useExactConstraints ?
            { exact: options.audio.deviceId } : { ideal: options.audio.deviceId };
        }
      }
    }

    if (AdapterJS.webrtcDetectedBrowser === 'edge') {
      settings.getUserMediaSettings.audio = true;
    }
  }

  if (options.video) {
    // For Edge to work since they do not support the advanced constraints yet
    settings.settings.video = {
      resolution: clone(this.VIDEO_RESOLUTION.VGA),
      screenshare: false,
      exactConstraints: !!options.useExactConstraints
    };
    settings.getUserMediaSettings.video = {};

    if (typeof options.video === 'object') {
      if (typeof options.video.mute === 'boolean') {
        settings.mutedSettings.shouldVideoMuted = options.video.mute;
      }

      if (Array.isArray(options.video.optional)) {
        settings.settings.video.optional = clone(options.video.optional);
        settings.getUserMediaSettings.video.optional = clone(options.video.optional);
      }

      if (options.video.deviceId && typeof options.video.deviceId === 'string' &&
        AdapterJS.webrtcDetectedBrowser !== 'firefox') {
        settings.settings.video.deviceId = options.video.deviceId;
        settings.getUserMediaSettings.video.deviceId = options.useExactConstraints ?
          { exact: options.video.deviceId } : { ideal: options.video.deviceId };
      }

      if (options.video.resolution && typeof options.video.resolution === 'object') {
        if ((options.video.resolution.width && typeof options.video.resolution.width === 'object') ||
          typeof options.video.resolution.width === 'number') {
          settings.settings.video.resolution.width = options.video.resolution.width;
        }
        if ((options.video.resolution.height && typeof options.video.resolution.height === 'object') ||
          typeof options.video.resolution.height === 'number') {
          settings.settings.video.resolution.height = options.video.resolution.height;
        }
      }

      settings.getUserMediaSettings.video.width = typeof settings.settings.video.resolution.width === 'object' ?
        settings.settings.video.resolution.width : (options.useExactConstraints ?
        { exact: settings.settings.video.resolution.width } : { max: settings.settings.video.resolution.width });

      settings.getUserMediaSettings.video.height = typeof settings.settings.video.resolution.height === 'object' ?
        settings.settings.video.resolution.height : (options.useExactConstraints ?
        { exact: settings.settings.video.resolution.height } : { max: settings.settings.video.resolution.height });

      if ((options.video.frameRate && typeof options.video.frameRate === 'object') ||
        typeof options.video.frameRate === 'number' && AdapterJS.webrtcDetectedType !== 'plugin') {
        settings.settings.video.frameRate = options.video.frameRate;
        settings.getUserMediaSettings.video.frameRate = typeof settings.settings.video.frameRate === 'object' ?
          settings.settings.video.frameRate : (options.useExactConstraints ?
          { exact: settings.settings.video.frameRate } : { max: settings.settings.video.frameRate });
      }

      if (options.video.facingMode && ['string', 'object'].indexOf(typeof options.video.facingMode) > -1 && AdapterJS.webrtcDetectedType === 'plugin') {
        settings.settings.video.facingMode = options.video.facingMode;
        settings.getUserMediaSettings.video.facingMode = typeof settings.settings.video.facingMode === 'object' ?
          settings.settings.video.facingMode : (options.useExactConstraints ?
          { exact: settings.settings.video.facingMode } : { max: settings.settings.video.facingMode });
      }
    } else {
      settings.getUserMediaSettings.video = {
        width: options.useExactConstraints ? { exact: settings.settings.video.resolution.width } :
          { max: settings.settings.video.resolution.width },
        height: options.useExactConstraints ? { exact: settings.settings.video.resolution.height } :
          { max: settings.settings.video.resolution.height }
      };
    }

    if (AdapterJS.webrtcDetectedBrowser === 'edge') {
      settings.settings.video = {
        screenshare: false,
        exactConstraints: !!options.useExactConstraints
      };
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
  var streamHasEnded = false;

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
    streamHasEnded = true;
    self._trigger('mediaAccessStopped', !!isScreenSharing, !!isAudioFallback, streamId);

    if (self._inRoom) {
      log.debug([null, 'MediaStream', streamId, 'Sending Stream ended status to Peers']);

      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.STREAM,
        mid: self._user.sid,
        rid: self._room.id,
        cid: self._key,
        streamId: streamId,
        settings: settings.settings,
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
  if (['chrome', 'opera'].indexOf(AdapterJS.webrtcDetectedBrowser) > -1) {
    stream.oninactive = function () {
      if (self._streamsStoppedCbs[streamId]) {
        self._streamsStoppedCbs[streamId]();
        delete self._streamsStoppedCbs[streamId];
      }
    };

    if (isScreenSharing && stream.getVideoTracks().length > 0) {
      stream.getVideoTracks()[0].onended = function () {
        setTimeout(function () {
          if (!streamHasEnded && self._inRoom) {
            self.stopScreen();
          }
        }, 350);
      };
    }

  // Handle event for Firefox (use an interval)
  } else if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
    stream.endedInterval = setInterval(function () {
      if (typeof stream.recordedTime === 'undefined') {
        stream.recordedTime = 0;
      }
      if (stream.recordedTime === stream.currentTime) {
        clearInterval(stream.endedInterval);

        if (self._streamsStoppedCbs[streamId]) {
          self._streamsStoppedCbs[streamId]();
          delete self._streamsStoppedCbs[streamId];
        }

      } else {
        stream.recordedTime = stream.currentTime;
      }
    }, 1000);

  } else {
    stream.onended = function () {
      if (self._streamsStoppedCbs[streamId]) {
        self._streamsStoppedCbs[streamId]();
        delete self._streamsStoppedCbs[streamId];
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

  if (!isScreenSharing && settings.settings.audio && settings.settings.video && self._initOptions.audioFallback) {
    log.debug('Fallbacking to retrieve audio only Stream');

    self._trigger('mediaAccessFallback', {
      error: error,
      diff: null
    }, self.MEDIA_ACCESS_FALLBACK_STATE.FALLBACKING, false, true);

    var onAudioSuccessCbFn = function (stream) {
      self._onStreamAccessSuccess(stream, settings, false, true);
    };

    var onAudioErrorCbFn = function (error) {
      log.error('Failed fallbacking to retrieve audio only Stream ->', error);

      self._trigger('mediaAccessError', error, false, true);
      self._trigger('mediaAccessFallback', {
        error: error,
        diff: null
      }, self.MEDIA_ACCESS_FALLBACK_STATE.ERROR, false, true);
    };

    navigator.getUserMedia({ audio: true }, onAudioSuccessCbFn, onAudioErrorCbFn);
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
  var streamId = (self._peerConnections[targetMid] && self._peerConnections[targetMid].remoteStreamId) || stream.id || stream.label;

  if (!self._peerInformations[targetMid]) {
    log.warn([targetMid, 'MediaStream', streamId, 'Received remote stream when peer is not connected. Ignoring stream ->'], stream);
    return;
  }

  /*if (!self._peerInformations[targetMid].settings.audio &&
    !self._peerInformations[targetMid].settings.video && !isScreenSharing) {
    log.log([targetMid, 'MediaStream', stream.id,
      'Receive remote stream but ignoring stream as it is empty ->'
      ], stream);
    return;
  }*/
  log.log([targetMid, 'MediaStream', streamId, 'Received remote stream ->'], stream);

  if (isScreenSharing) {
    log.log([targetMid, 'MediaStream', streamId, 'Peer is having a screensharing session with user']);
  }

  self._trigger('incomingStream', targetMid, stream, false, self.getPeerInfo(targetMid), isScreenSharing, streamId);
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
      var offerToReceiveAudio = !(!self._sdpSettings.connection.audio && peerId !== 'MCU') &&
        self._getSDPCommonSupports(peerId, pc.remoteDescription).video;
      var offerToReceiveVideo = !(!self._sdpSettings.connection.video && peerId !== 'MCU') &&
        self._getSDPCommonSupports(peerId, pc.remoteDescription).audio;

      if (pc.signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
        // Updates the streams accordingly
        var updateStreamFn = function (updatedStream) {
          if (updatedStream ? (pc.localStreamId ? updatedStream.id !== pc.localStreamId : true) : true) {
            if (AdapterJS.webrtcDetectedBrowser === 'edge' && !(self._initOptions.useEdgeWebRTC && window.msRTCPeerConnection)) {
              pc.getSenders().forEach(function (sender) {
                pc.removeTrack(sender);
              });
            } else {
              pc.getLocalStreams().forEach(function (stream) {
                pc.removeStream(stream);
              });
            }

            if (!offerToReceiveAudio && !offerToReceiveVideo) {
              return;
            }

            if (updatedStream) {
              if (AdapterJS.webrtcDetectedBrowser === 'edge' && !(self._initOptions.useEdgeWebRTC && window.msRTCPeerConnection)) {
                updatedStream.getTracks().forEach(function (track) {
                  if ((track.kind === 'audio' && !offerToReceiveAudio) || (track.kind === 'video' && !offerToReceiveVideo)) {
                    return;
                  }
                  pc.addTrack(track, updatedStream);
                });
              } else {
                pc.addStream(updatedStream);
              }

              pc.localStreamId = updatedStream.id || updatedStream.label;
              pc.localStream = updatedStream;
            }
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
};

/**
 * Function that handles ended streams.
 * @method _handleEndedStreams
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._handleEndedStreams = function (peerId, checkStreamId) {
  var self = this;
  self._streamsSession[peerId] = self._streamsSession[peerId] || {};

  var renderEndedFn = function (streamId) {
    if (self._streamsSession[peerId][streamId]) {
      var peerInfo = clone(self.getPeerInfo(peerId));
      peerInfo.settings.audio = clone(self._streamsSession[peerId][streamId].audio);
      peerInfo.settings.video = clone(self._streamsSession[peerId][streamId].video);
      var hasScreenshare = peerInfo.settings.video && typeof peerInfo.settings.video === 'object' &&
        !!peerInfo.settings.video.screenshare;
      self._streamsSession[peerId][streamId] = false;
      self._trigger('streamEnded', peerId, peerInfo, false, hasScreenshare, streamId);
    }
  };

  if (checkStreamId) {
    renderEndedFn(checkStreamId);
  } else if (self._peerConnections[peerId]) {
    for (var streamId in self._streamsSession[peerId]) {
      if (self._streamsSession[peerId].hasOwnProperty(streamId) && self._streamsSession[peerId][streamId]) {
        renderEndedFn(streamId);
      }
    }
  }
};
Skylink.prototype._setSDPCodecParams = function(targetMid, sessionDescription) {
  var self = this;

  var parseFn = function (type, codecName, samplingRate, settings) {
    var mLine = sessionDescription.sdp.match(new RegExp('m=' + type + '\ .*\r\n', 'gi'));
    // Find the m= line
    if (Array.isArray(mLine) && mLine.length > 0) {
      var codecsList = sessionDescription.sdp.match(new RegExp('a=rtpmap:.*\ ' + codecName + '\/' +
        (samplingRate ? samplingRate + (type === 'audio' ? '[\/]*.*' : '.*') : '.*') + '\r\n', 'gi'));
      // Get the list of codecs related to it
      if (Array.isArray(codecsList) && codecsList.length > 0) {
        for (var i = 0; i < codecsList.length; i++) {
          var payload = (codecsList[i].split('a=rtpmap:')[1] || '').split(' ')[0];
          if (!payload) {
            continue;
          }
          var fmtpLine = sessionDescription.sdp.match(new RegExp('a=fmtp:' + payload + '\ .*\r\n', 'gi'));
          var updatedFmtpLine = 'a=fmtp:' + payload + ' ';
          var addedKeys = [];
          // Check if a=fmtp: line exists
          if (Array.isArray(fmtpLine) && fmtpLine.length > 0) {
            var fmtpParts = (fmtpLine[0].split('a=fmtp:' + payload + ' ')[1] || '').replace(
              / /g, '').replace(/\r\n/g, '').split(';');
            for (var j = 0; j < fmtpParts.length; j++) {
              if (!fmtpParts[j]) {
                continue;
              }
              var keyAndValue = fmtpParts[j].split('=');
              if (settings.hasOwnProperty(keyAndValue[0])) {
                // Dont append parameter key+value if boolean and false
                updatedFmtpLine += typeof settings[keyAndValue[0]] === 'boolean' ? (settings[keyAndValue[0]] ?
                  keyAndValue[0] + '=1;' : '') : keyAndValue[0] + '=' + settings[keyAndValue[0]] + ';';
              } else {
                updatedFmtpLine += fmtpParts[j] + ';';
              }
              addedKeys.push(keyAndValue[0]);
            }
            sessionDescription.sdp = sessionDescription.sdp.replace(fmtpLine[0], '');
          }
          for (var key in settings) {
            if (settings.hasOwnProperty(key) && addedKeys.indexOf(key) === -1) {
              // Dont append parameter key+value if boolean and false
              updatedFmtpLine += typeof settings[key] === 'boolean' ? (settings[key] ? key + '=1;' : '') :
                key + '=' + settings[key] + ';';
              addedKeys.push(key);
            }
          }
          if (updatedFmtpLine !== 'a=fmtp:' + payload + ' ') {
            sessionDescription.sdp = sessionDescription.sdp.replace(codecsList[i], codecsList[i] + updatedFmtpLine + '\r\n');
          }
        }
      }
    }
  };

  // Set audio codecs -> OPUS
  // RFC: https://tools.ietf.org/html/draft-ietf-payload-rtp-opus-11
  parseFn('audio', self.AUDIO_CODEC.OPUS, 48000, (function () {
    var opusOptions = {};
    var audioSettings = self._streams.screenshare ? self._streams.screenshare.settings.audio :
      (self._streams.userMedia ? self._streams.userMedia.settings.audio : {});
    audioSettings = audioSettings && typeof audioSettings === 'object' ? audioSettings : {};
    if (typeof self._initOptions.codecParams.audio.opus.stereo === 'boolean') {
      opusOptions.stereo = self._initOptions.codecParams.audio.opus.stereo;
    } else if (typeof audioSettings.stereo === 'boolean') {
      opusOptions.stereo = audioSettings.stereo;
    }
    if (typeof self._initOptions.codecParams.audio.opus['sprop-stereo'] === 'boolean') {
      opusOptions['sprop-stereo'] = self._initOptions.codecParams.audio.opus['sprop-stereo'];
    } else if (typeof audioSettings.stereo === 'boolean') {
      opusOptions['sprop-stereo'] = audioSettings.stereo;
    }
    if (typeof self._initOptions.codecParams.audio.opus.usedtx === 'boolean') {
      opusOptions.usedtx = self._initOptions.codecParams.audio.opus.usedtx;
    } else if (typeof audioSettings.usedtx === 'boolean') {
      opusOptions.usedtx = audioSettings.usedtx;
    }
    if (typeof self._initOptions.codecParams.audio.opus.useinbandfec === 'boolean') {
      opusOptions.useinbandfec = self._initOptions.codecParams.audio.opus.useinbandfec;
    } else if (typeof audioSettings.useinbandfec === 'boolean') {
      opusOptions.useinbandfec = audioSettings.useinbandfec;
    }
    if (typeof self._initOptions.codecParams.audio.opus.maxplaybackrate === 'number') {
      opusOptions.maxplaybackrate = self._initOptions.codecParams.audio.opus.maxplaybackrate;
    } else if (typeof audioSettings.maxplaybackrate === 'number') {
      opusOptions.maxplaybackrate = audioSettings.maxplaybackrate;
    }
    if (typeof self._initOptions.codecParams.audio.opus.minptime === 'number') {
      opusOptions.minptime = self._initOptions.codecParams.audio.opus.minptime;
    } else if (typeof audioSettings.minptime === 'number') {
      opusOptions.minptime = audioSettings.minptime;
    }
    // Possible future params: sprop-maxcapturerate, maxaveragebitrate, sprop-stereo, cbr
    // NOT recommended: maxptime, ptime, rate, minptime
    return opusOptions;
  })());

  // RFC: https://tools.ietf.org/html/rfc4733
  // Future: Set telephone-event: 100 0-15,66,70

  // RFC: https://tools.ietf.org/html/draft-ietf-payload-vp8-17
  // Set video codecs -> VP8
  parseFn('video', self.VIDEO_CODEC.VP8, null, (function () {
    var vp8Options = {};
    // NOT recommended: max-fr, max-fs (all are codec decoder capabilities)
    if (typeof self._initOptions.codecParams.video.vp8.maxFr === 'number') {
      vp8Options['max-fr'] = self._initOptions.codecParams.video.vp8.maxFr;
    }
    if (typeof self._initOptions.codecParams.video.vp8.maxFs === 'number') {
      vp8Options['max-fs'] = self._initOptions.codecParams.video.vp8.maxFs;
    }
    return vp8Options;
  })());

  // RFC: https://tools.ietf.org/html/draft-ietf-payload-vp9-02
  // Set video codecs -> VP9
  parseFn('video', self.VIDEO_CODEC.VP9, null, (function () {
    var vp9Options = {};
    // NOT recommended: max-fr, max-fs (all are codec decoder capabilities)
    if (typeof self._initOptions.codecParams.video.vp9.maxFr === 'number') {
      vp9Options['max-fr'] = self._initOptions.codecParams.video.vp9.maxFr;
    }
    if (typeof self._initOptions.codecParams.video.vp9.maxFs === 'number') {
      vp9Options['max-fs'] = self._initOptions.codecParams.video.vp9.maxFs;
    }
    return vp9Options;
  })());

  // RFC: https://tools.ietf.org/html/rfc6184
  // Set the video codecs -> H264
  parseFn('video', self.VIDEO_CODEC.H264, null, (function () {
    var h264Options = {};
    if (typeof self._initOptions.codecParams.video.h264.levelAsymmetryAllowed === 'string') {
      h264Options['profile-level-id'] = self._initOptions.codecParams.video.h264.profileLevelId;
    }
    if (typeof self._initOptions.codecParams.video.h264.levelAsymmetryAllowed === 'boolean') {
      h264Options['level-asymmetry-allowed'] = self._initOptions.codecParams.video.h264.levelAsymmetryAllowed;
    }
    if (typeof self._initOptions.codecParams.video.h264.packetizationMode === 'boolean') {
      h264Options['packetization-mode'] = self._initOptions.codecParams.video.h264.packetizationMode;
    }
    // Possible future params (remove if they are decoder/encoder capabilities or info):
    //   max-recv-level, max-mbps, max-smbps, max-fs, max-cpb, max-dpb, max-br,
    //   max-mbps, max-smbps, max-fs, max-cpb, max-dpb, max-br, redundant-pic-cap, sprop-parameter-sets,
    //   sprop-level-parameter-sets, use-level-src-parameter-sets, in-band-parameter-sets,
    //   sprop-interleaving-depth, sprop-deint-buf-req, deint-buf-cap, sprop-init-buf-time,
    //   sprop-max-don-diff, max-rcmd-nalu-size, sar-understood, sar-supported
    //   NOT recommended: profile-level-id (WebRTC uses "42e00a" for the moment)
    //   https://bugs.chromium.org/p/chromium/issues/detail?id=645599
    return h264Options;
  })());

  return sessionDescription.sdp;
};

/**
 * Function that modifies the session description to limit the maximum sending bandwidth.
 * Setting this may not necessarily work in Firefox.
 * @method _setSDPBitrate
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._setSDPBitrate = function(targetMid, sessionDescription) {
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var parseFn = function (type, bw) {
    var mLineType = type;
    var mLineIndex = -1;
    var cLineIndex = -1;

    if (type === 'data') {
      mLineType = 'application';
    }

    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('m=' + mLineType) === 0) {
        mLineIndex = i;
      } else if (mLineIndex > 0) {
        if (sdpLines[i].indexOf('m=') === 0) {
          break;
        }

        if (sdpLines[i].indexOf('c=') === 0) {
          cLineIndex = i;
        // Remove previous b:AS settings
        } else if (sdpLines[i].indexOf('b=AS:') === 0 || sdpLines[i].indexOf('b:TIAS:') === 0) {
          sdpLines.splice(i, 1);
          i--;
        }
      }
    }

    if (!(typeof bw === 'number' && bw > 0)) {
      log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Not limiting "' + type + '" bandwidth']);
      return;
    }

    if (cLineIndex === -1) {
      log.error([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Failed setting "' +
        type + '" bandwidth as c-line is missing.']);
      return;
    }

    // Follow RFC 4566, that the b-line should follow after c-line.
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Limiting maximum sending "' + type + '" bandwidth ->'], bw);
    sdpLines.splice(cLineIndex + 1, 0, window.webrtcDetectedBrowser === 'firefox' ? 'b=TIAS:' + (bw * 1000 *
    (window.webrtcDetectedVersion > 52 && window.webrtcDetectedVersion < 55 ? 1000 : 1)).toFixed(0) : 'b=AS:' + bw);
  };

  var bASAudioBw = this._streamsBandwidthSettings.bAS.audio;
  var bASVideoBw = this._streamsBandwidthSettings.bAS.video;
  var bASDataBw = this._streamsBandwidthSettings.bAS.data;
  var googleXMinBw = this._streamsBandwidthSettings.googleX.min;
  var googleXMaxBw = this._streamsBandwidthSettings.googleX.max;

  if (this._peerCustomConfigs[targetMid]) {
    if (this._peerCustomConfigs[targetMid].bandwidth &&
      typeof this._peerCustomConfigs[targetMid].bandwidth === 'object') {
      if (typeof this._peerCustomConfigs[targetMid].bandwidth.audio === 'number') {
        bASAudioBw = this._peerCustomConfigs[targetMid].bandwidth.audio;
      }
      if (typeof this._peerCustomConfigs[targetMid].bandwidth.video === 'number') {
        bASVideoBw = this._peerCustomConfigs[targetMid].bandwidth.video;
      }
      if (typeof this._peerCustomConfigs[targetMid].bandwidth.data === 'number') {
        bASDataBw = this._peerCustomConfigs[targetMid].bandwidth.data;
      }
    }
    if (this._peerCustomConfigs[targetMid].googleXBandwidth &&
      typeof this._peerCustomConfigs[targetMid].googleXBandwidth === 'object') {
      if (typeof this._peerCustomConfigs[targetMid].googleXBandwidth.min === 'number') {
        googleXMinBw = this._peerCustomConfigs[targetMid].googleXBandwidth.min;
      }
      if (typeof this._peerCustomConfigs[targetMid].googleXBandwidth.max === 'number') {
        googleXMaxBw = this._peerCustomConfigs[targetMid].googleXBandwidth.max;
      }
    }
  }

  parseFn('audio', bASAudioBw);
  parseFn('video', bASVideoBw);
  parseFn('data', bASDataBw);

  // Sets the experimental google bandwidth
  if ((typeof googleXMinBw === 'number') || (typeof googleXMaxBw === 'number')) {
    var codec = null;
    var codecRtpMapLineIndex = -1;
    var codecFmtpLineIndex = -1;

    for (var j = 0; j < sdpLines.length; j++) {
      if (sdpLines[j].indexOf('m=video') === 0) {
        codec = sdpLines[j].split(' ')[3];
      } else if (codec) {
        if (sdpLines[j].indexOf('m=') === 0) {
          break;
        }

        if (sdpLines[j].indexOf('a=rtpmap:' + codec + ' ') === 0) {
          codecRtpMapLineIndex = j;
        } else if (sdpLines[j].indexOf('a=fmtp:' + codec + ' ') === 0) {
          sdpLines[j] = sdpLines[j].replace(/x-google-(min|max)-bitrate=[0-9]*[;]*/gi, '');
          codecFmtpLineIndex = j;
          break;
        }
      }
    }

    if (codecRtpMapLineIndex > -1) {
      var xGoogleParams = '';

      if (typeof googleXMinBw === 'number') {
        xGoogleParams += 'x-google-min-bitrate=' + googleXMinBw + ';';
      }

      if (typeof googleXMaxBw === 'number') {
        xGoogleParams += 'x-google-max-bitrate=' + googleXMaxBw + ';';
      }

      log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Limiting x-google-bitrate ->'], xGoogleParams);

      if (codecFmtpLineIndex > -1) {
        sdpLines[codecFmtpLineIndex] += (sdpLines[codecFmtpLineIndex].split(' ')[1] ? ';' : '') + xGoogleParams;
      } else {
        sdpLines.splice(codecRtpMapLineIndex + 1, 0, 'a=fmtp:' + codec + ' ' + xGoogleParams);
      }
    }
  }

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to set the preferred audio/video codec.
 * @method _setSDPCodec
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._setSDPCodec = function(targetMid, sessionDescription, overrideSettings) {
  var self = this;
  var parseFn = function (type, codecSettings) {
    var codec = typeof codecSettings === 'object' ? codecSettings.codec : codecSettings;
    var samplingRate = typeof codecSettings === 'object' ? codecSettings.samplingRate : null;
    var channels = typeof codecSettings === 'object' ? codecSettings.channels : null;

    if (codec === self[type === 'audio' ? 'AUDIO_CODEC' : 'VIDEO_CODEC'].AUTO) {
      log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not preferring any codec for "' + type + '" streaming. Using browser selection.']);
      return;
    }

    var mLine = sessionDescription.sdp.match(new RegExp('m=' + type + ' .*\r\n', 'gi'));

    if (!(Array.isArray(mLine) && mLine.length > 0)) {
      log.error([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not preferring any codec for "' + type + '" streaming as m= line is not found.']);
      return;
    }

    var setLineFn = function (codecsList, isSROk, isChnlsOk) {
      if (Array.isArray(codecsList) && codecsList.length > 0) {
        if (!isSROk) {
          samplingRate = null;
        }
        if (!isChnlsOk) {
          channels = null;
        }
        log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Preferring "' +
          codec + '" (samplingRate: ' + (samplingRate || 'n/a') + ', channels: ' +
          (channels || 'n/a') + ') for "' + type + '" streaming.']);

        var line = mLine[0];
        var lineParts = line.replace('\r\n', '').split(' ');
        // Set the m=x x UDP/xxx
        line = lineParts[0] + ' ' + lineParts[1] + ' ' + lineParts[2] + ' ';
        // Remove them to leave the codecs only
        lineParts.splice(0, 3);
        // Loop for the codecs list to append first
        for (var i = 0; i < codecsList.length; i++) {
          var parts = (codecsList[i].split('a=rtpmap:')[1] || '').split(' ');
          if (parts.length < 2) {
            continue;
          }
          line += parts[0] + ' ';
        }
        // Loop for later fallback codecs to append
        for (var j = 0; j < lineParts.length; j++) {
          if (line.indexOf(' ' + lineParts[j]) > 0) {
            lineParts.splice(j, 1);
            j--;
          } else if (sessionDescription.sdp.match(new RegExp('a=rtpmap:' + lineParts[j] +
            '\ ' + codec + '/.*\r\n', 'gi'))) {
            line += lineParts[j] + ' ';
            lineParts.splice(j, 1);
            j--;
          }
        }
        // Append the rest of the codecs
        line += lineParts.join(' ') + '\r\n';
        sessionDescription.sdp = sessionDescription.sdp.replace(mLine[0], line);
        return true;
      }
    };

    // If samplingRate & channels
    if (samplingRate) {
      if (type === 'audio' && channels && setLineFn(sessionDescription.sdp.match(new RegExp('a=rtpmap:.*\ ' +
        codec + '\/' + samplingRate + (channels === 1 ? '[\/1]*' : '\/' + channels) + '\r\n', 'gi')), true, true)) {
        return;
      } else if (setLineFn(sessionDescription.sdp.match(new RegExp('a=rtpmap:.*\ ' + codec + '\/' +
        samplingRate + '[\/]*.*\r\n', 'gi')), true)) {
        return;
      }
    }
    if (type === 'audio' && channels && setLineFn(sessionDescription.sdp.match(new RegExp('a=rtpmap:.*\ ' +
      codec + '\/.*\/' + channels + '\r\n', 'gi')), false, true)) {
      return;
    }

    setLineFn(sessionDescription.sdp.match(new RegExp('a=rtpmap:.*\ ' + codec + '\/.*\r\n', 'gi')));
  };

  parseFn('audio', overrideSettings ? overrideSettings.audio : self._initOptions.audioCodec);
  parseFn('video', overrideSettings ? overrideSettings.video : self._initOptions.videoCodec);

  return sessionDescription.sdp;
};

/**
 * Function that modifies the session description to remove the previous experimental H264
 * codec that is apparently breaking connections.
 * NOTE: We should perhaps not remove it since H264 is supported?
 * @method _removeSDPFirefoxH264Pref
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._removeSDPFirefoxH264Pref = function(targetMid, sessionDescription) {
  log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
    'Removing Firefox experimental H264 flag to ensure interopability reliability']);

  return sessionDescription.sdp.replace(/a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1\r\n/g, '');
};

/**
 * Function that modifies the session description to remove apt/rtx lines that does exists.
 * @method _removeSDPUnknownAptRtx
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._removeSDPUnknownAptRtx = function (targetMid, sessionDescription) {
  var codecsPayload = []; // m=audio 9 UDP/TLS/RTP/SAVPF [Start from index 3] 102 9 0 8 97 13 118 101  
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var mediaLines = sessionDescription.sdp.split('m=');

  // Remove unmapped rtx lines
  var formatRtx = function (str) {
    (str.match(/a=rtpmap:.*\ rtx\/.*\r\n/gi) || []).forEach(function (line) {
      var payload = (line.split('a=rtpmap:')[1] || '').split(' ')[0] || '';
      var fmtpLine = (str.match(new RegExp('a=fmtp:' + payload + '\ .*\r\n', 'gi')) || [])[0];

      if (!fmtpLine) {
        str = str.replace(new RegExp(line, 'g'), '');
        return;
      }

      var codecPayload = (fmtpLine.split(' apt=')[1] || '').replace(/\r\n/gi, '');
      var rtmpLine = str.match(new RegExp('a=rtpmap:' + codecPayload + '\ .*\r\n', 'gi'));

      if (!rtmpLine) {
        str = str.replace(new RegExp(line, 'g'), '');
        str = str.replace(new RegExp(fmtpLine, 'g'), '');
      }
    });

    return str;
  };

  // Remove unmapped fmtp and rtcp-fb lines
  var formatFmtpRtcpFb = function (str) {
    (str.match(/a=(fmtp|rtcp-fb):.*\ rtx\/.*\r\n/gi) || []).forEach(function (line) {
      var payload = (line.split('a=' + (line.indexOf('rtcp') > 0 ? 'rtcp-fb' : 'fmtp'))[1] || '').split(' ')[0] || '';
      var rtmpLine = str.match(new RegExp('a=rtpmap:' + payload + '\ .*\r\n', 'gi'));

      if (!rtmpLine) {
        str = str.replace(new RegExp(line, 'g'), '');
      }
    });

    return str;
  };

  // Remove rtx or apt= lines that prevent connections for browsers without VP8 or VP9 support
  // See: https://bugs.chromium.org/p/webrtc/issues/detail?id=3962
  for (var m = 0; m < mediaLines.length; m++) {
    mediaLines[m] = formatRtx(mediaLines[m]);
    mediaLines[m] = formatFmtpRtcpFb(mediaLines[m]);
  }

  return mediaLines.join('m=');
};

/**
 * Function that modifies the session description to remove codecs.
 * @method _removeSDPCodecs
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._removeSDPCodecs = function (targetMid, sessionDescription) {
  var audioSettings = this.getPeerInfo().settings.audio;

  var parseFn = function (type, codec) {
    var payloadList = sessionDescription.sdp.match(new RegExp('a=rtpmap:(\\d*)\\ ' + codec + '.*', 'gi'));

    if (!(Array.isArray(payloadList) && payloadList.length > 0)) {
      log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not removing "' + codec + '" as it does not exists.']);
      return;
    }

    for (var i = 0; i < payloadList.length; i++) {
      var payload = payloadList[i].split(' ')[0].split(':')[1];

      log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Removing "' + codec + '" payload ->'], payload);

      sessionDescription.sdp = sessionDescription.sdp.replace(
        new RegExp('a=rtpmap:' + payload + '\\ .*\\r\\n', 'g'), '');
      sessionDescription.sdp = sessionDescription.sdp.replace(
        new RegExp('a=fmtp:' + payload + '\\ .*\\r\\n', 'g'), '');
      sessionDescription.sdp = sessionDescription.sdp.replace(
        new RegExp('a=rtpmap:\\d+ rtx\\/\\d+\\r\\na=fmtp:\\d+ apt=' + payload + '\\r\\n', 'g'), '');

      // Remove the m-line codec
      var sdpLines = sessionDescription.sdp.split('\r\n');

      for (var j = 0; j < sdpLines.length; j++) {
        if (sdpLines[j].indexOf('m=' + type) === 0) {
          var parts = sdpLines[j].split(' ');

          if (parts.indexOf(payload) >= 3) {
            parts.splice(parts.indexOf(payload), 1);
          }

          sdpLines[j] = parts.join(' ');
          break;
        }
      }

      sessionDescription.sdp = sdpLines.join('\r\n');
    }
  };

  if (this._initOptions.disableVideoFecCodecs) {
    if (this._hasMCU) {
      log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not removing "ulpfec" or "red" codecs as connected to MCU to prevent connectivity issues.']);
    } else {
      parseFn('video', 'red');
      parseFn('video', 'ulpfec');
    }
  }

  if (this._initOptions.disableComfortNoiseCodec && audioSettings && typeof audioSettings === 'object' && audioSettings.stereo) {
    parseFn('audio', 'CN');
  }

  if (window.webrtcDetectedBrowser === 'edge' &&
    (((this._peerInformations[targetMid] || {}).agent || {}).name || 'unknown').name !== 'edge') {
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=rtcp-fb:.*\ x-message\ .*\r\n/gi, '');
  }

  return sessionDescription.sdp;
};

/**
 * Function that modifies the session description to remove REMB packets fb.
 * @method _removeSDPREMBPackets
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._removeSDPREMBPackets = function (targetMid, sessionDescription) {
  if (!this._initOptions.disableREMB) {
    return sessionDescription.sdp;
  }

  log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing REMB packets.']);
  return sessionDescription.sdp.replace(/a=rtcp-fb:\d+ goog-remb\r\n/g, '');
};

/**
 * Function that retrieves the session description selected codec.
 * @method _getSDPSelectedCodec
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getSDPSelectedCodec = function (targetMid, sessionDescription, type, beSilentOnLogs) {
  var codecInfo = {
    name: null,
    implementation: null,
    clockRate: null,
    channels: null,
    payloadType: null,
    params: null
  };

  if (!(sessionDescription && sessionDescription.sdp)) {
    return codecInfo;
  }

  sessionDescription.sdp.split('m=').forEach(function (mediaItem, index) {
    if (index === 0 || mediaItem.indexOf(type + ' ') !== 0) {
      return;
    }

    var codecs = (mediaItem.split('\r\n')[0] || '').split(' ');
    // Remove audio[0] 65266[1] UDP/TLS/RTP/SAVPF[2]
    codecs.splice(0, 3);

    for (var i = 0; i < codecs.length; i++) {
      var match = mediaItem.match(new RegExp('a=rtpmap:' + codecs[i] + '.*\r\n', 'gi'));

      if (!match) {
        continue;
      }

      // Format: codec/clockRate/channels
      var parts = ((match[0] || '').replace(/\r\n/g, '').split(' ')[1] || '').split('/');

      // Ignore rtcp codecs, dtmf or comfort noise
      if (['red', 'ulpfec', 'telephone-event', 'cn', 'rtx'].indexOf(parts[0].toLowerCase()) > -1) {
        continue;
      }

      codecInfo.name = parts[0];
      codecInfo.clockRate = parseInt(parts[1], 10) || 0;
      codecInfo.channels = parseInt(parts[2] || '1', 10) || 1;
      codecInfo.payloadType = parseInt(codecs[i], 10);
      codecInfo.params = '';

      // Get the list of codec parameters
      var params = mediaItem.match(new RegExp('a=fmtp:' + codecs[i] + '.*\r\n', 'gi')) || [];
      params.forEach(function (paramItem) {
        codecInfo.params += paramItem.replace(new RegExp('a=fmtp:' + codecs[i], 'gi'), '').replace(/\ /g, '').replace(/\r\n/g, '');
      });
      break;
    }
  });

  if (!beSilentOnLogs) {
    log.debug([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Parsing session description "' + type + '" codecs ->'], codecInfo);
  }

  return codecInfo;
};

/**
 * Function that modifies the session description to remove non-relay ICE candidates.
 * @method _removeSDPFilteredCandidates
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._removeSDPFilteredCandidates = function (targetMid, sessionDescription) {
  // Handle Firefox MCU Peer ICE candidates
  if (targetMid === 'MCU' && sessionDescription.type === this.HANDSHAKE_PROGRESS.ANSWER &&
    window.webrtcDetectedBrowser === 'firefox') {
    sessionDescription.sdp = sessionDescription.sdp.replace(/ generation 0/g, '');
    sessionDescription.sdp = sessionDescription.sdp.replace(/ udp /g, ' UDP ');
  }

  if (this._initOptions.forceTURN && this._hasMCU) {
    log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Not filtering ICE candidates as ' +
      'TURN connections are enforced as MCU is present (and act as a TURN itself) so filtering of ICE candidate ' +
      'flags are not honoured']);
    return sessionDescription.sdp;
  }

  if (this._initOptions.filterCandidatesType.host) {
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing "host" ICE candidates.']);
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:.*host.*\r\n/g, '');
  }

  if (this._initOptions.filterCandidatesType.srflx) {
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing "srflx" ICE candidates.']);
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:.*srflx.*\r\n/g, '');
  }

  if (this._initOptions.filterCandidatesType.relay) {
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing "relay" ICE candidates.']);
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:.*relay.*\r\n/g, '');
  }

  // sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:(?!.*relay.*).*\r\n/g, '');

  return sessionDescription.sdp;
};

/**
 * Function that retrieves the current list of support codecs.
 * @method _getCodecsSupport
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._getCodecsSupport = function (callback) {
  var self = this;

  if (self._currentCodecSupport) {
    callback(null);
    return;
  }

  self._currentCodecSupport = { audio: {}, video: {} };

  // Safari 11 REQUIRES a stream first before connection works, hence let's spoof it for now
  if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
    self._currentCodecSupport.audio = { 
      opus: ['48000/2']
    };
    self._currentCodecSupport.video = { 
      h264: ['48000']
    };
    return callback(null);
  }

  try {
    if (window.webrtcDetectedBrowser === 'edge') {
      var codecs = RTCRtpSender.getCapabilities().codecs;

      for (var i = 0; i < codecs.length; i++) {
        if (['audio','video'].indexOf(codecs[i].kind) > -1 && codecs[i].name) {
          var codec = codecs[i].name.toLowerCase();
          self._currentCodecSupport[codecs[i].kind][codec] = codecs[i].clockRate +
            (codecs[i].numChannels > 1 ? '/' + codecs[i].numChannels : '');
        }
      }
      // Ignore .fecMechanisms for now
      callback(null);

    } else {
      var pc = new RTCPeerConnection(null);
      var offerConstraints = AdapterJS.webrtcDetectedType !== 'plugin' ? {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      } : {
        mandatory: {
          OfferToReceiveVideo: true,
          OfferToReceiveAudio: true
        }
      };

      // Prevent errors and proceed with create offer still...
      try {
        var channel = pc.createDataChannel('test');
        self._binaryChunkType = channel.binaryType || self._binaryChunkType;
        self._binaryChunkType = self._binaryChunkType.toLowerCase().indexOf('array') > -1 ?
          self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER : self._binaryChunkType;
        // Set the value according to the property
        for (var prop in self.DATA_TRANSFER_DATA_TYPE) {
          if (self.DATA_TRANSFER_DATA_TYPE.hasOwnProperty(prop) &&
            self._binaryChunkType.toLowerCase() === self.DATA_TRANSFER_DATA_TYPE[prop].toLowerCase()) {
            self._binaryChunkType = self.DATA_TRANSFER_DATA_TYPE[prop];
            break;
          }
        }
      } catch (e) {}

      pc.createOffer(function (offer) {
        self._currentCodecSupport = self._getSDPCodecsSupport(null, offer);
        callback(null);

      }, function (error) {
        callback(error);
      }, offerConstraints);
    }
  } catch (error) {
    callback(error);
  }
};

/**
 * Function that modifies the session description to handle the connection settings.
 * This is experimental and never recommended to end-users.
 * @method _handleSDPConnectionSettings
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._handleSDPConnectionSettings = function (targetMid, sessionDescription, direction) {
  var self = this;

  if (!self._sdpSessions[targetMid]) {
    return sessionDescription.sdp;
  }

  var sessionDescriptionStr = sessionDescription.sdp;

  // Handle a=end-of-candidates signaling for non-trickle ICE before setting remote session description
  if (direction === 'remote' && !self.getPeerInfo(targetMid).config.enableIceTrickle) {
    sessionDescriptionStr = sessionDescriptionStr.replace(/a=end-of-candidates\r\n/g, '');
  }

  var sdpLines = sessionDescriptionStr.split('\r\n');
  var peerAgent = ((self._peerInformations[targetMid] || {}).agent || {}).name || '';
  var peerVersion = ((self._peerInformations[targetMid] || {}).agent || {}).version || 0;
  var mediaType = '';
  var bundleLineIndex = -1;
  var bundleLineMids = [];
  var mLineIndex = -1;
  var settings = clone(self._sdpSettings);

  if (targetMid === 'MCU') {
    settings.connection.audio = true;
    settings.connection.video = true;
    settings.connection.data = true;
  }

  // Patches for MCU sending empty video stream despite audio+video is not sending at all
  // Apply as a=inactive when supported
  if (self._hasMCU) {
    var peerStreamSettings = clone(self.getPeerInfo(targetMid)).settings || {};
    settings.direction.audio.receive = targetMid === 'MCU' ? false : !!peerStreamSettings.audio;
    settings.direction.audio.send = targetMid === 'MCU' ? true : false;
    settings.direction.video.receive = targetMid === 'MCU' ? false : !!peerStreamSettings.video;
    settings.direction.video.send = targetMid === 'MCU' ? true : false;
  }

  if (direction === 'remote') {
    var offerCodecs = self._getSDPCommonSupports(targetMid, sessionDescription);

    if (!offerCodecs.audio) {
      settings.connection.audio = false;
    }

    if (!offerCodecs.video) {
      settings.connection.video = false;
    }
  }

  // ANSWERER: Reject only the m= lines. Returned rejected m= lines as well.
  // OFFERER: Remove m= lines

  self._sdpSessions[targetMid][direction].mLines = [];
  self._sdpSessions[targetMid][direction].bundleLine = '';
  self._sdpSessions[targetMid][direction].connection = {
    audio: null,
    video: null,
    data: null
  };

  for (var i = 0; i < sdpLines.length; i++) {
    // Cache the a=group:BUNDLE line used for remote answer from Edge later
    if (sdpLines[i].indexOf('a=group:BUNDLE') === 0) {
      self._sdpSessions[targetMid][direction].bundleLine = sdpLines[i];
      bundleLineIndex = i;

    // Check if there's a need to reject m= line
    } else if (sdpLines[i].indexOf('m=') === 0) {
      mediaType = (sdpLines[i].split('m=')[1] || '').split(' ')[0] || '';
      mediaType = mediaType === 'application' ? 'data' : mediaType;
      mLineIndex++;

      self._sdpSessions[targetMid][direction].mLines[mLineIndex] = sdpLines[i];

      // Check if there is missing unsupported video codecs support and reject it regardles of MCU Peer or not
      if (!settings.connection[mediaType]) {
        log.log([targetMid, 'RTCSessionDesription', sessionDescription.type,
          'Removing rejected m=' + mediaType + ' line ->'], sdpLines[i]);

        // Check if answerer and we do not have the power to remove the m line if index is 0
        // Set as a=inactive because we do not have that power to reject it somehow..
        // first m= line cannot be rejected for BUNDLE
        if (self._peerConnectionConfig.bundlePolicy === self.BUNDLE_POLICY.MAX_BUNDLE &&
          bundleLineIndex > -1 && mLineIndex === 0 && (direction === 'remote' ?
          sessionDescription.type === this.HANDSHAKE_PROGRESS.OFFER :
          sessionDescription.type === this.HANDSHAKE_PROGRESS.ANSWER)) {
          log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
            'Not removing rejected m=' + mediaType + ' line ->'], sdpLines[i]);
          settings.connection[mediaType] = true;
          if (['audio', 'video'].indexOf(mediaType) > -1) {
            settings.direction[mediaType].send = false;
            settings.direction[mediaType].receive = false;
          }
          continue;
        }

        if (window.webrtcDetectedBrowser === 'edge') {
          sdpLines.splice(i, 1);
          i--;
          continue;
        } else if (direction === 'remote' || sessionDescription.type === this.HANDSHAKE_PROGRESS.ANSWER) {
          var parts = sdpLines[i].split(' ');
          parts[1] = 0;
          sdpLines[i] = parts.join(' ');
          continue;
        }
      }
    }

    if (direction === 'remote' && sdpLines[i].indexOf('a=candidate:') === 0 &&
      !self.getPeerInfo(targetMid).config.enableIceTrickle) {
      if (sdpLines[i + 1] ? !(sdpLines[i + 1].indexOf('a=candidate:') === 0 ||
        sdpLines[i + 1].indexOf('a=end-of-candidates') === 0) : true) {
        log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
          'Appending end-of-candidates signal for non-trickle ICE connection.']);
        sdpLines.splice(i + 1, 0, 'a=end-of-candidates');
        i++;
      }
    }

    if (mediaType) {
      // Remove lines if we are rejecting the media and ensure unless (rejectVideoMedia is true), MCU has to enable those m= lines
      if (!settings.connection[mediaType]) {
        sdpLines.splice(i, 1);
        i--;

      // Store the mids session description
      } else if (sdpLines[i].indexOf('a=mid:') === 0) {
        bundleLineMids.push(sdpLines[i].split('a=mid:')[1] || '');

      // Configure direction a=sendonly etc for local sessiondescription
      }  else if (mediaType && ['a=sendrecv', 'a=sendonly', 'a=recvonly'].indexOf(sdpLines[i]) > -1) {
        if (['audio', 'video'].indexOf(mediaType) === -1) {
          self._sdpSessions[targetMid][direction].connection.data = sdpLines[i];
          continue;
        }

        if (direction === 'local') {
          if (settings.direction[mediaType].send && !settings.direction[mediaType].receive) {
            sdpLines[i] = sdpLines[i].indexOf('send') > -1 ? 'a=sendonly' : 'a=inactive';
          } else if (!settings.direction[mediaType].send && settings.direction[mediaType].receive) {
            sdpLines[i] = sdpLines[i].indexOf('recv') > -1 ? 'a=recvonly' : 'a=inactive';
          } else if (!settings.direction[mediaType].send && !settings.direction[mediaType].receive) {
          // MCU currently does not support a=inactive flag.. what do we do here?
            sdpLines[i] = 'a=inactive';
          }

          // Handle Chrome bundle bug. - See: https://bugs.chromium.org/p/webrtc/issues/detail?id=6280
          if (!self._hasMCU && window.webrtcDetectedBrowser !== 'firefox' && peerAgent === 'firefox' &&
            sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER && sdpLines[i] === 'a=recvonly') {
            log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Overriding any original settings ' +
              'to receive only to send and receive to resolve chrome BUNDLE errors.']);
            sdpLines[i] = 'a=sendrecv';
            settings.direction[mediaType].send = true;
            settings.direction[mediaType].receive = true;
          }
        // Patch for incorrect responses
        } else if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER) {
          var localOfferRes = self._sdpSessions[targetMid].local.connection[mediaType];
          // Parse a=sendonly response
          if (localOfferRes === 'a=sendonly') {
            sdpLines[i] = ['a=inactive', 'a=recvonly'].indexOf(sdpLines[i]) === -1 ?
              (sdpLines[i] === 'a=sendonly' ? 'a=inactive' : 'a=recvonly') : sdpLines[i];
          // Parse a=recvonly
          } else if (localOfferRes === 'a=recvonly') {
            sdpLines[i] = ['a=inactive', 'a=sendonly'].indexOf(sdpLines[i]) === -1 ?
              (sdpLines[i] === 'a=recvonly' ? 'a=inactive' : 'a=sendonly') : sdpLines[i];
          // Parse a=sendrecv
          } else if (localOfferRes === 'a=inactive') {
            sdpLines[i] = 'a=inactive';
          }
        }
        self._sdpSessions[targetMid][direction].connection[mediaType] = sdpLines[i];
      }
    }

    // Remove weird empty characters for Edge case.. :(
    if (!(sdpLines[i] || '').replace(/\n|\r|\s|\ /gi, '')) {
      sdpLines.splice(i, 1);
      i--;
    }
  }

  // Fix chrome "offerToReceiveAudio" local offer not removing audio BUNDLE
  if (bundleLineIndex > -1) {
    if (self._peerConnectionConfig.bundlePolicy === self.BUNDLE_POLICY.MAX_BUNDLE) {
      sdpLines[bundleLineIndex] = 'a=group:BUNDLE ' + bundleLineMids.join(' ');
    // Remove a=group:BUNDLE line
    } else if (self._peerConnectionConfig.bundlePolicy === self.BUNDLE_POLICY.NONE) {
      sdpLines.splice(bundleLineIndex, 1);
    }
  }

  // Append empty space below
  if (window.webrtcDetectedBrowser !== 'edge') {
    if (!sdpLines[sdpLines.length - 1].replace(/\n|\r|\s/gi, '')) {
      sdpLines[sdpLines.length - 1] = '';
    } else {
      sdpLines.push('');
    }
  }

  log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Handling connection lines and direction ->'], settings);

  return sdpLines.join('\r\n');
};

/**
 * Function that parses and retrieves the session description fingerprint.
 * @method _getSDPFingerprint
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._getSDPFingerprint = function (targetMid, sessionDescription, beSilentOnLogs) {
  var fingerprint = {
    fingerprint: null,
    fingerprintAlgorithm: null,
    derBase64: null
  };

  if (!(sessionDescription && sessionDescription.sdp)) {
    return fingerprint;
  }

  var sdpLines = sessionDescription.sdp.split('\r\n');

  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].indexOf('a=fingerprint') === 0) {
      var parts = sdpLines[i].replace('a=fingerprint:', '').split(' ');
      fingerprint.fingerprint = parts[1];
      fingerprint.fingerprintAlgorithm = parts[0];
      break;
    }
  }

  if (!beSilentOnLogs) {
    log.debug([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Parsing session description fingerprint ->'], fingerprint);
  }

  return fingerprint;
};

/**
 * Function that modifies the session description to append the MediaStream and MediaStreamTrack IDs that seems
 * to be missing from Firefox answer session description to Chrome connection causing freezes in re-negotiation.
 * @method _renderSDPOutput
 * @private
 * @for Skylink
 * @since 0.6.25
 */
Skylink.prototype._renderSDPOutput = function (targetMid, sessionDescription) {
  var self = this;
  var localStream = null;
  var localStreamId = null;

  if (!(sessionDescription && sessionDescription.sdp)) {
    return;
  }

  if (!self._peerConnections[targetMid]) {
    return sessionDescription.sdp;
  }

  if (self._peerConnections[targetMid].localStream) {
    localStream = self._peerConnections[targetMid].localStream;
    localStreamId = self._peerConnections[targetMid].localStreamId || self._peerConnections[targetMid].localStream.id;
  }

  // For non-trickle ICE, remove the a=end-of-candidates line first to append it properly later
  var sdpLines = (!self._initOptions.enableIceTrickle ? sessionDescription.sdp.replace(/a=end-of-candidates\r\n/g, '') : sessionDescription.sdp).split('\r\n');
  var agent = ((self._peerInformations[targetMid] || {}).agent || {}).name || '';

  // Parse and replace with the correct msid to prevent unwanted streams.
  // Making it simple without replacing with the track IDs or labels, neither setting prefixing "mslabel" and "label" as required labels.
  if (localStream) {
    var ssrcId = null;
    var mediaType = '';

    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('m=') === 0) {
        mediaType = (sdpLines[i].split('m=')[1] || '').split(' ')[0] || '';
        mediaType = ['audio', 'video'].indexOf(mediaType) === -1 ? '' : mediaType;

      } else if (mediaType) {
        if (sdpLines[i].indexOf('a=msid:') === 0) {
          var msidParts = sdpLines[i].split(' ');
          msidParts[0] = 'a=msid:' + localStreamId;
          sdpLines[i] = msidParts.join(' ');

        } else if (sdpLines[i].indexOf('a=ssrc:') === 0) {
          var ssrcParts = null;

          // Replace for "msid:" and "mslabel:"
          if (sdpLines[i].indexOf(' msid:') > 0) {
            ssrcParts = sdpLines[i].split(' msid:');
          } else if (sdpLines[i].indexOf(' mslabel:') > 0) {
            ssrcParts = sdpLines[i].split(' mslabel:');
          }

          if (ssrcParts) {
            var ssrcMsidParts = (ssrcParts[1] || '').split(' ');
            ssrcMsidParts[0] = localStreamId;
            ssrcParts[1] = ssrcMsidParts.join(' ');

            if (sdpLines[i].indexOf(' msid:') > 0) {
              sdpLines[i] = ssrcParts.join(' msid:');
            } else if (sdpLines[i].indexOf(' mslabel:') > 0) {
              sdpLines[i] = ssrcParts.join(' mslabel:');
            }
          }
        }
      }
    }
  }

  // For non-trickle ICE, append the signaling of end-of-candidates properly
  if (!self._initOptions.enableIceTrickle){
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Appending end-of-candidates signal for non-trickle ICE connection.']);

    for (var e = 0; e < sdpLines.length; e++) {
      if (sdpLines[e].indexOf('a=candidate:') === 0) {
        if (sdpLines[e + 1] ? !(sdpLines[e + 1].indexOf('a=candidate:') === 0 ||
          sdpLines[e + 1].indexOf('a=end-of-candidates') === 0) : true) {
          sdpLines.splice(e + 1, 0, 'a=end-of-candidates');
          e++;
        }
      }
    }
  }

  // Replace the bundle policy to prevent complete removal of m= lines for some cases that do not accept missing m= lines except edge.
  if (sessionDescription.type === this.HANDSHAKE_PROGRESS.ANSWER && this._sdpSessions[targetMid]) {
    var bundleLineIndex = -1;
    var mLineIndex = -1;

    for (var j = 0; j < sdpLines.length; j++) {
      if (sdpLines[j].indexOf('a=group:BUNDLE') === 0 && this._sdpSessions[targetMid].remote.bundleLine &&
        this._peerConnectionConfig.bundlePolicy === this.BUNDLE_POLICY.MAX_BUNDLE) {
        sdpLines[j] = this._sdpSessions[targetMid].remote.bundleLine;
      } else if (sdpLines[j].indexOf('m=') === 0) {
        mLineIndex++;
        var compareA = sdpLines[j].split(' ');
        var compareB = (this._sdpSessions[targetMid].remote.mLines[mLineIndex] || '').split(' ');

        if (compareA[0] && compareB[0] && compareA[0] !== compareB[0]) {
          compareB[1] = 0;
          log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
            'Appending middle rejected m= line ->'], compareB.join(' '));
          sdpLines.splice(j, 0, compareB.join(' '));
          j++;
          mLineIndex++;
        }
      }
    }

    while (this._sdpSessions[targetMid].remote.mLines[mLineIndex + 1]) {
      mLineIndex++;
      var appendIndex = sdpLines.length;
      if (!sdpLines[appendIndex - 1].replace(/\s/gi, '')) {
        appendIndex -= 1;
      }
      var parts = (this._sdpSessions[targetMid].remote.mLines[mLineIndex] || '').split(' ');
      parts[1] = 0;
      log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Appending later rejected m= line ->'], parts.join(' '));
      sdpLines.splice(appendIndex, 0, parts.join(' '));
    }
  }

  // Ensure for chrome case to have empty "" at last line or it will return invalid SDP errors
  if (window.webrtcDetectedBrowser === 'edge' && sessionDescription.type === this.HANDSHAKE_PROGRESS.OFFER &&
    !sdpLines[sdpLines.length - 1].replace(/\s/gi, '')) {
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing last empty space for Edge browsers']);
    sdpLines.splice(sdpLines.length - 1, 1);
  }

  /*
  var outputStr = sdpLines.join('\r\n');
  if (window.webrtcDetectedBrowser === 'edge' && this._streams.userMedia && this._streams.userMedia.stream) {
    var correctStreamId = this._streams.userMedia.stream.id || this._streams.userMedia.stream.label;
    outputStr = outputStr.replace(new RegExp('a=msid:.*\ ', 'gi'), 'a=msid:' + correctStreamId + ' ');
    outputStr = outputStr.replace(new RegExp('\ msid:.*\ ', 'gi'), ' msid:' + correctStreamId + ' ');
  }*/

  log.info([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Formatted output ->'], sdpLines.join('\r\n'));

  return sdpLines.join('\r\n');
};

/**
 * Function that parses the session description to get the MediaStream IDs.
 * NOTE: It might not completely accurate if the setRemoteDescription() fails..
 * @method _parseSDPMediaStreamIDs
 * @private
 * @for Skylink
 * @since 0.6.25
 */
Skylink.prototype._parseSDPMediaStreamIDs = function (targetMid, sessionDescription) {
  if (!this._peerConnections[targetMid]) {
    return;
  }

  if (!(sessionDescription && sessionDescription.sdp)) {
    this._peerConnections[targetMid].remoteStreamId = null;
    return;
  }

  var sdpLines = sessionDescription.sdp.split('\r\n');
  var currentStreamId = null;

  for (var i = 0; i < sdpLines.length; i++) {
    // a=msid:{31145dc5-b3e2-da4c-a341-315ef3ebac6b} {e0cac7dd-64a0-7447-b719-7d5bf042ca05}
    if (sdpLines[i].indexOf('a=msid:') === 0) {
      currentStreamId = (sdpLines[i].split('a=msid:')[1] || '').split(' ')[0];
      break;
    // a=ssrc:691169016 msid:c58721ed-b7db-4e7c-ac37-47432a7a2d6f 2e27a4b8-bc74-4118-b3d4-0f1c4ed4869b
    } else if (sdpLines[i].indexOf('a=ssrc:') === 0 && sdpLines[i].indexOf(' msid:') > 0) {
      currentStreamId = (sdpLines[i].split(' msid:')[1] || '').split(' ')[0];
      break;
    }
  }

  // No stream set
  if (!currentStreamId) {
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'No remote stream is sent.']);
    this._peerConnections[targetMid].remoteStreamId = null;
  // New stream set
  } else if (currentStreamId !== this._peerConnections[targetMid].remoteStreamId) {
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'New remote stream is sent ->'], currentStreamId);
    this._peerConnections[targetMid].remoteStreamId = currentStreamId;
  // Same stream set
  } else {
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Same remote stream is sent ->'], currentStreamId);
  }
};

/**
 * Function that parses and retrieves the session description ICE candidates.
 * @method _getSDPICECandidates
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._getSDPICECandidates = function (targetMid, sessionDescription, beSilentOnLogs) {
  var candidates = {
    host: [],
    srflx: [],
    relay: []
  };

  if (!(sessionDescription && sessionDescription.sdp)) {
    return candidates;
  }

  sessionDescription.sdp.split('m=').forEach(function (mediaItem, index) {
    // Ignore the v=0 lines etc..
    if (index === 0) {
      return;
    }

    // Remove a=mid: and \r\n
    var sdpMid = ((mediaItem.match(/a=mid:.*\r\n/gi) || [])[0] || '').replace(/a=mid:/gi, '').replace(/\r\n/, '');
    var sdpMLineIndex = index - 1;

    (mediaItem.match(/a=candidate:.*\r\n/gi) || []).forEach(function (item) {
      // Remove \r\n for candidate type being set at the end of candidate DOM string.
      var canType = (item.split(' ')[7] || 'host').replace(/\r\n/g, '');
      candidates[canType] = candidates[canType] || [];
      candidates[canType].push(new RTCIceCandidate({
        sdpMid: sdpMid,
        sdpMLineIndex: sdpMLineIndex,
        // Remove initial "a=" in a=candidate
        candidate: (item.split('a=')[1] || '').replace(/\r\n/g, '')
      }));
    });
  });

  if (!beSilentOnLogs) {
    log.debug([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Parsing session description ICE candidates ->'], candidates);
  }

  return candidates;
};

/**
 * Function that gets each media line SSRCs.
 * @method _getSDPMediaSSRC
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._getSDPMediaSSRC = function (targetMid, sessionDescription, beSilentOnLogs) {
  var ssrcs = {
    audio: 0,
    video: 0
  };

  if (!(sessionDescription && sessionDescription.sdp)) {
    return ssrcs;
  }

  sessionDescription.sdp.split('m=').forEach(function (mediaItem, index) {
    // Ignore the v=0 lines etc..
    if (index === 0) {
      return;
    }

    var mediaType = (mediaItem.split(' ')[0] || '');
    var ssrcLine = (mediaItem.match(/a=ssrc:.*\r\n/) || [])[0];

    if (typeof ssrcs[mediaType] !== 'number') {
      return;
    }

    if (ssrcLine) {
      ssrcs[mediaType] = parseInt((ssrcLine.split('a=ssrc:')[1] || '').split(' ')[0], 10) || 0;
    }
  });

  if (!beSilentOnLogs) {
    log.debug([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Parsing session description media SSRCs ->'], ssrcs);
  }

  return ssrcs;
};

/**
 * Function that parses the current list of supported codecs from session description.
 * @method _getSDPCodecsSupport
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._getSDPCodecsSupport = function (targetMid, sessionDescription) {
  var self = this;
  var codecs = {
    audio: {},
    video: {}
  };

  if (!(sessionDescription && sessionDescription.sdp)) {
    return codecs;
  }

  var sdpLines = sessionDescription.sdp.split('\r\n');
  var mediaType = '';

  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].indexOf('m=') === 0) {
      mediaType = (sdpLines[i].split('m=')[1] || '').split(' ')[0];
      continue;
    }

    if (sdpLines[i].indexOf('a=rtpmap:') === 0) {
      var parts = (sdpLines[i].split(' ')[1] || '').split('/');
      var codec = (parts[0] || '').toLowerCase();
      var info = parts[1] + (parts[2] ? '/' + parts[2] : '');

      if (['ulpfec', 'red', 'telephone-event', 'cn', 'rtx'].indexOf(codec) > -1) {
        continue;
      }

      codecs[mediaType][codec] = codecs[mediaType][codec] || [];
      
      if (codecs[mediaType][codec].indexOf(info) === -1) {
        codecs[mediaType][codec].push(info);
      }
    }
  }

  log.info([targetMid || null, 'RTCSessionDescription', sessionDescription.type, 'Parsed codecs support ->'], codecs);
  return codecs;
};

/**
 * Function that checks if there are any common codecs supported for remote end.
 * @method _getSDPCommonSupports
 * @private
 * @for Skylink
 * @since 0.6.25
 */
Skylink.prototype._getSDPCommonSupports = function (targetMid, sessionDescription) {
  var self = this;
  var offer = {
    audio: false,
    video: false
  };

  if (!targetMid || !(sessionDescription && sessionDescription.sdp)) {
    offer.video = !!(self._currentCodecSupport.video.h264 || self._currentCodecSupport.video.vp8);
    offer.audio = !!self._currentCodecSupport.audio.opus;

    if (targetMid) {
      var peerAgent = ((self._peerInformations[targetMid] || {}).agent || {}).name || '';

      if (AdapterJS.webrtcDetectedBrowser === peerAgent) {
        offer.video = Object.keys(self._currentCodecSupport.video).length > 0;
        offer.audio = Object.keys(self._currentCodecSupport.audio).length > 0;
      }
    }
    return offer;
  }

  var remoteCodecs = self._getSDPCodecsSupport(targetMid, sessionDescription);
  var localCodecs = self._currentCodecSupport;

  for (var ac in localCodecs.audio) {
    if (localCodecs.audio.hasOwnProperty(ac) && localCodecs.audio[ac] && remoteCodecs.audio[ac]) {
      offer.audio = true;
      break;
    }
  }

  for (var vc in localCodecs.video) {
    if (localCodecs.video.hasOwnProperty(vc) && localCodecs.video[vc] && remoteCodecs.video[vc]) {
      offer.video = true;
      break;
    }
  }

  return offer;
};

  if(typeof exports !== 'undefined') {
    // Prevent breaking code
    module.exports = {
      Skylink: Skylink,
      SkylinkLogs: SkylinkLogs
    };
  } else if (globals) {
    globals.Skylink = Skylink;
    globals.SkylinkLogs = SkylinkLogs;
  } else if (window) {
    window.Skylink = Skylink;
    window.SkylinkLogs = SkylinkLogs;
  }
})(this);
