/* eslint-disable */
// Import webrtc-adapter and add extra methods
import AdapterJS from 'webrtc-adapter';

AdapterJS.options = AdapterJS.options || {};

// True is AdapterJS.onwebrtcready was already called, false otherwise
// Used to make sure AdapterJS.onwebrtcready is only called once
AdapterJS.onwebrtcreadyDone = false;

AdapterJS.WebRTCPlugin = {
  plugin: null,
};

AdapterJS._onwebrtcreadies = [];

AdapterJS.webRTCReady = function (baseCallback) {
  if (typeof baseCallback !== 'function') {
    throw new Error('Callback provided is not a function');
  }

  var callback = function () {
    // Make users having requirejs to use the webRTCReady function to define first
    // When you set a setTimeout(definePolyfill, 0), it overrides the WebRTC function
    // This is be more than 0s
    if (typeof window.require === 'function' &&
      typeof AdapterJS._defineMediaSourcePolyfill === 'function') {
      AdapterJS._defineMediaSourcePolyfill();
    }

    // All WebRTC interfaces are ready, just call the callback
    baseCallback(null !== AdapterJS.WebRTCPlugin.plugin);
  };


  if (true === AdapterJS.onwebrtcreadyDone) {
    callback();
  } else {
    // will be triggered automatically when your browser/plugin is ready.
    AdapterJS._onwebrtcreadies.push(callback);
  }
};

AdapterJS.maybeThroughWebRTCReady = function() {
  if (!AdapterJS.onwebrtcreadyDone) {
    AdapterJS.onwebrtcreadyDone = true;

    // If new interface for multiple callbacks used
    if (AdapterJS._onwebrtcreadies.length) {
      AdapterJS._onwebrtcreadies.forEach(function (callback) {
        if (typeof(callback) === 'function') {
          callback(AdapterJS.WebRTCPlugin.plugin !== null);
        }
      });
      // Else if no callbacks on new interface assuming user used old(deprecated) way to set callback through AdapterJS.onwebrtcready = ...
    } else if (typeof(AdapterJS.onwebrtcready) === 'function') {
      AdapterJS.onwebrtcready(AdapterJS.WebRTCPlugin.plugin !== null);
    }
  }
};

///////////////////////////////////////////////////////////////////
// ADAPTERJS BROWSER AND VERSION DETECTION
//
// Detected browser agent name. Types are:
// - 'firefox': Firefox browser.
// - 'chrome': Chrome browser.
// - 'opera': Opera browser.
// - 'safari': Safari browser.
// - 'IE' - Internet Explorer browser.
window.webrtcDetectedBrowser = null;

// Detected browser version.
window.webrtcDetectedVersion = null;

// The minimum browser version still supported by AJS.
window.webrtcMinimumVersion  = null;

// The type of DC supported by the browser
window.webrtcDetectedDCSupport = null;

