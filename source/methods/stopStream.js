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