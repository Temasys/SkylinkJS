/*! skywayjs - v0.3.0 - 2014-08-06 */

/*! adapterjs - v0.0.3 - 2014-07-10 */

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
 *   The results of each states returns
 * @attribute ICEConnectionState
 * @type JSON
 */
ICEConnectionState = {
  starting : 'starting',
  checking : 'checking',
  connected : 'connected',
  completed : 'connected',
  done : 'completed',
  disconnected : 'disconnected',
  failed : 'failed',
  closed : 'closed'
};
/**
 * Note:
 *   The states of each Peer
 * @attribute ICEConnectionFiredStates
 * @type JSON
 */
ICEConnectionFiredStates = {};
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
 * @author Get version of Browser. Code provided by kennebec@stackoverflow.com
 * @author IsSCTP/isRTPD Supported. Code provided by DetectRTC by Muaz Khan
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
  agent.os = navigator.platform;
  agent.isSCTPDCSupported = agent.mozWebRTC ||
    (agent.browser === 'Chrome' && agent.version > 30) ||
    (agent.browser === 'Opera' && agent.version > 19);
  agent.isRTPDCSupported = agent.browser === 'Chrome' && agent.version < 30 && agent.version > 24;
  agent.isPluginSupported = !agent.isSCTPDCSupported && !agent.isRTPDCSupported;
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
/**
 * Note:
 *   Handles the differences for all Browsers
 *
 * @method checkIceConnectionState
 * @param {String} peerID
 * @param {String} iceConnectionState
 * @param {Function} callback
 * @param {Boolean} returnStateAlways
 * @protected
 */
checkIceConnectionState = function (peerID, iceConnectionState, callback, returnStateAlways) {
  if (typeof callback !== 'function') {
    return;
  }
  peerID = (peerID) ? peerID : 'peer';
  var returnState = false, err = null;
  console.log('ICECONNECTIONSTATE: ' + iceConnectionState);

  if (!ICEConnectionFiredStates[peerID] ||
    iceConnectionState === ICEConnectionState.disconnected ||
    iceConnectionState === ICEConnectionState.failed ||
    iceConnectionState === ICEConnectionState.closed) {
    ICEConnectionFiredStates[peerID] = [];
  }
  iceConnectionState = ICEConnectionState[iceConnectionState];
  if (ICEConnectionFiredStates[peerID].indexOf(iceConnectionState) === -1) {
    ICEConnectionFiredStates[peerID].push(iceConnectionState);
    if (iceConnectionState === ICEConnectionState.connected) {
      setTimeout(function () {
        ICEConnectionFiredStates[peerID].push(ICEConnectionState.done);
        callback(ICEConnectionState.done);
      }, 1000);
    }
    returnState = true;
  }
  if (returnStateAlways || returnState) {
    callback(iceConnectionState);
  }
  return;
};
/**
 * Note:
 *   Set the settings for creating DataChannels, MediaStream for Cross-browser compability.
 *   This is only for SCTP based support browsers
 *
 * @method checkMediaDataChannelSettings
 * @param {Boolean} isOffer
 * @param {String} peerBrowserAgent
 * @param {Function} callback
 * @param {JSON} constraints
 * @protected
 */
