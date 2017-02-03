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
 * Function that stops <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.
 * @method stopScreen
 * @example
 *   function stopScreen () {
 *     skylinkDemo.stopScreen();
 *   }
 *
 *   skylinkDemo.shareScreen();
 * @trigger <ol class="desc-seq">
 *   <li>Checks if there is <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>. <ol>
 *   <li>If there is <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>: <ol>
 *   <li>Stop <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> Stream. <ol>
 *   <li><a href="#event_mediaAccessStopped"><code>mediaAccessStopped</code> event</a>
 *   triggers parameter payload <code>isScreensharing</code> value as <code>true</code> and
 *   <code>isAudioFallback</code> value as <code>false</code>.</li><li>If User is in Room: <ol>
 *   <li><a href="#event_streamEnded"><code>streamEnded</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>isScreensharing</code> value as <code>true</code>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   </ol></li></ol></li><li>If User is in Room: <small><b>SKIP</b> this step if <code>stopScreen()</code>
 *   was invoked from <a href="#method_shareScreen"><code>shareScreen()</code> method</a>.</small> <ol>
 *   <li>If there is <a href="#method_getUserMedia"> <code>getUserMedia()</code>Stream</a> Stream: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>stream</code> as
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li></ol></li>
 *   <li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>.</li>
 *   </ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype.stopScreen = function () {
  if (this._streams.screenshare) {
    this._stopStreams({
      screenshare: true
    });

    if (this._inRoom) {
      if (this._streams.userMedia && this._streams.userMedia.stream) {
        this._trigger('incomingStream', this._user.sid, this._streams.userMedia.stream, true, this.getPeerInfo(),
          false, this._streams.userMedia.stream.id || this._streams.userMedia.stream.label);
        this._trigger('peerUpdated', this._user.sid, this.getPeerInfo(), true);
      }
      this._refreshPeerConnection(Object.keys(this._peerConnections), false);
    }
  }
};