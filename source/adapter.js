var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = {};
var RTCDataChannels = [];
var RTCDataChannel;
var newRTCDataChannel = null;
// Check browser version
var getBrowserVersion = function() {
  var _browser = {};
  // Latest Opera supports webkit Webrtc
  if(navigator.mozGetUserMedia) { _browser.mozWebRTC = true; }
  else if(navigator.webkitGetUserMedia) { _browser.webkitWebRTC = true; }
  else {
    // Note: IE is detected as Safari...
    // If Else, means not supported
    if(navigator.userAgent.indexOf("Safari")) {
      if(typeof InstallTrigger !== 'undefined') {
        // Firefox 1.0+
        _browser.browser = "Firefox";
      }
      else if(/*@cc_on!@*/false || !!document.documentMode) { 
        // IE 6+
        _browser.browser = "IE";
      }
      else if(Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
        // At least Safari 3+: "[object HTMLElementConstructor]"
        _browser.browser = "Safari";
      }
      else if(!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
        // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
        _browser.browser = "Opera";
      }
      else if(!!window.chrome) {
        // Chrome 1+
        _browser.browser = "Chrome";
      }
      _browser.pluginWebRTC = true;
    }
  }
  // Get version of Browser. Code provided by kennebec@stackoverflow.com
  var ua = navigator.userAgent, tem, 
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if(/trident/i.test(M[1])){
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    _browser.browser = "IE";
    _browser.version = parseInt(tem[1]||'0');
  }
  if(M[1]=== 'Chrome'){
    tem = ua.match(/\bOPR\/(\d+)/);
    if(tem!= null) {
      _browser.browser = "Opera";
      _browser.version = parseInt(tem[1]);
    }
  }
  if(!_browser.browser) _browser.browser = M[1];
  if(!_browser.version) {
    try {
      M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
      if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
      _browser.version = parseInt(M[1]);
    }
    catch(err) {
      _browser.version = 0;
    }
  }
  _browser.os = navigator.platform;
  // Codes provided by DetectRTC by Muaz Khan
  _browser.isSCTPDCSupported = _browser.mozWebRTC || (_browser.browser === "Chrome" && _browser.version >= 25);
  _browser.isRTPDCSupported = _browser.browser === "Chrome" && _browser.version >= 31;
  if(!_browser.isSCTPDCSupported && !_browser.isRTPDCSupported) {
    _browser.isPluginSupported = true; // Plugin magic here
  }
  return _browser;
};
webrtcDetectedBrowser = getBrowserVersion();
var _temPluginInfo = { pluginId : 'plugin0', type : 'application/x-temwebrtcplugin', onload : 'TemInitPlugin0' };
// Unique identifier of each opened page
var TemPageId = Math.random().toString(36).slice(2);
// !!! DO NOT OVERRIDE THIS FUNCTION !!!
// This function will be called when plugin is ready
// it sends necessary details to the plugin. 
// If you need to do something once the page/plugin is ready, override
// TemPrivateWebRTCReadyCb instead.
// This function is not in the IE/Safari condition brackets so that
// TemPluginLoaded function might be called on Chrome/Firefox
var TemInitPlugin0 = function () {
  console.log("Plugin: Loaded");
  plugin().setPluginId(TemPageId, _temPluginInfo.pluginId);
  plugin().setLogFunction(console);
  TemPrivateWebRTCReadyCb();
};
var TemPrivateWebRTCReadyCb = function() {
  // webRTC readu Cb, should only be called once. 
  // Need to prevent Chrome + plugin form calling WebRTCReadyCb twice
  arguments.callee.StaticWasInit = arguments.callee.StaticWasInit || 1;
  if (arguments.callee.StaticWasInit == 1)
    if (typeof WebRTCReadyCb === 'function')
      WebRTCReadyCb();
  arguments.callee.StaticWasInit++;
  // WebRTCReadyCb is callback function called when the browser is webrtc ready
  // this can be because of the browser or because of the plugin
  // Override WebRTCReadyCb and use it to do whatever you need to do when the
  // page is ready
};
var maybeFixConfiguration = function (pcConfig) {
  if (pcConfig === null) { return; }
  for (var i = 0; i < pcConfig.iceServers.length; i++) {
    if (pcConfig.iceServers[i].hasOwnProperty('urls')){
      pcConfig.iceServers[i]['url'] = pcConfig.iceServers[i]['urls'];
      delete pcConfig.iceServers[i]['urls'];
    }
  }
};
// use this function whenever you want to call the plugin
var plugin = function() { 
  var plgin = document.getElementById(_temPluginInfo.pluginId);
  if(!plgin) {
    plgin = document.createElement('object');
    plgin.id = _temPluginInfo.pluginId;
    plgin.style.visibility = 'hidden';
    plgin.type = _temPluginInfo.type;
    var prm1 = document.createElement('param');
    prm1.name = 'onload';
    prm1.value = _temPluginInfo.onload;
    var prm2 = document.createElement('param');
    prm2.name = 'pluginId';
    prm2.value = _temPluginInfo.pluginId;
    plgin.appendChild(prm1);
    plgin.appendChild(prm2);
    document.getElementsByTagName('body')[0].appendChild(plgin);
    plgin.onreadystatechange = function(state){
      console.log("Plugin: Ready State : " + state);
      if(state==4) return plgin;
    };
  }
  else return plgin; 
};
if (webrtcDetectedBrowser.mozWebRTC) {
  // The RTCPeerConnection object.
  var RTCPeerConnection = function(pcConfig, pcConstraints) {
    // .urls is not supported in FF yet.
    maybeFixConfiguration(pcConfig);
    return new mozRTCPeerConnection(pcConfig, pcConstraints);
  }
  // The RTCSessionDescription object.
  RTCSessionDescription = mozRTCSessionDescription;
  // The RTCIceCandidate object.
  RTCIceCandidate = mozRTCIceCandidate;

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);
  navigator.getUserMedia = getUserMedia;

  // Creates iceServer from the url for FF.
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      if (webrtcDetectedBrowser.version < 27) {
        // Create iceServer with turn url.
        // Ignore the transport parameter from TURN url for FF version <=27.
        var turn_url_parts = url.split("?");
        // Return null for createIceServer if transport=tcp.
        if (turn_url_parts.length === 1 ||
          turn_url_parts[1].indexOf('transport=udp') === 0) {
          iceServer = {'url': turn_url_parts[0],
        'credential': password,
        'username': username};
      }
    } else {
        // FF 27 and above supports transport parameters in TURN url,
        // So passing in the full url to create iceServer.
        iceServer = {'url': url,
        'credential': password,
        'username': username};
      }
    }
    return iceServer;
  };

  createIceServers = function(urls, username, password) {
    var iceServers = [];
    // Use .url for FireFox.
    for (i = 0; i < urls.length; i++) {
      var iceServer = createIceServer(urls[i],
        username,
        password);
      if (iceServer !== null) {
        iceServers.push(iceServer);
      }
    }
    return iceServers;
  }

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {
    console.log("Attaching media stream");
    element.mozSrcObject = stream;
    element.play();

    return element;
  };

  reattachMediaStream = function(to, from) {
    console.log("Reattaching media stream");
    to.mozSrcObject = from.mozSrcObject;
    to.play();

    return to;
  };

  // Fake get{Video,Audio}Tracks
  if (!MediaStream.prototype.getVideoTracks) {
    MediaStream.prototype.getVideoTracks = function() {
      return [];
    };
  }

  if (!MediaStream.prototype.getAudioTracks) {
    MediaStream.prototype.getAudioTracks = function() {
      return [];
    };
  }
  TemPrivateWebRTCReadyCb();
} else if (webrtcDetectedBrowser.webkitWebRTC) {
  // Creates iceServer from the url for Chrome M33 and earlier.
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      // Chrome M28 & above uses below TURN format.
      iceServer = {'url': url,
      'credential': password,
      'username': username};
    }
    return iceServer;
  };

  // Creates iceServers from the urls for Chrome M34 and above.
  createIceServers = function(urls, username, password) {
    var iceServers = [];
    if (webrtcDetectedBrowser.version >= 34) {
      // .urls is supported since Chrome M34.
      iceServers = {'urls': urls,
      'credential': password,
      'username': username };
    } else {
      for (i = 0; i < urls.length; i++) {
        var iceServer = createIceServer(urls[i],
          username,
          password);
        if (iceServer !== null) {
          iceServers.push(iceServer);
        }
      }
    }
    return iceServers;
  };

  // The RTCPeerConnection object.
  var RTCPeerConnection = function(pcConfig, pcConstraints) {
    // .urls is supported since Chrome M34.
    if (webrtcDetectedBrowser.version < 34) {
      maybeFixConfiguration(pcConfig);
    }
    return new webkitRTCPeerConnection(pcConfig, pcConstraints);
  }

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
  navigator.getUserMedia = getUserMedia;

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {
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

  reattachMediaStream = function(to, from) {
    to.src = from.src;

    return to;
  };
  TemPrivateWebRTCReadyCb();
} else if (webrtcDetectedBrowser.pluginWebRTC) { 
  var isOpera = webrtcDetectedBrowser.browser === "Opera";
  var isFirefox = webrtcDetectedBrowser.browser === "Firefox";
  var isSafari = webrtcDetectedBrowser.browser === "Safari";
  var isChrome = webrtcDetectedBrowser.browser === "Chrome";
  var isIE = webrtcDetectedBrowser.browser === "IE";

  // This function detects whether or not a plugin is installed
  // Com name : the company name,
  // plugName : the plugin name
  // installedCb : callback if the plugin is detected (no argument)
  // notInstalledCb : callback if the plugin is not detected (no argument)
  function isPluginInstalled(comName, plugName, installedCb, notInstalledCb) {
    if (isChrome || isSafari || isFirefox) { // Not IE (firefox, for example)
      var pluginArray = navigator.plugins;
      for (var i = 0; i < pluginArray.length; i++) {
        if (pluginArray[i].name.indexOf(plugName) >= 0) {
          installedCb();
          return;
        }
      }
      notInstalledCb(); 
    } else if (isIE) { // We're running IE
      try {
        new ActiveXObject(comName+"."+plugName);
      } catch(e) {
        notInstalledCb();
        return;
      }
      installedCb();
    } else {
      // Unsupported
      return;
    }
  }

  // defines webrtc's JS interface according to the plugin's implementation
  function defineWebRTCInterface() { 
    // ==== UTIL FUNCTIONS ===
    function isDefined(variable) {
      return variable != null && variable != undefined;
    }
    // END OF UTIL FUNCTIONS

    // === WEBRTC INTERFACE ===
    createIceServer = function(url, username, password) {
      var iceServer = null;
      var url_parts = url.split(':');
      if (url_parts[0].indexOf('stun') === 0) {
          // Create iceServer with stun url.
          iceServer = { 'url': url, 'hasCredentials': false};
        } else if (url_parts[0].indexOf('turn') === 0) {
          iceServer = { 'url': url,
          'hasCredentials': true,
          'credential': password,
          'username': username };
        }
        return iceServer;
      };

    createIceServers = function(urls, username, password) {  
      var iceServers = new Array();
      for (var i = 0; i < urls.length; ++i) {
        iceServers.push(createIceServer(urls[i], username, password));
      }
      return iceServers;
    }

    // The RTCSessionDescription object.
    RTCSessionDescription = function(info) {
      return plugin().ConstructSessionDescription(info.type, info.sdp);
    }

    // PEER CONNECTION
    RTCPeerConnection = function(servers, constraints) {
      var iceServers = null;
      if (servers) {
        iceServers = servers.iceServers;
        for (var i = 0; i < iceServers.length; i++) {
          if (iceServers[i].urls && !iceServers[i].url)
            iceServers[i].url = iceServers[i].urls;
          iceServers[i].hasCredentials = isDefined(iceServers[i].username) && isDefined(iceServers[i].credential);
        }
      }
      var mandatory = (constraints && constraints.mandatory) ? constraints.mandatory : null;
      var optional = (constraints && constraints.optional) ? constraints.optional : null;
      return plugin().PeerConnection(TemPageId, iceServers, mandatory, optional);
    }

    MediaStreamTrack = {};
    MediaStreamTrack.getSources = function(callback) {
      plugin().GetSources(callback);
    };

    getUserMedia = function(constraints, successCallback, failureCallback) {
      if (!constraints.audio)
        constraints.audio = false;

      plugin().getUserMedia(constraints, successCallback, failureCallback);
    };
    navigator.getUserMedia = getUserMedia;

    // Attach a media stream to an element.
    attachMediaStream = function(element, stream) {
      stream.enableSoundTracks(true);
      if (element.nodeName.toLowerCase() != "audio") {
        var elementId = element.id.length == 0 ? Math.random().toString(36).slice(2) : element.id;
        if (!element.isTemWebRTCPlugin || !element.isTemWebRTCPlugin()) {
          var frag = document.createDocumentFragment();
          var temp = document.createElement('div');
          var classHTML = element.className ? 'class="' + element.className + '" ' :  "";
          temp.innerHTML = '<object id="' + elementId + '" '
          + classHTML
          + 'type="application/x-temwebrtcplugin">'
          + '<param name="pluginId" value="' + elementId + '" /> '
          + '<param name="pageId" value="' + TemPageId + '" /> '
          + '<param name="streamId" value="' + stream.id + '" /> '
          + '</object>';
          while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
          }
          var rectObject = element.getBoundingClientRect();
          element.parentNode.insertBefore(frag, element);
          frag = document.getElementById(elementId);
          frag.width = rectObject.width + "px"; 
          frag.height = rectObject.height + "px";
          element.parentNode.removeChild(element);

        } else {
          var children = element.children;
          for (var i = 0; i != children.length; ++i) {
            if (children[i].name == "streamId") {
              children[i].value = stream.id;
              break;
            }
          }
          element.setStreamId(stream.id);
        }
        var newElement = document.getElementById(elementId)
        newElement.onclick = element.onclick ? element.onclick : function(arg) {};
        newElement._TemOnClick = function(id) {
          var arg = {srcElement: document.getElementById(id)};
          newElement.onclick(arg);
        }
        return newElement;
      } else { // is audio element
        // The sound was enabled, there is nothing to do here
        return element;
      }
    };

    reattachMediaStream = function(to, from) {
      var stream = null;
      var children = from.children;
      for (var i = 0; i != children.length; ++i) {
        if (children[i].name == "streamId") {
          stream = plugin().getStreamWithId(TemPageId, children[i].value);
          break;
        }
      }
      if (stream != null) 
        return attachMediaStream(to, stream);
      else
        alert("Could not find the stream associated with this element");
    };

    RTCIceCandidate = function(candidate) {
      if (!candidate.sdpMid)
        candidate.sdpMid = "";
      return plugin().ConstructIceCandidate(candidate.sdpMid, candidate.sdpMLineIndex, candidate.candidate);
    };
    // END OF WEBRTC INTERFACE 
  };

  function pluginNeededButNotInstalledCb() {
    // This function will be called if the plugin is needed 
    // (browser different from Chrome or Firefox), 
    // but the plugin is not installed
    // Override it according to your application logic.
    alert("Your browser is not webrtc ready and Temasys plugin is not installed");
  }
  // Try to detect the plugin and act accordingly
  isPluginInstalled("Tem", "TemWebRTCPlugin", defineWebRTCInterface, pluginNeededButNotInstalledCb);
} else {
  console.log("Browser does not appear to be WebRTC-capable");
}
/*
  Create DataChannel - Started during createOffer, answered in createAnswer
  - SCTP Supported Browsers (Older chromes won't work, it will fall back to RTP)
  ==Attributes===
  - pc [RTCPeerConnection]: The PeerConnection Object
  - selfId [String]: User's own id
  - peerId [String]: The Other peer's id
  - channel_name [String]: The Name of the Channel. If null, it would be generated
  - isOffer [Boolean]: If the channel is initiated by the user
  - dataChannel [RTCDataChannel]: The DataChannel object passed inside
  
  To create on the fly, simply call this method and provide a channel_name to create other channels.
*/
newRTCDataChannel = function (pc, selfId, peerId, channel_key, isOffer, dataChannel) {  
  try {
    var log_ch = "DC [" + channel_key + "][" + selfId + "]: ";
    var type = (isOffer)?"offer":"answer", channel_name;
    console.log(log_ch + "Initializing");
    if(!dataChannel) {
      // To prevent conflict, selfId_channel_name must be done
      channel_name = (!channel_key) ? peerId + "_" + type : selfId + "_" + channel_key;
      var options = {};
      // If not SCTP Supported, fallback to RTP DC
      if (!webrtcDetectedBrowser.isSCTPDCSupported) {
        options.reliable = false;
        console.warn(log_ch + "Does not support SCTP");
      }
      dataChannel = pc.createDataChannel(channel_name, options);
    } else {
      channel_name = dataChannel.label;
    }
    // For now, Mozilla supports Blob and Chrome supports ArrayBuffer
    if (webrtcDetectedBrowser.mozWebRTC) {
      console.log(log_ch + "Does support BinaryType Blob");
    } else {
      console.log(log_ch + "Does not support BinaryType Blob");
    }
    dataChannel._type = type;
    dataChannel._key = channel_key;
    dataChannel._offerer = (isOffer)?selfId:peerId;
    dataChannel._answerer = (isOffer)?peerId:selfId;
    dataChannel.onerror = function(err){ 
      console.error(log_ch + "Failed retrieveing dataChannel"); 
      console.exception(err);
    };
    dataChannel.onclose = function(){ 
      console.log(log_ch + "DataChannel closed."); 
    };
    dataChannel.onopen = function() {
      dataChannel.push = dataChannel.send;
      dataChannel.send = function(data) {
        console.log(log_ch + "DataChannel opened.");
        dataChannel.push(data);
      };
    };
    dataChannel.onmessage = function(event) {
      console.log("[" + channel_name + "][" + selfId + "]: DataChannel message received");
      console.info("====Data====");
      console.dir(event.data);
      //self._readFile(event.data);
    };
    console.log(log_ch + "created");
    // Push channel into RTCDataChannels
    RTCDataChannels.push(dataChannel);
    setTimeout(function () {
      console.log(log_ch + "Connection Status - " + dataChannel.readyStatus);
    }, 500);
  } catch (err) {
    console.error(log_ch + "Failed creating DataChannel. Reason:");
    console.exception(err);
    return;
  }
};