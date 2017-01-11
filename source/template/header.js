(function(refThis) {

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
 * http://support.temasys.io), asks questions, request features or raise bug tickets as well.
 *
 * If you would like to contribute to our Temasys SkylinkJS codebase, see [the contributing README](
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
   * Stores the flag if Peers should have any Datachannel connections.
   * @attribute _enableDataChannel
   * @default true
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._enableDataChannel = true;

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
   * Stores the flags for ICE candidate filtering.
   * @attribute _filterCandidatesType
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._filterCandidatesType = {
    host: false,
    srflx: false,
    relay: false
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
  this._enableIceTrickle = true;

  /**
   * Stores the flag that indicates if STUN ICE servers should be used when constructing Peer connection.
   * @attribute _enableSTUN
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._enableSTUN = true;

  /**
   * Stores the flag that indicates if TURN ICE servers should be used when constructing Peer connection.
   * @attribute _enableTURN
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._enableTURN = true;

  /**
   * Stores the flag that indicates if public STUN ICE servers should be used when constructing Peer connection.
   * @attribute _usePublicSTUN
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.6.1
   */
  this._usePublicSTUN = true;

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
   * @param {Object} <#peerId> The Peer connection.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._peerConnections = {};

  /**
   * Stores the list of the Peer connections stats.
   * @attribute _peerStats
   * @param {Object} <#peerId> The Peer connection stats.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._peerStats = {};

  /**
   * The flag if User is using plugin.
   * @attribute _isUsingPlugin
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._isUsingPlugin = false;

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
  this._TURNTransport = 'any';

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
   * Stores the throttling interval timeout.
   * @attribute _throttlingTimeouts
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._throttlingTimeouts = {
    shareScreen: 10000,
    refreshConnection: 5000,
    getUserMedia: 0
  };

  /**
   * Stores the flag if throttling should throw when called less than the interval timeout.
   * @attribute _throttlingShouldThrowError
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._throttlingShouldThrowError = false;

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
   * Stores the socket connection timeout when establishing connection to the Signaling.
   * @attribute _socketTimeout
   * @type Number
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._socketTimeout = 20000;

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
  this._enableIceRestart = window.webrtcDetectedBrowser === 'firefox' ?
    window.webrtcDetectedVersion >= 48 : true;

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
  this._forceSSL = false;

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
  this._forceTURNSSL = false;

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
  this._forceTURN = false;

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
   * Stores the API server url.
   * @attribute _roomServer
   * @type String
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._roomServer = '//api.temasys.io';

  /**
   * Stores the App Key configured in <code>init()</code>.
   * @attribute _appKey
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._appKey = null;

  /**
   * Stores the default Room name to connect to when <code>joinRoom()</code> does not provide a Room name.
   * @attribute _defaultRoom
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._defaultRoom = null;

  /**
   * Stores the <code>init()</code> credentials starting DateTime stamp in ISO 8601.
   * @attribute _roomStart
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._roomStart = null;

  /**
   * Stores the <code>init()</code> credentials duration counted in hours.
   * @attribute _roomDuration
   * @type Number
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._roomDuration = null;

  /**
   * Stores the <code>init()</code> generated credentials string.
   * @attribute _roomCredentials
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._roomCredentials = null;

  /**
   * Stores the current <code>init()</code> readyState.
   * @attribute _readyState
   * @type Number
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._readyState = 0;

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
   * Stores the flag that indicates if <code>getUserMedia()</code> should fallback to retrieve
   *   audio only Stream after retrieval of audio and video Stream had failed.
   * @attribute _audioFallback
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._audioFallback = false;

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
   * Stores the preferred sending Peer connection streaming audio codec.
   * @attribute _selectedAudioCodec
   * @type String
   * @default "auto"
   * @private
   * @for Skylink
   * @since 0.5.10
   */
  this._selectedAudioCodec = 'auto';

  /**
   * Stores the preferred sending Peer connection streaming video codec.
   * @attribute _selectedVideoCodec
   * @type String
   * @default "auto"
   * @private
   * @for Skylink
   * @since 0.5.10
   */
  this._selectedVideoCodec = 'auto';

  /**
   * Stores the flag if ulpfec and red codecs should be removed.
   * @attribute _disableVideoFecCodecs
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._disableVideoFecCodecs = false;

  /**
   * Stores the flag if CN (Comfort Noise) codec should be removed.
   * @attribute _disableComfortNoiseCodec
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._disableComfortNoiseCodec = false;

  /**
   * Stores the flag if REMB feedback packets should be removed.
   * @attribute _disableREMB
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._disableREMB = false;

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
   * @type JSON|Boolean
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._publishOnly = false;

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
   * Stores the flag if MCU should use renegotiation.
   * @attribute _mcuUseRenegoRestart
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._mcuUseRenegoRestart = false;

  /**
   * Stores the debugging TURN/STUN ICE server.
   * @attribute _turnServer
   * @type String
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._turnServer = null;

  /**
   * Stores the debugging Signaling server.
   * @attribute _socketServer
   * @type String
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._socketServer = null;
}