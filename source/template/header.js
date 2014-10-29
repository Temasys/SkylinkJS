/**
 * @class Skylink
 */
(function() {
/**
 * Please check on the {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
 * function on how you can initialize Skylink. Note that:
 * - You will have to subscribe all Skylink events first before calling
 *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}.
 * - If you need an api key, please [register an api key](http://
 *   developer.temasys.com.sg) at our developer console.
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
 *   SkylinkDemo.on('incomingStream', function (peerId, stream, isSelf) {
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
   * @since 0.1.0
   */
  this.VERSION = '@@version';
}
this.Skylink = Skylink;
