/**
 * @class Skylink
 */
(function() {

'use strict';

/**
 * Please refer to the {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
 * method for a guide to initializing Skylink.<br>
 * Please Note:
 * - You must subscribe Skylink events before calling
 *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}.
 * - You will need an Application key to use Skylink, if you do not have one you can
 *   [register for a developer account](http://
 *   developer.temasys.com.sg) in the Skylink Developer Console.
 * @class Skylink
 * @constructor
 * @example
 *   // Getting started on how to use Skylink
 *   var SkylinkDemo = new Skylink();
 *   SkylinkDemo.init('appKey', function () {
 *     SkylinkDemo.joinRoom('my_room', {
 *       userData: 'My Username',
 *       audio: true,
 *       video: true
 *     });
 *   });
 *
 *   SkylinkDemo.on('incomingStream', function (peerId, stream, peerInfo, isSelf) {
 *     if (isSelf) {
 *       attachMediaStream(document.getElementById('selfVideo'), stream);
 *     } else {
 *       var peerVideo = document.createElement('video');
 *       peerVideo.id = peerId;
 *       peerVideo.autoplay = 'autoplay';
 *       document.getElementById('peersVideo').appendChild(peerVideo);
 *       attachMediaStream(peerVideo, stream);
 *     }
 *   });
 *
 *   SkylinkDemo.on('peerLeft', function (peerId, peerInfo, isSelf) {
 *     if (isSelf) {
 *       document.getElementById('selfVideo').src = '';
 *     } else {
 *       var peerVideo = document.getElementById(peerId);
 *       document.getElementById('peersVideo').removeChild(peerVideo);
 *     }
 *   });
 * @for Skylink
 * @since 0.5.0
 */
function Skylink() {
  if (!(this instanceof Skylink)) {
    return new Skylink();
  }

  /**
   * Version of Skylink
   * @attribute VERSION
   * @type String
   * @readOnly
   * @for Skylink
   * @since 0.1.0
   */
  this.VERSION = '@@version';

  /**
   * Helper function to generate unique IDs for your application.
   * @method generateUUID
   * @return {String} The unique Id.
   * @for Skylink
   * @since 0.5.9
   */
  this.generateUUID  = function () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0; d = Math.floor(d/16); return (c=='x' ? r : (r&0x7|0x8)).toString(16); }
    );
    return uuid;
  };
}
this.Skylink = Skylink;