checkMediaDataChannelSettings = function (isOffer, peerBrowserAgent, callback, constraints) {
  if (typeof callback !== 'function') {
    return;
  }
  var peerBrowserVersion, beOfferer = false;

  console.log('Self: ' + webrtcDetectedBrowser.browser + ' | Peer: ' + peerBrowserAgent);

  if (peerBrowserAgent.indexOf('|') > -1) {
    peerBrowser = peerBrowserAgent.split('|');
    peerBrowserAgent = peerBrowser[0];
    peerBrowserVersion = parseInt(peerBrowser[1], 10);
    console.info('Peer Browser version: ' + peerBrowserVersion);
  }
  var isLocalFirefox = webrtcDetectedBrowser.mozWebRTC;
  // Nightly version does not require MozDontOfferDataChannel for interop
  var isLocalFirefoxInterop = webrtcDetectedBrowser.mozWebRTC &&
    webrtcDetectedBrowser.version > 30;
  var isPeerFirefox = peerBrowserAgent === 'Firefox';
  var isPeerFirefoxInterop = peerBrowserAgent === 'Firefox' &&
    ((peerBrowserVersion) ? (peerBrowserVersion > 30) : false);

  // Resends an updated version of constraints for MozDataChannel to work
  // If other userAgent is firefox and user is firefox, remove MozDataChannel
  if (isOffer) {
    if ((isLocalFirefox && isPeerFirefox) || (isLocalFirefoxInterop)) {
      try {
        delete constraints.mandatory.MozDontOfferDataChannel;
      } catch (err) {
        console.error('Failed deleting MozDontOfferDataChannel');
        console.exception(err);
      }
    } else if ((isLocalFirefox && !isPeerFirefox)) {
      constraints.mandatory.MozDontOfferDataChannel = true;
    }
    if (!isLocalFirefox) {
      // temporary measure to remove Moz* constraints in non Firefox browsers
      for (var prop in constraints.mandatory) {
        if (constraints.mandatory.hasOwnProperty(prop)) {
          if (prop.indexOf('Moz') !== -1) {
            delete constraints.mandatory[prop];
          }
        }
      }
    }
    console.log('Set Offer constraints for DataChannel and MediaStream interopability');
    console.dir(constraints);
    callback(constraints);
  } else {
    // Tells user to resend an 'enter' again
    // Firefox (not interopable) cannot offer DataChannel as it will cause problems to the
    // interopability of the media stream
    if (!isLocalFirefox && isPeerFirefox && !isPeerFirefoxInterop) {
      beOfferer = true;
    }
    console.info('Resend Enter: ' + beOfferer);
    callback(beOfferer);
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
        var axo = new ActiveXObject(comName + '.' + plugName);
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
}
;(function() {
  /**
   * Call 'init()' to initialize Skyway
   * @class Skyway
   * @constructor
   */
  function Skyway() {
    if (!(this instanceof Skyway)) {
      return new Skyway();
    }
    /**
     * Version of Skyway
     * @attribute VERSION
     * @readOnly
     */
    this.VERSION = '0.3.0';
    /**
     * List of regional server for Skyway to connect to.
     * Default server is US1. Servers:
     * - US1 : USA server 1. Default server if region is not provided.
     * - US2 : USA server 2
     * - SG : Singapore server
     * - EU : Europe server
     * @attribute REGIONAL_SERVER
     * @readOnly
     */
    this.REGIONAL_SERVER = {
      US1: 'us1',
      US2: 'us2',
      SG: 'sg',
      EU: 'eu'
    };
    /**
     * ICE Connection States. States that would occur are:
     * - STARTING     : ICE Connection to Peer initialized
     * - CLOSED       : ICE Connection to Peer has been closed
     * - FAILED       : ICE Connection to Peer has failed
     * - CHECKING     : ICE Connection to Peer is still in checking status
     * - DISCONNECTED : ICE Connection to Peer has been disconnected
     * - CONNECTED    : ICE Connection to Peer has been connected
     * - COMPLETED    : ICE Connection to Peer has been completed
     * @attribute ICE_CONNECTION_STATE
     * @readOnly
     */
    this.ICE_CONNECTION_STATE = {
      STARTING: 'starting',
      CHECKING: 'checking',
      CONNECTED: 'connected',
      COMPLETED: 'completed',
      CLOSED: 'closed',
      FAILED: 'failed',
      DISCONNECTED: 'disconnected'
    };
    /**
     * Peer Connection States. States that would occur are:
     * - STABLE               : Initial stage. No local or remote description is applied
     * - HAVE_LOCAL_OFFER     : "Offer" local description is applied
     * - HAVE_REMOTE_OFFER    : "Offer" remote description is applied
     * - HAVE_LOCAL_PRANSWER  : "Answer" local description is applied
     * - HAVE_REMOTE_PRANSWER : "Answer" remote description is applied
     * - ESTABLISHED          : All description is set and is applied
     * - CLOSED               " Connection closed.
     * @attribute PEER_CONNECTION_STATE
     * @readOnly
     */
    this.PEER_CONNECTION_STATE = {
      STABLE: 'stable',
      HAVE_LOCAL_OFFER: 'have-local-offer',
      HAVE_REMOTE_OFFER: 'have-remote-offer',
      HAVE_LOCAL_PRANSWER: 'have-local-pranswer',
      HAVE_REMOTE_PRANSWER: 'have-remote-pranswer',
      ESTABLISHED: 'established',
      CLOSED: 'closed'
    };
    /**
     * ICE Candidate Generation States. States that would occur are:
     * - GATHERING : ICE Gathering to Peer has just started
     * - DONE      : ICE Gathering to Peer has been completed
     * @attribute CANDIDATE_GENERATION_STATE
     * @readOnly
     */
    this.CANDIDATE_GENERATION_STATE = {
      GATHERING: 'gathering',
      DONE: 'done'
    };
    /**
     * Handshake Progress Steps. Steps that would occur are:
     * - ENTER   : Step 1. Received enter from Peer
     * - WELCOME : Step 2. Received welcome from Peer
     * - OFFER   : Step 3. Received offer from Peer
     * - ANSWER  : Step 4. Received answer from Peer
     * @attribute HANDSHAKE_PROGRESS
     * @readOnly
     */
    this.HANDSHAKE_PROGRESS = {
      ENTER: 'enter',
      WELCOME: 'welcome',
      OFFER: 'offer',
      ANSWER: 'answer'
    };
    /**
     * Data Channel Connection States. Steps that would occur are:
     * - NEW        : Step 1. DataChannel has been created.
     * - LOADED     : Step 2. DataChannel events has been loaded.
     * - OPEN       : Step 3. DataChannel is connected. [WebRTC Standard]
     * - CONNECTING : DataChannel is connecting. [WebRTC Standard]
     * - CLOSING    : DataChannel is closing. [WebRTC Standard]
     * - CLOSED     : DataChannel has been closed. [WebRTC Standard]
     * - ERROR      : DataChannel has an error ocurring.
     * @attribute DATA_CHANNEL_STATE
     * @readOnly
     */
    this.DATA_CHANNEL_STATE = {
      CONNECTING: 'connecting',
      OPEN: 'open',
      CLOSING: 'closing',
      CLOSED: 'closed',
      NEW: 'new',
      LOADED: 'loaded',
      ERROR: 'error'
    };
    /**
     * System actions received from Signaling server. System action outcomes are:
     * - WARNING : System is warning user that the room is closing
     * - REJECT  : System has rejected user from room
     * - CLOSED  : System has closed the room
     * @attribute SYSTEM_ACTION
     * @readOnly
     */
    this.SYSTEM_ACTION = {
      WARNING: 'warning',
      REJECT: 'reject',
      CLOSED: 'close'
    };
    /**
     * State to check if Skyway initialization is ready. Steps that would occur are:
     * - INIT      : Step 1. Init state. If ReadyState fails, it goes to 0.
     * - LOADING   : Step 2. RTCPeerConnection exists. Roomserver, API ID provided is not empty
     * - COMPLETED : Step 3. Retrieval of configuration is complete. Socket.io begins connection.
     * - ERROR     : Error state. Occurs when ReadyState fails loading.
     * - API_ERROR  : API Error state. This occurs when provided APP ID or Roomserver is invalid.
     * - NO_SOCKET_ERROR         : No Socket.IO was loaded state.
     * - NO_XMLHTTPREQUEST_ERROR : XMLHttpRequest is not available in user's PC
     * - NO_WEBRTC_ERROR         : Browser does not support WebRTC error.
     * - NO_PATH_ERROR           : No path provided in init error.
     * @attribute DATA_CHANNEL_STATE
     * @readOnly
     */
    this.READY_STATE_CHANGE = {
      INIT: 0,
      LOADING: 1,
      COMPLETED: 2,
      ERROR: -1,
      API_ERROR: -2,
      NO_SOCKET_ERROR: -3,
      NO_XMLHTTPREQUEST_ERROR: -4,
      NO_WEBRTC_ERROR: -5,
      NO_PATH_ERROR: -6
    };
    /**
     * Data Channel Transfer Type. Types are
     * - UPLOAD    : Error occurs at UPLOAD state
     * - DOWNLOAD  : Error occurs at DOWNLOAD state
     * @attribute DATA_TRANSFER_TYPE
     * @readOnly
     */
    this.DATA_TRANSFER_TYPE = {
      UPLOAD: 'upload',
      DOWNLOAD: 'download'
    };
    /**
     * Data Channel Transfer State. State that would occur are:
     * - UPLOAD_STARTED     : Data Transfer of Upload has just started
     * - DOWNLOAD_STARTED   : Data Transfer od Download has just started
     * - REJECTED           : Peer rejected User's Data Transfer request
     * - ERROR              : Error occurred when uploading or downloading file
     * - UPLOADING          : Data is uploading
     * - DOWNLOADING        : Data is downloading
     * - UPLOAD_COMPLETED   : Data Transfer of Upload has completed
     * - DOWNLOAD_COMPLETED : Data Transfer of Download has completed
     * @attribute DATA_TRANSFER_STATE
     * @readOnly
     */
    this.DATA_TRANSFER_STATE = {
      UPLOAD_STARTED: 'uploadStarted',
      DOWNLOAD_STARTED: 'downloadStarted',
      REJECTED: 'rejected',
      ERROR: 'error',
      UPLOADING: 'uploading',
      DOWNLOADING: 'downloading',
      UPLOAD_COMPLETED: 'uploadCompleted',
      DOWNLOAD_COMPLETED: 'downloadCompleted'
    };
    /**
     * TODO : ArrayBuffer and Blob in DataChannel
     * Data Channel Transfer Data type. Data Types are:
     * - BINARY_STRING : BinaryString data
     * - ARRAY_BUFFER  : ArrayBuffer data
     * - BLOB         : Blob data
     * @attribute DATA_TRANSFER_DATA_TYPE
     * @readOnly
     */
    this.DATA_TRANSFER_DATA_TYPE = {
      BINARY_STRING: 'binaryString',
      ARRAY_BUFFER: 'arrayBuffer',
      BLOB: 'blob'
    };
    /**
     * Signaling message type. These message types are fixed.
     * (Legend: S - Send only. R - Received only. SR - Can be Both).
     * Signaling types are:
     * - JOIN_ROOM : S. Join the Room
     * - IN_ROOM : R. User has already joined the Room
     * - ENTER : SR. Enter from handshake
     * - WELCOME : SR. Welcome from handshake
     * - OFFER : SR. Offer from handshake
     * - ANSWER : SR. Answer from handshake
     * - CANDIDATE : SR. Candidate received
     * - BYE : R. Peer left the room
     * - CHAT : SR. Chat message relaying
     * - REDIRECT : R. Server redirecting User
     * - ERROR : R. Server occuring an error
     * - INVITE : SR. TODO.
     * - UPDATE_USER : SR. Update of User information
     * - ROOM_LOCK : SR. Locking of Room
     * - MUTE_VIDEO : SR. Muting of User's video
     * - MUTE_AUDIO : SR. Muting of User's audio
     * - PUBLIC_MSG : SR. Sending a public broadcast message.
     * - PRIVATE_MSG : SR. Sending a private message
     * @attribute SIG_TYPE
     * @readOnly
     * @private
     */
    this.SIG_TYPE = {
      JOIN_ROOM: 'joinRoom',
      IN_ROOM: 'inRoom',
      ENTER: this.HANDSHAKE_PROGRESS.ENTER,
      WELCOME: this.HANDSHAKE_PROGRESS.WELCOME,
      OFFER: this.HANDSHAKE_PROGRESS.OFFER,
      ANSWER: this.HANDSHAKE_PROGRESS.ANSWER,
      CANDIDATE: 'candidate',
      BYE: 'bye',
      CHAT: 'chat',
      REDIRECT: 'redirect',
      ERROR: 'error',
      INVITE: 'invite',
      UPDATE_USER: 'updateUserEvent',
      ROOM_LOCK: 'roomLockEvent',
      MUTE_VIDEO: 'muteVideoEvent',
      MUTE_AUDIO: 'muteAudioEvent',
      PUBLIC_MSG: 'public',
      PRIVATE_MSG: 'private'
    };
    /**
     * Lock Action States
     * - LOCK   : Lock the room
     * - UNLOCK : Unlock the room
     * - STATUS : Get the status of the room if it's locked or not
     * @attribute LOCK_ACTION
     * @readOnly
     */
    this.LOCK_ACTION = {
      LOCK: 'lock',
      UNLOCK: 'unlock',
      STATUS: 'check'
    };
    /**
     * Video Resolutions. Resolution types are:
     * - QVGA: Width: 320 x Height: 180
     * - VGA : Width: 640 x Height: 360
     * - HD: Width: 320 x Height: 180
     * @attribute VIDEO_RESOLUTION
     * @readOnly
     */
    this.VIDEO_RESOLUTION = {
      QVGA: {
        width: 320,
        height: 180
      },
      VGA: {
        width: 640,
        height: 360
      },
      HD: {
        width: 1280,
        height: 720
      },
      FHD: {
        width: 1920,
        height: 1080
      } // Please check support
    };
    /**
     * NOTE ALEX: check if last char is '/'
     * @attribute _path
     * @type String
     * @default _serverPath
     * @final
     * @required
     * @private
     */
    this._path = null;
    /**
     * Url Skyway makes API calls to
     * @attribute _serverPath
     * @type String
     * @final
     * @required
     * @private
     */
    this._serverPath = '//api.temasys.com.sg';
    /**
     * The server region the room connects to
     * @attribute _serverRegion
     * @type String
     * @default 'us1'
     * @private
     */
    this._serverRegion = null;
    /**
     * The Room server User connects to
     * @attribute _roomServer
     * @type String
     * @private
     */
    this._roomServer = null;
    /**
     * The Application Key ID
     * @attribute _appKey
     * @type String
     * @private
     */
    this._appKey = null;
    /**
     * The default room that the User connects to
     * @attribute _defaultRoom
     * @type String
     * @private
     */
    this._defaultRoom = null;
    /**
     * The room that the User connects to
     * @attribute _selectedRoom
     * @type String
     * @default _defaultRoom
     * @private
     */
    this._selectedRoom = null;
    /**
     * The room start datetime in ISO format
     * @attribute _roomStart
     * @type String
     * @private
     * @optional
     */
    this._roomStart = null;
    /**
     * The room duration before closing
     * @attribute _roomDuration
     * @type Integer
     * @private
     * @optional
     */
    this._roomDuration = null;
    /**
     * The room credentials to set the start time and duration
     * @attribute _roomCredentials
     * @type String
     * @private
     * @optional
     */
    this._roomCredentials = null;
    /**
     * The Server Key
     * @attribute _key
     * @type String
     * @private
     */
    this._key = null;
    /**
     * The actual socket that handle the connection
     * @attribute _socket
     * @required
     * @private
     */
    this._socket = null;
    /**
     * The socket version of the socket.io used
     * @attribute _socketVersion
     * @private
     */
    this._socketVersion = null;
    /**
     * User Information, credential and the local stream(s).
     * @attribute _user
     * @type JSON
     * @required
     * @private
     *
     * @param {String} id User Session ID
     * @param {RTCPeerConnection} peer PeerConnection object
     * @param {String} sid User Secret Session ID
     * @param {String} displayName Deprecated. User display name
     * @param {String} apiOwner Owner of the room
     * @param {Array} streams Array of User's MediaStream
     * @param {String} timestamp User's timestamp
     * @param {String} token User access token
     * @param {JSON} info Optional. User information
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
     * @required
     * @private
     */
    this._peerConnections = [];
    /**
     * Internal array of peer informations
     * @attribute _peerInformations
     * @private
     * @required
     */
    this._peerInformations = [];
    /**
     * Internal array of dataChannels
     * @attribute _dataChannels
     * @private
     * @required
     */
    this._dataChannels = [];
    /**
     * Internal array of dataChannel peers
     * @attribute _dataChannelPeers
     * @private
     * @required
     */
    this._dataChannelPeers = [];
    /**
     * The current ReadyState
     * 0 'false or failed', 1 'in process', 2 'done'
     * @attribute _readyState
     * @private
     * @required
     */
    this._readyState = 0;
    /**
     * State if Channel is opened or not
     * @attribute _channel_open
     * @private
     * @required
     */
    this._channel_open = false;
    /**
     * State if User is in room or not
     * @attribute _in_room
     * @private
     * @required
     */
    this._in_room = false;
    /**
     * Stores the upload data chunks
     * @attribute _uploadDataTransfers
     * @private
     * @required
     */
    this._uploadDataTransfers = {};
    /**
     * Stores the upload data session information
     * @attribute _uploadDataSessions
     * @private
     * @required
     */
    this._uploadDataSessions = {};
    /**
     * Stores the download data chunks
     * @attribute _downloadDataTransfers
     * @private
     * @required
     */
    this._downloadDataTransfers = {};
    /**
     * Stores the download data session information
     * @attribute _downloadDataSessions
     * @private
     * @required
     */
    this._downloadDataSessions = {};
    /**
     * Stores the data transfers timeout
     * @attribute _dataTransfersTimeout
     * @private
     * @required
     */
    this._dataTransfersTimeout = {};
    /**
     * Standard File Size of each chunk
     * @attribute _chunkFileSize
     * @private
     * @final
     * @required
     */
    this._chunkFileSize = 49152; // [25KB because Plugin] 60 KB Limit | 4 KB for info
    /**
     * Standard File Size of each chunk for Firefox
     * @attribute _mozChunkFileSize
     * @private
     * @final
     * @required
     */
    this._mozChunkFileSize = 16384; // Firefox the sender chunks 49152 but receives as 16384
    /**
     * If ICE trickle should be disabled or not
     * @attribute _enableIceTrickle
     * @private
     * @required
     */
    this._enableIceTrickle = true;
    /**
     * Skyway in debug mode
     * @attribute _debug
     * @protected
     */
    this._debug = false;
    /**
     * User stream settings
     * @attribute _streamSettings
     * @default {
     *   'audio' : true,
     *   'video' : true
     * }
     * @private
     */
    this._streamSettings = {
      audio: true,
      video: true
    };
    /**
     * Get information from server
     * @method _requestServerInfo
     * @param {String} method HTTP Method
     * @param {String} url Path url to make request to
     * @param {Function} callback Callback function after request is laoded
     * @param {JSON} params HTTP Params
     * @private
     */
    this._requestServerInfo = function(method, url, callback, params) {
      var xhr = new window.XMLHttpRequest();
      console.log('XHR - Fetching infos from webserver');
      xhr.onreadystatechange = function() {
        if (this.readyState === this.DONE) {
          console.log('XHR - Got infos from webserver.');
          if (this.status !== 200) {
            console.log('XHR - ERROR ' + this.status, false);
          }
          callback(this.status, JSON.parse(this.response || '{}'));
        }
      };
      xhr.open(method, url, true);
      if (params) {
        console.info(params);
        xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(params));
      } else {
        xhr.send();
      }
    };
    /**
     * Parse information from server
     * @method _parseInfo
     * @param {JSON} info Parsed Information from the server
     * @param {Skyway} self Skyway object
     * @private
     * @required
     */
    this._parseInfo = function(info, self) {
      console.log(info);

      if (!info.pc_constraints && !info.offer_constraints) {
        self._trigger('readyStateChange', this.READY_STATE_CHANGE.API_ERROR);
        return;
      }
      console.log(JSON.parse(info.pc_constraints));
      console.log(JSON.parse(info.offer_constraints));

      self._key = info.cid;
      self._user = {
        id: info.username,
        token: info.userCred,
        timeStamp: info.timeStamp,
        displayName: info.displayName,
        apiOwner: info.apiOwner,
        streams: []
      };
      self._room = {
        id: info.room_key,
        token: info.roomCred,
        start: info.start,
        len: info.len,
        signalingServer: {
          ip: info.ipSigserver,
          port: info.portSigserver,
          protocol: info.protocol
        },
        pcHelper: {
          pcConstraints: JSON.parse(info.pc_constraints),
          pcConfig: null,
          offerConstraints: JSON.parse(info.offer_constraints),
          sdpConstraints: {
            mandatory: {
              OfferToReceiveAudio: true,
              OfferToReceiveVideo: true
            }
          }
        }
      };
      self._readyState = 2;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.COMPLETED);
      console.info('API - Parsed infos from webserver. Ready.');
    };
    /**
     * NOTE: Changed from _init to _loadInfo to prevent confusion
     * Load information from server
     * @method _loadInfo
     * @param {Skyway} self Skyway object
     * @private
     * @required
     */
    this._loadInfo = function(self) {
      if (!window.io) {
        console.error('API - Socket.io not loaded.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_SOCKET_ERROR);
        return;
      }
      if (!window.XMLHttpRequest) {
        console.error('XHR - XMLHttpRequest not supported');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_XMLHTTPREQUEST_ERROR);
        return;
      }
      if (!window.RTCPeerConnection) {
        console.error('RTC - WebRTC not supported.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_WEBRTC_ERROR);
        return;
      }
      if (!self._path) {
        console.error('API - No connection info. Call init() first.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_PATH_ERROR);
        return;
      }

      self._readyState = 1;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.LOADING);
      self._requestServerInfo('GET', self._path, function(status, response) {
        if (status !== 200) {
          self._readyState = 0;
          self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR);
          return;
        }
        console.info(response);
        self._parseInfo(response, self);
      });
      console.log('API - Waiting for webserver to provide infos.');
    };
  }
  this.Skyway = Skyway;
  /**
   * Let app register a callback function to an event
   * @method on
   * @param {String} eventName
   * @param {Function} callback
   */
  Skyway.prototype.on = function(eventName, callback) {
    if ('function' === typeof callback) {
      this._events[eventName] = this._events[eventName] || [];
      this._events[eventName].push(callback);
    }
  };

  /**
   * Let app unregister a callback function from an event
   * @method off
   * @param {String} eventName
   * @param {Function} callback
   */
  Skyway.prototype.off = function(eventName, callback) {
    if (callback === undefined) {
      this._events[eventName] = [];
      return;
    }
    var arr = this._events[eventName],
      l = arr.length;
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
   * @method _trigger
   * @param {String} eventName
   * @for Skyway
   * @private
   */
  Skyway.prototype._trigger = function(eventName) {
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
   * IMPORTANT: Please call this method to load all server information before joining
   * the room or doing anything else.
   * The Init function to load Skyway.
   * If you would like to set the start time and duration of the room, you have to
   * generate the credentials.
   * Steps to generate the credentials:
   * - Hash: This hash is created by
   *   using the roomname, duration and the timestamp (in ISO String format).
   * - E.g: hash = CryptoJS.HmacSHA1(roomname + '_' + duration + '_' +
   *   (new Date()).toISOString()).
   * - Credentials: The credentials is generated by converting the hash to a
   *   Base64 string and then encoding it to a URI string.
   * - E.g: encodeURIComponent(hash.toString(CryptoJS.enc.Base64))
   * @method init
   * @param {} options Connection options or app key ID [init('APP_KEY')]
   * @param {String} options.roomserver Optional. Path to the Temasys backend server
   * @param {String} options.appKey App Key ID to identify with the Temasys backend server
   * @param {String} options.defaultRoom Optional. The default room to connect to if there is
   *   no options.room provided.
   * @param {String} options.room Optional. The room joinRoom connects to.
   *   If there's no room provided, default room would be used.
   * @param {String} options.region Optional. The regional server that user chooses to use.
   *   [Rel: Skyway.REGIONAL_SERVER]
   * @param {String} options.iceTrickle Optional. The option to enable iceTrickle or not.
   *   Default is true.
   * @param {String} options.credentials Optional. Credentials options
   * @param {String} options.credentials.startDateTime The Start timing of the
   *   meeting in Date ISO String
   * @param {Integer} options.credentials.duration The duration of the meeting
   * @param {String} options.credentials.credentials The credentials required
   *   to set the timing and duration of a meeting.
   * @example
   *   SkywayDemo.init('APP_KEY');
   * @example
   *   SkywayDemo.init({
   *     'appKey' : 'APP_KEY',
   *     'roomServer' : 'ROOM_SERVER',
   *     'defaultRoom' : 'CAT_FORUM',
   *     'room' : 'PERSIAN_CATS'
   *   });
   * @example
   *   SkywayDemo.init({
   *     'appKey' : 'APP_KEY',
   *     'roomServer' : 'ROOM_SERVER',
   *     'defaultRoom' : 'CAT_FORUM',
   *     'room' : 'PERSIAN_CATS',
   *     'credentials' : {
   *        'startDateTime' : (new Date()).toISOString(),
   *        'duration' : 500,
   *        'credentials' : 'THE_CREDENTIALS'
   *     }
   *   });
   * @for Skyway
   * @required
   */
  Skyway.prototype.init = function(options) {
    var appKey, room, defaultRoom;
    var startDateTime, duration, credentials;
    var roomserver = this._serverPath;
    var region = 'us1';
    var iceTrickle = true;

    if (typeof options === 'string') {
      appKey = options;
      defaultRoom = appKey;
      room = appKey;
    } else {
      appKey = options.appKey;
      roomserver = options.roomServer || roomserver;
      roomserver = (roomserver.lastIndexOf('/') ===
        (roomserver.length - 1)) ? roomserver.substring(0,
        str.length - 1) : roomserver;
      region = options.region || region;
      defaultRoom = options.defaultRoom || appKey;
      room = options.room || defaultRoom;
      iceTrickle = (typeof options.iceTrickle !== undefined) ?
        options.iceTrickle : iceTrickle;
      // Custom default meeting timing and duration
      // Fallback to default if no duration or startDateTime provided
      if (options.credentials) {
        startDateTime = options.credentials.startDateTime ||
          (new Date()).toISOString();
        duration = options.credentials.duration || 200;
        credentials = options.credentials.credentials;
      }
    }
    this._readyState = 0;
    this._trigger('readyStateChange', this.READY_STATE_CHANGE.INIT);
    this._appKey = appKey;
    this._roomServer = roomserver;
    this._defaultRoom = defaultRoom;
    this._selectedRoom = room;
    this._serverRegion = region;
    console.info('ICE Trickle: ' + options.iceTrickle);
    this._enableIceTrickle = iceTrickle;
    this._path = roomserver + '/api/' + appKey + '/' + room;
    if (credentials) {
      this._roomStart = startDateTime;
      this._roomDuration = duration;
      this._roomCredentials = credentials;
      this._path += (credentials) ? ('/' + startDateTime + '/' +
        duration + '?&cred=' + credentials) : '';
    }
    this._path += ((this._path.indexOf('?&') > -1) ?
      '&' : '?&') + 'rg=' + region;
    console.log('API - Path: ' + this._path);
    this._loadInfo(this);
  };

  /**
   * Reinitialize Skyway signaling credentials
   * @method _reinit
   * @param {Function} callback Once everything is done
   * @param {JSON} options
   * @param {String} options.roomserver
   * @param {String} options.appKey
   * @param {String} options.defaultRoom
   * @param {String} options.room
   * @param {String} options.region
   * @param {String} options.iceTrickle
   * @param {String} options.credentials
   * @param {String} options.credentials.startDateTime
   * @param {Integer} options.credentials.duration
   * @param {String} options.credentials.credentials
   * @private
   */
  Skyway.prototype._reinit = function(callback, options) {
    var self = this;
    var startDateTime, duration, credentials;
    var appKey = options.appKey || self._appKey;
    var roomserver = options.roomServer || self._roomServer;
    console.info(appKey);
    console.info(roomserver);
    roomserver = (roomserver.lastIndexOf('/') ===
      (roomserver.length - 1)) ? roomserver.substring(0,
      str.length - 1) : roomserver;
    var region = options.region || self._serverRegion;
    var defaultRoom = options.defaultRoom || self._defaultRoom;
    var room = options.room || defaultRoom;
    var iceTrickle = (typeof options.iceTrickle !== undefined) ?
      options.iceTrickle : self._enableIceTrickle;
    if (options.credentials) {
      startDateTime = options.credentials.startDateTime ||
        (new Date()).toISOString();
      duration = options.credentials.duration || 500;
      credentials = options.credentials.credentials ||
        self._roomCredentials;
    } else if (self._roomCredentials) {
      startDateTime = self._roomStart;
      duration = self._roomDuration;
      credentials = self._roomCredentials;
    }
    self._appKey = appKey;
    self._roomServer = roomserver;
    self._defaultRoom = defaultRoom;
    self._selectedRoom = room;
    self._serverRegion = region;
    self._enableIceTrickle = iceTrickle;
    self._path = roomserver + '/api/' + appKey + '/' + room;
    if (credentials) {
      self._roomStart = startDateTime;
      self._roomDuration = duration;
      self._roomCredentials = credentials;
      self._path += (credentials) ? ('/' + startDateTime + '/' +
        duration + '?&cred=' + credentials) : '';
    }
    self._path += ((self._path.indexOf('?&') > -1) ?
      '&' : '?&') + 'rg=' + region;
    self._requestServerInfo('GET', self._path, function(status, response) {
      if (status !== 200) {
        self._readyState = 0;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR);
        return;
      }
      console.info(response);
      var info = response;
      try {
        self._key = info.cid;
        self._user = {
          id: info.username,
          token: info.userCred,
          timeStamp: info.timeStamp,
          displayName: info.displayName,
          apiOwner: info.apiOwner,
          streams: []
        };
        self._room = {
          id: info.room_key,
          token: info.roomCred,
          start: info.start,
          len: info.len,
          signalingServer: {
            ip: info.ipSigserver,
            port: info.portSigserver,
            protocol: info.protocol
          },
          pcHelper: {
            pcConstraints: JSON.parse(info.pc_constraints),
            pcConfig: null,
            offerConstraints: JSON.parse(info.offer_constraints),
            sdpConstraints: {
              mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
              }
            }
          }
        };
        callback();
      } catch (err) {
        console.error('API - Error occurred rejoining room');
        console.error(err);
        self._readyState = 0;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR);
        return;
      }
    });
  };

  /**
   * Allow Developers to set Skyway in Debug mode.
   * @method setUser
   * @param {Boolean} debug
   * @protected
   */
  Skyway.prototype.setDebug = function(debug) {
    this._debug = debug;
  };

  /**
   * Set and Update the User information
   * @method setUser
   * @param {JSON} userInfo User information set by User
   * @protected
   */
  Skyway.prototype.setUser = function(userInfo) {
    // NOTE ALEX: be smarter and copy fields and only if different
    var self = this;
    if (userInfo) {
      self._user.info = userInfo || self._user.info || {};
    }
    if (self._user._init) {
      // Prevent multiple messages at the same time
      setTimeout(function() {
        self._sendMessage({
          type: 'updateUserEvent',
          mid: self._user.sid,
          rid: self._room.id,
          userInfo: self._user.info
        });
      }, 1000);
    } else {
      self._user._init = true;
    }
  };

  /**
   * Get the User Information
   * @method getUser
   * @return {JSON} userInfo User information
   * @protected
   */
  Skyway.prototype.getUser = function() {
    return this._user.info;
  };

  /**
   * Get the Peer Information
   * @method getPeer
   * @param {String} peerId
   * @return {JSON} peerInfo Peer information
   * @protected
   */
  Skyway.prototype.getPeer = function(peerId) {
    if (!peerId) {
      return;
    }
    return this._peerInformations[peerId];
  };

  /* Syntactically private variables and utility functions */
  Skyway.prototype._events = {
    /**
     * Event fired when a successfull connection channel has been established
     * with the signaling server
     * @event channelOpen
     */
    'channelOpen': [],
    /**
     * Event fired when the channel has been closed.
     * @event channelClose
     */
    'channelClose': [],
    /**
     * Event fired when we received a message from the sig server..
     * @event channelMessage
     * @param {JSON} msg
     */
    'channelMessage': [],
    /**
     * Event fired when there was an error with the connection channel to the sig server.
     * @event channelError
     * @param {String} error
     */
    'channelError': [],
    /**
     * Event fired when user joins the room
     * @event joinedRoom
     * @param {String} roomId
     * @param {String} userId
     */
    'joinedRoom': [],
    /**
     * Event fired whether the room is ready for use
     * @event readyStateChange
     * @param {String} readyState [Rel: Skyway.READY_STATE_CHANGE]
     */
    'readyStateChange': [],
    /**
     * Event fired when a step of the handshake has happened. Usefull for diagnostic
     * or progress bar.
     * @event handshakeProgress
     * @param {String} step [Rel: Skyway.HANDSHAKE_PROGRESS]
     * @param {String} peerId
     */
    'handshakeProgress': [],
    /**
     * Event fired during ICE gathering
     * @event candidateGenerationState
     * @param {String} state [Rel: Skyway.CANDIDATE_GENERATION_STATE]
     * @param {String} peerId
     */
    'candidateGenerationState': [],
    /**
     * Event fired during Peer Connection state change
     * @event peerConnectionState
     * @param {String} state [Rel: Skyway.PEER_CONNECTION_STATE]
     */
    'peerConnectionState': [],
    /**
     * Event fired during ICE connection
     * @iceConnectionState
     * @param {String} state [Rel: Skyway.ICE_CONNECTION_STATE]
     * @param {String} peerId
     */
    'iceConnectionState': [],
    //-- per peer, local media events
    /**
     * Event fired when allowing webcam media stream fails
     * @event mediaAccessError
     * @param {String} error
     */
    'mediaAccessError': [],
    /**
     * Event fired when allowing webcam media stream passes
     * @event mediaAccessSuccess
     * @param {Object} stream
     */
    'mediaAccessSuccess': [],
    /**
     * Event fired when a chat message is received from other peers
     * @event chatMessage
     * @param {String}  msg
     * @param {String}  senderId
     * @param {Boolean} pvt
     */
    'chatMessage': [],
    /**
     * Event fired when a peer joins the room
     * @event peerJoined
     * @param {String} peerId
     */
    'peerJoined': [],
    /**
     * Event fired when a peer leaves the room
     * @event peerLeft
     * @param {String} peerId
     */
    'peerLeft': [],
    /**
     * TODO Event fired when a peer joins the room
     * @event presenceChanged
     * @param {JSON} users The list of users
     * @private
     * @deprecated
     */
    'presenceChanged': [],
    //-- per peer, peer connection events
    /**
     * Event fired when a remote stream has become available
     * @event addPeerStream
     * @param {String} peerId
     * @param {Object} stream
     */
    'addPeerStream': [],
    /**
     * Event fired when a remote stream has become unavailable
     * @event removePeerStream
     * @param {String} peerId
     * @private
     * @deprecated
     */
    'removePeerStream': [],
    /**
     * Event fired when a peer's video is muted
     * @event peerVideoMute
     * @param {String} peerId
     * @param {Boolean} isMuted
     * @param {Boolean} isSelf
     */
    'peerVideoMute': [],
    /**
     * Event fired when a peer's audio is muted
     * @param {String} peerId
     * @param {Boolean} isMuted
     * @param {Boolean} isSelf
     */
    'peerAudioMute': [],
    /**
     * Event fired when a room is locked
     * @event roomLock
     * @param {Boolean} success
     * @param {Boolean} isLocked
     * @param {String} error
     */
    'roomLock': [],
    //-- per user events
    /**
     * Event fired based on when Peer Information is updated
     * @event
     * @param {JSON} userInfo
     * @param {String} peerId
     */
    'updatedUser': [],
    /**
     * TODO Event fired when a contact is added
     * @param {String} userId
     * @private
     * @deprecated
     */
    'addContact': [],
    /**
     * TODO Event fired when a contact is removed
     * @param {String} userId
     * @private
     * @deprecated
     */
    'removeContact': [],
    /**
     * TODO Event fired when a contact is invited
     * @param {String} userId
     * @private
     * @deprecated
     */
    'invitePeer': [],
    //-- data state events
    /**
     * Event fired when a DataChannel's state has changed
     * @event dataChannelState
     * @param {String} state [Rel: Skyway.DATA_CHANNEL_STATE]
     * @param {String} peerId
     */
    'dataChannelState': [],
    /**
     * Event fired when a Peer there is a Data Transfer going on
     * @event dataTransferState
     * @param {String} state [Rel: Skyway.DATA_TRANSFER_STATE]
     * @param {String} itemId ID of the Data Transfer
     * @param {String} peerId Peer's ID
     * @param {JSON} transferInfo Available data may vary at different state.
     * @param {JSON} transferInfo.percentage The percetange of data being
     *   uploaded / downloaded
     * @param {JSON} transferInfo.senderId The sender Peer's ID
     * @param {JSON} transferInfo.data Blob data URL
     * @param {JSON} transferInfo.name Data name
     * @param {JSON} transferInfo.size Data size
     * @param {JSON} transferInfo.message Error message
     * @param {JSON} transferInfo.type Where the error message occurred.
     *   [Rel: Skyway.DATA_TRANSFER_TYPE]
     */
    'dataTransferState': [],
    /**
     * Event fired when the Signalling server responds to user regarding
     * the state of the room
     * @event systemAction
     * @param {String} action [Rel: Skyway.SYSTEM_ACTION]
     * @param {String} message The reason of the action
     */
    'systemAction': [],
    /**
     * Event fired based on what user has set for specific users
     * @event privateMessage
     * @param {JSON/String} data Data to be sent over
     * @param {String} senderId Sender
     * @param {String} peerId Targeted Peer to receive the data
     * @param {Boolean} isSelf Check if message is sent to self
     */
    'privateMessage': [],
    /**
     * Event fired based on what user has set for all users
     * @event publicMessage
     * @param {JSON/String} data
     * @param {String} senderId Sender
     * @param {Boolean} isSelf Check if message is sent to self
     */
    'publicMessage': []
  };

  /**
   * Send a chat message
   * @method sendChatMsg
   * @param {String} chatMsg
   * @param {String} targetpeerId
   */
  Skyway.prototype.sendChatMsg = function(chatMsg, targetpeerId) {
    var msg_json = {
      cid: this._key,
      data: chatMsg,
      mid: this._user.sid,
      sender: this._user.sid,
      rid: this._room.id,
      type: this.SIG_TYPE.CHAT
    };
    if (targetpeerId) {
      msg_json.target = targetpeerId;
    }
    this._sendMessage(msg_json);
    this._trigger('chatMessage', chatMsg, this._user.sid, !!targetpeerId);
  };

  /**
   * Send a chat message via DataChannel
   * @method sendDataChannelChatMsg
   * @param {String} chatMsg
   * @param {String} targetpeerId
   */
  Skyway.prototype.sendDataChannelChatMsg = function(chatMsg, targetpeerId) {
    var msg_json = {
      cid: this._key,
      data: chatMsg,
      mid: this._user.sid,
      sender: this._user.sid,
      rid: this._room.id,
      type: this.SIG_TYPE.CHAT
    };
    if (targetpeerId) {
      msg_json.target = targetpeerId;
    }
    if (targetpeerId) {
      if (this._dataChannels.hasOwnProperty(targetpeerId)) {
        this._sendDataChannel(targetpeerId, ['CHAT', 'PRIVATE', this._user.sid, chatMsg]);
      }
    } else {
      for (var peerId in this._dataChannels) {
        if (this._dataChannels.hasOwnProperty(peerId)) {
          this._sendDataChannel(peerId, ['CHAT', 'GROUP', this._user.sid, chatMsg]);
        }
      }
    }
    this._trigger('chatMessage', chatMsg, this._user.sid, !!targetpeerId);
  };

  /**
   * Send a private message
   * @method sendPrivateMsg
   * @param {JSON}   data
   * @param {String} targetpeerId
   * @protected
   */
  Skyway.prototype.sendPrivateMsg = function(data, targetpeerId) {
    var msg_json = {
      cid: this._key,
      data: data,
      mid: this._user.sid,
      rid: this._room.id,
      sender: this._user.sid,
      target: ((targetpeerId) ? targetpeerId : this._user.sid),
      type: this.SIG_TYPE.PRIVATE_MSG
    };
    this._sendMessage(msg_json);
    this._trigger('privateMessage', data, this._user.sid, targetpeerId, true);
  };

  /**
   * Send a public broadcast message
   * @method sendPublicMsg
   * @param {JSON}   data
   * @protected
   */
  Skyway.prototype.sendPublicMsg = function(data) {
    var msg_json = {
      cid: this._key,
      data: data,
      mid: this._user.sid,
      sender: this._user.sid,
      rid: this._room.id,
      type: this.SIG_TYPE.PUBLIC_MSG
    };
    this._sendMessage(msg_json);
    this._trigger('publicMessage', data, this._user.sid, true);
  };

  /**
   * Get the default cam and microphone
   * @method getDefaultStream
   * @param {JSON} options
   * @param {Boolean} options.audio
   * @param {Boolean} options.video
   * @param {JSON} mediaSettings
   * @param {Integer} mediaSettings.width Video width
   * @param {Integer} mediaSettings.height Video height
   * @param {String} res [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} mediaSettings.frameRate Mininum frameRate of Video
   * @example
   *   SkywayDemo.getDefaultStream();
   * @example
   *   SkywayDemo.getDefaultStream({
   *     'video' : false,
   *     'audio' : true
   *   });
   * @example
   *   SkywayDemo.getDefaultStream({
   *     'video' : {
   *        res: SkywayDemo.VIDEO_RESOLUTION.HD,
   *        frameRate: 50
   *      },
   *     'audio' : { stereo: true }
   *   });
   */
  Skyway.prototype.getDefaultStream = function(options) {
    var self = this;
    // So it would invoke to getMediaStream defaults
    // Not putting any audio or video parameter means nothing
    if (!self._streamSettings.audio || !self._streamSettings.video) {
      self._parseStreamSettings(options || {
        audio: null,
        video: null
      });
    }
    try {
      window.getUserMedia({
        audio: self._streamSettings.audio,
        video: self._streamSettings.video
      }, function(s) {
        self._onUserMediaSuccess(s, self);
      }, function(e) {
        self._onUserMediaError(e, self);
      });
      console.log('API [MediaStream] - Requested ' +
        ((self._streamSettings.audio) ? 'A' : '') +
        ((self._streamSettings.audio &&
          self._streamSettings.video) ? '/' : '') +
        ((self._streamSettings.video) ? 'V' : ''));
    } catch (e) {
      this._onUserMediaError(e, self);
    }
  };

  /**
   * Stream is available, let's throw the corresponding event with the stream attached.
   * @method _onUserMediaSuccess
   * @param {MediaStream} stream The acquired stream
   * @param {} self   A convenience pointer to the Skyway object for callbacks
   * @private
   */
  Skyway.prototype._onUserMediaSuccess = function(stream, self) {
    console.log('API - User has granted access to local media.');
    self._trigger('mediaAccessSuccess', stream);
    self._user.streams[stream.id] = stream;
  };

  /**
   * getUserMedia could not succeed.
   * @method _onUserMediaError
   * @param {} e error
   * @param {} self A convenience pointer to the Skyway object for callbacks
   * @private
   */
  Skyway.prototype._onUserMediaError = function(e, self) {
    console.log('API - getUserMedia failed with exception type: ' + e.name);
    if (e.message) {
      console.log('API - getUserMedia failed with exception: ' + e.message);
    }
    if (e.constraintName) {
      console.log('API - getUserMedia failed because of the following constraint: ' +
        e.constraintName);
    }
    self._trigger('mediaAccessError', (e.name || e));
  };

  /**
   * Handle every incoming message. If it's a bundle, extract single messages
   * Eventually handle the message(s) to _processSingleMsg
   * @method _processingSigMsg
   * @param {JSON} message
   * @private
   */
  Skyway.prototype._processSigMsg = function(message) {
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
   * @method _processingSingleMsg
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._processSingleMsg = function(msg) {
    this._trigger('channelMessage', msg);
    var origin = msg.mid;
    if (!origin || origin === this._user.sid) {
      origin = 'Server';
    }
    console.log('API - [' + origin + '] Incoming message: ' + msg.type);
    if (msg.mid === this._user.sid &&
      msg.type !== this.SIG_TYPE.REDIRECT &&
      msg.type !== this.SIG_TYPE.IN_ROOM &&
      msg.type !== this.SIG_TYPE.CHAT) {
      console.log('API - Ignoring message: ' + msg.type + '.');
      return;
    }
    switch (msg.type) {
    //--- BASIC API Msgs ----
    case this.SIG_TYPE.PUBLIC_MSG:
      this._MsgHandler(msg);
      break;
    case this.SIG_TYPE.PRIVATE_MSG:
      this._privateMsgHandler(msg);
      break;
    case this.SIG_TYPE.IN_ROOM:
      this._inRoomHandler(msg);
      break;
    case this.SIG_TYPE.ENTER:
      this._enterHandler(msg);
      break;
    case this.SIG_TYPE.WELCOME:
      this._welcomeHandler(msg);
      break;
    case this.SIG_TYPE.OFFER:
      this._offerHandler(msg);
      break;
    case this.SIG_TYPE.ANSWER:
      this._answerHandler(msg);
      break;
    case this.SIG_TYPE.CANDIDATE:
      this._candidateHandler(msg);
      break;
    case this.SIG_TYPE.BYE:
      this._byeHandler(msg);
      break;
    case this.SIG_TYPE.CHAT:
      this._chatHandler(msg);
      break;
    case this.SIG_TYPE.REDIRECT:
      this._redirectHandler(msg);
      break;
    case this.SIG_TYPE.ERROR:
      this._errorHandler(msg);
      break;
      //--- ADVANCED API Msgs ----
    case this.SIG_TYPE.UPDATE_USER:
      this._updateUserEventHandler(msg);
      break;
    case this.SIG_TYPE.MUTE_VIDEO:
      this._muteVideoEventHandler(msg);
      break;
    case this.SIG_TYPE.MUTE_AUDIO:
      this._muteAudioEventHandler(msg);
      break;
    case this.SIG_TYPE.ROOM_LOCK:
      this._roomLockEventHandler(msg);
      break;
    case this.SIG_TYPE.INVITE:
      // this._inviteHandler();
      break;
    default:
      console.log('API - [' + msg.mid + '] Unsupported message type received: ' + msg.type);
      break;
    }
  };

  /**
   * Throw an event with the received chat msg
   * @method _chatHandler
   * @param {JSON} msg
   * @param {String} msg.data
   * @param {String} msg.nick
   * @private
   */
  Skyway.prototype._chatHandler = function(msg) {
    this._trigger('chatMessage', msg.data, msg.sender, (msg.target ? true : false));
  };

  /**
   * Signaling server error message
   * @method _errorHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._errorHandler = function(msg) {
    console.log('API - [Server] Error occurred: ' + msg.kind);
    // location.href = '/?error=' + msg.kind;
  };

  /**
   * Signaling server wants us to move out.
   * @method _redirectHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._redirectHandler = function(msg) {
    console.log('API - [Server] You are being redirected: ' + msg.info);
    this._trigger('systemAction', msg.action, msg.info);
  };

  /**
   * User Information is updated
   * @method _updateUserEventHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._updateUserEventHandler = function(msg) {
    var targetMid = msg.mid;
    console.log('API - [' + targetMid + '] received \'updateUserEvent\'.');
    console.info(msg);
    this._peerInformations[targetMid] = msg.userInfo || {};
    this._trigger('updatedUser', msg.userInfo || {}, targetMid);
  };

  /**
   * Room Lock is Fired
   * @method _roomLockEventHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._roomLockEventHandler = function(msg) {
    var targetMid = msg.mid;
    console.log('API - [' + targetMid + '] received \'roomLockEvent\'.');
    this._trigger('roomLock', true, msg.lock);
  };

  /**
   * Peer Audio is muted/unmuted
   * @method _muteAudioEventHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._muteAudioEventHandler = function(msg) {
    var targetMid = msg.mid;
    console.log('API - [' + targetMid + '] received \'muteAudioEvent\'.');
    this._trigger('peerAudioMute', targetMid, msg.enabled);
  };

  /**
   * Peer Video is muted/unmuted
   * @method _muteVideoEventHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._muteVideoEventHandler = function(msg) {
    var targetMid = msg.mid;
    console.log('API - [' + targetMid + '] received \'muteVideoEvent\'.');
    this._trigger('peerVideoMute', targetMid, msg.enabled);
  };

  /**
   * A peer left, let's clean the corresponding connection, and trigger an event.
   * @method _byeHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._byeHandler = function(msg) {
    var targetMid = msg.mid;
    console.log('API - [' + targetMid + '] received \'bye\'.');
    this._removePeer(targetMid);
  };

  /**
   * Throw an event with the received private msg
   * @method _privateMsgHandler
   * @param {JSON} msg
   * @param {String} msg.data
   * @param {String} msg.sender
   * @param {String} msg.target
   * @private
   */
  Skyway.prototype._privateMsgHandler = function(msg) {
    this._trigger('privateMessage', msg.data, msg.sender, msg.target, false);
  };

  /**
   * Throw an event with the received private msg
   * @method _publicMsgHandler
   * @param {JSON} msg
   * @param {String} msg.sender
   * @param {JSON/String} msg.data
   * @private
   */
  Skyway.prototype._publicMsgHandler = function(msg) {
    this._trigger('publicMessage', msg.data, msg.sender, false);
  };

  /**
   * Actually clean the peerconnection and trigger an event. Can be called by _byHandler
   * and leaveRoom.
   * @method _removePeer
   * @param {String} peerId Id of the peer to remove
   * @private
   */
  Skyway.prototype._removePeer = function(peerId) {
    this._trigger('peerLeft', peerId);
    if (this._peerConnections[peerId]) {
      this._peerConnections[peerId].close();
    }
    delete this._peerConnections[peerId];
  };

  /**
   * We just joined a room! Let's send a nice message to all to let them know I'm in.
   * @method _inRoomHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._inRoomHandler = function(msg) {
    console.log('API - We\'re in the room! Chat functionalities are now available.');
    console.log('API - We\'ve been given the following PC Constraint by the sig server: ');
    console.dir(msg.pc_config);

    this._room.pcHelper.pcConfig = this._setFirefoxIceServers(msg.pc_config);
    this._in_room = true;
    this._user.sid = msg.sid;
    this._trigger('joinedRoom', this._room.id, this._user.sid);

    // NOTE ALEX: should we wait for local streams?
    // or just go with what we have (if no stream, then one way?)
    // do we hardcode the logic here, or give the flexibility?
    // It would be better to separate, do we could choose with whom
    // we want to communicate, instead of connecting automatically to all.
    var self = this;
    console.log('API - Sending enter.');
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER);
    self._sendMessage({
      type: self.SIG_TYPE.ENTER,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser.browser,
      version: window.webrtcDetectedBrowser.version
    });
  };

  /**
   * Someone just entered the room. If we don't have a connection with him/her,
   * send him a welcome. Handshake step 2 and 3.
   * @method _enterHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._enterHandler = function(msg) {
    var targetMid = msg.mid;
    var self = this;
    // need to check entered user is new or not.
    if (!self._peerConnections[targetMid]) {
      msg.agent = (!msg.agent) ? 'Chrome' : msg.agent;
      var browserAgent = msg.agent + ((msg.version) ? ('|' + msg.version) : '');
      // should we resend the enter so we can be the offerer?
      checkMediaDataChannelSettings(false, browserAgent, function(beOfferer) {
        self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
        var params = {
          type: ((beOfferer) ? self.SIG_TYPE.ENTER : self.SIG_TYPE.WELCOME),
          mid: self._user.sid,
          rid: self._room.id,
          agent: window.webrtcDetectedBrowser.browser
        };
        if (!beOfferer) {
          console.log('API - [' + targetMid + '] Sending welcome.');
          self._trigger('peerJoined', targetMid);
          self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
          params.target = targetMid;
        }
        self._sendMessage(params);
        self.setUser();
      });
    } else {
      // NOTE ALEX: and if we already have a connection when the peer enter,
      // what should we do? what are the possible use case?
      console.log('API - Received "enter" when Peer "' + targetMid +
        '" is already added');
      return;
    }
  };

  /**
   * We have just received a welcome. If there is no existing connection with this peer,
   * create one, then set the remotedescription and answer.
   * @method _welcomeHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._welcomeHandler = function(msg) {
    var targetMid = msg.mid;
    msg.agent = (!msg.agent) ? 'Chrome' : msg.agent;
    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    this._trigger('peerJoined', targetMid);
    this._enableIceTrickle = (typeof msg.enableIceTrickle !== undefined) ?
      msg.enableIceTrickle : this._enableIceTrickle;
    if (!this._peerConnections[targetMid]) {
      this._openPeer(targetMid, msg.agent, true, msg.receiveOnly);
      this.setUser();
    }
  };

  /**
   * We have just received an offer. If there is no existing connection with this peer,
   * create one, then set the remotedescription and answer.
   * @method _offerHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._offerHandler = function(msg) {
    var targetMid = msg.mid;
    msg.agent = (!msg.agent) ? 'Chrome' : msg.agent;
    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.OFFER, targetMid);
    console.log('Test:');
    console.log(msg);
    var offer = new window.RTCSessionDescription(msg);
    console.log('API - [' + targetMid + '] Received offer:');
    console.dir(offer);
    var pc = this._peerConnections[targetMid];
    if (!pc) {
      this._openPeer(targetMid, msg.agent, false);
      pc = this._peerConnections[targetMid];
    }
    var self = this;
    pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
      self._doAnswer(targetMid);
    }, function(err) {
      console.error(err);
    });
  };

  /**
   * We have succesfully received an offer and set it locally. This function will take care
   * of cerating and sendng the corresponding answer. Handshake step 4.
   * @method _doAnswer
   * @param {String} targetMid The peer we should connect to.
   * @private
   */
  Skyway.prototype._doAnswer = function(targetMid) {
    console.log('API - [' + targetMid + '] Creating answer.');
    var pc = this._peerConnections[targetMid];
    var self = this;
    if (pc) {
      pc.createAnswer(function(answer) {
        console.log('API - [' + targetMid + '] Created  answer.');
        console.dir(answer);
        self._setLocalAndSendMessage(targetMid, answer);
      }, function(error) {
        self._onOfferOrAnswerError(targetMid, error, 'answer');
      }, self._room.pcHelper.sdpConstraints);
    } else {
      return;
      /* Houston ..*/
    }
  };

  /**
   * Fallback for offer or answer creation failure.
   * @method _onOfferOrAnswerError
   * @param {String} targetMid
   * @param {} error
   * @param {String} type
   * @private
   */
  Skyway.prototype._onOfferOrAnswerError = function(targetMid, error, type) {
    console.log('API - [' + targetMid + '] Failed to create an ' + type +
      '. Error code was ' + JSON.stringify(error));
  };

  /**
   * We have a peer, this creates a peerconnection object to handle the call.
   * if we are the initiator, we then starts the O/A handshake.
   * @method _openPeer
   * @param {String} targetMid The peer we should connect to.
   * @param {String} peerAgentBrowser The peer's browser
   * @param {Boolean} toOffer Wether we should start the O/A or wait.
   * @param {Boolean} receiveOnly Should they only receive?
   * @private
   */
  Skyway.prototype._openPeer = function(targetMid, peerAgentBrowser, toOffer, receiveOnly) {
    console.log('API - [' + targetMid + '] Creating PeerConnection.');
    var self = this;

    self._peerConnections[targetMid] = self._createPeerConnection(targetMid);
    if (!receiveOnly) {
      self._addLocalStream(targetMid);
    }
    // I'm the callee I need to make an offer
    if (toOffer) {
      self._createDataChannel(targetMid, function(dc) {
        self._dataChannels[targetMid] = dc;
        self._dataChannelPeers[dc.label] = targetMid;
        self._checkDataChannelStatus(dc);
        self._doCall(targetMid, peerAgentBrowser);
      });
    }
  };

  /**
   * Sends our Local MediaStream to other Peers.
   * By default, it sends all it's other stream
   * @method _addLocalStream
   * @param {String} peerId
   * @private
   */
  Skyway.prototype._addLocalStream = function(peerId) {
    // NOTE ALEX: here we could do something smarter
    // a mediastream is mainly a container, most of the info
    // are attached to the tracks. We should iterates over track and print
    console.log('API - [' + peerId + '] Adding local stream.');

    if (Object.keys(this._user.streams).length > 0) {
      for (var stream in this._user.streams) {
        if (this._user.streams.hasOwnProperty(stream)) {
          this._peerConnections[peerId].addStream(this._user.streams[stream]);
        }
      }
    } else {
      console.log('API - WARNING - No stream to send. You will be only receiving.');
    }
  };

  /**
   * The remote peer advertised streams, that we are forwarding to the app. This is part
   * of the peerConnection's addRemoteDescription() API's callback.
   * @method _onRemoteStreamAdded
   * @param {String} targetMid
   * @param {Event}  event      This is provided directly by the peerconnection API.
   * @private
   */
  Skyway.prototype._onRemoteStreamAdded = function(targetMid, event) {
    console.log('API - [' + targetMid + '] Remote Stream added.');
    this._trigger('addPeerStream', targetMid, event.stream);
  };

  /**
   * It then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
   * @method _doCall
   * @param {String} targetMid
   * @private
   */
  Skyway.prototype._doCall = function(targetMid, peerAgentBrowser) {
    var pc = this._peerConnections[targetMid];
    // NOTE ALEX: handle the pc = 0 case, just to be sure
    var constraints = this._room.pcHelper.offerConstraints;
    var sc = this._room.pcHelper.sdpConstraints;
    for (var name in sc.mandatory) {
      if (sc.mandatory.hasOwnProperty(name)) {
        constraints.mandatory[name] = sc.mandatory[name];
      }
    }
    constraints.optional.concat(sc.optional);
    console.log('API - [' + targetMid + '] Creating offer.');
    var self = this;
    checkMediaDataChannelSettings(true, peerAgentBrowser, function(offerConstraints) {
      pc.createOffer(function(offer) {
        self._setLocalAndSendMessage(targetMid, offer);
      }, function(error) {
        self._onOfferOrAnswerError(targetMid, error, 'offer');
      }, offerConstraints);
    }, constraints);
  };

  /**
   * Find a line in the SDP and return it
   * @method _findSDPLine
   * @param {Array} sdpLines
   * @param {Array} condition
   * @param {String} value Value to set Sdplines to
   * @return {Array} [index, line] Returns the sdpLines based on the condition
   * @private
   * @beta
   */
  Skyway.prototype._findSDPLine = function(sdpLines, condition, value) {
    for (var index in sdpLines) {
      if (sdpLines.hasOwnProperty(index)) {
        for (var c in condition) {
          if (condition.hasOwnProperty(c)) {
            if (sdpLines[index].indexOf(c) === 0) {
              sdpLines[index] = value;
              return [index, sdpLines[index]];
            }
          }
        }
      }
    }
    return [];
  };

  /**
   * Add Stereo to SDP. Requires OPUS
   * @method _addStereo
   * @param {Array} sdpLines
   * @return {Array} sdpLines Updated version with Stereo feature
   * @private
   * @beta
   */
  Skyway.prototype._addStereo = function(sdpLines) {
    var opusLineFound = false,
      opusPayload = 0;
    // Check if opus exists
    var rtpmapLine = this._findSDPLine(sdpLines, ['a=rtpmap:']);
    if (rtpmapLine.length) {
      if (rtpmapLine[1].split(' ')[1].indexOf('opus/48000/') === 0) {
        opusLineFound = true;
        opusPayload = (rtpmapLine[1].split(' ')[0]).split(':')[1];
      }
    }
    // Find the A=FMTP line with the same payload
    if (opusLineFound) {
      var fmtpLine = this._findSDPLine(sdpLines, ['a=fmtp:' + opusPayload]);
      if (fmtpLine.length) {
        sdpLines[fmtpLine[0]] = fmtpLine[1] + '; stereo=1';
      }
    }
    return sdpLines;
  };

  /**
   * Set Audio, Video and Data Bitrate in SDP
   * @method _setSDPBitrate
   * @param {Array} sdpLines
   * @return {Array} sdpLines Updated version with custom Bandwidth settings
   * @private
   * @beta
   */
  Skyway.prototype._setSDPBitrate = function(sdpLines) {
    // Find if user has audioStream
    var bandwidth = this._streamSettings.bandwidth;
    var maLineFound = this._findSDPLine(sdpLines, ['m=', 'a=']).length;
    var cLineFound = this._findSDPLine(sdpLines, ['c=']).length;
    // Find the RTPMAP with Audio Codec
    if (maLineFound && cLineFound) {
      if (bandwidth.audio) {
        var audioLine = this._findSDPLine(sdpLines, ['a=mid:audio', 'm=mid:audio']);
        sdpLines.splice(audioLine[0], 0, 'b=AS:' + bandwidth.audio);
      }
      if (bandwidth.video) {
        var videoLine = this._findSDPLine(sdpLines, ['a=mid:video', 'm=mid:video']);
        sdpLines.splice(videoLine[0], 0, 'b=AS:' + bandwidth.video);
      }
      if (bandwidth.data) {
        var dataLine = this._findSDPLine(sdpLines, ['a=mid:data', 'm=mid:data']);
        sdpLines.splice(dataLine[0], 0, 'b=AS:' + bandwidth.data);
      }
    }
    return sdpLines;
  };

  /**
   * This takes an offer or an aswer generated locally and set it in the peerconnection
   * it then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
   * @method _setLocalAndSendMessage
   * @param {String} targetMid
   * @param {JSON} sessionDescription This should be provided by the peerconnection API.
   *   User might 'tamper' with it, but then , the setLocal may fail.
   * @private
   */
  Skyway.prototype._setLocalAndSendMessage = function(targetMid, sessionDescription) {
    console.log('API - [' + targetMid + '] Created ' +
      sessionDescription.type + '.');
    console.log(sessionDescription);
    var pc = this._peerConnections[targetMid];
    // NOTE ALEX: handle the pc = 0 case, just to be sure
    var sdpLines = sessionDescription.sdp.split('\r\n');
    if (this._streamSettings.stereo) {
      this._addStereo(sdpLines);
      console.info('API - User has requested Stereo');
    }
    if (this._streamSettings.bandwidth) {
      sdpLines = this._setSDPBitrate(sdpLines, this._streamSettings.bandwidth);
      console.info('API - Custom Bandwidth settings');
      console.info('API - Video: ' + this._streamSettings.bandwidth.video);
      console.info('API - Audio: ' + this._streamSettings.bandwidth.audio);
      console.info('API - Data: ' + this._streamSettings.bandwidth.data);
    }
    sessionDescription.sdp = sdpLines.join('\r\n');

    // NOTE ALEX: opus should not be used for mobile
    // Set Opus as the preferred codec in SDP if Opus is present.
    //sessionDescription.sdp = preferOpus(sessionDescription.sdp);

    // limit bandwidth
    //sessionDescription.sdp = this._limitBandwidth(sessionDescription.sdp);

    console.log('API - [' + targetMid + '] Setting local Description (' +
      sessionDescription.type + ').');

    var self = this;
    pc.setLocalDescription(
      sessionDescription,
      function() {
        console.log('API - [' + targetMid + '] Set ' + sessionDescription.type + '.');
        self._trigger('handshakeProgress', sessionDescription.type, targetMid);
        if (self._enableIceTrickle &&
          sessionDescription.type !== self.HANDSHAKE_PROGRESS.OFFER) {
          console.log('API - [' + targetMid + '] Sending ' + sessionDescription.type + '.');
          self._sendMessage({
            type: sessionDescription.type,
            sdp: sessionDescription.sdp,
            mid: self._user.sid,
            agent: window.webrtcDetectedBrowser.browser,
            target: targetMid,
            rid: self._room.id
          });
        }
      },
      function() {
        console.log('API - [' +
          targetMid + '] There was a problem setting the Local Description.');
      });
  };

  /**
   * This sets the STUN server specially for Firefox for ICE Connection
   * @method _setFirefoxIceServers
   * @param {JSON} config
   * @private
   */
  Skyway.prototype._setFirefoxIceServers = function(config) {
    if (window.webrtcDetectedBrowser.mozWebRTC) {
      // NOTE ALEX: shoul dbe given by the server
      var newIceServers = [{
        'url': 'stun:stun.services.mozilla.com'
      }];
      for (var i = 0; i < config.iceServers.length; i++) {
        var iceServer = config.iceServers[i];
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
      config.iceServers = newIceServers;
    }
    return config;
  };

  /**
   * Waits for MediaStream. Once the stream is loaded, callback is called
   * If there's not a need for stream, callback is called
   * @method _waitForMediaStream
   * @param {Function} callback
   * @param {JSON} options Media Constraints
   * @private
   */
  Skyway.prototype._waitForMediaStream = function(callback, options) {
    var self = this;
    if (!options) {
      callback();
      return;
    } else if (options.hasOwnProperty('bandwidth') && !options.hasOwnProperty('video') &&
      !options.hasOwnProperty('audio')) {
      self._parseStreamSettings(options);
      callback();
      return;
    }
    self.getDefaultStream(options);
    console.log('API - requireVideo: ' +
      ((options.video) ? true : false));
    console.log('API - requireAudio: ' +
      ((options.audio) ? true : false));
    // Loop for stream
    var checkForStream = setInterval(function() {
      for (var stream in self._user.streams) {
        if (self._user.streams.hasOwnProperty(stream)) {
          var audioTracks = self._user.streams[stream].getAudioTracks();
          var videoTracks = self._user.streams[stream].getVideoTracks();
          console.info(stream);
          if (((options.video) ? (videoTracks.length > 0) : true) &&
            ((options.audio) ? (audioTracks.length > 0) : true)) {
            clearInterval(checkForStream);
            callback();
            break;
          }
        }
      }
    }, 2000);
  };

  /**
   * Create a peerconnection to communicate with the peer whose ID is 'targetMid'.
   * All the peerconnection callbacks are set up here. This is a quite central piece.
   * @method _createPeerConnection
   * @param {String} targetMid
   * @return {PeerConnection} The created peer connection object.
   * @private
   */
  Skyway.prototype._createPeerConnection = function(targetMid) {
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
    pc.ondatachannel = function(event) {
      var dc = event.channel || event;
      console.log('API - [' + targetMid + '] Received DataChannel -> ' +
        dc.label);
      self._createDataChannel(targetMid, function(dc) {
        self._dataChannels[targetMid] = dc;
        self._dataChannelPeers[dc.label] = targetMid;
        self._checkDataChannelStatus(dc);
      }, dc);
    };
    pc.onaddstream = function(event) {
      self._onRemoteStreamAdded(targetMid, event);
    };
    pc.onicecandidate = function(event) {
      console.dir(event);
      self._onIceCandidate(targetMid, event);
    };
    pc.oniceconnectionstatechange = function() {
      checkIceConnectionState(targetMid, pc.iceConnectionState, function(iceConnectionState) {
        console.log('API - [' + targetMid + '] ICE connection state changed -> ' +
          iceConnectionState);
        self._trigger('iceConnectionState', iceConnectionState, targetMid);
      });
    };
    // pc.onremovestream = function () {
    //   self._onRemoteStreamRemoved(targetMid);
    // };
    pc.onsignalingstatechange = function() {
      console.log('API - [' + targetMid + '] PC connection state changed -> ' +
        pc.signalingState);
      var signalingState = pc.signalingState;
      if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE &&
        pc.signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
        pc.hasSetOffer = true;
      } else if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE &&
        pc.hasSetOffer) {
        signalingState = self.PEER_CONNECTION_STATE.ESTABLISHED;
      }
      self._trigger('peerConnectionState', signalingState, targetMid);
    };
    pc.onicegatheringstatechange = function() {
      console.log('API - [' + targetMid + '] ICE gathering state changed -> ' +
        pc.iceGatheringState);
      self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
    };
    return pc;
  };

  /**
   * A candidate has just been generated (ICE gathering) and will be sent to the peer.
   * Part of connection establishment.
   * @method _onIceCandidate
   * @param {String} targetMid
   * @param {Event}  event This is provided directly by the peerconnection API.
   * @private
   */
  Skyway.prototype._onIceCandidate = function(targetMid, event) {
    if (event.candidate) {
      var msgCan = event.candidate.candidate.split(' ');
      var candidateType = msgCan[7];
      console.log('API - [' + targetMid + '] Created and sending ' +
        candidateType + ' candidate.');
      this._sendMessage({
        type: this.SIG_TYPE.CANDIDATE,
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
        mid: this._user.sid,
        target: targetMid,
        rid: this._room.id
      });
    } else {
      console.log('API - [' + targetMid + '] End of gathering.');
      this._trigger('candidateGenerationState', this.CANDIDATE_GENERATION_STATE.DONE, targetMid);
      // Disable Ice trickle option
      if (!this._enableIceTrickle) {
        var sessionDescription = this._peerConnections[targetMid].localDescription;
        console.log('API - [' + targetMid + '] Sending offer.');
        this._sendMessage({
          type: sessionDescription.type,
          sdp: sessionDescription.sdp,
          mid: this._user.sid,
          agent: window.webrtcDetectedBrowser.browser,
          target: targetMid,
          rid: this._room.id
        });
      }
    }
  };

  /**
   * Handling reception of a candidate. handshake done, connection ongoing.
   * @method _candidateHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._candidateHandler = function(msg) {
    var targetMid = msg.mid;
    var pc = this._peerConnections[targetMid];
    if (pc) {
      if (pc.iceConnectionState === this.ICE_CONNECTION_STATE.CONNECTED) {
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
        sdpMLineIndex: index,
        candidate: msg.candidate
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
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._answerHandler = function(msg) {
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.ANSWER, targetMid);
    var answer = new window.RTCSessionDescription(msg);
    console.log('API - [' + targetMid + '] Received answer:');
    console.dir(answer);
    var pc = this._peerConnections[targetMid];
    pc.setRemoteDescription(new RTCSessionDescription(answer), function() {
      pc.remotePeerReady = true;
    }, function(err) {
      console.error(err);
    });
  };

  /**
   * Send a message to the signaling server
   * @method _sendMessage
   * @param {JSON} message
   * @private
   */
  Skyway.prototype._sendMessage = function(message) {
    if (!this._channel_open) {
      return;
    }
    var msgString = JSON.stringify(message);
    console.log('API - [' + (message.target ? message.target : 'server') +
      '] Outgoing message: ' + message.type);
    this._socket.send(msgString);
  };

  /**
   * Initiate a Socket signaling connection.
   * @method _openChannel
   * @private
   */
  Skyway.prototype._openChannel = function() {
    var self = this;
    var _openChannelImpl = function(readyState) {
      if (readyState !== 2) {
        return;
      }
      self.off('readyStateChange', _openChannelImpl);
      console.log('API - Opening channel.');
      var ip_signaling = self._room.signalingServer.protocol + '://' +
        self._room.signalingServer.ip + ':' + self._room.signalingServer.port;

      console.log('API - Signaling server URL: ' + ip_signaling);

      if (self._socketVersion >= 1) {
        self._socket = io.connect(ip_signaling, {
          forceNew: true
        });
      } else {
        self._socket = window.io.connect(ip_signaling, {
          'force new connection': true
        });
      }

      self._socket = window.io.connect(ip_signaling, {
        'force new connection': true
      });
      self._socket.on('connect', function() {
        self._channel_open = true;
        self._trigger('channelOpen');
      });
      self._socket.on('error', function(err) {
        console.log('API - Channel Error: ' + err);
        self._channel_open = false;
        self._trigger('channelError', err);
      });
      self._socket.on('disconnect', function() {
        self._trigger('channelClose');
      });
      self._socket.on('message', function(msg) {
        self._processSigMsg(msg);
      });
    };
    if (this._channel_open) {
      return;
    }
    if (this._readyState === 0) {
      this.on('readyStateChange', _openChannelImpl);
      this._loadInfo(this);
    } else {
      _openChannelImpl(2);
    }
  };

  /**
   * Close the Socket signaling connection.
   * @method _closeChannel
   * @private
   */
  Skyway.prototype._closeChannel = function() {
    if (!this._channel_open) {
      return;
    }
    this._socket.disconnect();
    this._socket = null;
    this._channel_open = false;
    this._readyState = 0; // this forces a reinit
  };

  /**
   * Create a DataChannel. Only SCTPDataChannel support
   * @method _createDataChannel
   * @param {String} peerId The peerId of which the dataChannel is connected to
   * @param {Function} callback The callback which it returns the DataChannel object to
   * @param {DataChannel} dc The DataChannel object passed inside
   * @private
   */
  Skyway.prototype._createDataChannel = function(peerId, callback, dc) {
    var self = this;
    var pc = self._peerConnections[peerId];
    var channel_name = self._user.sid + '_' + peerId;

    if (!dc) {
      if (!webrtcDetectedBrowser.isSCTPDCSupported && !webrtcDetectedBrowser.isPluginSupported) {
        console.warn('API - DataChannel [' + peerId + ']: Does not support SCTP');
      }
      dc = pc.createDataChannel(channel_name);
    } else {
      channel_name = dc.label;
    }
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.NEW, peerId);
    console.log(
      'API - DataChannel [' + peerId + ']: Binary type support is "' + dc.binaryType + '"');
    dc.onerror = function(err) {
      console.error('API - DataChannel [' + peerId + ']: Failed retrieveing DataChannel.');
      console.exception(err);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId);
    };
    dc.onclose = function() {
      console.log('API - DataChannel [' + peerId + ']: DataChannel closed.');
      self._closeDataChannel(peerId, self);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId);
    };
    dc.onopen = function() {
      dc.push = dc.send;
      dc.send = function(data) {
        console.log('API - DataChannel [' + peerId + ']: DataChannel is opened.');
        console.log('API - DataChannel [' + peerId + ']: Length : ' + data.length);
        dc.push(data);
      };
    };
    dc.onmessage = function(event) {
      console.log('API - DataChannel [' + peerId + ']: DataChannel message received');
      self._dataChannelHandler(event.data, peerId, self);
    };
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.LOADED, peerId);
    callback(dc);
  };

  /**
   * Check DataChannel ReadyState. If ready, it sends a 'CONN'
   * @method _checkDataChannelStatus
   * @param {DataChannel} dc
   * @private
   */
  Skyway.prototype._checkDataChannelStatus = function(dc) {
    var self = this;
    setTimeout(function() {
      console.log('API - DataChannel [' + dc.label +
        ']: Connection Status - ' + dc.readyState);
      var peerId = self._dataChannelPeers[dc.label];
      self._trigger('dataChannelState', dc.readyState, peerId);

      if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
        self._sendDataChannel(peerId, ['CONN', dc.label]);
      }
    }, 500);
  };

  /**
   * Sending of String Data over the DataChannels
   * @method _sendDataChannel
   * @param {String} peerId
   * @param {JSON} data
   * @private
   */
  Skyway.prototype._sendDataChannel = function(peerId, data) {
    var dc = this._dataChannels[peerId];
    if (!dc) {
      console.error('API - DataChannel [' + peerId + ']: No available existing DataChannel');
      return;
    } else {
      if (dc.readyState === this.DATA_CHANNEL_STATE.OPEN) {
        console.log('API - DataChannel [' + peerId + ']: Sending Data from DataChannel');
        try {
          var dataString = '';
          for (var i = 0; i < data.length; i++) {
            dataString += data[i];
            dataString += (i !== (data.length - 1)) ? '|' : '';
          }
          dc.send(dataString);
        } catch (err) {
          console.error('API - DataChannel [' + peerId + ']: Failed executing send on DataChannel');
          console.exception(err);
        }
      } else {
        console.error('API - DataChannel [' + peerId +
          ']: DataChannel is "' + dc.readyState + '"');
      }
    }
  };

  /**
   * To obtain the Peer that it's connected to from the DataChannel
   * @method _dataChannelPeer
   * @param {String} channel
   * @param {Skyway} self
   * @private
   * @deprecated
   */
  Skyway.prototype._dataChannelPeer = function(channel, self) {
    return self._dataChannelPeers[channel];
  };

  /**
   * To obtain the Peer that it's connected to from the DataChannel
   * @method _closeDataChannel
   * @param {String} peerId
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._closeDataChannel = function(peerId, self) {
    var dc = self._dataChannels[peerId];
    if (dc) {
      if (dc.readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
        dc.close();
      }
      delete self._dataChannels[peerId];
      delete self._dataChannelPeers[dc.label];
    }
  };

  /**
   * The Handler for all DataChannel Protocol events
   * @method _dataChannelHandler
   * @param {String} data
   * @private
   */
  Skyway.prototype._dataChannelHandler = function(dataString, peerId, self) {
    // PROTOCOL ESTABLISHMENT
    console.dir(dataString);
    if (typeof dataString === 'string') {
      if (dataString.indexOf('|') > -1 && dataString.indexOf('|') < 6) {
        var data = dataString.split('|');
        var state = data[0];
        console.log('API - DataChannel [' + peerId + ']: Received "' + state + '"');

        switch (state) {
        case 'CONN':
          // CONN - DataChannel Connection has been established
          self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.OPEN, peerId);
          break;
        case 'WRQ':
          // WRQ - Send File Request Received. For receiver to accept or not
          self._dataChannelWRQHandler(peerId, data, self);
          break;
        case 'ACK':
          // ACK - If accepted, send. Else abort
          self._dataChannelACKHandler(peerId, data, self);
          break;
        case 'ERROR':
          // ERROR - Failure in receiving data. Could be timeout
          console.log('API - Received ERROR');
          self._dataChannelERRORHandler(peerId, data, self);
          break;
        case 'CHAT':
          // CHAT - DataChannel Chat
          console.log('API - Received CHAT');
          self._dataChannelCHATHandler(peerId, data, self);
          break;
        default:
          console.log('API - DataChannel [' + peerId + ']: Invalid command');
        }
      } else {
        // DATA - BinaryString base64 received
        console.log('API - DataChannel [' + peerId + ']: Received "DATA"');
        self._dataChannelDATAHandler(peerId, dataString,
          self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING, self);
      }
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: WRQ
   * The sender has sent a request to send file
   * From here, it's up to the user to accept or reject it
   * @method _dataChannelWRQHandler
   * @param {String} peerId
   * @param {Array} data
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelWRQHandler = function(peerId, data, self) {
    var itemId = this._user.sid + this.DATA_TRANSFER_TYPE.DOWNLOAD +
      (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
    var name = data[2];
    var binarySize = parseInt(data[3], 10);
    var expectedSize = parseInt(data[4], 10);
    var timeout = parseInt(data[5], 10);
    var sendDataTransfer = this._debug || confirm('Do you want to receive "' + name + '" ?');

    if (sendDataTransfer) {
      self._downloadDataTransfers[peerId] = [];
      self._downloadDataSessions[peerId] = {
        itemId: itemId,
        name: name,
        size: binarySize,
        ackN: 0,
        receivedSize: 0,
        chunkSize: expectedSize,
        timeout: timeout
      };
      self._sendDataChannel(peerId, ['ACK', 0, window.webrtcDetectedBrowser.browser]);
      var transferInfo = {
        name: name,
        size: binarySize,
        senderId: peerId
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.DOWNLOAD_STARTED, itemId, peerId, transferInfo);
    } else {
      self._sendDataChannel(peerId, ['ACK', -1]);
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: ACK
   * The user sends a ACK of the request [accept/reject/nhe current
   * index of chunk to be sent over]
   * @method _dataChannelACKHandler
   * @param {String} peerId
   * @param {Array} data
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelACKHandler = function(peerId, data, self) {
    self._clearDataChannelTimeout(peerId, true, self);

    var ackN = parseInt(data[1], 10);
    var chunksLength = self._uploadDataTransfers[peerId].length;
    var uploadedDetails = self._uploadDataSessions[peerId];
    var itemId = uploadedDetails.itemId;
    var timeout = uploadedDetails.timeout;
    var transferInfo = {};

    console.log('API - DataChannel Received "ACK": ' + ackN + ' / ' + chunksLength);

    if (ackN > -1) {
      // Still uploading
      if (ackN < chunksLength) {
        var fileReader = new FileReader();
        fileReader.onload = function() {
          // Load Blob as dataurl base64 string
          var base64BinaryString = fileReader.result.split(',')[1];
          self._sendDataChannel(peerId, [base64BinaryString]);
          self._setDataChannelTimeout(peerId, timeout, true, self);
          transferInfo = {
            percentage: (((ackN + 1) / chunksLength) * 100).toFixed()
          };
          self._trigger('dataTransferState',
            self.DATA_TRANSFER_STATE.UPLOADING, itemId, peerId, transferInfo);
        };
        fileReader.readAsDataURL(self._uploadDataTransfers[peerId][ackN]);
      } else if (ackN === chunksLength) {
        transferInfo = {
          name: uploadedDetails.name
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, itemId, peerId, transferInfo);
        delete self._uploadDataTransfers[peerId];
        delete self._uploadDataSessions[peerId];
      }
    } else {
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.REJECTED, itemId, peerId);
      delete self._uploadDataTransfers[peerId];
      delete self._uploadDataSessions[peerId];
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: CHAT
   * The user receives a DataChannel CHAT message
   * @method _dataChannelCHATHandler
   * @param {String} peerId
   * @param {Array} data
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelCHATHandler = function(peerId, data) {
    var msgChatType = this._stripNonAlphanumeric(data[1]);
    var msgNick = this._stripNonAlphanumeric(data[2]);
    // Get remaining parts as the message contents.
    // Get the index of the first char of chat content
    //var start = 3 + data.slice(0, 3).join('').length;
    var msgChat = '';
    // Add all char from start to the end of dataStr.
    // This method is to allow '|' to appear in the chat message.
    for (var i = 3; i < data.length; i++) {
      msgChat += data[i];
    }
    console.log('API - Got DataChannel Chat Message: ' + msgChat + '.');
    console.log('API - Got a ' + msgChatType + ' chat msg from ' +
      peerId + ' (' + msgNick + ').');

    var chatDisplay = '[DC]: ' + msgChat;
    console.log('CHAT: ' + chatDisplay);
    // Create a msg using event.data, message mid.
    var msg = {
      type: this.SIG_TYPE.CHAT,
      mid: peerId,
      sender: peerId,
      data: chatDisplay
    };
    // For private msg, create a target field with our id.
    if (msgChatType === 'PRIVATE') {
      msg.target = this._user.sid;
    }
    this._processSingleMsg(msg);
  };

  /**
   * DataChannel TFTP Protocol Stage: ERROR
   * The user received an error, usually an exceeded timeout.
   * @method _dataChannelERRORHandler
   * @param {String} peerId
   * @param {Array} data
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelERRORHandler = function(peerId, data, self) {
    var isUploader = data[2];
    var itemId = (isUploader) ? self._uploadDataSessions[peerId].itemId :
      self._downloadDataSessions[peerId].itemId;
    var transferInfo = {
      message: data[1],
      type: ((isUploader) ? self.DATA_TRANSFER_TYPE.UPLOAD :
        self.DATA_TRANSFER_TYPE.DOWNLOAD)
    };
    self._clearDataChannelTimeout(peerId, isUploader, self);
    self._trigger('dataTransferState',
      self.DATA_TRANSFER_STATE.ERROR, itemId, peerId, transferInfo);
  };

  /**
   * DataChannel TFTP Protocol Stage: DATA
   * This is when the data is sent from the sender to the receiving user
   * @method _dataChannelDATAHandler
   * @param {String} peerId
   * @param {} dataString
   * @param {String} dataType [Rel: Skyway.DATA_TRANSFER_DATA_TYPE]
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelDATAHandler = function(peerId, dataString, dataType, self) {
    var chunk, transferInfo = {};
    self._clearDataChannelTimeout(peerId, false, self);
    var transferStatus = self._downloadDataSessions[peerId];
    var itemId = transferStatus.itemId;

    if (dataType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
      chunk = self._base64ToBlob(dataString);
    } else if (dataType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
      chunk = new Blob(dataString);
    } else if (dataType === self.DATA_TRANSFER_DATA_TYPE.BLOB) {
      chunk = dataString;
    } else {
      transferInfo = {
        message: 'Unhandled data exception: ' + dataType,
        type: self.DATA_TRANSFER_TYPE.DOWNLOAD
      };
      console.error('API - ' + transferInfo.message);
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.ERROR, itemId, peerId, transferInfo);
      return;
    }
    var receivedSize = (chunk.size * (4 / 3));
    console.log('API - DataChannel [' + peerId + ']: Chunk size: ' + chunk.size);

    if (transferStatus.chunkSize >= receivedSize) {
      self._downloadDataTransfers[peerId].push(chunk);
      transferStatus.ackN += 1;
      transferStatus.receivedSize += receivedSize;
      var totalReceivedSize = transferStatus.receivedSize;
      var percentage = ((totalReceivedSize / transferStatus.size) * 100).toFixed();

      self._sendDataChannel(peerId, ['ACK',
        transferStatus.ackN, self._user.sid
      ]);

      if (transferStatus.chunkSize === receivedSize) {
        transferInfo = {
          percentage: percentage
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.DOWNLOADING, itemId, peerId, transferInfo);
        self._setDataChannelTimeout(peerId, transferStatus.timeout, false, self);
        self._downloadDataTransfers[peerId].info = transferStatus;
      } else {
        var blob = new Blob(self._downloadDataTransfers[peerId]);
        transferInfo = {
          data: URL.createObjectURL(blob)
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED, itemId, peerId, transferInfo);
        delete self._downloadDataTransfers[peerId];
        delete self._downloadDataSessions[peerId];
      }
    } else {
      transferInfo = {
        message: 'Packet not match - [Received]' +
          receivedSize + ' / [Expected]' + transferStatus.chunkSize,
        type: self.DATA_TRANSFER_TYPE.DOWNLOAD
      };
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.ERROR, itemId, peerId, transferInfo);
      console.error('API - DataChannel [' + peerId + ']: ' + transferInfo.message);
    }
  };

  /**
   * Set the DataChannel timeout. If exceeded, send the 'ERROR' message
   * @method _setDataChannelTimeout
   * @param {String} peerId
   * @param {Integer} timeout
   * @param {Boolean} isSender
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._setDataChannelTimeout = function(peerId, timeout, isSender, self) {
    if (!self._dataTransfersTimeout[peerId]) {
      self._dataTransfersTimeout[peerId] = {};
    }
    var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
      self.DATA_TRANSFER_TYPE.DOWNLOAD;
    self._dataTransfersTimeout[peerId][type] = setTimeout(function() {
      if (self._dataTransfersTimeout[peerId][type]) {
        if (isSender) {
          delete self._uploadDataTransfers[peerId];
          delete self._uploadDataSessions[peerId];
        } else {
          delete self._downloadDataTransfers[peerId];
          delete self._downloadDataSessions[peerId];
        }
        self._sendDataChannel(peerId, ['ERROR',
          'Connection Timeout. Longer than ' + timeout + ' seconds. Connection is abolished.',
          isSender
        ]);
        self._clearDataChannelTimeout(peerId, isSender, self);
      }
    }, 1000 * timeout);
  };

  /**
   * Clear the DataChannel timeout as a response is received
   * @method _clearDataChannelTimeout
   * @param {String} peerId
   * @param {Boolean} isSender
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._clearDataChannelTimeout = function(peerId, isSender, self) {
    if (self._dataTransfersTimeout[peerId]) {
      var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
        self.DATA_TRANSFER_TYPE.DOWNLOAD;
      clearTimeout(self._dataTransfersTimeout[peerId][type]);
      delete self._dataTransfersTimeout[peerId][type];
    }
  };

  /**
   * Convert base64 to raw binary data held in a string.
   * Doesn't handle URLEncoded DataURIs
   * - see StackOverflow answer #6850276 for code that does this
   * This is to convert the base64 binary string to a blob
   * @author Code from devnull69 @ stackoverflow.com
   * @method _base64ToBlob
   * @param {String} dataURL
   * @private
   * @beta
   */
  Skyway.prototype._base64ToBlob = function(dataURL) {
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
   * For now please send files below or around 2KB till chunking is implemented
   * @method _chunkFile
   * @param {Blob} blob
   * @param {Integer} blobByteSize
   * @private
   */
  Skyway.prototype._chunkFile = function(blob, blobByteSize) {
    var chunksArray = [],
      startCount = 0,
      endCount = 0;
    if (blobByteSize > this._chunkFileSize) {
      // File Size greater than Chunk size
      while ((blobByteSize - 1) > endCount) {
        endCount = startCount + this._chunkFileSize;
        chunksArray.push(blob.slice(startCount, endCount));
        startCount += this._chunkFileSize;
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
   * Removes non-alphanumeric characters from a string and return it.
   * @method _stripNonAlphanumeric
   * @param {String} str String to check.
   * @return {String} strOut Updated string from non-alphanumeric characters
   * @private
   */
  Skyway.prototype._stripNonAlphanumeric = function(str) {
    var strOut = '';
    for (var i = 0; i < str.length; i++) {
      var curChar = str[i];
      console.log(i + ':' + curChar + '.');
      if (!this._alphanumeric(curChar)) {
        // If not alphanumeric, do not add to final string.
        console.log('API - Not alphanumeric, not adding.');
      } else {
        // If alphanumeric, add it to final string.
        console.log('API - Alphanumeric, so adding.');
        strOut += curChar;
      }
      console.log('API - strOut: ' + strOut + '.');
    }
    return strOut;
  };

  /**
   * Check if a text string consist of only alphanumeric characters.
   * If so, return true.
   * If not, return false.
   * @method _alphanumeric
   * @param {String} str String to check.
   * @return {Boolean} isAlphaNumeric
   * @private
   */
  Skyway.prototype._alphanumeric = function(str) {
    var letterNumber = /^[0-9a-zA-Z]+$/;
    if (str.match(letterNumber)) {
      return true;
    }
    return false;
  };

  /**
   * Method to send Blob data to peers.
   * @method sendBlobData
   * @param {Blob} data - The Blob data to be sent over
   * @param {JSON} dataInfo - The Blob data information
   * @param {String} dataInfo.name The Blob data name
   * @param {Integer} dataInfo.timeout The timeout to wait for packets
   * @param {Integer} dataInfo.size The Blob data size. Default is 60.
   * @param {String} targetpeerId The specific peerId to send to.
   *   Leave blank to send to all peers.
   * @bubbles dataTransferState
   * @example
   *   SkywayDemo.sendBlobData(file, {
   *     'name' : file.name,
   *     'size' : file.size,
   *     'timeout' : 67
   *   });
   * @example
   *   SkywayDemo.sendBlobData(blob, {
   *     'name' : 'My Html',
   *     'size' : blob.size,
   *     'timeout' : 87
   *   }, '-_xe289_3-232439');
   */
  Skyway.prototype.sendBlobData = function(data, dataInfo, targetpeerId) {
    if (!data && !dataInfo) {
      return false;
    }
    var noOfPeersSent = 0;
    dataInfo.timeout = dataInfo.timeout || 60;
    dataInfo.itemId = this._user.sid + this.DATA_TRANSFER_TYPE.UPLOAD +
      (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
    var transferInfo = {};

    if (targetpeerId) {
      if (this._dataChannels.hasOwnProperty(targetpeerId)) {
        this._sendBlobDataToPeer(data, dataInfo, targetpeerId);
        noOfPeersSent = 1;
      } else {
        console.log('API - DataChannel [' + targetpeerId + '] does not exists');
      }
    } else {
      targetpeerId = this._user.sid;
      for (var peerId in this._dataChannels) {
        if (this._dataChannels.hasOwnProperty(peerId)) {
          // Binary String filesize [Formula n = 4/3]
          this._sendBlobDataToPeer(data, dataInfo, peerId);
          noOfPeersSent++;
        } else {
          console.log('API - DataChannel [' + peerId + '] does not exists');
        }
      }
    }
    if (noOfPeersSent > 0) {
      transferInfo = {
        itemId: dataInfo.itemId,
        senderId: this._user.sid,
        name: dataInfo.name,
        size: dataInfo.size,
        data: URL.createObjectURL(data)
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.UPLOAD_STARTED, dataInfo.itemId, targetpeerId, transferInfo);
    } else {
      transferInfo = {
        message: 'No available DataChannels to send Blob data',
        type: this.DATA_TRANSFER_TYPE.UPLOAD
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.ERROR, itemId, targetpeerId, transferInfo);
      console.log('API - ' + transferInfo.message);
      this._uploadDataTransfers = {};
      this._uploadDataSessions = {};
    }
  };

  /**
   * Method to send Blob data to individual peer.
   * This sends the 'WRQ' and initiate the TFTP protocol.
   * @method _sendBlobDataToPeer
   * @param {Blob} data - The Blob data to be sent over
   * @param {JSON} dataInfo - The Blob data information
   * @param {String} dataInfo.itemId The item Id
   * @param {String} dataInfo.name The Blob data name
   * @param {Integer} dataInfo.timeout The timeout to wait for packets.
   *   Default is 60.
   * @param {Integer} dataInfo.size The Blob data size
   * @param {String} peerId
   * @private
   */
  Skyway.prototype._sendBlobDataToPeer = function(data, dataInfo, peerId) {
    var binarySize = (dataInfo.size * (4 / 3)).toFixed();
    var chunkSize = (this._chunkFileSize * (4 / 3)).toFixed();
    if (window.webrtcDetectedBrowser.browser === 'Firefox' &&
      window.webrtcDetectedBrowser.version < 30) {
      chunkSize = this._mozChunkFileSize;
    }
    this._uploadDataTransfers[peerId] = this._chunkFile(data, dataInfo.size);
    this._uploadDataSessions[peerId] = {
      name: dataInfo.name,
      size: binarySize,
      itemId: dataInfo.itemId,
      timeout: dataInfo.timeout
    };
    this._sendDataChannel(peerId, ['WRQ',
      window.webrtcDetectedBrowser.browser,
      dataInfo.name, binarySize, chunkSize, dataInfo.timeout
    ]);
    this._setDataChannelTimeout(peerId, dataInfo.timeout, true, this);
  };

  /**
   * Handle the Lock actions
   * @method _handleLock
   * @param {String} lockAction [Rel: SkywayDemo.LOCK_ACTION]
   * @private
   */
  Skyway.prototype._handleLock = function(lockAction) {
    var self = this;
    var url = self._serverPath + '/rest/room/lock';
    var params = {
      api: self._appKey,
      rid: self._selectedRoom || self._defaultRoom,
      start: self._room.start,
      len: self._room.len,
      cred: self._room.token,
      action: lockAction,
      end: (new Date((new Date(self._room.start))
        .getTime() + (self._room.len * 60 * 60 * 1000))).toISOString()
    };
    self._requestServerInfo('POST', url, function(status, response) {
      if (status !== 200) {
        self._trigger('roomLock', false, null, 'Request failed!');
        return;
      }
      console.info(response);
      if (response.status) {
        self._trigger('roomLock', true, response.content.lock);
        if (lockAction !== self.LOCK_ACTION.STATUS) {
          self._sendMessage({
            type: self.SIG_TYPE.ROOM_LOCK,
            mid: self._user.sid,
            rid: self._room.id,
            lock: response.content.lock
          });
        }
      } else {
        self._trigger('roomLock', false, null, response.message);
      }
    }, params);
  };

  /**
   * Restart the joinRoom process to initiate Audio and Video
   * @method _handleAV
   * @param {String} mediaType
   * @param {Boolean} isEnabled
   * @param {Boolean} hasMedia
   * @private
   */
  Skyway.prototype._handleAV = function(mediaType, isEnabled, hasMedia) {
    if (mediaType !== 'audio' && mediaType !== 'video') {
      return;
    }
    this._sendMessage({
      type: ((mediaType === 'audio') ? this.SIG_TYPE.MUTE_AUDIO :
        this.SIG_TYPE.MUTE_VIDEO),
      mid: this._user.sid,
      rid: this._room.id,
      enabled: isEnabled
    });
    if (hasMedia === false) {
      t.leaveRoom();
      t.joinRoom({
        audio: (mediaType === 'audio') ? true : this._streamSettings.audio,
        video: (mediaType === 'video') ? true : this._streamSettings.video
      });
    }
    this._trigger((mediaType === 'audio') ? 'peerAudioMute' : 'peerVideoMute',
      this._user.sid, !isEnabled, true);
  };

  /**
   * Lock the Room to prevent users from coming in
   * @method lockRoom
   * @bubbles lockRoom
   * @example
   *   SkywayDemo.lockRoom();
   * @beta
   */
  Skyway.prototype.lockRoom = function() {
    this._handleLock(this.LOCK_ACTION.LOCK);
  };

  /**
   * Unlock the Room to allow users to come in
   * @method unlockRoom
   * @bubbles lockRoom
   * @example
   *   SkywayDemo.unlockRoom();
   * @beta
   */
  Skyway.prototype.unlockRoom = function() {
    this._handleLock(this.LOCK_ACTION.UNLOCK);
  };

  /**
   * Enable Microphone. If Microphone is not enabled from the
   * beginning, user would have to reinitate the joinRoom
   * process and ask for Microphone again.
   * @method enableAudio
   * @bubbles peerAudioMute
   * @example
   *   SkywayDemo.enableAudio();
   */
  Skyway.prototype.enableAudio = function() {
    var hasAudioTracks = false;
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        var tracks = this._user.streams[stream].getAudioTracks();
        for (var track in tracks) {
          if (tracks.hasOwnProperty(track)) {
            tracks[track].enabled = true;
            hasAudioTracks = true;
          }
        }
      }
    }
    this._handleAV('audio', true, hasAudioTracks);
  };

  /**
   * Disable Microphone. If Microphone is not enabled from the
   * beginning, there is no effect.
   * @method disableAudio
   * @bubbles peerAudioMute
   * @example
   *   SkywayDemo.disableAudio();
   */
  Skyway.prototype.disableAudio = function() {
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        var tracks = this._user.streams[stream].getAudioTracks();
        for (var track in tracks) {
          if (tracks.hasOwnProperty(track)) {
            tracks[track].enabled = false;
          }
        }
      }
    }
    this._handleAV('audio', false);
  };

  /**
   * Enable Webcam Video. If Webcam Video is not enabled from the
   * beginning, user would have to reinitate the joinRoom
   * process and ask for Webcam video again.
   * @method enableVideo
   * @bubbles peerVideoMute
   * @example
   *   SkywayDemo.enableVideo();
   */
  Skyway.prototype.enableVideo = function() {
    var hasVideoTracks = false;
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        var tracks = this._user.streams[stream].getVideoTracks();
        for (var track in tracks) {
          if (tracks.hasOwnProperty(track)) {
            tracks[track].enabled = true;
            hasVideoTracks = true;
          }
        }
      }
    }
    this._handleAV('video', true, hasVideoTracks);
  };

  /**
   * Disable Webcam Video. If Webcam Video is not enabled from the
   * beginning, there is no effect.
   * @method disableVideo
   * @bubbles peerVideoMute
   * @example
   *   SkywayDemo.disableVideo();
   */
  Skyway.prototype.disableVideo = function() {
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        var tracks = this._user.streams[stream].getVideoTracks();
        for (var track in tracks) {
          if (tracks.hasOwnProperty(track)) {
            tracks[track].enabled = false;
          }
        }
      }
    }
    this._handleAV('video', false);
  };

  /**
   * Parse Stream settings
   * @method _parseStreamSettings
   * @param {JSON} options
   * @private
   */
  Skyway.prototype._parseStreamSettings = function(options) {
    options = options || {};
    this._streamSettings.bandwidth = options.bandwidth ||
      this._streamSettings.bandwidth || {};
    // Check typeof options.video
    if (typeof options.video === 'object') {
      if (typeof options.video.res === 'object') {
        var width = options.video.res.width;
        var height = options.video.res.height;
        var frameRate = (typeof options.video.frameRate === 'number') ?
          options.video.frameRate : 50;
        if (!width || !height) {
          this._streamSettings.video = true;
        } else {
          this._streamSettings.video = {
            mandatory: {
              minWidth: width,
              minHeight: height
            },
            optional: [{
              minFrameRate: frameRate
            }]
          };
        }
      }
    } else {
      if (options.hasOwnProperty('video')) {
        options.video = (typeof options.video === 'boolean') ?
          options.video : true;
      }
    }
    // Check typeof options.audio
    if (typeof options.audio === 'object') {
      this._streamSettings.audio = true;
      this._streamSettings.stereo = (typeof options.audio.stereo === 'boolean') ?
        options.audio.stereo : false;
    } else {
      if (options.hasOwnProperty('audio')) {
        options.audio = (typeof options.audio === 'boolean') ?
          options.audio : true;
      }
    }
  };

  /**
   * User to join the room.
   * You may call getDefaultStream first if you want to get
   * MediaStream and joining Room seperately.
   * @method joinRoom
   * @param {String} room Room to join
   * @param {JSON} mediaOptions Optional. Media Constraints.
   * @param {} mediaOptions.audio This call requires audio
   * @param {Boolean} mediaOptions.audio.stereo Enabled stereo or not
   * @param {} mediaOptions.video This call requires video
   * @param {String} mediaOptions.video.res [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} mediaOptions.video.res.width Video width
   * @param {Integer} mediaOptions.video.res.height Video height
   * @param {Integer} mediaOptions.video.frameRate Mininum frameRate of Video
   * @param {String} mediaOptions.bandwidth Bandwidth settings
   * @param {String} mediaOptions.bandwidth.audio Audio Bandwidth
   * @param {String} mediaOptions.bandwidth.video Video Bandwidth
   * @param {String} mediaOptions.bandwidth.data Data Bandwidth
   * @bubbles joinedRoom
   * @example
   *   SkywayDemo.joinRoom();
   * @example
   *   SkywayDemo.joinRoom('room');
   * @example
   *   SkywayDemo.joinRoom('room', {
   *     'audio' : true,
   *     'video' : false
   *   });
   * @example
   *   SkywayDemo.joinRoom('room', {
   *     'audio' : true,
   *     'video' : {
   *       'res' : {
   *         'width' : 640,
   *         'height' : 320
   *       }
   *     }
   *   });
   * @example
   *   SkwayDemo.joinRoom({
   *     'audio' : {
   *        'stereo' : true
   *      },
   *     'video' : {
   *        'res' : SkywayDemo.VIDEO_RESOLUTION.VGA,
   *        'frameRate' : 50
   *     },
   *     'bandwidth' : {
   *        'audio' : 48,
   *        'video' : 256,
   *        'data' : 14480
   *      }
   *   });
   */
  Skyway.prototype.joinRoom = function(room, mediaOptions) {
    if (this._in_room) {
      return;
    }
    var self = this;
    var doJoinRoom = function () {
      self._waitForMediaStream(function() {
        var _sendJoinRoomMsg = function() {
          self.off('channelOpen', _sendJoinRoomMsg);
          console.log('API - Joining room: ' + self._room.id);
          self._sendMessage({
            type: self.SIG_TYPE.JOIN_ROOM,
            uid: self._user.id,
            cid: self._key,
            rid: self._room.id,
            userCred: self._user.token,
            timeStamp: self._user.timeStamp,
            apiOwner: self._user.apiOwner,
            roomCred: self._room.token,
            start: self._room.start,
            len: self._room.len
          });
          // self._user.peer = self._createPeerConnection(self._user.sid);
        };
        if (!self._channel_open) {
          self.on('channelOpen', _sendJoinRoomMsg);
          self._openChannel();
        } else {
          _sendJoinRoomMsg();
        }
      }, mediaOptions);
    };
    if (typeof room === 'string') {
      self._reinit(doJoinRoom, {
        room: room
      });
    } else {
      mediaOptions = room;
      doJoinRoom();
    }
  };

  /**
   * User to leave the room
   * @method leaveRoom
   * @bubbles channelClose
   * @example
   *   SkywayDemo.leaveRoom();
   */
  Skyway.prototype.leaveRoom = function() {
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
}).call(this);