// This function helps to retrieve the webrtc detected browser information.
// This sets:
// - webrtcDetectedBrowser: The browser agent name.
// - webrtcDetectedVersion: The browser version.
// - webrtcMinimumVersion: The minimum browser version still supported by AJS.
// - webrtcDetectedType: The types of webRTC support.
//   - 'moz': Mozilla implementation of webRTC.
//   - 'webkit': WebKit implementation of webRTC.
//   - 'plugin': Using the plugin implementation.
AdapterJS.parseWebrtcDetectedBrowser = function () {
  var hasMatch = null;

  // Detect React-Native
  // Placed before browsers to check - global navigator object is present when react-native debugger is on and takes browser agent of the debugger
  // React Native adapter adds navigator object
  if (window.navigator.userAgent.match(/React-Native/gi) || navigator.userAgent.match(/React-Native/gi)) {
    window.webrtcDetectedBrowser   = 'react-native';
    window.webrtcDetectedVersion   = "";
    window.webrtcMinimumVersion    = 0;
    window.webrtcDetectedType      = 'react-native';
    window.webrtcDetectedDCSupport = null;
    // Detect Opera (8.0+)
  } else if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
    hasMatch = navigator.userAgent.match(/OPR\/(\d+)/i) || [];

    window.webrtcDetectedBrowser   = 'opera';
    window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    window.webrtcMinimumVersion    = 26;
    window.webrtcDetectedType      = 'webkit';
    window.webrtcDetectedDCSupport = 'SCTP'; // Opera 20+ uses Chrome 33

    // Detect Bowser on iOS
  } else if (navigator.userAgent.match(/Bowser\/[0-9.]*/g)) {
    hasMatch = navigator.userAgent.match(/Bowser\/[0-9.]*/g) || [];

    var chromiumVersion = parseInt((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./i) || [])[2] || '0', 10);

    window.webrtcDetectedBrowser   = 'bowser';
    window.webrtcDetectedVersion   = parseFloat((hasMatch[0] || '0/0').split('/')[1], 10);
    window.webrtcMinimumVersion    = 0;
    window.webrtcDetectedType      = 'webkit';
    window.webrtcDetectedDCSupport = chromiumVersion > 30 ? 'SCTP' : 'RTP';


    // Detect Opera on iOS (does not support WebRTC yet)
  } else if (navigator.userAgent.indexOf('OPiOS') > 0) {
    hasMatch = navigator.userAgent.match(/OPiOS\/([0-9]+)\./);

    // Browser which do not support webrtc yet
    window.webrtcDetectedBrowser   = 'opera';
    window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    window.webrtcMinimumVersion    = 0;
    window.webrtcDetectedType      = null;
    window.webrtcDetectedDCSupport = null;

    // Detect Chrome on iOS (does not support WebRTC yet)
  } else if (navigator.userAgent.indexOf('CriOS') > 0) {
    hasMatch = navigator.userAgent.match(/CriOS\/([0-9]+)\./) || [];

    const iOSVersion = navigator.userAgent.match(/CPU(?> iPhone| iPad)? OS ([0-9]+)_([0-9]+)/g);
    // iOS Version 14 and above supports webrtc
    const isCompatible = iOSVersion[0].split(' ')[2].split('_')[0] > 13;
    if (isCompatible) {
      window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
      window.webrtcMinimumVersion    = 53;
      window.webrtcDetectedType      = 'AppleWebKit';
      window.webrtcDetectedBrowser   = 'chrome';
      window.webrtcDetectedDCSupport = null;
    } else {
      window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
      window.webrtcMinimumVersion    = 0;
      window.webrtcDetectedType      = null;
      window.webrtcDetectedBrowser   = 'chrome';
      window.webrtcDetectedDCSupport = null;
    }

    // Detect Firefox on iOS (does not support WebRTC yet)
  } else if (navigator.userAgent.indexOf('FxiOS') > 0) {
    hasMatch = navigator.userAgent.match(/FxiOS\/([0-9]+)\./) || [];

    // Browser which do not support webrtc yet
    window.webrtcDetectedBrowser   = 'firefox';
    window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    window.webrtcMinimumVersion    = 0;
    window.webrtcDetectedType      = null;
    window.webrtcDetectedDCSupport = null;

    // Detect IE (6-11)
  } else if (/*@cc_on!@*/false || !!document.documentMode) {
    hasMatch = /\brv[ :]+(\d+)/g.exec(navigator.userAgent) || [];

    window.webrtcDetectedBrowser   = 'IE';
    window.webrtcDetectedVersion   = parseInt(hasMatch[1], 10);
    window.webrtcMinimumVersion    = 9;
    window.webrtcDetectedType      = 'plugin';
    window.webrtcDetectedDCSupport = 'SCTP';

    if (!webrtcDetectedVersion) {
      hasMatch = /\bMSIE[ :]+(\d+)/g.exec(navigator.userAgent) || [];

      window.webrtcDetectedVersion = parseInt(hasMatch[1] || '0', 10);
    }

    // Detect Edge (20+)
  } else if (!!window.StyleMedia || navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
    hasMatch = navigator.userAgent.match(/Edge\/(\d+).(\d+)$/) || [];

    // Previous webrtc/adapter uses minimum version as 10547 but checking in the Edge release history,
    // It's close to 13.10547 and ObjectRTC API is fully supported in that version

    window.webrtcDetectedBrowser   = 'edge';
    window.webrtcDetectedVersion   = parseFloat((hasMatch[0] || '0/0').split('/')[1], 10);
    window.webrtcMinimumVersion    = 13.10547;
    window.webrtcDetectedType      = 'ms';
    window.webrtcDetectedDCSupport = null;

    // Detect Firefox (1.0+)
    // Placed before Safari check to ensure Firefox on Android is detected
  } else if (typeof InstallTrigger !== 'undefined' || navigator.userAgent.indexOf('irefox') > 0) {
    hasMatch = navigator.userAgent.match(/Firefox\/([0-9]+)\./) || [];

    window.webrtcDetectedBrowser   = 'firefox';
    window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    window.webrtcMinimumVersion    = 33;
    window.webrtcDetectedType      = 'moz';
    window.webrtcDetectedDCSupport = 'SCTP';

    // Detect Chrome (1+ and mobile)
    // Placed before Safari check to ensure Chrome on Android is detected
  } else if ((!!window.chrome && !!window.chrome.webstore) || navigator.userAgent.indexOf('Chrom') > 0) {
    hasMatch = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./i) || [];

    window.webrtcDetectedBrowser   = 'chrome';
    window.webrtcDetectedVersion   = parseInt(hasMatch[2] || '0', 10);
    window.webrtcMinimumVersion    = 38;
    window.webrtcDetectedType      = 'webkit';
    window.webrtcDetectedDCSupport = window.webrtcDetectedVersion > 30 ? 'SCTP' : 'RTP'; // Chrome 31+ supports SCTP without flags

    // Detect Safari
  } else if (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification) || navigator.userAgent.match(/AppleWebKit\/(\d+)\./) || navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
    hasMatch = navigator.userAgent.match(/version\/(\d+)\.(\d+)/i) || [];
    var AppleWebKitBuild = navigator.userAgent.match(/AppleWebKit\/(\d+)/i) || [];

    var isMobile      = navigator.userAgent.match(/(iPhone|iPad)/gi);
    var hasNativeImpl = AppleWebKitBuild.length >= 1 && AppleWebKitBuild[1] >= 604;
    window.webrtcDetectedBrowser   = 'safari';
    window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    window.webrtcMinimumVersion    = 7;
    if (isMobile) {
      window.webrtcDetectedType    = hasNativeImpl ? 'AppleWebKit' : null;
    } else { // desktop
      var majorVersion = window.webrtcDetectedVersion;
      var minorVersion = parseInt(hasMatch[2] || '0', 10);
      var nativeImplIsOverridable = majorVersion == 11 && minorVersion < 2;
      window.webrtcDetectedType    = hasNativeImpl && !(AdapterJS.options.forceSafariPlugin && nativeImplIsOverridable) ? 'AppleWebKit' : 'plugin';
    }
    window.webrtcDetectedDCSupport = 'SCTP';
  }

  // Scope it to AdapterJS and window for better consistency
  AdapterJS.webrtcDetectedBrowser   = window.webrtcDetectedBrowser;
  AdapterJS.webrtcDetectedVersion   = window.webrtcDetectedVersion;
  AdapterJS.webrtcMinimumVersion    = window.webrtcMinimumVersion;
  AdapterJS.webrtcDetectedType      = window.webrtcDetectedType;
  AdapterJS.webrtcDetectedDCSupport = window.webrtcDetectedDCSupport;
};

