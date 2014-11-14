/**
 * @class Skylink
 */
(function() {
/**
 * Please refer to the {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
 * method for a guide to initializing Skylink.<br>
 * Please Note:
 * - You must subscribe Skylink events before calling
 *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}.
 * - You will need an API key to use Skylink, if you do not have one you can
 *   [register for a developer account](http://
 *   developer.temasys.com.sg) in the Skylink Developer Console.
 * @class Skylink
 * @constructor
 * @example
 *   // Getting started on how to use Skylink
 *   var SkylinkDemo = new Skylink();
 *   SkylinkDemo.init('apiKey');
 *
 *   SkylinkDemo.joinRoom('my_room', {
 *     userData: 'My Username',
 *     audio: true,
 *     video: true
 *   });
 *
 *   SkylinkDemo.on('incomingStream', function (stream, peerId, peerInfo, isSelf) {
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
}
this.Skylink = Skylink;
