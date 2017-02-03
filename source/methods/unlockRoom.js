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
 * Function that unlocks the current Room when in session to allow other Peers to join the Room.
 * @method unlockRoom
 * @trigger <ol class="desc-seq">
 *   <li>Requests to Signaling server to unlock Room <ol>
 *   <li><a href="#event_roomLock"><code>roomLock</code> event</a> triggers parameter payload
 *   <code>isLocked</code> value as <code>false</code>.</li></ol></li></ol>
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.unlockRoom = function() {
  if (!(this._user && this._user.sid)) {
    return;
  }
  this._log.log('Update to isRoomLocked status ->', false);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: false
  });
  this._roomLocked = false;
  this._trigger('roomLock', false, this._user.sid, this.getPeerInfo(), true);
};