// END OF ADAPTERJS BROWSER AND VERSION DETECTION
///////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
// EXTENSION FOR CHROME, FIREFOX AND EDGE
// Includes additional shims
// -- attachMediaStream
// -- reattachMediaStream
// -- a call to AdapterJS.maybeThroughWebRTCReady (notifies WebRTC is ready)
AdapterJS.addExtensions = function() {
  var attachMediaStream = null;
  var reattachMediaStream = null;
// Add support for legacy functions
  if ( navigator.mozGetUserMedia ) {
    // Attach a media stream to an element.
    attachMediaStream = function(element, stream) {
      element.srcObject = stream;
      return element;
    };

    reattachMediaStream = function(to, from) {
      to.srcObject = from.srcObject;
      return to;
    };
  } else if ( navigator.webkitGetUserMedia ) {
    // Attach a media stream to an element.
    attachMediaStream = function(element, stream) {
      if (AdapterJS.webrtcDetectedVersion >= 43) {
        element.srcObject = stream;
      } else if (typeof element.src !== 'undefined') {
        element.src = URL.createObjectURL(stream);
      } else {
        console.error('Error attaching stream to element.');
      }
      return element;
    };

    reattachMediaStream = function(to, from) {
      if (AdapterJS.webrtcDetectedVersion >= 43) {
        to.srcObject = from.srcObject;
      } else {
        to.src = from.src;
      }
      return to;
    };

  } else if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
    if (AdapterJS.webrtcDetectedBrowser === 'chrome') {
      attachMediaStream = function(element, stream) {
        if (AdapterJS.webrtcDetectedVersion >= 43) {
          element.srcObject = stream;
        } else {
          console.error('Error attaching stream to element.');
        }
        return element;
      };
    } else {
      attachMediaStream = function(element, stream) {
        element.srcObject = stream;
        return element;
      };
      reattachMediaStream = function(to, from) {
        to.srcObject = from.srcObject;
        return to;
      };
    }
  }

// Propagate attachMediaStream and gUM in window and AdapterJS
  window.attachMediaStream      = attachMediaStream;
  window.reattachMediaStream    = reattachMediaStream;
  AdapterJS.attachMediaStream   = attachMediaStream;
  AdapterJS.reattachMediaStream = reattachMediaStream;
};

// END OF EXTENSION OF CHROME, FIREFOX AND EDGE
///////////////////////////////////////////////////////////////////

// Init browser detection
AdapterJS.parseWebrtcDetectedBrowser();
// Add extensions
AdapterJS.addExtensions();
// Signal AdapterJS loaded
AdapterJS.maybeThroughWebRTCReady();

export default AdapterJS;
