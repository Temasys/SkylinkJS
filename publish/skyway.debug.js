/*! SkywayJS - v0.0.1 - 2014-06-25 */

RTCPeerConnection = null;
/**
 * Note:
 *  Get UserMedia (only difference is the prefix).
 * [Credits] Code from Adam Barth.
 *
 * [attribute] RTCIceCandidate
 * [type] Function
 */
getUserMedia = null;
/**
 * Note:
 *  Attach a media stream to an element.
 *
 * [attribute] attachMediaStream
 * [type] Function
 */
attachMediaStream = null;
/**
 * Note:
 *  Re-attach a media stream to an element.
 *
 * [attribute] reattachMediaStream
 * [type] Function
 */
reattachMediaStream = null;
/**
 * Note:
 *  This function detects whether or not a plugin is installed
 *  - Com name : the company name,
 *  - plugName : the plugin name
 *  - installedCb : callback if the plugin is detected (no argument)
 *  - notInstalledCb : callback if the plugin is not detected (no argument)
 * @method isPluginInstalled
 * @protected
 */
isPluginInstalled = null;
/**
 * Note:
 *  defines webrtc's JS interface according to the plugin's implementation
 * [attribute] defineWebRTCInterface
 * [type] Function
 */
defineWebRTCInterface = null;
/**
 * Note:
 *  This function will be called if the plugin is needed
 *  (browser different from Chrome or Firefox),
 *  but the plugin is not installed
 *  Override it according to your application logic.
 * [attribute] pluginNeededButNotInstalledCb
 * [type] Function
 */
pluginNeededButNotInstalledCb = null;
/**
 * Note:
 *  The Object used in SkywayJS to check the WebRTC Detected type
 * [attribute] WebRTCDetectedBrowser
 * [type] JSON
 */
webrtcDetectedBrowser = {};
/**
 * Note:
 *  The Object to store the list of DataChannels
 * [attribute] RTCDataChannels
 * [type] JSON
 */
RTCDataChannels = {};
/**
 * Note:
 *  The Object to store Plugin information
 * [attribute] temPluginInfo
 * [type] JSON
 */
temPluginInfo = {
  pluginId : 'plugin0',
  type : 'application/x-temwebrtcplugin',
  onload : 'TemInitPlugin0'
};
/**
 * Note:
 * Unique identifier of each opened page
 * [attribute] TemPageId
 * [type] String
 */
TemPageId = Math.random().toString(36).slice(2);
/**
 * Note:
 * - Latest Opera supports Webkit WebRTC
 * - IE is detected as Safari
 * - Older Firefox and Chrome does not support WebRTC
 * - Detected "Safari" Browsers:
 *   - Firefox 1.0+
 *   - IE 6+
 *   - Safari 3+: '[object HTMLElementConstructor]'
 *   - Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
 *   - Chrome 1+
 * 1st Step: Get browser OS
 * 2nd Step: Check browser DataChannels Support
 * 3rd Step: Check browser WebRTC Support type
 * 4th Step: Get browser version
 * [Credits]: Get version of Browser. Code provided by kennebec@stackoverflow.com
 * [Credits]: IsSCTP/isRTPD Supported. Code provided by DetectRTC by Muaz Khan
 *
 * @method getBrowserVersion
 * @protected
 */
getBrowserVersion = function () {
  var agent = {},
  na = navigator,
  ua = na.userAgent,
  tem;
  var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

  agent.os = navigator.platform;
  agent.isSCTPDCSupported = agent.mozWebRTC || (agent.browser === 'Chrome' && agent.version >= 25);
  agent.isRTPDCSupported = agent.browser === 'Chrome' && agent.version >= 31;
  if (!agent.isSCTPDCSupported && !agent.isRTPDCSupported) {
    // Plugin magic here
    agent.isPluginSupported = true;
  }
  if (na.mozGetUserMedia) {
    agent.mozWebRTC = true;
  } else if (na.webkitGetUserMedia) {
    agent.webkitWebRTC = true;
  } else {
    if (ua.indexOf('Safari')) {
      if (typeof InstallTrigger !== 'undefined') {
        agent.browser = 'Firefox';
      } else if (/*@cc_on!@*/
        false || !!document.documentMode) {
        agent.browser = 'IE';
      } else if (
        Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
        agent.browser = 'Safari';
      } else if (!!window.opera || na.userAgent.indexOf(' OPR/') >= 0) {
        agent.browser = 'Opera';
      } else if (!!window.chrome) {
        agent.browser = 'Chrome';
      }
      agent.pluginWebRTC = true;
    }
  }
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    agent.browser = 'IE';
    agent.version = parseInt(tem[1] || '0', 10);
  } else if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR\/(\d+)/);
    if (tem !== null) {
      agent.browser = 'Opera';
      agent.version = parseInt(tem[1], 10);
    }
  }
  if (!agent.browser) {
    agent.browser = M[1];
  }
  if (!agent.version) {
    try {
      M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
      if ((tem = ua.match(/version\/(\d+)/i)) !== null) {
        M.splice(1, 1, tem[1]);
      }
      agent.version = parseInt(M[1], 10);
    } catch (err) {
      agent.version = 0;
    }
  }
  return agent;
};
webrtcDetectedBrowser = getBrowserVersion();
/**
 * Note:
 *  use this whenever you want to call the plugin
 * [attribute] plugin
 * [type DOM] {Object}
 * [protected]
 */
TemRTCPlugin = null;
/**
 * Note:
 *  webRTC readu Cb, should only be called once.
 *  Need to prevent Chrome + plugin form calling WebRTCReadyCb twice
 *  --------------------------------------------------------------------------
 *  WebRTCReadyCb is callback function called when the browser is webrtc ready
 *  this can be because of the browser or because of the plugin
 *  Override WebRTCReadyCb and use it to do whatever you need to do when the
 *  page is ready
 * [attribute] TemPrivateWebRTCReadyCb
 * [type] Function
 * [private]
 */
TemPrivateWebRTCReadyCb = function () {
  arguments.callee.StaticWasInit = arguments.callee.StaticWasInit || 1;
  if (arguments.callee.StaticWasInit === 1) {
    if (typeof WebRTCReadyCb === 'function') {
      WebRTCReadyCb();
    }
  }
  arguments.callee.StaticWasInit++;
};
/**
 * Note:
 *  !!! DO NOT OVERRIDE THIS FUNCTION !!!
 *  This function will be called when plugin is ready
 *  it sends necessary details to the plugin.
 *  If you need to do something once the page/plugin is ready, override
 *  TemPrivateWebRTCReadyCb instead.
 *  This function is not in the IE/Safari condition brackets so that
 *  TemPluginLoaded function might be called on Chrome/Firefox
 * [attribute] TemInitPlugin0
 * [type] Function
 * [protected]
 */
TemInitPlugin0 = function () {
  TemRTCPlugin.setPluginId(TemPageId, temPluginInfo.pluginId);
  TemRTCPlugin.setLogFunction(console);
  TemPrivateWebRTCReadyCb();
};
/**
 * Note:
 *  To Fix Configuration as some browsers,
 *  some browsers does not support the 'urls' attribute
 * - .urls is not supported in FF yet.
 * [attribute] maybeFixConfiguration
 * [type] Function
 * _ [param] {JSON} pcConfig
 * [private]
 */
