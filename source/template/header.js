(function() {

'use strict';

/* IE < 10 Polyfills */
// Mozilla provided polyfill for Object.keys()
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

// Mozilla provided polyfill for Date.getISOString()
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

// addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
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
 * <h2>Before using Skylink</h2>
 * Please invoke {{#crossLink "Skylink/init:method"}}init(){{/crossLink}} method
 * first to initialise the Application Key before using any functionalities in Skylink.
 * If you do not have an Application Key, you may
 * [register for a Skylink platform developer account](http://developer.temasys.com.sg).<br>
 *
 * To get started you may [visit the getting started page](https://temasys.github.io/how-to/2014/08/08/
 * Getting_started_with_WebRTC_and_SkylinkJS/), or alternatively fork a ready made demo application
 * that uses Skylink Web SDK at [getaroom.io](http://getaroom.io/).
 *
 * <b>Tips on using Skylink</b>:
 * - Subscribe Skylink events before calling
 *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}.
 * - For debugging purposes, please using the non-minified versions of the script and add
 *   {{#crossLink "Skylink/setLogLevel:method"}}setLogLevel(){{/crossLink}} method before
 *   calling {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}. This will enable you
 *   to see all the logs in the Web console for Skylink. For more extensive debugging mode,
 *   you may use the method
 *   {{#crossLink "Skylink/setDebugMode:method"}}setDebugMode(){{/crossLink}}. This has to
 *   be called before {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}.
 * - Never call methods in state event subscriptions in <i>E.g.
 *   {{#crossLink "Skylink/readyStateChange:event"}}readyStateChange{{/crossLink}},
 *   {{#crossLink "Skylink/iceConnectionState:event"}}iceConnectionState{{/crossLink}} etc.</i>
 *   as they may result in an inifinite loop.
 * - If you are experiencing issues with encoding, make sure that the script tag contains
 *   the <code>charset="UTF8"</code> attribute.
 * - If you are getting any <code>401</code> or <code>402</code> errors, please make sure
 *   that your Application Key CORS is configured with the correct accessing domain.
 * - It's recommended to do try / catches in your event subscription handlers along with
 *   proper checks as expection errors in event handlers are a cause of errors in application.
 * @class Skylink
 * @constructor
 * @example
 *   // Here's a simple example on how you can start using Skylink
 *   var sw = new Skylink();
 *
 *   // Subscribe all events first before init()
 *   sw.on("incomingStream", function (peerId, stream, peerInfo, isSelf) {
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
 *   sw.on("peerLeft", function (peerId, peerInfo, isSelf) {
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
 *  // never call joinRoom in readyStateChange event subscription.
 *  // call joinRoom after init() callback if you want to joinRoom instantly.
 *  sw.on("readyStateChange", function (state, room) {
 *    console.log("Room (" + room + ") state: ", room);
 *  })
 *
 *  // always remember to call init()
 *  sw.init("YOUR_APP_KEY_HERE", function (error, success) {
 *    // do a check for error or success
 *    if (error) {
 *      console.error("Init failed: ", error);
 *    } else {
 *      SkylinkDemo.joinRoom("my_room", {
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

  /**
   * The current version of Skylink Web SDK.
   * @attribute VERSION
   * @type String
   * @readOnly
   * @for Skylink
   * @since 0.1.0
   */
  this.VERSION = '@@version';

  /**
   * Helper function that generates an Unique ID (UUID) string.
   * @method generateUUID
   * @return {String} Generated Unique ID (UUID) string.
   * @example
   *    // Get Unique ID (UUID)
   *    var uuid = SkylinkDemo.generateUUID();
   * @for Skylink
   * @since 0.5.9
   */
  this.generateUUID = function() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
  };
}
this.Skylink = Skylink;