maybeFixConfiguration = function (pcConfig) {
  if (pcConfig === null) {
    return;
  }
  for (var i = 0; i < pcConfig.iceServers.length; i++) {
    if (pcConfig.iceServers[i].hasOwnProperty('urls')) {
      pcConfig.iceServers[i].url = pcConfig.iceServers[i].urls;
      delete pcConfig.iceServers[i].urls;
    }
  }
};
/*******************************************************************
 Check for browser types and react accordingly
*******************************************************************/
if (webrtcDetectedBrowser.mozWebRTC) {
  /**
   * Note:
   *  Creates a RTCPeerConnection object for moz
   *
   * [method] RTCPeerConnection
   * [param] {JSON} pcConfig
   * [param] {JSON} pcConstraints
   */
  RTCPeerConnection = function (pcConfig, pcConstraints) {
    maybeFixConfiguration(pcConfig);
    return new mozRTCPeerConnection(pcConfig, pcConstraints);
  };

  RTCSessionDescription = mozRTCSessionDescription;
  RTCIceCandidate = mozRTCIceCandidate;
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);
  navigator.getUserMedia = getUserMedia;

  /**
   * Note:
   *   Creates iceServer from the url for Firefox.
   *  - Create iceServer with stun url.
   *  - Create iceServer with turn url.
   *    - Ignore the transport parameter from TURN url for FF version <=27.
   *    - Return null for createIceServer if transport=tcp.
   *  - FF 27 and above supports transport parameters in TURN url,
   *    - So passing in the full url to create iceServer.
   *
   * [method] createIceServer
   * [param] {String} url
   * [param] {String} username
   * [param] {String} password
   */
  createIceServer = function (url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      iceServer = { 'url' : url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      if (webrtcDetectedBrowser.version < 27) {
        var turn_url_parts = url.split('?');
        if (turn_url_parts.length === 1 || turn_url_parts[1].indexOf('transport=udp') === 0) {
          iceServer = {
            'url' : turn_url_parts[0],
            'credential' : password,
            'username' : username
          };
        }
      } else {
        iceServer = {
          'url' : url,
          'credential' : password,
          'username' : username
        };
      }
    }
    return iceServer;
  };

  /**
   * Note:
   *  Creates IceServers for Firefox
   *  - Use .url for FireFox.
   *  - Multiple Urls support
   *
   * [method] createIceServers
   * [param] {JSON} pcConfig
   * [param] {JSON} pcConstraints
   */
  createIceServers = function (urls, username, password) {
    var iceServers = [];
    for (i = 0; i < urls.length; i++) {
      var iceServer = createIceServer(urls[i], username, password);
      if (iceServer !== null) {
        iceServers.push(iceServer);
      }
    }
    return iceServers;
  };

  /**
   * Note:
   *  Attach Media Stream for moz
   *
   * [method] attachMediaStream
   * [param] {HTMLVideoDOM} element
   * [param] {Blob} Stream
   */
  attachMediaStream = function (element, stream) {
    console.log('Attaching media stream');
    element.mozSrcObject = stream;
    element.play();
    return element;
  };

  /**
   * Note:
   *  Re-attach Media Stream for moz
   *
   * [method] attachMediaStream
   * [param] {HTMLVideoDOM} to
   * [param] {HTMLVideoDOM} from
   */
  reattachMediaStream = function (to, from) {
    console.log('Reattaching media stream');
    to.mozSrcObject = from.mozSrcObject;
    to.play();
    return to;
  };

  /*******************************************************
   Fake get{Video,Audio}Tracks
  ********************************************************/
  if (!MediaStream.prototype.getVideoTracks) {
    MediaStream.prototype.getVideoTracks = function () {
      return [];
    };
  }
  if (!MediaStream.prototype.getAudioTracks) {
    MediaStream.prototype.getAudioTracks = function () {
      return [];
    };
  }
  TemPrivateWebRTCReadyCb();
} else if (webrtcDetectedBrowser.webkitWebRTC) {
  /**
   * Note:
   *  Creates iceServer from the url for Chrome M33 and earlier.
   *  - Create iceServer with stun url.
   *  - Chrome M28 & above uses below TURN format.
   *
   * [method] createIceServer
   * [param] {String} url
   * [param] {String} username
   * [param] {String} password
   */
  createIceServer = function (url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      iceServer = { 'url' : url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      iceServer = {
        'url' : url,
        'credential' : password,
        'username' : username
      };
    }
    return iceServer;
  };

  /**
   * Note:
   *   Creates iceServers from the urls for Chrome M34 and above.
   *  - .urls is supported since Chrome M34.
   *  - Multiple Urls support
   *
   * [method] createIceServers
   * [param] {Array} urls
   * [param] {String} username
   * [param] {String} password
   */
  createIceServers = function (urls, username, password) {
    var iceServers = [];
    if (webrtcDetectedBrowser.version >= 34) {
      iceServers = {
        'urls' : urls,
        'credential' : password,
        'username' : username
      };
    } else {
      for (i = 0; i < urls.length; i++) {
        var iceServer = createIceServer(urls[i], username, password);
        if (iceServer !== null) {
          iceServers.push(iceServer);
        }
      }
    }
    return iceServers;
  };

  /**
   * Note:
   *  Creates an RTCPeerConection Object for webkit
   * - .urls is supported since Chrome M34.
   * [method] RTCPeerConnection
   * [param] {String} url
   * [param] {String} username
   * [param] {String} password
   */
  RTCPeerConnection = function (pcConfig, pcConstraints) {
    if (webrtcDetectedBrowser.version < 34) {
      maybeFixConfiguration(pcConfig);
    }
    return new webkitRTCPeerConnection(pcConfig, pcConstraints);
  };

  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
  navigator.getUserMedia = getUserMedia;

  /**
   * Note:
   *  Attach Media Stream for webkit
   *
   * [method] attachMediaStream
   * [param] {HTMLVideoDOM} element
   * [param] {Blob} Stream
   */
  attachMediaStream = function (element, stream) {
    if (typeof element.srcObject !== 'undefined') {
      element.srcObject = stream;
    } else if (typeof element.mozSrcObject !== 'undefined') {
      element.mozSrcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      console.log('Error attaching stream to element.');
    }
    return element;
  };

  /**
   * Note:
   *  Re-attach Media Stream for webkit
   *
   * [method] attachMediaStream
   * [param] {HTMLVideoDOM} to
   * [param] {HTMLVideoDOM} from
   */
  reattachMediaStream = function (to, from) {
    to.src = from.src;
    return to;
  };
  TemPrivateWebRTCReadyCb();
} else if (webrtcDetectedBrowser.pluginWebRTC) {
  // var isOpera = webrtcDetectedBrowser.browser === 'Opera'; // Might not be used.
  var isFirefox = webrtcDetectedBrowser.browser === 'Firefox';
  var isSafari = webrtcDetectedBrowser.browser === 'Safari';
  var isChrome = webrtcDetectedBrowser.browser === 'Chrome';
  var isIE = webrtcDetectedBrowser.browser === 'IE';

  /********************************************************************************
    Load Plugin
  ********************************************************************************/
  TemRTCPlugin = document.createElement('object');
  TemRTCPlugin.id = temPluginInfo.pluginId;
  TemRTCPlugin.style.visibility = 'hidden';
  TemRTCPlugin.type = temPluginInfo.type;
  TemRTCPlugin.innerHTML = '<param name="onload" value="' +
    temPluginInfo.onload + '">' +
    '<param name="pluginId" value="' +
    temPluginInfo.pluginId + '">' +
    '<param name="pageId" value="' + TemPageId + '">';
  document.getElementsByTagName('body')[0].appendChild(TemRTCPlugin);
  TemRTCPlugin.onreadystatechange = function (state) {
    console.log('Plugin: Ready State : ' + state);
    if (state === 4) {
      console.log('Plugin has been loaded');
    }
  };
  /**
   * Note:
   *   Checks if the Plugin is installed
   *  - Check If Not IE (firefox, for example)
   *  - Else If it's IE - we're running IE and do something
   *  - Else Unsupported
   *
   * [method] isPluginInstalled
   * [param] {String} comName
   * [param] {String} plugName
   * [param] {Function} installedCb
   * [param] {Function} notInstalledCb
   */
  isPluginInstalled = function (comName, plugName, installedCb, notInstalledCb) {
    if (isChrome || isSafari || isFirefox) {
      var pluginArray = navigator.plugins;
      for (var i = 0; i < pluginArray.length; i++) {
        if (pluginArray[i].name.indexOf(plugName) >= 0) {
          installedCb();
          return;
        }
      }
      notInstalledCb();
    } else if (isIE) {
      try {
        new ActiveXObject(comName + '.' + plugName);
      } catch (e) {
        notInstalledCb();
        return;
      }
      installedCb();
    } else {
      return;
    }
  };

  /**
   * Note:
   *   Define Plugin Browsers as WebRTC Interface
   *
   * [method] defineWebRTCInterface
   */
  defineWebRTCInterface = function () {
    /**
    * Note:
    *   Check if WebRTC Interface is Defined
    * - This is a Util Function
    *
    * [method] isDefined
    * [param] {String} variable
    */
    isDefined = function (variable) {
      return variable !== null && variable !== undefined;
    };

    /**
    * Note:
    *   Creates Ice Server for Plugin Browsers
    * - If Stun - Create iceServer with stun url.
    * - Else - Create iceServer with turn url
    * - This is a WebRTC Function
    *
    * [method] createIceServer
    * [param] {String} url
    * [param] {String} username
    * [param] {String} password
    */
    createIceServer = function (url, username, password) {
      var iceServer = null;
      var url_parts = url.split(':');
      if (url_parts[0].indexOf('stun') === 0) {
        iceServer = {
          'url' : url,
          'hasCredentials' : false
        };
      } else if (url_parts[0].indexOf('turn') === 0) {
        iceServer = {
          'url' : url,
          'hasCredentials' : true,
          'credential' : password,
          'username' : username
        };
      }
      return iceServer;
    };

    /**
    * Note:
    *   Creates Ice Servers for Plugin Browsers
    * - Multiple Urls support
    * - This is a WebRTC Function
    *
    * [method] createIceServers
    * [param] {Array} urls
    * [param] {String} username
    * [param] {String} password
    */
    createIceServers = function (urls, username, password) {
      var iceServers = [];
      for (var i = 0; i < urls.length; ++i) {
        iceServers.push(createIceServer(urls[i], username, password));
      }
      return iceServers;
    };

    /**
    * Note:
    *   Creates RTCSessionDescription object for Plugin Browsers
    * - This is a WebRTC Function
    *
    * [method] RTCSessionDescription
    * [param] {Array} urls
    * [param] {String} username
    * [param] {String} password
    */
    RTCSessionDescription = function (info) {
      return TemRTCPlugin.ConstructSessionDescription(info.type, info.sdp);
    };

    /**
    * Note:
    *   Creates RTCPeerConnection object for Plugin Browsers
    * - This is a WebRTC Function
    *
    * [method] RTCSessionDescription
    * [param] {JSON} servers
    * [param] {JSON} contstraints
    */
    RTCPeerConnection = function (servers, constraints) {
      var iceServers = null;
      if (servers) {
        iceServers = servers.iceServers;
        for (var i = 0; i < iceServers.length; i++) {
          if (iceServers[i].urls && !iceServers[i].url) {
            iceServers[i].url = iceServers[i].urls;
          }
          iceServers[i].hasCredentials = isDefined(iceServers[i].username) &&
            isDefined(iceServers[i].credential);
        }
      }
      var mandatory = (constraints && constraints.mandatory) ? constraints.mandatory : null;
      var optional = (constraints && constraints.optional) ? constraints.optional : null;
      return TemRTCPlugin.PeerConnection(TemPageId, iceServers, mandatory, optional);
    };

    MediaStreamTrack = {};
    MediaStreamTrack.getSources = function (callback) {
      TemRTCPlugin.GetSources(callback);
    };

    /*******************************************************
     getUserMedia
    ********************************************************/
    getUserMedia = function (constraints, successCallback, failureCallback) {
      if (!constraints.audio) {
        constraints.audio = false;
      }
      TemRTCPlugin.getUserMedia(constraints, successCallback, failureCallback);
    };
    navigator.getUserMedia = getUserMedia;

    /**
     * Note:
     *  Attach Media Stream for Plugin Browsers
     *  - If Check is audio element
     *  - Else The sound was enabled, there is nothing to do here
     *
     * [method] attachMediaStream
     * [param] {HTMLVideoDOM} element
     * [param] {Blob} Stream
     */
    attachMediaStream = function (element, stream) {
      stream.enableSoundTracks(true);
      if (element.nodeName.toLowerCase() !== 'audio') {
        var elementId = element.id.length === 0 ? Math.random().toString(36).slice(2) : element.id;
        if (!element.isTemWebRTCPlugin || !element.isTemWebRTCPlugin()) {
          var frag = document.createDocumentFragment();
          var temp = document.createElement('div');
          var classHTML = (element.className) ? 'class="' + element.className + '" ' : '';
          temp.innerHTML = '<object id="' + elementId + '" ' + classHTML +
            'type="application/x-temwebrtcplugin">' +
            '<param name="pluginId" value="' + elementId + '" /> ' +
            '<param name="pageId" value="' + TemPageId + '" /> ' +
            '<param name="streamId" value="' + stream.id + '" /> ' +
            '</object>';
          while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
          }
          var rectObject = element.getBoundingClientRect();
          element.parentNode.insertBefore(frag, element);
          frag = document.getElementById(elementId);
          frag.width = rectObject.width + 'px';
          frag.height = rectObject.height + 'px';
          element.parentNode.removeChild(element);
        } else {
          var children = element.children;
          for (var i = 0; i !== children.length; ++i) {
            if (children[i].name === 'streamId') {
              children[i].value = stream.id;
              break;
            }
          }
          element.setStreamId(stream.id);
        }
        var newElement = document.getElementById(elementId);
        newElement.onclick = (element.onclick) ? element.onclick : function (arg) {};
        newElement._TemOnClick = function (id) {
          var arg = {
            srcElement : document.getElementById(id)
          };
          newElement.onclick(arg);
        };
        return newElement;
      } else {
        return element;
      }
    };

    /**
     * Note:
     *  Re-attach Media Stream for Plugin Browsers
     *
     * [method] attachMediaStream
     * [param] {HTMLVideoDOM} to
     * [param] {HTMLVideoDOM} from
     */
    reattachMediaStream = function (to, from) {
      var stream = null;
      var children = from.children;
      for (var i = 0; i !== children.length; ++i) {
        if (children[i].name === 'streamId') {
          stream = TemRTCPlugin.getStreamWithId(TemPageId, children[i].value);
          break;
        }
      }
      if (stream !== null) {
        return attachMediaStream(to, stream);
      } else {
        alert('Could not find the stream associated with this element');
      }
    };

    /**
    * Note:
    *   Creates RTCIceCandidate object for Plugin Browsers
    * - This is a WebRTC Function
    *
    * [method] RTCIceCandidate
    * [param] {JSON} candidate
    */
    RTCIceCandidate = function (candidate) {
      if (!candidate.sdpMid) {
        candidate.sdpMid = '';
      }
      return TemRTCPlugin.ConstructIceCandidate(
        candidate.sdpMid, candidate.sdpMLineIndex, candidate.candidate
      );
    };
  };

  pluginNeededButNotInstalledCb = function () {
    alert('Your browser is not webrtc ready and Temasys plugin is not installed');
  };
  // Try to detect the plugin and act accordingly
  isPluginInstalled('Tem', 'TemWebRTCPlugin', defineWebRTCInterface, pluginNeededButNotInstalledCb);
} else {
  console.log('Browser does not appear to be WebRTC-capable');
};(function () {

  /**
   * @class Skyway
   * @constructor
   * @param {String} serverpath Path to the server to collect infos from.
   *                            Ex: https://developer.temasys.com.sg/
   * @param {String} appID      The AppID of the Application you tied to this domain
   * @param {string} room     Name of the room to join.
   */
  function Skyway() {
    if (!(this instanceof Skyway)) {
      return new Skyway();
    }

    this.VERSION = '0.0.1';

    // NOTE ALEX: check if last char is '/'
    /**
     * @attribute _path
     * @type String
     * @default serverpath
     * @final
     * @required
     * @private
     */
    this._path = null;

    /**
     * The API key (not used)
     * @attribute key
     * @type String
     * @private
     */
    this._key = null;
    /**
     * the actual socket that handle the connection
     *
     * @attribute _socket
     * @required
     * @private
     */
    this._socket = null;
    /**
     * the socket version of the socket.io used
     *
     * @attribute _socketVersion
     * @private
     */
    this._socketVersion = null;
    /**
     * User Information, credential and the local stream(s).
     * @attribute _user
     * @required
     * @private
     *
     */
    this._user = null;
    /**
     * @attribute _room
     * @type JSON
     * @required
     * @private
     *
     * @param {} room  Room Information, and credentials.
     * @param {String} room.id
     * @param {String} room.token
     * @param {String} room.tokenTimestamp
     * @param {String} room.displayName Displayed name
     * @param {JSON} room.signalingServer
     * @param {String} room.signalingServer.ip
     * @param {String} room.signalingServer.port
     * @param {JSON} room.pcHelper Holder for all the constraints objects used
     *   in a peerconnection lifetime. Some are initialized by default, some are initialized by
     *   internal methods, all can be overriden through updateUser. Future APIs will help user
     * modifying specific parts (audio only, video only, ...) separately without knowing the
     * intricacies of constraints.
     * @param {JSON} room.pcHelper.pcConstraints
     * @param {JSON} room.pcHelper.pcConfig Will be provided upon connection to a room
     * @param {JSON}  [room.pcHelper.pcConfig.mandatory]
     * @param {Array} [room.pcHelper.pcConfig.optional]
     *   Ex: [{DtlsSrtpKeyAgreement: true}]
     * @param {JSON} room.pcHelper.offerConstraints
     * @param {JSON} [room.pcHelper.offerConstraints.mandatory]
     *   Ex: {MozDontOfferDataChannel:true}
     * @param {Array} [room.pcHelper.offerConstraints.optional]
     * @param {JSON} room.pcHelper.sdpConstraints
     * @param {JSON} [room.pcHelper.sdpConstraints.mandatory]
     *   Ex: { 'OfferToReceiveAudio':true, 'OfferToReceiveVideo':true }
     * @param {Array} [room.pcHelper.sdpConstraints.optional]
     */
    this._room = null;

    /**
     * Internal array of peerconnections
     * @attribute _peerConnections
     * @attribute
     * @private
     * @required
     */
    this._peerConnections = [];
    this._browser = null;
    this._readyState = 0; // 0 'false or failed', 1 'in process', 2 'done'
    this._channel_open = false;
    this._in_room = false;
    this._uploadDataTransfers = {};
    this._downloadDataTransfers = {};
    this._dataTransfersTimeout = {};
    this._chunkFileSize = 49152; // [25KB because Plugin] 60 KB Limit | 4 KB for info

    this._loadSocket = function (ipSigserver, portSigserver, onSuccess, onError) {
      var socketScript = document.createElement('script');
      socketScript.src = 'http://' + ipSigserver + ':' +
        portSigserver + '/socket.io/socket.io.js';
      socketScript.onreadystatechange = onSuccess;
      socketScript.onload = onSuccess;
      socketScript.onerror = onError;
      document.getElementsByTagName('head')[0].appendChild(socketScript);
    };

    this._parseInfo = function (info, self) {
      console.log(info);

      if (!info.pc_constraints && !info.offer_constraints) {
        self._trigger('apiError');
        return;
      }
      console.log(JSON.parse(info.pc_constraints));
      console.log(JSON.parse(info.offer_constraints));

      self._key = info.cid;
      self._user = {
        id        : info.username,
        token     : info.userCred,
        timeStamp : info.timeStamp,
        displayName : info.displayName,
        apiOwner : info.apiOwner,
        streams : []
      };
      self._room = {
        id : info.room_key,
        token : info.roomCred,
        start: info.start,
        len: info.len,
        signalingServer : {
          ip : info.ipSigserver,
          port : info.portSigserver
        },
        pcHelper : {
          pcConstraints : JSON.parse(info.pc_constraints),
          pcConfig : null,
          offerConstraints : JSON.parse(info.offer_constraints),
          sdpConstraints : {
            mandatory : {
              OfferToReceiveAudio : true,
              OfferToReceiveVideo : true
            }
          }
        }
      };
      if (webrtcDetectedBrowser.mozWebRTC) {
        delete self._room.pcHelper.offerConstraints.mandatory.MozDontOfferDataChannel;
      }
      // Load the script for the socket.io
      self._loadSocket(info.ipSigserver, info.portSigserver, function () {
        console.log('API - Socket IO Loading...');
        if (window.io) {
          console.log('API - Socket IO Loaded');
          self._readyState = 2;
          self._trigger('readyStateChange', 2);
        } else {
          console.log('API - Socket.io is not loaded.');
          return;
        }
      }, function (err) {
        console.error('API - Socket IO Failed to load');
        if (err) {
          console.exception(err);
        }
        return;
      });

      console.log('API - Parsed infos from webserver. Ready.');
    };

    this._init = function (self) {
      if (!window.XMLHttpRequest) {
        console.log('XHR - XMLHttpRequest not supported');
        return;
      }
      if (!window.RTCPeerConnection) {
        console.log('RTC - WebRTC not supported.');
        return;
      }
      if (!this._path) {
        console.log('API - No connection info. Call init() first.');
        return;
      }

      self._readyState = 1;
      self._trigger('readyStateChange', 1);

      var xhr = new window.XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          if (this.status !== 200) {
            console.log('XHR - ERROR ' + this.status, false);
            self._readyState = 0;
            self._trigger('readyStateChange', 0);
            return;
          }
          console.log('API - Got infos from webserver.');
          self._parseInfo(JSON.parse(this.response), self);
        }
      };
      xhr.open('GET', self._path, true);
      console.log('API - Fetching infos from webserver');
      xhr.send();
      console.log('API - Waiting for webserver to provide infos.');
    };
  }

  this.Skyway = Skyway;

  /**
   * Let app register a callback function to an event
   *
   * @method on
   * @param {String} eventName
   * @param {Function} callback
   */
  Skyway.prototype.on = function (eventName, callback) {
    if ('function' === typeof callback) {
      this._events[eventName] = this._events[eventName] || [];
      this._events[eventName].push(callback);
    }
  };

  /**
   * Let app unregister a callback function from an event
   *
   * @method off
   * @param {String} eventName
   * @param {Function} callback
   */
  Skyway.prototype.off = function (eventName, callback) {
    if (callback === undefined) {
      this._events[eventName] = [];
      return;
    }
    var arr = this._events[eventName],
    l = arr.length,
    e = false;
    for (var i = 0; i < l; i++) {
      if (arr[i] === callback) {
        arr.splice(i, 1);
        break;
      }
    }
  };

  /**
   * Trigger all the callbacks associated with an event
   * Note that extra arguments can be passed to the callback
   * which extra argument can be expected by callback is documented by each event
   *
   * @method trigger
   * @param {String} eventName
   * @for Skyway
   * @private
   */
  Skyway.prototype._trigger = function (eventName) {
    var args = Array.prototype.slice.call(arguments),
    arr = this._events[eventName];
    args.shift();
    for (var e in arr) {
      if (arr[e].apply(this, args) === false) {
        break;
      }
    }
  };

  /**
   * @method init
   * @param {String} roomserver - Path to the Temasys backend server
   * @param {String} appID - AppID to identify with the Temasys backend server
   * @param {String} room - Roomname
   */
  Skyway.prototype.init = function (roomserver, appID, room) {
    // Checking and adding params for different socket.io versions
    var socketCheck = {};
    if (window.location.search) {
      var parts = window.location.search.substring(1).split('&');
      for (var i = 0; i < parts.length; i++) {
        var nv = parts[i].split('=');
        if (!nv[0]) {
          continue;
        }
        socketCheck[nv[0]] = nv[1] || true;
      }
    }
    if (roomserver.lastIndexOf('/') !== (roomserver.length - 1)) {
      roomserver += '/';
    }
    this._readyState = 0;
    this._trigger('readyStateChange', 0);
    this._key = appID;
    this._path = roomserver + 'api/' + appID + '/' + room;

    console.log('API - Socket Version: ' + socketCheck.io);

    if(socketCheck.io){
      this._socketVersion = socketCheck.io;
      this._path += '&io=' + socketCheck.io;
    }
    console.log('API - Path: ' + this._path);
    this._init(this);
  };

  /**
   * @method setUser
   * @param {} user
   * @param {String} user.id username in the system, will be 'Guestxxxxx' if not logged in
   * @param {String} user.token Token for user verification upon connection
   * @param {String} user.tokenTimestamp Token timestamp for connection validation.
   * @param {String} user.displayName Displayed name
   * @param {Array}  user.streams List of all the local streams. Can ge generated internally
   *                              by getDefaultStream(), or provided through updateUser().
   */
  Skyway.prototype.setUser = function (user) {
    // NOTE ALEX: be smarter and copy fields and only if different
    this._user = user;
  };

  /* Syntactically private variables and utility functions */

  Skyway.prototype._events = {
    /**
     * Event fired when there's invalid pcConfig retrieved. This is usually caused by
     * invalid API keys, Roomserver provided or hosted domain.
     * @event apiError
     */
    'apiError' : [],
    /**
     * Event fired when a successfull connection channel has been established
     * with the signaling server
     * @event channelOpen
     */
    'channelOpen' : [],
    /**
     * Event fired when the channel has been closed.
     * @event channelClose
     */
    'channelClose' : [],
    /**
     * Event fired when we received a message from the sig server..
     * @event channelMessage
     */
    'channelMessage' : [],
    /**
     * Event fired when there was an error with the connection channel to the sig server.
     * @event channelError
     * @param {String} error
     */
    'channelError' : [],

    /**
     * Event fired when user joins the room
     * @event joinedRoom
     * @param {String} roomID
     * @param {String} userID
     */
    'joinedRoom' : [],
    /**
     * Event fired whether the room is ready for use
     * @event readyStateChange
     * @param {String} readyState
     * - 0: Init state. If ReadyState fails, it goes to 0.
     * - 1: RTCPeerConnection exists. Roomserver, API ID provided is not empty
     * - 2: Retrieval of configuration is complete. Socket.io begins connection.
     */
    'readyStateChange' : [],
    /**
     * Event fired when a step of the handshake has happened. Usefull for diagnostic
     * or progress bar.
     * @event handshakeProgress
     * @param {String} step
     * - 'enter'   : Step 1. Received enter from Peer
     * - 'welcome' : Step 2. Received welcome from Peer
     * - 'offer'   : Step 3. Received offer from Peer
     * - 'answer'  : Step 4. Received answer from Peer
     */
    'handshakeProgress' : [],
    /**
     * Event fired during ICE gathering
     * @event candidateGenerationState
     * @param {String} state
     * - 'gathering': ICE Gathering to Peer has just started
     * - 'done'     : ICE Gathering to Peer has been completed
     */
    'candidateGenerationState' : [],
    /**
     * TODO Event fired during PeerConnection change stated
     * @event peerConnectionState
     * @private
     */
    'peerConnectionState' : [],
    /**
     * Event fired during ICE connection
     * @iceConnectionState
     * @param {String} state
     * - 'new'         : ICE Connection to Peer initialized
     * - 'closed'      : ICE Connection to Peer has been closed
     * - 'failed'      : ICE Connection to Peer has failed
     * - 'checking'    : ICE Connection to Peer is still in checking status
     * - 'disconnected': ICE Connection to Peer has been disconnected
     * - 'connected'   : ICE Connection to Peer has been connected
     * - 'completed'   : ICE Connection to Peer has been completed
     */
    'iceConnectionState' : [],
    //-- per peer, local media events
    /**
     * Event fired when allowing webcam media stream fails
     * @event mediaAccessError
     * @param {String} error
     */
    'mediaAccessError' : [],
    /**
     * Event fired when allowing webcam media stream passes
     * @event mediaAccessSuccess
     * @param {Object} stream
     */
    'mediaAccessSuccess' : [],
    /**
     * Event fired when a chat message is received from other peers
     * @event chatMessage
     * @param {String}  msg
     * @param {String}  displayName
     * @param {Boolean} pvt
     */
    'chatMessage' : [],
    /**
     * Event fired when a peer joins the room
     * @event peerJoined
     * @param {String} peerID
     */
    'peerJoined' : [],
    /**
     * TODO Event fired when a peer leaves the room
     * @event peerLeft
     * @param {String} peerID
     */
    'peerLeft' : [],
    /**
     * TODO Event fired when a peer joins the room
     * @event presenceChanged
     * @param {JSON} users The list of users
     */
    'presenceChanged' : [],
    /**
     * TODO Event fired when a room is locked
     * @event roomLock
     * @param {Boolean} isLocked
     * @private
     */
    'roomLock' : [],

    //-- per peer, peer connection events
    /**
     * Event fired when a remote stream has become available
     * @event addPeerStream
     * @param {String} peerID
     * @param {Object} stream
     */
    'addPeerStream' : [],
    /**
     * Event fired when a remote stream has become unavailable
     * @event removePeerStream
     * @param {String} peerID
     */
    'removePeerStream' : [],
    /**
     * TODO Event fired when a peer's video is muted
     * @event peerVideoMute
     * @param {String} peerID
     * @param {Boolean} isMuted
     * @private
     *
     */
    'peerVideoMute' : [],
    /**
     * TODO Event fired when a peer's audio is muted
     * @param {String} peerID
     * @param {Boolean} isMuted
     * @private
     */
    'peerAudioMute' : [],

    //-- per user events
    /**
     * TODO Event fired when a contact is added
     * @param {String} userID
     * @private
     */
    'addContact' : [],
    /**
     * TODO Event fired when a contact is removed
     * @param {String} userID
     * @private
     */
    'removeContact' : [],
    /**
     * TODO Event fired when a contact is invited
     * @param {String} userID
     * @private
     */
    'invitePeer' : [],
    /**
     * Event fired when a Peer has started a data transfer
     * @event startDataTransfer
     * @param {String} itemID FileID
     * @param {String} senderID The ID of the Peer that's sending the data
     * @param {String} filename Filename of the data
     * @param {String} filesize Filesize of the data
     * @param {String} type
     * - 'upload': For the Peer that's sending the data
     * - 'download': For the Peer that's receiving the data
     * @param {BlobURL} data Only received usually for the Peer's that sending the data
     */
    'startDataTransfer' : [],
    /**
     * Event fired when data is received from Peer
     * @event dataTransfer
     * @param {String} itemID FileID
     * @param {String} type
     * - 'upload'  : For the Peer that's sending the data
     * - 'download': For the Peer that's receiving the data
     * @param {Float} percentage Percentage range is from 0.0 to 1.0
     * @param {String} peerID Used for the sender to identify
     * which Peer has successfully received the data
     * @param {BlobURL} data Only received when Peer has successfully
     * completed receiving the data
     */
    'dataTransfer' : [],
    /**
     * Event fired when user has successfully sent data to Peer
     * @event dataTransferCompleted
     * @param {String} itemID FileID
     * @param {String} peerID Used for the sender to identity
     * which Peer has successfully received the data
    */
    'dataTransferCompleted' : []
  };

  /**
   * Send a chat message
   * @method sendChatMsg
   * @param {JSON}   chatMsg
   * @param {String} chatMsg.msg
   * @param {String} [targetPeerID]
   */
  Skyway.prototype.sendChatMsg = function (chatMsg, targetPeerID) {
    var msg_json = {
      cid : this._key,
      data : chatMsg,
      mid : this._user.id,
      nick : this._user.displayName,
      rid : this._room.id,
      type : 'chat'
    };
    if (targetPeerID) {
      msg_json.target = targetPeerID;
    }
    this._sendMessage(msg_json);
    this._trigger('chatMessage',
      chatMsg,
      this._user.displayName,
      !!targetPeerID);
  };

  /**
   * Get the default cam and microphone
   * @method getDefaultStream
   */
  Skyway.prototype.getDefaultStream = function () {
    var self = this;
    try {
      window.getUserMedia({
        'audio' : true,
        'video' : true
      }, function (s) {
        self._onUserMediaSuccess(s, self);
      }, function (e) {
        self._onUserMediaError(e, self);
      });
      console.log('API - Requested: A/V.');
    } catch (e) {
      this._onUserMediaError(e, self);
    }
  };

  /**
   * Stream is available, let's throw the corresponding event with the stream attached.
   *
   * @method getDefaultStreama
   * @param {} stream The acquired stream
   * @param {} t      A convenience pointer to the Skyway object for callbacks
   * @private
   */
  Skyway.prototype._onUserMediaSuccess = function (stream, t) {
    console.log('API - User has granted access to local media.');
    t._trigger('mediaAccessSuccess', stream);
    t._user.streams.push(stream);
  };

  /**
   * getUserMedia could not succeed.
   *
   * @method _onUserMediaError
   * @param {} e error
   * @param {} t A convenience pointer to the Skyway object for callbacks
   * @private
   */
  Skyway.prototype._onUserMediaError = function (e, t) {
    console.log('API - getUserMedia failed with exception type: ' + e.name);
    if (e.message) {
      console.log('API - getUserMedia failed with exception: ' + e.message);
    }
    if (e.constraintName) {
      console.log('API - getUserMedia failed because of the following constraint: ' +
        e.constraintName);
    }
    t._trigger('mediaAccessError', e.name);
  };

  /**
   * Handle every incoming message. If it's a bundle, extract single messages
   * Eventually handle the message(s) to _processSingleMsg
   *
   * @method _processingSigMsg
   * @param {JSON} message
   * @private
   */
  Skyway.prototype._processSigMsg = function (message) {
    var msg = JSON.parse(message);
    if (msg.type === 'group') {
      console.log('API - Bundle of ' + msg.lists.length + ' messages.');
      for (var i = 0; i < msg.lists.length; i++) {
        this._processSingleMsg(msg.lists[i]);
      }
    } else {
      this._processSingleMsg(msg);
    }
  };

  /**
   * This dispatch all the messages from the infrastructure to their respective handler
   *
   * @method _processingSingleMsg
   * @param {JSON str} msg
   * @private
   */
  Skyway.prototype._processSingleMsg = function (msg) {
    this._trigger('channelMessage');
    var origin = msg.mid;
    if (!origin || origin === this._user.id) {
      origin = 'Server';
    }
    console.log('API - [' + origin + '] Incoming message: ' + msg.type);
    if (msg.mid === this._user.id &&
      msg.type !== 'redirect' &&
      msg.type !== 'inRoom' &&
      msg.type !== 'chat') {
      console.log('API - Ignoring message: ' + msg.type + '.');
      return;
    }
    switch (msg.type) {
    //--- BASIC API Msgs ----
    case 'inRoom':
      this._inRoomHandler(msg);
      break;
    case 'enter':
      this._enterHandler(msg);
      break;
    case 'welcome':
      this._welcomeHandler(msg);
      break;
    case 'offer':
      this._offerHandler(msg);
      break;
    case 'answer':
      this._answerHandler(msg);
      break;
    case 'candidate':
      this._candidateHandler(msg);
      break;
    case 'bye':
      this._byeHandler(msg);
      break;
    case 'chat':
      this._chatHandler(msg);
      break;
    case 'redirect':
      this._redirectHandler(msg);
      break;
    case 'update_guest_name':
      // this._updateGuestNameHandler(msg);
      break;
    case 'error':
      // location.href = '/?error=' + msg.kind;
      break;
      //--- ADVANCED API Msgs ----
    case 'invite':
      // this._inviteHandler();
      break;
    case 'video_mute_event':
      // this._handleVideoMuteEventMessage(msg.mid, msg.guest);
      break;
    case 'roomLockEvent':
      // this._roomLockEventHandler(msg);
      break;
    default:
      console.log('API - [' + msg.mid + '] Unsupported message type received: ' + msg.type);
      break;
    }

  };

  /**
   * Throw an event with the received chat msg
   *
   * @method _chatHandler
   * @private
   * @param {JSON} msg
   * @param {String} msg.data
   * @param {String} msg.nick
   */
  Skyway.prototype._chatHandler = function (msg) {
    this._trigger('chatMessage',
      msg.data,
      ((msg.id === this._user.id) ? 'Me, myself and I' : msg.nick),
      (msg.target ? true : false));
  };

  /**
   * Signaller server wants us to move out.
   *
   * @method _redirectHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._redirectHandler = function (msg) {
    console.log('API - [Server] You are being redirected: ' + msg.info);
    if (msg.action === 'warning') {
      return;
    } else if (msg.action === 'reject') {
      location.href = msg.url;
    } else if (msg.action === 'close') {
      location.href = msg.url;
    }
  };

  /**
   * A peer left, let.s clean the corresponding connection, and trigger an event.
   *
   * @method _byeHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._byeHandler = function (msg) {
    var targetMid = msg.mid;
    console.log('API - [' + targetMid + '] received \'bye\'.');
    this._removePeer(targetMid);
  };

  /**
   * Actually clean the peerconnection and trigger an event. Can be called by _byHandler
   * and leaveRoom.
   *
   * @method _removePeer
   * @private
   * @param {String} peerID Id of the peer to remove
   */
  Skyway.prototype._removePeer = function (peerID) {
    this._trigger('peerLeft', peerID);
    if (this._peerConnections[peerID]) {
      this._peerConnections[peerID].close();
    }
    delete this._peerConnections[peerID];
  };

  /**
   * We just joined a room! Let's send a nice message to all to let them know I'm in.
   *
   * @method _inRoomHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._inRoomHandler = function (msg) {
    console.log('API - We\'re in the room! Chat functionalities are now available.');
    console.log('API - We\'ve been given the following PC Constraint by the sig server: ');
    console.dir(msg.pc_config);

    // NOTE ALEX: make a separate function of this.
    var temp_config = msg.pc_config;
    if (window.webrtcDetectedBrowser.mozWebRTC) {
      // NOTE ALEX: shoul dbe given by the server
      var newIceServers = [{
          'url' : 'stun:stun.services.mozilla.com'
        }
      ];
      for (var i = 0; i < msg.pc_config.iceServers.length; i++) {
        var iceServer = msg.pc_config.iceServers[i];
        var iceServerType = iceServer.url.split(':')[0];
        if (iceServerType === 'stun') {
          if (iceServer.url.indexOf('google')) {
            continue;
          }
          iceServer.url = [iceServer.url];
          newIceServers.push(iceServer);
        } else {
          var newIceServer = {};
          newIceServer.credential = iceServer.credential;
          newIceServer.url = iceServer.url.split(':')[0];
          newIceServer.username = iceServer.url.split(':')[1].split('@')[0];
          newIceServer.url += ':' + iceServer.url.split(':')[1].split('@')[1];
          newIceServers.push(newIceServer);
        }
      }
      temp_config.iceServers = newIceServers;
    }
    console.dir(temp_config);

    this._room.pcHelper.pcConfig = temp_config;
    this._in_room = true;
    this._trigger('joinedRoom', this._room.id, this._user.id);

    // NOTE ALEX: should we wait for local streams?
    // or just go with what we have (if no stream, then one way?)
    // do we hardcode the logic here, or give the flexibility?
    // It would be better to separate, do we could choose with whom
    // we want to communicate, instead of connecting automatically to all.
    console.log('API - Sending enter.');
    this._trigger('handshakeProgress', 'enter');
    this._sendMessage({
      type : 'enter',
      mid : this._user.id,
      rid : this._room.id,
      nick : this._user.displayName
    });
  };

  /**
   * Someone just entered the room. If we don't have a connection with him/her,
   * send him a welcome. Handshake step 2 and 3.
   *
   * @method _enterHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._enterHandler = function (msg) {
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', 'enter', targetMid);
    this._trigger('peerJoined', targetMid);
    // need to check entered user is new or not.
    if (!this._peerConnections[targetMid]) {
      console.log('API - [' + targetMid + '] Sending welcome.');
      this._trigger('handshakeProgress', 'welcome', targetMid);
      this._sendMessage({
        type : 'welcome',
        mid : this._user.id,
        target : targetMid,
        rid : this._room.id,
        nick : this._user.displayName
      });
    } else {
      // NOTE ALEX: and if we already have a connection when the peer enter,
      // what should we do? what are the possible use case?
      return;
    }
  };

  /**
   * We have just received a welcome. If there is no existing connection with this peer,
   * create one, then set the remotedescription and answer.
   *
   * @method _offerHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._welcomeHandler = function (msg) {
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', 'welcome', targetMid);
    this._trigger('peerJoined', targetMid);
    if (!this._peerConnections[targetMid]) {
      this._openPeer(targetMid, true);
    }
  };

  /**
   * We have just received an offer. If there is no existing connection with this peer,
   * create one, then set the remotedescription and answer.
   *
   * @method _offerHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._offerHandler = function (msg) {
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', 'offer', targetMid);
    console.log('Test:');
    console.log(msg);
    var offer = new window.RTCSessionDescription(msg);
    console.log('API - [' + targetMid + '] Received offer:');
    console.dir(offer);
    var pc = this._peerConnections[targetMid];
    if (!pc) {
      this._openPeer(targetMid, false);
      pc = this._peerConnections[targetMid];
    }
    pc.setRemoteDescription(offer);
    this._doAnswer(targetMid);
  };

  /**
   * We have succesfully received an offer and set it locally. This function will take care
   * of cerating and sendng the corresponding answer. Handshake step 4.
   *
   * @method _doAnswer
   * @private
   * @param {String} targetMid The peer we should connect to.
   * @param {Boolean} toOffer Wether we should start the O/A or wait.
   */
  Skyway.prototype._doAnswer = function (targetMid) {
    console.log('API - [' + targetMid + '] Creating answer.');
    var pc = this._peerConnections[targetMid];
    var self = this;
    if (pc) {
      pc.createAnswer(function (answer) {
        console.log('API - [' + targetMid + '] Created  answer.');
        console.dir(answer);
        self._setLocalAndSendMessage(targetMid, answer);
      },
        function (error) {
        self._onOfferOrAnswerError(targetMid, error, 'answer');
      },
        self._room.pcHelper.sdpConstraints);
    } else {
      return;
      /* Houston ..*/
    }
  };

  /**
   * Fallback for offer or answer creation failure.
   *
   * @method _onOfferOrAnswerError
   * @private
   */
  Skyway.prototype._onOfferOrAnswerError = function (targetMid, error, type) {
    console.log('API - [' + targetMid + '] Failed to create an ' + type +
      '. Error code was ' + JSON.stringify(error));
  };

  /**
   * We have a peer, this creates a peerconnection object to handle the call.
   * if we are the initiator, we then starts the O/A handshake.
   *
   * @method _openPeer
   * @private
   * @param {String} targetMid The peer we should connect to.
   * @param {Boolean} toOffer Wether we should start the O/A or wait.
   */
  Skyway.prototype._openPeer = function (targetMid, toOffer) {
    console.log('API - [' + targetMid + '] Creating PeerConnection.');
    this._peerConnections[targetMid] = this._createPeerConnection(targetMid);
    // NOTE ALEX: here we could do something smarter
    // a mediastream is mainly a container, most of the info
    // are attached to the tracks. We should iterates over track and print
    console.log('API - [' + targetMid + '] Adding local stream.');

    if (this._user.streams.length > 0) {
      for (var i in this._user.streams) {
        if (this._user.streams.hasOwnProperty(i)) {
          this._peerConnections[targetMid].addStream(this._user.streams[i]);
        }
      }
    } else {
      console.log('API - WARNING - No stream to send. You will be only receiving.');
    }
    // I'm the callee I need to make an offer
    if (toOffer) {
      this._createDataChannel(this._user.id, targetMid);
      this._doCall(targetMid);
    }
  };

  /**
   * The remote peer advertised streams, that we are forwarding to the app. This is part
   * of the peerConnection's addRemoteDescription() API's callback.
   *
   * @method _onRemoteStreamAdded
   * @private
   * @param {String} targetMid
   * @param {Event}  event      This is provided directly by the peerconnection API.
   */
  Skyway.prototype._onRemoteStreamAdded = function (targetMid, event) {
    console.log('API - [' + targetMid + '] Remote Stream added.');
    this._trigger('addPeerStream', targetMid, event.stream);
  };

  /**
   * it then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
   *
   * @method _doCall
   * @private
   * @param {String} targetMid
   */
  Skyway.prototype._doCall = function (targetMid) {
    var pc = this._peerConnections[targetMid];
    // NOTE ALEX: handle the pc = 0 case, just to be sure
    // temporary measure to remove Moz* constraints in Chrome
    var oc = this._room.pcHelper.offerConstraints;
    if (window.webrtcDetectedBrowser.webkitWebRTC) {
      for (var prop in oc.mandatory) {
        if (oc.mandatory.hasOwnProperty(prop)) {
          if (prop.indexOf('Moz') !== -1) {
            delete oc.mandatory[prop];
          }
        }
      }
    }
    var constraints = oc;
    var sc = this._room.pcHelper.sdpConstraints;
    for (var name in sc.mandatory) {
      if (sc.mandatory.hasOwnProperty(name)) {
        constraints.mandatory[name] = sc.mandatory[name];
      }
    }
    constraints.optional.concat(sc.optional);
    console.log('API - [' + targetMid + '] Creating offer.');
    var self = this;
    pc.createOffer(function (offer) {
      self._setLocalAndSendMessage(targetMid, offer);
    },
      function (error) {
      self._onOfferOrAnswerError(targetMid, error, 'offer');
    },
      constraints);
  };

  /**
   * This takes an offer or an aswer generated locally and set it in the peerconnection
   * it then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
   *
   * @method _setLocalAndSendMessage
   * @private
   * @param {String} targetMid
   * @param {JSON} sessionDescription This should be provided by the peerconnection API.
   * User might 'tamper' with it, but then , the setLocal may fail.
   */
  Skyway.prototype._setLocalAndSendMessage = function (targetMid, sessionDescription) {
    console.log('API - [' + targetMid + '] Created ' + sessionDescription.type + '.');
    console.log(sessionDescription);
    var pc = this._peerConnections[targetMid];
    // NOTE ALEX: handle the pc = 0 case, just to be sure

    // NOTE ALEX: opus should not be used for mobile
    // Set Opus as the preferred codec in SDP if Opus is present.
    // sessionDescription.sdp = preferOpus(sessionDescription.sdp);

    // limit bandwidth
    // sessionDescription.sdp = limitBandwidth(sessionDescription.sdp);

    console.log('API - [' + targetMid + '] Setting local Description (' +
      sessionDescription.type + ').');

    var self = this;
    pc.setLocalDescription(
      sessionDescription,
      function () {
      console.log('API - [' + targetMid + '] Set. Sending ' + sessionDescription.type + '.');
      self._trigger('handshakeProgress', sessionDescription.type, targetMid);
      self._sendMessage({
        type : sessionDescription.type,
        sdp : sessionDescription.sdp,
        mid : self._user.id,
        target : targetMid,
        rid : self._room.id
      });
    },
      function () {
      console.log('API - [' +
        targetMid + '] There was a problem setting the Local Description.');
    });
  };

  /**
   * Create a peerconnection to communicate with the peer whose ID is 'targetMid'.
   * All the peerconnection callbacks are set up here. This is a quite central piece.
   *
   * @method _createPeerConnection
   * @return the created peer connection.
   * @private
   * @param {String} targetMid
   */
  Skyway.prototype._createPeerConnection = function (targetMid) {
    var pc;
    try {
      pc = new window.RTCPeerConnection(
          this._room.pcHelper.pcConfig,
          this._room.pcHelper.pcConstraints);
      console.log(
        'API - [' + targetMid + '] Created PeerConnection.');
      console.log(
        'API - [' + targetMid + '] PC config: ');
      console.dir(this._room.pcHelper.pcConfig);
      console.log(
        'API - [' + targetMid + '] PC constraints: ' +
        JSON.stringify(this._room.pcHelper.pcConstraints));
    } catch (e) {
      console.log('API - [' + targetMid + '] Failed to create PeerConnection: ' + e.message);
      return null;
    }

    // callbacks
    // standard not implemented: onnegotiationneeded,
    var self = this;
    pc.ondatachannel = function (event) {
      console.log('DataChannel Opened');
      var dc = event.channel || event;
      self._createDataChannel(self._user.id, targetMid, null, dc);
    };
    pc.onaddstream = function (event) {
      self._onRemoteStreamAdded(targetMid, event);
    };
    pc.onicecandidate = function (event) {
      self._onIceCandidate(targetMid, event);
    };
    pc.oniceconnectionstatechange = function (fakeState) {
      console.log('API - [' + targetMid + '] ICE connection state changed -> ' +
        pc.iceConnectionState);
      self._trigger('iceConnectionState', pc.iceConnectionState, targetMid);
    };
    // pc.onremovestream = onRemoteStreamRemoved;
    pc.onsignalingstatechange = function () {
      console.log('API - [' + targetMid + '] PC connection state changed -> ' +
        pc.signalingState);
      self._trigger('peerConnectionState', pc.signalingState, targetMid);
    };
    pc.onicegatheringstatechange = function () {
      console.log('API - [' + targetMid + '] ICE gathering state changed -> ' +
        pc.iceGatheringState);
      self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
    };
    return pc;
  };

  /**
   * A candidate has just been generated (ICE gathering) and will be sent to the peer.
   * Part of connection establishment.
   *
   * @method _onIceCandidate
   * @private
   * @param {String} targetMid
   * @param {Event}  event      This is provided directly by the peerconnection API.
   */
  Skyway.prototype._onIceCandidate = function (targetMid, event) {
    if (event.candidate) {
      var msgCan = event.candidate.candidate.split(' ');
      var candidateType = msgCan[7];
      console.log('API - [' + targetMid + '] Created and sending ' +
        candidateType + ' candidate.');
      this._sendMessage({
        type : 'candidate',
        label : event.candidate.sdpMLineIndex,
        id : event.candidate.sdpMid,
        candidate : event.candidate.candidate,
        mid : this._user.id,
        target : targetMid,
        rid : this._room.id
      });
    } else {
      console.log('API - [' + targetMid + '] End of gathering.');
      this._trigger('candidateGenerationState', 'done', targetMid);
    }
  };

  /**
   * Handling reception of a candidate. handshake done, connection ongoing.
   * @method _candidateHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._candidateHandler = function (msg) {
    var targetMid = msg.mid;
    var pc = this._peerConnections[targetMid];
    if (pc) {
      if (pc.iceConnectionState === 'connected') {
        console.log('API - [' + targetMid + '] Received but not adding Candidate ' +
          'as we are already connected to this peer.');
        return;
      }
      var msgCan = msg.candidate.split(' ');
      var canType = msgCan[7];
      console.log('API - [' + targetMid + '] Received ' + canType + ' Candidate.');
      // if (canType !== 'relay' && canType !== 'srflx') {
      // trace('Skipping non relay and non srflx candidates.');
      var index = msg.label;
      var candidate = new window.RTCIceCandidate({
          sdpMLineIndex : index,
          candidate : msg.candidate
        });
      pc.addIceCandidate(candidate); //,
      // NOTE ALEX: not implemented in chrome yet, need to wait
      // function () { trace('ICE  -  addIceCandidate Succesfull. '); },
      // function (error) { trace('ICE  - AddIceCandidate Failed: ' + error); }
      //);
      console.log('API - [' + targetMid + '] Added Candidate.');
    } else {
      console.log('API - [' + targetMid + '] Received but not adding Candidate ' +
        'as PeerConnection not present.');
      // NOTE ALEX: if the offer was slow, this can happen
      // we might keep a buffer of candidates to replay after receiving an offer.
    }
  };

  /**
   * Handling reception of an answer (to a previous offer). handshake step 4.
   * @method _answerHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._answerHandler = function (msg) {
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', 'answer', targetMid);
    var answer = new window.RTCSessionDescription(msg);
    console.log('API - [' + targetMid + '] Received answer:');
    console.dir(answer);
    var pc = this._peerConnections[targetMid];
    pc.setRemoteDescription(answer);
    pc.remotePeerReady = true;
  };

  /**
   * send a message to the signaling server
   * @method _sendMessage
   * @private
   * @param {JSON} message
   */
  Skyway.prototype._sendMessage = function (message) {
    if (!this._channel_open) {
      return;
    }
    var msgString = JSON.stringify(message);
    console.log('API - [' + (message.target ? message.target : 'server') +
      '] Outgoing message: ' + message.type);
    this._socket.send(msgString);
  };

  /**
   * @method _openChannel
   * @private
   */
  Skyway.prototype._openChannel = function () {
    var self = this;
    var _openChannelImpl = function (readyState) {
      if (readyState !== 2) {
        return;
      }
      self.off('readyStateChange', _openChannelImpl);
      console.log('API - Opening channel.');
      var ip_signaling =
        'ws://' + self._room.signalingServer.ip + ':' + self._room.signalingServer.port;

      console.log('API - Signaling server URL: ' + ip_signaling);

      if (self._socketVersion >= 1) {
        self._socket = io.connect(ip_signaling, {
          forceNew : true
        });
      } else {
        self._socket = window.io.connect(ip_signaling, {
          'force new connection' : true
        });
      }

      self._socket = window.io.connect(ip_signaling, {
          'force new connection' : true
        });
      self._socket.on('connect', function () {
        self._channel_open = true;
        self._trigger('channelOpen');
      });
      self._socket.on('error', function (err) {
        console.log('API - Channel Error: ' + err);
        self._channel_open = false;
        self._trigger('channelError', err);
      });
      self._socket.on('disconnect', function () {
        self._trigger('channelClose');
      });
      self._socket.on('message', function (msg) {
        self._processSigMsg(msg);
      });
    };

    if (this._channel_open) {
      return;
    }
    if (this._readyState === 0) {
      this.on('readyStateChange', _openChannelImpl);
      this._init(this);
    } else {
      _openChannelImpl(2);
    }

  };

  /**
   * @method _closeChannel
   * @private
   */
  Skyway.prototype._closeChannel = function () {
    if (!this._channel_open) {
      return;
    }
    this._socket.disconnect();
    this._socket = null;
    this._channel_open = false;
    this._readyState = 0; // this forces a reinit
  };

  /**
   * Note:
   *   Create DataChannel - Started during createOffer,
   *   answered in createAnswer
   *  - SCTP Supported Browsers (Older chromes won't work, it will fall back to RTP)
   *  - For now, Mozilla supports Blob and Chrome supports ArrayBuffer
   *
   * @method _createDataChannel
   * @private
   * @param {String} createId - User id of the one creating the DataChannel
   * @param {String} receiveId - User id of the one receiving the DataChannel
   * @param {String} channel_name - The Name of the Channel. If null, it would be generated
   * @param {RTCDataChannel} dc - The DataChannel object passed inside
   */
  Skyway.prototype._createDataChannel = function (createId, receiveId, channel_name, dc) {
    var self = this;
    var pc = self._peerConnections[receiveId];
    var channel_log = 'API - DataChannel [-][' + createId + ']: ';
    var initialDC = true;

    try {
      console.log(channel_log + 'Initializing');
      if (!dc) {
        if (!channel_name) {
          channel_name = createId + '_' + receiveId;
        } else {
          initialDC = false;
        }
        channel_log = 'API - DataChannel [' + channel_name + '][' + createId + ']: ';
        var options = {};
        if (!webrtcDetectedBrowser.isSCTPDCSupported) {
          options.reliable = false;
          console.warn(channel_log + 'Does not support SCTP');
        }
        dc = pc.createDataChannel(channel_name, options);
      } else {
        channel_name = dc.label;
        onDC = true;
        channel_log = 'API - DC [{on}' + channel_name + '][' + createId + ']: ';
        console.log(channel_log + 'Received Status');
        console.info('Channel name: ' + channel_name);
      }
      if (webrtcDetectedBrowser.mozWebRTC) {
        console.log(channel_log + 'Does support BinaryType Blob');
      } else {
        console.log(channel_log + 'Does not support BinaryType Blob');
      }
      dc.createId = createId;
      dc.receiveId = receiveId;
      /**** Methods ****/
      dc.onerror = function (err) {
        console.error(channel_log + 'Failed retrieveing DataChannel.');
        console.exception(err);
      };
      dc.onclose = function () {
        console.log(channel_log + ' closed.');
        self._closeDataChannel(channel_name);
      };
      dc.onopen = function () {
        dc.push = dc.send;
        dc.send = function (data) {
          console.log(channel_log + ' opened.');
          console.log(data);
          dc.push(data);
        };
      };
      dc.onmessage = function (event) {
        console.log(channel_log + 'dc message received');
        console.info('Time received: ' + (new Date()).toISOString());
        console.info('Size: ' + event.data.length);
        console.info('======');
        console.log(event.data);
        console.log(typeof event.data);
        self._dataChannelHandler(event.data, channel_name, self);
      };
      window.RTCDataChannels[channel_name] = dc;

      setTimeout(function () {
        console.log(channel_log + 'Connection Status - ' + dc.readyState);
        if (!initialDC && dc.readyState === 'open') {
          self._sendDataChannel(channel_name, 'CONN|' + channel_name);
        }
      }, 500);

      console.log(channel_log + ' DataChannel created.');
    } catch (err) {
      console.error(channel_log + 'Failed creating DataChannel. Reason:');
      console.exception(err);
      return;
    }
  };

  /**
   * Sending of String Data over the DataChannels
   *
   * @method _sendDataChannel
   * @private
   * @param {String} channel, {JSON} data
   */
  Skyway.prototype._sendDataChannel = function (channel, data) {
    if (!channel) { return false; }
    var dataChannel = window.RTCDataChannels[channel];
    if (!dataChannel) {
      console.error('API - No available existing DataChannel at this moment');
      return;
    } else {
      console.log('API - [channel: ' + channel + ']. DataChannel found');
      console.log(data);
      try {
        dataChannel.send(data);
      } catch (err) {
        console.error('API - [channel: ' + channel + ']: An Error occurred');
        console.exception(err);
      }
    }
  };

  /**
   * Closing the DataChannel
   *
   * @method _closeDataChannel
   * @private
   * @param {String} channel
   */
  Skyway.prototype._closeDataChannel = function (channel) {
    if (!channel) {
      return;
    }
    try {
      if (!window.RTCDataChannels[channel]) {
        console.error('API - DataChannel "' + channel + '" does not exist');
        return;
      }
      window.RTCDataChannels[channel].close();
    } catch (err) {
      console.error('API - DataChannel "' + channel + '" failed to close');
      console.exception(err);
    }
    finally {
      setTimeout(function () {
        delete window.RTCDataChannels[channel];
      }, 500);
    }
  };

  /**
   * To obtain the Peer that it's connected to from the DataChannel
   *
   * @method _dataChannelPeer
   * @private
   * @param {String} channel
   * @param {Skyway} self
   */
  Skyway.prototype._dataChannelPeer = function (channel, self) {
    if (window.RTCDataChannels[channel].createId === self._user.id) {
      return window.RTCDataChannels[channel].receiveId;
    } else {
      return window.RTCDataChannels[channel].createId;
    }
  };

  /**
   * The Handler for all DataChannel Protocol events
   *
   * @method _dataChannelHandler
   * @private
   * @param {String} data
   */
  Skyway.prototype._dataChannelHandler = function (dataString, channel, self) {
    // PROTOCOL ESTABLISHMENT
    if (typeof dataString === 'string') {
      if (dataString.indexOf('|') > -1 && dataString.indexOf('|') < 6) {
        isProtocolEst = true;
        console.log('API - DataChannel: Protocol Establishment');
        var data = dataString.split('|');
        switch(data[0]) {
        // CONN - DataChannel Connection has been established
        case 'CONN':
          console.log('API - Received CONN');
          /* TODO */
          break;
        // WRQ - Send File Request Received. For receiver to accept or not
        case 'WRQ':
          console.log('API - Received WRQ');
          self._dataChannelWRQHandler(data, channel, self);
          break;
        // ACK - If accepted, send. Else abort
        case 'ACK':
          console.log('API - Received ACK');
          self._dataChannelACKHandler(data, channel, self);
          break;
        case 'ERROR':
          console.log('API - Received ERROR');
          self._dataChannelERRORHandler(data, channel, self);
          break;
        default:
          console.log('API - No event associated with: "' + data[0] + '"');
        }
      } else {
        self._dataChannelDATAHandler(dataString, channel, 'binaryString', self);
      }
    } else if (dataString instanceof ArrayBuffer) {
      self._dataChannelDATAHandler(dataString, channel, 'arrayBuffer', self);
    } else if (dataString instanceof Blob) {
      self._dataChannelDATAHandler(dataString, channel, 'blob', self);
    } else {
      console.log('API - DataType [' + (typeof dataString) + '] is handled');
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: WRQ
   * - The sender has sent a request to send file
   * - From here, it's up to the user to accept or reject it
   *
   * @method _dataChannelWRQHandler
   * @private
   * @param {Array} data
   * @param {String} channel
   * @param {Skyway} self
   */
  Skyway.prototype._dataChannelWRQHandler = function (data, channel, self) {
    var acceptFile = confirm('Do you want to receive File ' + data[2] + '?');
    var itemId = this._user.id + (((new Date()).toISOString()
                  .replace(/-/g, '')
                  .replace(/:/g, '')))
                  .replace('.', '');
    if (acceptFile) {
      self._downloadDataTransfers[channel] = {
        itemId: itemId,
        filename: data[2],
        filesize: parseInt(data[3], 10),
        data: [],
        ackN: 0,
        totalReceivedSize: 0,
        chunkSize: parseInt(data[4],10),
        timeout: parseInt(data[5], 10),
        ready: false
      };
      self._sendDataChannel(channel, 'ACK|0|' + window.webrtcDetectedBrowser.browser);
      this._trigger('startDataTransfer',
        itemId, this._dataChannelPeer(channel, this), data[2], data[3], 'download'
      );
    } else {
      self._sendDataChannel(channel, 'ACK|-1');
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: ACK
   * - The user sends a ACK of the request [accept/reject/the current
   * index of chunk to be sent over]
   *
   * @method _dataChannelACKHandler
   * @private
   * @param {Array} data
   * @param {String} channel
   * @param {Skyway} self
   */
  Skyway.prototype._dataChannelACKHandler = function (data, channel, self) {
    self._clearDataChannelTimeout(channel, true, self);
    var ackN = parseInt(data[1],10);
    var chunksLength = self._uploadDataTransfers[channel].chunks.length;
    var timeout = self._uploadDataTransfers[channel].info.timeout;
    if (ackN > -1) {
      //-- Positive
      console.info('API - DataChannel Received "ACK": ' + ackN + ' / ' + chunksLength);
      // UPLOAD: Still uploading
      if (ackN < chunksLength) {
        // Load Blob as dataurl base64 string
        var fileReader = new FileReader();
        fileReader.onload = function () {
          var base64BinaryString = fileReader.result.split(',')[1];
          self._sendDataChannel(channel, base64BinaryString);
          self._setDataChannelTimeout(channel, timeout, true, self);
          self._trigger('dataTransfer',
            self._uploadDataTransfers[channel].info.itemId,
            'upload',
            ((ackN+1)/chunksLength),
            self._dataChannelPeer(channel, self)
          );
        };
        fileReader.readAsDataURL(
          self._uploadDataTransfers[channel].chunks[ackN]
        );
      // COM: Completion
      } else if (ackN === chunksLength) {
        var itemId = self._uploadDataTransfers[channel].info.itemId;
        self._trigger('dataTransferCompleted', itemId, userID);
        setTimeout(function () {
          //self._closeDataChannel(channel);
          delete self._uploadDataTransfers[channel];
        }, 1200);
      }
    } else {
      //-- Negative
      alert('User rejected your file');
      delete self._uploadDataTransfers[channel];
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: ERROR
   * - The user received an error, usually an exceeded timeout.
   *
   * @method _dataChannelERRORHandler
   * @private
   * @param {Array} data
   * @param {String} channel
   * @param {Skyway} self
   */
  Skyway.prototype._dataChannelERRORHandler = function (data, channel, self) {
    var isSender;
    try {
      isSender = data[2];
    } catch (err) {
      console.error('API - DataChannelERRORHandler');
      console.exception(err);
    }
    self._clearDataChannelTimeout(channel, isSender, self);
    alert(
      'File failed to send! Reason was:\n' + data[1] +
      '\nChannel: ' + channel + '\nUploader: ' + isSender
    );
  };

  /**
   * DataChannel TFTP Protocol Stage: DATA
   * - This is when the data is sent from the sender to the receiving user
   *
   * @method _dataChannelDATAHandler
   * @private
   * @param {BinaryString/ArrayBuffer/Blob} dataString
   * @param {String} channel
   * @param {String} dataType
   * @param {Skyway} self
   */
  Skyway.prototype._dataChannelDATAHandler = function (dataString, channel, dataType, self) {
    console.log('API - DataChannel Received "DATA"');
    console.log('API - "DATA" DataType: ' + dataType);

    self._clearDataChannelTimeout(channel, false, self);

    var chunk;
    if(dataType === 'binaryString') {
      chunk = self._base64ToBlob(dataString);
    } else if(dataType === 'arrayBuffer') {
      chunk = new Blob(dataString);
    } else if(dataType === 'blob') {
      chunk = dataString;
    } else {
      console.error('API - Unhandled data exception: ' + dataType);
      return;
    }
    var completedDetails = self._downloadDataTransfers[channel];
    var receivedSize = (chunk.size * (4/3));

    console.info('API - Chunk size: ' + chunk.size);
    console.info(
      'API - Packet size: ' + receivedSize + ' / ' + completedDetails.chunkSize
    );

    if (completedDetails.chunkSize >= receivedSize) {
      self._downloadDataTransfers[channel].data.push(chunk);
      self._downloadDataTransfers[channel].ackN += 1;
      self._downloadDataTransfers[channel].totalReceivedSize += receivedSize;
      var totalReceivedSize = self._downloadDataTransfers[channel].totalReceivedSize;
      var percentage = totalReceivedSize / completedDetails.filesize;

      console.info(
        'API - Percentage [size]: ' + totalReceivedSize  + ' / ' +
        (completedDetails.filesize * (4/3))
      );

      self._sendDataChannel(channel, 'ACK|' +
        self._downloadDataTransfers[channel].ackN +
        '|' + self._user.id
      );

      if (completedDetails.chunkSize === receivedSize) {
        self._trigger('dataTransfer',
          completedDetails.itemId,
          'download',
          percentage
        );
        self._setDataChannelTimeout(channel,
          self._downloadDataTransfers[channel].timeout,
          false, self
        );
      } else {
        var blob = new Blob(self._downloadDataTransfers[channel].data);
        self._trigger('dataTransfer',
          completedDetails.itemId,
          'download', percentage,
          null, URL.createObjectURL(blob)
        );
        setTimeout(function () {
          //self._closeDataChannel(channel);
          delete self._downloadDataTransfers[channel];
        }, 1200);
      }
    } else {
      console.log(
        'API - DataHandler: Packet not match - [Received]' + receivedSize + ' / [Expected]' +
        completedDetails.chunkSize
      );
    }
  };

  /**
   * Set the DataChannel timeout. If exceeded, send the 'ERROR' message
   *
   * @method _setDataChannelTimeout
   * @private
   * @param {String} channel
   * @param {Int} timeout - no of seconds to timeout
   * @param {Boolean} isSender
   */
  Skyway.prototype._setDataChannelTimeout = function(channel, timeout, isSender, self) {
    var key = (isSender) ? '_upload' : '_download';
    self._dataTransfersTimeout[channel + key] = setTimeout(function () {
      if (isSender) {
        self._uploadDataTransfers[channel] = {};
      } else {
        self._downloadDataTransfers[channel] = {};
      }
      self._sendDataChannel(channel,
        'ERROR|Connection Timeout. Longer than ' + timeout + ' seconds. Connection is abolished.|' +
        isSender
      );
    }, 1000 * timeout);
  };

  /**
   * Clear the DataChannel timeout as a response is received
   *
   * @method _clearDataChannelTimeout
   * @private
   * @param {String} channel
   * @param {Boolean} isSender
   */
  Skyway.prototype._clearDataChannelTimeout = function(channel, isSender, self) {
    var key = (isSender) ? '_upload' : '_download';
    clearTimeout(self._dataTransfersTimeout[channel + key]);
    delete self._dataTransfersTimeout[channel + key];
  };

  /**
   * NOTE:
   * - Code from devnull69 @ stackoverflow.com
   * - convert base64 to raw binary data held in a string
   * - doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
   * This is to convert the base64 binary string to a blob
   *
   * @method _base64ToBlob
   * @private
   * @param {String} dataURL
   */
  Skyway.prototype._base64ToBlob = function (dataURL) {
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
   * To chunk the File (which already is a blob) into smaller blob files.
   *
   * @method _chunkFile
   * @private
   * @param {Blob} blob
   * @param {Int} blobByteSize
   *
   * For now please send files below or around 2KB till chunking is implemented
   */
  Skyway.prototype._chunkFile = function (blob, blobByteSize) {
    var chunksArray = [], startCount = 0, endCount = 0;
    // File Size greater than Chunk size
    if(blobByteSize > this._chunkFileSize) {
      while((blobByteSize - 1) > endCount) {
        endCount = startCount + this._chunkFileSize;
        chunksArray.push(blob.slice(startCount, endCount));
        startCount += this._chunkFileSize;
      }
      if ((blobByteSize - (startCount + 1)) > 0) {
        chunksArray.push(blob.slice(startCount, blobByteSize - 1));
      }
    // File Size below Chunk size
    } else {
      chunksArray.push(blob);
    }
    return chunksArray;
  };

  /**
   * Method to send files to peers
   *
   * @method sendFile
   * @protected
   * @param {File} file - The file to be sent over
   */
  Skyway.prototype.sendFile = function(file) {
    console.log('API - Attaching File to Stream');
    var noOfPeersSent = 0;
    var itemId = this._user.id + (((new Date()).toISOString()
                  .replace(/-/g, '')
                  .replace(/:/g, '')))
                  .replace('.', '');
    var timeout = 60; // 1 second

    for (var channel in window.RTCDataChannels) {
      // If Channel exists
      if(window.RTCDataChannels.hasOwnProperty(channel) &&
       window.RTCDataChannels[channel]) {
        // If Channel is opened
        if(window.RTCDataChannels[channel].readyState === 'open') {
          // Binary String filesize [Formula n = 4/3]
          var fileSize = (file.size * (4/3)).toFixed();
          var chunkSize = (this._chunkFileSize * (4/3)).toFixed();

          console.log('API - Preparing File Sending to Queue');

          this._uploadDataTransfers[channel] = {
            info: {
              name: file.name,
              size: fileSize,
              itemId: itemId,
              timeout: timeout
            },
            chunks: this._chunkFile(file, file.size)
          };

          this._sendDataChannel(channel,
            'WRQ|' + window.webrtcDetectedBrowser.browser + '|' + file.name + '|' +
            fileSize + '|' + chunkSize + '|' + timeout
          );
          noOfPeersSent++;
          this._setDataChannelTimeout(channel, timeout, true, this);
        } else {
          console.log('API - Channel[' + channel + '] is not opened' );
        }
      } else {
        console.log('API - Channel[' + channel + '] does not exists' );
      }
    }

    if (noOfPeersSent > 0) {
      /* TODO - Upload status of files for multi-peers */
      console.log('API - Tracking File to User\'s chat log for Tracking');
      this._trigger('startDataTransfer',
        itemId, this._user.id, file.name, file.size, 'upload', URL.createObjectURL(file)
      );
    } else {
      console.log('API - No available channels here. Impossible to send file');
      this._uploadDataTransfers = {};
    }
  };

  /**
   * TODO
   * @method toggleLock
   * @protected
   */
  Skyway.prototype.toggleLock = function () {
    /* TODO */
  };

  /**
   * TODO
   * @method toggleAudio
   * @protected
   */
  Skyway.prototype.toggleAudio = function (audioMute) {
    /* TODO */
  };

  /**
   * TODO
   * @method toggleVideo
   * @protected
   */
  Skyway.prototype.toggleVideo = function (videoMute) {
    /* TODO */
  };

  /**
   * TODO
   * @method authenticate
   * @protected
   * @param {String} email
   * @param {String} password
   */
  Skyway.prototype.authenticate = function (email, password) {};

  /**
   * @method joinRoom
   */
  Skyway.prototype.joinRoom = function () {
    if (this._in_room) {
      return;
    }
    var self = this;
    var _sendJoinRoomMsg = function () {
      self.off('channelOpen', _sendJoinRoomMsg);
      console.log('API - Joining room: ' + self._room.id);
      self._sendMessage({
        type : 'joinRoom',
        mid : self._user.id,
        cid : self._key,
        rid : self._room.id,
        userCred : self._user.token,
        timeStamp : self._user.timeStamp,
        apiOwner : self._user.apiOwner,
        roomCred : self._room.token,
        start : self._room.start,
        len : self._room.len
      });
      this._user.peer = this._createPeerConnection(this._user.id);
    };
    if (!this._channel_open) {
      this.on('channelOpen', _sendJoinRoomMsg);
      this._openChannel();
    } else {
      _sendJoinRoomMsg();
    }
  };

  /**
   * @method leaveRoom
   */
  Skyway.prototype.leaveRoom = function () {
    if (!this._in_room) {
      return;
    }
    for (var pc_index in this._peerConnections) {
      if (this._peerConnections.hasOwnProperty(pc_index)) {
        this._removePeer(pc_index);
      }
    }
    this._in_room = false;
    this._closeChannel();
  };

  /**
   * TODO
   * @method getContacts
   * @protected
   */
  Skyway.prototype.getContacts = function () {
    if (!this._in_room) {
      return;
    }
    /* TODO */
  };

  /**
   * TODO
   * @method getUser
   * @protected
   */
  Skyway.prototype.getUser = function () {
    /* TODO */
  };

  /**
   * TODO
   * @method inviteContact
   * @protected
   */
  Skyway.prototype.inviteContact = function (contact) {
    /* TODO */
  };
}).call(this);
